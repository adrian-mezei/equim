"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Equim_1 = require("./Equim");
const Drawer_1 = require("./util/Drawer");
const imagePath = 'https://s3-eu-west-1.amazonaws.com/equim.toura.io/panoramas/room.jpg';
let beginTime = new Date();
let time = new Date();
const hotSpotsBlessing = [
    { yaw: -14.4, pitch: 70.2 },
    { yaw: 22.05, pitch: 70.38 },
    { yaw: 22.68, pitch: 63 },
    { yaw: -12.78, pitch: 63 }
];
const hotSpotsTile = [
    { yaw: 6.5, pitch: -64 },
    { yaw: 31.4, pitch: -60.7 },
    { yaw: 49.7, pitch: -69.9 },
    { yaw: 10.8, pitch: -76 }
];
const hotSpotsSmall = [
    { yaw: 6, pitch: -64 },
    { yaw: 15, pitch: -60 },
    { yaw: 20, pitch: -66 },
    { yaw: 8, pitch: -68 }
];
const hotSpotsLarge = [
    { yaw: -80, pitch: 40 },
    { yaw: 80, pitch: 40 },
    { yaw: 80, pitch: -40 },
    { yaw: -80, pitch: -40 }
];
const hotSpotsBottom = [
    { yaw: -36, pitch: -72.5 },
    { yaw: 50, pitch: -69.7 },
    { yaw: 129.5, pitch: -71.5 },
    { yaw: -135, pitch: -74.5 }
];
const hotSpotsEdge = [
    { yaw: 150, pitch: 20 },
    { yaw: -150, pitch: 20 },
    { yaw: -150, pitch: -20 },
    { yaw: 150, pitch: -20 }
];
const hotSpotsTie = [
    { yaw: -80, pitch: 20 },
    { yaw: 80, pitch: -20 },
    { yaw: 80, pitch: 20 },
    { yaw: -80, pitch: -20 }
];
const hotSpotsConcave = [
    { yaw: -20, pitch: 20 },
    { yaw: -10, pitch: 5 },
    { yaw: 20, pitch: -20 },
    { yaw: -20, pitch: -20 }
];
Equim_1.Equim.read(imagePath, (err, image) => {
    if (err || !image)
        return console.log(err);
    console.log('Read time: ' + (new Date().getTime() - time.getTime()) / 1000 + 's');
    time = new Date();
    Equim_1.Equim.blur.blurEquirectRectangle(image, [hotSpotsBlessing, hotSpotsTile, hotSpotsBottom, hotSpotsEdge], 100);
    Drawer_1.Drawer.drawCircledHotspots(image, [...hotSpotsBlessing, ...hotSpotsTile, ...hotSpotsBottom, ...hotSpotsEdge]);
    console.log('Total blur time: ' + (new Date().getTime() - time.getTime()) / 1000 + 's');
    time = new Date();
    Equim_1.Equim.writeToFile(image, 'out/equirectangular.jpg', (err) => {
        if (err)
            return console.log(err);
        console.log('Write to file time: ' + (new Date().getTime() - time.getTime()) / 1000 + 's');
        time = new Date();
        console.log('Total runtime: ' + (new Date().getTime() - beginTime.getTime()) / 1000 + 's');
    });
});
