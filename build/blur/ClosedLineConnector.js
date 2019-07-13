"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClosedLineConnector {
    static connectWithClosedLines(points) {
        var closedBoundary = [];
        for (var i = 0; i < points.length; i++) {
            const point1 = points[i];
            const point2 = points[(i + 1) % points.length];
            closedBoundary = closedBoundary.concat(this.connectWithClosedLine(point1, point2));
        }
        return closedBoundary;
    }
    static connectWithClosedLine(p1, p2) {
        var pointsOfClosedBoundary = [p1];
        var lastPoint = p1;
        const m = (p2.y - p1.y) / (p2.x - p1.x);
        const a = m;
        const b = -1;
        const c = -m * p1.x + p1.y;
        while (!(lastPoint.x === p2.x && lastPoint.y === p2.y)) {
            const verticalStep = { x: lastPoint.x, y: lastPoint.y + ((p2.y > lastPoint.y) ? 1 : -1) };
            const horizontalStep = { x: lastPoint.x + ((p2.x > lastPoint.x) ? 1 : -1), y: lastPoint.y };
            const verticalDistance = Math.abs(a * verticalStep.x + b * verticalStep.y + c) / Math.sqrt(a * a + b * b);
            const horizontalDistance = Math.abs(a * horizontalStep.x + b * horizontalStep.y + c) / Math.sqrt(a * a + b * b);
            var nextPoint;
            if (verticalDistance < horizontalDistance)
                nextPoint = verticalStep;
            else if (horizontalDistance < verticalDistance)
                nextPoint = horizontalStep;
            else if (pointsOfClosedBoundary.length > 1) {
                const pointBeforeLastPoint = pointsOfClosedBoundary[pointsOfClosedBoundary.length - 2];
                if (verticalStep.x === pointBeforeLastPoint.x && verticalStep.y === pointBeforeLastPoint.y)
                    nextPoint = horizontalStep;
                else
                    nextPoint = verticalStep;
            }
            else {
                nextPoint = verticalStep;
            }
            pointsOfClosedBoundary.push(nextPoint);
            lastPoint = pointsOfClosedBoundary[pointsOfClosedBoundary.length - 1];
        }
        return pointsOfClosedBoundary;
    }
}
exports.ClosedLineConnector = ClosedLineConnector;
