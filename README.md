# Equim
### Equirectangular image manipulation both in browser and server side.
 
---
At [Toura](https://toura.io/), we process equirectangular images and do realtime image manipulation on them in the browser.

This library provides methods to manipulate equirectangular images in the browser while they are previewed in panorama viewer. Such panorama viewer is [Pannellum](https://pannellum.org/) for example that is on [Github](https://github.com/mpetroff/pannellum/) as well. 

This library uses [Jimp](https://github.com/oliver-moran/jimp) for low level image manipulation available as an [npm package](https://www.npmjs.com/package/jimp) as well.

The main purpose of this library is to make it possible to parametrize certain image manipulation methods from the point of view of the panorama viewer.

## Equirectangular photos
There are a lot of equirectangular photos around the internet. One can find quality photos at [Photopin](http://photopin.com/free-photos/equirectangular) for example. They also have a lot of free photos as well.

## Usage at server side
At server side the provided TS files can be used until the project is not available as an npm package. The dependencies of the project can be found in the package.json file.

## Usage in browser
The generated equim.js must be included in the HTML page.  Since the library uses [Jimp](https://github.com/oliver-moran/jimp), it is required to include [Jimp from CDN](https://www.jsdelivr.com/package/npm/jimp) as well. Having these done, the equim object is visible at global scope and can be used as described below.

### Read file
From URL
```javascript
const imagePath = 'https://s3-eu-west-1.amazonaws.com/equim.toura.io/panoramas/room.jpg';
equim.read(imagePath, (err, image) => {
    // image is availale as a Jimp
});
```

From base64 encoded string
```javascript
const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDA...';
equim.read(imageBase64, (err, image) => {
    // image is availale as a Jimp
});
```

### Write file
```javascript
equim.writeToFile(image, 'equirectangular.jpg', (err) => {
    // image is written to file
});
```

### Get base64 encoded image
```javascript
equim.getBase64(image, (err, imageBase64) => {
    // base64 encoded image
});
```

### Blur the full image
```javascript
const blurIntensity = 10;
equim.blur.blurFull(image, blurIntensity);
```

### Blur a rectangular part of a Jimp with fast blur
```javascript
const blurAreas = [[
    { yaw: -14.4,   pitch: 70.2 },
    { yaw: 22.05,   pitch: 70.38 },
    { yaw: 22.68,   pitch: 63 },
    { yaw: -12.78,  pitch: 63 }
]];
const blurIntensity = 100;
equim.blur.blurEquirectRectangle(image, blurAreas, blurIntensity);
```

## Full working example
See the [example](https://github.com/mezei-adrian/equim/tree/master/example) in the repository.
