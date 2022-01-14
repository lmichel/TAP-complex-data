/**
 * KWConstraint_Mvc: Model of individual KW editor
 * Parameters are received as a Javascript object with the following field:
 * - this.isFirst : NO AND/OR prepended if true
 * - this.attributeHandler: Attribute Handler attached to this MVC
 * - this.editorModel: ConstQEditor_Mvc instance owning this object
 * - defValue: Default this.operand to be applied to the constraint
 */
function KWSimpleConstraint_Mvc(params){

	this.listener = null;
	this.operators = new Array();
	this.range = {type: "not set", values: []};
	this.andors = new Array();

	/*
	 * Parameters decoding
	 */
	this.attributeHandler = params.attributeHandler;
	this.editorModel  = params.editorModel;
	this.defaultValue = params.defValue;
	this.isFirst      = params.isFirst;

	this.operator= '' ;
	this.operand = '';
	this.andor = '';
	this.booleansupported = false;
};

KWSimpleConstraint_Mvc.prototype = {
		addListener: function(list){
			this.listener = list;
		},
		processEnterEvent: function() {
			if( this.editorModel != null ) this.editorModel.updateQuery();
		},
		processRemoveConstRef: function(ahname) {
			if( this.editorModel != null ) this.editorModel.processRemoveConstRef(ahname);
		},
		removeAndOr: function() {
			this.andor = "";
		},
		notifyInitDone: function(){
			this.listener.isInit(this.attributeHandler, this.operators ,this.andors, this.range, this.defaultValue);
		},
		notifyTypoMsg: function(fault, msg) {
			this.fault = fault;
			this.listener.notifyFault(fault);
			if( this.editorModel != null ) this.editorModel.notifyTypoMsg(fault,msg);
		},		
		notifyRunQuery: function() {
			if( this.editorModel != null ) this.editorModel.notifyRunQuery();
		},
		getADQL: function(attQuoted) {
			return this.listener.controlAhName(this.attributeHandler);
		},
		getAttributeHandler: function() {
			return this.attributeHandler;
		},
		processRemoveFirstAndOr : function(key) {			
			if( this.attributeHandle == undefined  ||  this.attributeHandler.type != 'orderby') {
				if( this.editorModel != null ) this.editorModel.processRemoveFirstAndOr(key);
			}
		},
		isString: function(){
			return (this.attributeHandler.type != null)? this.attributeHandler.type.match(/(string)|(text)|(varchar)|char/i): false;
		}

};
/**
 * Simple constraint for TAP: just quote filed names to be compliant with ADQL
 * @param params
 * @returns {TapKWSimpleConstraint_mVc}
 */
function TapKWSimpleConstraint_Mvc(params){
	KWSimpleConstraint_Mvc.call(this, params);
}
TapKWSimpleConstraint_Mvc.prototype  = Object.create(KWSimpleConstraint_Mvc.prototype, {
	getADQL: {
		value : function() {
			return this.listener.controlAhName(this.attributeHandler).quotedTableName().qualifiedName;
		}
	}
});


/**
 * 
 * @param params
 * @returns
 */
function KWConstraint_Mvc(params){
	KWSimpleConstraint_Mvc.call(this, params);
	/*
	 * fault in constraint 
	 */
	this.fault = 0;

	if( this.attributeHandler.nameattr != null 
			&& (this.attributeHandler.nameattr == 'Cardinality' || this.attributeHandler.nameattr.startsWith('Qualifier ') 
					|| this.attributeHandler.nameorg.startsWith('Qualifier '))) {
		this.operators = ["=", "!=", ">", "<", "][", "]=[", "[]", "[=]"];			
		this.andors = [];
	} else if( this.attributeHandler.type == 'Select' ) {
		this.operators = [];
		this.andors = [];
	} else if( this.attributeHandler.type == 'ADQLPos' ) {
		this.operators = ["inCircle", "inBox"];
		this.andors = ["AND", "OR"];

	} else if( this.attributeHandler.type == 'boolean' ) {
		this.operators = ['=', 'IS NOT NULL', 'IS NULL'];
		this.andors = ['AND', 'OR'];
	} else if( !this.isString() ) {
		this.operators = ["=", "!=", ">", "<", "between", 'IS NOT NULL', 'IS NULL'];
		this.andors = ['AND', 'OR'];
	} else {
		this.operators = ["=", "!=", "LIKE", "NOT LIKE", 'IS NOT NULL' , 'IS NULL'];
		this.andors = ['AND', 'OR'];
	}

	if( this.isFirst == true ) {
		this.andors = [];
	}
	if( this.attributeHandler.type == 'orderby' ) {
		this.operators = [];
		this.andors = [];
	}

	if( this.attributeHandler.range != null ) {
		/*
		 * List of values
		 */
		this.range.type = "list";
		if (this.attributeHandler.range.values!=undefined){
			if(this.attributeHandler.range.values.length>0){
				for(var i=0; i<this.attributeHandler.range.values.length; i++){
					var choix = { value: this.attributeHandler.range.values[i] };
					this.range.values[this.range.values.length] = choix;
				}
			} else {
				var choix = { value: this.attributeHandler.range.values };
				this.range.values[this.range.values.length] = choix;
			}
			/*
			 * range of values
			 */
		} else {
			this.range.type = "range";
			if(this.attributeHandler.range.min!=undefined){
				var choix = { value: "min " + this.attributeHandler.range.min};
				this.range.values[this.range.values.length] =  choix;
			} 
			if (this.attributeHandler.range.max!=undefined){
				var choix = { value:  "max " +   this.attributeHandler.range.max};
				this.range.values[this.range.values.length] =choix;
			}
		}
	}

};

KWConstraint_Mvc.prototype  = Object.create(KWSimpleConstraint_Mvc.prototype, {
	processEnterEvent: {
		value : function(ao, op, opd, unit) {
			this.andor = ao;
			if( this.attributeHandler.type == 'orderby') {
				this.editorModel.updateQuery();
				return;
			} else if( this.isString() ) {
				if( !this.checkAndFormatString(op, opd) ) {
					this.editorModel.updateQuery();
					return;
				}
			} else if( this.attributeHandler.type == 'boolean') {
				if( !this.checkAndFormatString(op, opd) ) {
					this.editorModel.updateQuery();
					return;
				}
			} else {
				if( !this.checkAndFormatNum(op, opd) ) {
					this.editorModel.updateQuery();
					return;
				}			
			}
			this.notifyTypoMsg(0, this.operator + ' ' + this.operand);				
			if( this.andors.length == 0 ) {
				this.processRemoveFirstAndOr();
			}
			this.editorModel.updateQuery();
		}
	},
	checkAndFormatNum: {
		value : function(op, opd) {
			/*
			 * Case of select items in ADQL
			 */
			if( op == null || op.length == 0 ) {
				this.operator = "";
				this.operand = "";
				return 1 ;			
			}
			if( op == 'IS NULL' ) {
				this.operator = 'IS NULL';
				this.operand = '';
				return 1;								
			} else if( /^\s*$/.test(opd)  ) {
				if( this.attributeHandler.nameattr == 'Cardinality' || this.attributeHandler.nameattr.startsWith('Qualifier ') 
						|| this.attributeHandler.nameorg.startsWith('Qualifier ')) {
					this.notifyTypoMsg(1, 'Numeric operand required');
					return 0 ;
				} else {
					this.operator = 'IS NOT NULL';
					this.operand = '';
					return 1;
				}
			} else if( op == 'between' ) {
				var words = opd.split(' ') ;
				if( words.length != 3 || !/and/i.test(words[1]) ||
						words[0].length == 0 || words[2].length == 0 ||
						isNaN(words[0]) || isNaN(words[2]) ) {
					this.notifyTypoMsg(1, 'Operator "' + op + '" requires an operand of form "num1 and num2"');
					return 0 ;
				}
				this.operator = op;
				this.operand = words[0] + ' AND ' + words[2];						
				return 1 ;
			} else if( op == 'inCircle' || op == 'inBox')  {
				var area = null;
				if( this.attributeHandler.nameattr.startsWith('POSLIST:')) {
					area = opd.split(',');
					var n = this.attributeHandler.nameattr.replace("POSLIST:", "TAP_UPLOAD.");
					area = [n + ".pos_ra_csa", n + ".pos_dec_csa", area[area.length-1]];

				} else {
					area = opd.split(',');
					if( area.length != 3 || isNaN(area[0]) || isNaN(area[1]) )  {
						this.notifyTypoMsg(1, 'Search area must be like :alpha,delta,size"');					
						return 0 ;
					}
				}
				if(  isNaN(area[2]) ) {
					this.notifyTypoMsg(1, 'Search area must be like :alpha,delta,size"');					
					return 0 ;
				}
				if( op == 'inCircle') {
					this.operator = "CIRCLE('ICRS', " + area[0]+ ", " +area[1] + ", " + area[2]/60+ ")";
					this.operand = "";
				} else {
					this.operator = "BOX('ICRS', " + area[0]+ ", " +area[1] + ", " + area[2]+  ", " + area[2]/60  +")";
					this.operand = "";					
				}
				return 1 ;
			} else if( isNaN(opd) && this.attributeHandler.type != 'boolean' ) {
				this.notifyTypoMsg(1, 'Operator "' + op + '" requires a single numeric operand');
				return 0 ;
			} else {
				this.operator = op;
				this.operand = opd;
				return 1 ;			
			}
		}
	},
	checkAndFormatString: {
		value : function(op, opd) {
			if( op == 'IS NULL' ) {
				this.operator = 'IS NULL';
				this.operand = '';
				return 1;								
			} else if( /^\s*$/.test(opd)  ) {
				this.operator = 'IS NOT NULL';
				this.operand = '';
				return 1;				
			} else {
				if ( /^\s*'.*'\s*$/.test(opd)  ) {
					this.operand = opd;
				} else {
					this.operand = "'" + opd + "'";
				}
				this.operator = op;
				return 1;			
			}
		}
	},
	processRemoveConstRef: {
		value : function(ahname) {
			this.editorModel.processRemoveConstRef(ahname);
		}
	},
	removeAndOr: {
		value : function() {
			this.andor = "";
		}
	},
	getADQL: {
		value : function(attQuoted) {
			if( this.fault ) {
				return null;
			}
			if(  this.attributeHandler.nameattr.startsWith('Qualifier ')) {
				return 'Qualifier{ ' + this.attributeHandler.nameattr.split(' ')[1] + this.operator + ' ' + this.operand + '}';
			} else if( this.operator.startsWith('CIRCLE') || this.operator.startsWith('BOX'))  {
				//				CONTAINS(POINT('ICRS GEOCENTER', "_s_ra", "_s_dec"), BOX('ICRS GEOCENTER', 'dsa', 'dsad', 'dsa', 'dsad')) = 'true';
				var coordkw = this.attributeHandler.description.split(' ');
				var bcomp = ( this.booleansupported )? "'true'" :  "1";
				return this.andor + " CONTAINS(POINT('ICRS', " + coordkw[0].quotedTableName().qualifiedName + ", " +  coordkw[1].quotedTableName().qualifiedName + "), "
				+ this.operator + ") = " + bcomp;
			} else if( attQuoted ){ 
				return this.andor + ' "' + 	this.listener.controlAhName(this.attributeHandler) + '" ' + this.operator + ' ' + this.operand;
			} else {
				return this.andor + ' ' + this.listener.controlAhName(this.attributeHandler) + ' ' + this.operator + ' ' + this.operand;
			}
		}
	}
	

});

/**
 * Separate behaviour specific to Saada from those specific to TAP (must be continued)
 * @param params
 * @returns {TapKWConstraint_Mvc}
 */
function TapKWConstraint_Mvc(params){
	KWConstraint_Mvc.call(this, params);
}
TapKWConstraint_Mvc.prototype  = Object.create(KWConstraint_Mvc.prototype, {
	getADQL: {
		value : function(attQuoted) {
			if( this.fault ) {
				return null;
			}
			if( this.operator.startsWith('CIRCLE') || this.operator.startsWith('BOX'))  {
				//				CONTAINS(POINT('ICRS GEOCENTER', "_s_ra", "_s_dec"), BOX('ICRS GEOCENTER', 'dsa', 'dsad', 'dsa', 'dsad')) = 'true';
				var coordkw = this.attributeHandler.description.split(' ');
				var bcomp = ( this.booleansupported )? "'true'" :  "1";
				return this.andor + " CONTAINS(POINT('ICRS', " + coordkw[0].quotedTableName().qualifiedName + ", " +  coordkw[1].quotedTableName().qualifiedName + "), "
				+ this.operator + ") = " + bcomp;
			} else if( attQuoted ){ 
				return this.andor + ' "' + 	this.listener.controlAhName(this.attributeHandler).quotedTableName().qualifiedName + '" ' + this.operator + ' ' + this.operand;
			} else {
				return this.andor + ' ' + this.listener.controlAhName(this.attributeHandler).quotedTableName().qualifiedName + ' ' + this.operator + ' ' + this.operand;
			}
		}
	}

});


/**
 * Subclass of KWConstraint_Mvc: manage UCDS based constraint
 * @param params
 */
function UCDConstraint_Mvc(params){
	KWConstraint_Mvc.call(this, params);
	this.operators = ["=", "!=", ">", "<", "][", "]=[", "[]", "[=]"];
	this.unit = "";

};


UCDConstraint_Mvc.prototype = Object.create(KWConstraint_Mvc.prototype, {
	getADQL: {
		value: function(attQuoted) {
			if( this.fault ) {
				return null;
			} else {
				return "[" + this.attributeHandler.ucd + '] ' + this.operator + ' ' + this.operand + ' ' + this.unit;
			}
		}
	},
	processEnterEvent:  {
		value: function(ao, op, opd, unit) {
			this.andor = "AND";
			this.unit = (unit == null || unit == "")?"": ("[" + unit + "]");
			if( opd == "" ) { 
				this.notifyTypoMsg(1, 'Operand is required with UCDs');
				this.editorModel.updateQuery();
				return;
			} else if( op == '][' || op == ']=[' || op == '[]' || op == '[=]') {
				this.operator = op;
				var myArray = opd.match(/^((?:[^\s]+)|(?:'.*'))\s+and\s+((?:[^\s]+)|(?:'.*'))$/);
				if ( myArray != null ) {
					var o1 = myArray[1];
					var o2 = myArray[2];
					o1 = (isNaN(o1) && !/^\s*'.*'\s*$/.test(o1))? "'" + o1 + "'": o1;
					o2 = (isNaN(o2) && !/^\s*'.*'\s*$/.test(o2))? "'" + o2 + "'": o2;
					this.operand = '(' + o1 + ' , ' + o2 + ')';												
				}  else {
					this.notifyTypoMsg(1, 'The operator ' + op + ' requires an operand like "num1 and num2"');
					this.editorModel.updateQuery();
					return;
				}
			} else {
				this.operator = op;
				var o1 = (isNaN(opd) && !/^\s*'.*'\s*$/.test(opd))? "'" + opd + "'": opd;
				this.operand =  o1;												
			}

			this.notifyTypoMsg(0, this.operator + ' ' + this.operand + ' [' + unit + ']');				
			if( this.andors.length == 0 ) {
				this.processRemoveFirstAndOr();
			}
			this.editorModel.updateQuery();
		}
	}
});
/**
 * Subclass of KWConstraint_Mvc: manage position based constraint
 * @param params
 */
function PosConstraint_Mvc(params){
	KWConstraint_Mvc.call(this, params);
	this.operators = [];
};


PosConstraint_Mvc.prototype = Object.create(KWConstraint_Mvc.prototype, {
	processEnterEvent:  {
		value: function(ao, op, opd) {
			this.andor = "AND";
			if( opd == "" ) {
				this.operator = 'IS NOT NULL';
			} else if( op == '][' || op == ']=[' || op == '[]' || op == '[=]') {
				this.operator = op;
				var myArray = opd.match(/^((?:[^\s]+)|(?:'.*'))\s+and\s+((?:[^\s]+)|(?:'.*'))$/);
				if ( myArray != null ) {
					var o1 = myArray[1];
					var o2 = myArray[2];
					o1 = (isNaN(o1) && !/^\s*'.*'\s*$/.test(o1))? "'" + o1 + "'": o1;
					o2 = (isNaN(o2) && !/^\s*'.*'\s*$/.test(o2))? "'" + o2 + "'": o2;
					this.operand = '(' + o1 + ' , ' + o2 + ')';												
				}  else {
					this.notifyTypoMsg(1, 'Operator ' + op + ' requires an operand like "num1 and num2"');
					this.editorModel.updateQuery();
					return;
				}
			} else {
				this.operator = op;
				var o1 = (isNaN(opd) && !/^\s*'.*'\s*$/.test(opd))? "'" + opd + "'": opd;
				this.operand =  o1;												
			}
			var str = this.getADQL();
			str = (str.length > 48)? (str.substring(0, 47) + "..."): str;
			this.notifyTypoMsg(0, str);				
			if( this.andors.length == 0 ) {
				this.processRemoveFirstAndOr();
			}
			this.editorModel.updateQuery();
		}
	},
	getADQL: {
		value: function() {
			if( this.fault ) {
				return null;
			} 
			if( this.attributeHandler.nameattr == "region") {
				return 'isInRegion("' + this.attributeHandler.value + '", 0' 
				+ ', ' + ((this.attributeHandler.frame == "FK5")? "J2000":
					(this.attributeHandler.frame == "FK4")? "J1950": '-')
					+ ', ' + this.attributeHandler.frame + ')';

			} else {
				return 'isInCircle("' + this.attributeHandler.nameorg + '", ' 
				+ this.attributeHandler.radius  
				+ ', ' + ((this.attributeHandler.frame == "FK5")? "J2000":
					(this.attributeHandler.frame == "FK4")? "J1950": '-')
					+ ', ' + this.attributeHandler.frame + ')';
			}
		}
	}

});

/**
 * Subclass of KWConstraint_Mvc: manages catalogue based constraint
 * @param params
 */
function CatalogueConstraint_Mvc(params){
	KWConstraint_Mvc.call(this, params);
	this.qualifier = params.qualifier;
	this.operators = [">", "<", "][", "[]"];
};


CatalogueConstraint_Mvc.prototype = Object.create(KWConstraint_Mvc.prototype, {
	getADQL: {
		value: function(attQuoted) {
			if( this.fault ) {
				return null;
			}
			var retour = "   AssObjClass{" + this.attributeHandler.CLASSNAME + "}";
			if( this.operand != "" ) {
				retour += ", Qualifier{" + this.qualifier +  ' ' + this.operator + ' ' + this.operand + "}";
			}
			return retour;
		}
	},
	processEnterEvent:  {
		value: function(ao, op, opd, unit) {
			/*
			 * No parameter: constraint to be removed
			 */
			if( ao == undefined && op == undefined && opd == undefined) {
				this.editorModel.updateQuery();				
			}
			this.andor = "AND";
			this.unit = (unit == null || unit == "")?"": ("[" + unit + "]");
			if( opd == "" ) { 
				this.notifyTypoMsg(0, 'at any distance');
			} else if( op == ']['  || op == '[]' ) {
				this.operator = op;
				var myArray = opd.match(/^\s*([^\s]+)\s+and\s+([^\s]+)\s*$/);
				if ( myArray != null ) {
					var o1 = myArray[1];
					var o2 = myArray[2];
					if(isNaN(o1) || isNaN(o1) ) {
						this.notifyTypoMsg(1, 'Distance requires a single operands');
						return;
					}
					this.operand = '(' + o1 + ' , ' + o2 + ')';												
					this.notifyTypoMsg(0, this.operator + ' ' + this.operand );				
				}  else {
					this.notifyTypoMsg(1, 'The operator ' + op + ' requires an operand like "num1 and num2"');
					return;
				}
			} else if( isNaN(opd) ) {
				this.notifyTypoMsg(1, 'Distance requires a single numeric operand');
				return ;
			} else {
				this.operator = op;
				this.operand =  opd;												
				this.notifyTypoMsg(0, this.operator + ' ' + this.operand );				
			}
			this.editorModel.updateQuery();
		}
	}
});

/**
 * Subclass of KWConstraint_Mvc: manages catalogue based constraint
 * @param params
 */
function CrossidConstraint_Mvc(params){
	CatalogueConstraint_Mvc.call(this, params);
};


CrossidConstraint_Mvc.prototype = Object.create(CatalogueConstraint_Mvc.prototype, {
	processEnterEvent:  {
		value: function(ao, op, opd, unit) {
			/*
			 * No parameter: constraint to be removed
			 */
			if( ao == undefined && op == undefined && opd == undefined) {
				this.editorModel.updateQuery();				
			}
			this.andor = "AND";
			this.unit = (unit == null || unit == "")?"": ("[" + unit + "]");
			if( opd == "" ) { 
				this.notifyTypoMsg(0, 'with any probality');
			} else if( op == ']['  || op == '[]' ) {
				this.operator = op;
				var myArray = opd.match(/^\s*([^\s]+)\s+and\s+([^\s]+)\s*$/);
				if ( myArray != null ) {
					var o1 = myArray[1];
					var o2 = myArray[2];
					if(isNaN(o1) || isNaN(o1) ) {
						this.notifyTypoMsg(1, 'Distance requires a single operands');
						return;
					} else if( o1 <0 || o1 > 1 || o2 < 0 || o2 > 1 ){
						this.notifyTypoMsg(1, 'Probability must be between 0 and 1');
						return ;
					}
					this.operand = '(' + o1 + ' , ' + o2 + ')';												
					this.notifyTypoMsg(0, this.operator + ' ' + this.operand );				
				}  else {
					this.notifyTypoMsg(1, 'The operator ' + op + ' requires an operand like "num1 and num2"');
					return;
				}
			} else if( isNaN(opd) ) {
				this.notifyTypoMsg(1, 'Probability requires a single numeric operand between 0 and 1');
				return ;
			} else if( opd <0 || opd > 1){
				this.notifyTypoMsg(1, 'Probability must be between 0 and 1');
				return ;
			} else {
				this.operator = op;
				this.operand =  opd;												
				this.notifyTypoMsg(0, this.operator + ' ' + this.operand );				
			}
			this.editorModel.updateQuery();
		}
	}
});


