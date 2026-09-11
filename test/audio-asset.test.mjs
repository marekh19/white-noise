import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships at least ten hours of continuous audio", async () => {
  const audio = await readFile(
    new URL("../public/audio/white-noise-10h.webm", import.meta.url),
  );
  const durationMarker = Buffer.from([0x44, 0x89, 0x88]);
  const durationOffset = audio.indexOf(durationMarker) + durationMarker.length;

  assert.ok(durationOffset >= durationMarker.length);
  assert.ok(audio.readDoubleBE(durationOffset) / 1000 >= 10 * 60 * 60);
  assert.ok(audio.byteLength <= 25 * 1024 * 1024);
});
