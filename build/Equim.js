"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Blur_1 = require("./blur/Blur");
const Jimp = __importStar(require("jimp"));
class Equim {
    static getBase64(image, callback) {
        image.getBase64(image.getMIME(), callback);
    }
    static read(imagePath, callback) {
        Jimp.default.read(imagePath)
            .then(image => callback(undefined, image))
            .catch(e => {
            callback(e, undefined);
        });
    }
    static readBase64(imageBase64, callback) {
        if (imageBase64.indexOf('data:image/jpeg;base64,') != -1) {
            imageBase64 = imageBase64.replace(/^data:image\/jpeg;base64,/, '');
        }
        Jimp.default.read(Buffer.from(imageBase64, 'base64'))
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
exports.Equim = Equim;
Equim.blur = new Blur_1.Blur();
