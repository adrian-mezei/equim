import Jimp = require('jimp');
import { Point } from '../model/Point';
import { Hotspot } from '../model/Hotspot';
import { Converter } from '../util/Converter';
import { GreatCircle } from './GreatCircle';
import { EdgeDetector } from './EdgeDetector';
import { FloodFill } from './FloodFill';
import { ClosedLineConnector } from './ClosedLineConnector';
import { Mask } from '../model/Mask';

export class Blur {

    /**
     * Blurs the whole image with fast blur.
     * 
     * @param image The image to blure.
     * @param blurIntensity The radius of the blur color averaging.
     */
    public blurFull(image: Jimp, blurIntensity: number) {
        image.blur(blurIntensity);
    }

    /**
     * Blurs the rectangular part of the image that is described by four hotspots. The blured
     * part is rectangular from the point of view of the camera that is in the center of the sphere
     * of the equirectangularly projected space. The given four points divide the sphere into two 
     * parts. The one that contains the midpoint of the first and the third hotspost is bing blured.
     * 
     * @param image The image to blure at the rectangular part bounded by the hotspots.
     * @param hotspots The corners of the rectangle to be blured.
     * @param blurIntensity The radius of the blur color averaging.
     */
    public blurEquirectRectangle(image: Jimp, hotspotsArray: Hotspot[][], blurIntensity: number) {
        const masks: Mask[] = [];
        for(const hotspots of hotspotsArray){
            if(hotspots.length !== 4) throw new Error('Only quadrilaterals (4 hotspots) are accepted.');
            
            /*for(let i=0; i<hotspots.length; i++){
                if(hotspots[(i+1)%hotspots.length].yaw - hotspots[i].yaw >= 180) return callback(new Error('All consecutive yaws must be less than 180 degrees from each other.'));
            }*/
            
            // check that no two points are too close to each other
            //if(!noTwoHotspotsAreTooClose(hotspots, 0.1)) return callback(new Error('There are hotspots that are too close to each other.'));
            // check that the provided point distances cannot be larger than
            //     the half length of the great circle, otherwise the other
            //     half of the Great circle is drawn, so in this case, a further point must be added
            //     (greatCircle with parameter 1.5?)

            const points: Point[] = new Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
            const gc = new GreatCircle(image.getWidth(), image.getHeight());

            //let time = new Date();
            var segmentedBoundary = gc.segmentAlongGreatCircles(points); // Segment the lines of consecutive hotspots along the Great Circles
            //console.log('    Segmentation along Great Circle: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
            const chunks = new EdgeDetector(image.getWidth(), image.getHeight()).detectEdges(segmentedBoundary, 0.5); // The corners of the image are added if needed
            //console.log('    Extension with edges: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();

            masks.push(...this.chunksToMasks(image, points[0], points[2], chunks));
        }

        // TODO do the blurs in one step
        for(let i=0; i<masks.length; i++) this.blurAtMask(image, masks[i], blurIntensity);
        //console.log('    Jimp blur: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
    }

    private chunksToMasks(image: Jimp, hotspot1: Point, hotspot2: Point, chunks: Point[][]): Mask[] {
        const gc = new GreatCircle(image.getWidth(), image.getHeight());

        const masks: Mask[] = [];
        for(let chunk of chunks) {
            var closedBoundary = ClosedLineConnector.connectWithClosedLines(chunk); // Connect the segmented boundaries to closed curves
            //console.log('    Closure of boundaries: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
            
            // Calculate points inside the boundary
            const insidePoints = [];
            for(let i=0; i<1; i+=0.1)  insidePoints.push(gc.pointBetweenTwoPoints(hotspot1, hotspot2, i));
            
            masks.push(FloodFill.fillArea(closedBoundary, insidePoints, image.getWidth(), image.getHeight())); // Flood fill from the inside point
            //console.log('    Flood fill: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
        }
        return masks;
    }

    /**
     * Blurs the part of the image that is described by the mask.
     * 
     * @param image The image to blure at the mask.
     * @param mask The part of the provided image to blur.
     * @param blurIntensity The radius of the blur color averaging.
     */
    private blurAtMask(image: Jimp, mask: Mask, blurIntensity: number) {
        //let time = new Date();
        
        let jimp = new Jimp(mask.width, mask.height, 0);
        //console.log('        Jimp mask image creation: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
    
        jimp.bitmap.data = new Buffer(mask.pixels);
        //console.log('        Jimp mask image Buffer creation: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
    
        // create the blured part
        const bluredPart = image
            .clone()
            .crop(mask.xPosition, mask.yPosition, mask.width, mask.height)
            .blur(blurIntensity)
            .mask(jimp, 0, 0);
        //console.log('        Jimp image clone, crop, blur, mask: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
    
        // consider that the blured part does not extend over the edges
        image
            .composite(bluredPart, mask.xPosition, mask.yPosition);
        //console.log('        Jimp composite creation: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
    }

}