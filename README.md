# svg-loading-strategies

Comparsion between SVG Icon loading strategies.
The results may differ when using more, less, smaller or bigger icons. Even combinations of different strategies e.g. using single embeds for big SVGs and sprites for small icons have different results.
There also are some benefits in lazy loading single files only when needed (in viewport) that are not covered by the results (only described in pros/cons).
The test assumes theat there are efficient compression strategies for the HTML and Asset Files e.g. gzip or [Brotli](https://github.com/google/brotli). It also assumes the page is served via HTTP/2 so [multiplexing](https://developers.google.com/web/fundamentals/performance/http2#request_and_response_multiplexing) is enabled.
[Preloading content](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content) also could have a positive effect.
Sometimes even using PNG files could make more sense.

## Test setup

Loading 100 SVG Icons from the [google Material design library](https://github.com/google/material-design-icons/) with different strategies.
There is an index.html with each strategy shown in a separate iframe. Because of network concurrency i would not recommend to use this for a comparison. If you want to get an impression on how the loading strategy will affect the loading behaviour in your browser use the separate scenarios.

## Demo

<a href="https://svg-loading-strategies.netlify.app/index.htm" target="_blank">https://svg-loading-strategies.netlify.app/index.htm</a>

![](demo.gif)

## Strategies

### 1. Lazy embeds

Each icon is loaded separately via JavaScript and embedded into to the DOM.

**Before initialization**

```html
<svg data-url="asset-url.svg"></svg>
```

**After initialization**

```html
<svg><path d="M0 0h24v24H0z"></path></svg>
```

| Pros                                                                                      | Cons                                                                                                                                                            |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Efficient Caching since each Icon will get resolved by a separate GET request.            | Browser has to work a lot since after download it has to manipulate the DOM. Also depending on the implementation it maybe has to parse the SVG response first. |
| It is possible to just embed the SVG icons needed on the current page                     | Only works when JavaScript is available.                                                                                                                        |
| Works asyncronously                                                                       | Lots of network requests.                                                                                                                                       |
| More granular progressive loading because of the size of the assets compared to a sprite. |                                                                                                                                                                 |

### 2. Lazy images

Simple image tag with lazy loading attribute.

```html
<img src="asset-url.svg" loading="lazy" alt="..." />
```

| Pros                                                                                                                   | Cons                                  |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Efficient Caching since each Icon will get resolved by a separate GET request.                                         | Styling of the icons is not possible. |
| It is possible to just embed the SVG icons needed on the current page                                                  | Lots of network requests.             |
| Works asyncronously.                                                                                                   |                                       |
| More granular progressive loading because of the size of the assets compared to a sprite.                              |                                       |
| No JavaScript needed for modern browsers with [natively supported lazy loading](https://caniuse.com/loading-lazy-attr) |                                       |

### 5. Sprite embedded server side

**Sprite embedded in body**

```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="position: absolute; width: 0; height: 0"
  aria-hidden="true"
>
  <defs>
    <symbol
      id="asset-id"
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
    </symbol>
    ...
  </defs>
</svg>
```

**SVG icons using the reference**

```html
<svg viewBox="0 0 24 24" width="24" height="24">
  <use xlink:href="#asset-id" />
</svg>
```

Sprite is embedded server side and is delivered with each HTML file.
The HTML should look the same as in strategy 4 when loading with JavaScript.
| Pros | Cons |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bigger DOM is blocking the [FCP](https://web.dev/first-contentful-paint/). | Each icon is loaded even when not needed on the current page. |
| No JavaScript needed. | Inefficient caching (client side) since the same icon is not cacheable by the client when visiting different sites. |
| When using the same icon on one page twice it is a better choice compared to single embeds. |Server has more work to do before cache when compressing the same iconset for lots of pages again and again. |

### 4. Sprite loaded and embedded with JavaScript

Sprite is loaded asynchronously and embedded to the DOM by JavaScript

**Sprite after embedded by JS in body**

```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="position: absolute; width: 0; height: 0"
  aria-hidden="true"
>
  <defs>
    <symbol
      id="asset-id"
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
    </symbol>
    ...
  </defs>
</svg>
```

**SVG icons using the reference**

```html
<svg viewBox="0 0 24 24" width="24" height="24">
  <use xlink:href="#asset-id" />
</svg>
```

| Pros                                                                                                                               | Cons                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Efficient Caching (server side) since the sprite is build and compressed once. Clients will request the same sprite for each page. | Each icon is loaded even when not needed on the current page.                                                                                                                                                                |
| Works asynchronously.                                                                                                              | Browser has to work a lot since after download it has to parse the JS containing the SVG-Sprite and manipulate the DOM. (maybe loading the SVG from a separate SVG file and not from a JavaScript file is a better solution) |

### 5. Embeds

Embed each icon when needed.

```html
<svg><path d="M0 0h24v24H0z"></path></svg>
```

| Pros                                                       | Cons                                                                                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Efficient Caching (server side) since the SVG is embedded. | Larger HTML files compared to the strategies with placeholder functionality.                                                                                                         |
| No extra network requests.                                 | Inefficient caching (client side) since the same icon is not cacheable by the client when visiting different sites. (maybe gzip/brotli will help for the same Icon on the same page) |
| Easy to implement.                                         | Server has more work to do before cache when compressing the same icon for lots of pages again and again.                                                                            |
| No JavaScript needed.                                      |                                                                                                                                                                                      |

## Comparison

### Labdata (PageSpeed Insights)

The following table contains Lighthouse results generated by [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights) and Chrome Devtools.

|                                                                        | Lazy Embeds | Images | Sprite Server Side | Sprite JS | Embeds |
| ---------------------------------------------------------------------- | ----------- | ------ | ------------------ | --------- | ------ |
| [First Contentful Paint](https://web.dev/first-contentful-paint/)      | 0.9s        | 1.1s   | 1s                 | **0.8s**  | 1s     |
| [Speed Index](https://web.dev/speed-index/)                            | 0.9s        | 1.1s   | 1s                 | **0.8s**  | 1s     |
| [Largest Contentful Paint](https://web.dev/lcp/)                       | 1.2s        | 1.1s   | 1s                 | **0.8s**  | 1s     |
| [Time to Interactive](https://web.dev/interactive/)                    | **0.9s**    | 1.1s   | 1s                 | 1.2s      | 1s     |
| [Total Blocking Time](https://web.dev/lighthouse-total-blocking-time/) | **0s**      | 10ms   | **0s**             | 60ms      | **0s** |

### Networking features (Chrome DevTools)

The following table contains data from the Devtools Network tab using the Fast 3g Preset.

|                                                                                                       | Lazy Embeds | Images | Sprite Server Side | Sprite JS | Embeds     |
| ----------------------------------------------------------------------------------------------------- | ----------- | ------ | ------------------ | --------- | ---------- |
| Requests                                                                                              | 140         | 139    | 2                  | 3         | 2          |
| Transferred Data                                                                                      | 83.4kB      | 108kB  | 22.6kB             | 27.5kB    | **20.7kB** |
| Finished                                                                                              | 2.89s       | 14.83s | 1.26s              | 1.31s     | **1.25s**  |
| [DOMContentLoaded Event](https://developer.mozilla.org/de/docs/Web/API/Window/DOMContentLoaded_event) | 1.25s       | 0.74s  | 0.71s              | 1.37s     | **0.68s**  |
| [Load Event](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event)                      | **1.25s**   | 1.32s  | 1.26s              | 1.37s     | **1.25s**  |
