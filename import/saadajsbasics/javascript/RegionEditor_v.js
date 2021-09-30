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
 * Manager of the view of the region editor
 * 
 * parentDivId: if of the host DIV
 * Handler: called when the contour is accepted
 * editionFrame{center {ra, dec} size} : Fied of viw where the user is supposed to draw
 * Author Gerardo Irvin Campos yah
 * Contact laurent.michel@astro.unistra.fr
 */ 
function RegionEditor_mVc(parentDivId, handler, editionFrame){
	this.parentDivId = parentDivId;
	this.drawCanvas = null; // canvas where the polygon is drawn
	this.drawContext = null;
	this.lineCanvas = null; // canvas where the moving lines are drawn
	this.lineContext = null;
	this.controller = null;
	this.editationFrame = editionFrame;
	this.editationFrameOverlay = null;
	this.clientHandler = handler; // can be null
} 

RegionEditor_mVc.prototype = {
		init: function (data){
			// création instance d'Aladin lite
			$('#' + this.parentDivId).append('<div id="' + this.parentDivId + '_aladin" style="width: 390px; height: 390px;"></div><div id="' + this.parentDivId + '_button"></div>');
				this.aladin = $.aladin('#' + this.parentDivId + '_aladin'
					, {showControl: true, 
				      cooFrame: "ICRS", 
				      survey: "P/DSS2/color", 
				      showFullscreenControl: false, 
				      showFrame: false, 
				      showGotoControl: false});
			this.aladin.setImageSurvey("P/DSS2/color");
			
			this.parentDiv = this.aladin.getParentDiv();
			$('#' + this.parentDivId).css("position", "relative");
			// création du canvas pour éditeur régions
			/*
			 * Be cautious: the canvas context must be taken before the canvas is appended to the parent div, otherwise the geometry is wrong. 
			 */
			this.lineCanvas = $("<canvas id='RegionCanvasTemp' class='editor-canvas'></canvas>");
			this.lineCanvas[0].width = this.parentDiv.width();
			this.lineCanvas[0].height = this.parentDiv.height();
			this.lineContext = this.lineCanvas[0].getContext('2d');	        
			this.parentDiv.append(this.lineCanvas);
			this.lineCanvas.css('z-index', '100');
			this.lineCanvas.css('position', 'absolute');
			this.lineCanvas.hide(); 
			/*
			 * Canvas pour les traces temporaires
			 */
			this.drawCanvas = $("<canvas id='RegionCanvas' class='editor-canvas'></canvas>");
			this.drawCanvas[0].width = this.parentDiv.width();
			this.drawCanvas[0].height = this.parentDiv.height();
			this.drawContext = this.drawCanvas[0].getContext('2d');
			this.parentDiv.append(this.drawCanvas);
			this.drawCanvas.css('z-index', '100');
			this.drawCanvas.css('position', 'absolute');
			this.drawCanvas.hide(); 
			/*
			 * Controler setup
			 */
			this.controller = new RegionEditor_mvC({"handler": this.clientHandler, "canvas": this.drawCanvas, "canvaso": this.lineCanvas, "aladin": this.aladin});
			/*
			 * The controller function is wrapped in a function in order to make it working in the context of the controller object
			 * and not of he HTML widget
			 */
			var that = this;
			this.drawCanvas[0].addEventListener('mousedown', function(event) {that.controller.mouseDown(event);}, false);
			this.drawCanvas[0].addEventListener('mousemove',  function(event) {that.controller.mouseMove(event);}, false);
			this.drawCanvas[0].addEventListener('mouseup', function(event) { that.controller.mouseUp(event);}, false);

			/*----crear botones con jquery----*/
			var divButtons = $("<div id='RegionButtons' style=' width:"+ this.parentDiv.width() +'px' +" ';' '><div/>").appendTo("#" + this.parentDivId + "_button");        
			divButtons.css('background', 'gray');//'height:' "+ 200 +'px' +"';'
			divButtons.css('height', '70px');

			this.browseBtn = $("<input type='button' id='edit' value='Browse' />");
			divButtons.append(this.browseBtn);
			this.browseBtn.css('margin-top','10px');
			this.browseBtn.css('margin-left','5px');
			this.browseBtn.attr('disabled', 'disabled');
			this.browseBtn.click(function() {        	 
				that.controller.recuperar();   
				that.setBrowseMode();
			});

			this.editBtn = $("<input type='button' id='edit' value='Edit' />");
			divButtons.append(this.editBtn);
			this.editBtn.css('margin-top','10px');
			this.editBtn.css('margin-left','5px');
			var that = this;
			this.editBtn.click(function() {        	 
				that.setEditMode();
				that.controller.DeleteOverlay()
				that.lineContext.clearRect(0, 0, that.lineCanvas[0].width, that.lineCanvas[0].height);            
				that.drawContext.clearRect(0, 0, that.drawCanvas[0].width, that.drawCanvas[0].height);
				that.controller.almacenar();	       
			});
			
			
			var btnVal = (this.editionFrame )? "Ed. Frame": "center";
			var btnTitle = (this.editionFrame )? "Center the view on the editable frame": "Center on the current drawing";

			this.centerBtn = $("<input type='button' id='center' value='" + btnVal + "' title='" + btnTitle + "'/>");
			divButtons.append(this.centerBtn);
			this.centerBtn.css('margin-top','10px');
			this.centerBtn.css('margin-left','5px');
			this.centerBtn.click(function() {     
				if( that.editionFrame ){
					that.setEditionFrame();
				} else {
					that.controller.PolygonCenter();
				}
			});

			this.effacerBtn = $("<input type='button' id='edit' value='clear' />");
			divButtons.append(this.effacerBtn);
			this.effacerBtn.css('margin-top','10px');
			this.effacerBtn.css('margin-left','5px');
			this.effacerBtn.click(function() {        	 
				that.controller.CleanPoligon();
			});
			this.setBrowseMode();

			var buttonSet = $("<input type='button' id='edit' value='Accept' />");
			divButtons.append(buttonSet);
			buttonSet.css('margin-top','10px');
			buttonSet.css('margin-left','5px');
			buttonSet.css('font-weight',' bold');
			buttonSet.click(function() {
				that.controller.recuperar();  
				that.setBrowseMode();
				that.controller.invokeHandler(true);
			});
			
			divButtons.append("<br><span style='font-size: small;'>&nbsp;Go To: </span>");
			this.posField = $("<input type='text' id='position' size=24 />");
			divButtons.append(this.posField);
			this.posField.css('margin-top','10px');
			this.posField.css('margin-left','5px');
			this.posField.keyup(function(e){
				if(e.keyCode == 13){
					var pos = $(this).val().replace(/:/g , " ");
					that.posField.val(pos);
					that.aladin.gotoObject(pos);
					$(this).val(pos);
					that.aladin.gotoObject(pos);
				}
			});
			if( this.editionFrame ){
				this.setEditionFrame(this.editionFrame);
				this.setEditMode();
			}
		},
		/**
		 * Operate the drawing removal from outside 
		 */
		clean: function() {
			this.controller.CleanPoligon();				
			this.setEditMode();
			this.controller.DeleteOverlay()
			this.lineContext.clearRect(0, 0, this.lineCanvas[0].width, this.lineCanvas[0].height);            
			this.drawContext.clearRect(0, 0, this.drawCanvas[0].width, this.drawCanvas[0].height);
			this.controller.almacenar();	       
			this.controller.recuperar();   
			this.setBrowseMode();
		},
		/**
		 * Draws the editable frame in blue and center the view on it 
		 */
		setEditionFrame: function(points){
			if( points){
				this.editionFrame = points;
			}
			var x = null;
			if( this.editionFrame ){
				var pts = [];
				/*
				 * Extract region or position from SaadaQL statement
				 */
				if (this.editionFrame.type == "array") {
					x = this.parseArrayPolygon(this.editionFrame.value);
				} else if (this.editionFrame.type == "soda") {
					x = this.parseSodaPolygon(this.editionFrame.value);
				} else {
					alert("Polygone format " + points.type + " not understood");
				}
				if( x ){
					var view = BasicGeometry.getEnclosingView(x);
					this.aladin.gotoPosition(view.center.ra, view.center.dec);
					this.aladin.setZoom( 1.2*view.size );
					if( this.editionFrameOverlay == null ) {
						this.editionFrameOverlay = A.graphicOverlay({color: 'blue', name: "Editable Frame"});
						this.aladin.addOverlay(this.editionFrameOverlay);
					}
					this.editionFrameOverlay.removeAll();	  
					this.editionFrameOverlay.addFootprints(A.polygon(x));
					$("#center").val("Ed. Frame").attr("title", "Center the view on the editable frame");
				} else {
					this.editionFrame = null;
					$("#center").val("Center").attr("title", "Center on the current drawing");
				}
			}
			/*
			 * Fix for the errors when we open a new region editor
			 */
			var that = this;
	           setTimeout(function() {
                   that.aladin.increaseZoom();
                   that.aladin.decreaseZoom();
                   }, 500);

		},
		/**
		 * Initalize the darw with the default parameter. If points contains a region, it is drawn, 
		 * if it just contain a position, AladinLite is centered on that position
		 * @param points  object denoting the initial value of the polygone : {type: ... value:} type is format of the 
		 * value (saadaql or array) and value is the data string wich will be parsed
		 */
		setInitialValue: function (points){
			/*
			 * Set the region passed by the client if it exists
			 */
			this.points = points;
			this.controller.CleanPoligon();
			if( this.points ){
				var pts = [];
				/*
				 * Extract region or position from SaadaQL statement
				 */
				if( this.points.type == "saadaql") {
					var s = /"(.*)"/.exec(this.points.value);
					if( s.length != 2 ) {
						alert(this.points.value + " does not look like a SaadaQL statment");
						return;
					} else {
						if( this.points.value.startsWith("isInRegion")) {
							var ss = s[1].split(/[\s,;]/);
							for( var i=0 ; i<ss.length ; i++ ) {
								pts.push(parseFloat(ss[i]));
							}
						} else {
							var pos = s[1].replace(/:/g , " ");
							this.posField.val(pos);
							this.aladin.setZoom(0.55);
							this.aladin.gotoObject(pos);
						}
					}
				} else if (this.points.type == "array") {
					pts = this.points.value;
				} else {
					alert("Polygone format " + points.type + " not understood");
					return;
				}

				this.setBrowseMode();
				this.controller.DeleteOverlay()
				this.controller.setPoligon(pts);
			}
			/*
			 * Fix for the errors when we open a new region editor
			 */
			var that = this;
	           setTimeout(function() {
                   that.aladin.increaseZoom();
                   that.aladin.decreaseZoom();
                   }, 500);

		},
		setBrowseMode: function() {
			this.editBtn.removeAttr('disabled');
			this.browseBtn.attr('disabled', 'disabled');   
			this.effacerBtn.attr('disabled', 'disabled');                      
			this.lineCanvas.hide();
			this.drawCanvas.hide();
		},
		setEditMode: function() {
			this.browseBtn.removeAttr('disabled');
			this.editBtn.attr('disabled', 'disabled');   
			this.effacerBtn.removeAttr('disabled');                
			this.lineCanvas.show();
			this.drawCanvas.show();
		},
		parseSodaPolygon: function (value){
		    var s = value.split(/\s+/);
			var x = null;
		    if( s[0].toUpperCase() != "POLYGON"){
				alert("Only SODA POLYGON are supported");
		    } else {
		    	s.shift();
				if( !s || (s.length%2) != 0 || s.length < 6 ) {
					alert("Even number of coordinates required (" + s.length + " values read)");
				} else {
					x = [];
					for(var i=0 ; i<(s.length/2) ; i++){
						x[x.length] = [parseFloat(s[2*i]), parseFloat(s[(2*i)+1])];
					}
					x.push(x[0]);
				}
		    }
		    return x;
		},
		parseArrayPolygon: function (value){
			var x = null;
			if( !value || (value.length%2) != 0 || value.length < 6 ) {
				alert("Even number of coordinates required");
			} else {
				x = [];
				for(var i=0 ; i<(value.length/2) ; i++){
					x[x.length] = [value[2*i], value[(2*i)+1]];
				}
				x.push(x[0]);
			}
		    return x;
		}

}

