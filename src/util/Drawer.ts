import Jimp = require('jimp');
import { Point } from '../model/Point';
import { Rgba } from '../model/Rgba';
import { Hotspot } from '../model/Hotspot';
import { Converter } from './Converter';
import { GreatCircle } from '../blur/GreatCircle';
import { ClosedLineConnector } from '../blur/ClosedLineConnector';
import { EdgeDetector } from '../blur/EdgeDetector';

export class Drawer {

    
    public static drawCircledX(image: Jimp, point: Point) {
        this.drawX(image, point);
        const radius = 100;
        for(var i=0;i<2*Math.PI; i+=Math.PI/8){
            const p = {
                x: point.x+Math.cos(i)*radius,
                y: point.y+Math.sin(i)*radius
            };

            this.drawX(image, p);
        }
    };

    public static drawCircledXs(image: Jimp, points: Point[]) {
        for(const point of points){
            this.drawCircledX(image, point);
        }
    };

    public static drawX(image: Jimp, p: Point, size?: number, color?: Rgba){
        const x = Math.round(p.x);
        const y = Math.round(p.y);
        const index = image.getWidth()*4*(y-1) + x*4;
            
        if(!size) size = 10;
        if(!color) color = {r: 255, g: 0, b: 0, a: 255};
        for(let i=-size+1; i<size; i++){
            // horizontal line
            image.bitmap.data[index + i*4 + 0] = color.r;
            image.bitmap.data[index + i*4 + 1] = color.g;
            image.bitmap.data[index + i*4 + 2] = color.b;
            image.bitmap.data[index + i*4 + 3] = color.a;

            // vertical line
            image.bitmap.data[index + i*4*image.getWidth() + 0] = color.r;
            image.bitmap.data[index + i*4*image.getWidth() + 1] = color.g;
            image.bitmap.data[index + i*4*image.getWidth() + 2] = color.b;
            image.bitmap.data[index + i*4*image.getWidth() + 3] = color.a;
        }
    }

    public static drawXs(image: Jimp, points: Point[], size?: number, color?: Rgba){
        for(const p of points){
            this.drawX(image, p, size, color);
        }
    }

    public static drawEquirectX(image: Jimp, hotspot: Hotspot) {
        const converter = new Converter(image.getWidth(), image.getHeight());
        const coord = converter.convertToXY(hotspot);

        Drawer.drawX(image, coord);

        const radius = 100;
        const deg = radius/5;
        for(var i=0;i<2*Math.PI; i+=Math.PI/500){
            const co = converter.convertToXY({yaw: hotspot.yaw+Math.cos(i)*deg, pitch: hotspot.pitch+Math.sin(i)*deg});
            Drawer.drawX(image, co);
        }
    };

    public static drawHotspots(image: Jimp, hotspots: Hotspot[]) {
        const points: Point[] = new Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        
        Drawer.drawXs(image, points, 20, {r: 255, g: 0, b: 0, a: 255});
    }

    public static drawCircledHotspots(image: Jimp, hotspots: Hotspot[]) {
        const points: Point[] = new Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        
        Drawer.drawCircledXs(image, points);
    }

    public static drawEquirectRectangle(image: Jimp, hotspots: Hotspot[]) {
        const points: Point[] = new Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        
        var segmentedBoundary = new GreatCircle(image.getWidth(), image.getHeight()).segmentAlongGreatCircles(points); // Segment the lines of consecutive hotspots along the Great Circles
        Drawer.drawXs(image, segmentedBoundary, 1, {r: 0, g: 255, b: 0, a: 255});
    }

    public static drawEquirectRectangleClosed(image: Jimp, hotspots: Hotspot[]) {
        const points: Point[] = new Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
        
        var segmentedBoundary = new GreatCircle(image.getWidth(), image.getHeight()).segmentAlongGreatCircles(points); // Segment the lines of consecutive hotspots along the Great Circles
        EdgeDetector.detectEdges(segmentedBoundary, 0.5);
        var closedBoundary = ClosedLineConnector.connectWithClosedLines(segmentedBoundary); // Connect the segmented boundary to a closed curve
        
        Drawer.drawXs(image, closedBoundary, 1, {r: 0, g: 0, b: 255, a: 255});
    }
}