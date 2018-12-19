"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blur_1 = require("./blur/Blur");
const Jimp = require("jimp");
class Equim {
    static getBase64(image, callback) {
        image.getBase64(image.getMIME(), callback);
    }
    static read(imagePath, callback) {
        Jimp.read(imagePath).then(image => callback(undefined, image));
    }
    static writeToFile(image, path, callback) {
        image.write(path, (err) => {
            callback(err);
        });
    }
}
Equim.blur = new Blur_1.Blur();
exports.Equim = Equim;
