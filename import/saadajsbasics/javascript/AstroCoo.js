/**
 * @preserve LICENSE
 * 
 * Copyright (c) 2017 Laurent Michel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. 
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE. 
**/

/**
 * A few geometric functions necessary to deal with the poles and the shtitling. 
 * These functions make use of the Coo class defined with the AladinLite core 
 * (http://aladin.u-strasbg.fr/AladinLite/)
 * 
 * Author:  laurent.michel@astro.unistra.fr
 */
BasicGeometry = function () {
    /**
     * Nodes are 2 arrays with 2 elements
     * Returns a distance ranging from 0 to 180deg
     */
    function distanceBetweenNodes(node1, node2){
    	var coo1 = new Coo(node1[0], node1[1]);
    	var coo2 = new Coo(node2[0], node2[1]);
    	return coo1.distance(coo2)
    }
    /**
     * Return the geometric definition of the view enclosing the skyPositions polygon
     * skyPositions: Array of points: [[ra,dec], ...]
     * return : {center: {ra: .., dec: ..}, size: ..} size is in deg
     */
    function getEnclosingView(skyPositions) {
		maxSize=0;
		var coo = new Coo();
		var raMin=360;
		var raMax=0;
		var decMin=+90
		var decMax=-90;
		/*
		 * Take the the biggest distance between 2 vertices as polygon size
		 * 
		 */
		for( var node1=0 ; node1<skyPositions.length ; node1++) {
			posNode1 = skyPositions[node1];
			ra1 = posNode1[0];
			dec1 = posNode1[1];
			if( ra1 > raMax) raMax = ra1;
			if( ra1 < raMin) raMin = ra1;
			if( dec1 > decMax) decMax = dec1;
			if( dec1 < decMin) decMin = dec1;

			for( var node2=skyPositions.length/2 ; node2<skyPositions.length ; node2++) {
				posNode2 = skyPositions[Math.floor(node2)];
				ra2 = posNode2[0];
				dec2 = posNode2[1];
				if( maxSize < (d = BasicGeometry.distanceBetweenNodes(posNode1, posNode2))){
					maxSize = d;
				}
			}
		}
		/*
		 * Transform the polygon a an array of Coo instance
		 * This will made the further computation easier
		 */
		var vertices = [];
		for( var node1=0 ; node1<(skyPositions.length - 1) ; node1++) {
			posNode1 = skyPositions[node1];
			vertices.push(new Coo(posNode1[0], posNode1[1]));
		}
		/*
		 * Compute the average position as rough view center 
		 */
		var sumX=0 , sumY=0, sumZ=0;
		/*
		 * Compute first the average of the Euclidian coordinates
		 */
		for( var node1=0 ; node1<vertices.length  ; node1++) {
			var vertex = vertices[node1];
			sumX += vertex.x;
			sumY += vertex.y;
			sumZ += vertex.z;
		}
		sumX = sumX/vertices.length;
		sumY = sumY/vertices.length;
		sumZ = sumZ/vertices.length;
		/*
		 * The normalize to R=1 
		 */
		var ratio = 1/Math.sqrt(sumX*sumX + sumY*sumY +sumZ*sumZ);
		sumX *= ratio;
		sumY *= ratio;
		sumZ *= ratio;
		/*
		 * Convert Euclidian to sky coords 
		 */
		var coo = new Coo();
		coo.x = sumX;
		coo.y = sumY;
		coo.z = sumZ;
		coo.computeLonLat();
		/*
		 * Adjust the view to make sure that all vertices are visible 
		 */
		var deltaRA = 0;
		var deltaDEC = 0;
		for( var node1=0 ; node1<vertices.length  ; node1++) {
			var vertex = vertices[node1];

			var left = [coo.lon  - maxSize/2, vertex.lat];
			if( left[0] < 0 ) left[0]  = 360 + left[0];
			if( left[0] > 360) left[0] = left[0] -360;
			
			var right = [coo.lon  + maxSize/2, vertex.lat]
			if( right[0] < 0 ) right[0]  = 360 + right[0];
			if( right[0] > 360) right[0] = right[0] -360;
			
			var rightDistance = BasicGeometry.distanceBetweenNodes(right, [vertex.lon, vertex.lat])
			if( maxSize  < rightDistance) {
				deltaRA =rightDistance - maxSize;
			}
			var leftDistance = BasicGeometry.distanceBetweenNodes(left, [vertex.lon, vertex.lat])
			if( maxSize  < leftDistance) {
				deltaRA =leftDistance - maxSize;
			}

			
			var top = [vertex.lon, coo.lat  + maxSize/2];
			if( top[1] > 90 ) top[1]  = 180  - top[1];
			
			var bottom = [vertex.lon, coo.lat  - maxSize/2];
			if( bottom[1] < -90 ) bottom[1]  = -180 + bottom[1];
			
			if( vertex.lat < bottom[1] ){
				deltaDEC = bottom[1] -  vertex.lat;
			} else if( vertex.lat > top[1] ){
				deltaDEC = vertex.lat - top[1];
			}			
		}
    	return {center: {ra: (coo.lon - deltaRA), dec: (coo.lat - deltaDEC)}, size: maxSize};
    }
    
	var pblc = {};
	pblc.distanceBetweenNodes = distanceBetweenNodes;
	pblc.getEnclosingView = getEnclosingView;
	return pblc;
}();
