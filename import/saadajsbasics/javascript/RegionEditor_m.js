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
 * Model processing the draw canvas
 * 
 * Author Gerardo Irvin Campos yah
 * Contact laurent.michel@astro.unistra.fr
 */
function RegionEditor_Mvc(canvas, canvaso, aladin){

	this.node = [];	
	this.canvas = canvas[0];
	this.canvaso = canvaso[0];
	this.context = this.canvas.getContext('2d');
	this.contexto = this.canvaso.getContext('2d');
	//this.aladin parameters:
	this.aladin = aladin;	
	this.overlay = null;
	this.skyPositions = null;

}

RegionEditor_Mvc.prototype = {
      
	      
		DrawNode: function (data){
			for(var i in data)
			{
				this.context.beginPath();
				this.context.arc(data[i].cx, data[i].cy, data[i].r, 0, Math.PI * 2,true);     	      
				this.context.fillStyle = "blue";
				this.context.fill();
				this.context.stroke();	 
				this.context.closePath();	  
			} 	     
		},

		//Drawn Line
		DrawnLine: function (startingNode,x,y,result) {
			if(result != null)
			{					
				this.context.beginPath();
				this.context.lineCap="round";

				for(i in this.node)
				{
					if(this.node[result.N] == i)
						this.context.moveTo(this.node[result.N].cx,this.node[result.N].cy);

					this.context.lineTo(this.node[i].cx,this.node[i].cy);				
				}					

				this.context.closePath(); 
				this.context.strokeStyle = 'lime';
				this.context.stroke();	
			}
			else
			{
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);		
				this.context.beginPath();
				this.context.lineCap="round";
				this.context.moveTo(this.node[startingNode].cx,this.node[startingNode].cy);		
				this.context.lineTo(x,y);
				this.context.closePath(); 
				this.context.strokeStyle = 'lime';
				this.context.stroke();
			}
		},

		//this.Redrawn line and this.node
		Redrawn : function (result)
		{				
			this.CanvasUpdate();
			for(var i in this.node)
			{
				this.context.beginPath();
				this.context.arc(this.node[i].cx, this.node[i].cy, this.node[i].r, 0, Math.PI * 2,true);     	      
				this.context.fillStyle = "red";
				this.context.fill();
				this.context.stroke();	 
				this.context.closePath();	        	    
			} 		

			this.DrawnLine(0,0,0,result);
		},	

		//Clean the this.canvas
		CanvasUpdate : function ()
		{
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.contexto.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.contexto.drawImage(this.canvas, 0, 0);
		},

		//Convert a Array to Object
		ArrayToObject: function (data)
		{
			NodeTemp = [];
			for(i in data)
			{
				NodeTemp.push
				(
						{
							cx: data[i][0] ,
							cy: data[i][1],
							r:5
						}
				);
			}

			this.node=[];
			this.node = NodeTemp;
		},

		//Fuction pour obtenir le hautor du polygon
		GetHeight: function (array)
		{		
			var Ramax = null, Ramin = null;
			var finaltemp;
			var largeur;

			for(i in array)
			{
				temp = array[i][0];        	

				if(Ramax == null)
				{
					Ramax = temp;
				}
				else if(temp >= Ramax)
				{
					Ramax = temp;
				}

				if(Ramin == null)
				{
					Ramin = temp;
				}
				else if(temp <= Ramin )
				{
					Ramin = temp;
				}
			}

			largeur = (Ramax -Ramin);

			if(largeur > 180)
			{
				largeur = 360 - largeur;
			}

			return { ramax: Ramax, ramin: Ramin , largeur: largeur  };
		},

		//function pour obtenir le numero de segment et construir un segment
		NumeroSegmen : function ()
		{	
			var TotalNodes = this.node.length;		
			var segmentoini, segmentofin;	
			var total = [];

			for(var j=0; j<this.node.length; j++)
			{
				if(segmentoini == undefined)
					segmentoini = j;
				else if(segmentofin == undefined){
					segmentofin = j; 
				}

				if(segmentoini != undefined && segmentofin != undefined)
				{
					total.push
					({
						A: segmentoini,
						B: segmentofin
					});

					segmentoini = segmentofin;
					segmentofin = undefined;
				}
			}

			total.push
			({
				A: (this.node.length  - 1),
				B: 0
			});
			return total;
		},

		//function pour obtenir le hauteur de un polygone
		GetWidth: function (array)
		{		
			var Decmax = null, Decmin = null;	
			var temp;
			var width;

			for(i in array)
			{
				temp = (array[i][1]);        	

				if(Decmax == null)
				{
					Decmax = temp;
				}
				else if(temp >= Decmax)
				{
					Decmax = temp;
				}

				if(Decmin == null)
				{
					Decmin = temp;
				}
				else if(temp <= Decmin )
				{
					Decmin = temp;
				}
			}

			width = (Decmax - Decmin);

			if(width > 180)
			{
				width = 360 - width;
			}

			return { decmax: Decmax, decmin: Decmin , width: width  };
		},

		//function para crear una grafica en el this.canvas
		DrawGrafic: function (canvas1)
		{
			var canvasgraf =  canvas1;
			var ancho = canvasgraf.width;
			var alto = canvasgraf.height;

			var contextGrafic = canvasgraf.getContext('2d');
			var contador = 20;
			var contador2 = 20;
			for(var i =0; i < alto ; i++)
			{

				this.contextGrafic.beginPath();

				if(i === 0)
				{
					this.contextGrafic.moveTo( i + 20 , 10);
					this.contextGrafic.lineTo( i + 20, alto);
					this.contextGrafic.fillStyle="black";
					this.contextGrafic.font = "bold 8px sans-serif";
					this.contextGrafic.fillText("0",i + 15 , 20);
				}
				else 
				{
					this.contextGrafic.moveTo( i + contador , 20);
					this.contextGrafic.lineTo( i + contador , alto);
					this.contextGrafic.fillStyle="black";
					this.contextGrafic.font = "bold 8px sans-serif";
					this.contextGrafic.fillText(i,(i+contador)-3 , 20);
				}

				this.contextGrafic.closePath(); 
				this.contextGrafic.strokeStyle = 'yellow';
				this.contextGrafic.stroke();	

				contador = parseInt( contador + 20);

			}

			for(var i =0; i < ancho ; i++)
			{

				this.contextGrafic.beginPath();
				this.contextGrafic.lineCap="round";

				if(i === 0)
				{
					this.contextGrafic.moveTo( 12 , i + 20 );
					this.contextGrafic.lineTo( ancho , i + 20);	
				}
				else 
				{
					this.contextGrafic.moveTo( 12  , 0 + contador2);
					this.contextGrafic.lineTo( ancho , 0 + contador2);
					this.contextGrafic.font = "bold 8px sans-serif";		     
					this.contextGrafic.fillStyle="black";
					this.contextGrafic.fillText(i, 3, (0+ contador2)+3);
				}

				this.contextGrafic.closePath(); 
				this.contextGrafic.strokeStyle = 'brown';
				this.contextGrafic.stroke();	
				contador2 = parseInt( contador2 + 20);	    	       
			}  
		},

		isEmpty: function()
		{
			if(this.node.length == 0)
				return true;		
			else
				return false;
		},

		//function que permet de ajouter this.nodes
		addNode: function(x, y,startingNode,polygonestatus)
		{					
			if(polygonestatus)
			{
				var newNode = {};
				var lastnode = {};
				var position = parseInt(startingNode[0].position);

				newNode.cx = startingNode[0].cx;
				newNode.cy = startingNode[0].cy;
				newNode.r = startingNode[0].r;

				if(this.node.length === position)
				{				
					lastnode.cx = this.node[(this.node.length -1)].cx;
					lastnode.cy = this.node[(this.node.length -1)].cy;
					lastnode.r = 5;

					//agregar el nodo
					this.node.splice((this.node.length -1), 1 , lastnode,newNode);				
				}
				else
				{
					lastnode.cx = this.node[startingNode[0].position].cx;
					lastnode.cy = this.node[startingNode[0].position].cy;
					lastnode.r = 5;

					//agregar el nodo
					this.node.splice(startingNode[0].position, 1 ,newNode, lastnode);
				}														
				this.Redrawn(0);
			}
			else
			{
				var flag = typeof(startingNode);
				if(flag != "object")
				{
					if(startingNode == 0 && this.node.length > 1)
					{		
						this.node.unshift
						(
								{
									cx: x,
									cy: y,
									r: 5,	                            
								}
						);
					}
					else
					{
						this.node.push
						(
								{
									cx: x,
									cy: y,
									r: 5            
								}
						);
					}
					this.DrawNode(this.node);
				}	
				else
				{

					if(startingNode != undefined /*&& startingNode.B != undefined*/)
					{					
						var addnode ={};
						var preview ={};					

						preview.cx = startingNode.segmento.xA;
						preview.cy = startingNode.segmento.yA;
						preview.r = 5;

						addnode.cx = x;
						addnode.cy = y;
						addnode.r = 5;

						this.node.splice(startingNode.segmento.segmento, 1 , preview , addnode);
						var renode =  this.node;
						this.Redrawn(0);

					}
				}			          		         
			}
		},

		//function que permet obtener le numero de this.node
		getNode: function(x,y)
		{
			var dx=0 , dy=0;
			var result = 0;

			for(var i in this.node)
			{	             
				dx = x - this.node[i].cx;
				dy = y - this.node[i].cy;  
				//var result =Math.sqrt(dx * dx + dy * dy);
				var result = dx * dx + dy * dy;

				if(result <= 25)
				{	    
					return i;	
				}
			}
			return -1;
		},

		//function pour obtenir les deux this.nodes qui forme un segment
		getSegment: function(clickedNode)
		{		
			var pointA=0 ,pointB=0;

			if(clickedNode == 0)
			{		
				//console.log('nodo 0');
				pointA = (parseInt(clickedNode) +1);
				pointB = (this.node.length -1);
			}
			else if(clickedNode == (this.node.length -1))
			{			
				//console.log('nodo final:' + (this.node.length -1));
				pointA = parseInt((this.node.length -1) -1);
				pointB = 0;			
			}
			else if(clickedNode != 0 && clickedNode != (this.node.length -1))
			{	
				//console.log('otro this.node');
				pointA = (parseInt(clickedNode)+1);
				pointB = (parseInt(clickedNode)-1);			
			}
			return {A :pointA, B:pointB, N:clickedNode};
		},

		//function pour effacer le this.canvas
		canvasUpdate: function()
		{		
			this.contexto.drawImage(this.canvas, 0, 0);
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);		
		},

		//function pour diseigner les lignes
		drawHashline: function(startingNode,x,y)
		{						
			this.DrawnLine(startingNode,x,y);	   	   					
		},	

		//function pour effacer un ligne
		CleanLine: function()
		{	
			//this.contexto.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},

		//function pour savoire si un this.node es un extemite
		isExtremity: function(clickedNode)
		{
			if(clickedNode == 0 || clickedNode == (this.node.length -1))
			{		
				return true;								
			}				
			return false;

		},

		//function que permet de fermer un polygon
		closePolygone: function(clickedNode , startingNode)
		{		
			if(clickedNode == startingNode)
			{
				return false;	
			}
			else if(clickedNode == 0 && startingNode == (this.node.length -1))
			{		
				for(var i in this.node)
				{
					this.context.beginPath();
					this.context.arc(this.node[i].cx, this.node[i].cy, this.node[i].r, 0, Math.PI * 2,true);     	      
					this.context.fillStyle = "red";
					this.context.fill();
					this.context.stroke();	 
					this.context.closePath();	  		        
				}  
				return true;
			}
			else if(clickedNode == (this.node.length -1) && startingNode == 0 )
			{			
				for(var i in this.node)
				{
					this.context.beginPath();
					this.context.arc(this.node[i].cx, this.node[i].cy, this.node[i].r, 0, Math.PI * 2,true);     	      
					this.context.fillStyle = "red";
					this.context.fill();
					this.context.stroke();	 
					this.context.closePath();	  		        
				} 
				return true;
			}			
			return false;
		},

		//function pour bouger un this.node et ses deux segments de le poligone
		Drag: function(clickedNode, x,y,result)
		{
			var segmentfirst;
			var segmentlast;
			var flag;
			var resultado = [];								

			//set new values
			this.node[clickedNode].cx = x;
			this.node[clickedNode].cy = y;	

			this.node[result.N].cx = x;
			this.node[result.N].cy = y;					

			this.Redrawn(result);		
		},

		//function pour garder les valeur de alafin lite et les convertir en valeurs de this.canvas("pixel")
		almacenar: function()
		{			
			if(this.skyPositions != null)
			{
				this.node = [];
				this.skyPositions.pop();

				for (var k=0; k<this.skyPositions.length; k++) 
				{
					this.node.push(this.aladin.world2pix
							(
									this.skyPositions[k][0], 
									this.skyPositions[k][1]								
							));								
				}	

				this.ArrayToObject(this.node);

				this.Redrawn(this.node);	
			}

		},		

		//function pour effacer le poligone de this.aladin lite quand passe a mode edition
		DeleteOverlay :  function()
		{
			if (this.overlay != null) 
			{			 	      
				this.overlay.addFootprints(A.polygon(this.skyPositions));
				this.overlay.removeAll();
				this.overlay.overlays = [];
			}	        	 
		},

		//function pour obtenir les valeurs de le polygon et creer le polygon en adalin lite
		recuperar: function()
		{
			/*
			 * When the position are set from outside, the node remains empty while there is edition action.
			 *  So if the user want to get back the polygoene without editing it, we have to cancel this method
			 */
			if( this.node && this.node.length == 0 && this.skyPositions && this.skyPositions.length > 0 ) {
				return ;
			}

			this.skyPositions = [];		 
			for (var k=0; k<this.node.length; k++) {
				this.skyPositions.push(this.aladin.pix2world(this.node[k].cx, this.node[k].cy));
			};
			//finalthis.node
			if (this.overlay==null) {
				this.overlay = A.graphicOverlay({color: 'red'});
				this.aladin.addOverlay(this.overlay);
			}
			this.overlay.removeAll();	       
			this.overlay.addFootprints(A.polygon(this.skyPositions));
		},

		//function pour obtenir les valeurs de le polygon et creer le polygon en adalin lite
		setPolygon: function(points)
		{
			this.skyPositions = [];		 
			for( var k=0 ; k<points.length ; k++){
				this.skyPositions.push(points[k]);			
			}
			if (this.overlay==null) {
				this.overlay = A.graphicOverlay({color: 'red'});
				this.aladin.addOverlay(this.overlay);
			}
			this.overlay.removeAll();	  
			this.overlay.addFootprints(A.polygon(this.skyPositions));
			this.PolygonCenter();
		},
		setOverlay: function(points)
		{
			if (this.overlay==null) {
				this.overlay = A.graphicOverlay({color: 'red'});
				this.aladin.addOverlay(this.overlay);
			}
			this.overlay.removeAll();	  
		},
		//function pour effacer le poligone de this.canvas
		CleanPoligon: function()
		{
			this.CanvasUpdate();
			this.node = [];
			this.skyPositions= [];
		},

		//trouver le polygon en adalin lite si on se trouve en otre part du universe
		PolygonCenter: function()
		{		
			var view = BasicGeometry.getEnclosingView(this.skyPositions);
			this.aladin.gotoPosition(view.center.ra, view.center.dec);
			this.aladin.setZoom( 1.2*view.size );
		},

		//effacer un this.node de le polygone si se trouve sûr autre this.node
		RemoveNode: function(nodevalue,status)
		{
			var index = this.node[nodevalue];

			if(this.node.length >= 4)
			{			
				this.node.splice(nodevalue,1);
				if(status)
				{
					this.DrawNode(this.node);
				}else
				{
					this.Redrawn(0);
				}

			}
		},

		//function pour obtenir le this.node initial et final du polygon
		GetXYNode: function(x,y)
		{
			var nodes={};        

			for(var i in this.node)
			{	         
				dx = x - this.node[i].cx;
				dy = y - this.node[i].cy;  
				var result = dx * dx + dy * dy;

				if(result <= 25)
				{	                	
					if(nodes.a == undefined)
					{
						nodes.a = i;
					}
					else 
					{
						nodes.b = i;
					}            		            		
				}                      
			}

			return nodes;
		},

		//metodo que debuelve el numero de nodos del poligono
		GetNodelength: function()
		{
			return this.node;
		},

		//crear la grafica
		createGrafic: function(parametre)
		{
			this.DrawGrafic(parametre);
		},

		//indicar cuando serrar poligono
		cuadradoIndicador: function(x,y)
		{	
			this.context.beginPath();
			this.context.fillRect(x,y,10,10);     	      
			this.context.fillStyle = "red";
			this.context.fill();
			this.context.stroke();	 
			this.context.closePath();
		},

		stokeNode: function(nodeposition)
		{
			if(nodeposition != undefined) 
				var stocknode = [];
				stocknode.push
				({
					position: nodeposition,
					cx:this.node[nodeposition].cx,
					cy:this.node[nodeposition].cy,
					r:5
				});

				return stocknode;
			
		},
		getSkyPositions: function() {
			return this.skyPositions;
		}
}