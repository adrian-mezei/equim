"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Converter {
    static convertToXY(h) {
        return {
            x: (h.yaw + 180) / 360 * this.imageWidth,
            y: this.imageHeight / 2 - (h.pitch / 180) * this.imageHeight
        };
    }
    static convertToXYs(hotspots) {
        const points = [];
        for (const h of hotspots) {
            points.push(this.convertToXY(h));
        }
        return points;
    }
    static convertToYawPitch(p) {
        return {
            yaw: (p.x / this.imageWidth) * 360 - 180,
            pitch: (this.imageHeight / 2 - p.y) / this.imageHeight * 180
        };
    }
    static convertToYawPitchs(points) {
        const hotspots = [];
        for (const p of points) {
            hotspots.push(this.convertToYawPitch(p));
        }
        return hotspots;
    }
}
Converter.imageWidth = 4000;
Converter.imageHeight = 2000;
exports.Converter = Converter;
