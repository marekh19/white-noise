import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

test("serves cached audio byte ranges while offline", async () => {
  const listeners = new Map();
  const audio = Uint8Array.from([0, 1, 2, 3]);
  let matchedUrl;
  const context = {
    Request,
    Response,
    URL,
    fetch: () => Promise.reject(new Error("offline")),
    caches: {
      match: (url) => {
        matchedUrl = url;
        return Promise.resolve(
          new Response(audio, { headers: { "Content-Type": "audio/webm" } }),
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
    request: new Request("https://example.com/audio/white-noise-10h.webm", {
      headers: { Range: "bytes=1-2" },
    }),
    respondWith: (promise) => {
      responsePromise = promise;
    },
  });

  assert.ok(responsePromise);
  const response = await responsePromise;
  assert.equal(matchedUrl, "/audio/white-noise-10h.webm");
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("Content-Range"), "bytes 1-2/4");
  assert.equal(response.headers.get("Content-Type"), "audio/webm");
  assert.deepEqual(
    new Uint8Array(await response.arrayBuffer()),
    Uint8Array.from([1, 2]),
  );
});
