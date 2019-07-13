"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FloodFill {
    static fillArea(boundary, insidePoints, imageWidth, imageHeight) {
        for (const insidePoint of insidePoints) {
            if (!Number.isInteger(insidePoint.x) || !Number.isInteger(insidePoint.y))
                throw new Error('Provided insidePoint must be of integer coordinates.');
        }
        const area = this.createBooleanTableStructure(boundary, imageWidth, imageHeight);
        const insidePointsModified = [];
        for (const insidePoint of insidePoints) {
            insidePointsModified.push({
                x: insidePoint.x - area.xPosition,
                y: insidePoint.y - area.yPosition
            });
        }
        this.queuedSurroundingFill(area.data, insidePointsModified, imageWidth, imageHeight);
        return this.createMaskStructure(area);
    }
    static createBooleanTableStructure(points, imageWidth, imageHeight) {
        var minX = imageWidth;
        var maxX = 0;
        var minY = imageHeight;
        var maxY = 0;
        for (const p of points) {
            if (p.x > maxX)
                maxX = p.x;
            if (p.y > maxY)
                maxY = p.y;
            if (p.x < minX)
                minX = p.x;
            if (p.y < minY)
                minY = p.y;
        }
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        const area = [];
        for (var i = 0; i < height; i++) {
            const row = [];
            for (var j = 0; j < width; j++) {
                row.push(false);
            }
            area.push(row);
        }
        for (var i = 0; i < points.length; i++) {
            const p = { x: points[i].x - minX, y: points[i].y - minY };
            area[p.y][p.x] = true;
        }
        return {
            xPosition: minX,
            yPosition: minY,
            width,
            height,
            data: area
        };
    }
    static createMaskStructure(booleanTable) {
        const mask = {
            xPosition: booleanTable.xPosition,
            yPosition: booleanTable.yPosition,
            width: booleanTable.width,
            height: booleanTable.height,
            pixels: []
        };
        for (const row of booleanTable.data) {
            for (const pixel of row) {
                for (var i = 0; i < 4; i++) {
                    if (pixel)
                        mask.pixels.push(255);
                    else
                        mask.pixels.push(0);
                }
            }
        }
        return mask;
    }
    static queuedSurroundingFill(area, insidePoints, imageWidth, imageHeight) {
        const queue = insidePoints;
        while (queue.length > 0) {
            const point = queue.pop();
            if (point.y >= area.length || point.y < 0)
                continue;
            if (point.x >= area[point.y].length || point.x < 0)
                continue;
            if (!area[point.y][point.x]) {
                area[point.y][point.x] = true;
                const surrounding = this.getSurrounding(point, imageWidth, imageHeight);
                for (const p of surrounding) {
                    if (p.y >= area.length || p.y < 0)
                        continue;
                    if (p.x >= area[p.y].length || p.x < 0)
                        continue;
                    if (!area[p.y][p.x])
                        queue.push(p);
                }
            }
        }
    }
    static getSurrounding(point, maxWidth, maxHeight) {
        const x = point.x;
        const y = point.y;
        const surrounding = [];
        if (x - 1 > 0 && y - 1 > 0)
            surrounding.push({ x: point.x - 1, y: point.y - 1 });
        if (y - 1 > 0)
            surrounding.push({ x: point.x, y: point.y - 1 });
        if (x + 1 < maxWidth && y - 1 > 0)
            surrounding.push({ x: point.x + 1, y: point.y - 1 });
        if (x + 1 < maxWidth)
            surrounding.push({ x: point.x + 1, y: point.y });
        if (x + 1 < maxWidth && y + 1 < maxHeight)
            surrounding.push({ x: point.x + 1, y: point.y + 1 });
        if (y + 1 < maxHeight)
            surrounding.push({ x: point.x, y: point.y + 1 });
        if (x - 1 > 0 && y + 1 < maxHeight)
            surrounding.push({ x: point.x - 1, y: point.y - 1 });
        if (x - 1 > 0)
            surrounding.push({ x: point.x - 1, y: point.y - 1 });
        return surrounding;
    }
    static getSurroundingNonDiagonal(point, maxWidth, maxHeight) {
        const x = point.x;
        const y = point.y;
        const surrounding = [];
        if (y - 1 > 0)
            surrounding.push({ x: point.x, y: point.y - 1 });
        if (x + 1 < maxWidth)
            surrounding.push({ x: point.x + 1, y: point.y });
        if (y + 1 < maxHeight)
            surrounding.push({ x: point.x, y: point.y + 1 });
        if (x - 1 > 0)
            surrounding.push({ x: point.x - 1, y: point.y - 1 });
        return surrounding;
    }
}
exports.FloodFill = FloodFill;
