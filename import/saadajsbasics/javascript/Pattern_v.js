/**
 * Pattern_mVc: Editor for constraint on SaadaQL relationships
 * 
 * @param parentDivId : ID of the div containing the query editor
 * @param formName    : Name of the form. Although internal use must be 
 *                      set from outside to avoid conflict by JQuery selectors 
 * @param queryview   : JS object supposed to take the constraint locally edited.
 *                      It supposed to have a public method names fireConstQuery(const)
 *                      where const is an object like {columnConst:"SQL stmt", orderConst:"att name"}
 *                     
 * @returns {ConstQEditor_mVc}
 */
function Pattern_mVc(params /*{parentDivId,formName,queryView}*/){
	var that = this;
	this.fieldsLoaded = false;
	this.dataTreePath = null; // instance of DataTreePath
	this.queryView = params.queryView;
	this.relations = {};
	/**
	 * DOM references
	 */
	this.parentDiv = $("#" + params.parentDivId );
	this.constContainerId   = params.parentDivId + "_constcont";
	this.patternContainerId   = params.parentDivId + "_pattern";
	this.constListId   = '';
	this.formName = params.formName;
	this.patternEditor;

	this.constListView = new ConstList_mVc(params.parentDivId
			, this.formName
			, this.constContainerId
			, function(ahName){ that.fireClearAllConst();}
	);
	this.editors =[];
	this.const_key = 0;
};

Pattern_mVc.prototype = {
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
			this.parentDiv.append(
					'<div class="fielddiv" style="padding: 3px;">'
					+ '   <span class=help>Select the relationship</span><br>'
					+ '   <select id="relationSelector"  class="table_filter form-control input-sm"  style="width: 250px"></select>'
					+ '   <span class=help id=relationDescriptor></span>'
					+ '</div>'
			);

			this.parentDiv.append('<div id=' + this.constContainerId + ' style="width: 450px;float: left;background: transparent; display: inline;"></div>');
			var isPos = {"fieldset":"130px", "div":"102px"};
			this.constListId = this.constListView.draw(isPos);
			var that = this;
			$("#relationSelector").change(function(){
				if( !this.value.startsWith('--') ) {			
					var desc = "";
					var relation = that.relations[this.value];
					if( relation.description != undefined ) desc =  relation.description;
					desc += "Relationship pointing on " + relation.ending_collection + "." + relation.ending_category ;
					$("#relationDescriptor").html('<br>' 
							+ desc 
							+ '<br><a title="Click to open the pattern editor window">Edit Pattern</a>');
					$("#relationDescriptor a").click(function(){
						that.patternEditor = new PatternEditor_mVc({
							parentDivId: that.patternContainerId
							,patternView: that
							,relation: relation
						});
					}) 
				} else {
					$("#relationDescriptor").html('');
				}
			});
		},	
		fireSetRelations: function(relations){
			this.relations = {};
			$("#relationSelector").html("");
			$("#relationSelector").append('<option>---------</option>');
			$("#relationDescriptor").html('');
			for( var r=0 ; r<relations.length ; r++){ 
				var rr = relations[r]; 
				this.relations[rr.name] = rr;
				$("#relationSelector").append('<option>' + rr.name + '</option>');
			}
		},
		fireSetTreepath: function(dataTreePath){
			var rel = MetadataSource.getRelations(dataTreePath);
			this.fireSetRelations(rel);
		},
		fireClearAllConst : function() {
			this.constListView.fireClearAllConst();
			this.queryView.fireDelConstraint(this.formName, "pattern");
		},

		takePattern: function(relation, patternText){
			$("#" + this.constContainerId + " span.help").attr("style","display:none;");

			var divKey = this.constContainerId + "_" + relation.name + "_" + this.const_key;
			var v = new KWSimpleConstraint_mVc({divId: divKey
				, constListId: this.constListId
				, isFirst: true
				, editorModel: this
				, name: "Pattern on relation " + relation.name
				, defValue: patternText});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
			this.updateQuery();
		},
		processRemoveFirstAndOr : function(key) {	
			delete this.editors[key];
			this.const_key--;
			this.updateQuery();
		},
		updateQuery : function() {	
			var consts = [];
			for ( var k in this.editors){
				consts.push(this.editors[k].defValue);
			}
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "relation", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
};

/**
 * See the ConstList API
 * {
 * relation: JSON description of the relation given by the server
 * patternView: Calling pattern editor
 * parentDivId= ID of the div containing the parent. Just used to build inner div ids.
 * }
 */
function PatternEditor_mVc(params /*{parentDivId,patternView}*/){
	//params.parentDivId = 'azerty';
	this.relation = params.relation;
	this.parentDivId = params.parentDivId;
	this.patternView = params.patternView;
	this.constDivId = params.parentDivId + "_const";
	this.patternDivId = this.constDivId + "_pattern";
	this.qualifierDivId = params.parentDivId + "_qualif";
	this.attDivId = params.parentDivId + "_att";
	this.constListId = '';
	this.fieldListView;
	this.qualifierListView;
	this.endPointTreePath;
	this.classes = {};
	this.editors =[];
	this.qualifiers = {};

	this.draw();
	this.setRelation();

}

PatternEditor_mVc.prototype = {
		draw : function() {
			Modalinfo.dataPanel('Pattern Editor for the Relation ' + this.relation.name, '<div class="patternContainer"  id="' + this.parentDivId + '"></div>');
			this.parentDiv = $("#" + this.parentDivId );
			this.parentDiv.append(
					  '<div class="patternContainerLeft">'
					+ '   <div id="' + this.qualifierDivId + '"style="width: 100%; height: 50%;">'
					+ '   </div>'
					+ '   <div id="' + this.attDivId + '" style="width: 100%; height: 50%;">'
					+ '   </div>'
					+ '</div>'
					+ '<div id="' + this.constDivId + '" class="patternContainerRight">'
					+ '</div>'
			);
			var that = this;
			this.fieldListView = new FieldList_mVc(this.attDivId
					, "this.formName"
					, {stackHandler: function(ahname){
						that.fireFieldEvent(ahname)}});
			this.fieldListView.draw();

			this.qualifierListView = new BasicFieldList_mVc(this.qualifierDivId
					, "this.formName"
					, {stackHandler: function(ahname){that.fireQualifierEvent(ahname, that.constListId)}});
			this.qualifierListView.draw();
			this.qualifierListView.displayField({nameatt: "qualifier", nameorg: "qualifier"});
			$('#' + this.qualifierDivId).append(
					'   <br><span  class=help>Select a data class</span>'
					+  '   <select id="patternClassSelector"  class="table_filter form-control input-sm"  style="width: 250px"></select>'
			);
			this.constListView = new ConstList_mVc(this.constDivId
					, "this.formName"
					, this.constDivId
					, function(ahName){ that.fireClearAllConst();}
			);
			this.constListId = this.constListView.draw();


			$("#" + this.constDivId).append("<textarea rows=7  style='margin-left: 5px; width: 100%;' id='" + this.patternDivId + "' ></textarea>");
			$("#" + this.constDivId).append("<br><br><div style='float: right;'>"
					+ "<input type='button' value='Cancel' onclick='Modalinfo.close();' ></input>&nbsp;"
					+ "<input id='acceptPattern' type='button' value='Add to Query' style='font-weight: bold;'></input></div>");
			$("#acceptPattern").click(function(){
				var x =  $("#" + that.patternDivId);
				var y = x.val();
				var z = x.text();
				that.patternView.takePattern(that.relation, y);
				Modalinfo.close();
			});
		},

		setRelation: function(){
			var ahm = [{"nameattr": "Cardinality", "nameorg": "Cardinality", "type": "integer"}];
			this.qualifiers["Cardinality"]  = ahm[0];
			for( var q=0 ; q<this.relation.qualifiers.length ; q++){
				var ah = {"nameattr": this.relation.qualifiers[q], "nameorg": "Qualifier " +  this.relation.qualifiers[q], "type": "double"};
				ahm.push(ah)
				this.qualifiers[ah.nameattr]  = ah;
			} 
			this.endPointTreePath = this.relation.ending_collection + "." + this.relation.ending_category;
			this.endPointTreePath = new DataTreePath({signature: this.relation.name + "." + this.relation.ending_collection + "." + this.relation.ending_category});
			this.fireSetClasses();
			this.qualifierListView.displayAttributeHandlers(ahm);
			var that = this;
					MetadataSource.getTableAtt(
							this.endPointTreePath, 
							function(cache){
								that.fieldListView.displayAttributeHandlers(cache.hamap);
								that.updateQuery();
							})		;
			//this.updateQuery();
		},
		fireSetClasses: function(){
			this.classes = MetadataSource.getClasses(this.endPointTreePath);
			$("#patternClassSelector").append('<option>Any Class</option>');
			for( var r=0 ; r<this.classes.length ; r++){ 
				$("#patternClassSelector").append('<option>' + this.classes[r] + '</option>');
			}
			var that = this;
			$("#patternClassSelector").change(function(){
				that.removeClassFields();
				if( !this.value.startsWith('Any') ) {
//					var x = MetadataSource.getTableAtt({nodekey: this.value});
//					that.fieldListView.displayAttributeHandlers(x);		
					
					MetadataSource.getTableAtt({nodekey: this.value}, function(cache){
						that.fieldListView.displayAttributeHandlers(cache.hamap);
					})
				} else {
					//that.fieldListView.displayAttributeHandlers(MetadataSource.getTableAtt({nodekey: that.endPointTreePath}))	;
					MetadataSource.getTableAtt(that.endPointTreePath, function(cache){
						that.fieldListView.displayAttributeHandlers(cache.hamap);
					})
				}
				that.updateQuery()
			});
		},	
		/**
		 * Add a constraint on a qualifier
		 */
		fireQualifierEvent: function(ahname){
			$("#" + this.constListId + " span.help").attr("style","display:none;");
			ah = this.qualifiers[ahname];

			var divKey = this.constDivId + ah.nameattr;
			if( this.editors[divKey] != undefined )
				return
				var v = new KWConstraint_mVc({divId: divKey
					, constListId: this.constListId
					, isFirst: true
					, attributeHandler: ah
					, editorModel: this
					, defValue: ''});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		},
		fireFieldEvent: function(ahname){
			$("#" + this.constListId + " span.help").attr("style","display:none;");
			ah = this.fieldListView.getAttributeHandler(ahname);

			var divKey = this.constDivId + ah.nameattr;
			var v = new KWConstraint_mVc({divId: divKey
				, constListId: this.constListId
				, isFirst: true
				, attributeHandler: ah
				, editorModel: this
				, defValue: ''});
			this.editors[divKey] = v;
			v.fireInit();
			this.const_key++;
		},
		/**
		 * remove all constraints applied to a classs field
		 */
		removeClassFields: function(){
			for( var k in this.editors ){
				var kedit = this.editors[k]
				var ah = kedit.getAttributeHandler();
				if( ah.nameattr.startsWith('_')){
					this.constListView.fireClearConst(".*" + ah.nameattr);
					delete this.editors[k];
				}
			}
			this.updateQuery();
		},

		notifyTypoMsg : function(fault, msg){
			this.constListView.printTypoMsg(fault, msg);	
		},
		processRemoveConstRef: function(ahname) {
			for( var k in this.editors ){
				var kedit = this.editors[k]
				var ah = kedit.getAttributeHandler();
				if( ah.nameattr == ahname || ah.nameorg == ahname ){
					this.constListView.fireClearConst(".*" + ah.nameattr);
					delete this.editors[k];
					break;
				}
			}

			delete this.editors[key];
			this.updateQuery();
		},
		/**
		 * Just to keep compliant with the ConsQEditor API
		 * @param key
		 */
		processRemoveFirstAndOr : function(key) {
			this.updateQuery();
		},
		updateQuery : function() {
			var query = "  matchPattern {\n"
				+ "    " + this.relation.name;

			for( var k in this.editors ){
				var kedit = this.editors[k]
				var ah = kedit.getAttributeHandler();
				var q;
				if( ah.nameattr == "Cardinality" && (q = kedit.fireGetADQL()) != null ){
					query += ",\n    " + q;
				}
			}
			for( var k in this.editors ){
				var kedit = this.editors[k]
				var ah = kedit.getAttributeHandler();
				var q;
				if( ah.nameorg.startsWith("Qualifier ")  && (q = kedit.fireGetADQL()) != null ){
					query += ",\n     Qualifier{" + q + "}";
				}
			}
			var qa = "";
			var classe = null
			for( var k in this.editors ){
				var kedit = this.editors[k]
				var ah = kedit.getAttributeHandler();
				var q;
				if( !ah.nameorg.startsWith("Qualifier ")  &&  ah.nameattr != "Cardinality" && (q = kedit.fireGetADQL()) != null ){
					if( ah.nameattr.startsWith("_") ){
						classe = $("#patternClassSelector option:selected").text();
					}
					qa += " " + q;
				}
			}
			if( qa != "" ){
				if( classe == null ){
					query += ",\n     AssObjAtt{" + qa + "}";		
				} else {
					query += ",\n     AssObjClass{" + classe + "}";		
					query += ",\n     AssObjAttClass{" + qa + "}";		
				}
			}
			query += "\n  }";
			$('#' + this.patternDivId).text(query);
		}
}




