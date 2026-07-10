# Favico.ts

[![npm version](https://img.shields.io/npm/v/favico.ts.svg)](https://www.npmjs.com/package/favico.ts)
[![license](https://img.shields.io/npm/l/favico.ts.svg)](LICENSE)

A modern, framework-independent TypeScript successor to [Favico.js](https://github.com/ejci/favico.js).

Favico.ts adds notification badges, images, video frames, and webcam streams to the browser favicon. It preserves the familiar Favico.js API where practical while adding strict TypeScript types, SSR-safe imports, ESM/CommonJS builds, modern media APIs, and explicit cleanup.

## Features

* Notification badges with `circle` and `rectangle` styles
* `slide`, `fade`, `pop`, `popFade`, and `none` animations
* Custom colors, fonts, positions, and per-call options
* Image, video, and webcam favicon sources
* Strict TypeScript declarations
* ESM and CommonJS exports
* Optional browser-global build for legacy `<script>` usage
* SSR-safe imports for Next.js, Nuxt, and other server-rendered frameworks
* Explicit cleanup through `destroy()`
* Legacy aliases for common Favico.js options and methods
* No runtime dependencies

## Live Demo

▶️ **[Try the Interactive Demo](https://erikyo.github.io/favico.ts/)**

The [demo source code](https://github.com/erikyo/favico.ts/tree/main/demo) is available in the repository.

### Try it locally

```bash
git clone https://github.com/erikyo/favico.ts.git
cd favico.ts
npm install
npm run build
npm run demo:dev
```

## Installation

```bash
npm install favico.ts
```

```bash
pnpm add favico.ts
```

```bash
yarn add favico.ts
```

## Quick start

```ts
import Favico from "favico.ts";

const favico = new Favico({
  animation: "popFade",
  backgroundColor: "#ef4444",
  textColor: "#ffffff",
});

await favico.badge(5);
```

Calling asynchronous methods without awaiting them remains valid for legacy-style JavaScript:

```ts
void favico.badge(5);
```

Awaiting is recommended so initialization or rendering errors can be handled by your application.

## Badges

```ts
await favico.badge(1);
await favico.badge(42);
await favico.badge(1200);
await favico.badge("NEW");
```

Clear the badge and restore the base favicon:

```ts
await favico.badge(0);
await favico.badge("");
await favico.badge(null);
```

Override options for one update:

```ts
await favico.badge(12, "fade");

await favico.badge(12, {
  animation: "pop",
  backgroundColor: "#2563eb",
  textColor: "#ffffff",
  type: "rectangle",
});
```

Per-call options do not modify the instance defaults.

## Configuration

```ts
const favico = new Favico({
  backgroundColor: "#dc2626",
  textColor: "#ffffff",
  fontFamily: "Arial, sans-serif",
  fontStyle: "bold",
  type: "circle",
  position: "down",
  animation: "slide",
});
```

| Option            | Type                                                | Default        | Description                                  |
| ----------------- | --------------------------------------------------- | -------------- | -------------------------------------------- |
| `backgroundColor` | `string`                                            | `"#d00"`       | Badge background color.                      |
| `textColor`       | `string`                                            | `"#fff"`       | Badge text color.                            |
| `fontFamily`      | `string`                                            | `"sans-serif"` | Badge font family.                           |
| `fontStyle`       | `string`                                            | `"bold"`       | Badge font weight or style.                  |
| `type`            | `"circle" \| "rectangle"`                           | `"circle"`     | Badge shape.                                 |
| `position`        | `"down" \| "up" \| "left" \| "leftup" \| "upleft"`  | `"down"`       | Badge position.                              |
| `animation`       | `"slide" \| "fade" \| "pop" \| "popFade" \| "none"` | `"slide"`      | Default animation.                           |
| `element`         | `HTMLLinkElement \| HTMLImageElement`               | `null`         | Explicit target element.                     |
| `elementId`       | `string \| false`                                   | `false`        | ID of a legacy target element.               |
| `onUpdate`        | `(url: string) => void`                             | `undefined`    | Called when a favicon URL is generated.      |
| `window`          | `Window`                                            | current window | Alternate window for iframes or tests.       |
| `fallbackSize`    | `number`                                            | `32`           | Canvas size when no readable favicon exists. |

### Legacy aliases

| Favico.js option | Favico.ts option  |
| ---------------- | ----------------- |
| `bgColor`        | `backgroundColor` |
| `dataUrl`        | `onUpdate`        |
| `win`            | `window`          |

New code should use the modern names.

## Updating options

```ts
favico.setOptions({
  backgroundColor: "#7c3aed",
  animation: "fade",
});
```

Unspecified options keep their current values.

The legacy API remains available:

```ts
favico.setOpt("bgColor", "#7c3aed");

favico.setOpt({
  animation: "fade",
  textColor: "#ffffff",
});
```

`setOpt()` is deprecated. Prefer `setOptions()`.

## Images

Use an image element:

```ts
const image = document.querySelector<HTMLImageElement>("#avatar");

if (image) {
  await favico.image(image);
}
```

Use a URL:

```ts
await favico.image("/images/status-online.png");
```

Use an `ImageBitmap`:

```ts
const response = await fetch("/images/status-online.png");
const blob = await response.blob();
const bitmap = await createImageBitmap(blob);

await favico.image(bitmap);
bitmap.close();
```

Images are fitted inside the favicon while preserving their aspect ratio.

Remote images need suitable CORS headers before a browser can draw them to a canvas and export the result.

## Raw favicon URLs

Set an already prepared favicon without canvas rendering:

```ts
await favico.rawImageSrc("/icons/maintenance.svg");
```

A raw URL is not automatically adopted as the base image for later badges. Call `reset()` before returning to badge rendering:

```ts
await favico.reset();
await favico.badge(3);
```

## Video

```ts
const video = document.querySelector<HTMLVideoElement>("#preview");

if (video) {
  await favico.startVideo(video);
}
```

Stop video rendering:

```ts
favico.stopVideo();
```

Favico.js-compatible calls remain available:

```ts
await favico.video(video);
await favico.video("stop");
```

Favico.ts uses `requestVideoFrameCallback()` when available and falls back to `requestAnimationFrame()`.

## Webcam

Camera access requires HTTPS or `localhost` and explicit user permission.

```ts
try {
  const stream = await favico.startWebcam({
    video: {
      facingMode: "user",
    },
    audio: false,
  });

  console.log(stream.getVideoTracks());
} catch (error) {
  console.error("Unable to start the webcam", error);
}
```

Stop the camera and release every acquired track:

```ts
favico.stopWebcam();
```

Legacy calls remain available:

```ts
await favico.webcam();
await favico.webcam("stop");
```

`webcam()` is deprecated. Prefer `startWebcam()` and `stopWebcam()`.

## Reset and cleanup

Restore the original favicon and stop active rendering:

```ts
await favico.reset();
```

Permanently release the instance:

```ts
favico.destroy();
```

`destroy()` cancels animations and frame callbacks, stops webcam tracks, removes listeners, restores modified favicon elements, and removes elements created by the library.

Calling `destroy()` more than once is safe.

## React

```tsx
import { useEffect, useRef } from "react";
import Favico from "favico.ts";

interface NotificationFaviconProps {
  count: number;
}

export function NotificationFavicon({
  count,
}: NotificationFaviconProps): null {
  const favicoRef = useRef<Favico | null>(null);

  useEffect(() => {
    const favico = new Favico({
      animation: "popFade",
      backgroundColor: "#ef4444",
    });

    favicoRef.current = favico;

    return () => {
      favico.destroy();
      favicoRef.current = null;
    };
  }, []);

  useEffect(() => {
    const favico = favicoRef.current;

    if (favico) {
      void favico.badge(count);
    }
  }, [count]);

  return null;
}
```

Cleanup is important in React Strict Mode because development effects can be mounted, cleaned up, and mounted again.

## Next.js

Favico.ts can be imported during server rendering, but DOM updates must run in a client component:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Favico from "favico.ts";

export function FavicoBadge({ count }: { count: number }): null {
  const favicoRef = useRef<Favico | null>(null);

  useEffect(() => {
    const favico = new Favico();
    favicoRef.current = favico;

    return () => {
      favico.destroy();
      favicoRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (favicoRef.current) {
      void favicoRef.current.badge(count);
    }
  }, [count]);

  return null;
}
```

The package must not access `window`, `document`, or `navigator` during module evaluation.

## CommonJS

The compatibility build supports the historical constructor pattern:

```js
const Favico = require("favico.ts");

const favico = new Favico();
favico.badge(4);
```

Named access is also supported:

```js
const { Favico } = require("favico.ts");
```

## Browser-global build

For legacy pages without a bundler:

```html
<link rel="icon" href="/favicon.ico">

<script src="https://cdn.jsdelivr.net/npm/favico.ts/dist/favico.global.min.js"></script>
<script>
  const favico = new Favico({
    animation: "pop",
  });

  favico.badge(7);
</script>
```

ESM imports are recommended for new projects.

## API

| Method or property          | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| `ready()`                   | Wait for the base favicon and renderer to initialize.            |
| `badge(value, options?)`    | Render or clear a badge.                                         |
| `image(source)`             | Render an image URL, image element, or `ImageBitmap`.            |
| `rawImageSrc(url)`          | Assign a raw favicon URL.                                        |
| `startVideo(video)`         | Start rendering frames from a video element.                     |
| `stopVideo()`               | Stop video rendering without altering the supplied video source. |
| `video(video \| "stop")`    | Favico.js-compatible video API.                                  |
| `startWebcam(constraints?)` | Start a webcam stream and return its `MediaStream`.              |
| `stopWebcam()`              | Stop the webcam and its tracks.                                  |
| `webcam(action?)`           | Deprecated Favico.js-compatible webcam API.                      |
| `setOptions(options)`       | Update defaults without resetting unspecified values.            |
| `setOpt(key, value)`        | Deprecated Favico.js-compatible option setter.                   |
| `reset()`                   | Stop active rendering and restore the original favicon.          |
| `destroy()`                 | Release the instance and every owned resource.                   |
| `isSupported()`             | Check whether the required browser features are available.       |
| `browser.supported`         | Legacy support property.                                         |

## Error handling

Favico.ts exports typed errors:

```ts
import {
  EnvironmentError,
  FavicoError,
  ImageError,
  MediaError,
  RenderError,
} from "favico.ts";
```

```ts
try {
  await favico.image("https://example.com/remote-image.png");
} catch (error) {
  if (error instanceof ImageError) {
    console.error("The image could not be loaded", error);
  } else if (error instanceof RenderError) {
    console.error("The favicon could not be exported", error);
  } else {
    throw error;
  }
}
```

## SSR behavior

Importing and constructing the class is safe outside the browser:

```ts
import Favico from "favico.ts";

const favico = new Favico();
```

Operations that require a DOM reject with an `EnvironmentError` instead of failing during import.

## Content Security Policy

Favico.ts normally generates `data:image/png` URLs. A strict Content Security Policy may need to allow data images through the relevant `img-src` or fallback directive.

Test the final policy in each supported browser because favicon caching and policy handling can differ between engines.

## Browser support and limitations

Favico.ts targets current Chromium, Firefox, and Safari/WebKit releases and should be tested in all three engines before each release.

Favico.ts updates the active document favicon. It does not replace:

* installed PWA icons;
* operating-system shortcuts;
* pinned application icons;
* mobile home-screen icons;
* manifest icons.

Browsers may cache favicon changes differently.

## Migration from Favico.js

```js
// Favico.js
var favico = new Favico({
  bgColor: "#d00",
  animation: "slide",
});

favico.badge(5);
```

```ts
// Favico.ts
import Favico from "favico.ts";

const favico = new Favico({
  backgroundColor: "#d00",
  animation: "slide",
});

await favico.badge(5);
```

| Favico.js                   | Favico.ts                                            |
| --------------------------- | ---------------------------------------------------- |
| `new Favico()`              | `new Favico()`                                       |
| `badge(5)`                  | `await badge(5)`; ignoring the promise remains valid |
| `bgColor`                   | `backgroundColor`; legacy alias preserved            |
| `setOpt()`                  | `setOptions()`; legacy method preserved              |
| `image(img)`                | `await image(img)`                                   |
| `rawImageSrc(url)`          | `await rawImageSrc(url)`                             |
| `video(video)`              | `startVideo(video)` or compatible `video(video)`     |
| `video("stop")`             | `stopVideo()` or compatible `video("stop")`          |
| `webcam()`                  | `startWebcam()`                                      |
| `webcam("stop")`            | `stopWebcam()`                                       |
| `reset()`                   | `await reset()`                                      |
| `browser.supported`         | preserved                                            |
| CommonJS constructor export | preserved                                            |
| UMD/global script           | browser-global compatibility build                   |

## Development

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run test:browser
npm run build
npm pack --dry-run
```

The npm archive must contain compiled `dist/` files and must not rely on TypeScript source files at runtime.

## Attribution

Favico.ts is a modernized derivative of [Favico.js](https://github.com/ejci/favico.js), originally created by Miroslav Magda.

The original MIT copyright and permission notice are retained.

## License

MIT. See [LICENSE](LICENSE).
