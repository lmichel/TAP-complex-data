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
 * Controller handling the user actions in connection with the model 
 * 
 *  params = {canvas,canvaso, aladin}
 * 
 * Author Gerardo Irvin Campos yah
 * Contact laurent.michel@astro.unistra.fr
 */
function  RegionEditor_mvC(params){
	this.polygonModel =  new RegionEditor_Mvc(params.canvas, params.canvaso, params.aladin);

	this.canvas = params.canvas; 	
	this.clientHandler = params.handler;
	this.startingNode= -1; 
	this.buttondown = false; 
	this.closed = false;	
	this.movestart = false;
	this.startdrag = false;
	this.drag = null;
	this.result = -1;
	this.stokeNode;
	var that = this;
}

RegionEditor_mvC.prototype = {
		getStatus: function() {
			 return "startingNode=" 
			        +this.startingNode + " buttondown=" 
			  		+ this.buttondown+ " closed=" 
			  		+ this.closed+ " movestart=" 
			  		+ this.movestart + " startdrag=" 
			  		+ this.startdrag + " drag=" 
			  		+ this.drag  + " result=" 
			  		+ this.result + " stokeNode=" 
			  		+ this.stokeNode
			  		;
		},
		/**
		 * TODO to be implemented
		 */
		checkPolygon : function(points) {
			return true;
		},
		/**
		 * 
		 */
		mouseDown : function(event) {
			var clickedNode = -1;
			var clickedSegment = -1;
			var x = parseInt(event.pageX) - parseInt( this.canvas.offset().left).toFixed(1);
			var y = parseInt(event.pageY) - parseInt( this.canvas.offset().top).toFixed(1);
					
			//pregunta si el pologono esta vacio
			if( this.polygonModel.isEmpty()) 
			{
				this.polygonModel.addNode(x,y);			 
			}
			//obtener segmento
			
			//comenzar el this.drag del nodo		
			else if(this.closed == true && (clickedNode = this.polygonModel.getNode(x,y)) != -1)
			{
				//console.log('start this.drag');
				//console.log('clickedNode: ' + clickedNode);
				this.result = this.polygonModel.getSegment(clickedNode);
				this.stokeNode = this.polygonModel.stokeNode(clickedNode);
				this.startdrag = true;		
				this.drag = clickedNode;
				this.startingNode = clickedNode;		
				this.canvas.css('cursor','move');
			}
			//pregunta si el espacio presionado es un nodo 
			else if((clickedNode = this.polygonModel.getNode(x,y)) != -1 )
			{
				//pregunta si es una extremidad
				if(this.polygonModel.isExtremity(clickedNode) /*poligono abierto*/) 
				{			
					//pregunta estas abierto
					if(this.closed == true)
					{
						this.startingNode = -1;
						this.buttondown = false;	
					}
					else
					{
						this.startingNode = clickedNode;
						this.buttondown = true;					
						this.closed = false;
					}
				}							
			} 		
			
			//saber si estoy sobre un segmento
			if(this.closed && clickedNode == -1)
			{						
				var node = this.polygonModel.GetNodelength();	
						
				var Segmentos = new Segment(node);	
				var option = Segmentos.IsCursorOn(x,y);
				
				if(option != undefined)
				{
					if(option.flag == "vertical")
					{
						//console.log("option: " + option.flag);
						this.polygonModel.addNode(x, y, option);
					}
					else if(option.flag == "horizontal")
					{
						//console.log("option: " + option.flag);
						this.polygonModel.addNode(x, y, option);
					}
					else if(option.flag == "distancia")
					{
						//console.log("option: " + option.flag);
						this.polygonModel.addNode(x, y, option);
					}
				}						
			
			}
			
		},
		/**
		 * 
		 */
		mouseMove : function(event) {
			var x = parseInt(event.pageX) - parseInt( this.canvas.offset().left).toFixed(1);
			var y = parseInt(event.pageY) - parseInt( this.canvas.offset().top).toFixed(1);
			//console.log("mouse move " + this.getStatus());
			//pregunta si el nodo fue presionado y si es un nodo
			if(this.buttondown == true  && this.startingNode != -1 )
			{
				//console.log ('this.drag');
				//console.log ('this.startingNode' + this.startingNode);
				this.movestart = true;
				this.polygonModel.drawHashline(this.startingNode,x,y,this.result);		
			}		
			else if(this.startdrag)
			{
				this.polygonModel.Drag(this.drag, x, y , this.result);
				
				//console.log('this.startdrag move');		
			}
			
//			var h2x = document.getElementById("idcoor");
//			h2x.innerHTML = 'X coords: '+x+', Y coords: '+y;
		},
		
		mouseUp: function(event) {
			var clickedNode = -1;
			var x = parseInt(event.pageX) - parseInt( this.canvas.offset().left).toFixed(1);
			var y = parseInt(event.pageY) - parseInt( this.canvas.offset().top).toFixed(1);		
		//pregunta nodo es presionado y es si es un nodo
			if(this.buttondown == true && (clickedNode = this.polygonModel.getNode(x,y)) != -1 )
			{		
				//pregunta si es un extremo
				if( this.polygonModel.isExtremity(clickedNode) == false) 
				{				
					this.polygonModel.CleanLine();				
					this.buttondown = false;
				}	
				
				//console.log('clickedNode: ' + clickedNode + ' this.startingNode: ' +  this.startingNode);
				if(this.polygonModel.closePolygone(clickedNode , this.startingNode) == true)
				{
					//console.log('this.closed polygon');
					this.recuperar();
					this.buttondown = false;	
					this.closed = true;
					this.invokeHandler(false);
				
					//console.log('clickedNode: ' + clickedNode + ' this.startingNode: ' +  this.startingNode);							
				}
			} 
			
			if(this.closed == true && (finalnode = this.polygonModel.GetXYNode(x, y) ) != null)			
			{
				if(finalnode.a != undefined && finalnode.b != undefined)
				{
					//console.log('finalnode a: ' + finalnode.a + ' finalnode b: ' + finalnode.b);
					
					if(this.startingNode ==  finalnode.a)
						this.polygonModel.RemoveNode(finalnode.a,false);
					else if(this.startingNode ==  finalnode.b)
						this.polygonModel.RemoveNode(finalnode.b,false);
				}			
			}
					
			if(this.buttondown == true && this.movestart == true)
			{		
				if( clickedNode == this.startingNode && (clickedNode = this.polygonModel.getNode(x,y) != -1) )
				//if((clickedNode = this.polygonModel.getNode(x,y)) != -1)
				{											
					this.buttondown = false;		
					this.movestart = false;	
					this.polygonModel.CleanLine();							
				}				
				else
				{						
						this.polygonModel.addNode(x,y,this.startingNode);
						this.buttondown = false;		
						this.movestart = false;	
						
						var nodos = this.polygonModel.GetNodelength();					
						var Segmentos = new Segment(nodos);	
						var temp;
						
						var inter = Segmentos.Itersection(this.startingNode,false);
						
						if(inter != -1 && inter != undefined)
						{			
							//poligono abierto = true
							if(this.startingNode != 0)
								this.polygonModel.RemoveNode(inter.nB,true);
							else
								this.polygonModel.RemoveNode(inter.nA,true);
							
							this.polygonModel.CleanLine();
						}												
				}			
				
			}
			else if(this.buttondown == true && this.movestart == false)
			{			
				this.buttondown = false;		
				this.movestart = false;	
			}
			
			if(this.startdrag == true)
			{
				//console.log('this.startdrag fin');
				this.startdrag = false;
				this.canvas.css('cursor','default');
				
				//stoke le numero de noeud appuyer
				//this.startingNode;			
				
				var nodos = this.polygonModel.GetNodelength();					
				var Segmentos = new Segment(nodos);	
				var inter = Segmentos.Itersection(this.startingNode,true);			
				if(inter != -1 && inter != undefined)
				{						
					this.polygonModel.RemoveNode(this.startingNode, false);
					this.polygonModel.addNode(x, y, this.stokeNode,true);
					//console.log(inter.length);
				}
			}
			this.polygonModel.canvasUpdate();
		},
		
		almacenar : function()
		{
			this.polygonModel.almacenar();
		},
		
		recuperar : function()
		{
			this.polygonModel.recuperar();
		},
		
		DeleteOverlay : function() {
			this.polygonModel.DeleteOverlay();
		},
		
		CleanPoligon : function(){
			this.polygonModel.CleanPoligon();
			this.closed = false;
		},
		
		PolygonCenter : function(){
			this.polygonModel.PolygonCenter();
		},
	
		CreateGrafic : function(canvas){
			this.polygonModel.createGrafic(this.canvas);
		},
		
		show : function() {
			alert(this.polygonModel.getSkyPositions());
		},
		/**
		 * Set the polygone with points. Points is a simple array. It must have at 
		 * least 6 values (3pts) and an even number of points
		 * @param points  [a,b,c,.....]
		 * @returns {Boolean} true if the polygone is OK
		 */
		setPoligon : function(points) {
			if( !points || (points.length%2) != 0 || points.length < 6 ) {
				return false;
			} else {
				var x = [];
				for(var i=0 ; i<(points.length/2) ; i++){
					x[x.length] = [points[2*i], points[(2*i)+1]];
				}
				this.polygonModel.setPolygon(x);
				this.closed = true;
				this.invokeHandler(false);
				return true;
			}
		},
		/**
		 * Call the client handler when the polygine is close or when the user click on accept
		 * The data passed to the user handler look like that:
		    {isReady: true,             // true if the polygone is closed
		    userAction: userAction,     // handler called after the user have clicked on Accept
		    region : {
		        format: "array2dim",    // The only one suported yet [[x, y]....]
		        points: this.polygonModel.skyPositions  // array with structire matching the format
		        size: {x: , y:} // regiosn size in deg
		        }
		 */
		invokeHandler : function(userAction){
			if( this.clientHandler && (this.closed || ( this.polygonModel.node == undefined || this.polygonModel.node.length == 0)) ){
				/*
				 * Compute the region size in degrees
				 */
				var view = BasicGeometry.getEnclosingView(this.polygonModel.skyPositions);
				this.clientHandler({isReady: true
					, userAction: userAction
					, region : {format: "array2dim"
						       , points: this.polygonModel.skyPositions
							   , size: {x: view.size, y: view.size}}});
			} else {
				alert("Polygon not closed");
			}
		}
}
