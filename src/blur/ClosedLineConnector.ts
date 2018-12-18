import { Point } from '../model/Point';

export class ClosedLineConnector {
    
    /**
     * Connects the lines formed by the consecutive point pairs of the provided points. 
     * The connections are always closed in such way, that every point of the boundary 
     * is connected to at least two other points of the boundary by a side.
     * @param points The points that are to be consecutively connected.
     */
    public static connectWithClosedLines(points: Point[]): Point[] {
        var closedBoundary: Point[] = [];
        for(var i=0; i<points.length; i++){
            const point1: Point = points[i];
            const point2: Point = points[(i+1) % points.length];

            closedBoundary = closedBoundary.concat(this.connectWithClosedLine(point1, point2));
        }
        
        return closedBoundary;
    }

    /**
     * Connects the line formed by the provided point pair. The connections are always closed in 
     * such way, that every point of the boundary is connected to at least two other points of 
     * the boundary by a side.
     * @param points The points that are to be consecutively connected. These must be of integer
     * coordinates.
     */
    public static connectWithClosedLine(p1: Point, p2: Point): Point[] {
        var pointsOfClosedBoundary: Point[] = [p1];
        var lastPoint = p1;

        // line of the two points from "y - y1 = m(x - x1)" to "ax + by + c = 0"
        const m = (p2.y - p1.y)/(p2.x - p1.x); 
        const a = m;
        const b = -1;
        const c = -m*p1.x + p1.y;
        while(!(lastPoint.x === p2.x && lastPoint.y === p2.y)){
            // the possible steps left/right or up/down
            // (one cloud also include diagonal step, but that is not considered closed in this case)
            const verticalStep = {x: lastPoint.x, y: lastPoint.y + ((p2.y > lastPoint.y) ? 1 : -1)}; 
            const horizontalStep = {x: lastPoint.x + ((p2.x > lastPoint.x) ? 1 : -1), y: lastPoint.y};

            // distances from the line that connects the two points "(a*x + b*y + c)/sqrt(a*a + b*b)"
            const verticalDistance = Math.abs(a*verticalStep.x + b*verticalStep.y + c) / Math.sqrt(a*a + b*b);
            const horizontalDistance = Math.abs(a*horizontalStep.x + b*horizontalStep.y + c) / Math.sqrt(a*a + b*b);
            
            // a more complicated decision because of edge cases, to avoid stepping to and back 
            // the same points
            var nextPoint: Point;
            if (verticalDistance < horizontalDistance) nextPoint = verticalStep;
            else if(horizontalDistance < verticalDistance) nextPoint = horizontalStep;
            else if (pointsOfClosedBoundary.length > 1){
                const pointBeforeLastPoint = pointsOfClosedBoundary[pointsOfClosedBoundary.length - 2];
                
                if(verticalStep.x === pointBeforeLastPoint.x && verticalStep.y === pointBeforeLastPoint.y) nextPoint = horizontalStep;
                else nextPoint = verticalStep;
            } else {
                nextPoint = verticalStep; // could also be the horizontal one
            }

            pointsOfClosedBoundary.push(nextPoint);
            lastPoint = pointsOfClosedBoundary[pointsOfClosedBoundary.length - 1];
        }

        return pointsOfClosedBoundary;
    }
}