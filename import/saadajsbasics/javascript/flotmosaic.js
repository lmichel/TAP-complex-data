/**
 * This file contains ploter singleton and PlotSuccess class to ensure plot using the JSON file received 
 */

//Singleton to plot hr,ep and flux
ploter= function() {
	//Function use tooltip
	var previousPoint = null;
	$.fn.UseTooltipeHf = function () { 
		$(this).bind("plothover", function (event, pos, item) {     
			if (item) {

				if (previousPoint != item.dataIndex) {
					previousPoint = item.dataIndex;    	  
					$("#flottooltip").remove();	                  
					var x = item.datapoint[0];
					var y = item.datapoint[1];  
					var z = item.datapoint[2];  
					var s=item.series.bars.barWidth;
					var color=item.series.color;
					//Test the bars's show status to know if it the bar is selected or point of simple curve
					if (item.series.bars.horizontal===false)
						showTooltip(item.pageX, item.pageY,
								"<h5 style=\"text-align:center;color:"+color+" \"><strong>"
								+	item.series.label+"</strong></h5>Value = <strong>" 
								+ DelZ(y) + "</strong> <br/>Error Value = <strong>" 
								+ DelZ(z) +"</strong> <br/>MJD = <strong>"
								+ DelZ(x) + "</strong> <br/>Date = <strong>"
								+MJDtoYMD(x)+"</strong>"  ,color);
					else
						showTooltip(item.pageX, item.pageY,
								"<h5 style=\"text-align:center;color:"
								+color+" \"><strong>"
								+item.series.label+"</strong></h5> Value = <strong>" 
								+ DelZ(y) + "</strong> <br/>Error Value = <strong>" 
								+ DelZ(s) +"</strong>"  ,color);
				}}
			else {

				$("#flottooltip").remove();
				previousPoint = null;
			}
		});
	};
	$.fn.UseTooltipRadec = function () {
		$(this).bind("plothover", function (event, pos, item) {     
			if (item) {
				if (previousPoint != item.dataIndex) {
					previousPoint = item.dataIndex;    	  
					$("#flottooltip").remove();	                  
					var x = item.datapoint[0];
					var y = item.datapoint[1];  
					var z = item.datapoint[2];  
					var color=item.series.color;
					//Test the existence of the 4th item in array data determine if the ghraph selected is from plothf or radec 
					if(item.seriesIndex==2)  showTooltip(item.pageX, item.pageY,
							"<h5 style=\"text-align:center;color:"
							+ color+" \"><strong>"
							+ item.series.label+"</strong></h5>Ra = <strong>"
							+ DelZ(x) + "</strong> <br/> Dec = <strong>" 
							+ DelZ(y) + "</strong> (arcsec) <br/>Error = <strong>"
							+ DelZ(z*3600)+"</strong> (sec) "  ,color);
					else showTooltip(item.pageX, item.pageY,
							"<h5 style=\"text-align:center;color:"
							+ color+" \"><strong>"
							+ item.series.label+"</strong></h5>Ra = <strong>"
							+ DelZ(x) + "</strong> <br/> Dec = <strong>" 
							+ DelZ(y) + "</strong> (arcsec) <br/>Error =<strong>"
							+ DelZ(z*3600)+"</strong> (sec) <br/> Date = <strong>"
							+ MJDtoYMD(item.series.data[item.dataIndex][4])+"</strong> ",color);
				}
			}
			else {
				$("#flottooltip").remove();
				previousPoint = null;
			}
		});
	};
	//Customization the tooltip
	var showTooltip= function (x, y, contents,color) {
		$('<div id="flottooltip">' + contents + '</div>').css({
			position: 'absolute',
			display: 'none',
			top: y+15,
			left: x,
			border: '2px solid #4572A7',
			padding: '2px',     
			size: '10',   
			'border-radius': '6px 6px 6px 6px',
			'border-color': color,
			'background-color': '#fff'
			, opacity: 1
			, 'z-index': 10000
		}).appendTo("body").fadeIn(200);
	}       
	//Modified Julian Day Converter function 
	var MJDtoYMD= function (mjd_in) {
		var year;
		var month;
		var day;
		var hour;
		var jd;
		var jdi;
		var jdf
		var l;
		var n;
		jd = Math.floor (mjd_in) + 2400000.5;
		jdi = Math.floor (jd);
		jdf = jd - jdi + 0.5;
		if (jdf >= 1.0) {
			jdf = jdf - 1.0;
			jdi  = jdi + 1;
		}
		hour = jdf * 24.0;    
		l = jdi + 68569;
		n = Math.floor (4 * l / 146097);            
		l = Math.floor (l) - Math.floor ((146097 * n + 3) / 4);
		year = Math.floor (4000 * (l + 1) / 1461001);            
		l = l - (Math.floor (1461 * year / 4)) + 31;
		month = Math.floor (80 * l / 2447);            
		day = l - Math.floor (2447 * month / 80);           
		l = Math.floor (month / 11);          
		month = Math.floor (month + 2 - 12 * l);
		year = Math.floor (100 * (n - 49) + year + l);
		if (month < 10)
			month = "0" + month;             
		if (day < 10)
			day = "0" + day;                     
		return (day+"/"+month+"/"+year);
	}
	//Fix max of digit number 5 without zero after comma if the number is float
	var DelZ=function(v){
		var str=v.toString();
		var x =str.split('e');
		if(/\./.test(x[0])){
			var x1 = x.length > 1 ? 'e' + x[1] : '';
			var x0 =(parseFloat(x[0]).toFixed(5)).toString(); 
			t=x0.split('.')
			t0=t[0];
			t1=t.length>1 ? '.'+t[1] : ''
				if(/0+$/.test(t1))  t1=t1.replace(/0+$/,"");
			if(t1.length>1)  str=t0+t1+x1;
			else str=t0+x1;
		}
		return(str);
	}

	//Function call by tickFormatter to customize the ticks
	var formatTemps= function (v,axis) {return MJDtoYMD(v);}              
	//Function call by legend:sorted to customize it.
	var alphasc=function (a, b) {return a.label == b.label ? 0 : (a.label > b.label ? 1 : -1) ;}
	//Delete zero after point in yaxis
	var formaty=function(v,axis){return DelZ(v);}
	//Function to plot Hardness Ratio or Flux per Band graph
	//
	var tabPlot=[];
	//
	var plothf=function (placeholder,data,options,xtabticks,maxyerr,minyerr,margy,graphtitle) {
		//Format ticks in axe on the bottom and set ticks to the 2 axes
		options.xaxis.tickFormatter=formatTemps;
		options.xaxis.ticks=0//xtabticks;
		//Add margin min difference between ticks 
		var tabdiff=[];
		/*
		 *Margin will be added to graphs
		 *two cases will can detected 
		 *first if unique source is present		 
		 *second many sources are present 
		 */
		var marge;
		if(xtabticks.length>1){
			if(!options.points.fillColor) {
				options.points.radius=0;
				options.points.fillColor= "#ffffff";
			}
			for(var i=0;i<xtabticks.length-1;i++){
				for(var j=i+1;j<xtabticks.length;j++){
					tabdiff.push(xtabticks[j]-xtabticks[i]);
				}
				marge=(Math.max.apply(Math, tabdiff)<(Math.min.apply(Math, tabdiff))*15)? Math.min.apply(Math, tabdiff):172;
			}
		}
		else {marge=172;
		options.points.radius=3;
		options.points.fillColor= null}
		//Customize axes in setting max, min and position
		options.xaxis.max=Math.max.apply(Math, xtabticks)+marge;
		options.xaxis.min=Math.min.apply(Math, xtabticks)-marge;
		options.yaxis.max=maxyerr+margy;
		options.yaxis.min=minyerr-margy;
		//Disable y zoom
		if (Math.abs(maxyerr)>1) options.yaxis.zoomRange=[Math.abs(maxyerr)*1e10,0];
		else options.yaxis.zoomRange=[(1/Math.abs(maxyerr))*1e10,0];
		//Add panrange to limit the range of curve 
		options.xaxis.panRange=[options.xaxis.min-marge,options.xaxis.max+marge];
		//Set title of graphs
		options.xaxis.axisLabel=graphtitle;
		//Do the plot and push the plot object in the associated array
		tabPlot.push($.plot( $("#"+placeholder),data, options));
		//The call of tooltip function
		$("#"+placeholder).UseTooltipeHf();
	} 
	//Function to plot radec graph
	var plotradec= function (placeholder,data,options,maxyerr,minyerr,maxxerr,minxerr,margy,margx) {
		//Add options to radec graph
		if(!options.points.fillColor) {
			options.points.radius=0;
			options.points.fillColor= "#ffffff";
		}
		options.xaxis.ticks=null;
		options.xaxis.tickFormatter=null
		options.xaxis.tickFormatter=formaty;
		options.xaxis.max=maxxerr+margx;
		options.xaxis.min=minxerr-margx;
		options.yaxis.tickFormatter=formaty;
		options.yaxis.max=maxyerr+margy;
		options.yaxis.min=minyerr-margy;
		//Add vertical lines to the grid and set zoom along the two axes
		options.xaxis.tickLength=null;
		options.yaxis.zoomRange=null;
		//Add panrange to limit the range of curve 
		options.xaxis.panRange=[options.xaxis.min-margx,options.xaxis.max+margx];
		//Set title of graph
		options.xaxis.axisLabel="Ra";
		//Do the plot and push the plot object in the associated array
		tabPlot.push($.plot( $("#"+placeholder), data, options));
		//The call of tooltip function
		$("#"+placeholder).UseTooltipRadec();
	}
	//Toggle plot function called when click on the graph title to appear or desappear it.
	togglePlot = function(seriesId, top, done,container) {
		if ($("#"+container+seriesId).hasClass('change')) $("#"+container+seriesId).removeAttr('class')
		else $("#"+container+seriesId).attr('class','change')
		for( var cpt=top ; cpt<=done ; cpt++){
			if(tabPlot[cpt])
				var someData = tabPlot[cpt].getData();
			for(var x in someData){
				if(someData[x].idcurve==seriesId){
					if(seriesId!=5){
						if(seriesId!=6)someData[x].lines.show = !someData[x].lines.show;
						someData[x].points.show = !someData[x].points.show;
						someData[x].points.yerr.show = !someData[x].points.yerr.show;
						if(seriesId>5) someData[x].points.xerr.show = !someData[x].points.xerr.show;
					}
					else {someData[x].bars.show = !someData[x].bars.show;
					someData[x].hoverable=!someData[x].hoverable;}
					tabPlot[cpt].setData(someData);
					tabPlot[cpt].draw();
				}
			}
		}
	}
	//To insert one legend for all mosaic graphs
	var  insertLegend=function(container, start, end){
		var top = parseInt(start); 
		var done = parseInt(end);
		var testMotionDetection=false;
		$("."+container).html(""); 
		var fragments = [], entries = [], rowStarted = false,s, label,labtab=[];
		for( var cpt=top ; cpt<=done ; cpt++){
			for (var i = 0; i < tabPlot[cpt].getData().length; i++) {
				s = tabPlot[cpt].getData()[i];
				label =   s.label;
				if (label=="Proper Motion") testMotionDetection=true;
				if(labtab.indexOf(label)==-1){  
					labtab.push(label)
					entries.push({
						label: label,
						color: s.color,
						idcurve:s.idcurve
					});
				} 
			}
		}
		for (var i = 0; i < entries.length; i++) {
			var entry = entries[i]; 
			fragments.push(
					'<td class="legendColorBox"><div style="border:1px solid #ccc; padding:1px"><div style="width:4px;height:0;border:5px solid ' 
					+ entry.color + ';overflow:hidden"></div></div></td>' +
					'<td class="legendLabel"><a id="'
					+container+entry.idcurve+'" href="#" onClick="togglePlot('+entry.idcurve+','+top+','+done+',\''+container+'\'); return false;">'
					+entry.label+'</a></td>'
			);
		}
		if (fragments.length == 0)
			return;
		var table = '';
		table += (testMotionDetection)? '<table class="leg" style="font-size:smaller;color:#545454;display: inline-table">' 
				+ fragments.join("") + '</table><p class="spanhelp" style="display:inline;font-size:smaller;margin: 0 auto;">Click on label to hide/show plots. The blue label joins first with last detection.</p>'
				:'<table class="leg" style="font-size:smaller;color:#545454;display: inline-table">' 
				+ fragments.join("") + '</table><p class="spanhelp" style="display:inline;font-size:smaller;margin: 0 auto;">Click on label to hide/show plots</p>';
				
		table += '<p class="spanhelp" style="display:inline;color: darkorange;font-size:smaller;margin: 0 auto;">The detections used for the plots have not been filtered. Please check their validity by yourself.</p>';
		$("."+container).html(table);

	}
	//clean the plot array in calling plotall function
	var inittabPlot=function(){
		tabPlot=[];
	}
	//Function will be used in plotSuccess
	var pblc = {};
	pblc.plothf = plothf;
	pblc.plotradec = plotradec;
	pblc.alphasc=alphasc;
	pblc.formaty=formaty;
	pblc.insertLegend = insertLegend;
	pblc.inittabPlot=inittabPlot;
	return pblc;
}();
//object used to set options, prepare the environment and call plot function
function PlotSuccess(){ 
	//Global options of plot function 
	this.options = { 
			canvas:true,
			zoom: {interactive: true},
			pan: {interactive: true}, 
			lines:{show:true},
			xaxis:{reserveSpace:false,show:true},
			yaxis:{tickFormatter:ploter.formaty},
			legend: {show: false},
			grid: {hoverable: true,borderWidth: 1,backgroundColor: { colors: ["#fff", "#fff"] },borderColor:"black"},
			points: { show: false,radius:0},
			shadowSize:0 }; 
}
//Plotting of the mosaic
PlotSuccess.prototype.plotAll=function(id_modal,data){
	ploter.inittabPlot();
	var onglet=$($('<div id="ongletsgraphs" style="border:none"><ul></ul></div>').appendTo($("#"+id_modal)));
	onglet.width('100%');
	onglet.height('100%');
	for(var i=0;i<data.data.length;i++){
		//Count margin also used in the definition of divgraph height 
		var cptmarg=0;
		//Li onglet
		var tabtitle=(data.data[i].label).replace(/_/g," ")
		$('<li><a href="#plotarea'+data.data[i].label+'"><span>'+tabtitle+'</span> </a></li>').appendTo($('div[id="ongletsgraphs"] ul'));

		//Div of type of graphes(hr, ep,radec...)
		var divligne=$($('<div></div>').appendTo($('div[id="ongletsgraphs"]')));
		divligne.attr('id','plotarea'+data.data[i].label);
		divligne.width('100%');
		divligne.height('90%');

		$('<br clear="both" />').appendTo("#plotarea"+data.data[i].label);
		//
		var divlegend=$($('<div class="legaa'+i+'"></div>').appendTo($("#plotarea"+data.data[i].label)));
		divlegend.attr('id','legendContainerhr'+data.data[i].data[0].label);
		//
		//Plot of graphes
		for(var j=0;j<data.data[i].data.length;j++){
			//Count number of graph and to know when we set the the marge
			cptmarg++;
			//Affect label of graph to graphtitle in replacing _ by space then delete special char unacceptable in id 
			var graphtitle;
			graphtitle=(data.data[i].data[j].label).replace(/_/g," ")
			if (/[\.\s\)\(]/.test(data.data[i].data[j].label)) data.data[i].data[j].label=(data.data[i].data[j].label).replace(/[\.\s\)\(]/g,"");

			var divdivgraph=$($('<div class="bb"></div>').appendTo($("#plotarea"+data.data[i].label)));
			divdivgraph.attr('id',"divplotgraph"+data.data[i].data[j].label); 
			//Line of the legend
			//Div of graph
			var divgraph=$($('<div class="aa"></div>').appendTo($("#divplotgraph"+data.data[i].data[j].label)));
			divgraph.attr('id',"plotgraph"+data.data[i].data[j].label); 
			while (cptmarg%2==0 ){
				divdivgraph.css('margin-left','2%'); 
				break; 
			}
			/*
			 * Search max and min x+err x-err max and min pf y-err and insert data for the horizontal line y 
			 * and put length of every data array to determine index of data that have max x 
			 */
			//Array contains  x+xerr
			var maxtabxerr=[];
			//Array contains  x-xerr
			var mintabxerr=[];
			//Array contains y+yerr
			var maxtabyerr=[];
			//Array contains y-yerr 
			var mintabyerr=[];
			/*
			 *Array contains length of data in every data curve that will be used 
			 *after to insert date to ticks because of the delete of NaN data in ajax
			 */
			var lengthdata=[];
			var tabyerr=[];
			var tabxerr=[];
			/*
			 * Class bars is not counted in y and x err because it has 0 in its data 
			 * and if it s counted so the min xerr and yerr will be 0
			 */
			//Leaf of hr and flux data to insert the array will be used after to set max min of axes
			if(i<2)for(var x=0;x<data.data[i].data[j].data.length-1;x++){
				for(var z=0;z<data.data[i].data[j].data[x].data.length;z++){
					maxtabyerr.push(data.data[i].data[j].data[x].data[z][1]+data.data[i].data[j].data[x].data[z][2]);
					mintabyerr.push(data.data[i].data[j].data[x].data[z][1]-data.data[i].data[j].data[x].data[z][2]);
					tabyerr.push(data.data[i].data[j].data[x].data[z][2]);
				}
				lengthdata.push(data.data[i].data[j].data[x].data.length);
			}
			//Leaf of radec data to insert the array will be used after to set max min of axes
			else for(var x=0;x<data.data[i].data[j].data.length;x++){
				for(var z=0;z<data.data[i].data[j].data[x].data.length;z++){
					maxtabxerr.push(data.data[i].data[j].data[x].data[z][0]+data.data[i].data[j].data[x].data[z][3]);
					mintabxerr.push(data.data[i].data[j].data[x].data[z][0]-data.data[i].data[j].data[x].data[z][3]);
					maxtabyerr.push(data.data[i].data[j].data[x].data[z][1]+data.data[i].data[j].data[x].data[z][2]);
					mintabyerr.push(data.data[i].data[j].data[x].data[z][1]-data.data[i].data[j].data[x].data[z][2]);
					tabxerr.push(data.data[i].data[j].data[x].data[z][3]);
					tabyerr.push(data.data[i].data[j].data[x].data[z][2]);
				}
			}
			/*
			 * Determine the max and min of axes that will be fixed in to every graphs by transfer
			 * it in the arguments of plothr or plotradec function
			 */
			var maxxerr=Math.max.apply(Math, maxtabxerr);
			var minxerr=Math.min.apply(Math, mintabxerr);
			var maxyerr=Math.max.apply(Math, maxtabyerr);
			var minyerr=Math.min.apply(Math, mintabyerr);
			var margx=Math.min.apply(Math, tabxerr);
			var margy=Math.min.apply(Math, tabyerr);

			//Insert date into ticks flot options 
			var xtabticks=[];
			if(data.data[i].data[j].data[lengthdata.indexOf(Math.max.apply(Math,lengthdata))])
				if(i<2) for(var n=0;n<data.data[i].data[j].data[lengthdata.indexOf(Math.max.apply(Math,lengthdata))].data.length;n++){
					xtabticks.push(data.data[i].data[j].data[lengthdata.indexOf(Math.max.apply(Math,lengthdata))].data[n][0]);
				} 

			//Limit pan range for all graphs
			this.options.yaxis.panRange=[minyerr-2*margy,maxyerr+2*margy];

			//Choose any plot funtion to use

			//If the number of graph is 4 or 6 plothf will be called
			if((data.data[i].data.length)==4 ||(data.data[i].data.length)==6){

				//Start of bars from min x and finish in max x 
				//test of existance of data in bars because if there is no points there is no bars 
				if(data.data[i].data[j].data[lengthdata.indexOf(Math.max.apply(Math,lengthdata))])
					if(data.data[i].data[j].data[data.data[i].data[j].data.length-1].data[0]){
						data.data[i].data[j].data[data.data[i].data[j].data.length-1].data[0][0]=(xtabticks.length>1)?Math.max.apply(Math, xtabticks):Math.max.apply(Math, xtabticks)+150;
						data.data[i].data[j].data[data.data[i].data[j].data.length-1].data[0][2]=(xtabticks.length>1)?Math.min.apply(Math, xtabticks):Math.min.apply(Math, xtabticks)-150;
					}
				//Seting of 4 div contains hr graphs
				if(data.data[i].data.length==4){	
					$("#divplotgraph"+data.data[i].data[j].label).height('50%');
					$("#divplotgraph"+data.data[i].data[j].label).width('49%');
					$(".aa").height('97%');
					$(".aa").width('100%');
					//Seting of 6 div contains flux graphs
				}else{
					$("#divplotgraph"+data.data[i].data[j].label).height('33.3333%');
					$("#divplotgraph"+data.data[i].data[j].label).width('49%');
					$(".aa").height('97%');
					$(".aa").width('100%');}
				//Call the plothf function
				ploter.plothf("plotgraph"+data.data[i].data[j].label,data.data[i].data[j].data,this.options,xtabticks,maxyerr,minyerr,margy,graphtitle);
				if(i==0 && j==3) ploter.insertLegend('legaa0',0,3)
				if(i==1 && j==5) ploter.insertLegend('legaa1',4,9)
			}
			//Else if the number of graph is 1 plotradec will be called
			else {
				$("#divplotgraph"+data.data[i].data[j].label).height('100%');
				$("#divplotgraph"+data.data[i].data[j].label).width('100%');
				$(".aa").height('95%');
				$(".aa").width('100%');


				//Call the plotradec function 
				ploter.plotradec("plotgraph"+data.data[i].data[j].label,data.data[i].data[j].data,this.options,maxyerr,minyerr,maxxerr,minxerr,margy,margx);
				ploter.insertLegend('legaa2',10,10)
			}
		} 
	}
}

