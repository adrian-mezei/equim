import { Blur } from './blur/Blur';
import * as Jimp from 'jimp';

export class Equim {
    public static blur = new Blur();

    public static getBase64(image: Jimp.Jimp, callback: (err: Error | null, imageBase64: string) => void): void {
        image.getBase64(image.getMIME(), callback);
    }

    public static read(imagePath: string, callback: (err: Error | undefined, image?: Jimp.Jimp) => void): void {
        Jimp.default.read(imagePath)
            .then(image  => callback(undefined, image))
            .catch(e => {
                callback(e, undefined);
            });
    }

    public static readBase64(imageBase64: string, callback: (err: Error | undefined, image?: Jimp.Jimp) => void): void {
        if(imageBase64.indexOf('data:image/jpeg;base64,') != -1) {
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

    public static writeToFile(image: Jimp.Jimp, path: string, callback: (err: Error | null) => void): void {
        image.write(path, (err) => {
            callback(err);
        });
    }
}