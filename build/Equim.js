"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Blur_1 = require("./blur/Blur");
const Jimp = require("jimp");
class Equim {
    static getBase64(image, callback) {
        image.getBase64(image.getMIME(), callback);
    }
    static read(imagePath, callback) {
        Jimp.read(imagePath)
            .then(image => callback(undefined, image))
            .catch(e => {
            callback(e, undefined);
        });
    }
    static readBase64(imageBase64, callback) {
        if (imageBase64.indexOf('data:image/jpeg;base64,') != -1) {
            imageBase64 = imageBase64.replace(/^data:image\/jpeg;base64,/, '');
        }
        Jimp.read(Buffer.from(imageBase64, 'base64'))
            .then(jimp => {
            callback(undefined, jimp);
        })
            .catch(e => {
            callback(e, undefined);
        });
    }
    static writeToFile(image, path, callback) {
        image.write(path, (err) => {
            callback(err);
        });
    }
}
Equim.blur = new Blur_1.Blur();
exports.Equim = Equim;
