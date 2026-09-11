import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ships a compact, independently decodable MP3 loop", async () => {
  const audio = await readFile(
    new URL("../public/audio/white-noise-24h.mp3", import.meta.url),
  );

  assert.ok(audio.byteLength < 500 * 1024);
  assert.equal(audio.byteLength % 288, 0);
  for (let offset = 0; offset < audio.byteLength; offset += 288) {
    assert.equal(audio[offset], 0xff);
    assert.equal(audio[offset + 1] & 0xe0, 0xe0);
  }
});
