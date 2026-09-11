const players = document.querySelectorAll("[data-audio-player]");

for (const player of players) {
  const audio = player.querySelector("audio");
  const button = player.querySelector("button[data-audio-toggle]");
  const label = player.querySelector("[data-audio-label]");
  const status = player.querySelector("[data-audio-status]");

  if (
    !(audio instanceof HTMLAudioElement) ||
    !(button instanceof HTMLButtonElement)
  )
    continue;
  if (!(label instanceof HTMLElement) || !(status instanceof HTMLElement))
    continue;

  audio.controls = false;
  player.setAttribute("data-enhanced", "true");

  const continuousAudioReady =
    !("serviceWorker" in navigator) || navigator.serviceWorker.controller
      ? Promise.resolve()
      : Promise.race([
          new Promise<void>((resolve) =>
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => resolve(),
              { once: true },
            ),
          ),
          new Promise<void>((resolve) => setTimeout(resolve, 3000)),
        ]).then(() => {
          if (navigator.serviceWorker.controller) audio.load();
        });

  const setPlaying = (isPlaying: boolean) => {
    player.setAttribute("data-playing", String(isPlaying));
    button.setAttribute("aria-pressed", String(isPlaying));
    label.textContent = isPlaying ? "Pause white noise" : "Play white noise";
    status.textContent = isPlaying ? "Playing continuously" : "Paused";
    button.disabled = false;
  };

  const play = async () => {
    button.disabled = true;
    status.textContent = "Starting…";
    try {
      await continuousAudioReady;
      await audio.play();
    } catch {
      button.disabled = false;
      status.textContent = "Playback could not start. Tap to try again.";
    }
  };

  const pause = () => audio.pause();

  button.addEventListener("click", () => {
    if (audio.paused) void play();
    else pause();
  });

  audio.addEventListener("playing", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("error", () => {
    button.disabled = false;
    status.textContent =
      "Audio is unavailable. Check your connection and try again.";
  });

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "White Noise",
      artist: "Baby Sleep White Noise",
      album: "Sleep sounds",
      artwork: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    });
    navigator.mediaSession.setActionHandler("play", () => void play());
    navigator.mediaSession.setActionHandler("pause", pause);
  }
}
