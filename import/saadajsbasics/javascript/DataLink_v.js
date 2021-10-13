/*
 * Ontology map for links
 * http://www.ivoa.net/rdf/datalink/core/2014-10-30/datalink-core-2014-10-30.html
 */
var linkVocabulary = [];
linkVocabulary ["#this"] = "the primary (as opposed to related) data of the identified resource";
linkVocabulary ["#progenitor"] = "data resources that were used to create this dataset (e.g. input raw data)";
linkVocabulary ["#derivation"] = "data resources that are derived from this dataset (e.g. output data products)";
linkVocabulary ["#auxiliary"] = "auxiliary resources";
linkVocabulary ["#weight"] = "Weight map: resource with array(s) containing weighting values";
linkVocabulary ["#error"] = "Error map: resource with array(s) containing error values";
linkVocabulary ["#noise"] = "Noise map: resource with array(s) containing noise values";
linkVocabulary ["#calibration"] = "Calibration data	resource used to calibrate the primary data";
linkVocabulary ["#bias"] = "Bias calibration data used to subtract the detector offset level";
linkVocabulary ["#dark"] = "Dark calibration data used to subtract the accumulated detector dark current";
linkVocabulary ["#flat"] = "Flat field calibration data	used to calibrate variations in detector sensitivity";
linkVocabulary ["#preview"] = "low fidelity but easily viewed representation of the data";
linkVocabulary ["#preview-image"] = "preview of the data as a 2-dimensional image";
linkVocabulary ["#preview-plot"] = "preview of the data as a plot (e.g. spectrum or light-curve)";
linkVocabulary ["#proc"] = "Processing server-side data processing result";
linkVocabulary ["#cutout"] = "Cutout a subsection of the primary data";

/**
 * @param params { parentDivId: 'query_div',baseurl}
 * @returns
 */
function DataLink_mVc(params) {
	this.parentDiv = $("#" +params.parentDivId );
	this.baseurl = params.baseurl;
	this.forwardurl = params.forwardurl;
	this.textareaid = params.parentDivId + "_text";

	this.listener = null;
}
DataLink_mVc.prototype = {

		addListener : function(list){
			this.listener = list;
		},
		draw : function(){	
			var that = this;
			var url = (this.forwardurl != null )? (this.forwardurl+ "?target=" + encodeURIComponent( this.baseurl))
					: this.baseurl;
			Processing.show("Fetching Datalink Description at " + url);
			$.ajax({
				type: "GET",
				url: url,
				dataType: "xml",      
				error: function (xhr, ajaxOptions, thrownError) {
					Processing.hide();
					Modalinfo.error(url + "\n" + xhr.responseText + "\n" + thrownError);
				},
				success: function(xml) {
					Processing.hide();
					if( $(xml).find('VOTABLE').length != 0 ){
						that.processVOTABLEResponse(xml);
					} else { 
						that.processXMLResponse(xml);
					}
				}});
		},
		processVOTABLEResponse: function(xml){
			var html = "";
			var hasLink = false;
			$(xml).find('TR').each(function(){
				var i=0;
				var uri ="";
				var url ="";
				var semantic ="";
				var productType ="";
				var contentType ="";
				var size ="";

				var type = $(this).find('TD').each(function(){
					hasLink = true;
					switch(i){
					case 0: uri = $(this).text();break;
					case 1: url = $(this).text();break;
					case 2: productType = $(this).text();break;
					case 3: semantic = $(this).text();break;
					case 4: contentType = $(this).text();break;
					case 5: size = $(this).text();break;
					}
					i++;
				});
				html += "<fieldset>";
				html += "  <legend style='border-bottom: 0px; border-top: 1px solid #e5e5e5;'><span style='fontweight: bold;'>Link <i>" + productType + "</i> <span></legend>";
				html += "    <a class='dlinfo' title='Get info about' href='#' onclick='LinkProcessor.fireGetProductInfo(\"" + this.linkInstance.access_url + "\"); return false;'></a>"
				html += "    <a class=dldownload href='#' onclick='PageLocation.changeLocation(&quot;" + url + "&quot);' title='Download link target'></a>";
				html += "    <span class=help>" +  semantic + "</span><br>";
				html += "    <span class=help><b>Product URI:</b> " +  uri + "</span><br>";
				html += "    <span class=help><b>Content:</b> " +  contentType + " " +  ((size == 0)? "": size +"b") + "</span>";
				html += "</fieldset>";
			});
			if( hasLink){
				Modalcommand.commandPanel("Link Browser", html);
				$("div.datalinkform").toggle();
				Modalcommand.setDivToggling(function() {that.buildWebserviceForm($(this).attr("id"));});
			} else {
				Modalinfo.info("No link available", "Datalink Info");
			}
		},
		processXMLResponse: function(xml){
			var that = this;
			var html = "";
			$(xml).find('endpoint').each(function(){
				var type = $(this).attr('type');
				var datatype = $(this).attr('datatype');
				html += "<fieldset>";
				html += "  <legend><span>Link <i>" + $(this).attr('name') + "</i> (" + datatype + ")<span></legend>";
				if( type == "download" ) {
					html += that.buildDownloadForm($(this), datatype);
				} else if( type == "webservice" ) {							
					html += that.buildWebserviceEntry($(this));
				} else {
					Modalinfo.error("Unknown link type " + type);
				}
				html += "</fieldset>";
			});
			Modalcommand.commandPanel("Link Browser", html);
			$("div.datalinkform").toggle();
			Modalcommand.setDivToggling(function() {that.buildWebserviceForm($(this).attr("id"));});
		},
		buildDownloadForm : function(xml, datatype) {
			var url = (this.forwardurl != null )? (this.forwardurl+ encodeURIComponent( xml.find('url').text()))
					: xml.find('url').text();
			url =  xml.find('url').text();
			var clk = (datatype == "preview")? "Modalinfo.openIframePanel(&quot;" +  url + "&quot);" 
					: "PageLocation.changeLocation(&quot;" +  url + "&quot);";
			var html = "<div>";
			html += "    <a class=dldownload href='#' onclick='" + clk + "' title='Download link target'></a>";
			html += "    <span class=help>" +  xml.find('description').text() + "</span>";
			html += "</div>";
			return html;	
		},
		buildWebserviceEntry : function(xml) {
			var xmlurl =  xml.find('url').text();
			var url = (this.forwardurl != null )? (this.forwardurl+ encodeURIComponent( xmlurl))
					: xmlurl;
			var webservice = xml.attr("name");
			this.fireStoreWebService(webservice, xmlurl);
			var description = xml.find('description').text() ;
			return "<div id=" + webservice + " class=datalinkform >"
			+ "    <ul>"
			+ "      <li>Decription " + description + "</li>"
			+ "      <li>type " +  xml.attr('type')+ "</li>"
			+ "      <li>URL <a href='#' onclick='Modalinfo.openIframePanel(&quot;" +  url + "&quot, &quot;" +  description + "&quot);'>click</a>"+ "</li>"
			+ "    </ul>"
			+ "</div>";
		},
		buildWebserviceForm : function(webservice) {
			if( webservice != null && !this.fireIsWebServiceLoaded(webservice) ) {
				var url = (this.forwardurl != null )? (this.forwardurl+ "?target=" +  encodeURIComponent(this.fireGetUrl(webservice)))
						: this.fireGetUrl(webservice);
				//var url = "forwardxmlresource?target=" +  encodeURIComponent(this.fireGetUrl(webservice));
				var that = this;
				var sliders = new Array();
				var fields = new Array();
				Processing.show("Build form for webservice " + webservice);
				$.ajax({
					type: "GET",
					url: url,
					dataType: "xml",
					error: function (xhr, ajaxOptions, thrownError) {
						Processing.hide();
						Modalinfo.error(url + "\n" + xhr.responseText + "\n" + thrownError);
					},
					success: function(xml) {
						Processing.hide();
						$('#' + webservice).html(''); 
						var baseurl = $(xml).find('baseurl').text();
						var html = "";
						html += "    <a class=dldownload href='#' id='" + webservice + "_submit' title='Submit the query'></a>";
						html += "    <span class=help>" +   $(xml).find('description').first().text() + "</span><br>";
						$('#' + webservice).append(html); 
						$(xml).find('parameter').each(function(){
							var name = $(this).attr('name');
							var id  = webservice + "_" + $(this).attr('name');
							html  = "    <span><b>" +  name + "</b></span>";
							html += "    <span class=help>" +  $(this).find('description').text() + "</span><br>";
							var range = $(this).find('range');
							var type = range.attr('type');
							if( type == "enum" ) {
								html += "&nbsp;&nbsp;<span>Value</span>&nbsp;";
								html += "<select id=" + id + '_input' + ">";
								$(range).find('value').each(function() {	
									var value = $(this);
									var selected = ( value.attr("type") == "default")? "selected": "";
									html += "<option " + selected + ">" + $(this).text() + "</option>";
								});
								html += "</select><br>";
								fields.push(name);
							} else if( type == "range" ) {
								var min=0, max=0, def=0;
								$(range).find('value').each(function() {	
									var value = $(this);
									var type = value.attr("type");
									if( type == "default") {
										def = $(this).text();
									} else if( type == "min") {
										min = $(this).text();
									} else if( type == "max") {
										max = $(this).text();
									}
								});
								var fmin = parseFloat(min);
								var fmax = parseFloat(max);
								var fdef = parseFloat(def);
								if( fmin >= fmax ||fdef < fmin ||fdef > fmax ) {
									Modalinfo.error("Unconsistant range (min=" + min + " max="+ max + " def=" + def + ") no input for this parameter");
								} else {
									html += '&nbsp;&nbsp;<label for="amount">Value</label>'
										+ ' <input type="text" id="' + id + '_input" style="width: 50px; border: 0;font-weight: bold;" value="' + def + '"/>'
										+ '<div style="display: inline-block;width: 300px" id="' + id + '"></div><br>'    ;
									sliders[id] = {id: id, min: fmin, max: fmax, def: fdef};
									fields.push(name );
								}
							} else {
								Modalinfo.error("Unconsistant range type " + type + " no input for this parameter");
							}
							$('#' + webservice).append(html); 
							for( var p in sliders) {
								var slider = sliders[p];
								$( "#" + slider.id ).slider({
									range: "min",
									value: slider.def,
									min: slider.min,
									max: slider.max,
									step: ((slider.max - slider.min)/20),
									slide: function( event, ui ) {
										$( "#" +  $(this).attr("id")+ '_input').val(ui.value );
									}
								});

							}
							that.fireWebServiceLoaded(webservice);
						});
						$( "#" + webservice + "_submit" ).click(function(){
							var query = baseurl;
							for( var f=0 ; f<fields.length ; f++ ) {
								query += "&" + fields[f] + "=" + $('#' + webservice + "_" + fields[f] + '_input').val();
							}
							Modalinfo.openIframePanel(query, webservice);
						});
					}});
			}
		},
		fireGetQuery: function() {
			return $("#" + this.textareaid ).val();
		},		
		/*
		 *	Params: {type, constraints}
		 *	where supported typed are "column" "orderby" "ucd" "position" "relation" "limit"
		 *  Label is used to identify the form  constraints are coming from
		 */
		fireStoreWebService : function(webservice, url) {
			this.listener.controlStoreWebService(webservice, url);
		},
		fireGetUrl: function(webservice) {
			return this.listener.controlGetUrl(webservice);
		},
		fireWebServiceLoaded: function(webservice) {
			this.listener.controlWebServiceLoaded(webservice);
		},
		fireIsWebServiceLoaded: function(webservice) {
			return this.listener.controlIsWebServiceLoaded(webservice);
		}

};


/**
 * Subclass of DataLink_mVc handler
 * @returns {UcdQEditor_mVc}
 */
function CompliantDataLink_mVc(params /* { parentDivId: 'query_div',baseurl, dataobject}*/){
	DataLink_mVc.call(this, params);
	this.dataObject = ('dataobject' in params )? params.dataobject: {};
	this.linkMap = new Array();

	var that = this;
};

/**
 * Method overloading
 */
CompliantDataLink_mVc.prototype = Object.create(DataLink_mVc.prototype, {	
	draw : { 
		value: function() {
			var that = this;
			var url  = (this.forwardurl != null )? (this.forwardurl+ "?target=" + encodeURIComponent( this.baseurl))
					: this.baseurl;
			Processing.show("Fetching Compliant Datalink Description at " + url);
			$.ajax({
				type: "GET",
				url: url,
				dataType: "xml",      
				error: function (xhr, ajaxOptions, thrownError) {
					Processing.hide();
					Modalinfo.error(url + "\n" + xhr.responseText + "\n" + thrownError);
				},
				success: function(xml) {
					Processing.hide();
					if( $(xml).find('VOTABLE').length != 0 ){
						that.processVOTABLEResponse(xml);
					} else { 
						Modalinfo.error(url + "\n doesn't look like a VOTable");
						//that.processXMLResponse(xml);
					}
				}});
		}

	} ,
	processVOTABLEResponse : { 
		value: function(xml) {
			var that = this;
			$(xml).find('RESOURCE[type="results"]').each(function(){
				var fieldNames = new Array();
				$(this).find("FIELD").each(function(){
					var id = $(this).attr("ID");
					if( id != undefined ){
						fieldNames.push(id);
					} else {
						fieldNames.push($(this).attr("name"));
					}
				});
				var type = $(this).find('TR').each(function(index){
					var i=0;
					var obj = new  Object();
					var type = $(this).find('TD').each(function(){
						obj[fieldNames[i]] = $(this).text().trim();
						i++;
					});
					that.linkMap.push(new Link_mVc(obj, xml, index));
				});
			});
			var html = "<span class='help'> (click on titles to expand links)</span><br>";
			for( var i=0 ; i<this.linkMap.length ; i++ ){
				console.log(this.linkMap[i].async)
				if( ! this.linkMap[i].async){
					html += this.linkMap[i].getHtml();
				}
			}
			Modalcommand.commandPanel("Link Browser", html);
			Modalcommand.setDivToggling();
			Modalcommand.collapseDiv();



			for( var link in this.linkMap) {
				if( ! this.linkMap[link].async){
					this.linkMap[link].buildSliders();
					this.linkMap[link].buildRegionEditors(this.dataObject);
				}
			}
		}
	},
	setCutoutRegion : { 
		value: function(params) {
			str = "POLYGON ICRS ";
			var pts = params.region.points
			for( var i=0 ; i<pts.length ; i++) {
				str += pts[i][0] + " " +pts[i][1] + " "; 
			}
			$("textarea[name=cutout]").text(str);
		}
	}

});

function Link_mVc(instance, xml, index) {
	this.linkInstance = instance;
	/**
	 * Array of XML representations of params. 
	 * Each cells contain a reference ref which msut be use with a JQuery selector $(ref)
	 */
	this.params = new Array();
	/**
	 * Link number: requested to get the right data in TABLEDATA
	 */
	this.index = index; 
	this.sliders = new Array();
	this.aladins = new Array();
	this.xml = xml;
	this.async = false;
	this.setParams();

}
Link_mVc.prototype = {

		setParams : function(){
			var that = this;
			//if( this.linkInstance.semantics != "#this") {
			if( that.linkInstance.service_def != "#") {
				$(this.xml).find('RESOURCE[ID="' + that.linkInstance.service_def + '"]').each(function(){
					$(this).find('PARAM[name="accessURL"]').each(function() {
						that.linkInstance.access_url =  $(this).attr("value");
					});
					$(this).find('PARAM[name="standardID"]').each(function() {
						if( $(this).attr("value").match(/.*async.*/ )){
							that.async = true;
						}
					});
					$(this).find('GROUP[name="inputParams"]').each(function() {

						$(this).find('PARAM').each(function() {
							var param = {xml: $(this), value : ""};
							var fieldPointer = $(this);
							var values = fieldPointer.find('VALUES');
							/*
							 * IF a field is referenced, its value is taken for the parameter value
							 */
							if( fieldPointer.attr("ref") != null ){
								var ref = fieldPointer.attr("ref");
								param.value = that.getFieldValueByRef(ref);
							}
							else if( fieldPointer.attr("value") != null ){
								param.value = fieldPointer.attr("value");
							}
							/*
							 * If there is no value element attached to the PARAM, will look
							 * if there is a field having the same name as the parameter
							 */
							else if( values.length == 0 ){
								var name = fieldPointer.attr("name");
								param.value = that.getFieldValueByName(name);
							}
							that.params.push(param);
						});
					});
				});
			}
		},
		/**
		 * Get the value of the field identified by ID = fieldRef
		 * in the current column (# this.index)
		 * @param fieldRef
		 * @returns
		 */
		getFieldValueByRef : function(fieldRef){
			var that = this;
			var fieldIndex = -1;
			var retour = null;
			$(this.xml).find('FIELD').each(function(index){
				if( $(this).attr("ID") == fieldRef) {
					fieldIndex = index;
				}
			}); 
			$(this.xml).find('TR').each(function(rowIndex){
				if( rowIndex == that.index) {
					$(this).find('TD').each(function(colIndex){
						if( colIndex == fieldIndex) {
							retour =$(this).text() ;
						}
					}); 
				}
			}); 
			return retour;
		},

		getFieldValueByName : function(fieldRef){
			var that = this;
			var fieldIndex = -1;
			var retour = null;
			$(this.xml).find('FIELD').each(function(index){
				if( $(this).attr("name") == fieldRef) {
					fieldIndex = index;
				}
			}); 
			$(this.xml).find('TR').each(function(rowIndex){
				if( rowIndex == that.index) {
					$(this).find('TD').each(function(colIndex){
						if( colIndex == fieldIndex) {
							retour =$(this).text() ;
						}
					}); 
				}
			}); 
			return retour;
		},

		getSimpleLinkAction: function(){
			if( this.linkInstance.content_type == "application/x-votable+xml;content=datalink") {
				return "<a class='dlinfo' title='Get info about' href='#' onclick='LinkProcessor.fireGetProductInfo(\"" + this.linkInstance.access_url + "\"); return false;'></a>"
				+ "<a class=dldownload href='#' onclick='DataLinkBrowser.startCompliantBrowser(&quot;" +  this.linkInstance.access_url  + "&quot)' title='Download link target'></a>";
			} else if( this.linkInstance.semantics.endsWith("#preview") ){
				return "<a class='dlinfo' title='Get info about' href='#' onclick='LinkProcessor.fireGetProductInfo(\"" + this.linkInstance.access_url + "\"); return false;'></a>"
				+ "<a class=dldownload href='#' onclick='Modalinfo.openIframePanel(&quot;" +  this.linkInstance.access_url  + "&quot)' title='Download link target'></a>";
			} else if( this.linkInstance.semantics.endsWith("#proc") || this.linkInstance.semantics.endsWith("#this")){
				return "<a class='dlinfo' title='Get info about' href='#' onclick='LinkProcessor.fireGetProductInfo(\"" + this.linkInstance.access_url + "\"); return false;'></a>"
				+ "<a class=dldownload href='#' onclick='PageLocation.changeLocation(&quot;" +  this.linkInstance.access_url  + "&quot)' title='Download link target'></a>"
				+ "<a class='dlivoalogo'  href='#' onclick='LinkProcessor.processToSampWithParams(\"" + this.linkInstance.access_url + "\", \"" + this.linkInstance.semantics + "\");' title='broadcast to SAMP'></a>"
				;
			} else {
				return 	"<a class='dlinfo' title='Get info about' href='#' onclick='LinkProcessor.fireGetProductInfo(\"" + this.linkInstance.access_url + "\"); return false;'></a>"
				+  "<a class=dldownload href='#' onclick='Modalinfo.openIframePanel(&quot;" +  this.linkInstance.access_url  + "&quot)' title='Download link target'></a>";	
			}
		},
		getHtml : function(){
			if( this.params.length == 0 ){
				var html = "";
				html += "<fieldset>";
				html += "  <legend style='margin-bottom: 5px;border-top: 1px solid #e5e5e5;'><span style='font-weight: bold;'>Link <i style='font-weight: normal;'>"  + this.linkInstance.semantics + "</i> <span></legend><div class=datalinkform>";

				//html += "  <legend><span title='Click on the link name to toggle'>Link <i>"  + this.linkInstance.semantics + "</i></legend><div class=datalinkform>";
				html += this.getDescriptionSpan();
				html += this.getSimpleLinkAction();
				html += "</div></fieldset>";
				return html;
			} else {
				var html = "";
				html += "<fieldset name='" + this.linkInstance.semantics + "'>";
				var that = this;
				html += "  <legend style='margin-bottom: 5px;border-top: 1px solid #e5e5e5;'><span style='font-weight: bold;' title='Click on the link name to toggle'>Link <i style='font-weight: normal;'>"  + this.linkInstance.semantics + "</i></legend><div class=datalinkform>";
				html += this.getDescriptionSpan();
				for( var i=0 ; i<this.params.length ; i++) {
					var param = this.params[i];
					var paramName = param.xml.attr("name") ;
					var paramType = param.xml.attr("datatype") ;
					var paramId = paramName + "_" + this.index; // used to buid unique div IDs
					var divId = paramId + "_input";
					var sliderId = paramId + "_input_slider";
					var withAladin = false;
					var values;
					var description, de;
					if ( (de = $(param.xml).find('DESCRIPTION')).length != 0 ){
						description = $(de[0]).html() ;
					} else {
						description = "no description provided";
					}

					/*
					 * Constant value
					 */
					if( param.value != null && param.value != ""){
						html += "<div id='param_" +  paramName + "'>   <span><b>" + paramName + "</b></span>&nbsp;<span class=help>" + description + "</span><br>"
						+ "<input id='" + divId + "' readonly style='width: 100%;' type='text' value='" 
						+ param.value + "' name='" + param.xml.attr("name") + "'></div>";
					/*
					 * Cutout: make a reference on a future AL
					 * Only polygons are supported  
					 */
					} else if( ("stc:AstroCoordArea" == param.xml.attr("xtype") && "circle" != param.xml.attr("xtype")) || "polygon" == param.xml.attr("xtype")){
						var divAladin = paramId + "_aladin";
						html += "<div id='param_" +  paramName + "'><input type='checkbox' name='takeit' value='takeit' title='uncheck to ignore the parameter' checked><span id='cutoutParam'>&nbsp;<b>" + paramName + "</b></span>&nbsp;<span class=help> " 
						+ description + "</b></span><br><textarea id='" + divId + "' style='width:100%;' rows='3' name='" 
						+ paramName +"'></textarea><br><div id='" + divAladin + "' style='width: 400px; height: 470px'></div></div>";
						var maxField, envelope = '';
						if ( (values = $(param.xml).find('VALUES')).length != 0  && (maxField = $(values).find("MAX")) ){
							envelope = $(maxField).attr("value");
						}
						this.aladins.push({div: divAladin, envelope:envelope} );
						withAladin = true;
						/*
						 * Parmas with a defined value range: use either a slider or a choice menu
						 */	
					} else if ( (values = $(param.xml).find('VALUES')).length != 0 ){
						var minField, maxField, option;

						if( (minField = $(values).find("MIN")).length != 0 && (maxField = $(values).find("MAX")).length != 0 ) {
							var range = $(minField).attr("value") + " " + $(maxField).attr("value");
							var min = parseFloat(minField.attr("value"));
							var max = parseFloat(maxField.attr("value"));
							var scaleMin = this.getScaleFactor(min);
							var scaleMax = this.getScaleFactor(max);
							min = scaleMin.normValue;
							max = scaleMax.normValue;
							var def =  (paramName.endsWith("MIN"))? min: (paramName.endsWith("MAX"))?max: (min + max)/2;
							def = (paramType == "int")? Math.round(def) :def ;
							var scaleMention = (scaleMin.factor != 1)? (" (* " + (1/scaleMin.factor) +")"): "" ;
							html += "<div id='param_" +  paramName + "'> <input type='checkbox' name='" + paramName + "' value='takeit' title='uncheck to ignore the parameter' checked>&nbsp;<span><b>" + paramName + "</b></span>&nbsp;<span class=help>" + description + scaleMention + "</span><br>";
							html += '&nbsp;&nbsp;<label for="amount">Value</label>'
								+ ' <input type="text" name="' + paramName + '" id="' + divId + '" size=10 style="border: 0;font-weight: bold;" value="' + (Math.round(def*1000)/1000) + '"/>'
								+ ' <input  type="hidden" value="' + scaleMin.factor + '" id="' + paramName + '_input_factor"/>'
								+ '<div style="display: inline-block;width: 300px" id="' + sliderId + '"></div></div>'    ;
							this.sliders[sliderId] = {id: divId, type: paramType, min: min, max: max, def: def, scaleFactor: scaleMin.factor};

						} else if( (option = $(values).find("OPTION")).length != 0) {
							html += "<div id='param_" +  paramName + "'> <input type='checkbox' name='" + paramName + "' value='takeit' title='uncheck to ignore the parameter' checked>&nbsp;<span><b>" + paramName + "</b></span>&nbsp;<span class=help>" + description + "</span><br>";
							html += ' <select type="text" name="' + paramName + '" id="' + divId + '">';
							option.each(function() {
								var name = $(this).attr("name");
								var value = $(this).attr("value");
								if( name != "" ) {
									name = "(" + name + ")";
								}
								html += "  <option value='" + value + "'>" + value + " " + name + ")</option>";
							});					
							html += ' </select></div>';
						} else if( (maxField = $(values).find("MAX")).length != 0 ) {
							html += "<div id='param_" +  paramName + "'> <input type='checkbox' name='" + paramName + "' value='takeit' title='uncheck to ignore the parameter' >&nbsp;<span class=help>" 
								+ "<b>" + paramName + "</b>&nbsp; " + description +"</span><br>"
								+ '<input type="text" name="' + paramName + '" id="' + divId + '" style="width: 100%;" value="' + maxField.attr("value") + '"/></div>';
						} else {
							html += " <div id='param_" +  paramName + "'> <input type='checkbox' name='takeit' value='takeit' title='uncheck to ignore the parameter' checked>&nbsp;<span class=help>" + paramName + "&nbsp;" + description +"</span><br>FREE</div>";
						}
					} 
				}
				html += "    <a class='dlinfo' title='Get info about' href='#' onclick='LinkProcessor.infoWithParams(\"" + this.linkInstance.access_url + "\", \"" + this.linkInstance.semantics + "\"); return false;'></a>";
				html += "    <a class=dldownload    href='#' onclick='LinkProcessor.processWithParams(\"" + this.linkInstance.access_url + "\", \"" + this.linkInstance.semantics + "\");' title='Download link target'></a>";
				html += "    <a class='dlivoalogo'  href='#' onclick='LinkProcessor.processToSampWithParams(\"" + this.linkInstance.access_url + "\", \"" + this.linkInstance.semantics + "\");' title='broadcast to SAMP'></a><BR\>";
				if( withAladin ){
					html += "    <span class='help'>Draw counter-clockwise please</span>\n"
				}
				html += "</div></fieldset>";
				return html;
			}

		},
		/*
		 * Active widget must be built after the link HTML has beeb attached to the DOM
		 */
		buildSliders : function(){
			for( sliderId in this.sliders) {
				var slider = this.sliders[sliderId];
				var sliderHandler;
				if( slider.type != "int" ){
					sliderHandler = function( event, ui ) {
						var factor = $( "#" +  $(this).attr("id").replace("_slider", "_factor")).attr("value");
						var value  = Math.round(1000*ui.value)/1000;
						$( "#" +  $(this).attr("id").replace("_slider", "")).val(value );
					}
				} else {
					sliderHandler = function( event, ui ) {
						var factor = $( "#" +  $(this).attr("id").replace("_slider", "_factor")).attr("value");
						var value  = Math.round(ui.value);
						$( "#" +  $(this).attr("id").replace("_slider", "")).val(value );
					}					
				}
				$( "#" + sliderId ).slider({
					range: "min",
					value: slider.def,
					min: slider.min,
					max: slider.max,
					step: ((slider.max - slider.min)/20),
					slide: sliderHandler
				});

			}
		},
		/*
		 * Active widget must be built after the link HTML has been attached to the DOM
		 */
		buildRegionEditors : function(fovObject){
			for( var i=0 ; i<this.aladins.length ; i++ ) {
				var div = this.aladins[i].div;
				var envelope = this.aladins[i].envelope;
				var message = "";
				if( div.length != 0){
					
					var regionEditor = new RegionEditor_mVc  (div
							, function(params){			
								str = "";
								var pts = params.region.points
								/*
								 * CADC fails when last point == first point
								 */
								for( var i=0 ; i<(pts.length -1) ; i++) {
									str += parseFloat(pts[i][0]).toFixed(6) + " " +parseFloat(pts[i][1]).toFixed(6) + " "; 
								}
								$("#" + div.replace("aladin", "input")).text(str);
							}
							, [fovObject.s_ra ,fovObject.s_dec ] 
						); 		
					regionEditor.init();	
					if( envelope ) {
						var s = envelope.split(/\\s+/);
						var l = s.length -1;
						if( s[0] == s[l-1] && s[1] == s[l]){
							s.pop()
							s.pop();
						}
						regionEditor.setEditionFrame({
							type : "soda",
							value : "POLYGON " + s.join(" ")});
						$("#" + div.replace("aladin", "input")).text(s.join(" "));

					}
				}
			}
		},
		getScaleFactor : function(value){
			var stringValue = value.toString();
			var tvalue = value;
			var step;
			var factor=1.0;
			if( value > -1 && value < 1 ){
				step = 10.
			} else {
				return ({normValue: tvalue, factor: 1});
			}
			while( (step == 10 && tvalue > -1 && tvalue < 1) || (step == 0.1 && (tvalue > 10 || tvalue < -10)) ){
				tvalue *= step;
				factor *= step;
				stringValue = tvalue.toString();
			}
			return ({normValue: tvalue, factor: factor});
		},
		getDescriptionSpan : function() {
			var html = ""
			var voc = linkVocabulary[this.linkInstance.semantics];
			if( voc != undefined ) {
				html += "    <span class=help>" + voc ;
			}
			if( this.linkInstance.description.length > 0 ) {
				if( html.length > 0 ) {
					html += "<br>";
				} else {
					html += "    <span class=help>";
				}
				html += this.linkInstance.description ;
			}
			if( html.length > 0 ) {
				html += "</span><br>";
			}
			return html
		}
}

/**
 * Singleton class providing the fonction processing the link accesses 
 */
LinkProcessor = function() {
	var builURL = function(access_url, semantic) {
		var fieldset = $("fieldset[name='" + semantic + "']");
		var params = new Array();
		//fieldset.find("input[type='text'], textarea").each(function(){
		fieldset.find("div[id^=param_]").each(function(){
			var check =  $(this).children('input[type=checkbox]');
			var name = $(this).attr("id").replace("param_", "");

			if( (name != undefined && name != null  && name != "" )  &&  (check.length == 0 ||  check.prop('checked')) ) {
				var id = $(this).attr("id");
				var factorEle = $(this).find("#" + name + "_input_factor").first();
				var value =  $(this).children('input[type="text"], textarea').val();	
				if( value ) {
					if( factorEle.length != 0 ){
						value =  value / factorEle.attr("value");
					}
					params.push((name + "=" + encodeURIComponent(value)));
				}
				else {
					$(this).find("select").each(function(){
						var value =  $(this).val();
						params.push(name + "=" + encodeURIComponent(value) );
					});
				}
			}
		})
		console.log(params)
		console.log(params.join("&"))
		return access_url + "?" + params.join("&");
	}; 
	var processWithParams = function(access_url, semantic) {
		PageLocation.download(builURL(access_url, semantic));
	};
	var infoWithParams = function(access_url, semantic) {
		Modalinfo.info(builURL(access_url, semantic), "Service Info");
	}; 
	var processToSampWithParams = function(access_url, semantic) {
		var fieldset = $("fieldset[name=" + semantic + "]");
		var params = new Array();
		fieldset.find("input[type='text']").each(function(){
			var id = $(this).attr("id");
			var factorEle = $("#" + id + "_factor");
			var value;
			if( factorEle.length == 0 ){
				value =  $(this).val();
			} else {
				value =  $(this).val()/ factorEle.attr("value");
			}
			params.push($(this).attr("name") + "=" + encodeURIComponent(value) );
		})
		fieldset.find("select").each(function(){
			var id = $(this).attr("id");
			var value =  $(this).val();
			params.push($(this).attr("name") + "=" + encodeURIComponent(value) );
		})
		var retour = access_url + "?" + params.join("&");
		WebSamp_mVc.fireSendVoreport(retour, null, null);
	}; 
	var fileDownload = function(access_url) {
		$.fileDownload($(this).prop(access_url), {
			preparingMessageHtml: "We are preparing your report, please wait...",
			failMessageHtml: "There was a problem generating your report, please try again."
		});
	};
	var fireGetProductInfo = function(url) {
		Processing.show("Waiting on product info");

		$.getJSON("getproductinfo", {jsessionid: "", url: url}, function(jsdata) {
			Processing.hide();
			if( Processing.jsonError(jsdata, "Cannot get product info") ) {
				return;
			} else {
				retour = "url: " + url + "\n";
				$.each(jsdata, function(k, v) {
					retour += k + ": " + v  + "\n";
				});
				Modalinfo.info(retour, "Product Info");
			}
		});
	}	;	

	/*
	 * exports
	 */
	var pblc = {};
	pblc.processWithParams = processWithParams;
	pblc.infoWithParams = infoWithParams;
	pblc.processToSampWithParams = processToSampWithParams;
	pblc.fileDownload = fileDownload;
	pblc.fireGetProductInfo = fireGetProductInfo;
	return pblc;

}();


