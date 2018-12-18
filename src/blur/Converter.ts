import { Hotspot } from '../model/Hotspot';
import { Point } from '../model/Point';

export class Converter {

    private static imageWidth = 4000;
    private static imageHeight = 2000;

    public static convertToXY(h: Hotspot): Point {
        return {
            x: (h.yaw+180)/360 * this.imageWidth,
            y: this.imageHeight/2 - (h.pitch/180)*this.imageHeight
        }
    }
    
    public static convertToXYs(hotspots: Hotspot[]): Point[] {
        const points: Point[] = [];
        for(const h of hotspots){
            points.push(this.convertToXY(h));
        }
        return points;
    }

    public static convertToYawPitch(p: Point): Hotspot {
        return {
            yaw: (p.x/this.imageWidth)*360 - 180,
            pitch: (this.imageHeight/2 - p.y)/this.imageHeight * 180
        }
    }

    public static convertToYawPitchs(points: Point[]): Hotspot[] {
        const hotspots: Hotspot[] = [];
        for(const p of points){
            hotspots.push(this.convertToYawPitch(p));
        }
        return hotspots;
    }
}