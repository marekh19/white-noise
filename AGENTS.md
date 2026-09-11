# Product

Read [docs/BRIEF.md](docs/BRIEF.md) before changing product behavior, UX, architecture, audio, offline support, PWA behavior, SEO, or content. Treat its decisions as constraints unless the task explicitly changes them.

# Architecture

- Keep the MVP single-page, static-first, and progressively enhanced.
- Use Astro, TypeScript, native browser APIs, and scoped Astro CSS. Add no UI framework, backend, client-side router, or Tailwind.
- Ship JavaScript only for interaction. The complete page structure and content must render without it.
- Prefer native platform features and add a dependency only when it removes substantial complexity.

# Product priorities

- Keep the audio player dominant, immediate, and usable one-handed in low light.
- Treat mobile Safari, accessibility, offline playback after the first visit, and a small payload as core requirements.
- Use `HTMLAudioElement` for looping audio. Treat Media Session and PWA installation as progressive enhancements.
- Precache the application shell and audio asset explicitly; verify offline playback when changing either.

# Verification

Run the smallest relevant checks and `pnpm build` before completing a change. Test background and lock-screen playback on a real iOS device when audio behavior changes.
