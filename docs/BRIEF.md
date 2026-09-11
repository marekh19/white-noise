# White Noise PWA — Product & Technical Decisions

## 1. Product Summary

A minimal white-noise web application designed primarily for parents of babies and young children.

The product should do one thing exceptionally well:

> Let a user start continuous white-noise playback quickly, reliably, and without unnecessary friction.

The application should feel calm, trustworthy, fast, and intentionally simple.

The MVP is a single-page website with a small amount of informational content and one interactive audio player.

## 2. Primary Product Goals

The MVP should:

* Play continuous white noise.
* Continue playing when the device screen is locked, where supported by the browser.
* Work offline after the first successful visit.
* Load extremely quickly.
* Have a very small JavaScript footprint.
* Be usable without installing an application.
* Work particularly well in normal mobile Safari on iOS.
* Support installation as a PWA where useful.
* Be SEO-friendly.
* Have a polished, calming visual design aimed at parents of babies.
* Avoid unnecessary application complexity.

The product should feel closer to a tiny native utility than to a traditional content-heavy website.

## 3. Non-Goals for MVP

The MVP will not include:

* User accounts.
* Authentication.
* Backend services.
* Analytics-heavy personalization.
* Multiple sound libraries.
* Sound mixing.
* Saved presets.
* Cloud synchronization.
* Sleep tracking.
* Payments or subscriptions.
* Native iOS or Android applications.
* Complex application state.
* Client-side routing.
* A JavaScript UI framework.

These may be reconsidered later if actual product requirements justify them.

## 4. MVP User Experience

The main interaction should be immediately understandable.

A typical flow:

1. User opens the page.
2. The main white-noise player is visible immediately.
3. User presses **Play**.
4. White noise begins playing.
5. Playback continues until the user pauses or stops it.
6. The user can lock the phone or switch applications while playback continues where supported.
7. On later visits, the application can work without a network connection.

The page should not require onboarding, registration, configuration, or installation.

## 5. Page Structure

The website will contain one main page.

Suggested structure:

* Header / minimal branding.
* Hero section.
* Primary white-noise player.
* Very short explanation of what the tool does.
* A small section describing why parents use white noise.
* Basic usage guidance.
* FAQ.
* Footer.
* Privacy / legal links if required.

The interactive player remains the dominant element.

Content exists primarily to:

* explain the product,
* establish trust,
* provide useful context,
* improve search-engine discoverability.

The page must not become visually or structurally dominated by SEO content.

## 6. Audience and Visual Direction

Primary audience:

Parents and caregivers of babies and young children.

The design should communicate:

* calm,
* safety,
* softness,
* simplicity,
* nighttime comfort,
* trustworthiness.

The interface should avoid the visual language of productivity software, technical tools, or aggressively commercial mobile applications.

Possible visual characteristics:

* generous spacing,
* soft typography,
* restrained palette,
* subtle rounded shapes,
* low visual noise,
* excellent mobile layout,
* strong contrast where required for accessibility,
* subtle animation only when it improves feedback.

The player should remain obvious and easy to operate in low-light conditions or while holding a child.

## 7. Core Technical Architecture

The application will use:

**Astro + TypeScript + native browser APIs + scoped Astro CSS.**

No frontend UI framework will be used for the MVP.

The application will be generated primarily as static HTML.

Astro is responsible for:

* page structure,
* static rendering,
* reusable layout components,
* SEO metadata,
* content sections,
* scoped CSS,
* build-time output.

JavaScript will be used only where interactivity is required.

The main interactive feature is the white-noise audio player.

## 8. Why Astro

Astro matches the shape of the product very closely.

The application is approximately:

* 80% static content and layout,
* 20% interactive behavior.

Astro allows almost the entire page to be rendered as static HTML while JavaScript is added only where needed.

This provides:

* minimal JavaScript shipped to the browser,
* excellent first-load performance,
* simple SEO,
* straightforward componentization,
* easy static hosting,
* no unnecessary client-side application runtime.

Astro also leaves room to introduce an interactive framework island later if the player becomes significantly more complex.

That migration would not require rewriting the surrounding site.

## 9. Why Not SvelteKit

SvelteKit would provide capabilities that the MVP does not currently need, including:

* application-oriented routing,
* server-side application primitives,
* loaders and server/client data flows,
* application lifecycle abstractions,
* a larger framework surface area.

The product does not currently justify this complexity.

SvelteKit should only be reconsidered if the project evolves into a significantly more dynamic application with server-backed functionality.

## 10. Why Not a Full Svelte Application

Svelte would be lightweight and technically suitable, but the current interactive state is too small to justify a UI framework.

For the MVP, the interactive model is effectively:

```ts
type PlaybackState = 'playing' | 'paused'
```

A framework would solve a problem that currently does not exist.

Native browser APIs and small TypeScript modules are sufficient.

## 11. Why Not Vanilla Vite

A plain Vite + TypeScript application would also be viable.

However, Astro offers a better structure for:

* SEO content,
* reusable static components,
* layouts,
* future informational pages,
* metadata,
* content expansion.

It provides these benefits while still allowing the interactive portion of the site to remain essentially vanilla TypeScript.

Astro therefore offers a better balance between simplicity and maintainability.

## 12. Progressive Enhancement

Progressive enhancement is a core architectural principle.

The initial page should be useful and visually complete before JavaScript executes.

Astro will render the player markup directly into the HTML.

For example:

```html
<button data-audio-toggle>
  Play white noise
</button>
```

JavaScript then enhances that markup with playback functionality.

JavaScript should not be responsible for rendering the entire application shell.

This provides several benefits:

* extremely fast first render,
* stable page layout,
* good SEO,
* resilience to JavaScript failures,
* simpler architecture,
* minimal runtime work,
* clean separation between document structure and behavior.

The page without JavaScript should still display:

* branding,
* player UI,
* content,
* explanations,
* FAQ,
* navigation.

The audio controls themselves may require JavaScript for full functionality, but the page must never depend on JavaScript to render correctly.

## 13. Styling

The application will use standard CSS scoped inside Astro components.

Tailwind CSS will not be used.

Reasons:

* the site is small,
* the design system is limited,
* component-scoped CSS is easy to maintain,
* Astro provides natural style encapsulation,
* there is no need to introduce another build-time abstraction for styling.

Global CSS should remain small and contain only true site-wide concerns such as:

* CSS custom properties,
* resets,
* typography defaults,
* page background,
* shared spacing or color tokens.

Component-specific styles should live alongside their Astro components.

Example:

```astro
<button class="player">
  Play
</button>

<style>
  .player {
    border-radius: 999px;
    padding: 1rem 2rem;
  }
</style>
```

## 14. Audio Playback Strategy

White noise will be treated as regular media rather than generated continuously using Web Audio.

The application will use an `HTMLAudioElement`.

Example concept:

```ts
const audio = new Audio('/audio/white-noise.m4a')

audio.loop = true
audio.preload = 'auto'
```

This is an intentional architectural decision.

Using a normal media element gives browsers the clearest possible indication that the page is performing media playback.

This improves compatibility with:

* background playback,
* locked-screen playback,
* media controls,
* mobile browser lifecycle behavior.

Continuous noise generation using `AudioContext` is intentionally avoided for the MVP because background execution of arbitrary JavaScript is less reliable on mobile browsers.

## 15. Audio Asset

The app will ship with a pre-generated white-noise audio file.

Preferred characteristics:

* seamless loop,
* compressed format suitable for mobile browsers,
* no audible loop boundary,
* reasonably short duration,
* small file size.

A loop of roughly 10–60 seconds is sufficient for white noise because there is no meaningful repeating musical structure.

The exact format should be selected based on browser compatibility and file-size testing.

Potential format:

```text
/audio/white-noise.m4a
```

## 16. Playback Controls

MVP controls:

* Play
* Pause or Stop

The exact UX may use a single toggle button rather than separate controls.

Example states:

```text
▶ Play white noise
```

and:

```text
Ⅱ Pause
```

or:

```text
■ Stop
```

The final wording should favor clarity for non-technical users.

Playback should only begin as the direct result of a user interaction in order to comply with browser autoplay restrictions.

## 17. Media Session API

Where available, the application should use the Media Session API.

This can improve operating-system integration such as:

* lock-screen media controls,
* notification-area controls,
* media metadata,
* hardware media buttons.

Example metadata might include:

```text
White Noise
Sleep sounds
```

Media Session support should be treated as progressive enhancement.

The core player must continue functioning if the API is unavailable.

## 18. iOS Strategy

iOS Safari is a key target.

The preferred usage model on iPhone is initially:

**normal Safari browser usage rather than relying exclusively on standalone PWA mode.**

This is intentional.

Safari can:

* register service workers,
* use Cache Storage,
* provide offline-capable web applications,
* play regular media,
* continue media playback in the background where supported.

Installation to the home screen is not required for these capabilities.

The application may still expose a valid web app manifest and support installation.

However, the product must not depend on standalone PWA mode for core functionality.

Background audio behavior should be tested on real iOS devices early in development.

## 19. Offline Support

Offline capability is a hard product requirement.

The application will use a service worker.

After a successful initial visit, the following resources should be available from cache:

* HTML,
* CSS,
* JavaScript,
* icons,
* manifest,
* white-noise audio asset.

The app should therefore remain usable when:

* the user has no signal,
* the user is in airplane mode,
* the network is temporarily unavailable.

The service worker should remain simple.

There is no requirement for:

* background sync,
* push notifications,
* complex runtime caching,
* network mutations.

## 20. Service Worker Strategy

The application shell and white-noise audio asset should be precached.

Conceptually:

```text
Cache
├── /
├── index.html
├── CSS
├── JS
├── manifest.webmanifest
├── icons
└── audio/
    └── white-noise.m4a
```

The white-noise asset must be included deliberately rather than relying on opportunistic browser caching.

Offline playback should be tested explicitly.

## 21. PWA Support

The site should include:

* web app manifest,
* application icons,
* service worker,
* theme metadata,
* installable configuration where supported.

However:

> PWA installation is an optional capability, not a prerequisite for using the product.

This distinction is important.

Users should receive essentially the same core functionality whether they:

* open the site normally in Safari or Chrome,
* bookmark it,
* install it to their home screen.

## 22. SEO

The page should use server-generated/static HTML for all meaningful content.

Basic SEO requirements:

* descriptive `<title>`,
* useful meta description,
* canonical URL,
* semantic heading structure,
* Open Graph metadata,
* appropriate social preview image,
* accessible text content,
* structured data where genuinely useful.

Potential content topics:

* white noise for babies,
* baby sleep sounds,
* how to use white noise,
* whether white noise can run continuously,
* offline white noise,
* common usage questions.

Content should remain genuinely useful and not become keyword-stuffed filler.

## 23. Accessibility

Accessibility should be considered from the beginning.

Minimum requirements:

* native `<button>` controls,
* clear focus states,
* keyboard operation,
* sufficient contrast,
* understandable labels,
* large mobile tap targets,
* reduced-motion support where appropriate,
* visible playback state,
* no essential information conveyed through color alone.

The player should be operable with one hand and easy to use in poor lighting.

## 24. Performance Philosophy

Performance is a core product feature.

The application should aim for:

* static HTML wherever possible,
* near-zero client JavaScript outside the player,
* minimal CSS,
* no frontend framework runtime,
* no unnecessary fonts,
* no heavy third-party dependencies,
* no blocking analytics scripts,
* no unnecessary animations.

The page should feel instant even on a mediocre mobile connection.

Because the core experience may often be opened during bedtime or while dealing with a crying child, responsiveness is part of the UX rather than merely a technical metric.

## 25. Dependency Philosophy

Dependencies should be introduced only when they eliminate substantial complexity.

The default choice is native platform capabilities.

Preferred:

```text
Astro
TypeScript
HTML
CSS
HTMLAudioElement
Service Worker
Cache API
Media Session API
Web App Manifest
```

Avoid introducing libraries for functionality that can reasonably be implemented with browser APIs.

## 26. Proposed Project Structure

```text
src/
├── components/
│   ├── AudioPlayer.astro
│   ├── Benefits.astro
│   ├── FAQ.astro
│   ├── Hero.astro
│   └── Footer.astro
│
├── layouts/
│   └── BaseLayout.astro
│
├── pages/
│   └── index.astro
│
├── scripts/
│   └── audio-player.ts
│
└── styles/
    └── global.css

public/
├── audio/
│   └── white-noise.m4a
│
├── icons/
│   ├── ...
│
├── manifest.webmanifest
└── ...
```

The exact structure should remain flexible.

Avoid creating abstractions merely to make the project look architecturally sophisticated.

## 27. Hosting

The application should be deployable as completely static output.

Preferred hosting characteristics:

* global CDN,
* HTTPS,
* immutable asset caching,
* inexpensive or free hosting,
* simple deployment.

Cloudflare is an obvious fit.

No origin server is required for the MVP.

## 28. Future Feature: Sleep Timer

A sleep timer is a likely first enhancement after MVP.

Possible options:

* Continuous
* 15 minutes
* 30 minutes
* 60 minutes
* custom duration later

This feature still does not require a frontend framework.

A possible internal state model:

```ts
interface PlayerState {
  playing: boolean
  timerEndsAt: number | null
}
```

The timer should stop playback rather than depending on continuous high-frequency JavaScript execution.

Implementation should account for page suspension and therefore rely on an absolute target timestamp rather than merely decrementing an in-memory counter.

## 29. Framework Escalation Rule

Do not add a frontend UI framework simply because the player gains a few additional features.

Vanilla TypeScript remains appropriate for:

* playback,
* volume,
* simple timers,
* a few sound choices,
* basic local preferences.

A framework should only be introduced when UI complexity genuinely starts creating state-management or rendering problems.

If this happens, the preferred architecture is:

```text
Astro site
    +
one interactive island
```

Possible island technologies include:

* Preact,
* Svelte,
* React.

The rest of the site should remain static Astro.

## 30. Possible Future Product Expansion

Potential future features, depending on user demand:

* sleep timer,
* brown noise,
* pink noise,
* rain,
* fan sounds,
* volume persistence,
* remembered last sound,
* install prompt,
* basic local preferences,
* shareable sound URLs,
* localized versions of the site,
* educational content,
* additional SEO landing pages.

Features requiring accounts or backend infrastructure should face a much higher bar.

## 31. Key Architecture Principles

The project should consistently follow these principles:

### Static by default

If something does not require JavaScript, do not ship JavaScript for it.

### Progressive enhancement

HTML is the foundation. JavaScript adds behavior rather than constructing the entire experience.

### Browser APIs first

Prefer native platform features over dependencies.

### No architecture for hypothetical scale

Build for the current product while preserving clean extension points.

### Performance is UX

Fast startup matters particularly strongly for this product.

### Reliability over cleverness

A boring `<audio>` element that keeps playing is better than a sophisticated audio engine that fails when the phone locks.

### Installation is optional

The website itself is the product.

PWA installation is an enhancement.

## 32. Initial Technical Stack

Final MVP stack decision:

```text
Astro
TypeScript
Scoped Astro CSS
Small global CSS layer
Vanilla TypeScript for interactivity
HTMLAudioElement
Media Session API
Service Worker
Cache Storage API
Web App Manifest
Static hosting / Cloudflare
```

Explicitly excluded from the initial stack:

```text
React
Preact
Svelte
SvelteKit
Tailwind CSS
State-management libraries
Backend framework
Database
Authentication
```

## 33. MVP Definition of Done

The MVP is considered technically complete when:

* The page renders fully as static HTML.
* The visual design is polished on mobile.
* The user can start and stop white noise.
* Audio loops without an audible gap.
* Playback survives screen lock on supported target browsers.
* Playback works in normal iOS Safari.
* The application works offline after the initial load.
* The white-noise asset is explicitly available offline.
* The service worker updates safely between releases.
* The page includes valid SEO metadata.
* The page has a valid PWA manifest.
* Lock-screen / Media Session controls work where supported.
* Core controls are keyboard-accessible.
* The site performs well on a real mobile device.
* No unnecessary JavaScript framework is shipped.

## 34. Core Decision

The guiding architectural idea for the project is:

> Build a website first, progressively enhance it into an offline audio utility, and resist turning it into an application framework until the product actually requires one.

For the MVP, Astro + native browser APIs provides the best combination of simplicity, performance, SEO, maintainability, and room for future growth.
