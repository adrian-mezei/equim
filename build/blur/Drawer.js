"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Converter_1 = require("./Converter");
const GreatCircle_1 = require("./GreatCircle");
const ClosedLineConnector_1 = require("./ClosedLineConnector");
const EdgeDetector_1 = require("./EdgeDetector");
class Drawer {
    static drawCircledX(image, point) {
        this.drawX(image, point);
        const radius = 100;
        for (var i = 0; i < 2 * Math.PI; i += Math.PI / 8) {
            const p = {
                x: point.x + Math.cos(i) * radius,
                y: point.y + Math.sin(i) * radius
            };
            this.drawX(image, p);
        }
    }
    ;
    static drawCircledXs(image, points) {
        for (const point of points) {
            this.drawCircledX(image, point);
        }
    }
    ;
    static drawX(image, p, size, color) {
        const x = Math.round(p.x);
        const y = Math.round(p.y);
        const index = image.getWidth() * 4 * (y - 1) + x * 4;
        if (!size)
            size = 10;
        if (!color)
            color = { r: 255, g: 0, b: 0, a: 255 };
        for (let i = -size + 1; i < size; i++) {
            // horizontal line
            image.bitmap.data[index + i * 4 + 0] = color.r;
            image.bitmap.data[index + i * 4 + 1] = color.g;
            image.bitmap.data[index + i * 4 + 2] = color.b;
            image.bitmap.data[index + i * 4 + 3] = color.a;
            // vertical line
            image.bitmap.data[index + i * 4 * image.getWidth() + 0] = color.r;
            image.bitmap.data[index + i * 4 * image.getWidth() + 1] = color.g;
            image.bitmap.data[index + i * 4 * image.getWidth() + 2] = color.b;
            image.bitmap.data[index + i * 4 * image.getWidth() + 3] = color.a;
        }
    }
    static drawXs(image, points, size, color) {
        for (const p of points) {
            this.drawX(image, p, size, color);
        }
    }
    static drawEquirectX(image, hotspot) {
        const converter = new Converter_1.Converter(image.getWidth(), image.getHeight());
        const coord = converter.convertToXY(hotspot);
        Drawer.drawX(image, coord);
        const radius = 100;
        const deg = radius / 5;
        for (var i = 0; i < 2 * Math.PI; i += Math.PI / 500) {
            const co = converter.convertToXY({ yaw: hotspot.yaw + Math.cos(i) * deg, pitch: hotspot.pitch + Math.sin(i) * deg });
            Drawer.drawX(image, co);
        }
    }
    ;
    static drawHotspots(image, hotspots) {
        const points = new Converter_1.Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        Drawer.drawXs(image, points, 20, { r: 255, g: 0, b: 0, a: 255 });
    }
    static drawCircledHotspots(image, hotspots) {
        const points = new Converter_1.Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        Drawer.drawCircledXs(image, points);
    }
    static drawEquirectRectangle(image, hotspots) {
        const points = new Converter_1.Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        var segmentedBoundary = new GreatCircle_1.GreatCircle(image.getWidth(), image.getHeight()).segmentAlongGreatCircles(points); // Segment the lines of consecutive hotspots along the Great Circles
        Drawer.drawXs(image, segmentedBoundary, 1, { r: 0, g: 255, b: 0, a: 255 });
    }
    static drawEquirectRectangleClosed(image, hotspots) {
        const points = new Converter_1.Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        var segmentedBoundary = new GreatCircle_1.GreatCircle(image.getWidth(), image.getHeight()).segmentAlongGreatCircles(points); // Segment the lines of consecutive hotspots along the Great Circles
        EdgeDetector_1.EdgeDetector.detectEdges(segmentedBoundary, 0.5);
        var closedBoundary = ClosedLineConnector_1.ClosedLineConnector.connectWithClosedLines(segmentedBoundary); // Connect the segmented boundary to a closed curve
        Drawer.drawXs(image, closedBoundary, 1, { r: 0, g: 0, b: 255, a: 255 });
    }
}
exports.Drawer = Drawer;
