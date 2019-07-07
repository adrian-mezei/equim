"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EdgeCrossingType_1 = require("../model/EdgeCrossingType");
class EdgeDetector {
    /**
     * Looks for two consecutive points such that they are near the opposite
     * rare sides. If there is such pair of points, then further points are
     * inserted and the points may also be divided into chunks.
     *
     * @param points The points to be extended by the corners if needed.
     * @param sideDistance The distance from the side to be considered close.
     */
    static detectEdges(points, sideDistance) {
        const edgeCrossings = [];
        for (var i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            if (p1.x > this.imageWidth - sideDistance && p2.x < sideDistance) { // left to right
                if (p1.y > this.imageHeight / 2) { // bottom
                    //console.log('BOTTOM_LEFT_RIGHT');
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.BOTTOM_LEFT_RIGHT,
                        index: i
                    });
                }
                else { // top
                    //console.log('TOP_LEFT_RIGHT');
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.TOP_LEFT_RIGHT,
                        index: i
                    });
                }
                i += 2;
            }
            if (p1.x < sideDistance && p2.x > this.imageWidth - sideDistance) { // right to left
                if (p1.y > this.imageHeight / 2) { // bottom
                    //console.log('BOTTOM_RIGHT_LEFT');
                    edgeCrossings.push({
                        type: EdgeCrossingType_1.EdgeCrossingType.BOTTOM_RIGHT_LEFT,
                        index: i
                    });
                }
                else { // top
                    //console.log('TOP_RIGHT_LEFT');
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
    static extendSingleCrossing(points, edgeCrossing) {
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
    static extendDoubleCrossing(points, edgeCrossing1, edgeCrossing2) {
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
        /*console.log('First begin: ');
        console.log(firstBegin[0]);
        console.log(firstBegin[firstBegin.length - 1]);

        console.log('First end: ');
        console.log(firstEnd[0]);
        console.log(firstEnd[firstEnd.length - 1]);

        console.log('Second: ');
        console.log(second[0]);
        console.log(second[second.length - 1]);*/
        const chunks = [[], []];
        // construct the first chunk
        chunks[0].push(...firstBegin);
        this.extendWithEdge(chunks[0], firstEnd[0]);
        chunks[0].push(...firstEnd);
        // construct the second chunk
        chunks[1].push(...second);
        this.extendWithEdge(chunks[1], chunks[1][0]);
        return chunks;
    }
    /**
     * Extends the provided point array by points, to connect the last point of the provided
     * array to the provided point.
     *
     * @param points The points to be extended and whose last element must be an edge point.
     * @param endY The y coordinate until the extension must be done.
     */
    static extendWithEdge(points, end) {
        const last = points[points.length - 1]; // the last point of the part to be extended
        if (last.x !== end.x)
            throw new Error('Edge points to be connected are not in the same column.');
        if (!(last.x === 0 || last.x === this.imageWidth))
            throw new Error('Points to be connected are not edge points.');
        if (Math.abs(end.y - last.y) <= 1)
            return; // there is no gap between them
        for (let i = 1; i < Math.abs(end.y - last.y); i++) {
            const step = Math.sign(end.y - last.y);
            points.push({ x: last.x, y: last.y + i * step });
        }
    }
}
EdgeDetector.imageWidth = 4000;
EdgeDetector.imageHeight = 2000;
exports.EdgeDetector = EdgeDetector;
