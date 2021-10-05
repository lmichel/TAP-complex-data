/**
 * ConstQEditor_mVc: View of the constraint query editor
 * 
 * @param parentDivId : ID of the div containing the query editor
 * @param formName    : Name of the form. Although internal use must be 
 *                      set from outside to avoi conflict by JQuery selectors 
 * @param queryview   : JS object supposed to take the constraint locally edited.
 *                      It supposed to have a public method names fireConstQuery(const)
 *                      where const is an object like {columnConst:"SQL stmt", orderConst:"att name"}
 *                     
 * @returns {ConstQEditor_mVc}
 */
function ConstQEditor_mVc(params /*{parentDivId,formName,queryView}*/){
	var that = this;
	this.fieldsLoaded = false;
	this.dataTreePath = null; // instance of DataTreePath
	/**
	 * who is listening to us?
	 */
	this.listener = {};
	this.queryView = params.queryView;
	/**
	 * DOM references
	 */
	this.parentDiv = $("#" + params.parentDivId );
	this.constContainerId   = params.parentDivId + "_constcont";
	this.constListId   = '';
	this.formName = params.formName;
	this.orderById     = params.parentDivId + "_orderby";
	this.fieldListView = new FieldList_mVc(params.parentDivId,
			this.formName,
			{stackHandler: function(ahName){ that.fireAttributeEvent(ahName);},
			orderByHandler: function(ahName){ that.fireOrderBy(ahName);}
		}
	);
	this.constListView = new ConstList_mVc(params.parentDivId,
			this.formName,
			this.constContainerId,
			function(ahName){ that.fireClearAllConst();}
	);
	this.orderByView = new 	OrderBy_mVc(params.parentDivId,
			this.formName,
			this.constContainerId,
			function(ahName){ that.fireOrderBy(ahName);}
	);
}

ConstQEditor_mVc.prototype = {
		/**
		 * Instanciate components
		 */
		/**
		 * add a listener to this view
		 */
		addListener : function(listener){
			this.listener = listener;
		},
		draw : function() {
			this.fieldListView.draw();
			this.parentDiv.append('<div id=' + this.constContainerId + ' style="width: 450px;float: left;background: transparent; display: inline;"></div>');
			var isPos = {"fieldset":"130px", "div":"102px"};
			this.constListId = this.constListView.draw(isPos);
			this.orderByView.draw();
		},	
		fireSetTreepath: function(dataTreePath){
			this.fieldListView.setStackTooltip("Click to select this field");
			var that = this;
			this.dataTreePath = dataTreePath;	
			this.fieldListView.setDataTreePath(this.dataTreePath);
			this.listener.controlLoadFields(that.dataTreePath);
		},
		fireOrderBy : function(nameattr){
			if( nameattr != 'OrderBy' ) {
				this.orderByView.setOrderBy(nameattr);
				var stmt = nameattr ;
				if( this.orderByView.isDesc()) stmt += " desc";
				if( this.queryView != null ) {				
					this.queryView.fireAddConstraint(this.formName, "orderby", [stmt]);
				} else {
					Out.info("No Query View OB:" + stmt);
				}
			} else {
				this.queryView.fireDelConstraint(this.formName, "orderby");
			}
		},
		getOrderBy: function(){
			return {nameattr: this.orderByView.getOrderBy(), asc: this.orderByView.isAsc() };
		},
		fireAttributeEvent : function(ahname){
			var that = this;
			this.listener.controlAttributeEvent(ahname, that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		},
		fireClearAllConst : function() {
			this.constListView.fireClearAllConst();
			this.orderByView.fireClearAllConst();
			this.fireOrderBy('OrderBy');
			var that = this;
			this.listener.controlClearAllConst();	
		},
		fireClearConst : function(filter) {
			this.constListView.fireClearConst(filter);
			var that = this;
			this.listener.controlClearConst(filter);	
		},
		fireGetNumberOfEditor : function() {
			var that = this;
			var retour = 0;
			retour =  this.listener.controlGetNumberOfEditor();	
			return retour;
		},
		printTypoMsg : function(fault, msg){
			this.constListView.printTypoMsg(fault, msg);
		},
		isTypoGreen : function(){
			return constListView.printTypoMsg(fault, msg);
		},
		updateQuery : function(consts) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "column", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		},
		runQuery : function() {	
			if( this.queryView != null ) {
				this.queryView.runQuery();
			} else {
				Out.info("No Query View");
			}
		}, 
		getAttributeHandlers: function(){
			var that = this;
			var retour = 0;
			retour =  this.listener.controlGetAttributeHandlers();		
			return retour;
		},
		/*
		 * The purpose of the default value depends on the context
		 * Just used for regions right now
		 */
		getDefaultValue: function(){
			var that = this;
			var retour = 0;
			retour =  this.listener.controlGetDefaultValue();	
			return retour;
		},
		fieldsStored: function(ahs){
			this.fieldListView.displayFields(ahs);
		}
};

/**
 * Subclass of ConstQEditor_mVc handling the edition of UCD bases constraints
 * @param parentDivId
 * @param formName
 * @param queryview
 * @returns {UcdQEditor_mVc}
 */
function UcdQEditor_mVc(params /*{parentDivId,formName,queryView, help}*/){
	ConstQEditor_mVc.call(this, params);
	var that = this;
	this.help = params.help;
	this.fieldListView = new UcdFieldList_mVc(params.parentDivId,
			this.formName,
			{ stackHandler: function(ahName){ that.fireAttributeEvent(ahName);},
			orderByHandler: function(ahName){ that.fireOrderBy(ahName);}
		}
	);
}

/**
 * Method overloading
 */
UcdQEditor_mVc.prototype = Object.create(ConstQEditor_mVc.prototype, {	
	draw : { 
		value: function() {
			this.fieldListView.draw();
			this.parentDiv.append('<div id=' + this.constContainerId + ' style="background: transparent; width:450px;float: left;"></div>');
			var isPos = {"fieldset":"130px", "div":"102px"};
			this.constListId = this.constListView.draw(isPos);
			if( this.help != undefined)
				$('#' + this.constContainerId).append('<div style="width: 100%;"><span class=spanhelp>' + this.help + '</span></div>');
		}
	},		
	updateQuery : { 
		value:  function(consts) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "ucd", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	}
});

/**
 * Subclass of UcdQEditor_mVc handling the edition of UCD bases constraints in matchPattern
 * @param parentDivId
 * @param formName
 * @param queryview
 * @returns {UcdQEditor_mVc}
 */
function UcdPatternEditor_mVc(params /*{parentDivId, formName, queryView, help}*/){
	UcdQEditor_mVc.call(this, params);
}
/**
 * Method overloading
 */
UcdPatternEditor_mVc.prototype = Object.create(UcdQEditor_mVc.prototype, {	
	updateQuery : { 
		value:  function(consts) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "relation", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	}
});

/**
 * Subclass of ConstQEditor_mVc handling the edition of position based constraints
 * @param parentDivId
 * @param formName
 * @param queryview
 * @returns {UcdQEditor_mVc}
 */
function PosQEditor_mVc(params /*{parentDivId, formName, queryView, frames, urls}*/){
	ConstQEditor_mVc.call(this, params);
	params.editor = this;
	this.fieldListView = new ConeSearch_mVc(params);
}
/**
 * Method overloading
 */
PosQEditor_mVc.prototype = Object.create(ConstQEditor_mVc.prototype, {	
	draw : { 
		value: function() {
			var that = this;
			this.fieldListView.draw();
			this.parentDiv.append('<div id=' + this.constContainerId + ' style="float: left;background: transparent; display: inline;"></div>');
			$("#"+this.constContainerId).append('<input  title="Click to add a search cone" class="bigarrowbutton" type="button">');
			var isPos = {"fieldset":"105px","div":"80px"};
			this.constListId = this.constListView.draw(isPos);
			this.parentDiv.find("input.bigarrowbutton").click(function() {that.fireAttributeEvent();});
			this.fieldListView.setRegionForm(
					function(data){
						if( data.userAction ){
							if( data.region.size.x > 5 || data.region.size.y > 5) {
									Modalinfo.error("The region size can't exceeded 5 deg. \nIts actual size is " + JSON.stringify(data.region.size));
							} else { 
								that.fireRegionEvent(data);				
								Modalinfo.closeRegion();
							}
						}
					});
		}
	},
	displayFields: { 
		value: function() {}
	},
	setTestForm : function() {
		var inputfield = $('#' + this.cooFieldId);
		var handler = (this.sesameURL != null) ? function() {
			Processing.show("Waiting on SESAME response");
			$.getJSON("sesame", {
				object : inputfield.val()
			}, function(data) {
				Processing.hide();
				if (Processing.jsonError(data, "Sesame failure")) {
					return;
				} else {
					inputfield.val(data.alpha + ' ' + data.delta);
				}
			});
		} : function() {
			Modalinfo.info("name resolver not implemented yet");
		};
		$("#poscolumns_CSsesame").parents("#posConstEditor").find("#posConstEditor_constcont").find("input:first").click(handler);
		$('#' + this.sesameId).click(handler);
		
	},
	updateQuery : { 
		value:  function(consts) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "position", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	},
	fireClearAllConst : { 
		value:  function() {
			this.constListView.fireClearAllConst();
			var that = this;
			this.listener.controlClearAllConst();	
			this.fieldListView.fireClearAllConst();
		}
	},

	fireRegionEvent: { 
		value: function(data) {		
			var that = this;
			if( data && data.userAction && data.isReady ) {
				var rq = '';
				var i;
				if( data.region.format == "array2dim") {
					rq = '';
					for( i=0 ; i<(data.region.points.length - 1) ; i++ ) {
						if( i > 0 ) rq += " ";
						rq += data.region.points[i][0] + " " + data.region.points[i][1];
					}

				} else if( data.region.format == "array") {
					rq = '';
					for( i=0 ; i<data.region.points.length  ; i++ ) {
						if( i > 0 ) rq += " ";
						rq += data.region.points[i];
					}

				} else {
					Modalinfo.error(data.region.format + " not supported region format");
					return;
				}
				/*
				 * In region mode: only one constraint
				 */
				this.fireClearAllConst();
				if( rq != '' ) {
					this.listener.controlAttributeEvent({type: "region", frame: "ICRS", position: rq, radius: 0}, that.constListId);
					$("#" + this.constListId + " span.help").attr("style","display:none;");
				}
				this.fieldListView.resetPosition();
			}
		}
	},
	fireAttributeEvent: { 
		value: function() {			
			var that = this;
//			this.listener.controlClearConst(".*region.*");	
//			this.listener.controlAttributeEvent(that.fieldListView.getSearchParameters(), that.constListId);
//			$("#" + this.constListId + " span.help").attr("style","display:none;");
//			this.fieldListView.resetPosition();
			var cooField = this.parentDiv.find("input[id$='CScoofield']");
			
			var handler = function(listener, constList, fieldListView) {
				Processing.show("Waiting on SESAME response");
				$.getJSON("sesame", {
					object : cooField.val()
				}, function(data) {
					Processing.hide();
					if (Processing.jsonError(data, "Sesame failure", "Name "+cooField.val()+" cannot be resolved")) {
						return;
					} else {
						cooField.val(data.alpha + ' ' + data.delta);
						listener.controlClearConst(".*region.*");	
						listener.controlAttributeEvent(that.fieldListView.getSearchParameters(), that.constListId);
						$("#" + constList + " span.help").attr("style","display:none;");
						fieldListView.resetPosition();
					}
				});
			};
			
			this.parentDiv.find("input.bigarrowbutton").click(handler(this.listener, this.constListId, this.fieldListView));

		}
	},
	fireAttributeAutoEvent: { 
		value: function() {			
			var that = this;
			/*
			 * More than One editor mean that he users have stacked multiple position constraints
			 */
			if( this.fireGetNumberOfEditor() <= 1 && this.fieldListView.hasSearchParameters() ) {
				//this.fireClearAllConst();
				$("#" + this.constListId + " span.help").attr("style","display:none;");
				this.listener.controlAttributeEvent(that.fieldListView.getSearchParameters(), that.constListId);
			}
		}
	},
	firePoslistUpload: { 
		value: function(filename, radius) {			
			var that = this;
			this.constListView.fireRemoveAllHandler();
			this.listener.controlAttributeEvent({position: "poslist:" + filename, radius: radius, frame: 'ICRS'}, that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		}
	}
});

/**
 * Subclass of CatalogueQEditor_mVc handling the edition of catalogue based constraints in matchPattern
 */
function CatalogueQEditor_mVc(params /*{parentDivId, formName, getMetaUrl, queryView, relationName, distanceQualifer, help}*/){
	ConstQEditor_mVc.call(this, params);
	var that = this;
	this.help = params.help;
	this.fieldListView = new CatalogueList_mVc(params.parentDivId ,
			this.formName ,
			{stackHandler: function(ahName){ that.fireAttributeEvent(ahName);}
		}
	);
}
/**
 * Method overloading
 */
CatalogueQEditor_mVc.prototype = Object.create(ConstQEditor_mVc.prototype, {	
	draw : { 
		value: function() {
			var that = this;
			this.fieldListView.draw();
			this.parentDiv.append('<div id=' + this.constContainerId + ' style="width:450px;float: left;background: transparent; display: inline;"></div>');
			var isPos = {"fieldset":"131px", "div":"102px"};
			this.constListId = this.constListView.draw(isPos);
			$('#' + this.constContainerId).append('<div style="width: 100%;"><span class=spanhelp>' + this.help + '</span></div>');
			if( !this.fieldsLoaded ) {
				this.listener.controlLoadFields();
				this.fieldsLoaded = true;
			}
		}
	},		
	updateQuery : { 
		value:  function(consts) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "relation", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	}
});


/**
 * Subclass of tapQEditor_mVc handling the edition of tap queries
 */
function tapColSelector_mVc(params){
	ConstQEditor_mVc.call(this, params);
	var that = this;
	this.help = params.help;
	this.constPosContainer   = params.parentDivId + "_constposcont";
	
	this.fieldListView = new TapColList_mVc(params.parentDivId ,
		this.formName ,
		{
			stackHandler: function(ahName){ that.fireAttributeEvent(ahName);} ,
			orderByHandler: function(ahName){ that.fireOrderBy(ahName);}
		},       
		params.sessionID
	);

	this.fieldListView.setStackTooltip("Click to select this field");
}
/**
 * Method overloading
 */
tapColSelector_mVc.prototype = Object.create(ConstQEditor_mVc.prototype, {	
	draw : { 
		value: function() {
			this.fieldListView.draw();
			this.parentDiv.append('<div >' +
					//	+ '<div id=' + this.constPosContainer + '></div>'
					'<div id=' + this.constContainerId + '></div>' +
					'</div>');
			var isADQL = true;
			this.constListId = this.constListView.draw(null, isADQL);
			this.orderByView.draw();
		}
	},
	// handler is called after the form is uptdated: query submission e.g.
	fireSetTreepath : { 
		value: function(treePath, handler){
			var that = this;
			if( this.dataTreePath != null ){
				this.fireClearAllConst();
				this.queryView.fireDelConstraint(this.formName, "orderby");
			}

			this.dataTreePath = treePath;	
			// table name can include the schema
			//this.dataTreePath.table = this.dataTreePath.table.split('.').pop();
			this.queryView.fireSetTreePath(this.dataTreePath);
			this.queryView.fireAddConstraint(this.formName, "select", ["*"]);
			this.orderByView.fireClearAllConst();
			this.listener.controlLoadFields(that.dataTreePath, handler);
			this.fieldListView.setDataTreePath(this.dataTreePath);
		}
	},
	addTableOption: { 
		value: function(treePath) {
			this.fieldListView.addTableOption(treePath);
		}
	},
	fireAttributeEvent :  { 
		value: function(ahname){
			var that = this;
			this.listener.controlAttributeHandlerEvent(that.fieldListView.getAttributeHandler(ahname), that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		}
	},		
	fireOrderBy :  { 
		value : function(nameattr){
			var tpn ="";
			if( nameattr != 'OrderBy' ) {
				tpn = this.fieldListView.dataTreePath.schema + "." + this.fieldListView.dataTreePath.table + "." + nameattr;
				var qtpn = tpn.quotedTableName().tableName;
				this.orderByView.setOrderBy(tpn);
				var stmt = nameattr ;
				if( this.orderByView.isDesc()) qtpn += " desc";
				if( this.queryView != null ) {				
					this.queryView.fireAddConstraint(this.formName, "orderby" , [qtpn]);
				} else {
					Out.info("No Query View OB:" + stmt);
				}
			} else {
				this.queryView.fireDelConstraint(this.formName, "orderby");
			}
			var that = this;
			this.listener.controlOrderBy(tpn);

		}
	},
	updateQuery  :  { 
		value:function(consts, joins) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "select", consts, joins);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	},
	getCurrentTreePath: {
		value: function(){
			return this.fieldListView.dataTreePath;
		}
	}

});


/**
 * @param parentDivId
 * @param formName
 * @param queryview
 * @param getTableAttUrl
 * @param sesameUrl
 * @param upload: {url,  postHandler: called on success}
 * @param sessionID
 * @param help
 * @returns {tapQEditor_mVc}
 */
function tapQEditor_mVc(params /*parentDivId, formName, sesameUrl, upload { url, postHandler}, queryView, currentNode }*/){
	tapColSelector_mVc.call(this, params);
	var that = this;
	this.fieldListView = new TapFieldList_mVc(params.parentDivId, 
		this.formName ,
		{
			stackHandler: function(ahName){ that.fireAttributeEvent(ahName);} ,
			radec: false
		} ,       
		params.sessionID
	);

	this.fieldListView.setStackTooltip("Click to constrain this field");
	this.posEditor = new TapSimplePos_mVc({editor: this,
		parentDivId: this.constPosContainer,
		formName: this.formName,
		frames: null,
		urls: {sesameURL: params.sesameUrl, uploadURL:params.upload.url},
	    postUploadHandler: params.upload.postHandler,
	});
}
/**
 * Method overloading
 */
tapQEditor_mVc.prototype = Object.create(tapColSelector_mVc.prototype, {	
	draw : { 
		value: function() {
			this.fieldListView.draw();
			this.parentDiv.append('<div >' +
				'<div id=' + this.constPosContainer + '></div>' +
				'<div id=' + this.constContainerId + '></div>' +
				'</div>'
			);

//			$("#" +  this.constContainerId).append('<div class=constdiv><fieldset class="constraintlist">'
//			+ '<legend>Position</legend>'
//			+ '<span class=help>Click on a <input class="stackconstbutton" type="button"> button to append,<br>the constraint to the list</span>'
//			+ '</fieldset>'
//			+ '</div>');
			//this.posEditor.draw();
			var isADQL = true;
			this.constListId = this.constListView.draw(null, isADQL);
			//this.orderByView.draw();
		}
	},
	displayFields: { 
		value: function(attributesHandlers){
			this.fieldListView.displayFields(attributesHandlers);
			this.fieldListView.lookForAlphaKeyword();
			this.fieldListView.lookForDeltaKeyword();
			return;
		}
	},
	fireGoodyremoved :  { 
		value: function(goodyName){
			this.posEditor.fireClearAllConst();
		}
	},
	fireAttributeEvent :  { 
		value: function(ahname){
			var that = this;
			this.listener.controlAttributeHandlerEvent(that.fieldListView.getAttributeHandler(ahname), that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		}
	},		
	fireInputCoordEvent :  { 
		value : function(ra, dec, radius, frame){
			var that = this;
			var rakw = this.fieldListView.getRaKeyword();
			if( rakw.length == '' ) {
				Modalinfo.error("RA field not set");
				return;
			}
			var deckw = this.fieldListView.getDeltaKeyword();
			if( deckw.length == '' ) {
				Modalinfo.error("DEC field not set");
				return;
			}
			this.listener.controlInputCoord(ra, dec, radius, frame ,
						rakw, deckw, that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		}
	},
	updateQuery  :  { 
		value:function(consts, joins) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "column", consts, joins);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	},
	isReadyToUpload :  { 
		value:function(consts, joins) {	
			if( this.fieldListView.getRaKeyword().length == '' || this.fieldListView.getDeltaKeyword() == '' ) {
				Modalinfo.error("Both RA and DEC fields must be set");
				return false;
			}
			return true;
		}
	},
	getUploadedFile: {
		value: function(){
			return this.posEditor.uploadedFile;
		}
	}
});

/**
 * @param parentDivId
 * @param formName
 * @param queryview
 * @param getTableAttUrl
 * @param sesameUrl
 * @param upload: {url,  postHandler: called on success}
 * @param sessionID
 * @param help
 * @returns {tapPosQEditor_mVc}
 */
function tapPosQEditor_mVc(params /*parentDivId, formName, sesameUrl, upload { url, postHandler, preloadedGetter}, queryView, currentNode }*/){
	tapColSelector_mVc.call(this, params);
	var that = this;
	this.fieldListView = new TapFieldList_mVc(params.parentDivId,
			this.formName,
			{
				stackHandler: null,
				orderByHandler: null,
				raHandler: null,
				decHandler: null,
				radec: true
			},        
		params.sessionID,
	);
	this.fieldListView.setStackTooltip("Click to constrain this field");
	this.posEditor = new TapSimplePos_mVc({editor: this,
		parentDivId: this.constPosContainer,
		formName: this.formName,
		frames: null,
		urls: {sesameURL: params.sesameUrl, uploadURL:params.upload.url},
	    postUploadHandler: params.upload.postHandler,
	    preloadedGetter: params.upload.preloadedGetter,
	});
}
/**
 * Method overloading
 */
tapPosQEditor_mVc.prototype = Object.create(tapColSelector_mVc.prototype, {	
	draw : { 
		value: function() {
			this.fieldListView.draw();
			this.parentDiv.append('<div>' +
					'<div id=' + this.constPosContainer + '></div>' +
					'<div id=' + this.constContainerId + '></div>' +
					'</div>');

//			$("#" +  this.constContainerId).append('<div class=constdiv><fieldset class="constraintlist">'
//			+ '<legend>Position</legend>'
//			+ '<span class=help>Click on a <input class="stackconstbutton" type="button"> button to append,<br>the constraint to the list</span>'
//			+ '</fieldset>'
//			+ '</div>');
			this.posEditor.draw();
			
			var isPos = {"fieldset":"inherit", "div":"102px"};
			var isADQL = true;
			this.constListId = this.constListView.draw(isPos, isADQL);
			//this.orderByView.draw();
		}
	},
	// handler is called after the form is uptdated: query submission e.g.
	fireSetTreepath : { 
		value: function(treePath, handler){
			var that = this;
			if( this.dataTreePath != null ){
				this.fireClearAllConst();
				this.queryView.fireDelConstraint(this.formName, "orderby");
			}

			this.dataTreePath = treePath;	
			// table name can include the schema
			//this.dataTreePath.table = this.dataTreePath.table.split('.').pop();
			this.queryView.fireSetTreePath(this.dataTreePath);
			this.queryView.fireAddConstraint(this.formName, "select", ["*"]);
			this.orderByView.fireClearAllConst();
			this.listener.controlLoadFields(that.dataTreePath, handler);
			this.fieldListView.setDataTreePath(this.dataTreePath);
			this.posEditor.uploadedFile = '';
		}
	},
	displayFields: { 
		value: function(attributesHandlers){
			this.fieldListView.displayFields(attributesHandlers);
			this.fieldListView.lookForAlphaKeyword();
			this.fieldListView.lookForDeltaKeyword();
			return;
		}
	},
	fireAttributeEvent :  { 
		value: function(ahname){
			var that = this;
			this.listener.controlAttributeHandlerEvent(that.fieldListView.getAttributeHandler(ahname), that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		}
	},		
	fireGoodyRemoved  :  { 
		value: function(goodyName){
			this.fireClearAllConst();
		}
	},
	fireInputCoordEvent :  { 
		value : function(ra, dec, radius, frame){
			var that = this;
			var rakw = this.fieldListView.getRaKeyword();
			if( rakw.length == '' ) {
				Modalinfo.error("RA field not set");
				return;
			}
			var deckw = this.fieldListView.getDeltaKeyword();
			if( deckw.length == '' ) {
				Modalinfo.error("DEC field not set");
				return;
			}
			this.listener.controlInputCoord(ra, dec, radius, frame,
						rakw, deckw, that.constListId);
			$("#" + this.constListId + " span.help").attr("style","display:none;");
		}
	},
	updateQuery  :  { 
		value:function(consts, joins) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "column", consts, joins);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	},
	isReadyToUpload :  { 
		value:function(consts, joins) {	
			if( this.fieldListView.getRaKeyword().length == '' || this.fieldListView.getDeltaKeyword() == '' ) {
				Modalinfo.error("Both RA and DEC fields must be set");
				return false;
			}
			return true;
		}
	},
	getUploadedFile: {
		value: function(){
			return this.posEditor.uploadedFile;
		}
	},
	fireSupportUpload: {
		value: function(supportUpload){
			this.posEditor.supportUpload(supportUpload);
		}
	}
});







function tapCrossMatchQEditor_mVc(params /*parentDivId, formName, sesameUrl, upload { url, postHandler}, queryView, currentNode }*/){
	tapPosQEditor_mVc.call(this, params);
	this.xParentDivId = "X" + this.parentDiv.attr('id');
	this.xfieldListView = undefined ;
	this.sessionId = params.sessionID;
}

/**
 * Method overloading
 */
tapCrossMatchQEditor_mVc.prototype = Object.create(tapPosQEditor_mVc.prototype, {	
	draw : { 
		value: function() {
			
			//first fieldlist
			this.fieldListView.draw();
			this.parentDiv.css("width", "");
			this.parentDiv.wrap("<div id='tapCrossMatchParent'></div>");
			//display row
			$("#tapCrossMatchParent").css("display","flex");
			
			//second fieldlist div
			$("#tapCrossMatchParent").append("<div  style='width: 100px;'></div>" +
											"<div style='width: 100%;' id='" + this.xParentDivId + "'></div>");
			
			
			//debug
			$("#tapCrossMatchParent").css("border","1px solid red");
			$("#" + this.xParentDivId).css("border","1px solid green");
			
			//setup 2nd fieldlist
			this.xfieldListView = new TapFieldList_mVc(this.xParentDivId,
				this.formName,
				{
					stackHandler: null,
					orderByHandler: null,
					raHandler: null,
					decHandler: null,
					radec: true
				} ,
				this.sessionID,
			);
			this.xfieldListView.draw();
			this.xfieldListView.setStackTooltip("Click to constrain this field");
			
			// remove join table input
			$("#XtapCrossMatchSelector_tableSelect").parent().parent().remove();
			$("#tapCrossMatchSelector_tableSelect").parent().parent().remove();
			
			//fill 2nd fieldlist
			this.xfieldListView.setDataTreePath(new DataTreePath({nodekey:'node', schema: 'schema', table: 'table', tableorg: 'schema.table'}));
			
			//add constraint view (empty)
			$("#" + this.xParentDivId).append('<div><div id=' + this.constContainerId + '></div></div>');
			$("#" + this.constContainerId).css({"height" : "100px", "margin-top" : "270px", "border" : "1px solid pink"});

		}
	}

});

