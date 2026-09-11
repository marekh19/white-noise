import assert from "node:assert/strict";
import test from "node:test";

class FakeHTMLElement {
  attributes = new Map();
  listeners = new Map();
  textContent = "";

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  dispatch(name) {
    this.listeners.get(name)?.();
  }
}

class FakeHTMLButtonElement extends FakeHTMLElement {
  disabled = false;
}

class FakeHTMLAudioElement extends FakeHTMLElement {
  controls = true;
  paused = true;
  rejectPlayback = false;

  play() {
    if (this.rejectPlayback) return Promise.reject(new Error("blocked"));
    this.paused = false;
    this.dispatch("playing");
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatch("pause");
  }
}

test("updates the player through playback, pause, and failure", async () => {
  const audio = new FakeHTMLAudioElement();
  const button = new FakeHTMLButtonElement();
  const label = new FakeHTMLElement();
  const status = new FakeHTMLElement();
  const player = new FakeHTMLElement();
  const elements = new Map([
    ["audio", audio],
    ["button[data-audio-toggle]", button],
    ["[data-audio-label]", label],
    ["[data-audio-status]", status],
  ]);
  player.querySelector = (selector) => elements.get(selector);

  globalThis.HTMLElement = FakeHTMLElement;
  globalThis.HTMLButtonElement = FakeHTMLButtonElement;
  globalThis.HTMLAudioElement = FakeHTMLAudioElement;
  globalThis.document = {
    querySelectorAll: () => [player],
  };

  await import("../src/scripts/audio-player.ts");

  assert.equal(audio.controls, false);
  assert.equal(player.attributes.get("data-enhanced"), "true");

  button.dispatch("click");
  await Promise.resolve();
  assert.equal(player.attributes.get("data-playing"), "true");
  assert.equal(button.attributes.get("aria-pressed"), "true");
  assert.equal(label.textContent, "Pause white noise");
  assert.equal(status.textContent, "Playing continuously");

  button.dispatch("click");
  assert.equal(player.attributes.get("data-playing"), "false");
  assert.equal(label.textContent, "Play white noise");
  assert.equal(status.textContent, "Paused");

  audio.rejectPlayback = true;
  button.dispatch("click");
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(button.disabled, false);
  assert.equal(
    status.textContent,
    "Playback could not start. Tap to try again.",
  );

  audio.dispatch("error");
  assert.equal(
    status.textContent,
    "Audio is unavailable. Check your connection and try again.",
  );
});
