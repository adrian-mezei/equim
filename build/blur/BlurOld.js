"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Jimp = require("jimp");
class Blur {
    constructor(circleMaskPath, squareMaskPath) {
        this.circleMaskPath = circleMaskPath;
        this.squareMaskPath = squareMaskPath;
    }
    blurFull(imagePath, blurIntensity, targetPath) {
        Jimp.read(imagePath).then(image => {
            image
                .blur(blurIntensity)
                .write(targetPath);
        });
    }
    blurRectangular(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, callback) {
        this.blurMasked(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, this.squareMaskPath, callback);
    }
    blurCircle(imagePath, xCenter, yCenter, radius, blurIntensity, callback) {
        this.blurEllipse(imagePath, xCenter, yCenter, radius, radius, 0, blurIntensity, callback);
    }
    getBase64(image, callback) {
        image.getBase64(image.getMIME(), callback);
    }
    writeToFile(image, path, callback) {
        image.write(path, (err) => {
            callback(err);
        });
    }
    blurEllipse(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, callback) {
        this.blurMasked(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, this.circleMaskPath, callback);
    }
    blurMasked(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, maskPath, callback) {
        console.log('blurMasked');
        Jimp.read(imagePath).then(image => {
            console.log('read');
            this.createRoundMask(image.getWidth(), image.getHeight(), xCenter, yCenter, width, (err, resizedMaskData) => {
                console.log('createRoundMask');
                if (err || !resizedMaskData)
                    return callback(err);
                const x = resizedMaskData.x;
                const y = resizedMaskData.y;
                const resizedMask = resizedMaskData.mask;
                const bluredPart = image
                    .clone()
                    .crop(x, y, resizedMask.getWidth(), resizedMask.getHeight())
                    .blur(blurIntensity)
                    .mask(resizedMask, 0, 0);
                if (x < 0) {
                    const bluredPartLeft = bluredPart
                        .clone()
                        .crop(0, 0, -x, bluredPart.getHeight());
                    const bluredPartRight = bluredPart
                        .crop(-x, 0, bluredPart.getWidth() + x, bluredPart.getHeight());
                    image
                        .composite(bluredPartLeft, image.getWidth() + x, y)
                        .composite(bluredPartRight, 0, y);
                }
                else if (x + bluredPart.getWidth() > image.getWidth()) {
                    const edge = image.getWidth() - x;
                    const bluredPartLeft = bluredPart
                        .clone()
                        .crop(0, 0, edge, bluredPart.getHeight());
                    const bluredPartRight = bluredPart
                        .crop(edge, 0, bluredPart.getWidth() - edge, bluredPart.getHeight());
                    image
                        .composite(bluredPartLeft, image.getWidth() - edge, y)
                        .composite(bluredPartRight, 0, y);
                }
                else {
                    image
                        .composite(bluredPart, x, y);
                }
                callback(undefined, image);
            });
        });
    }
    createRoundMask(width, height, xCenter, yCenter, radius, callback) {
        const maskLines = [];
        let maxMaskWidth = 0;
        for (let yDistanceFromCircleCentre = radius; yDistanceFromCircleCentre > -radius; yDistanceFromCircleCentre--) {
            let y = yCenter - yDistanceFromCircleCentre;
            if (y >= 0 && y < height) {
                const lineHalfWidth = Math.sqrt(radius * radius - yDistanceFromCircleCentre * yDistanceFromCircleCentre);
                const lineWidth = 2 * lineHalfWidth;
                const globeRadius = width / 2 / Math.PI;
                const distanceFromEquatorOnGlobe = Math.abs(height / 2 - y);
                const angleOfHeightOnGlobe = Math.PI * 2 * (distanceFromEquatorOnGlobe / (2 * globeRadius * Math.PI));
                const globeDistantRadius = Math.cos(angleOfHeightOnGlobe) * globeRadius;
                const globeDistantPerimeter = 2 * globeDistantRadius * Math.PI;
                const scaleFactor = width / globeDistantPerimeter;
                const scaledLineWidth = (lineWidth * scaleFactor > width) ? width : lineWidth * scaleFactor;
                const roundedScaledLineWidth = Math.round(scaledLineWidth);
                maskLines.push(roundedScaledLineWidth);
                if (roundedScaledLineWidth > maxMaskWidth)
                    maxMaskWidth = roundedScaledLineWidth;
            }
        }
        const data = [];
        for (let i = 0; i < maskLines.length * maxMaskWidth; i++) {
            const row = Math.floor(i / maxMaskWidth);
            const col = i % maxMaskWidth;
            const lineWidth = maskLines[row];
            const begin = (maxMaskWidth - lineWidth) / 2;
            const pixelValue = (col < begin || col > begin + lineWidth) ? 0 : 255;
            data.push(pixelValue);
            data.push(pixelValue);
            data.push(pixelValue);
            data.push(255);
        }
        new Jimp(maxMaskWidth, maskLines.length, 0, (err, jimp) => {
            if (err || !jimp)
                return callback(err ? err : undefined);
            jimp.bitmap.data = new Buffer(data);
            callback(undefined, { x: xCenter - maxMaskWidth / 2, y: (yCenter - radius > 0) ? yCenter - radius : 0, mask: jimp });
        });
    }
    drawX(imagePath, x, y, callback) {
        Jimp.read(imagePath).then(image => {
            this.drawOneX(x, y, image);
            const radius = 100;
            for (var i = 0; i < 2 * Math.PI; i += Math.PI / 8) {
                this.drawOneX(x + Math.cos(i) * radius, y + Math.sin(i) * radius, image);
            }
            const latLong = this.convertToYawPitch(x, y);
            console.log('X: ' + x + '  Y: ' + y);
            console.log('Yaw: ' + latLong.yaw + '  Pitch: ' + latLong.pitch);
            callback(undefined, image);
        });
    }
    ;
    drawHotSpots(imagePath, hotSpots, callback) {
        Jimp.read(imagePath).then(image => {
            const hotSpotsXY = [];
            for (const hotSpot of hotSpots) {
                const hotSpotXY = this.convertToXY(hotSpot.yaw, hotSpot.pitch);
                hotSpotsXY.push(hotSpotXY);
            }
            for (const hotSpotXY of hotSpotsXY) {
                this.drawOneX(hotSpotXY.x, hotSpotXY.y, image);
            }
            for (var i = 0; i < hotSpots.length; i++) {
                const hotSpot1 = hotSpots[i];
                const hotSpot2 = hotSpots[(i + 1) % hotSpots.length];
                console.log('hotSpot1: ' + JSON.stringify(hotSpot1));
                console.log('hotSpot2: ' + JSON.stringify(hotSpot2));
                this.greatCircleConnect(image, hotSpot1, hotSpot2);
            }
            callback(undefined, image);
        });
    }
    greatCircleConnect(image, p1, p2) {
        var a, b, d, x, y, z, ix, iy;
        var ax = (p1.yaw * 3.1415) / 180.0;
        var ay = (p1.pitch * 3.1415) / 180.0;
        var bx = (p2.yaw * 3.1415) / 180.0;
        var by = (p2.pitch * 3.1415) / 180.0;
        d = 2 * Math.asin(Math.sqrt(Math.sin((ay - by) / 2) * Math.sin((ay - by) / 2) +
            Math.cos(ay) * Math.cos(by) * Math.sin((ax - bx) / 2) * Math.sin((ax - bx) / 2)));
        for (var i = 0; i <= 1; i += 0.01) {
            a = Math.sin((1 - i) * d) / Math.sin(d);
            b = Math.sin(i * d) / Math.sin(d);
            x = a * Math.cos(ay) * Math.cos(ax) + b * Math.cos(by) * Math.cos(bx);
            y = a * Math.cos(ay) * Math.sin(ax) + b * Math.cos(by) * Math.sin(bx);
            z = a * Math.sin(ay) + b * Math.sin(by);
            iy = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / 3.1415;
            ix = (Math.atan2(y, x) * 180) / 3.1415;
            const xy = this.convertToXY(ix, iy);
            this.drawOneX(xy.x, xy.y, image);
        }
    }
    drawEquirectX(imagePath, yaw, pitch, callback) {
        Jimp.read(imagePath).then(image => {
            const coord = this.convertToXY(yaw, pitch);
            this.drawOneX(coord.x, coord.y, image);
            const radius = 100;
            const deg = radius / 5;
            for (var i = 0; i < 2 * Math.PI; i += Math.PI / 500) {
                console.log(i);
                const co = this.convertToXY(yaw + Math.cos(i) * deg, pitch + Math.sin(i) * deg);
                this.drawOneX(co.x, co.y, image);
            }
            console.log('callback');
            callback(undefined, image);
        });
    }
    ;
    drawEquirectRectImage(image, yaw1, yaw2, pitch1, pitch2, callback) {
        const coord = this.convertToXY((yaw1 + yaw2) / 2, (pitch1 + pitch2) / 2);
        this.drawOneX(coord.x, coord.y, image);
        for (var i = yaw1; i < yaw2; i += Math.abs(yaw1 - yaw2) / 100) {
            console.log(i);
            let co = this.convertToXY(i, pitch1);
            this.drawOneX(co.x, co.y, image);
            co = this.convertToXY(i, pitch2);
            this.drawOneX(co.x, co.y, image);
        }
        for (var i = pitch1; i < pitch2; i += Math.abs(pitch1 - pitch2) / 100) {
            console.log(i);
            let co = this.convertToXY(yaw1, i);
            this.drawOneX(co.x, co.y, image);
            co = this.convertToXY(yaw2, i);
            this.drawOneX(co.x, co.y, image);
        }
        console.log('callback');
        callback(undefined, image);
    }
    ;
    drawEquirectRect(imagePath, yaw1, yaw2, pitch1, pitch2, callback) {
        Jimp.read(imagePath).then(image => {
            this.drawEquirectRectImage(image, yaw1, yaw2, pitch1, pitch2, callback);
        });
    }
    ;
    drawOneX(x, y, image) {
        x = Math.round(x);
        y = Math.round(y);
        const index = image.getWidth() * 4 * (y - 1) + x * 4;
        for (let i = -10; i < 10; i++) {
            image.bitmap.data[index + i * 4] = 255;
            image.bitmap.data[index + i * 4 * image.getWidth()] = 255;
        }
    }
    convertToXY(yaw, pitch) {
        const imageWidth = 4000;
        const imageHeight = 2000;
        return {
            x: (yaw + 180) / 360 * imageWidth,
            y: imageHeight / 2 - (pitch / 180) * imageHeight
        };
    }
    convertToYawPitch(x, y) {
        const imageWidth = 4000;
        const imageHeight = 2000;
        return {
            yaw: (x / imageWidth) * 360 - 180,
            pitch: (imageHeight / 2 - y) / imageHeight * 180
        };
    }
}
exports.Blur = Blur;
