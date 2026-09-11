# Baby Sleep White Noise

A static-first white-noise PWA built with Astro and native browser APIs.

```sh
pnpm install
pnpm dev
```

Set `PUBLIC_SITE_URL` to the production origin before building so canonical and social metadata use absolute URLs.

```sh
PUBLIC_SITE_URL=https://example.com pnpm build
pnpm check
```

Pushes to `main` are deployed to `sleep.marek.work` with Cloudflare Workers. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets before the first deployment.

Before release, load the deployed site once in Safari on a real iPhone, switch to airplane mode, reload, start playback, and verify that it continues after locking the screen.
