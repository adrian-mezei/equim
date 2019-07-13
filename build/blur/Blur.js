"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Jimp = require("jimp");
const Converter_1 = require("../util/Converter");
const GreatCircle_1 = require("./GreatCircle");
const EdgeDetector_1 = require("./EdgeDetector");
const FloodFill_1 = require("./FloodFill");
const ClosedLineConnector_1 = require("./ClosedLineConnector");
class Blur {
    blurFull(image, blurIntensity) {
        image.blur(blurIntensity);
    }
    blurEquirectRectangle(image, hotspotsArray, blurIntensity) {
        const masks = [];
        for (const hotspots of hotspotsArray) {
            if (hotspots.length !== 4)
                throw new Error('Only quadrilaterals (4 hotspots) are accepted.');
            const points = new Converter_1.Converter(image.getWidth(), image.getHeight()).convertToXYs(hotspots);
            const gc = new GreatCircle_1.GreatCircle(image.getWidth(), image.getHeight());
            var segmentedBoundary = gc.segmentAlongGreatCircles(points);
            const chunks = new EdgeDetector_1.EdgeDetector(image.getWidth(), image.getHeight()).detectEdges(segmentedBoundary, 0.5);
            masks.push(...this.chunksToMasks(image, points[0], points[2], chunks));
        }
        for (let i = 0; i < masks.length; i++)
            this.blurAtMask(image, masks[i], blurIntensity);
    }
    chunksToMasks(image, hotspot1, hotspot2, chunks) {
        const gc = new GreatCircle_1.GreatCircle(image.getWidth(), image.getHeight());
        const masks = [];
        for (let chunk of chunks) {
            var closedBoundary = ClosedLineConnector_1.ClosedLineConnector.connectWithClosedLines(chunk);
            const insidePoints = [];
            for (let i = 0; i < 1; i += 0.1)
                insidePoints.push(gc.pointBetweenTwoPoints(hotspot1, hotspot2, i));
            masks.push(FloodFill_1.FloodFill.fillArea(closedBoundary, insidePoints, image.getWidth(), image.getHeight()));
        }
        return masks;
    }
    blurAtMask(image, mask, blurIntensity) {
        let jimp = new Jimp(mask.width, mask.height, 0);
        jimp.bitmap.data = new Buffer(mask.pixels);
        const bluredPart = image
            .clone()
            .crop(mask.xPosition, mask.yPosition, mask.width, mask.height)
            .blur(blurIntensity)
            .mask(jimp, 0, 0);
        image
            .composite(bluredPart, mask.xPosition, mask.yPosition);
    }
}
exports.Blur = Blur;
