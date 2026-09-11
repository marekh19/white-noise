import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

test("serves cached audio byte ranges while offline", async () => {
  const listeners = new Map();
  const audio = await readFile(
    new URL("../public/audio/white-noise-24h.mp3", import.meta.url),
  );
  let matchedUrl;
  const context = {
    Request,
    ReadableStream,
    Response,
    URL,
    fetch: () => Promise.reject(new Error("offline")),
    caches: {
      match: (url) => {
        matchedUrl = url;
        return Promise.resolve(
          new Response(audio, { headers: { "Content-Type": "audio/mpeg" } }),
        );
      },
    },
    self: {
      location: { origin: "https://example.com" },
      addEventListener: (name, handler) => listeners.set(name, handler),
      skipWaiting: () => undefined,
      clients: { claim: () => Promise.resolve() },
    },
  };
  const source = await readFile(
    new URL("../public/sw.js", import.meta.url),
    "utf8",
  );
  vm.runInNewContext(source, context);

  /** @type {Promise<Response> | undefined} */
  let responsePromise;
  listeners.get("fetch")({
    request: new Request("https://example.com/audio/white-noise-24h.mp3", {
      headers: { Range: `bytes=${audio.length - 2}-${audio.length + 3}` },
    }),
    respondWith: (promise) => {
      responsePromise = promise;
    },
  });

  assert.ok(responsePromise);
  const response = await responsePromise;
  assert.equal(matchedUrl, "/audio/white-noise-24h.mp3");
  assert.equal(response.status, 206);
  const contentRange = response.headers.get("Content-Range");
  const totalLength = Number(contentRange?.split("/")[1]);
  assert.equal(
    contentRange,
    `bytes ${audio.length - 2}-${audio.length + 3}/${totalLength}`,
  );
  assert.equal(response.headers.get("Content-Type"), "audio/mpeg");
  assert.ok((totalLength * 8) / 64_000 >= 24 * 60 * 60);
  assert.deepEqual(
    new Uint8Array(await response.arrayBuffer()),
    Uint8Array.from([...audio.subarray(-2), ...audio.subarray(0, 4)]),
  );
});
