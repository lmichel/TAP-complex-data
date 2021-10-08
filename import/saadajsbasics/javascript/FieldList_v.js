/**
 * 
 * @param parentDivId: ID of the div containing thge filed list. It must exist before.
 * @param formName    : Name of the form. Although internal use must be 
 *                      set from outside to avoi conflict by JQuery selectors  
 * @param  handlers       : Object with the handler to be implemented. Possible Fields are                 
 *         stackHandler   : Handler processing the click on the stack button attached to each field            
 *         orderByHandler : Handler processing the click on the Orderby button attached to each field   
 *         raHandler      : Handler processing the click on the RA button   
 *        decHandler      : Handler processing the click on the DEC button   
 */

function BasicFieldList_mVc(parentDivId, formName, handlers){
	/*
	 * Some reference and IDs on useful  DOM elements
	 */
	this.parentDiv = $("#" +parentDivId );
	this.fieldListId   = parentDivId + "_fieldlist";
	this.fieldTableId   = parentDivId + "_fieldtable";
	this.attributesHandlers = new Array();
	this.filterPattern=null;
	this.formName = formName;
	this.dataTreePath = null;	/// instance of DataTreePath		
	/*
	 * Keep handler references
	 */
	this.stackHandler   = handlers.stackHandler;
	this.orderByHandler = handlers.orderByHandler;
	this.raHandler      = handlers.raHandler;
	this.decHandler     = handlers.decHandler;

	this.stackTooltip = "Click to constrain this field";
}

BasicFieldList_mVc.prototype = {
		draw: function() {
			var that = this;
			this.attributesHandlers = new Array();
			this.parentDiv.html('<div class=fielddiv><div class="fieldlist" id="' + this.fieldListId
					+  '"></div>'
					//	+ ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top:8px;"></div>'
			);

			$("#"+this.fieldListId).closest(".fielddiv").css("padding","3px");

		},

		setStackTooltip: function(stackTooltip) {
			this.stackTooltip = stackTooltip;
		},
		setDataTreePath: function(dataTreePath){
			this.dataTreePath = dataTreePath;
			this.displayFields();
		},
		getAttributeTitle : function(ah) {
			return ah.nameorg 
			+ " - database name; " +  ah.nameattr
			+ " - description: " +  ah.description
			+ ((ah.ucd)?(" - UCD: " +  ah.ucd): "")
			+ ((ah.unit)?(" - Unit: " +  ah.unit): "")
			+ ((ah.type)?(" - Type: " +  ah.type): "")
			+ ((ah.range)?(" - Range: " +  JSON.stringify( ah.range).replace(/'/g,"&#39;")): "")
			;
		},
		/**
		 * Draw one field in the container
		 * Field described by the attribute handler ah
		 */
		displayField:  function(ah){
			var that = this;
			var id = this.formName + "_" + ah.nameattr;
			var title = this.getAttributeTitle(ah);
			var row ="<tr class=attlist id=" + ah.nameattr + ">" 
			+"<td class=attlist><span title='" + title + "'>"+ ah.nameorg+"</span></td>"
			+"<td class='attlist help'>" + ah.type +"</td>"
			+"<td class='attlist help'>" + ((ah.unit != undefined)? ah.unit:"") +"</td>"
			;

			if( this.orderByHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=order_" + id + " title=\"Click to order the query result by this field\" class=\"orderbybutton\" type=\"button\" ></input>"
					+"</td>";
			}
			if( this.stackHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=stack_" + id + " title=\"" + this.stackTooltip  + "\"  class=\"stackconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			if( this.raHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=tora_" + id + " title=\"Click to use this field as RA coordinate\"  class=\"raconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			if( this.decHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=todec_" + id + " title=\"Click to use this field as DEC coordinate\"  class=\"decconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			row += "</tr>";
			$('#' + this.fieldTableId).append(row);
			var id = this.formName + "_" + ah.nameattr;
			if( this.orderByHandler != null ) {
				$('#' + this.fieldListId + ' input[id="order_' + id + '"]' ).click(function() {that.orderByHandler($(this).closest("tr").attr("id"));});
			}
			if( this.stackHandler != null ){
				$('#' + this.fieldListId + ' input[id="stack_' + id + '"]' ).click(function() {
					that.stackHandler($(this).closest("tr").attr("id"));});
			}
			if( this.raHandler != null ){
				$('#' + this.fieldListId + ' input[id="tora_' + id + '"]' ).click(function() {that.raHandler($(this).closest("tr").attr("id"));});
			}
			if( this.decHandler != null ){
				$('#' + this.fieldListId + ' input[id="todec_' + id + '"]' ).click(function() {that.decHandler($(this).closest("tr").attr("id"));});
			}
			$('#' + this.fieldTableId + " tr#" + ah.nameattr + " span").tooltip( {
			//$('#' + this.fieldTableId + ' tr[id="'+ ah.nameattr + '"]span').tooltip( {
				track: true,
				delay: 0,
				showURL: false,
				opacity: 1,
				fixPNG: true,
				showBody: " - ",
				// extraClass: "pretty fancy",
				top: -15,
				left: 5
			});
		},
		/**
		 * Draw all fields in the container
		 * Fields are described by the attribute handler array ahs
		 * Warning ahs is  not a map but an array 
		 */
		displayFields : function(){
			var that = this;
			this.attributesHandlers = new Array();
			if( this.dataTreePath != null ) {
				MetadataSource.getTableAtt(
						this.dataTreePath
						, function() {
							var ahm = MetadataSource.ahMap(that.dataTreePath);
							that.displayAttributeHandlers(ahm);
						});
			}
		},
		/**
		 * Set the filed list with the AH array
		 * @param ahm
		 */
		displayAttributeHandlers: function(ahm) {
			var table  = "<table id=" + this.fieldTableId + " class='table' style='width: 100%; border-spacing: 0px; border-collapse:collapse'></table>";
			$('#' + this.fieldListId).html(table);
			for( var k=0 ; k<ahm.length ; k++) {
				var ah = ahm[k];
				this.attributesHandlers[ah.nameattr] = ah;				
				this.addPresetValues(ah);
				this.displayField(ah);
			}

		},
		addPresetValues : function(attributeHandler){
			if( attributeHandler.nameattr == 'dataproduct_type' ) {
				attributeHandler.range = {type: 'list', values: ["'image'", "'spectrum'", "'cube'",
				                                                 "'timeseries'", "'visibility'", "'eventlist'"]};
			} else 	if( attributeHandler.nameattr == 'calib_level' ) {
				attributeHandler.range = {type: 'list', values: [0, 1, 2, 3]};

			} else if( attributeHandler.nameattr == 'access_format' ) {
				attributeHandler.range = {type: 'list', values: ["'text/html'", "'text/xml'","'text/plain'"
				                                                 , "'application/fits'","'application/x-votable+xml'", "'application/pdf'"
				                                                 , "'image/png'", "'image/jpeg'", "'image/gif'", "'image/bmp'"]};
			}
		},
		getAttributeHandler: function(ahname){
			return this.attributesHandlers[ahname];
		}
}
/**
 * class prototype
 */
function FieldList_mVc(parentDivId, formName, handlers){
	BasicFieldList_mVc.call(this, parentDivId, formName, handlers);
	/*
	 * Some reference and IDs on useful  DOM elements
	 */
	this.fieldFilterId = parentDivId + "_fieldfilter";
}


/**
 * Methods prototypes
 */
FieldList_mVc.prototype = Object.create(BasicFieldList_mVc.prototype, {
	/**
	 * Draw the field container
	 */
	draw: {
		value: function(){

			var that = this;
			this.attributesHandlers = new Array();
			this.parentDiv.html('<div class=fielddiv><div class="fieldlist" id="' + this.fieldListId
					+  '"></div>'
					+ ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top:8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'
					+ ' <input id="' + this.fieldFilterId +  '" class="form-control input-sm" type="text" placeholder="Search"/></div></div>');
			/*
			 * WARNING
			 * For some reason, z-index is set at 3 which prevent keybroad event to reach the widget.
			 * The reason could be in domaine.css: form-control z-index:inital
			 * To prevent this before a better understanding we force z-index: 1001;
			 */
			$("#"+this.fieldListId).closest(".fielddiv").css("padding","3px");
			$('#' + this.fieldFilterId).keyup(function() {
				that.filterPattern = new RegExp($(this).val(), 'i');
				that.fireFilter();
			});
			
			$('#' + this.fieldFilterId).one("click",function() {
				$(this).css('color','black');
				$(this).css('font-style','');
				$(this).attr('value','');
			});
		}	
	},

	/**
	 * Filter the displayed fields with the pattern typed by the user
	 */
	fireFilter : {
		value: function(){
			$('#' + this.fieldTableId).html('');
			for( var i in this.attributesHandlers  ) {
				var ah = this.attributesHandlers[i];
				if( (this.filterPattern.test(ah.nameorg)  || 
						this.filterPattern.test(ah.nameattr) || 
						this.filterPattern.test(ah.ucd)      || 
						this.filterPattern.test(ah.comment)) ) {
					this.displayField(ah);
				}
			}
		}
	}
});

/**
 * Sub-class of FieldList_mVc, specialized to display UCDs instead of Fields
 * Same constructor as the superclass
 * Only the draw method is overloaded
 * @param parentDivId
 * @param formName
 * @param handlers
 * @returns {UcdFieldList_mVc}
 */
function UcdFieldList_mVc(parentDivId, formName, handlers){
	FieldList_mVc.call(this, parentDivId, formName, handlers);
};

/**
 * Method overloading
 */
UcdFieldList_mVc.prototype = Object.create(FieldList_mVc.prototype, {
	displayField: {
		value: function(ah){
			var that = this;
			var id = this.formName + "_" + ah.ucd;
			var stackId = "stack_" + id ;
			var title = ah.ucd 
			+ " - description: " +  ah.comment
			;
			var row ="<tr class=attlist id='" + ah.ucd + "'>" 
			+"<td class=attlist><span title='" + title + "'>"+ ah.ucd+"</span></td>"
			;
			if( this.stackHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=" + stackId + " title=\"Click to constrain fields with this UCD\"  class=\"stackconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			row += "</tr>";
			$('#' + this.fieldTableId).append(row);
			if( this.stackHandler != null ){
				$('#' + this.fieldTableId  + ' input[id="' + stackId + '"]').click(function() {
					that.stackHandler($(this).closest("tr").attr("id"));}
				);
			}
			$('#' + this.fieldTableId +  ' tr[id="' + ah.ucd + '"] span').tooltip( {
				track: true,
				delay: 0,
				showURL: false,
				opacity: 1,
				fixPNG: true,
				showBody: " - ",
				top: -15,
				left: 5
			});
		}
	},
	/**
	 * Draw all fields in the container
	 * Fields are described by the attribute handler array ahs
	 * Warning ahs is  not a map but an array 
	 */
	displayFields : {
		value : function(){
			var that = this;						
			this.attributesHandlers =new Array();
			MetadataSource.getTableAtt(
					this.dataTreePath
					, function() {
						var ahm = MetadataSource.ahMap(that.dataTreePath);
						var table  = "<table id=" + that.fieldTableId + " style='width: 100%; border-spacing: 0px; border-collapse:collapse' class='table'></table>";
						$('#' + that.fieldListId).html(table);
						for( var k=0 ; k<ahm.length ; k++) {
							var ah = ahm[k];
							that.attributesHandlers[ah.ucd] = ah;				
							that.displayField(ah);
						}
					});
		}
	} 
});

/**
 * Sub-class of FieldList_mVc, specialized to display UCDs instead of Fields
 * Same constructor as the superclass
 * Only the draw method is overloaded
 * @param parentDivId
 * @param formName
 * @param handlers
 * @returns {UcdFieldList_mVc}
 */
function CatalogueList_mVc(parentDivId, formName, handlers){
	FieldList_mVc.call(this, parentDivId, formName, handlers);
};

/**
 * Method overloading
 */
CatalogueList_mVc.prototype = Object.create(FieldList_mVc.prototype, {
	/**
	 * Draw the field container
	 */
	draw :  {
		value: function() {
			var that = this;
			this.attributesHandlers = new Array();
			this.parentDiv.html('<div class=fielddiv>'
					+ '<div class="fieldlist" id="' + this.fieldListId
					+  '"></div>'
					+ ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top:8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'
					+ ' <input id="' + this.fieldFilterId +  '" class="form-control input-sm" type="text" placeholder="Search"/></div></div>');

			$("#"+this.fieldListId).closest(".fielddiv").css("padding","3px");

			$('#' + this.fieldFilterId).keyup(function() {
				that.filterPattern = new RegExp($(this).val(), 'i');
				that.fireFilter();
			});
			$('#' + this.fieldFilterId).one("click",function() {
				$(this).css('color','black');
				$(this).css('font-style','');
				$(this).attr('value','');
			});
		}	
	},
	/**
	 * Draw one field in the container
	 * Field described by the catalogue description
	 */
	displayField: {
		value: function(ah){
			var that = this;
			var id = this.formName + "_" + ah.CLASSNAME;
			var title = ah.ACDS_CATNAME 
			+ " - ACDS_CATACRO " +  ah.ACDS_CATACRO
			+ " - ACDS_CATCDSTB: " +  ah.ACDS_CATCDSTB
			+ " - ACDS_CATCONF: " +  ah.ACDS_CATCONF
			+ " - ACDS_CATINTNB: " +  ah.ACDS_CATINTNB
			+ " - ACDS_CATNAME: " +  ah.ACDS_CATNAME
			+ " - ACDS_CDSCAT: " +  ah.ACDS_CDSCAT
			+ " - VIZIER_KW: " +  ah.VIZIER_KW
			+ " - CLASSNAME: " +  ah.CLASSNAME

			;
			var row ="<tr class=attlist id='" + ah.CLASSNAME + "'>" 
			+"<td class=attlist style='width: 25%; overflow: hidden'><span title='" + title + "'>"+ ah.ACDS_CATACRO+"</span></td>"
			//+"<td class='attlist help'>" + ah.ACDS_CATINTNB +"</td>"
			+"<td class='attlist help'>" + ah.ACDS_CATNAME +"</td>"
			;
			if( this.stackHandler != null ) {
				row += "<td class='attlist attlistcmd' style='width: 16px;'>"
					+"<input id=stack_" + id + " title=\"Click to constrain this field\"  class=\"stackconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			row += "</tr>"; 
			$('#' + this.fieldTableId).css('table-layout', 'auto');
			$('#' + this.fieldTableId).append(row);
			if( this.stackHandler != null ){
				$('#stack_' + id ).click(function() {that.stackHandler($(this).closest("tr").attr("id"));});
			}
			$('#' + this.fieldTableId +  ' tr[id="' + ah.CLASSNAME + '"] span').tooltip( {

				//$("tr#" + ah.CLASSNAME + " span").tooltip( {
				track: true,
				delay: 0,
				showURL: false,
				opacity: 1,
				fixPNG: true,
				showBody: " - ",
				// extraClass: "pretty fancy",
				top: -15,
				left: 5
			});
		}
	},
	/**
	 * Draw all fields in the container
	 * Fields are described by the attribute handler array ahs
	 * Warning ahs is  not a map but an array 
	 */
	displayFields : {
		value : function(ahs){
			this.attributesHandlers =new Array();
			for( var i=0 ; i<ahs.length ; i++){
				var ah = ahs[i];
				this.attributesHandlers[ah.CLASSNAME] = ah;
			}
			var table  = "<table id=" + this.fieldTableId + " style='width: 100%; border-spacing: 0px; border-collapse:collapse' class='table'></table>";
			$('#' + this.fieldListId).html(table);
			for( var i in this.attributesHandlers  ) {
				this.displayField(this.attributesHandlers[i]);
			}
		}
	},
	/**
	 * returns the AH named ahanme
	 */
	getAttributeHandlerByName: {
		value: function(ahname) {
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.nameaatr == ahname ) {
					return ah;;	
				}
			}
			return nul;
		}
	},
	/**
	 * Filter the displayed fields with the pattern typed by the user
	 */
	fireFilter :  {
		value: function(){
			$('#' + this.fieldTableId).html('');
			for( var i in this.attributesHandlers  ) {
				var ah = this.attributesHandlers[i];
				if( (this.filterPattern.test(ah.ACDS_CATACRO)  || 
						this.filterPattern.test(ah.ACDS_CATCDSTB) || 
						this.filterPattern.test(ah.ACDS_CATCONF)      || 
						this.filterPattern.test(ah.ACDS_CATINTNB) ||
						this.filterPattern.test(ah.ACDS_CATNAME) ||
						this.filterPattern.test(ah.ACDS_CDSCAT) ||
						this.filterPattern.test(ah.VIZIER_KW) ||
						this.filterPattern.test(ah.CLASSNAME) 
				)) {
					this.displayField(ah);
				}
			}
		}
	}
});


function TapColList_mVc(parentDivId, formName, handlers, sessionID){
	FieldList_mVc.call(this, parentDivId, formName, handlers);
	this.tableselectid = parentDivId + "_tableSelect";
	this.joinedTableLoaded = false;
};

/**
 * Column selector for ADQL
 * Method overloading
 */
TapColList_mVc.prototype = Object.create(FieldList_mVc.prototype, {
	draw : {
		value: function() {
			var that = this;
			this.attributesHandlers = new Array();
			this.joinedTableLoaded = false;
			this.parentDiv.html('<div class="fielddiv">'
					+ '<div class="fieldlist" id="' + this.fieldListId +  '" style="height: 175px"></div>'
					+ ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top:8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'
					+ ' <input id="' + this.fieldFilterId +  '" class="form-control input-sm" type="text" placeholder="Search"/></div></div>'
					+ '  <div  style="width: 350px; margin: 3px;">'
					+ '		   <div class="form-group form-inline"><label for="tapColEditor_tableSelect">Join with table:</label>'
					+ '        <select id="' + this.tableselectid +  '"  class="table_filter form-control input-sm"  style="width: 250px">'
					+ '        </select></div>'
					+ ' </div>'
					+ '  </div>');		

			$('#' + this.fieldFilterId).keyup(function() {
				that.filterPattern = new RegExp($(this).val(), 'i');
				that.fireFilter();
			});
			$('#' + this.fieldFilterId).one("click",function() {
				$(this).css('color','black');
				$(this).css('font-style','');
				$(this).attr('value','');
			});		
			this.setChangeTableHandler();
		}
	},
	setChangeTableHandler: {
		value: function() {
			var that = this;
			$('#' + this.tableselectid).change(function() {
				var to = this.value;
				var fs = to.split('.');
				var schema, table;
				$('#' + that.fieldFilterId).val(""); 
				if( fs.length == 2 ){
					schema = fs[0];
					table = fs[1];
				} else {
					/*
					 * If no schema in table name, we suppose the new table to belong the same schema
					 */
					schema = that.treePath.schema;
					table = fs[0];
				}

				that.changeTable(new DataTreePath({nodekey: that.dataTreePath.nodekey, schema: schema, table: table}));
			});
		}
	},
	setDataTreePath: {
		value: function(dataTreePath){
			this.dataTreePath = dataTreePath;
			$('#' +  this.fieldListId ).html('');
			$('#' +  this.tableselectid ).html('');
			this.joinedTableLoaded = false;
			this.addTableOption(this.dataTreePath );
			this.changeTable(this.dataTreePath);	
		}
	},
	addTableOption: {
		value: function(treePath){
			$('#' + this.tableselectid).append('<option>' + treePath.schema + '.' + treePath.table + '</option>');
			//$('#' + this.tableselectid).append('<option>' + treePath.tableorg + '</option>');
		}
	},
	changeTable : {
		value: function(dataTreePath) {	
			this.dataTreePath = dataTreePath;
			this.displayFields();
		}
	},
	getAttributeTitle: {
		value:  function(ah) {
			return ah.nameorg 
			+ " - node; " +  this.dataTreePath.nodekey
			+ " - schema; " +  this.dataTreePath.schema
			+ " - table; " +  this.dataTreePath.table
			+ " - description: " +  ah.description
			+ ((ah.ucd)?(" - UCD: " +  ah.ucd): "")
			+ ((ah.unit)?(" - Unit: " +  ah.unit): "")
			+ ((ah.type)?(" - Type: " +  ah.type): "")
			+ ((ah.range)?(" - Range: " +  JSON.stringify( ah.range.values).replace(/'/g,"&#39;")): "")
			;
		}
	},
	displayFields : {
		value : function(){
			var that = this;
			this.attributesHandlers =new Array();
			MetadataSource.getTableAtt(
					this.dataTreePath
					, function(cache) {
						that.resetPosKeywords();
						var ahm = cache.hamap;
						var table  = "<table id=" + that.fieldTableId + " style='width: 100%; border-spacing: 0px; border-collapse:collapse' class='table'></table>";
						$('#' + that.fieldListId).html(table);
						that.attributesHandlers = new Array();
						for( var k=0 ; k<ahm.length ; k++) {
							var ah = ahm[k];
							that.attributesHandlers[ah.nameattr] = ah;				
							that.displayField(ah);
						}
						if( !that.joinedTableLoaded ) {
							var jt = cache.targets;
							for( var k=0 ; k<jt.length ; k++) {
								that.addTableOption(jt[k].target_datatreepath);
							}
							/*
							 * The same object is used with different columns sets: no cache for joined tables
							 * uncommented by Pauline
							 */
							that.joinedTableLoaded = true;
						}
						that.lookForAlphaKeyword();
						that.lookForDeltaKeyword();
					});	

		}
	} ,
	lookForAlphaKeyword: {
		value: function(ah) {}
	},
	lookForDeltaKeyword: {
		value: function(ah) {}
	},
	resetPosKeywords: {
		value: function(ah) {}
	}

});


/**
 * Field list with RA/DEC field selector
 * @param parentDivId
 * @param formName
 * @param handlers
 * @param getTableAttUrl $.getJSON("gettableatt", {jsessionid: sessionID, node: nodekey, table:newTable }
 * @tables {node: nodekey, table:newTable}
 */
function TapFieldList_mVc(parentDivId, formName, handlers, getTableAttUrl, sessionID){
	TapColList_mVc.call(this, parentDivId, formName, handlers, getTableAttUrl, sessionID);
	this.raFieldId = parentDivId + "_rafield";
	this.decFieldId = parentDivId + "_decfield";
	this.alphakw = null;
	this.deltakw = null;
	this.radec = handlers.radec;

	this.getTableAttUrl = getTableAttUrl;
	if(this.radec){
		this.raHandler= function(ah){this.setAlphaKeyword(ah);};
	} else if (handlers.raHandler != undefined) {
		this.raHandler= function(ah){this.setAlphaKeyword(ah);handlers.raHandler(ah);};
	}
	if(this.radec){
		this.decHandler= function(ah){this.setDeltaKeyword(ah);};
	} else if (handlers.decHandler != undefined){
		this.decHandler= function(ah){this.setDeltaKeyword(ah);handlers.decHandler(ah);};
	}
};


/**
 * Method overloading
 */
TapFieldList_mVc.prototype = Object.create(TapColList_mVc.prototype, {
	draw : {
		value: function() {
			var that = this;
			this.attributesHandlers = new Array();
			var radec = "";
			if (this.radec) {
				radec += '<div id="div-'+this.raFieldId.substring(0, this.raFieldId.length-8)+'">'
				+ ' <div>'
				+ '    <span class="help" style="margin-left:5px;">ra&nbsp;&nbsp;</span>'
				+ '    <div id="' + this.raFieldId +  '"  style="display:inline-block;"/>'
				+ ' </div>'
				+ ' <div>'
				+ '    <span class="help"  style="margin-left:5px;">dec&nbsp;</span>'
				+ '    <div id="' + this.decFieldId +  '"  style="display:inline-block;"/>'
				+ ' </div>'
				+ ' </div>';
			}
			this.parentDiv.html('<div class=fielddiv>'
					+ ' <div class="fieldlist" id="' + this.fieldListId +  '" style="height: 175px"></div>'
					+ ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top: 8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'
					+ ' <input id="' + this.fieldFilterId +  '" class="form-control input-sm" type="text" placeholder="Search"/></div></div>'
					+ '  <div  style="width: 350px; margin: 3px;">'
					+ '		   <div class="form-group form-inline"><label for="tapColEditor_tableSelect">Join with table:</label>'
					+ '        <select id="' + this.tableselectid +  '"  class="table_filter form-control input-sm"  style="width: 250px">'
					+ '        </select></div>'
					+ '  </div>'
					+ radec
					+ '  </div>');
			$('#' + this.fieldFilterId).keyup(function() {
				that.filterPattern = new RegExp($(this).val(), 'i');
				that.fireFilter();
			});
			$('#' + this.fieldFilterId).one("click",function() {
				$(this).css('color','black');
				$(this).css('font-style','');
				$(this).attr('value','');
			});		
			this.setChangeTableHandler();
		}
	},
	setTreePath: {
		value: function(dataTreePath){
			this.dataTreePath = dataTreePath;
			$('#' +  this.fieldListId ).html('');
			$('#' +  this.tableselectid ).html('');
			$('#' + this.raFieldId).html('');
			this.alphakw = null;
			$('#' + this.decFieldId).html('');
			this.deltakw = null;
			this.addTableOption(this.dataTreePath );
			this.changeTable(this.dataTreePath);	
			this.joinedTableLoaded = false;
		}
	},
	changeTable : {
		value: function(dataTreePath) {	
			this.dataTreePath = dataTreePath;
			this.displayFields();
			/*
			this.lookForAlphaKeyword();
			this.lookForDeltaKeyword();
			 */
		}
	},
	resetPosKeywords: {
		value: function(ah) {
			$('#' + this.raFieldId).html('');
			this.alphakw = null;
			$('#' + this.decFieldId).html('');
			this.deltakw = null;
		}
	},

	lookForAlphaKeyword: {
		value: function(ah) {
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.ucd == "pos.eq.ra;meta.main" ) {
					this.setAlphaKeyword(ahn);	
					return;
				}
			}
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.ucd  == "pos.eq.ra" || ah.ucd.match( /POS_EQ_RA/i)) {
					this.setAlphaKeyword(ahn);	
					return;
				}
			}
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.nameattr  == "s_ra" || ah.nameattr  == "pos_ra_csa"|| ah.nameattr  == "_sc_ra" 
					|| ah.nameattr.toUpperCase()  == "RA" || ah.nameattr.toUpperCase()  == "RAJ2000") {
					this.setAlphaKeyword(ahn);	
					return;
				}
			}
		}
	},
	setAlphaKeyword: {
		value: function(ahname) {
			$('#' + this.raFieldId).html('');
			this.alphakw  = new TapKWSimpleConstraint_mVc({divId: this.raFieldId
				, constListId: this.raFieldId
				, isFirst: true
				, attributeHandler: this.attributesHandlers[ahname]
			, editorModel: null
			, defValue: ''
				, treePath: jQuery.extend({}, this.dataTreePath)});
			this.alphakw.fireInit();
		}
	}
	,
	getRaKeyword: {
		value: function(ahname) {
			return $('#' + this.raFieldId+ " span" ).text();
		}
	},

	lookForDeltaKeyword: {
		value: function(ah) {
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.ucd == "pos.eq.dec;meta.main" ) {
					this.setDeltaKeyword(ahn);	
					return;
				}
			}
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.ucd  == "pos.eq.dec" || ah.ucd.match( /POS_EQ_DEC/i) ) {
					this.setDeltaKeyword(ahn);	
					return;
				}
			}
			for( var ahn in this.attributesHandlers ) {
				var ah = this.attributesHandlers[ahn];
				if( ah.nameattr  == "s_dec"|| ah.nameattr  == "pos_dec_csa" || ah.nameattr  == "_sc_dec" 
					|| ah.nameattr.toUpperCase()  == "DEC" || ah.nameattr.toUpperCase()  == "DECJ2000" ) {
					this.setDeltaKeyword(ahn);	
					return;
				}
			}
		}
	},
	setDeltaKeyword: {
		value: function(ahname) {
			$('#' + this.decFieldId).html('');
			this.deltakw  = new TapKWSimpleConstraint_mVc({divId: this.decFieldId
				, constListId: this.decFieldId
				, isFirst: true
				, attributeHandler: this.attributesHandlers[ahname]
			, editorModel: null
			, defValue: ''
				, treePath: jQuery.extend({}, this.dataTreePath)});
			this.deltakw.fireInit();
		}
	},
	getDeltaKeyword: {
		value: function(ahname) {
			return $('#' + this.decFieldId + " span" ).text();
		}
	}
});

