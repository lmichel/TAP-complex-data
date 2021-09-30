/**
 * 
 * @param params
 *  - parentDivId: id of the div where the view is drawn
 *  - queryView:  widget managing the global quey: invoked at each change on the view 
 *  - formName   : Name of the current form
 *  - title : Title of the field set
 *  - models : [{modelName, label}]: array of object attached to each checkbox
 *         - modelName: name of the relationship pointing on the attached model
 *         - label: label to display by the check box
 * @returns
 */
function FitChooseModel_mVc(params){
	this.queryView   = params.queryView;
	this.parentDivId = params.parentDivId;
	this.title       = params.title;
	this.formName    = params.formName;
	this.models      = params.models;
	this.modelListId = this.formName + "_ModelList";
};


/**
 * Methods prototypes
 */
FitChooseModel_mVc.prototype = {
		/**
		 * Draw the field container
		 */
		draw : function() {
			var that = this;
			var html = '<fieldset style="display inline-block; width: 100%;" >\n'
				+ '  <legend>' + this.title + '</legend>\n'
				+ '    <div id="' + this.modelListId + '" style="display: inline; float: left; width: 50%">\n'
				+ '	   </div>\n'
				+ '	   <div style="display: inline; float: left; margin-left: 30px;"class="spanhelp">\n'
				+ '		one click on the check button for with,<br> two click on the\n'
				+ '		check button for without,<br> three click on the check button\n'
				+ '		for nothing ...\n'
				+ '	   </div>\n'
				+ '</fieldset>\n';
			$('#' + this.parentDivId).html(html);
			for( var i=0 ;  i<this.models.length ; i++ ) {
				var html = '<div id=' + this.models[i].modelName + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + this.models[i].modelName + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + this.models[i].modelName + ' class="tt">Whatever</span>\n'
				+ '  <span class="tt">' + this.models[i].label + '</span>\n'
				+ '</div><br>\n';
				$('#' + this.modelListId).append(html);

			}

			$('#' + this.modelListId + ' input').click(function(element) {
				var val = $(this).val();
				var id = $(this).attr('id');
				if( val == 0){
					$(this).attr('class','withdata').attr('value',1);
					$('.tt#'+id).text("With");
				}
				else if(val == 1){
					$(this).attr('class','withoutdata').attr('value',2);
					$('.tt#'+id).text("Without");
				}
				else if(val == 2){
					$(this).attr('class','anydata').attr('value',0);
					$('.tt#'+id).text("Whatever");
				}	
				that.updateQuery();
			});
		},
		
		updateQuery: function(element){
			var pattern = "";		
			var nl = "";
			$("#" + this.modelListId + " input").each(function(){
				var val = $(this).attr("class");
				var produit = $(this).attr("id");
				if( val == "withdata") {
					pattern += nl + '    matchPattern{ CatToFitParam,\n'
					+'     AssObjClass{SpectrumFitEntry},\n'
					+'     AssObjAttSaada{'+produit+'}}';
					nl = "\n";
				} else if( val == "withoutdata") {
					pattern += nl + '    matchPattern{ '+produit +', Cardinality = 0}';
					nl = "\n";
				}
			});
			if( this.queryView != null )
				this.queryView.fireAddConstraint(this.formName, "relation", pattern);
			else Out.info("Add pattern " + pattern + " no query view");
		},
		fireClearAllConst: function() {
			$('#' + this.modelListId + " input").attr('class','anydata').attr('value',0);
			$('#' + this.modelListId + ' .tt[id]').text("Whatever");
			this.updateQuery();
		}
};