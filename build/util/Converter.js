"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Converter {
    constructor(imageWidth, imageHeight) {
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
    }
    convertToXY(h) {
        return {
            x: (h.yaw + 180) / 360 * this.imageWidth,
            y: this.imageHeight / 2 - (h.pitch / 180) * this.imageHeight
        };
    }
    convertToXYs(hotspots) {
        const points = [];
        for (const h of hotspots) {
            points.push(this.convertToXY(h));
        }
        return points;
    }
    convertToYawPitch(p) {
        return {
            yaw: (p.x / this.imageWidth) * 360 - 180,
            pitch: (this.imageHeight / 2 - p.y) / this.imageHeight * 180
        };
    }
    convertToYawPitchs(points) {
        const hotspots = [];
        for (const p of points) {
            hotspots.push(this.convertToYawPitch(p));
        }
        return hotspots;
    }
}
exports.Converter = Converter;
