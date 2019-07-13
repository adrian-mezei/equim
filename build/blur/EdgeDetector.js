"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EdgeCrossingType_1 = require("../model/EdgeCrossingType");
class EdgeDetector {
    constructor(imageWidth, imageHeight) {
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
    }
    detectEdges(points, sideDistance) {
        const edgeCrossings = [];
        for (var i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            if (p1.x > this.imageWidth - sideDistance && p2.x < sideDistance) {
                if (p1.y > this.imageHeight / 2) {
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.BOTTOM_LEFT_RIGHT,
                        index: i
                    });
                }
                else {
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.TOP_LEFT_RIGHT,
                        index: i
                    });
                }
                i += 2;
            }
            if (p1.x < sideDistance && p2.x > this.imageWidth - sideDistance) {
                if (p1.y > this.imageHeight / 2) {
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.BOTTOM_RIGHT_LEFT,
                        index: i
                    });
                }
                else {
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.TOP_RIGHT_LEFT,
                        index: i
                    });
                }
                i += 2;
            }
        }
        switch (edgeCrossings.length) {
            case 0: return [points];
            case 1: return this.extendSingleCrossing(points, edgeCrossings[0]);
            case 2: return this.extendDoubleCrossing(points, edgeCrossings[0], edgeCrossings[1]);
            default: throw new Error('The number of edge crossings is other than 0, 1 or 2.');
        }
    }
    extendSingleCrossing(points, edgeCrossing) {
        let point1;
        let point2;
        switch (edgeCrossing.type) {
            case EdgeCrossingType_1.EdgeCrossingType.TOP_LEFT_RIGHT:
                point1 = { x: this.imageWidth, y: 0 };
                point2 = { x: 0, y: 0 };
                break;
            case EdgeCrossingType_1.EdgeCrossingType.TOP_RIGHT_LEFT:
                point1 = { x: 0, y: 0 };
                point2 = { x: this.imageWidth, y: 0 };
                break;
            case EdgeCrossingType_1.EdgeCrossingType.BOTTOM_LEFT_RIGHT:
                point1 = { x: this.imageWidth, y: this.imageHeight };
                point2 = { x: 0, y: this.imageHeight };
                break;
            case EdgeCrossingType_1.EdgeCrossingType.BOTTOM_RIGHT_LEFT:
                point1 = { x: 0, y: this.imageHeight };
                point2 = { x: this.imageWidth, y: this.imageHeight };
                break;
        }
        points.splice(edgeCrossing.index + 1, 0, point1, point2);
        return [points];
    }
    extendDoubleCrossing(points, edgeCrossing1, edgeCrossing2) {
        let leftRight = undefined;
        let rightLeft = undefined;
        if (edgeCrossing1.type === EdgeCrossingType_1.EdgeCrossingType.BOTTOM_LEFT_RIGHT || edgeCrossing1.type === EdgeCrossingType_1.EdgeCrossingType.TOP_LEFT_RIGHT)
            leftRight = edgeCrossing1;
        if (edgeCrossing2.type === EdgeCrossingType_1.EdgeCrossingType.BOTTOM_LEFT_RIGHT || edgeCrossing2.type === EdgeCrossingType_1.EdgeCrossingType.TOP_LEFT_RIGHT)
            leftRight = edgeCrossing2;
        if (edgeCrossing1.type === EdgeCrossingType_1.EdgeCrossingType.BOTTOM_RIGHT_LEFT || edgeCrossing1.type === EdgeCrossingType_1.EdgeCrossingType.TOP_RIGHT_LEFT)
            rightLeft = edgeCrossing1;
        if (edgeCrossing2.type === EdgeCrossingType_1.EdgeCrossingType.BOTTOM_RIGHT_LEFT || edgeCrossing2.type === EdgeCrossingType_1.EdgeCrossingType.TOP_RIGHT_LEFT)
            rightLeft = edgeCrossing2;
        if (leftRight === undefined)
            throw new Error('Left to right edge crossing is missing.');
        if (rightLeft === undefined)
            throw new Error('Right to left edge crossing is missing.');
        let firstBegin = points.slice(0, edgeCrossing1.index + 1);
        let firstEnd = points.slice(edgeCrossing2.index + 1, points.length);
        let second = points.slice(edgeCrossing1.index + 1, edgeCrossing2.index + 1);
        const chunks = [[], []];
        chunks[0].push(...firstBegin);
        this.extendWithEdge(chunks[0], firstEnd[0]);
        chunks[0].push(...firstEnd);
        chunks[1].push(...second);
        this.extendWithEdge(chunks[1], chunks[1][0]);
        return chunks;
    }
    extendWithEdge(points, end) {
        const last = points[points.length - 1];
        if (last.x !== end.x)
            throw new Error('Edge points to be connected are not in the same column.');
        if (!(last.x === 0 || last.x === this.imageWidth))
            throw new Error('Points to be connected are not edge points.');
        if (Math.abs(end.y - last.y) <= 1)
            return;
        for (let i = 1; i < Math.abs(end.y - last.y); i++) {
            const step = Math.sign(end.y - last.y);
            points.push({ x: last.x, y: last.y + i * step });
        }
    }
}
exports.EdgeDetector = EdgeDetector;
