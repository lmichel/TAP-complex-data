/**
 * Loads automatically all css scripts used by saadahsbasics
 * Files are loaded one by one keeping that wy the initial order.
 * That make sure not to  break dependencies or style rules overriding
 * 
 * This class is a JS singleton.
 */
resourceLoader = function() {
	/*
	 * JS directories and files
	 */
	var baseScriptDir = "import/saadajsbasics";
	var jsimportsDir  = baseScriptDir + "/jsimports/";
	var javascriptDir = baseScriptDir + "/javascript/";
	var local_js = ["basics.js"
	                , "WebSamp"
	                , "KWConstraint"
	                , "AttachedData_v.js"
	                , "VizierKeywords_v.js"
	                ,"OrderBy_v.js"
	                , "ConeSearch_v.js"
	                , "ConstList_v.js"
	                , "FieldList_v.js"
	                , "Sorter_v.js"
	                , "Pattern_v.js"
	                , "DataLink"
	                , "ConstQEditor"
	                , "QueryTextEditor"
	                , "domain.js"
	                , "AstroCoo.js"
	                , "Segment.js"
	                , "RegionEditor"
	                , "flotmosaic.js"
	                , "NodeFilter_v.js"
	                , "FitFieldList_mVc.js"
	                , "FitQEditor_m.js"
	                , "FitQEditor_v.js"
	                , "FitPatternQEditor_v.js"
	                , "FitPatternQEditor_m.js"
	                , "FitKWConstraint_m.js"
	                , "FitKWConstraint_v.js"
	                , "FitAttachedPatterns_v.js"
	                , "FitBestModelAttachedPattern_v.js"
	                , "FitBetterModelAttachedPattern_v.js"
	                , "FitOrderModelAttachedPattern_v.js"
	                ];
	var local_min_js = ["basics.js"
	                    , "WebSamp"
	                    , "DataLink"
	                    , "domain.js"];
	var imp_js = [   "ui/jquery-ui.js",
	                 "jquery.simplemodal.js",
	                 "jquery.alerts.js",
	                 "jquery.dataTables.js",
	                 "FixedHeader.js",
	                 "jquery.prints.js",
	                 "jquery.tooltip.js",
	                 "jquery.form.js",
	                 "aladin.unminified.js"
	                 ];
	var js = new Array();  // global list of JS to load

	/*
	 * CSS directories and files
	 */
	var baseCssDir      = "import/saadajsbasics/";
	var styleDir        = baseCssDir + "styles/";
	var styleimportsDir = baseCssDir + "styleimports/";
	var baseUrl = "";	
	var local_css  = ["basics.css"
	                  , "domain.css"
	                  ];
	var import_css = ["themes/base/jquery.ui.all.css"
	                  , "layout-default-latest.css"
	                  , "datatable.css"
	                  , "simplemodal.css"
	                  , "aladin.min.css"
	                  //, "bootstrap/bootstrap.css"
	                  , "foundationicon/foundation-icons.css"
	                  ];

	var css = [];// global list of CSS to load
	
	/*
	 * Check if saadajsbasics resources are installed locally
	 */
	baseUrl = "../../";
	console.log("jsresources will be taken from " + baseUrl);

	/**
	 * Async function loading all the js files stored in the js array
	 */
	var loadNextScript = async function() {
		let head = document.getElementsByTagName('HEAD').item(0);
		for (let i =0;i<js.length;i++){

			let script = document.createElement("script");

			script.src = js[i];
			script.type = "text/javascript";

			let prom = new Promise((resolve,reject)=>{
				script.onload = script.onreadystatechange = function() {
					console.log(js[i] + " script loaded ");
					resolve();
				};
			});
			
			head.appendChild( script);
			await prom;
		}
	};
	/**
	 * Async function loading all the css files stored in the css array
	 */
	loadNextCss = async function() {
		for (let i=0;i<css.length;i++){
			let  href = css[0];
			await  $.ajax({
				url: href,
				dataType: 'text',
				success: function(){        
					$('<link rel="stylesheet" type="text/css" href="'+href+'" />').appendTo("head");
					console.log(href + " CSS loaded ");
				},
				error : function(jqXHR, textStatus,errorThrown) {
					console.log("Error loading " +  href + " "  + textStatus);

				}
			});
		}
	};
	/**
	 * Usng jquery make the log traces pointing on jsquery code instaed on my js code
	 */
	var loadNextScriptxxx = function() {
		console.log(this.baseUrl);
		$.ajax({
			url: js[0], 
			async: false, 
			dataType: "script",
			success: function(data) {
				console.log(baseUrl + js[0] + " loaded" );
				js.shift();
				if( js.length > 0 ) loadNextScript();
			} ,                
			error: function(data) {
				console.log("Cannot load " + js[0] );
				alert("Cannot load " +  js[0]);
			}                  
		});
	};
	/***************
	 * externalscripts: array of scripts to be loaded after jsresources 
	 */
	/**
	 * Stores the list of user JS scripts to load
	 * and build the global list of resource to load
	 */
	var setScripts = function(externalscripts) {
		//	console.log("----------- " + that.baseUrl + " " + baseScriptDir);
		for( var i=0 ; i<local_js.length ; i++ ) {
			var jsf =  baseUrl + javascriptDir + local_js[i];
			if( ! jsf.match(/.*\.js/)  ){
				js.push(jsf + "_m.js");
				js.push(jsf + "_v.js");
				js.push(jsf + "_c.js");
			} else {
				js.push(jsf);

			}
		}
		for( var i=0 ; i<imp_js.length ; i++ ) {
			var jsf =  baseUrl + jsimportsDir + imp_js[i];
			js.push(jsf);
		}
		js.push.apply(js, externalscripts);
	};
	/**
	 * Stores the list of user JS scripts to load
	 * and build the global list (with the local short list) of resource to load
	 */
	var setMinScripts = function(externalscripts) {
		for( var i=0 ; i<local_min_js.length ; i++ ) {
			var jsf =  baseUrl + baseScriptDir + local_min_js[i];
			if( ! jsf.match(/.*\.js/)  ){
				js.push(jsf + "_m.js");
				js.push(jsf + "_v.js");
				js.push(jsf + "_c.js");
			} else {
				console.log(jsf);
				js.push(jsf);

			}
		}
		for( var i=0 ; i<imp_js.length ; i++ ) {
			js.push(baseUrl + imp_js[i]);
		}
		js.push.apply(js, externalscripts);
		loadNextScript();
	};
	/**
	 * Stores the list of client CSS files to load
	 * and build the global list of resource to load
	 */
	var setCss = function(externalcss) {
		for( var i=0 ; i<import_css.length ; i++ ) {
			css.push(baseUrl + styleimportsDir+ import_css[i]);
		}
		for( var i=0 ; i<local_css.length ; i++ ) {
			css.push(baseUrl  + styleDir + local_css[i]);
		}
		js.push.apply(css, externalcss);
	};
	/**
	 * Load all resources: must be invoked from the HTML page return a promise.
	 */
	var loadAll = async function() {
		await loadNextCss();
		await loadNextScript();
	};

	var jss = {};
	jss.loadAll = loadAll;
	jss.setScripts = setScripts;
	jss.setMinScripts = setMinScripts;
	jss.setCss = setCss;
	return jss;
}();