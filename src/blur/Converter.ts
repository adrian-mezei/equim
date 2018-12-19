import { Hotspot } from '../model/Hotspot';
import { Point } from '../model/Point';

export class Converter {

    private imageWidth = 4000;
    private imageHeight = 2000;

    constructor(imageWidth: number, imageHeight: number){
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
    }

    public convertToXY(h: Hotspot): Point {
        return {
            x: (h.yaw+180)/360 * this.imageWidth,
            y: this.imageHeight/2 - (h.pitch/180)*this.imageHeight
        }
    }
    
    public convertToXYs(hotspots: Hotspot[]): Point[] {
        const points: Point[] = [];
        for(const h of hotspots){
            points.push(this.convertToXY(h));
        }
        return points;
    }

    public convertToYawPitch(p: Point): Hotspot {
        return {
            yaw: (p.x/this.imageWidth)*360 - 180,
            pitch: (this.imageHeight/2 - p.y)/this.imageHeight * 180
        }
    }

    public convertToYawPitchs(points: Point[]): Hotspot[] {
        const hotspots: Hotspot[] = [];
        for(const p of points){
            hotspots.push(this.convertToYawPitch(p));
        }
        return hotspots;
    }
}