import { Blur } from './blur/Blur';
import Jimp = require('jimp');

export class Equim {
    public static blur = new Blur();

    public static getBase64(image: Jimp, callback: (err: Error | null, imageBase64: string) => void): void {
        image.getBase64(image.getMIME(), callback);
    }

    public static read(imagePath: string, callback: (err: Error | undefined, image: Jimp) => void): void {
        Jimp.read(imagePath).then(image  => callback(undefined, image));
    }

    public static writeToFile(image: Jimp, path: string, callback: (err: Error | null) => void): void {
        image.write(path, (err) => {
            callback(err);
        });
    }
}