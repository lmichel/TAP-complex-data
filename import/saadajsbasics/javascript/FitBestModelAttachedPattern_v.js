function FitBestModelAttachedPattern_mVc(params){
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

FitBestModelAttachedPattern_mVc.prototype = Object.create(AttachedPattern_mVc.prototype, {
	draw : {
		value:function() {
			var that = this;
			var html = '<fieldset style="display inline-block; width: 100%" >\n'
				+ '  <legend>' + this.title + '</legend>\n'
				+ '    <div id="' + this.productListId + '" style="display: inline; float: left; width: 50% ;height:124px;overflow:auto">\n'
				+ '	   </div>\n'
				+ '	   <div style="display: inline; float: left; margin-left: 30px;"class="spanhelp">\n'
				+ '		one click on the check button for best model,<br> two click on the\n'
				+ '		check button for no specified condition.'
				+ '	   </div>\n'
				+ '</fieldset>\n';
			$('#' + this.parentDivId).html(html);

			this.drawItems();

			$('#' + this.productListId + ' input').click(function(element) {
				var val = $(this).val();
				var id = $(this).attr('id');
				if( val == 0){
					$(this).attr('class','withdata').attr('value',1);
					$('.ttb#'+id).text("The model");
					$('<span id=' + id + ' class="tttb">is the best fit</span>').appendTo($('div [id=b'+id+']'))
				}else if(val == 1){
					$(this).attr('class','anydata').attr('value',0);
				}	
				that.updateQuery(element);
			});
		}
	},

	drawItems: {
		value: function(){
			var i=0;
			var that = this;
			for( var localId in this.patterns) {
				i++;
				var html = '<div id=b' + localId + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + localId + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + localId + ' class="ttb">No condition is specified for the model</span>\n'
				+ '  <span class="ttb" style="font-weight:bold">' + localId + '</span>\n'
				+ '</div><br>\n';
				$('#' + this.productListId).append(html);
			}
		}
	},
	updateQuery : {
		value: function(element){
			var that = this;
			var pattern='     BestIs ';
			var consts=new Array();
			var change=false;
			$("#" + this.productListId + " input").each(function(){
				var val = $(this).attr("class");
				var produit = $(this).attr("id");
				if(element && element.currentTarget.id==produit && val == "withdata") {
					pattern += that.patterns[produit].model  ;
					change=true;
				} 
				else{
					$(this).attr('class','anydata').attr('value',0);
					$('.ttb#'+produit).text("No condition is specified for the model");
					if($('.tttb#'+produit)) $('.tttb#'+produit).remove() }
			});

			if(!change) pattern="";
			if( this.queryView != null )
				this.queryView.fireAddConstraint(this.formName, "fitconst", pattern);
			else Out.info("Add pattern " + pattern + " no query view");
		}
	},
	fireClearAllConst:{ value: function() {
		$('#' + this.productListId + " input").attr('class','anydata').attr('value',0);
		this.updateQuery();
	}}



});