"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Jimp = require("jimp");
const Converter_1 = require("../util/Converter");
const GreatCircle_1 = require("./GreatCircle");
const EdgeDetector_1 = require("./EdgeDetector");
const FloodFill_1 = require("./FloodFill");
const ClosedLineConnector_1 = require("./ClosedLineConnector");
class Blur {
    /**
     * Blurs the whole image with fast blur.
     *
     * @param image The image to blure.
     * @param blurIntensity The radius of the blur color averaging.
     */
    blurFull(image, blurIntensity) {
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
    blurEquirectRectangle(image, hotspotsArray, blurIntensity) {
        const masks = [];
        for (const hotspots of hotspotsArray) {
            if (hotspots.length !== 4)
                throw new Error('Only quadrilaterals (4 hotspots) are accepted.');
            /*for(let i=0; i<hotspots.length; i++){
                if(hotspots[(i+1)%hotspots.length].yaw - hotspots[i].yaw >= 180) return callback(new Error('All consecutive yaws must be less than 180 degrees from each other.'));
            }*/
            // check that no two points are too close to each other
            //if(!noTwoHotspotsAreTooClose(hotspots, 0.1)) return callback(new Error('There are hotspots that are too close to each other.'));
            // check that the provided point distances cannot be larger than
            //     the half length of the great circle, otherwise the other
            //     half of the Great circle is drawn, so in this case, a further point must be added
            //     (greatCircle with parameter 1.5?)
            const points = new Converter_1.Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
            const gc = new GreatCircle_1.GreatCircle(image.getWidth(), image.getHeight());
            //let time = new Date();
            var segmentedBoundary = gc.segmentAlongGreatCircles(points); // Segment the lines of consecutive hotspots along the Great Circles
            //console.log('    Segmentation along Great Circle: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
            const chunks = EdgeDetector_1.EdgeDetector.detectEdges(segmentedBoundary, 0.5); // The corners of the image are added if needed
            //console.log('    Extension with edges: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
            masks.push(...this.chunksToMasks(image, chunks));
        }
        // TODO do the blurs in one step
        for (let i = 0; i < masks.length; i++)
            this.blurAtMask(image, masks[i], blurIntensity);
        //console.log('    Jimp blur: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
    }
    chunksToMasks(image, chunks) {
        const gc = new GreatCircle_1.GreatCircle(image.getWidth(), image.getHeight());
        const masks = [];
        for (let chunk of chunks) {
            var closedBoundary = ClosedLineConnector_1.ClosedLineConnector.connectWithClosedLines(chunk); // Connect the segmented boundaries to closed curves
            //console.log('    Closure of boundaries: ' + (new Date().getTime() - time.getTime())/1000 + 's'); time = new Date();
            // Calculate a point inside the boundary
            const pointAtHalfDiagonal = closedBoundary[Math.round(closedBoundary.length / 2)];
            const insidePoint = gc.pointBetweenTwoPoints(closedBoundary[0], pointAtHalfDiagonal, 0.5);
            masks.push(FloodFill_1.FloodFill.fillArea(closedBoundary, insidePoint, image.getWidth(), image.getHeight())); // Flood fill from the inside point
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
    blurAtMask(image, mask, blurIntensity) {
        let time = new Date();
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
exports.Blur = Blur;
