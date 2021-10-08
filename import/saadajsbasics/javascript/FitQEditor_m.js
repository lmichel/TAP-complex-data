/**
 * Sub-class of ConstQEditor_Mvc, specialized to manage FITs instead of Fields
 * Same constructor as the superclass
 * Only the FitQEditor_Mvc method is overloaded
 * @param chemin
 */
function FitQEditor_Mvc(){
	ConstQEditor_Mvc.call(this);
};
/**
 * Method overloading
 */
FitQEditor_Mvc.prototype = Object.create(ConstQEditor_Mvc.prototype, {
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
				Out.debug("mv FIT constraint " + ahname + " to #" + constListId );
				var divKey = this.constEditorRootId + ahname + this.const_key;
				var verifeditor=false;
				var v = new FitConstraint_mVc({divId: divKey
					, constListId: constListId
					, isFirst: first
					, attributeHandler: ah
					, editorModel: this
					, defValue: ''});

				this.editors[divKey] = v;
				v.fireInit();
				this.const_key++;}

		}
	},
	loadFields: {
		/*value:function(dataTreePath ) {
			Out.infoTrace("aaa");
			var that = this;
			this.attributesHandlers = {};
			if( dataTreePath ) {
				$.ajax({

			type: "GET",
			url: "fitparamlist",
			dataType: 'json',

			data: dataTreePath,
			success:  function(dataTreePath)  {
				var ahm = MetadataSource.ahMap(dataTreePath);
				that.attributeHandlersSearch = new Array();
				for( var k=0 ; k<ahm.length ; k++) {
					var ah = ahm[k];
					that.attributeHandlersSearch.push(ah);		
					that.attributeHandlers[ah.ucd] = ah;				
				}
			}})}}*/
		value : function(dataTreePath ) {
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
								that.attributeHandlers[ah.fitparam] = ah;				
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



