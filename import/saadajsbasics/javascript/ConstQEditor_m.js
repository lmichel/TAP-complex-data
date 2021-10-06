/**
 * ConstQEditor_Mvc: Model of the constraint query editor
 * 
 * @param chemin : URL returning metadata (format given bellow)
 * @returns {ConstQEditor_Mvc}
 */
function ConstQEditor_Mvc(){
	this.listener = {};
	this.const_key = 1;
	this.attributeHandlers = new Array();
	this.attributeHandlersSearch = new Array();
	this.editors = new Object();
	this.constEditorRootId = 'kwconsteditor_';
}

ConstQEditor_Mvc.prototype = {
		addListener : function(listener){
			this.listener = listener;
		},
		loadFields : function(dataTreePath /* instance of DataTreePath */) {
			var that = this;
			this.attributesHandlers = {};
			if( dataTreePath ) {
				MetadataSource.getTableAtt(
						dataTreePath
						, function() {
							var ahm = MetadataSource.ahMap(dataTreePath);
							that.attributeHandlersSearch = new Array();
							for( var k=0 ; k<ahm.length ; k++) {
								var ah = ahm[k];
								that.attributeHandlersSearch.push(ah);		
								that.attributeHandlers[ah.nameattr] = ah;				
							}
						});
			}
		},
		addPresetValues : function(){
			// Nothing to do here but for TAP
		},		
		clearAllConst : function(){
			this.const_key = 1;
			this.editors = new Object();
			this.notifyTypoMsg(false, '');
			this.updateQuery();
		},
		clearConst : function(filter){
			this.notifyTypoMsg(false, '');
			for(var e in this.editors) {
				if( e.match(filter) ) {
					delete this.editors[e];
					this.const_key --;
				}
			}
			this.updateQuery();
		},

		edit : function(){
			return this.editors;
		},
		processAttributeEvent : function(ahname, constListId){
			this.processAttributeHandlerEvent(this.attributeHandlers[ahname], constListId);
		},
		processAttributeHandlerEvent : function(ah, constListId){
			var first = true;
			for( k in this.editors ) {
				first = false;
				break;
			}
			var divKey = this.constEditorRootId + ah.nameattr + this.const_key;
			Out.debug("mv constraint " + ah.nameattr + " to #" + constListId);
			var v = new KWConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		},
		processRemoveFirstAndOr : function(key) {
			delete this.editors[key];
			for( var k in this.editors ) {
				this.editors[k].fireRemoveAndOr();
				break;
			}
		},
		notifyNextListener : function(attr) {
			var that = this;
			this.listener.nextListener(attr);
		},
		updateQuery : function() {
			var that = this;
			var retour= "    ";
			for( var e in this.editors) {
				var q =  this.editors[e].fireGetADQL();
				if( retour.length > 96 ) retour += "\n    ";
				if( q != null ) {
					retour += " " + $.trim(this.editors[e].fireGetADQL());
				}
			}
			this.listener.controlUpdateQuery(retour);
		},
		getNumberOfEditor: function() {
			var retour = 0;
			for( var e in this.editors) {
				retour ++;
			}
			return retour;
		},
		notifyRunQuery : function() {
			var that = this;
			this.listener.controlRunQuery();
		},
		notifyTypoMsg : function(fault, msg){
			var that = this;
			this.listener.controlTypoMsg(fault, msg) ;
		},
		notifyFieldsStored: function(){
			var that = this;
			this.listener.controlFieldsStored(that.attributeHandlersSearch) ;
		},
		getAttributeHandlers: function() {
			return this.attributeHandlers;
		},
		// used by regions
		getDefaultValue: function() {
			return null;
		}

};

/**
 * Sub-class of ConstQEditor_Mvc, specialized to manage UCDs instead of Fields
 * Same constructor as the superclass
 * Only the UcdQEditor_Mvc method is overloaded
 * @param chemin
 */
function UcdQEditor_Mvc(){
	ConstQEditor_Mvc.call(this);
};
/**
 * Method overloading
 */
UcdQEditor_Mvc.prototype = Object.create(ConstQEditor_Mvc.prototype, {
	processAttributeEvent: {
		value : function(ahname, constListId){
			var ah = this.attributeHandlers[ahname];
			if( ah == null ){
				Out.info("No AH referenced by " + ahname);
			} else {
				var first = true;
				for( k in this.editors ) {
					first = false;
					break;
				}
				Out.debug("mv UCD constraint " + ahname + " to #" + constListId );
				var divKey = this.constEditorRootId + ahname + this.const_key;
				var v = new UCDConstraint_mVc({divId: divKey
					, constListId: constListId
					, isFirst: first
					, attributeHandler: ah
					, editorModel: this
					, defValue: ''});

				this.editors[divKey] = v;
				v.fireInit();
				this.const_key++;
			}
		}
	},
	loadFields: {
		value : function(dataTreePath /* instance of DataTreePath */) {
			var that = this;
			this.attributesHandlers = {};
			if( dataTreePath ) {
				MetadataSource.getTableAtt(
						dataTreePath
						, function() {
							var ahm = MetadataSource.ahMap(dataTreePath);
							that.attributeHandlersSearch = new Array();
							for( var k=0 ; k<ahm.length ; k++) {
								var ah = ahm[k];
								that.attributeHandlersSearch.push(ah);		
								that.attributeHandlers[ah.ucd] = ah;				
							}
						});
			}
		}
	},

	updateQuery : {
		value : function() {
			var that = this;
			var retour= "";
			var and = "";
			for( var e in this.editors) {
				var q = this.editors[e].fireGetADQL();
				if( q != null ) {
					retour += and + q;
					if( and == "" ) and = "\n        AND " ;
				}
			}
			this.listener.controlUpdateQuery(retour);
		}
	}
});

/**
 * Sub-class of ConstQEditor_Mvc, specialized to manage UCDs instead of Fields
 * Same constructor as the superclass
 * Only the UcdQEditor_Mvc method is overloaded
 * @param chemin
 */
function UcdPatternEditor_Mvc(relationName){
	UcdQEditor_Mvc.call(this);
	this.relationName = relationName;
};
/**
 * Method overloading
 */
UcdPatternEditor_Mvc.prototype = Object.create(UcdQEditor_Mvc.prototype, {
	updateQuery : {
		value : function() {
			var that = this;
			var retour= "";
			var and = "";
			for( var e in this.editors) {
				var q = this.editors[e].fireGetADQL();
				if( q != null ) {
					retour += and + q;
					if( and == "" ) and = "\n        AND " ;
				}
			}
			if( retour != "" ) {
				retour = "  matchPattern {" + this.relationName + ",\n"
				+ "    AssUCD{" + retour + "}\n"
				+ "  }";
			}
			this.listener.controlUpdateQuery(retour);
		} 
	}
});

/**
 * Sub-class of ConstQEditor_Mvc, specialized to manage Position search instead of Fields
 * Same constructor as the superclass
 * Only the UcdQEditor_Mvc method is overloaded
 * @param chemin
 */
function PosQEditor_Mvc(){
	ConstQEditor_Mvc.call(this, null);
};

/**
 * Method overloading
 */
PosQEditor_Mvc.prototype = Object.create(ConstQEditor_Mvc.prototype, {
	processAttributeEvent: {
		value : function(coneParams, constListId){
			if(coneParams == null){
				return;
			}
			/*
			 * create a pseudo ah for each searched position
			 */
			var ah = {
					nameorg: coneParams.position,
					nameattr: (coneParams.type == "region")? "region" : coneParams.position.replace(/[^0-9a-zA-Z_]+/g, '_'),
							ucd: '',
							unit: '',
							comment: 'cone search',
							radius:  coneParams.radius,
							frame:  coneParams.frame,
							value: coneParams.position
			};
			var divKey = this.constEditorRootId + ah.nameattr ;
			/*
			 * Only one constraint for a given position
			 */					

			/*
			 * If the same project is already targeted, this one is repalced with the new cone 
			 */
			if( this.editors[divKey] != null ) {
				this.editors[divKey].drop();
			}
			/*
			 * Now we can add the cone in "toute serenite"
			 */
			var first = true;
			for( k in this.editors ) {
				first = false;
				break;
			}
			var v = new PosConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''});
			this.editors[divKey] = v;
			v.fireInit();
		}
	},
	storeFields : {
		value :function(data) {
			/*
			 * Stockage des AHs dans le modele
			 */
			this.attributeHandlers = new Array();
			this.attributeHandlersSearch = new Array();
			for(var i=0 ; i<data.attributes.length ; i++ ) {
				this.attributeHandlers[data.attributes[i].ucd] = data.attributes[i];
				this.attributeHandlersSearch[this.attributeHandlersSearch.length]= data.attributes[i];
			}
			this.notifyFieldsStored();
		}
	},		
	updateQuery : {
		value : function() {
			var that = this;
			var retour= "";
			for( var e in this.editors) {
				var q = this.editors[e].fireGetADQL();
				if( q != null ) {
					if( retour != "" ) retour += ",\n" ;
					retour += "    " + this.editors[e].fireGetADQL();
				}
			}
			this.listener.controlUpdateQuery(retour);
		}
	},
	getDefaultValue : {
		value :  function() {				
			for( var e in this.editors) {
				//	if( e.match(".region.*") ){
				return {type: "saadaql", value: this.editors[e].fireGetADQL()};
				//	}
			}

			return null;
		}
	}

});

/**
 * Sub-class of ConstQEditor_Mvc, specialized catalogue counterpart
 * Same constructor as the superclass
 * @param chemin
 */
function CatalogueQEditor_Mvc(params /*{parentDivId, formName, getMetaUrl, queryView, relationName, distanceQualifer, help}*/){
	ConstQEditor_Mvc.call(this, params);
	this.relationName = params.relationName;
	this.qualifier = params.distanceQualifer;
	this.getMetaUrl = params.getMetaUrl;
};

CatalogueQEditor_Mvc.prototype = Object.create(ConstQEditor_Mvc.prototype, {

	loadFields : {
		value: function(){
			var that = this;
			if( this.getMetaUrl != null ) {
				$.getJSON(this.getMetaUrl,function(data) {
					that.storeFields(data);
				});
			} else {
				this.storeFields(
						{attributes: [
						              {ACDS_CATACRO: "ACDS_CATACRO", ACDS_CATCDSTB: "ACDS_CATCDSTB", ACDS_CATCONF: "ACDS_CATCONF", ACDS_CATINTNB: "ACDS_CATINTNB", ACDS_CATINTNB: "ACDS_CATINTNB", ACDS_CATNAME: "ACDS_CATNAME", ACDS_CDSCAT: "ACDS_CDSCAT", VIZIER_KW: "VIZIER_KW", CLASSNAME: "CLASSNAME"}
						              ,{ACDS_CATACRO: "ACDS_CATACRO", ACDS_CATCDSTB: "ACDS_CATCDSTB", ACDS_CATCONF: "ACDS_CATCONF", ACDS_CATINTNB: "ACDS_CATINTNB", ACDS_CATINTNB: "ACDS_CATINTNB", ACDS_CATNAME: "ACDS_CATNAME", ACDS_CDSCAT: "ACDS_CDSCAT", VIZIER_KW: "VIZIER_KW", CLASSNAME: "CLASSNAME2"}
						              ]
						});
			}
		}
	},
	processAttributeEvent: {
		value : function(ahname, constListId){
			var ah = this.attributeHandlers[ahname];
			if( ah == null ) {
				Modalinfo.error("Internal error: No constraint referenced by the key '" + ahname + "' (see console)");	
				var ks = new Array();
				$.each(this.attributeHandlers, function(key, value) {
					ks.push(key);	

				});
				return;
			}
			var first = true;
			for( k in this.editors ) {
				first = false;
				break;
			}
			Out.debug("mv catalogue constraint " + ahname + " to #" + constListId );
			var divKey = this.constEditorRootId + ahname ;

			if( this.editors[divKey] != null ) {
				Modalinfo.error("Constraint on " + ahname + " already active: cannot be duplicated");
				return;
			}
			var v = new CatalogueConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''
					, qualifier: this.qualifier});

			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		}
	},
	storeFields : {
		value :  function(data) {
			this.attributeHandlers = new Array();
			this.attributeHandlersSearch = new Array();
			for(var i=0 ; i<data.attributes.length ; i++ ) {
				this.attributeHandlers[data.attributes[i].CLASSNAME] = data.attributes[i];
				this.attributeHandlersSearch[this.attributeHandlersSearch.length]= data.attributes[i];
			}
			this.notifyFieldsStored();
		}
	},
	updateQuery : {
		value : function() {
			var that = this;
			var sq = "";
			for( var e in this.editors) {
				var q = this.editors[e].fireGetADQL();
				if( q != null && q != "" ) {
					if( sq != "" ) sq += "\n";
					sq += "    matchPattern { " + this.relationName + "," + q+ "}";
				}
			}
			this.listener.controlUpdateQuery(sq);
		} 
	}
});

/**
 * Sub-class of ConstQEditor_Mvc, specialized in catalogue counterpart with proba of identification
 * Same constructor as the superclass
 * @param chemin
 */
function CrossidQEditor_Mvc(params){
	CatalogueQEditor_Mvc.call(this, params);
};

CrossidQEditor_Mvc.prototype = Object.create(CatalogueQEditor_Mvc.prototype, {

	processAttributeEvent: {
		value : function(ahname, constListId){
			var ah = this.attributeHandlers[ahname];
			if( ah == null ) {
				Modalinfo.error("Internal error: No constraint referenced by the key '" + ahname + "' (see console)");	
				var ks = new Array();
				$.each(this.attributeHandlers, function(key, value) {
					ks.push(key);
				});
				return;
			}
			var first = true;
			for( k in this.editors ) {
				first = false;
				break;
			}
			Out.debug("mv catalogue constraint " + ahname + " to #" + constListId );
			var divKey = this.constEditorRootId + ahname ;

			if( this.editors[divKey] != null ) {
				Modalinfo.error("Constraint on " + ahname + " already active: canot be duplicated");
				return;
			}
			var v = new CrossidConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''
					, qualifier: this.qualifier});

			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		}
	}
});

/**
 * Sub-class of ConstQEditor_Mvc, specialized in catalogue counterpart with proba of identification
 * Same constructor as the superclass
 * @param chemin
 */
function tapColSelector_Mvc(){
	ConstQEditor_Mvc.call(this);
	this.joinKeys = null;
	this.dataTreePath = null; // instance of DataTreePath
	this.joinedTableLoaded = false;
	this.orderBy = "";
};

tapColSelector_Mvc.prototype = Object.create(ConstQEditor_Mvc.prototype, {
	loadFields : {
		value: function(treePath, handler) {
			var that = this;
			if(treePath) {
				this.dataTreePath = jQuery.extend({}, treePath);			
				MetadataSource.getTableAtt(
						this.dataTreePath
						, function(cache) {
							that.notifyAddTableOption(that.dataTreePath);	
							var ahm = cache.hamap;
							that.attributeHandlers = new Array();
							that.attributeHandlersSearch = new Array();
							for(var k=0 ; k<ahm.length ; k++ ) {
								var ah = ahm[k];
								that.attributeHandlers[ah.nameattr] = ah;
								that.attributeHandlersSearch[that.attributeHandlersSearch.length]=ah;
							}
							if( !that.joinedTableLoaded ) {
								that.joinKeys = new Array();
								var jt =cache.targets;
								for( var k=0 ; k<jt.length ; k++) {
									that.joinKeys.push(jt[k]);
								}
								// The same component is used for all dataset: meta data must be refreshed at any time
								//that.joinedTableLoaded = true;
							}
							if( handler ) handler();
						});
			} else {
				this.attributeHandlers = new Array();
				this.attributeHandlersSearch = new Array();
				this.joinKeys = new Array();
				this.dataTreePath = null;
			}
		}
	},
	notifyAddTableOption: {
		value: function(treePath){
			var that = this;
			this.listener.controlAddTableOption(treePath);
		}
	},
	processAttributeHandlerEvent : {
		value: function(ah, constListId){
			var that = this;
			var first = true;
			var currentTreePath = null;
			for( k in this.editors ) {
				first = false;
				break;
			}
			currentTreePath  = this.listener.controlCurrentTreePath();
			var divKey = this.constEditorRootId + ah.nameattr + this.const_key;
			Out.debug("mv constraint " + ah.nameattr + " to #" + this.constListId);
			var v = new TapKWSimpleConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''
					, treePath: jQuery.extend({}, currentTreePath)});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		}
	},
	processOrderBy: {
		value: function(nameattr) {
			this.orderBy = ( nameattr != 'OrderBy' )? nameattr: "";		
			this.updateQuery();
		}
	},
	updateQuery : {
		value: function() {
			var that = this;
			// queried table path
			var st = this.dataTreePath.schema + "." + this.dataTreePath.table;
			var joins = {};
			var q = new Array();
			/*
			 * Merge all constraints
			 */
			for( var e in this.editors) {
				var ed = this.editors[e];
				// Path of the table targeted by he current constraint
				var tt = ed.treePath.schema + "." + ed.treePath.table ;
				q.push( ed.fireGetADQL());
				// if constraint not applied to the queried table: join
				if( tt != st ) {
					/*
					 * Key of the join descriptor
					 */
					for(var i=0 ;  i<this.joinKeys.length ; i++ ) {
						var lt = this.joinKeys[i].target_datatreepath.schema + "." + this.joinKeys[i].target_datatreepath.table;
						if( lt == tt) {
							joins[tt] = this.joinKeys[i];
						}
					} 
				}
			}
			if( this.orderBy != "" ) {
				var fs = this.orderBy.split('.');
				var tt = fs[0] + "." + fs[1] ;
				if( tt != st ) {
					for(var i=0 ;  i<this.joinKeys.length ; i++ ) {
						/*
						 * Key of the join descriptor
						 */
						var lt = this.joinKeys[i].target_datatreepath.schema + "." + this.joinKeys[i].target_datatreepath.table;
						if( lt == tt) {
							joins[tt] = this.joinKeys[i];
						}
					} 
				}
			}
			if( q.length == 0 ) {
				q = ["*"];
			}
			this.listener.controlUpdateQuery(q, joins);
		}
	}
});

function tapQEditor_Mvc(){
	tapColSelector_Mvc.call(this);
};
/**
 * 
 */
tapQEditor_Mvc.prototype = Object.create(tapColSelector_Mvc.prototype, {
	processAttributeHandlerEvent : {
		value: function(ah, constListId){
			var that = this;
			var first = true;
			var currentTreePath = null;
			for( k in this.editors ) {
				first = false;
				break;
			}
			currentTreePath  = this.listener.controlCurrentTreePath();

			var divKey = this.constEditorRootId + ah.nameattr + this.const_key;
			Out.debug("mv constraint " + ah.nameattr + " to #" + constListId);
			var v = new TapKWConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''
					, treePath: jQuery.extend({}, currentTreePath)});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		}
	},
	processInputCoord: {
		value: function(ra, dec, radius, frame, rakw, deckw, constListId) {
			var that = this;
			var first = true;
			var currentTreePath = null;
			for( k in this.editors ) {
				first = false;
				break;
			}
			currentTreePath  = this.listener.controlCurrentTreePath();
			var defValue = '';
			var nameAh = '';
			if( ra.startsWith('poslist:')) {
				defValue = 'list params,'+ radius;
				nameAh = 'POSLIST:' + ra.replace('poslist:','');;
			} else {
				defValue = ra + ',' + dec + ','+ radius;
				nameAh = 'POSITION';				
			}
			var divKey = this.constEditorRootId + "ADQLPos" + this.const_key;
			var v = new TapKWConstraint_mVc({divId: divKey
				, constListId:  constListId
				, isFirst: first
				, editorModel : this
				, attributeHandler: {nameattr: nameAh
					, nameorg: nameAh
					, "type" : "ADQLPos"
						, "ucd" : "adql.coor.columns"
							, "utype" : ""
								, "unit" : "deg"
									, "description" :  rakw + " " + deckw}
			, defValue: defValue
			, treePath: jQuery.extend({}, currentTreePath)});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;			
		}
	},
	updateQuery : {
		value: function() {
			var that = this;
			var retour= "    ";
			// queried table path
			var st = this.dataTreePath.schema + "." + this.dataTreePath.table;
			var joins = {};
			/*
			 * Merge all constraints
			 */
			for( var e in this.editors) {
				var ed = this.editors[e];
				var q =  ed.fireGetADQL();
				if( retour.length > 96 ) retour += "\n    ";
				if( q != null ) {
					retour += this.editors[e].fireGetADQL() + ' ';
					// Path of the table targeted by he current constraint
					var tt = ed.treePath.schema + "." + ed.treePath.table;
					// if constraint not applied to the queried table: join
					if( tt != st ) {
						for(var i=0 ;  i<this.joinKeys.length ; i++ ) {
							var lt = this.joinKeys[i].target_datatreepath.schema + "." + this.joinKeys[i].target_datatreepath.table;
							if( lt == tt) {
								joins[tt] = this.joinKeys[i];
							}
						}
						// if the targetted table is an uploaded file: crosmatch 	
					} else if( ed.fieldName.startsWith("POSLIST") ) {
						joins[tt] = {target_table: "TAP_UPLOAD." + ed.fieldName.replace('POSLIST:',''), target_column: "", source_column: ""};
					}
				}
			}
			if( this.orderBy != "" ) {
				var fs = this.orderBy.split('.');
				var tt = fs[0] + "." + fs[1] ;
				if( tt != st ) {
					for(var i=0 ;  i<this.joinKeys.length ; i++ ) {
						var lt = this.joinKeys[i].target_datatreepath.schema + "." + this.joinKeys[i].target_datatreepath.table;
						if( lt == tt) {
							joins[tt] = this.joinKeys[i];
						}
					} 
				}
			}
			this.listener.controlUpdateQuery(retour, joins);
		}
	}
});

function tapPosQEditor_Mvc(){
	tapColSelector_Mvc.call(this);
};
/**
 * 
 */
tapPosQEditor_Mvc.prototype = Object.create(tapColSelector_Mvc.prototype, {
	processAttributeHandlerEvent : {
		value: function(ah, constListId){
			var that = this;
			var first = true;
			var currentTreePath = null;
			for( k in this.editors ) {
				first = false;
				break;
			}
			currentTreePath  = this.listener.controlCurrentTreePath();

			var divKey = this.constEditorRootId + ah.nameattr + this.const_key;
			Out.debug("mv constraint " + ah.nameattr + " to #" + this.constListId);
			var v = new TapKWConstraint_mVc({divId: divKey
				, constListId: constListId
				, isFirst: first
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''
					, treePath: jQuery.extend({}, currentTreePath)});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		}
	},
	processInputCoord: {
		value: function(ra, dec, radius, frame, rakw, deckw, constListId) {
			var that = this;
			var first = true;
			var currentTreePath = null;
			for( k in this.editors ) {
				first = false;
				break;
			}
			currentTreePath  = this.listener.controlCurrentTreePath();
			var defValue = '';
			var nameAh = '';
			if( ra.startsWith('poslist:')) {
				defValue = 'list params,'+ radius;
				nameAh = 'POSLIST:' + ra.replace('poslist:','');;
			} else {
				defValue = ra + ',' + dec + ','+ radius;
				nameAh = 'POSITION';				
			}
			var divKey = this.constEditorRootId + "ADQLPos" + this.const_key;
			var v = new TapKWConstraint_mVc({divId: divKey
				, constListId:  constListId
				, isFirst: first
				, editorModel : this
				, attributeHandler: {nameattr: nameAh
					, nameorg: nameAh
					, "type" : "ADQLPos"
						, "ucd" : "adql.coor.columns"
							, "utype" : ""
								, "unit" : "deg"
									, "description" :  rakw + " " + deckw}
			, defValue: defValue
			, treePath: jQuery.extend({}, currentTreePath)});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;			
		}
	},
	updateQuery : {
		value: function() {
			var that = this;
			var retour= "    ";
			// queried table path
			var st = this.dataTreePath.schema + "." + this.dataTreePath.table;
			var joins = new Array();
			/*
			 * Merge all constraints
			 */
			for( var e in this.editors) {
				var ed = this.editors[e];
				var q =  ed.fireGetADQL();
				if( retour.length > 96 ) retour += "\n    ";
				if( q != null ) {
					retour += this.editors[e].fireGetADQL() + ' ';
					// Path of the table targeted by he current constraint
					var tt = ed.treePath.schema + "." + ed.treePath.table;
					// if constraint not applied to the queried table: join
					if( tt != st ) {
						for(var i=0 ;  i<this.joinKeys.length ; i++ ) {
							var lt = this.joinKeys[i].target_datatreepath.schema + "." + this.joinKeys[i].target_datatreepath.table;
							if( lt == tt) {
								joins[tt] = this.joinKeys[i];
							}
						}
						// if the targetted table is an uploaded file: crosmatch 	
					} else if( ed.fieldName.startsWith("POSLIST") ) {
						joins[tt] = {target_table: "TAP_UPLOAD." + ed.fieldName.replace('POSLIST:',''), target_column: "", source_column: ""};
					}
				}
			}
			if( this.orderBy != "" ) {
				var fs = this.orderBy.split('.');
				var tt = fs[0] + "." + fs[1] ;
				if( tt != st ) {
					for(var i=0 ;  i<this.joinKeys.length ; i++ ) {
						var lt = this.joinKeys[i].target_datatreepath.schema + "." + this.joinKeys[i].target_datatreepath.table;
						if( lt == tt) {
							joins[tt] = this.joinKeys[i];
						}
					} 
				}
			}
			this.listener.controlUpdateQuery(retour, joins);
		}
	}
});
