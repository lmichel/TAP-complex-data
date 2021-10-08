function FitOrderModelAttachedPattern_mVc(params){
	AttachedPattern_mVc.call(this, params);
	this.patterns = {};
	for( var i=0 ; i<params.products.length ; i++){
		/*
		 * Item can run on the same relation, thus relations can not be  used as IDs. We used the label (without spaces) instead
		 */
		var localId = this.products[i].label.replace(/ /g, '_');		
		this.patterns[localId] = {model:params.products[i].label};
	}
}

FitOrderModelAttachedPattern_mVc.prototype = Object.create(AttachedPattern_mVc.prototype, {
	draw : {
		value:function() {
			var that = this;
			var html = '<fieldset style="display inline-block; width: 100%" >\n'
				+ '  <legend>' + this.title + '</legend>\n'
				+ '    <div id="' + this.productListId + '" style="display: inline; float: left; width: 50% ;height:124px;overflow:auto">\n'
				+ '	   </div>\n'
				+ '	   <div style="display: inline; float: left; margin-left: 30px;"class="spanhelp">\n'
				+ '		one click on the check button for ascending order,<br> two click on the\n'
				+ '		check button for descending order,<br> three click on the check button\n'
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
					$(this).next('.tto').text('');
					$('<span id=' + id + ' class="ttto">in ascending order</span>').appendTo($('div [id=o'+id+']'))	
				}
				else if(val == 1){
					$(this).attr('class','withoutdata').attr('value',2);
					//$(this).next('.tt').text("Spectral fit for the model");
					$('.ttto#'+id).text("in descending order");
				}
				else if(val == 2){
					$(this).attr('class','anydata').attr('value',0);
					$(this).next('.tto').text("No condition is specified for the model");
					$('.ttto#'+id).remove();
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
				var html = '<div id=o' + localId + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + localId + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + localId + ' class="tto">No condition is specified for the model</span>\n'
				+ '  <span class="tto" style="font-weight:bold">' + localId + '</span>\n'
				//+ '  <span id=' + localId + ' class="ttt">is not selected</span>\n'
				+ '</div><br>\n';
				$('#' + this.productListId).append(html);
			}
		}
	},
	updateQuery : {
		value: function(element){
			var that = this;
			var pattern=' OrderByGoodn';
			var consts=new Array();
			var change=false;
			var and=" "
				$("#" + this.productListId + " input").each(function(){
					var val = $(this).attr("class");
					var produit = $(this).attr("id");
					if( val == "withdata") {
						if (change) and=",\n                           ";
						pattern += and+that.patterns[produit].model + ' ASC';
						change=true
					} else if( val == "withoutdata") {
						if (change) and=",\n                           ";
						pattern += and + that.patterns[produit].model + ' DESC';
						change=true
					} 
				});
			
			if(!change) pattern="";
			if( this.queryView != null )
				this.queryView.fireAddConstraint(this.formName, "fitconst", pattern);
			else Out.info("Add pattern " + pattern + " no query view");
		}},
		fireClearAllConst:{
			value :function() {
			$('#' + this.productListId + " input").attr('class','anydata').attr('value',0);
			$('#' + this.productListId + ' .tto[id]').text("No condition is specified for the model");
			//if($('#' + this.productListId + ' .tttm[id]')) 
			$('#' + this.productListId + ' .ttto[id]').remove();
			this.updateQuery();
		
		}}
	});