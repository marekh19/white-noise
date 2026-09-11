// Bump this when a precached file changes so existing visitors receive the update.
const CACHE_PREFIX = "baby-sleep-";
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const AUDIO_URL = "/audio/white-noise-10h.mp3";
// Repeating complete MP3 frames keeps one native media timeline without loop gaps.
const AUDIO_REPEAT_COUNT = 1232;
const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/favicon.ico",
  "/og-image.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  AUDIO_URL,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter(
              (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
            )
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const repeatedStream = (source, start, end) => {
  let offset = start;

  return new ReadableStream({
    pull(controller) {
      if (offset > end) {
        controller.close();
        return;
      }

      const chunk = new Uint8Array(Math.min(64 * 1024, end - offset + 1));
      for (let written = 0; written < chunk.length;) {
        const sourceOffset = offset % source.length;
        const copyLength = Math.min(
          source.length - sourceOffset,
          chunk.length - written,
        );
        chunk.set(
          source.subarray(sourceOffset, sourceOffset + copyLength),
          written,
        );
        offset += copyLength;
        written += copyLength;
      }
      controller.enqueue(chunk);
    },
  });
};

const continuousAudioResponse = async (request) => {
  const response = await caches.match(AUDIO_URL);
  if (!response) return fetch(request);

  const source = new Uint8Array(await response.arrayBuffer());
  const totalLength = source.length * AUDIO_REPEAT_COUNT;
  const range = request.headers.get("range");
  const match = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : undefined;
  if (range && (!match || (!match[1] && !match[2]))) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${totalLength}` },
    });
  }

  const suffixLength = match && !match[1] ? Number(match[2]) : undefined;
  if (suffixLength === 0) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${totalLength}` },
    });
  }

  const start =
    suffixLength !== undefined
      ? Math.max(totalLength - suffixLength, 0)
      : Number(match?.[1] || 0);
  const end = Math.min(
    match?.[2] && match[1] ? Number(match[2]) : totalLength - 1,
    totalLength - 1,
  );
  if (start > end || start >= totalLength) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${totalLength}` },
    });
  }

  const headers = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
    "Content-Length": String(end - start + 1),
    "Content-Type": "audio/mpeg",
  };
  if (range) headers["Content-Range"] = `bytes ${start}-${end}/${totalLength}`;

  return new Response(repeatedStream(source, start, end), {
    status: range ? 206 : 200,
    headers,
  });
};

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname === AUDIO_URL) {
    event.respondWith(continuousAudioResponse(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
