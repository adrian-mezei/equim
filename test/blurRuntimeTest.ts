import { expect, assert } from 'chai';
import { Equim } from '../src/Equim';
import Jimp = require('jimp');

const imagePath = './res/equirectangularRED.jpg';

describe('Blur', function() {
    let image: Jimp;
    beforeEach(function(done) {
        this.timeout(3000);
        
        Equim.read(imagePath, function(err, testImage){
            if(err || !testImage) return done(new Error('Image could not be loaded.'));
            
            image = testImage!;
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

            Equim.blur.blurEquirectRectangle(image, [hotSpotsBlessing], 100);
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

            Equim.blur.blurEquirectRectangle(image, [hotSpotsTile], 100);
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

            Equim.blur.blurEquirectRectangle(image, [hotSpotsSmall], 100);
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

            Equim.blur.blurEquirectRectangle(image, [hotSpotsLarge], 100);
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

            Equim.blur.blurEquirectRectangle(image, [hotSpotsBottom], 100);
        });
    });

    describe('of hotspotsEdge', function() {
        it('should be executed without error under 3000ms', function() {
            this.timeout(3000);

            const hotSpotsEdge = [
                // longitude(yaw) -180 - +180; latitude(pitch): -90 - +90
                { yaw: 150,   pitch: 20 },
                { yaw: -150,   pitch: 20},
                { yaw: -150,   pitch: -20 },
                { yaw: 150,  pitch: -20 }
            ];

            Equim.blur.blurEquirectRectangle(image, [hotSpotsEdge], 100);
        });
    });
});
