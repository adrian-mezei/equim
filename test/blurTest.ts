import { expect } from 'chai';
import { Blur } from './../src/blur/Blur';
import Jimp = require('jimp');

const blur = new Blur();

const imagePath = './res/equirectangularRED.jpg';

describe('Blur', function() {
    let image: Jimp;
    beforeEach(function(done) {
        this.timeout(3000);
        
        blur.read(imagePath, function(err, testImage){
            image = testImage;
            done();
        });
    });

    describe('of hotspotsBlessing', function() {
        it('should be executed without error under 500ms', function() {
            this.timeout(500);
            
            const hotSpotsBlessing = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: -14.4,   pitch: 70.2 },
                { yaw: 22.05,   pitch: 70.38 },
                { yaw: 22.68,   pitch: 63 },
                { yaw: -12.78,  pitch: 63 }
            ];

            blur.blurEquirectRectangle(image, [hotSpotsBlessing], 100);
        });
    });

    describe('of hotspotsTile', function() {
        it('should be executed without error under 600ms', function() {
            this.timeout(600);

            const hotSpotsTile = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: 6.5,   pitch: -64 },
                { yaw: 31.4,   pitch: -60.7},
                { yaw: 49.7,   pitch: -69.9 },
                { yaw: 10.8,  pitch: -76 }
            ];

            blur.blurEquirectRectangle(image, [hotSpotsTile], 100);
        });
    });
    
    describe('of hotspotsSmall', function() {
        it('should be executed without error under 250ms', function() {
            this.timeout(150);

            const hotSpotsSmall = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: 6,   pitch: -64 },
                { yaw: 15,   pitch: -60},
                { yaw: 20,   pitch: -66 },
                { yaw: 8,  pitch: -68 }
            ];

            blur.blurEquirectRectangle(image, [hotSpotsSmall], 100);
        });
    });

    describe('of hotspotsLarge', function() {
        it('should be executed without error under 14000ms', function() {
            this.timeout(14000);

            const hotSpotsLarge = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: -80,   pitch: 40 },
                { yaw: 80,   pitch: 40},
                { yaw: 80,   pitch: -40 },
                { yaw: -80,  pitch: -40 }
            ];

            blur.blurEquirectRectangle(image, [hotSpotsLarge], 100);
        });
    });

    describe('of hotspotsBottom', function() {
        it('should be executed without error under 5000ms', function() {
            this.timeout(5000);

            const hotSpotsBottom = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: -36,  pitch: -72.5 },
                { yaw: 50,   pitch: -69.7 },
                { yaw: 129.5,   pitch: -71.5},
                { yaw: -135,   pitch: -74.5 }
            ];

            blur.blurEquirectRectangle(image, [hotSpotsBottom], 100);
        });
    });

    describe('of hotspotsEdge', function() {
        it('should be executed without error under 13000ms', function() {
            this.timeout(13000);

            const hotSpotsEdge = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: 150,   pitch: 20 },
                { yaw: -150,   pitch: 20},
                { yaw: -150,   pitch: -20 },
                { yaw: 150,  pitch: -20 }
            ];

            blur.blurEquirectRectangle(image, [hotSpotsEdge], 100);
        });
    });

    describe('of hotspotsTie', function() {
        it('should throw an error', function() {
            this.timeout(10000);

            const hotSpotsTie = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: -80,   pitch: 20 },
                { yaw: 80,   pitch: -20 },
                { yaw: 80,   pitch: 20},
                { yaw: -80,  pitch: -20 }
            ];

            let fn = () => blur.blurEquirectRectangle(image, [hotSpotsTie], 100);
            expect(fn).to.throw();
        });
    });

    describe('of hotspotsConcave', function() {
        it('should throw an error', function() {
            this.timeout(10000);

            const hotSpotsConcave = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: -20,   pitch: 20 },
                { yaw: -10,   pitch: 10},
                { yaw: 20,   pitch: -20 },
                { yaw: -20,  pitch: -20 }
            ];

            let fn = () => blur.blurEquirectRectangle(image, [hotSpotsConcave], 100);
            expect(fn).to.throw();
        });
    });
    
    
    
    
});
