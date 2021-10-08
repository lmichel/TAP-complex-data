/**
 * Sub-class of FieldList_mVc, specialized to display FITs instead of Fields
 * Same constructor as the superclass
 * Only the draw method is overloaded
 * @param parentDivId
 * @param formName
 * @param handlers
 * @returns {FitFieldList_mVc}
 */
function FitFieldList_mVc(parentDivId, formName, handlers){
	FieldList_mVc.call(this, parentDivId, formName, handlers);
};

/**
 * Method overloading
 */
FitFieldList_mVc.prototype = Object.create(FieldList_mVc.prototype, {
	displayField: {
		value: function(ah){
			var that = this;
			var id = this.formName + "_" + ah.fitparam;
			var stackId = "stack_" + id ;
			var title = ah.fitparam 
			+ " - database name: " +ah.databaseName
			+ " - description: " +  ah.description
			+ ((ah.unit!=undefined)? " - unit: " + ah.unit:"")
			+ " - type: " +  ah.type
			+ ((ah.range!=undefined)? ((ah.range.values.length==2 && ah.type!="boolean")? " - range: ["+ah.range.values+"]":" - range: {"+ah.range.values+"}"):"")
			;
			var row ="<tr class=attlist id='" + ah.fitparam + "'>" 
			+"<td class=attlist><span title='" + title + "'>"+ ah.fitparam+"</span></td>"
			+"<td class='attlist help'>" + ah.type +"</td>"
			;
			if( this.stackHandler != null ) {
				row += "<td class='attlist attlistcmd'>"
					+"<input id=" + stackId + " title=\"Click to constrain fields with this FITPARAM\"  class=\"stackconstbutton\" type=\"button\"></input>"
					+"</td>";
			}
			row += "</tr>";
			$('#' + this.fieldTableId).append(row);
			if( this.stackHandler != null ){
				$('#' + this.fieldTableId  + ' input[id="' + stackId + '"]').click(function() {
					that.stackHandler($(this).closest("tr").attr("id"));}
				);
			}
			$('#' + this.fieldTableId +  ' tr[id="' + ah.fitparam + '"] span').tooltip( {
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
							that.attributesHandlers[ah.fitparam] = ah;				
							that.displayField(ah);
						}
					});
		}
	} 
});
