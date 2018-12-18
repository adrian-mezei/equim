import Jimp = require('jimp');

export class Blur {

    private circleMaskPath: string;
    private squareMaskPath: string;

    constructor(circleMaskPath: string, squareMaskPath: string){
        this.circleMaskPath = circleMaskPath;
        this.squareMaskPath = squareMaskPath;
    }

    public blurFull(imagePath: string, blurIntensity: number, targetPath: string) {
        Jimp.read(imagePath).then(image => {
            image
                .blur(blurIntensity)
                .write(targetPath);
        });
    }

    public blurRectangular(imagePath: string, xCenter: number, yCenter: number, width: number, height: number, rotDeg: number, blurIntensity: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        this.blurMasked(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, this.squareMaskPath, callback);
        /*const a = rotDeg / 180 * Math.PI;
        const x = xCenter;
        const y = yCenter;
        const w = width;
        const h = height;

        Jimp.read(imagePath).then(image => {
            const imageHeight = image.getHeight();
            const imageWidth = image.getWidth();
            const rotExtraWidth = imageHeight*Math.sin(a);
            const rotExtraHeigth = imageWidth*Math.sin(a);

            const Ax = x - w/2*Math.cos(a) - h/2*Math.sin(a);
            const Ay = y + w/2*Math.sin(a) - h/2*Math.cos(a);
            const newX = rotExtraWidth + Ax*Math.cos(a) - Ay*Math.sin(a);
            const newY = Ax*Math.sin(a) + Ay*Math.cos(a);

            image
                .rotate(-rotDeg)
                .composite(image.clone().crop(newX, newY, w, h).blur(blurIntensity), newX, newY)
                .rotate(rotDeg)
                .crop(rotExtraWidth, rotExtraHeigth, imageWidth, imageHeight)
                .write(targetPath);
        });*/
    }

    public blurCircle(imagePath: string, xCenter: number, yCenter: number, radius: number, blurIntensity: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        this.blurEllipse(imagePath, xCenter, yCenter, radius, radius, 0, blurIntensity, callback);
    }

    public getBase64(image: Jimp.Jimp, callback: (err: Error | null, imageBase64: string) => void): void {
        image.getBase64(image.getMIME(), callback);
    }

    public writeToFile(image: Jimp.Jimp, path: string, callback: (err: Error | null) => void): void {
        image.write(path, (err) => {
            callback(err);
        });
    }

    public blurEllipse(imagePath: string, xCenter: number, yCenter: number, width: number, height: number, rotDeg: number, blurIntensity: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        this.blurMasked(imagePath, xCenter, yCenter, width, height, rotDeg, blurIntensity, this.circleMaskPath, callback);
    }

    public blurMasked(imagePath: string, xCenter: number, yCenter: number, width: number, height: number, rotDeg: number, blurIntensity: number, maskPath: string, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        console.log('blurMasked');
        Jimp.read(imagePath).then(image => {
            console.log('read');
            //Jimp.read(maskPath).then(mask => {
            this.createRoundMask(image.getWidth(), image.getHeight(), xCenter, yCenter, width, (err, resizedMaskData) => {
                console.log('createRoundMask');
                if(err || !resizedMaskData) return callback(err);

                const x = resizedMaskData.x;
                const y = resizedMaskData.y;
                const resizedMask = resizedMaskData.mask;
                
                //return callback(undefined, resizedMask);

                // resize mask to the required width and height
                /*const resizedMask: Jimp = mask
                    .resize(width, height)
                    .rotate(rotDeg);*/
                
                //const resizedMask = this.createRoundMask(image.getWidth(), image.getHeight(), xCenter, yCenter, width);

                // calculate the top left corner of the area to be blured
                //const x = xCenter - resizedMask.getWidth()/2;
                //let y = yCenter - resizedMask.getHeight()/2;

                // if the top left corner is above or below the image, then crop the mask
                /*if(y < 0) {
                    resizedMask.crop(0, -y, resizedMask.getWidth(), resizedMask.getHeight() + y);
                    y = 0;
                    height += y;
                }
                if(y + height > image.getHeight()) {
                    height = image.getHeight() - y;
                    resizedMask.crop(0, 0, resizedMask.getWidth(), image.getHeight() - y);
                }*/

                
                // create the blured part
                const bluredPart = image
                    .clone()
                    .crop(x, y, resizedMask.getWidth(), resizedMask.getHeight())
                    .blur(blurIntensity)
                    .mask(resizedMask, 0, 0);
                
                

                /*var arr = [...bluredPart.bitmap.data];
                for(let i = 0; i<arr.length; i++){
                    if(i%4==0) arr[i] = 35;
                    if(i%4==1) arr[i] = 141;
                    if(i%4==2) arr[i] = 165;
                    if(i%4===3) arr[i] = 255;
                    //else arr[i] = 0;
                }
                bluredPart.bitmap.data = new Buffer(arr);
                
                console.log(arr);
                console.log('Data:');
                console.log(bluredPart.bitmap.data.length);
                console.log('Width:');
                console.log(bluredPart.bitmap.width);
                console.log('Height:');
                console.log(bluredPart.bitmap.height);
*/
                //return  callback(undefined, bluredPart);
                
                // insert the blured part and pay attention to split it into two parts
                // if it extends over the left or right edge
                if(x < 0){
                    // extends over the left edge
                    const bluredPartLeft = bluredPart
                        .clone()
                        .crop(0, 0, -x, bluredPart.getHeight());

                    const bluredPartRight = bluredPart
                        .crop(-x, 0, bluredPart.getWidth() + x, bluredPart.getHeight());

                    image
                        .composite(bluredPartLeft, image.getWidth() + x, y)
                        .composite(bluredPartRight, 0, y);
                    
                } else if( x + bluredPart.getWidth() > image.getWidth()){
                    // extends over the right edge
                    const edge = image.getWidth() - x;
                    const bluredPartLeft = bluredPart
                        .clone()
                        .crop(0, 0, edge, bluredPart.getHeight());

                    const bluredPartRight = bluredPart
                        .crop(edge, 0, bluredPart.getWidth() - edge, bluredPart.getHeight());

                    image
                        .composite(bluredPartLeft, image.getWidth() - edge, y)
                        .composite(bluredPartRight, 0, y);
                    

                } else {
                    // the blured does not extend over any edge
                    image
                    .composite(bluredPart, x, y);
                }

                callback(undefined, image);
            });
        });
    }

    private createRoundMask(width: number, height: number, xCenter: number, yCenter: number, radius: number, callback: (err?: Error, data?: {x: number, y: number, mask: Jimp.Jimp}) => void): void {
        const maskLines = [];
        let maxMaskWidth = 0;
        let addHeight = 0;
        for(let yDistanceFromCircleCentre = radius; yDistanceFromCircleCentre > -radius; yDistanceFromCircleCentre--){
            let y = yCenter - yDistanceFromCircleCentre;
            if(y >= 0 && y < height){
                const lineHalfWidth = Math.sqrt(radius*radius - yDistanceFromCircleCentre*yDistanceFromCircleCentre); // Pythagorean
                const lineWidth = 2*lineHalfWidth; // this is to be equirectangularly projected
                
                const globeRadius = width/2/Math.PI/**2/Math.sqrt(3)*/;
                const distanceFromEquatorOnGlobe = Math.abs(height/2 - y);
                const angleOfHeightOnGlobe = Math.PI*2*(distanceFromEquatorOnGlobe/(2*globeRadius*Math.PI));
                //const angleOfHeightOnGlobe = Math.asin(distanceFromEquatorOnGlobe/globeRadius);

                const globeDistantRadius = Math.cos(angleOfHeightOnGlobe)*globeRadius;
                const globeDistantPerimeter = 2*globeDistantRadius*Math.PI;

                const scaleFactor = width/globeDistantPerimeter;

                const scaledLineWidth = (lineWidth * scaleFactor > width) ? width : lineWidth * scaleFactor;
                const roundedScaledLineWidth = Math.round(scaledLineWidth);
                
                //const addHeightNew = Math.sin(angleOfHeightOnGlobe)*globeRadius;
                //if(addHeight === 0 || Math.round(addHeightNew) !== Math.round(addHeight)){
                //    addHeight = addHeightNew;
                    maskLines.push(roundedScaledLineWidth);   
                    if(roundedScaledLineWidth > maxMaskWidth) maxMaskWidth = roundedScaledLineWidth;
                //}
            }
        }

        const data: number[] = [];
        for(let i = 0; i < maskLines.length*maxMaskWidth; i++){
            const row = Math.floor(i / maxMaskWidth);
            const col = i % maxMaskWidth;
            
            const lineWidth = maskLines[row];
            const begin = (maxMaskWidth - lineWidth)/2;
            const pixelValue = (col < begin || col > begin + lineWidth) ? 0 : 255;
            data.push(pixelValue); // r
            data.push(pixelValue); // g
            data.push(pixelValue); // b
            data.push(255); // a
        }

        new Jimp(maxMaskWidth, maskLines.length, 0, (err, jimp) => {
            if(err || !jimp) return callback(err?err:undefined);

            jimp.bitmap.data = new Buffer(data);

            callback(undefined, {x: xCenter - maxMaskWidth/2, y: (yCenter - radius > 0) ? yCenter - radius : 0, mask: jimp});
        });
        
    }

    public drawX(imagePath: string, x: number, y: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        Jimp.read(imagePath).then(image => {
            
            this.drawOneX(x, y, image);
            const radius = 100;
            for(var i=0;i<2*Math.PI; i+=Math.PI/8){
                this.drawOneX(x+Math.cos(i)*radius, y+Math.sin(i)*radius, image);
            }

            const latLong = this.convertToYawPitch(x, y);
            console.log('X: ' + x + '  Y: ' + y);
            console.log('Yaw: ' + latLong.yaw + '  Pitch: ' + latLong.pitch);
            
            callback(undefined, image);
        });
    };

    public drawHotSpots(imagePath: string, hotSpots: {yaw: number, pitch: number}[], callback: (err?: Error, image?: Jimp.Jimp) => void) {
        Jimp.read(imagePath).then(image => {
            const hotSpotsXY: {x: number, y: number}[] = [];
            for(const hotSpot of hotSpots){
                const hotSpotXY = this.convertToXY(hotSpot.yaw, hotSpot.pitch);
                hotSpotsXY.push(hotSpotXY);
            }

            for(const hotSpotXY of hotSpotsXY){
                this.drawOneX(hotSpotXY.x, hotSpotXY.y, image);
            }

            for(var i=0; i<hotSpots.length; i++){
                const hotSpot1 = hotSpots[i];
                const hotSpot2 = hotSpots[(i+1) % hotSpots.length];

                console.log('hotSpot1: ' + JSON.stringify(hotSpot1));
                console.log('hotSpot2: ' + JSON.stringify(hotSpot2));
                this.greatCircleConnect(image, hotSpot1, hotSpot2);
            }
            
            callback(undefined, image);
            // this.drawEquirectRectImage(image, hotSpots[0].yaw, hotSpots[2].yaw, hotSpots[2].pitch, hotSpots[0].pitch, callback);
        });
    }

    private greatCircleConnect(image: Jimp, p1: {yaw: number, pitch: number}, p2: {yaw: number, pitch: number}){
        var a, b, d, x, y, z, ix, iy;

        var ax = (p1.yaw*3.1415)/180.0;
        var ay = (p1.pitch*3.1415)/180.0;
        var bx = (p2.yaw*3.1415)/180.0;
        var by = (p2.pitch*3.1415)/180.0;

        d=2*Math.asin(
            Math.sqrt(
                Math.sin((ay-by)/2) * Math.sin((ay-by)/2) + 
                Math.cos(ay) * Math.cos(by) * Math.sin((ax-bx)/2) * Math.sin((ax-bx)/2)
            )
        );

        for(var i=0; i<=1; i+=0.01){
            a=Math.sin((1-i)*d)/Math.sin(d);
            b=Math.sin(i*d)/Math.sin(d);
            x = a*Math.cos(ay)*Math.cos(ax) + b*Math.cos(by)*Math.cos(bx);
            y = a*Math.cos(ay)*Math.sin(ax) +  b*Math.cos(by)*Math.sin(bx);
            z = a*Math.sin(ay)           +  b*Math.sin(by);

            iy=(Math.atan2(z,Math.sqrt(x*x+y*y))*180)/3.1415;
            ix=(Math.atan2(y,x)*180)/3.1415;

            const xy = this.convertToXY(ix, iy);
            //circleColor(screen, gpsatvaltasx(ix), gpsatvaltasy(iy), 1, 0xffffffff);
            this.drawOneX(xy.x, xy.y, image);
        }
    }

    public drawEquirectX(imagePath: string, yaw: number, pitch: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        Jimp.read(imagePath).then(image => {

            const coord = this.convertToXY(yaw, pitch);
            this.drawOneX(coord.x, coord.y, image);
            const radius = 100;
            const deg = radius/5;
            for(var i=0;i<2*Math.PI; i+=Math.PI/500){
                console.log(i);
                const co = this.convertToXY(yaw+Math.cos(i)*deg, pitch+Math.sin(i)*deg);
                this.drawOneX(co.x, co.y, image);
            }

            console.log('callback');
            callback(undefined, image);
        });
    };

    public drawEquirectRectImage(image: Jimp, yaw1: number, yaw2: number, pitch1: number, pitch2: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        const coord = this.convertToXY((yaw1+yaw2)/2, (pitch1+pitch2)/2);
        this.drawOneX(coord.x, coord.y, image);
        for(var i=yaw1;i<yaw2; i+=Math.abs(yaw1-yaw2)/100){
            console.log(i);
            let co = this.convertToXY(i, pitch1);
            this.drawOneX(co.x, co.y, image);
            co = this.convertToXY(i, pitch2);
            this.drawOneX(co.x, co.y, image);
        }

        for(var i=pitch1;i<pitch2; i+=Math.abs(pitch1-pitch2)/100){
            console.log(i);
            let co = this.convertToXY(yaw1, i);
            this.drawOneX(co.x, co.y, image);
            co = this.convertToXY(yaw2, i);
            this.drawOneX(co.x, co.y, image);
        }

        console.log('callback');
        callback(undefined, image);
    };

    public drawEquirectRect(imagePath: string, yaw1: number, yaw2: number, pitch1: number, pitch2: number, callback: (err?: Error, image?: Jimp.Jimp) => void) {
        Jimp.read(imagePath).then(image => {
            this.drawEquirectRectImage(image, yaw1, yaw2, pitch1, pitch2, callback);
        });
    };

    private drawOneX(x: number, y: number, image: Jimp){
        x = Math.round(x);
        y = Math.round(y);
        const index = image.getWidth()*4*(y-1) + x*4;
            
        for(let i=-10; i<10; i++){
            // horizontal line
            image.bitmap.data[index + i*4] = 255;

            // vertical line
            image.bitmap.data[index + i*4*image.getWidth()] = 255;
        }
    }

    private convertToXY(yaw: number, pitch: number): {x: number, y: number} {
        const imageWidth = 4000;
        const imageHeight = 2000;

        return {
            x: (yaw+180)/360 * imageWidth,
            y: imageHeight/2 - (pitch/180)*imageHeight
        }
    }

    private convertToYawPitch(x: number, y: number): {yaw: number, pitch: number} {
        const imageWidth = 4000;
        const imageHeight = 2000;

        return {
            yaw: (x/imageWidth)*360 - 180,
            pitch: (imageHeight/2 - y)/imageHeight * 180
        }
    }
}