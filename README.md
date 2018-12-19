# Equim
### Equirectangular image manipulation in the browser.
 
---
At [Toura](https://toura.io/), we process equirectangular images and do realtime image manipulation on them in the browser.

This library provides methods to manipulate equirectangular images in the browser while they are previewed in panorama viewer. Such panorama viewer is [Pannellum](https://pannellum.org/) for example that is on [Github](https://github.com/mpetroff/pannellum/) as well. 

This library uses [Jimp](https://github.com/oliver-moran/jimp) for low level image manipulation available as an [npm package](https://www.npmjs.com/package/jimp) as well.

The main purpose of this library is to make it possible to parametrize certain image manipulation methods from the point of view of the panorama viewer.

## Equirectangular photos
There are a lot of equirectangular photos around the internet. One can find quality photos at [Photopin](http://photopin.com/free-photos/equirectangular) for example. They also have a lot of free photos as well.

## Usage
 The generated blur.js must be included in the HTML page.  Since the library uses [Jimp](https://github.com/oliver-moran/jimp), it is required to include [Jimp from CDN](https://www.jsdelivr.com/package/npm/jimp) as well. Having these done, the blur object is visible at global scope and can be used as described below.

## Example
