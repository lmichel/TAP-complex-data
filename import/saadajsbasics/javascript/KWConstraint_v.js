function KWSimpleConstraint_mVc(params){
	/*
	 * Params decoding
	 */
	this.rootId = params.divId;
	this.constListId = params.constListId;		
	this.treePath = params.treePath; // facultatif
	this.fieldName = "";
	this.defValue = params.defValue;
	this.name = params.name;
	if(this.name == undefined && params.attributeHandler != undefined )
		this.name = params.attributeHandler.nameattr;
	/*
	 * who is listening to us?
	 */
	this.listener = null;
	/*
	 * Connect to the controler and to the model
	 */
	new KWConstraint_mvC(new KWSimpleConstraint_Mvc(params), this);	
}

KWSimpleConstraint_mVc.prototype = {
		addListener : function(list){
			this.listener = list;
		},
		
		fireInit : function() {
			this.initForm();
		},

		initForm : function(ah, operators ,andors,range,default_value){
			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='overflow: hidden;'>");
			var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
			var rootDiv = $(baseSelector);		

			rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
			rootDiv.append('<span style="cursor: pointer;" id="' + this.rootId + '_name" style="float: left;">' + this.name + '</span>&nbsp;');

			$("#" + this.rootId + " span").click(function(){
				Modalinfo.info(that.defValue, "Pattern statement");
			})
			if(this.rootId.endsWith("_rafield") || this.rootId.endsWith("_decfield")) {
				$(".kwConstraint#"+this.rootId).css("display","inline");
			}

			$('#' + this.constListId).append("</div>");	

			var closeInput = $('#' + this.constListId + ' a[id="' + this.rootId + '_close"]');

			closeInput.click(function() {
				rootDiv.remove();
				that.fireRemoveFirstAndOr(this.rootId);
				that.fireEnterEvent();
			});
			this.fireEnterEvent(null, null, null);
		},
		fireGetADQL : function(attQuoted){
			return this.listener.controlGetADQL(attQuoted);
		},	
		fireEnterEvent : function(andor, operator, operand, unit){
			var valInput   = $('#' + this.constListId + ' input[id="' + this.rootId + '_val"]');
			this.listener.controlEnterEvent(andor, operator, operand, unit);
			valInput.parents(".constdiv:first").find("span").each(function(){
				$(this).css("font-weight", "normal");
			});		
			valInput.prevAll("span[id$='_name']").css("font-weight", "bold" );
			if ($('#' + this.constListId).closest("fieldset").next("div").find("span:last").css("color") === 'rgb(0, 128, 0)') {
				$('#' + this.constListId).closest("fieldset").next("div").find("span:last").prepend(valInput.prevAll("span[id$='_name']").text()+" ");
			}
		},
		fireRemoveAndOr :  function() {
			$('#' + this.rootId + "_andor" ).remove();
			this.listener.controlRemoveAndOr(this.rootId);
		},
		fireRemoveFirstAndOr : function(){
			this.listener.controlRemoveFirstAndOr(this.rootId);
		},
		getAttributeHandler : function(){
			return this.listener.controlGetAttributeHandler();
		},
		getAhName: function(ah){
			var name = "";
			if( this.treePath != undefined && !ah.nameattr.startsWith("POSLIST") ){
				name =  this.treePath.schema + "." + this.treePath.table + "." + ah.nameorg ;
			} else {
				name =  ah.nameattr ;
			}
			this.fieldName = name;
			return this.fieldName;
		}
};

/**
 * Simple constraint for TAP: just quote filed names to be compliant with ADQL
 * @param params
 * @returns {TapKWSimpleConstraint_mVc}
 */
function TapKWSimpleConstraint_mVc(params){
	KWSimpleConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new TapKWSimpleConstraint_Mvc(params), this);	
}
TapKWSimpleConstraint_mVc.prototype = Object.create(KWSimpleConstraint_mVc.prototype, {});

/**
 * KWConstraint_mVc: View of the KW constraint editor 
 * Parameters are received as a Javascript object with the following field:
 * - divId      : ID of the div containing this constraint. 
 *                Given from outside to avoid conflict with JQuery selectors
 * - constListId: ID of the div containing the list of constraints
 * The following parameters are used by the model:
 *  - isFirst : NO AND/OR prepended if true
 * - attributeHandler: Attribute Handler attached to this MVC
 * - editorModel: ConstQEditor_Mvc instance owning this object
 * - defValue: Default operand to be applied to the constraint

 * @returns {KWConstraint_mVc}
 */
function KWConstraint_mVc(params){
	KWSimpleConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new KWConstraint_Mvc(params), this);	
}

KWConstraint_mVc.prototype = Object.create(KWSimpleConstraint_mVc.prototype, {

	fireInit : {
		value: function() {
		this.listener.controlInit();
		}
	},

	initForm : {
		value: function(ah, operators ,andors,range,default_value){

			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='float: none;'>");
			var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
			var rootDiv = $(baseSelector);
			rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
			/*
			 * AND/OR operators
			 */
			if( andors.length > 0 ) {
				var select='<select id="' + this.rootId + '_andor" style="font-size: small;font-family: courier;\">';
				for( var i=0 ; i<andors.length; i++ ) {
					var op = andors[i];
					select += '<option value=' + op + '>' +op + '</option>';
				}	
				select += '</select>&nbsp;';
				rootDiv.append(select);
			}
			rootDiv.append('<span id="' + this.rootId + '_name">' + this.getAhName(ah) + '</span>&nbsp;');
			/*
			 * Logical operators
			 */
			if( operators.length > 0 ) {
				var select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
				for( i=0 ; i<operators.length; i++ ) {
					var op = operators[i];
					var selected = '';
					if( op == '>' ) {
						op = '&gt;';
						if( ah.nameattr == 'Cardinality' ) {
							selected = 'selected';
						} 
					} else if( op == '<' ) {
						op = '&lt;';
					}
					select += '<option value="' + op + '" ' + selected + '>' +op + '</option>';
				}	
				if( range != undefined && range.type == "list" ){
					for( var v=0 ; v<range.values.length ; v++ ) {
						var txt = (ah.type == "String")? "'" + range.values[v].value + "'": range.values[v].value;
						select += '<option value="= ' + txt + '">= ' + txt + '</option>';
					}
				}
				select += '</select>';
				rootDiv.append(select);

				rootDiv.append('<input type=text id="' + this.rootId 
						+ '_val" class="inputvalue form-control input-sm" style="display: inline-block; height: 21px; width:100px; font-size: small;font-family: courier;" value="' 
						+ default_value + '">');
				if( range != undefined && range.values.length>0 ){
					this.loadRange( '#' + this.constListId + ' input[id="' + this.rootId + '_val"]',range);
				}
			}
			$('#' + this.constListId).append("</div>");	

			var opSelected = '#' + this.constListId      + ' select[id="' + this.rootId + '_op"] option:selected';
			var opInput    = $('#' + this.constListId    + ' select[id="' + this.rootId + '_op"]');
			var andorInput = $('#' + this.constListId    + ' select[id="' + this.rootId + '_andor"]');
			var andorInputOpt = $('#' + this.constListId + ' select[id="' + this.rootId + '_andor"] option:selected');
			var valInput   = $('#' + this.constListId    + ' input[id="' + this.rootId + '_val"]');
			var closeInput = $('#' + this.constListId    + ' a[id="' + this.rootId + '_close"]');
			closeInput.click(function() {
				rootDiv.remove();
				if($("#" + this.id)){}
				that.fireRemoveFirstAndOr(this.rootId);
				if( ah.nameattr.startsWith('Qualifier ') ||  ah.nameorg.startsWith('Qualifier ') || ah.nameattr.startsWith('Cardinality')) {
					that.fireRemoveConstRef(ah.nameattr); 
				}
				if( ah.nameattr.startsWith('POSLIST:') ){
					$("#" + $("#" + "tapwhereposition_constposcont input:text")[0].id).val("");
					$("span#uploadresult").text("");
				}
				that.fireEnterEvent();
				that.fireTypoMsg(false, '');
			});
			opInput.change(function() {
				var v = this.value;
				var regex = /=\s+(.+)/;
				var results = regex.exec(v);
				if( results ) {	
					$('#' + that.constListId + ' select[id="' + that.rootId + '_op"] option[value="="]').prop('selected', true);
					valInput.val(results[1]);
				}
				var ao =  (andorInputOpt.length > 0)? andorInputOpt.text(): "";
				that.fireEnterEvent(ao
						, this.value
						, valInput.val());				
			});
			andorInput.change(function() {
				that.fireEnterEvent(this.value
						, $(opSelected).text()
						, valInput.val());				
			});
			valInput.keyup(function(event) {
				/*
				 * Run the query is CR is typed in a KW editor
				 */
				if (event.which == '13') {
					if( that.isConstraintOK() ) {
						that.fireRunQuery();
					} else {
						Modalinfo.error("Current contraint is not valid: cannot run the query");
					}
				} else {
					that.fireEnterEvent(that.getAndOr()
							, $(opSelected).text()
							, this.value);
				}
			});
			valInput.click(function(event) {
				that.fireEnterEvent(that.getAndOr()
						, $(opSelected).text()
						, this.value);

			});
			valInput.on('input', function(event) {
				that.fireEnterEvent(that.getAndOr()
						, $(opSelected).text()
						, this.value);			
			});
			this.fireEnterEvent(this.getAndOr()
					, $(opSelected).text()
					,valInput.val());
		}
	},
	fireGetADQL : function(attQuoted){
		return this.listener.controlGetADQL(attQuoted);
	},	
	/**
	 * Returns the andor flag if the selector does exist
	 */
	getAndOr:{
		value: function() {
			var ao
			if( (ao = $('#' + this.constListId + ' select[id="' + this.rootId + '_andor"] option:selected')).length > 0 ) {
				return ao.text();
			} else {
				return "";
			}
		}
	},
	isConstraintOK: {
		value: function(){		
			return ($('#' + this.constListId).parent().find("span.typomsg_ok:first").length != 0);
		}
	},
	loadRange : {
		value:  function(id,range) {
			var that = this;
			$(id).autocomplete({
				source: range.values,
				minLength: 0,
				select: function(event, ui) { 				
					var regex = /(?:(?:min)|(?:max))\s+(.+)/;
					var results = regex.exec(ui.item.value);
					if( results ) {
						ui.item.value = results[1];
					} 
					that.fireEnterEvent($('#' + that.constListId + ' select[id="' +  that.rootId + '_andor"] option:selected').text()
							, $('#' + that.constListId + ' select[id="' +  that.rootId + '_op"] option:selected').text()
							, ui.item.value);
				}
			});
		}
	},
	drawFault :  {
		value: function(fault){
			var d = $('#' + this.constListId + ' div[id="' + this.rootId + '"]');
			if( fault ) {
				d.addClass("background-error");
			} else {
				d.removeClass("background-error");
			}
		}
	},
	fireRemoveConstRef :  {
		value: function(ahname){
			this.listener.controlRemoveConstRef(ahname);
		}	
	},
	fireGetADQL :  {
		value: function(attQuoted){
			return this.listener.controlGetADQL(attQuoted);
		}
	},
	fireTypoMsg :  {
		value: function(fault, msg){
			this.listener.controlTypoMsg(fault, msg);
		}
	},
	fireRunQuery:  {
		value:  function() {
			this.listener.controlRunQuery();
		}
	}
});

/**
 * Subclass of KWConstraint_mVc modeling a UCD based constraint
 * @param params
 */
function UCDConstraint_mVc(params){
	KWConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new UCDConstraint_Mvc(params), this);	
};


UCDConstraint_mVc.prototype = Object.create(KWConstraint_mVc.prototype, {
	initForm : { 
		value: function(ah, operators ,andors,range,default_value){
			if( ah == null ) {
				Modalinfo.error("Attempt to init a UCDConstraitn with a attribute handler null");
				return;
			}
			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id='" + this.rootId + "' style='float: none;'>");
			var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
			var valSelector   = '#' + this.constListId + ' input[id="' + this.rootId + '_val"]';
			var rootDiv = $(baseSelector);
			rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
			rootDiv.append('<span id=' + this.rootId + '_name>' + ah.ucd + '</span><br>');
			/*
			 * Logical operators
			 */
			var select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
			for( var i=0 ; i<operators.length; i++ ) {
				var op = operators[i];
				var selected = '';
				if( op == '>' ) {
					op = '&gt;';
				} else if( op == '<' ) {
					op = '&lt;';
				}
				select += '<option value="' + op + '" ' + selected + '>' +op + '</option>';
			}	
			if( range != undefined && range.type == "list" ){
				for( var v=0 ; v<range.values.length ; v++ ) {
					var txt = (ah.type == "String")? "'" + range.values[v].value + "'": range.values[v].value;
					select += '<option value="= ' + txt + '">= ' + txt + '</option>';
				}
			}
			select += '</select>';
			rootDiv.append(select);

			rootDiv.append('<input type=text id="' + this.rootId 
					+ '_val" class="inputvalue form-control input-sm" style="width:140px; display: inline-block; height: 21px; font-size: small;font-family: courier;" value="' 
					+ default_value + '">');
			if( range != undefined && range.values.length>0 ){
				this.loadRange(valSelector,range);
			}

			rootDiv.append('<input title="units" style="width:100px; margin:2px; display: inline-block; height: 21px;" type=text id="' + this.rootId  
					+ '_unit" class="inputvalue form-control input-sm"  style="font-size: small; font-family: courier;" value="' 
					+ supportedUnits[0].text + '">');
			var opSelected = '#' + this.constListId + ' select[id="' + this.rootId + '_op"] option:selected';
			var opInput    = $('#' + this.constListId + ' select[id="' + this.rootId + '_op"]');
			var unitInput  = $('#' + this.constListId + ' input[id="' + this.rootId + '_unit"]');
			var closeInput = $('#' + this.constListId + ' a[id="' + this.rootId + '_close"]');
			var valInput   = $(valSelector);

			var tab = new Array();
			for(var i=0; i<supportedUnits.length; i++){
				tab[tab.length]=supportedUnits[i].text;
			};

			unitInput.autocomplete({
				source: tab,
				minLength: 0,
				focus :function(event, ui) {
					that.fireEnterEvent('AND'
							, $(opSelected).text()
							, valInput.val()
							, ui.item.value);
				}

			});

			$('#' + this.constListId).append("</div>");	

			closeInput.click(function() {
				$(baseSelector).remove();
				that.fireRemoveFirstAndOr(this.rootId);
				that.fireEnterEvent();
				that.fireTypoMsg(false, '');
			});

			opInput.change(function() {
				var v = this.value;
				var regex = /=\s+(.+)/;
				var results = regex.exec(v);
				if( results ) {	
					$('#' + that.constListId + ' select[id="' + that.rootId + '_op"] option[value="="]').prop('selected', true);
					valInput.val(results[1]);
				}
				that.fireEnterEvent('AND'
						, this.value
						, valInput.val()
						, unitInput.val());				
			});
			valInput.keyup(function(event) {
				/*
				 * Run the query is CR is typed in a KW editor
				 */
				if (event.which == '13') {
					if( that.isConstraintOK() ) {
						that.fireRunQuery();
					} else {
						Modalinfo.error("Current contraint is not valid: can not run the query");
					}
				} else {
					that.fireEnterEvent('AND'
							, $(opSelected).text()
							, this.value
							, unitInput.val());
				}
			});
			valInput.click(function(event) {
				that.fireEnterEvent('AND'
						, $(opSelected).text()
						, this.value
						, unitInput.val()
				);
			});
			valInput.on('input', function(event) {
				that.fireEnterEvent('AND'
						, $(opSelected).text()
						, this.value
						, unitInput.val()
				);
			});
			unitInput.keyup(function(event) {
				that.fireEnterEvent('AND'
						, $(opSelected).text()
						, valInput.val()
						, this.value);
			});
			this.fireEnterEvent('AND'
					, $(opSelected).text()
					,valInput.val()
					,unitInput.val());
		}
	}
});

/**
 * Subclass of KWConstraint_mVc modeling a UCD based constraint
 * @param params
 */
function PosConstraint_mVc(params){
	KWConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new PosConstraint_Mvc(params), this);	
};

PosConstraint_mVc.prototype = Object.create(KWConstraint_mVc.prototype, {
	initForm : { 
		value: function(ah, operators ,andors,range,default_value){
			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='float: none;'>");
			var rootDiv = $('#' + this.constListId + ' #' + this.rootId);
			var str = this.fireGetADQL();
			str = (str.length > 48)? (str.substring(0, 47) + "..."): str;
			rootDiv.append('&nbsp;<a id=' + this.rootId + '_close href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>');
			rootDiv.append('<span id=' + this.rootId + '_name>' +  str + '</span>');

			$('#' + this.constListId).append("</div>");	

			$('#' + this.constListId + ' #' +  this.rootId + "_close").click(function() {
				that.drop();
			});
			this.fireEnterEvent($('#' + this.constListId + ' #' +  this.rootId + "_andor option:selected").text()
					,$('#' + this.constListId + ' #' +  this.rootId + "_op option:selected").text()
					,$('#' + this.constListId + ' #' +  this.rootId + "_val").val());
		}
	},
	/**
	 * Used to emulate the click on trail from outside
	 */
	drop : {
		value: function(){
			$('#' + this.constListId + ' #' +  this.rootId).remove();
			this.fireRemoveFirstAndOr(this.rootId);
			this.fireEnterEvent();
			this.fireTypoMsg(0, "");	
		}
	}
});

/**
 * Subclass of KWConstraint_mVc modeling a catalogue class based constraint
 * @param params
 */
function CatalogueConstraint_mVc(params){
	KWConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new  CatalogueConstraint_Mvc(params), this);	
};

CatalogueConstraint_mVc.prototype = Object.create(KWConstraint_mVc.prototype, {
	initForm : { 
		value: function(ah, operators ,andors,range,default_value){
			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='float: none;'>");
			var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
			var rootDiv = $(baseSelector);
			rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
			rootDiv.append('<span id="' + this.rootId + '_name">' + ah.ACDS_CATACRO + '</span>&nbsp;<span>at</span>&nbsp;');
			/*
			 * Logical operators
			 */
			if( operators.length > 0 ) {
				var select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
				for( var i=0 ; i<operators.length; i++ ) {
					var op = operators[i];
					var selected = '';
					if( op == '>' ) {
						op = '&gt;';
					} else if( op == '<' ) {
						op = '&lt;';
						selected = 'selected';
					}
					select += '<option value="' + op + '" ' + selected + '>' +op + '</option>';
				}	
				select += '</select>';
				rootDiv.append(select);

				rootDiv.append('<input type=text id="' + this.rootId 
						+ '_val" class="inputvalue form-control input-sm" style="width:100px; font-size: small;font-family: courier; display: inline-block; height: 21px;" value="' 
						+ default_value + '"> <span>arcsec</span>');
			}
			$('#' + this.constListId).append("</div>");	

			var opselected = '#' + this.constListId + ' select[id="' + this.rootId + '_op"] option:selected';
			var opInput    = $('#' + this.constListId + ' select[id="' + this.rootId + '_op"]');
			var valInput   = $('#' + this.constListId + ' input[id="' + this.rootId + '_val"]');
			var closeInput = $('#' + this.constListId + ' a[id="' + this.rootId + '_close"]');

			closeInput.click(function() {
				rootDiv.remove();
				that.fireRemoveFirstAndOr(this.rootId);
				that.fireEnterEvent();
				that.fireTypoMsg(false, '');
			});
			opInput.change(function() {
				that.fireEnterEvent('AND'
						, this.value
						, valInput.val());				
			});
			valInput.keyup(function(event) {
				that.fireEnterEvent('AND'
						, $(opselected).text()
						, this.value);
			});
			valInput.click(function(event) {
				that.fireEnterEvent('AND'
						, $(opselected).text()
						, this.value);
			});
			valInput.on('input', function(event) {
				that.fireEnterEvent('AND'
						, $(opselected).text()
						, this.value);
			});
			this.fireEnterEvent('AND'
					, $(opselected).text()
					,valInput.val());
		}
	}
});

/**
 * Subclass of KWConstraint_mVc modeling a constraint based on catalogue class 
 * with a proba of id 
 * @param params
 */
function CrossidConstraint_mVc(params){
	CatalogueConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new  CrossidConstraint_Mvc(params), this);	
};

CrossidConstraint_mVc.prototype = Object.create(CatalogueConstraint_mVc.prototype, {
	initForm : { 
		value: function(ah, operators ,andors,range,default_value){
			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='float: none;'>");
			var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
			var rootDiv = $(baseSelector);
			rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
			rootDiv.append('<span id="' + this.rootId + '_name">' + ah.ACDS_CATACRO + '</span>&nbsp;<span>identfied with a proba</span>&nbsp;');
			/*
			 * Logical operators
			 */
			if( operators.length > 0 ) {
				var select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
				for( var i=0 ; i<operators.length; i++ ) {
					var op = operators[i];
					var selected = '';
					if( op == '>' ) {
						op = '&gt;';
						selected = 'selected';
					} else if( op == '<' ) {
						op = '&lt;';
					}
					select += '<option value="' + op + '" ' + selected + '>' +op + '</option>';
				}	
				select += '</select>';
				rootDiv.append(select);

				rootDiv.append('<input type=text id="' + this.rootId 
						+ '_val" class="inputvalue form-control input-sm" style="display: inline-block; height: 21px; width: 80px; font-size: small;font-family: courier;" value="' 
						+ default_value + '"> <span>%</span>');
			}
			$('#' + this.constListId).append("</div>");	

			var opselected = '#' + this.constListId + ' select[id="' + this.rootId + '_op"] option:selected';
			var opInput    = $('#' + this.constListId + ' select[id="' + this.rootId + '_op"]');
			var valInput   = $('#' + this.constListId + ' input[id="' + this.rootId + '_val"]');
			var closeInput = $('#' + this.constListId + ' a[id="' + this.rootId + '_close"]');

			closeInput.click(function() {
				rootDiv.remove();
				that.fireRemoveFirstAndOr(this.rootId);
				that.fireEnterEvent();
				that.fireTypoMsg(false, '');
			});
			opInput.change(function() {
				that.fireEnterEvent('AND'
						, this.value
						, valInput.val());				
			});
			valInput.keyup(function(event) {
				that.fireEnterEvent('AND'
						, $(opselected).text()
						, this.value);
			});
			valInput.click(function(event) {
				that.fireEnterEvent('AND'
						, $(opselected).text()
						, this.value);
			});
			valInput.on('input', function(event) {
				that.fireEnterEvent('AND'
						, $(opselected).text()
						, this.value);
			});
			this.fireEnterEvent('AND'
					, $(opselected).text()
					,valInput.val());
		}
	}
});
/**
 * USed by TAP. Just store a trepath in order to used in query covering multiple tables
 * @param params
 * @returns {CatalogueConstraint_mVc}
 */
function TapKWConstraint_mVc(params){
	KWConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new  TapKWConstraint_Mvc(params), this);	
};
TapKWConstraint_mVc.prototype = Object.create(KWConstraint_mVc.prototype, {
});

