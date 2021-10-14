function FitAttachedPatterns_mVc(params){
	AttachedPattern_mVc.call(this, params);
	this.patterns = {};
	this.relationName=params.relationName
	this.className=params.className
	for( var i=0 ; i<params.products.length ; i++){
		/*
		 * Item can run on the same relation, thus relations can not be  used as IDs. We used the label (without spaces) instead
		 */
		var localId = this.products[i].label.replace(/ /g, '_');		
		this.patterns[localId] = {model:params.products[i].model};
	}
}

FitAttachedPatterns_mVc.prototype = Object.create(AttachedPattern_mVc.prototype, {
	draw : {
		value:function() {
			var that = this;
			var html = '<fieldset style="display inline-block; width: 100%" >\n'
				+ '  <legend>' + this.title + '</legend>\n'
				+ '    <div id="' + this.productListId + '" style="display: inline; float: left; width: 50% ;height:124px;overflow:auto">\n'
				+ '	   </div>\n'
				+ '	   <div style="display: inline; float: left; margin-left: 30px;"class="spanhelp">\n'
				+ '		one click on the check button for acceptable fit,<br> two click on the\n'
				+ '		check button for not acceptable fit,<br> three click on the check button\n'
				+ '		for no specified condition.\n'
				+ '	   </div>\n'
				+ '</fieldset>\n';
			$('#' + this.parentDivId).html(html);

			this.drawItems();

			$('#' + this.productListId + ' input').click(function(element) {
				var val = $(this).val();
				var id = $(this).attr('id');
				if( val == 0){
					$(this).attr('class','withdata').attr('value',1);
					$(this).next('.ttm').text("Spectral fit for the model");
					$('<span id=' + id + ' class="tttm">is performed, goodness < 50%, acceptable fit</span>').appendTo($('div [id=m'+id+']'))	
				}
				else if(val == 1){
					$(this).attr('class','withoutdata').attr('value',2);
					//$(this).next('.tt').text("Spectral fit for the model");
					$('.tttm#'+id).text("is performed, goodness > 50%");
				}
				else if(val == 2){
					$(this).attr('class','anydata').attr('value',0);
					$(this).next('.ttm').text("No condition is specified for the model");
					$('.tttm#'+id).remove();
				}	
				that.updateQuery();
			});
		}
	},

	drawItems: {
		value: function(){
			var i=0;
			var that = this;
			for( var localId in this.patterns) {
				i++;
				var html = '<div id=m' + localId + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + localId + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + localId + ' class="ttm">No condition is specified for the model</span>\n'
				+ '  <span class="ttm" style="font-weight:bold">' + localId + '</span>\n'
				//+ '  <span id=' + localId + ' class="ttt">is not selected</span>\n'
				+ '</div><br>\n';
				$('#' + this.productListId).append(html);
			}
		}
	},
	updateQuery : {
		value: function(element){
			var that = this;
			var pattern='   matchPattern{ '+this.relationName+',\n      AssObjClass{'+this.className+'},\n      AssObjAttSaada{ ';
			var consts=new Array();
			var change=false;
			var and="_"
				$("#" + this.productListId + " input").each(function(){
					var val = $(this).attr("class");
					var produit = $(this).attr("id");
					if( val == "withdata") {
						if (change) and="\n        AND _";
						pattern += and+that.patterns[produit].model + '_fit = 0';
						change=true
					} else if( val == "withoutdata") {
						if (change) and="\n        AND _";
						pattern += and + that.patterns[produit].model + '_fit = 1 ';
						change=true
					} 
				});
			pattern+="}}";
			if(!change) pattern="";
			if( this.queryView != null )
				this.queryView.fireAddConstraint(this.formName, "relation", pattern);
			else Out.info("Add pattern " + pattern + " no query view");
		}},
		fireClearAllConst:{
			value :function() {
			$('#' + this.productListId + " input").attr('class','anydata').attr('value',0);
			$('#' + this.productListId + ' .ttm[id]').text("No condition is specified for the model");
			//if($('#' + this.productListId + ' .tttm[id]')) 
			$('#' + this.productListId + ' .tttm[id]').remove();
			this.updateQuery();
		
		}}
	});