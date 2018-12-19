"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Converter_1 = require("../util/Converter");
// useful source: http://www.movable-type.co.uk/scripts/latlong.html
class GreatCircle {
    constructor(imageWidth, imageHeight) {
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.converter = new Converter_1.Converter(this.imageWidth, this.imageHeight);
    }
    /**
     * Segments each line segment of the consecutive point pairs of the provided points
     * along the Great Circle.
     *
     * @param points The points to be connected with great circle segments.
     *
     * @returns The array of generated points including the provided points.
     */
    segmentAlongGreatCircles(points) {
        var segmentedBoundary = [];
        for (var i = 0; i < points.length; i++) {
            const point1 = points[i];
            const point2 = points[(i + 1) % points.length];
            // multiply by 2 to avoid holes because of rounding
            const connectionPixelNumber = 2 * Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
            segmentedBoundary = segmentedBoundary.concat(this.segmentAlongGreatCircle(point1, point2, connectionPixelNumber));
        }
        return segmentedBoundary;
    }
    /**
     * Segments the line segment of the provided point pair along the Great Circle into
     * a given number of pieces.
     *
     * @param point1 The beginning of the great circle.
     * @param point2 The end of the great circle.
     * @param numberOfGeneratedPoints The number of points to generate.
     *
     * @returns The array of generated points including the provided point1 and excluding the provided point2.
     */
    segmentAlongGreatCircle(point1, point2, numberOfGeneratedPoints) {
        const boundingPoints = [];
        for (var i = 0; i <= 1; i += 1 / numberOfGeneratedPoints) {
            boundingPoints.push(this.pointBetweenTwoPoints(point1, point2, i));
        }
        return boundingPoints;
    }
    /**
     * Evaluates the parametric equation of the Great Circle given by two points.
     *
     * @param point1 The beginning of a Great Circle segment.
     * @param point2 The end of a Great Circle segment.
     * @param t The parameter where the Great Circle is evaluated. This parameter
     * is 0 at point1 and 1 at point2.
     */
    pointBetweenTwoPoints(point1, point2, t) {
        const hotspot1 = this.converter.convertToYawPitch(point1);
        const hotspot2 = this.converter.convertToYawPitch(point2);
        const h1 = {
            yaw: hotspot1.yaw / 180.0 * Math.PI,
            pitch: hotspot1.pitch / 180.0 * Math.PI
        };
        const h2 = {
            yaw: hotspot2.yaw / 180.0 * Math.PI,
            pitch: hotspot2.pitch / 180.0 * Math.PI
        };
        const d = 2 * Math.asin(Math.sqrt(Math.sin((h1.pitch - h2.pitch) / 2) * Math.sin((h1.pitch - h2.pitch) / 2) +
            Math.cos(h1.pitch) * Math.cos(h2.pitch) * Math.sin((h1.yaw - h2.yaw) / 2) * Math.sin((h1.yaw - h2.yaw) / 2)));
        const a = Math.sin((1 - t) * d) / Math.sin(d);
        const b = Math.sin(t * d) / Math.sin(d);
        const x = a * Math.cos(h1.pitch) * Math.cos(h1.yaw) + b * Math.cos(h2.pitch) * Math.cos(h2.yaw);
        const y = a * Math.cos(h1.pitch) * Math.sin(h1.yaw) + b * Math.cos(h2.pitch) * Math.sin(h2.yaw);
        const z = a * Math.sin(h1.pitch) + b * Math.sin(h2.pitch);
        const hotspot = {
            yaw: Math.atan2(y, x) / Math.PI * 180,
            pitch: Math.atan2(z, Math.sqrt(x * x + y * y)) / Math.PI * 180
        };
        const p = this.converter.convertToXY(hotspot);
        return { x: Math.round(p.x), y: Math.round(p.y) };
    }
}
exports.GreatCircle = GreatCircle;
