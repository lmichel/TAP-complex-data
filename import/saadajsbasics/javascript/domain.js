
/***********************************************************************************************
 * Javascript classes common to all Web application supported by LM
 * These classes  refer to some basic web resource
 * 
 * Content:
 * - Modalinfo.simbad : open a Simbad view in a modal dialog
 * - Modalinfo.uploadForm : open a Simbad dialog box handling file upload 
 * and all Query editor components
 * - DataLinkBrowser
 * Required external resources 
 * - basics.js
 * - jquery-ui
 * - jquery.alerts
 * - jquery.datatables
 * - jquery.simplemodal
 * - jquery.prints
 * - jquery.tooltip
 * - jquery.forms
 * 
 * Laurent Michel 20/12/2012
 */

var supportedUnits =  [
                       {id: 'none', text: "none"}

                       , {id: 'Power_erg/s', text: "erg/s"}
                       , {id: 'Power_W', text: "W"}

                       , {id: 'Flux_erg/s/cm2', text: "erg/s/cm2"}
                       , {id: 'Flux_Jy', text: "Jy"}
                       , {id: 'Flux_mJy', text: "mJy"}
                       , {id: 'Flux_mJy', text: "mJy"}

                       , {id: 'Angle_deg', text: "deg"}
                       , {id: 'Angle_arcmin', text: "arcmin"}
                       , {id: 'Angle_arcsec', text: "arcsec"}
                       , {id: 'Angle_h:m:s', text: "h:m:s"}

                       , {id: 'Velocity_m/s', text: "m/s"}
                       , {id: 'Velocity_km/s', text: "km/s"}
                       , {id: 'Velocity_km/h', text: "km/h"}
                       , {id: 'Velocity_mas/yr', text: "mas/yr"}

                       , {id: 'Length_kpc', text: "kpc"}
                       , {id: 'Length_pc', text: "pc"}
                       , {id: 'Length_AU', text: "AU"}
                       , {id: 'Length_km', text: "km"}
                       , {id: 'Length_m', text: "m"}
                       , {id: 'Length_cm', text: "cm"}
                       , {id: 'Length_mm', text: "mm"}
                       , {id: 'Length_um', text: "um"}
                       , {id: 'Length_nm', text: "nm"}
                       , {id: 'Length_Angstroem', text: "Angstroem"}

                       , {id: 'Energy_erg', text: "erg"}
                       , {id: 'Energy_eV', text: "eV"}
                       , {id: 'Energy_keV', text: "keV"}
                       , {id: 'Energy_MeV', text: "MeV"}
                       , {id: 'Energy_GeV', text: "GeV"}
                       , {id: 'Energy_TeV', text: "TeV"}
                       , {id: 'Energy_J', text: "J"}
                       , {id: 'Energy_ryd', text: "ryd"}

                       , {id: 'Frequency_Hz', text: "Hz"}
                       , {id: 'Frequency_KHz', text: "KHz"}
                       , {id: 'Frequency_MHz', text: "MHz"}
                       , {id: 'Frequency_GHz', text: "GHz"}
                       , {id: 'Frequency_THz', text: "THz"}

                       , {id: 'Time_y', text: "y"}
                       , {id: 'Time_d', text: "d"}
                       , {id: 'Time_h', text: "h"}
                       , {id: 'Time_mn', text: "mn"}
                       , {id: 'Time_sec', text: "sec"}
                       , {id: 'Time_msec', text: "msec"}
                       , {id: 'Time_nsec', text: "nsec"}
                       ];

function STCRegion(stcString) {
	this.stcString = stcString;
	this.size = 0.0;
	this.raCenter = 0.0;
	this.decCenter = 0.0;			
	this.points = [];

	this.init();
}
STCRegion.prototype = {
		init: function(){
			var elements  = this.stcString.split(" ");
			var coords = [];
			/*
			 * Extract coordinates from STC string
			 */
			for( var i=0 ; i<elements.length ; i++){
				if( isNumber(elements[i])) {
					coords.push(parseFloat(elements[i]));
				}
			}
			if((coords.length %2) ){
				Modalinfo.error("STC Region " + this.stcString + " is not valid");
			} else {
				/*
				 * Get the coords extrema
				 */
				var raMin = 360, raMax = 0;
				var decMin = 90, decMax = -90;
				for( var i=0 ; i<(coords.length/2) ; i++){
					var ra = coords[2*i];
					var dec = coords[(2*i) + 1];
					if( ra > raMax ) raMax = ra;
					if( ra < raMin ) raMin = ra;
					if( dec > decMax ) decMax = dec;
					if( dec < decMin ) decMin = dec;
				}
				/*
				 * Get size and center
				 */
				var width = Math.abs(raMin - raMax);
				var height = Math.abs(decMin - decMax);
				this.size = (width > height) ? width: height;
				this.raCenter = raMin + width/2;
				if( this.raCenter > 360 ) this.raCenter -= 360;
				this.decCenter = decMin + height/2;
				if( this.decCenter > 90 ) this.decCenter -= 90;
				/*
				 * Build the point array for Aladin Lite
				 */
				for( var i=0 ; i<(coords.length/2) ; i++){
					this.points.push([coords[2*i], coords[(2*i) + 1]]);

				}
				this.points.push([coords[0], coords[1]]);
			}

		},
		getAladinScript : function(list){
			return this.stcString + ";sync; " 
			+ this.raCenter.toFixed(6) + " " + this.decCenter.toFixed(6) + ";sync;" 
			+ " zoom " + 2*this.size + " deg;";
		}
}
/**
 * Object modeling a dataTreePath
 * 
 * Code de test sur JSFILLDE
	var dtp = new DataTreePath({signature:"a.b.c"});
	alert(JSON.stringify(dtp));
	dtp = new DataTreePath({nodekey:"node", schema: "schema", table: "table"});
	alert(JSON.stringify(dtp));
	dtp = new DataTreePath({nodekey:"node", schema: "schema", tableorg: "tableorg"});
	alert(JSON.stringify(dtp));
	dtp = new DataTreePath({nodekey:"node", schema: "schema", table: "table", tableorg: "tableorg"});
	alert(JSON.stringify(dtp));
	dtp = new DataTreePath({nodekey:"node", schema: "schema", table: "table", tableorg: "tableorg", jobid: "jobid"});
	alert(JSON.stringify(dtp));
 *
 * Used to make sure that dataTreePath given as parameters as more or less consistent 
 * @param params
 * @returns {DataTreePath}
 */
function DataTreePath(params){
	this.nodekey = "notset";
	this.schema = "notset";
	this.table = "notset";
	this.tableorg = "notset";
	this.jobid = "";
	this.key = "notset";
	/*
	 * received a signature like nodekey.schema.table
	 */
	if( 'signature' in params ){
		var fields = params.signature.split(".");
		this.nodekey = fields[0];
		if( fields.length > 1 ) {
			this.schema = fields[1];
			if( fields.length > 2 ) {
				this.table = fields[2];
				this.tableorg = fields[2];
				if( fields.length > 3 ) {
					this.jobid = fields[3];
				}
			}
		}
		/*
		 * received fields in a JSON object
		 */	
	} else {
		if( 'jobid' in params ){
			this.jobid = params.jobid;
		}
		if( 'nodekey' in params ){
			this.nodekey = params.nodekey;
		}
		if( 'schema' in params ){
			this.schema = params.schema;
		}
		if( 'table' in params ){
			this.table = params.table;
		}
		if( 'tableorg' in params ){
			this.tableorg = params.tableorg;
		}
		if(  this.table == "notset" && this.tableorg != "notset")
			this.table = this.tableorg;
		else if(  this.table != "notset" && this.tableorg == "notset")
			this.tableorg = this.table;
	}
	this.key = this.nodekey + "." + this.schema + "." + this.tableorg + ((this.jobid)? ("." + this.jobid): "");
};

MetadataSource = function() {
	var getMetaTableUrl = null;
	var getJoinedTablesUrl = null;
	var getUserGoodieUrl = null;
	var isAjaxing = false;
	/*
	 * buffer = {  dataTreePath
	 *   hamap <== map of ah
	 *   targets:[{target_datatreepath, source columns, target column}...]
	 *
	 * cache = map<DataTreePath.key, buffer>
	 */
	var cache = new Object;
	/**
	 * private methods
	 */
	/*
	 * setAttMap: Normalize AHs and store them in the buffer
	 */
	var buildAttMap = function (data){
		var hamap  = new Array();
		if( data.attributes ) {
			for( var i=0 ; i<data.attributes.length ; i++ ){
				var ah = data.attributes[i];
				/*
				 * Make sure that all naming fields are populated
				 * if possible:
				 */
				if( !ah.nameattr && ah.column_name  ) {
					ah.nameattr = ah.column_name;
				} else if( ah.nameattr && !ah.column_name ) {
					ah.column_name = ah.nameattr ;
				}
				if( !ah.nameattr  && ah.nameorg ){
					ah.nameattr = ah.nameorg ;
					ah.column_name = ah.nameorg ;
				} else if (!ah.nameorg ) {
					ah.nameorg = ah.nameattr ;
				}
				hamap.push(ah);
			}
		} 
		return hamap;
	};
	/**
	 * public methods
	 */
	/**
	 * init(): params : {getMetaTable, getJoinedTables, getUserGoodie}
	 */
	var init = function (params) {
		if( 'getMetaTable' in params ){
			getMetaTableUrl = params.getMetaTable;
		}
		if( 'getJoinedTables' in params ){
			getJoinedTablesUrl = params. getJoinedTables;
		}
		if( 'getUserGoodie' in params ){
			getUserGoodieUrl = params.getUserGoodie;
		}
	};
	/**
	 * dataTreePath: instance of the classe DataTreePath
	 * handler(data) called when requested datra are retreived. 
	 * These data are passed as parameter {ahmap
	 */
	var getTableAtt =  function(dataTreePath /* instance of DataTreePath */, handler){
		/*
		 * Query a new node
		 */
		//key = JSON.stringify(dataTreePath) ;
		key = dataTreePath.key;
		if(  cache[key] == undefined ) {
			var buffer = {};
			buffer.dataTreePath = dataTreePath;		
			buffer.hamap        = new Array();
			buffer.relations    = new Array(); // utilisees par Saada
			buffer.classes      = new Array(); // utilisees par Saada
			buffer.targets      = new Array();
			if( getMetaTableUrl != null ) {
				isAjaxing = true;
				Out.info("Connect new node  " + key);

				var params = {jsessionid: this.sessionID, nodekey: buffer.dataTreePath.nodekey, schema:buffer.dataTreePath.schema, table:buffer.dataTreePath.table};
				Processing.show("Get column description of table " +JSON.stringify(dataTreePath) );
				$.ajax({
					url: getMetaTableUrl,
					dataType: 'json',
					async: false,
					data: params,
					success:  function(data)  {
						Processing.hide();
						if( !Processing.jsonError(data)) {
							buffer.hamap = buildAttMap(data);
							if( data.relations!= undefined ){
								buffer.relations = data.relations;
							} else{
								buffer.relations = [];
							}
							if( data.classes!= undefined ){
								buffer.classes = data.classes;
							} else{
								buffer.classes = [];
							}
							isAjaxing = false;
							cache[key] = buffer;
						}
					}
				});

				if( getJoinedTablesUrl != null) {
					Processing.show("Waiting on join keys " + getJoinedTablesUrl);
					$.ajax({
						url: getJoinedTablesUrl,
						dataType: 'json',
						async: false,
						data: params,
						success:  function(jdata)  {
							Processing.hide();
							if( jdata && !jdata.errormsg )  {
								var dt = jdata.targets;			
								for( var i=0 ; i<dt.length ; i++ ) {
									var t = dt[i];
									var st = t.target_table.split('.');
									var schema, table;
									if( st.length > 1) {
										schema =  st[0]; table = st[1];
									} else {										
										schema =  dataTreePath.schema; table = st[0];
									}
									var tdtp = new DataTreePath({nodekey: dataTreePath.nodekey, schema: schema, table: table});
									buffer.targets.push({target_datatreepath: tdtp, target_column: t.target_column, source_column: t.source_column});
								}
							} else {
								Out.info((jdata == null)? 'Empty data' : jdata.errormsg);
							}
							isAjaxing = false;
							cache[key] = buffer;
							if( handler != null ) handler(cache[key]);
						}
					});
				}  else {
					if( handler != null ) handler(cache[key]);
				}
			}
			return cache[key];
			/*
			 * Meta data are in the cache
			 */
		} else  {
			Out.info("get stored node  " + JSON.stringify(dataTreePath) + " length = " + cache[key].hamap.length);
			if( handler!= null ) handler(cache[key]); else Out.info("No handler");
			return cache[key];
		}
	};
	var getRelations =  function(dataTreePath /* instance of DataTreePath */){
		if( cache[dataTreePath.key] == undefined )
			this.getTableAtt(dataTreePath);
		return cache[dataTreePath.key].relations;
	};
	var getClasses =  function(dataTreePath /* instance of DataTreePath */){
		if( cache[dataTreePath.key] == undefined )
			this.getTableAtt(dataTreePath);
		return cache[dataTreePath.key].classes;
	};
	var getTableAttASync =  function(dataTreePath /* instance of DataTreePath */, handler){
		/*
		 * Query a new node
		 */
		if( isAjaxing ) {
			setTimeout(function(){MetadataSource.getTableAtt(dataTreePath, handler);}, 100);
			return;
		} 
		//console.log("Looking for " + JSON.stringify(dataTreePath) + " " + isAjaxing);
		if( !cache || !cache[dataTreePath.key] ) {
			buffer = {};
			buffer.dataTreePath = dataTreePath;		
			buffer.hamap        = new Array();
			buffer.targets      = new Array();
			if( getMetaTableUrl != null ) {
				isAjaxing = true;

				var params = {jsessionid: this.sessionID, nodekey: buffer.dataTreePath.nodekey, schema:buffer.dataTreePath.schema, table:buffer.dataTreePath.tableorg};
				//console.log("Looking for " + JSON.stringify(dataTreePath) + " " + isAjaxing);
				Processing.show("Get column description of table " +JSON.stringify(dataTreePath) );
				$.getJSON(getMetaTableUrl
						, params
						, function(data)  {
					Processing.hide();
					if( !Processing.jsonError(data)) {
						buffer.hamap = buildAttMap(data);
						if( getJoinedTablesUrl) {
							Processing.show("Waiting on join keys " + getJoinedTablesUrl);
							$.getJSON(getJoinedTablesUrl
									, params
									, function(jdata) {
								Processing.hide();
								if( jdata && !jdata.errormsg )  {
									var dt = jdata.targets;			

									for( var i=0 ; i<dt.length ; i++ ) {
										var t = dt[i];
										var st = t.target_table.split('.');
										var schema, table;
										if( st.length > 1) {
											schema =  st[0]; table = st[1];
										} else {										
											schema =  dataTreePath.schema; table = st[0];
										}
										var tdtp = new DataTreePath({nodekey: dataTreePath.nodekey, schema: schema, table: table});
										buffer.targets.push({target_datatreepath: tdtp, target_column: t.target_column, source_column: t.source_column});
									}
								} else {
									Out.info((jdata == null)? 'Empty data' : jdata.errormsg);
								}
								isAjaxing = false;
								cache[dataTreePath.nodekey] = buffer;
								if( handler != null ) handler();
							});
						} else {
							isAjaxing = false;
							cache[dataTreePath.nodekey] = buffer;
							if( handler != null ) {
								if( handler != null ) handler();
							}
						}
					}
				});
			} else {
				Out.info("No getMetaTableUrl provided" );
			}
			/*
			 * Meta data are in the cache
			 */
		} else if( cache[dataTreePath.nodekey] ) {
			Out.info("get stored node  " + dataTreePath.nodekey + " length = " + cache[dataTreePath.nodekey].hamap.length);
			if( handler!= null ) handler(); else Out.info("No handler");
			return cache[dataTreePath.nodekey].hamap;
		}
	};
	var test =  function(){
		MetadataSource.init({getMetaTable: "gettableatt", getJoinedTables: "gettablejoin", getUserGoodie: null});
		var dataTreePath = new DataTreePath({nodekey:'node', schema: 'schema', table: 'table', tableorg: 'schema.table'});
		MetadataSource.getTableAtt(
				dataTreePath
				, function() {
					console.log("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
					console.log("joinedTables " + JSON.stringify(MetadataSource.joinedTables(dataTreePath)));	
					//	alert("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
				});
		MetadataSource.getTableAtt(
				dataTreePath
				, function() {
					console.log("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
					console.log("joinedTables " + JSON.stringify(MetadataSource.joinedTables(dataTreePath)));	
					//	alert("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
				});
	};

	var getJoinedTables =  function(){};
	var getUserGoodie =  function(){};
	var setJobColumns =  function(){};

	/*
	 * exports
	 */
	var pblc = {};
	pblc.ahMap        = function(dataTreePath){return(!cache)?null: cache[dataTreePath.key].hamap;};
	pblc.relations        = function(dataTreePath){return(!cache)?null: cache[dataTreePath.key].relation;};
	pblc.joinedTables = function(dataTreePath){return(!cache)?null: cache[dataTreePath.key].targets;};
	pblc.init = init;
	pblc.getTableAtt = getTableAtt;
	pblc.getRelations = getRelations;
	pblc.getClasses = getClasses;
	pblc.getJoinedTables = getJoinedTables;
	pblc.getUserGoodie = getUserGoodie;
	pblc.setJobColumns = setJobColumns;
	pblc.test = test;
	return pblc;	
}();

/**		
 * Opens thje region editor
 * The data passed to the  handler look like that:
		    {isReady: true,             // true if the polygone is closed
		    userAction: userAction,     // handler called after the user have clicked on Accept
		    region : {
		        format: "array2dim",    // The only one suported yet [[x, y]....]
		        points: this.poligone.skyPositions  // array with structire matching the format
		        size: {x: , y:} // regiosn size in deg
		        }
 * @param handler handler to be called when the polygone is complete ao accepted
 * @param points object denoted the initial value of the polygone {type: ... value:} type is format of the 
 * value (saadaql or array) and value is the data string wich will be parsed
 */
Modalinfo.regionEditor = null;


/**
 * Used to debug the isseu with multiple aladin instance running at the same time
 */
Modalinfo.regionForAMDebugging = function (handler, points) {		
	$(document.documentElement).append('<div id="aladin-lite-div" style="width: 400px; height: 400px"></div>');
	this.regionEditor = new RegionEditor_mVc  ("aladin-lite-div", handler, points); 
	this.regionEditor.init();
	$('#aladin-lite-div').dialog({ modal: true
		, width: 'auto'
			, dialogClass: 'd-maxsize'
				, title: "title" 		  
					, zIndex: zIndexModalinfo
	});	
	$(".aladin-box").css("z-index", (zIndexModalinfo + 2));

	this.regionEditor.setInitialValue(points);
}




/**
 * Modalinfo extension extension handling a file upload
 * All parameters are required (even null)
 * - title: dialog box title
 * - url: Upload url: This servlet is supposed to return the JSON message which will be displayed
 * - description: HTML text describing the service
 * - handler is called in case of success with the object {path, retour} as parameter
 *   where retour is the object returned by the server: {name, size} usually and path 
 *   results from uploaded filepath parsing {path, filename}
 * - beforeHandler is called before the download starts
 * - extraParamers: [{name, value}]: List of hidden parameters to be set with in addition to the file upload
 */
/*Modalinfo.uploadForm = function (title, url, description, handler, beforeHandler, extraParamers) {
	var htmlForm = '<form id="uploadPanel" target="_sblank" action="' + url + '" method="post"'
	+  'enctype="multipart/form-data">';
	if( extraParamers != null) {
		for( var i=0 ; i<extraParamers.length ; i++ ) 
			htmlForm += "<input type='hidden'  name='" + extraParamers[i].name + "'  value='" + extraParamers[i].value + "'>";
	}
	htmlForm += ' <input class=stdinput  id="uploadPanel_filename" type="file" name="file" /><br>'
		+ ' <p class=help></p><br>'
		+ '    <input  type="submit" value="Upload" />'
		+ '</form>';	
	Modalinfo.dataPanel(title, htmlForm, null);

	if( description != null ) {
		$('#uploadPanel p').html(description);
	}
	$('form#uploadPanel').ajaxForm({
		beforeSubmit: function() {
			if(beforeHandler != null ) {
				beforeHandler();
			}
		},
		success: function(e) {
			if( Processing.jsonError(e, "Upload Position List Failure") ) {
				Modalinfo.close();
				return;
			} else {
				Out.debug("Upload success: " + JSON.stringify(e));
				if( handler != null) {
					var retour = {retour: e, path : $('#uploadPanel_filename').val().xtractFilename()};
					handler(retour);
				}
			}
		}
	});
};*/

/**
 * Singleton object wrapping the creation of query editor forms
 */
QueryConstraintEditor = function() {
	var nativeConstraintEditor = function (params /*{parentDivId, formName, getMetaUrl, queryView*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new ConstQEditor_mVc(params /*{parentDivId,formName,queryView}*/);
		new ConstQEditor_mvC(view, new ConstQEditor_Mvc());
		view.draw();
		return view;
	};
	var ucdConstraintEditor = function (params /*{parentDivId, formName, queryView, help}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new UcdQEditor_mVc(params /*{parentDivId,formName,queryView, help}*/);
		var mod = new UcdQEditor_Mvc();
		new ConstQEditor_mvC(view, mod);
		view.draw();
		return view;
	};
	var ucdPatternEditor = function (params /*{parentDivId, formName, queryView, relationName, help}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new UcdPatternEditor_mVc(params /*{parentDivId, formName, queryView, help}*/);
		var mod = new UcdPatternEditor_Mvc(params.relationName);
		new ConstQEditor_mvC(view, mod);
		view.draw();
		return view;
	};
	//FIT
	var FitPatternEditor = function (params /*{parentDivId, formName, queryView, relationName, help}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new  FitPatternEditor_mVc(params /*{parentDivId, formName, queryView, help}*/);
		var mod = new FitPatternEditor_Mvc(params.relationName,params.className);
		new ConstQEditor_mvC(view, mod);
		view.draw();
		return view;
	};
	var FitAttachedPatternsEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new FitAttachedPatterns_mVc(params);
		view.draw();
		return view;
	};
	var FitBestModelAttachedPatternEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new FitBestModelAttachedPattern_mVc(params);
		view.draw();
		return view;
	};
	var FitBetterModelAttachedPatternEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new FitBetterModelAttachedPattern_mVc(params);
		view.draw();
		return view;
	};
	var FitOrderModelAttachedPatternEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new FitOrderModelAttachedPattern_mVc(params);
		view.draw();
		return view;
	};
	//
	var matchPatternEditor = function (params /*{{parentDivId,formName,queryView:}*/) {
		var view  = new Pattern_mVc(params);
		view.draw();
		return view;
	};
	var posConstraintEditor = function (params /*{parentDivId, formName, queryView, frames, urls}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new PosQEditor_mVc(params);
		var mod = new PosQEditor_Mvc();
		new ConstQEditor_mvC(view, mod);
		view.draw();
		return view;
	};
	var simplePosConstraintEditor = function (params /*{parentDivId, formName, queryView, frames, urls}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new SimplePos_mVc(params);
		view.draw();
		return view;
	};
	var catalogueConstraintEditor = function (params /*{parentDivId, formName, getMetaUrl, queryView, relationName, distanceQualifer, help}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new CatalogueQEditor_mVc(params);
		var mod = new CatalogueQEditor_Mvc(params);
		new ConstQEditor_mvC(view, mod);
		view.draw();
		return view;
	};
	var crossidConstraintEditor = function (params /*{parentDivId, formName, getMetaUrl, queryView, relationName, probaQualifier, help}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new CatalogueQEditor_mVc(params);
		var mod = new CrossidQEditor_Mvc(params);
		new ConstQEditor_mvC(view, mod);
		view.draw();
		return view;
	};
	var attachedDataEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new AttachedData_mVc(params);
		view.draw();
		return view;
	};
	var attachedPatternEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new AttachedPattern_mVc(params);
		view.draw();
		return view;
	};
	var attachedPatternsEditor = function(params /*{parentDivId, formName, queryView, title, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new AttachedPatterns_mVc(params);
		view.draw();
		return view;
	};
	var attachedMatchEditor = function(params /*{parentDivId, formName, queryView, title, relation, pattern, products}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new AttachedMatch_mVc(params);
		view.draw();
		return view;
	};
	var vizierKeywordsEditor = function(params /*{parentDivId, formName, queryView, title, getMetaUrl*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view =  new VizierKeywords_mVc(params);
		view.draw();
		return view;
	};

	var tapColumnSelector = function (params /*{parentDivId, formName, queryView, currentNode}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" +params. parentDivId + " not found");
			return ;
		}
		var view  = new tapColSelector_mVc(params);
		new ConstQEditor_mvC(view, new tapColSelector_Mvc());
		view.draw();
		return view;
	};

	var tapConstraintEditor = function (params /*parentDivId, formName, sesameUrl*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new tapQEditor_mVc(params /*parentDivId, formName, sesameUrl*/);
		new ConstQEditor_mvC(view, new tapQEditor_Mvc());
		view.draw();
		return view;
	};

	var tapPosSelector = function (params /*parentDivId, formName, sesameUrl, upload { url, postHandler, preloadedGetter}, queryView, currentNode }*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new tapPosQEditor_mVc(params /*parentDivId, formName, sesameUrl, upload { url, postHandler, preloadedGetter}, queryView, currentNode }*/);
		new ConstQEditor_mvC(view, new tapPosQEditor_Mvc());
		view.draw();
		return view;
	}
	
	
	var tapCrossMatchSelector = function (params) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new tapCrossMatchQEditor_mVc(params /*parentDivId, formName, sesameUrl, upload { url, postHandler}, queryView, currentNode }*/);
		new ConstQEditor_mvC(view, new tapPosQEditor_Mvc());
		view.draw();
		return view;
	}

	var queryTextEditor= function (params) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new QueryTextEditor_mVc(params);
		var mod = new QueryTextEditor_Mvc();
		new QueryTextEditor_mvC(view, mod);
		view.draw();
		return view;
		;
	};
	var adqlTextEditor= function (params) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new QueryTextEditor_mVc(params);
		var mod = new ADQLTextEditor_Mvc();
		new QueryTextEditor_mvC(view, mod);
		view.draw();
		return view;
		;
	};
	/*
	 * exports
	 */
	var pblc = {};
	pblc.nativeConstraintEditor = nativeConstraintEditor;
	pblc.ucdConstraintEditor = ucdConstraintEditor;
	pblc.ucdPatternEditor = ucdPatternEditor;
	pblc.FitPatternEditor = FitPatternEditor;
	pblc.FitAttachedPatternsEditor = FitAttachedPatternsEditor;
	pblc.FitBestModelAttachedPatternEditor = FitBestModelAttachedPatternEditor;
	pblc.FitBetterModelAttachedPatternEditor = FitBetterModelAttachedPatternEditor;
	pblc.FitOrderModelAttachedPatternEditor = FitOrderModelAttachedPatternEditor;
	pblc.matchPatternEditor = matchPatternEditor;
	pblc.posConstraintEditor = posConstraintEditor;
	pblc.simplePosConstraintEditor = simplePosConstraintEditor;
	pblc.attachedDataEditor = attachedDataEditor;
	pblc.attachedPatternEditor = attachedPatternEditor;
	pblc.attachedPatternsEditor = attachedPatternsEditor;
	pblc.attachedMatchEditor = attachedMatchEditor;
	pblc.vizierKeywordsEditor = vizierKeywordsEditor;
	pblc.catalogueConstraintEditor = catalogueConstraintEditor;
	pblc.crossidConstraintEditor = crossidConstraintEditor;
	pblc.tapConstraintEditor = tapConstraintEditor;
	pblc.tapColumnSelector = tapColumnSelector;
	pblc.tapPosSelector = tapPosSelector;
	pblc.tapCrossMatchSelector = tapCrossMatchSelector;
	pblc.queryTextEditor = queryTextEditor;
	pblc.adqlTextEditor = adqlTextEditor;
	return pblc;
}();

/**
 * This object open a dialog box handling the datalink returned by 
 * baseurl. Forwardurl is a proxy url which can be setup to wor aroubf XDomain issues.
 *   in this case, the datalink description is searched at forwardurl + encodeURI(baseurl)
 */
DataLinkBrowser = function() {
	var startBrowser = function (baseurl, forwardurl) {
		var view  = new DataLink_mVc({baseurl: baseurl,forwardurl:forwardurl });
		var mod = new DataLink_Mvc();
		new DataLink_mvC(view, mod);
		view.draw();
		return view;
		;
	};
	/*
	 * The dataObject should contain some value of the data row from which the Datalink popup has ben called
	 * This might help to get the parameter ranges and the obs_did
	 * if must have the form {key: value...}
	 * positional parameter must be complaient with Obscore (s_ra/dev/fov)
	 */
	var startCompliantBrowser = function (baseurl, forwardurl, dataObject) {
		var view  = new CompliantDataLink_mVc({baseurl: baseurl,forwardurl:forwardurl, dataobject: dataObject});
		var mod = new DataLink_Mvc();
		new DataLink_mvC(view, mod);
		view.draw();
		return view;
		;
	};
	/*
	 * exports
	 */
	var pblc = {};
	pblc.startBrowser = startBrowser;
	pblc.startCompliantBrowser = startCompliantBrowser;
	return pblc;
}();


CustomDataTable = function () {
	// Used to add custom content
	var custom = 0;
	var custom_array = [];

	/**
	 * Create a dataTable
	 * @param options are the parameters of the dataTable like:
	 * options = {
	 				"aoColumns" : columns,
	 				"aaData" : rows,
	 				"bPaginate" : true,
	 				"bSort" : true,
	 				"bFilter" : true
	 			  };
	 * @param position tells what components to add with the table and their position
	 * 6 positions available: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
	 * 5 basic components available: filter, length, pagination, information, processing
	 * var position = [
 			{ "name": "pagination",
 			  "pos": "top-left"
 			},
 			{ "name": "length",
 	 			  "pos": "top-center"
 	 		},
 			{ "name": "<p>DataTable</p>",
 			  "pos" : "top-center"
 			},
 			{ "name": 'filter',
 	 			  "pos" : "bottom-center"
 	 		},
 			{ "name": "information",
 	 	 		  "pos" : "bottom-right"
 	 	 	}
 	 	];
	 **/
	var create = function(id, options, position) {
		// Remove filter label and next previous label
		if (options["sPaginationType"] != undefined) {
			if (options["sPaginationType"] === "full_numbers") {
				options = addSimpleParameter(options, "oLanguage", {"sSearch": ""});
			}
		}
		else {
			options = addSimpleParameter(options, "oLanguage", {"sSearch": "", "oPaginate": { "sNext": "", "sPrevious": "" }});
		}

		// Positioning the elements
		if (position != undefined) {
			options = addSimpleParameter(options, "sDom", changePosition(position));
		}				
		var table = $('#' + id).dataTable(options);

		// Adding the custom content
		if (position != undefined) {
			custom_array.forEach(function(element) {
				$("div.custom"+element.pos).html(element.content);
			});
			ModalResult.changeFilter(id);
		}		
		$('#' + id + "_wrapper").css("overflow","inherit");
		return table;
	};

	/**
	 * Add a parameter to the @options of the dataTable
	 * @options: object, options of the dataTable
	 * @parameter: name of the parameter
	 * @value: value of the parameter
	 **/
	var addSimpleParameter = function(options, parameter, value) {
		options[parameter] = value;		
		return options;
	}

	/**
	 * Create the dom according to the components and positions asked
	 * @position: object, indicate the position of the different elements
	 **/
	var changePosition = function(position) {
		var dom = '';	
		var top_left = [];
		var top_center = [];
		var top_right = [];
		var bot_left = [];
		var bot_center = [];
		var bot_right = [];

		position.forEach(function(element) {
			switch (element.pos) {
			case "top-left":
				top_left.push(getDomName(element.name));
				break;
			case "top-center":
				top_center.push(getDomName(element.name));
				break;
			case "top-right":
				top_right.push(getDomName(element.name));
				break;
			case "bottom-left":
				bot_left.push(getDomName(element.name));
				break;
			case "bottom-center":
				bot_center.push(getDomName(element.name));
				break;
			case "bottom-right":
				bot_right.push(getDomName(element.name));
				break;
			}
		});	

		// Search the number of position asked for which row to know the size of the div columns
		var nb_top = 0;
		if (top_left.length > 0) {
			nb_top++;
		}
		if (top_center.length > 0) {
			nb_top++;
		}
		if (top_right.length > 0) {
			nb_top++;
		}
		nb_top = Math.floor(12/nb_top);

		var nb_bot = 0;
		if (bot_left.length > 0) {
			nb_bot++;
		}
		if (bot_center.length > 0) {
			nb_bot++;
		}
		if (bot_right.length > 0) {
			nb_bot++;
		}
		nb_bot = Math.floor(12/nb_bot);

		if (nb_top > 0) {
			dom += '<"row"'
		}

		if (top_left.length > 0) {
			dom += '<"txt-left col-xs-'+nb_top+'"';
			top_left.forEach(function(element) {
				dom += '<"side-div"'+element+'>';
			});
			dom += ">";
		}
		if (top_center.length > 0) {
			dom += '<"txt-center col-xs-'+nb_top+'"';
			top_center.forEach(function(element) {
				dom += '<"side-div"'+element+'>';
			});
			dom += ">";
		}
		if (top_right.length > 0) {
			dom += '<"txt-right col-xs-'+nb_top+'"';
			top_right.forEach(function(element) {
				dom += '<"side-div"'+element+'>';
			});
			dom += ">";
		}

		if (nb_top > 0) {
			dom += ">";
		}

		dom += '<"custom-dt" rt>'

			if (nb_bot > 0) {
				dom += '<"row"';
			}	

		if (bot_left.length > 0) {
			dom += '<"txt-left col-xs-'+nb_bot+'"';
			bot_left.forEach(function(element) {
				dom += '<"side-div"'+element+'>';
			});
			dom += ">";
		}
		if (bot_center.length > 0) {
			dom += '<"txt-center col-xs-'+nb_bot+'"';
			bot_center.forEach(function(element) {
				dom += '<"side-div"'+element+'>';
			});
			dom += ">";
		}
		if (bot_right.length > 0) {
			dom += '<"txt-right col-xs-'+nb_bot+'"';
			bot_right.forEach(function(element) {
				dom += '<"side-div"'+element+'>';
			});
			dom += ">";
		}

		if (nb_bot > 0) {
			dom += ">";
		}

		return dom;
	}

	/**
	 * Return the real dom name of the basic components and create div for the custom ones
	 * @name: explicit name of a basic component or name of a custom one
	 **/
	var getDomName = function(name) {
		var dom_name;

		switch (name) {
		case "filter":
			dom_name = "f";
			break;
		case "pagination":
			dom_name = "p";
			break;
		case "information":
			dom_name = "i";
			break;
		case "length":
			dom_name = "l";
			break;
		case "processing":
			dom_name = "r";
			break;
		default:
			// If it's not a basic component, create a div with a unique class
			dom_name = '<"custom'+custom+'">';
		// Push the element in an array in order to add it later thanks to its unique class
		custom_array.push({"content": name, "pos": custom});
		custom++;
		break;
		}

		return dom_name;
	}

	var pblc = {};
	pblc.create = create;

	return pblc;
}();
//Receive data and do the plot
Modalinfo.plot=function(url){
	//Ajax call
	$.get(url,function(data){
		//Set a modal and customize it
		var id_modal = Modalinfo.nextId();
		Modalinfo.setModal(id_modal, false,"Detection Plots");
		Modalinfo.addIconTitle(id_modal, '<span class="fi-graph-trend"></span>');
		$("#"+id_modal).dialog( "option", "height", $(window).height());
		$("#"+id_modal).dialog( "option", "width", "80%");	
		$("#"+id_modal).dialog( "option", "position", { my: "center", at: "center", of: window } );	
		Modalinfo.setShadow(id_modal);
		Modalinfo.whenClosed(id_modal);
		//Create PlotSuccess object
		plotsuccess=new PlotSuccess();  
		//Parse the data
		var dataparse=JSON.parse(data.replace(/NaN/g, '"NaN"'));
		//Delete NaN object from the array data 
		for(var i=0;i<dataparse.data.length;i++){
			for(var j=0;j<dataparse.data[i].data.length;j++){
				for(var k=0;k<dataparse.data[i].data[j].data.length;k++){
					for(var n=0;n<dataparse.data[i].data[j].data[k].data.length;n++){
						var index=dataparse.data[i].data[j].data[k].data[n].indexOf("NaN");
						if (index > -1) {
							dataparse.data[i].data[j].data[k].data.splice(n, 1);
							n=n-1
						} 
					}
					if(dataparse.data[i].data[j].data[k].data.length==0){
						dataparse.data[i].data[j].data.splice(k, 1)
						k=k-1
					}
				}   
			}   
		}
		//Sort the date into ascending order using triasc function
		function triasc(d1,d2) {
			return d1[0] - d2[0];}
		for(var i=0;i<2;i++){
			for(var j=0;j<dataparse.data[i].data.length;j++){
				for(var k=0;k<dataparse.data[i].data[j].data.length;k++){
					dataparse.data[i].data[j].data[k].data.sort(triasc);
				}   
			}   
		}
		//Call the function of plot
		plotsuccess.plotAll(id_modal,dataparse);
		//Animate the modal by three onglets 
		$('#ongletsgraphs').tabs();
	}).fail(function() {
		Modalinfo.error("JSON ERROR", "Error");
	});
};
