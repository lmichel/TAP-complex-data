
/**
 * Singleton encapsulating the formating function 
 * Called each time a result value has to be displayed
 * @returns {___anonymous_ValueFormator}
 */
ValueFormator = function() {
	var raValue;
	var decValue;
	var reset = function(){
		raValue = undefined;
		decValue = undefined;		
	};
	var dataTreePath;
	let decimaleRegexp = new RegExp("^[+-]?[0-9]*[.][0-9]*([eE][+-]?[0-9]+)?$","m");
	//								 |Y   Y    YY  |    J           JJJJ      |                VVVV            |     M     |     PPPP    |   A  |  ?????
	let bibcodeRegexp = new RegExp(/^[12][089]\d{2}[a-zA-Z0-9][a-zA-Z0-9&.]{4}(?:[a-z.]{3}[a-z]|[0-9.]{3}[0-9])[.A-Z0-9][0-9.]{3}[0-9][A-Z:.](?:#[a-zA-Z.0-9]+)?/);
	//let bibcodeRegexp = new RegExp(/^[12][089]\d{2}[A-Za-z][A-Za-z0-9&][A-Za-z0-9&.]{2}[A-Za-z0-9.][0-9.][0-9.BCRU][0-9.]{2}[A-Za-z0-9.][0-9.]{4}[A-Z:.](?:#[a-zA-Z.0-9]+)?/);
	
	/**
	 * 
	 */
	var formatValue = function(columnName, values, tdNode, columnMap,dataTreePat) {
		dataTreePath = dataTreePat;
		if( columnMap.currentColumn == undefined )  {
			ModalInfo.error("formatValue: Missing column number in " + JSON.stringify(columnMap));
			return;
		}
		var value = "" + values[columnMap.currentColumn];
		
		if ( columnMap.s_ra == columnMap.currentColumn){
			raValue = value;
		} else	if ( columnMap.s_dec == columnMap.currentColumn){
			decValue = value;
		} else	if ( columnMap.target_name== columnMap.currentColumn){
			targetName = value;
		}
		/*
		 * To be send to the the datalink processor to setup possible cutout services
		 */
		var fovObject = {s_ra: (columnMap.s_ra != -1)?  parseFloat(values[columnMap.s_ra]) : 9999 ,
				        s_dec: (columnMap.s_dec != -1)? parseFloat(values[columnMap.s_dec]): 9999 ,
						s_fov: (columnMap.s_fov != -1)?parseFloat( values[columnMap.s_fov]): 9999 };
		/*
		 * First case the value is an URL
		 */
		if( value.startsWith("http://") ||  value.startsWith("https://") ) {
			/*
			 * The mime type is specified: we can take into account the type of response without requesting the HTTP header
			 */
			if( columnMap.access_format != -1 ){
				var access_format = values[columnMap.access_format];
				if( access_format.endsWith("content=datalink" ) ){
					tdNode.html("");
					addInfoControl(columnName, tdNode, value);
					addDatalinkControl(value,  tdNode, fovObject);
				}
				/*
				 * No mime type specified: We need to request the HTTP header for taking into account the response type
				 */
			}
			formatURL(columnName, tdNode, value);
			/*
			 * Second case: an atomic value;
			 */
		} else {
			formatSimpleValue(columnName, value, tdNode, columnMap);
		}
	};

	/************************************
	 * Private logic
	 */
	/**
	 * Format value: take into account the format of the string representing the value.
	 * No reference to the context
	 */
		var myNodeInfo = function(f){
				var dataInfos = dataTreeView.getNodeInfos( f );
				return dataInfos;
			};
			
		var columnNames=[];	var i=0;

	var formatURL=function(columnName, tdNode, value){
		tdNode.html("");
		tdNode.append("<a class='dl_info' title='See URL' href='#' onclick='ModalInfo.info(\"" + value + "\",\"URL\"); return false;'></a>");
		tdNode.append("<a class='dl_download' target=blank title='Open url' href='" + value + "' ></a>");
	};

	var formatSimpleValue = function(columnName, value, tdNode, columnMap) {
		/*
		 * TODO :add SAMP message to Aladin : script.aladin.send
		 */
			if(raValue != undefined){
				columnNames[i] =columnName;
				i++;
			} 
		if( value.match(/^((position)|(region)|(polygon)|(circle))/i) ) {
			//addSTCRegionControl(tdNode, value);
			if(columnMap.s_ra != -1 && columnMap.s_dec !=-1){
						let ra=raValue;
						let dec=decValue;
						let dec_name = columnNames[1];
						let ra_name = columnNames[0];
						//alert(ra_name+"  "+columnMap.s_ra);
						addSTCRegionControl(tdNode, value,ra,dec,ra_name,dec_name);	
				}
			
			
		} else if ( raValue != undefined && decValue != undefined && 
				(columnMap.s_ra == columnMap.currentColumn || columnMap.s_dec == columnMap.currentColumn) ) {
				// modify link to display it on alix;
				// var alLink = "<a onclick='ModalAladin.aladinExplorer({ target: &quot;" + raValue + " " + decValue + "&quot;, fov: 0.016, title:&quot;...&quot;}, []);'class='dl_aladin' href='javascript:void(0);' title='Send source coord. to Aladin Lite'></a>";
				//tdNode.html(alLink + " " + (new Number(value)).toPrecision(8));
				
			    /*var alLink = "<a onclick='alixapi.showPopup( &quot;"+ raValue + " " + decValue + "&quot;);'class='dl_aladin' href='javascript:void(0);' title='Send source coordo to Alix'></a>";
				tdNode.html(alLink + " " + (new Number(value)).toPrecision(8));*/
		
			if(columnMap.s_ra != -1 && columnMap.s_dec !=-1){
						var ra=raValue;
						var dec=decValue;
						var tab=  tableBase.quotedTableName().qualifiedName;
						isloadAlix=true;

						var id = "dec_"+ dec.toString().replace(".", "").replace("-", "");
						var alLink = "<a id='" + id + "'  class='dl_aladin'  title='Send source coordo to Alix'></a>";
						tdNode.html(alLink + " " +  Number(value).toPrecision(8));
						 tdNode.first().click(function(){
							var dec_name = columnNames[1];
							var ra_name = columnNames[0];
							var label = "TAP "+ columnName;
							alixapi.showPopupData({
								master: {
									raCenter: ra, 
									decCenter: dec, 
									raColumn: ra_name,
									decColumn: dec_name,
									tablePath: tab, 
									label: label	
									},
									label: label
								}
							);
						
						});
					}	
			/*
			 * Array annotation removed from server because of CSIRO for which all data are typed as arra
			 */
		} else if( bibcodeRegexp.test(value)){
			tdNode.html("<a title=\"bibcode\" href='http://cdsads.u-strasbg.fr/cgi-bin/nph-bib_query?" + value + "' target=blank>" + value + "</a>");
		} else if(/* value.startsWith("Array")*/ value.length > 24 ) {
			value = value.replace(/'/g,"&#146;");
			//tdNode.html("<a title='Data array(click to expand)' class='dl_dataarray' href='#'  onclick='Modalinfo.info(\"" + value + "\", \"Data Array\");'></a>");
			tdNode.html("<span title=' - " + value + "' style =' cursor: pointer;' onclick='ModalInfo.info(\"" + value + "\", \"Full Value\");'>" + value.substring(0, 23) + " ...</span>");
		    
			//tdNode.html("<span title='" + value + "' style =' cursor: pointer;' onclick='alixapi.drawCircle(\"" + value + "\");'>" + value.substring(0, 23) + " ... </span>");	
		} else if( decimaleRegexp.test(value)){
			tdNode.html(Number(value).toPrecision(8));
		} else {
			tdNode.html(value);
		}
	};
	var addInfoControl = function(columnName, tdNode, url){
		tdNode.append("<a class='dl_info' title='Get info about' href='#' onclick='resultPaneView.fireGetProductInfo(\"" + url + "\"); return false;'></a>");
	};
	var addDownloadControl = function(columnName, tdNode, url, secureMode, contentEncoding){
		var target = (contentEncoding == "")? "": "target=blank";				
		var dl_class = (secureMode)? "dl_securedownload": 'dl_download';
		var x = "<a class='" + dl_class + "' " + target + " title='Download Data' href='javascript:void(0);' onclick='PageLocation.changeLocation(\"" + url + "\");'></a>";
		tdNode.append(x);
	};	
	var addCartControl = function(columnName, tdNode, url, secureMode){
		if( secureMode ){
			tdNode.append("<a class='dl_securecart' title='Add to cart' href='#' onclick='cartView.fireRestrictedUrl(\"" + dataTreePath.nodekey + "\", \"" + url + "\"); return false;'/></a>");
		} else {
			tdNode.append("<a class='dl_cart' title='Add to cart' href='#' onclick='cartView.fireAddUrl(\"" + dataTreePath.nodekey + "\", \"" + url + "\"); return false;'/></a>");
		}
	};	
	var addSampControl = function(columnName, tdNode, url, sampMType, fileName){
		tdNode.append("<a class='dl_samp'     title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendVoreport(\"" +
				url + "\",\"" + sampMType + "\", \"" + fileName + "\"); return false;'/></a>");
	};	
	var addPreviewControl = function(columnName, tdNode, url, fileName){
		var title = ((fileName != undefined)?fileName: "") + " preview";
		var x = "<a class='dl_download' title='Data preview' href='javascript:void(0);' onclick='ModalInfo.openIframePanel(\"" + url + "\", \"" + title + "\");'></a>";
		tdNode.append(x);
		
	};	
	var addDatalinkControl = function(url, tdNode, fovObject){
		tdNode.append("<a class='dl_datalink' title='Get LinkedData'/></a>");
		tdNode.children(".dl_datalink").first().click(function() {
			DataLinkBrowser.startCompliantBrowser(url, "forwardxmlresource", fovObject);
		});
	};
	
	/**************  another test of region control for this one we added ra,dec,rac_name,dec_name in our function. note that we can also use the first one that is commented  *********** */
	
		var addSTCRegionControl = function(tdNode, stcRegion,ra,dec,ra_name,dec_name) {
			var region =  new SRegion(stcRegion);
			tdNode.html("");
			tdNode.append("<a title='" + stcRegion + " (click to plot)' class='dl_stc' href='#'></a>");
			tdNode.append("<a class='dl_samp' title='Broadcast to SAMP'   href='#' onclick='WebSamp_mVc.fireSendAladinScript(&quot;" + region.getAladinScript() + "&quot;); return false;'/></a>");
			tdNode.first().click(function() {
				var tableBase=  dataTreePath.schema+"."+dataTreePath.table;
				var tab=  tableBase.quotedTableName().qualifiedName;
				var title = dataTreePath.nodekey+">"+tab;
		    	var label = "TAP "+ dataTreePath.nodekey + " " + tableBase;
				//var urlPath = myNodeInfo(dataTreeView.dataTreePath.nodekey).info.url;
				alixapi.showPopupData({
					     master: {
							 raCenter: ra, 
						     decCenter: dec, 
		                     raColumn: ra_name,
		                     decColumn: dec_name,
		                     //urlPath: urlPath, 
		                     tablePath: tab,  
							 label: label   
						 },
						 stcRegion: stcRegion,
						 region:region,
						 label: label
					});
				return false;
			});
	 };

	/**
	 * Get the URL infos asynchronously: formating must be achieved inside the callback
	 */
	var processURLInfo = function(columnName, url, tdNode, fovObject) {
		$.getJSON("getproductinfo", {jsessionid: "123456789", url: url}, function(jsdata) {
			if( Processing.jsonError(jsdata, "Cannot connect data") ) {
				tdNode.html("Error");
			} else {
				/*
				 * Extract useful header data
				 */
				var cd=null, ct=null, ce=null;
				var contentDisposition = "";
				var contentType = "";
				var contentEncoding = "";
				var secureMode=false;
				var sampMType = "";
				var fileName = "";
				/*
				 * HTTP header parsing
				 */
				$.each(jsdata, function(k, v) {
					if( k == 'ContentDisposition') {
						contentDisposition = v;
						var regex = new RegExp(/filename=(.*)$/) ;
						var results = regex.exec(v);
						if(results){
							fileName = results[1];
						}
					} else if( k == 'ContentType' ) {
						contentType = v;
						if( v.match(/fits$/) ) {
							sampMType = "table.load.fits";
						} else {
							sampMType = "table.load.votable";
						}
					} else if( k == 'ContentEncoding' ) {
						contentEncoding = v;
					} else if( k == 'nokey' &&  v.match('401')  ) {
						secureMode = true;
					}
				});		
				if( fileName == "" ){
					fileName = url.split("/").pop();
				}
				/*
				 * Put the right controls according to the context
				 */
				tdNode.html("");
				if( contentType.endsWith("content=datalink" ) ){
					addInfoControl(columnName, tdNode, url);
					addDatalinkControl(url,  tdNode, fovObject);
				} else if( contentType.match(/fits/) ||  contentType.match(/votable/)) {
					addInfoControl(columnName, tdNode, url);
					addDownloadControl(columnName, tdNode, url, secureMode, contentEncoding);
					addCartControl(columnName, tdNode, url, secureMode);
					addSampControl(columnName, tdNode, url, sampMType, fileName);
				} else if( contentType.startsWith("image/") || contentType.startsWith("text/") ){
					addInfoControl(columnName, tdNode, url);
					addPreviewControl(columnName, tdNode,url,  fileName);	
					addCartControl(columnName, tdNode, url, secureMode);
				} else {
					addInfoControl(columnName, tdNode, url);
					addDownloadControl(columnName, tdNode, url, secureMode, contentEncoding);
					addCartControl(columnName, tdNode, url, secureMode);
				}
			}
		});
	};
	/*
	 * exports
	 */
	var pblc = {};
	pblc.reset = reset;
	pblc.formatValue = formatValue;
	//pblc.addAlixButton=addAlixButton
	return pblc;
}();