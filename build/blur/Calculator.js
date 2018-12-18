"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Calculator {
    /**
     * Looks for two consecutive points such that they are near the opposite
     * rare sides. If there is such pair of points, then two corner points are inserted between them.
     *
     * @param points The points to be extended by the corners is needed.
     * @param sideDistance The distance from the side to be considered close.
     */
    static extendWithCorners(points, sideDistance) {
        for (var i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            if (p1.x > this.imageWidth - sideDistance && p2.x < sideDistance) { // left to right
                if (p1.y > this.imageHeight / 2) { // bottom
                    console.log('A');
                    points.splice(i + 1, 0, { x: this.imageWidth, y: this.imageHeight }, { x: 0, y: this.imageHeight });
                }
                else { // top
                    console.log('B');
                    points.splice(i + 1, 0, { x: this.imageWidth, y: 0 }, { x: 0, y: 0 });
                }
                i += 2;
            }
            if (p1.x < sideDistance && p2.x > this.imageWidth - sideDistance) { // right to left
                if (p1.y > this.imageHeight / 2) { // bottom
                    console.log('C');
                    points.splice(i + 1, 0, { x: 0, y: this.imageHeight }, { x: this.imageWidth, y: this.imageHeight });
                }
                else { // top
                    console.log('D');
                    points.splice(i + 1, 0, { x: 0, y: 0 }, { x: this.imageWidth, y: 0 });
                }
                i += 2;
            }
        }
    }
}
Calculator.imageWidth = 4000;
Calculator.imageHeight = 2000;
exports.Calculator = Calculator;
