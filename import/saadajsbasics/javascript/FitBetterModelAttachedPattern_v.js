function FitBetterModelAttachedPattern_mVc(params){
	AttachedPattern_mVc.call(this, params);
	this.patterns = {};
	for( var i=0 ; i<params.products.length ; i++){
		/*
		 * Item can run on the same relation, thus relations can not be  used as IDs. We used the label (without spaces) instead
		 */
		var localId = this.products[i].label.replace(/ /g, '_');		
		this.patterns[localId] = {model:params.products[i].model};
	}
	this.numbercheked=function(){
		var c=0;
		$("#" + this.productListId + " input").each(function(){
			if($(this).attr("class")!="anydata")
				c++;
		})
		return c
	}
}
FitBetterModelAttachedPattern_mVc.prototype = Object.create(AttachedPattern_mVc.prototype, {
	draw : {
		value:function() {
			var that = this;
			var html = '<fieldset style="display inline-block; width: 100%" >\n'
				+ '  <legend>' + this.title + '</legend>\n'
				+ '    <div id="' + this.productListId + '" style="display: inline; float: left; width: 50% ;height:124px;overflow:auto">\n'
				+ '	   </div>\n'
				+ '	   <div style="display: inline; float: left; margin-left: 30px;"class="spanhelp">\n'
				+ '		one click on the check button to compare model,<br> two click on the\n'
				+ '		check button for no specified condition.'
				+ '	   </div>\n'
				+ '</fieldset>\n';
			$('#' + this.parentDivId).html(html);

			this.drawItems();

			$('#' + this.productListId + ' input').click(function(element) {
				var val = $(this).val();
				var id = $(this).attr('id');
				if( val == 0){
					if (that.numbercheked()==1) $(this).attr('class','withoutdata').attr('value',1);
					else $(this).attr('class','withdata').attr('value',1);
					//$('.ttbt#'+id).text("The model");
					//$('<span id=' + id + ' class="tttbt">is the best fit</span>').appendTo($('div [id=bt'+id+']'))
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
				var html = '<div id=bt' + localId + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + localId + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + localId + ' class="ttbt">No condition is specified for the model</span>\n'
				+ '  <span class="ttbt" style="font-weight:bold">' + localId + '</span>\n'
				+ '</div><br>\n';
				$('#' + this.productListId).append(html);
			}
		}
	},
	updateQuery : {
		value: function(element){
			var that = this;
			var pattern="";
			var consts=new Array();
			var change=false;
			var modelbetter="";
			var modelworse="";
			if(that.numbercheked()==1){
				$("#" + this.productListId + " input").each(function(){
					var val = $(this).attr("class");
					var produit = $(this).attr("id");
					if(val=="anydata"){$('.ttbt#'+produit).text("No condition is specified for the model");
					if($('.tttbt#'+produit)) $('.tttbt#'+produit).remove() 
					}
					else {
						if (val=="withoutdata") $(this).attr("class","withdata")
						$('.ttbt#'+$(this).attr("id")).text("The model");
						if($('.tttbt#'+produit)) $('.tttbt#'+produit).remove() 
						$('<span id=' + produit + ' class="tttbt">is fitted <strong> better </strong> than ...</span>').appendTo($('div [id=bt'+produit+']'))
					}
				});
			}
			else if(that.numbercheked()==2){
				$("#" + this.productListId + " input").each(function(){
					var val = $(this).attr("class");
					var produit = $(this).attr("id");
					if(val == "withdata") modelbetter=(that.patterns[produit].model).toUpperCase();
					else if( val == "withoutdata") modelworse=(that.patterns[produit].model).toUpperCase();
				});
				$("#" + this.productListId + " input").each(function(){
					var val = $(this).attr("class");
					var produit = $(this).attr("id");
					if(val == "withoutdata") {
						$('.ttbt#'+$(this).attr("id")).text("The model");
						$('<span id=' + produit + ' class="tttbt">is fitted <strong> worse </strong> than <strong>' + modelbetter + '</strong></span>').appendTo($('div [id=bt'+produit+']'))
					}
					else if(val == "withdata"){
						$('.tttbt#'+produit).remove() 
						$('<span id=' + produit + ' class="tttbt">is fitted <strong> better </strong> than  <strong>' + modelworse + '</strong></span>').appendTo($('div [id=bt'+produit+']'))
					}
				});
				change=true
				pattern =modelbetter+" BetterThan "+modelworse
			}
			else {
				$("#" + this.productListId + " input").each(function(){
					var val = $(this).attr("class");
					var produit = $(this).attr("id");
					if(element && element.currentTarget.id==produit && val == "withdata") {
						$('.ttbt#'+$(this).attr("id")).text("The model");
						$('<span id=' + produit + ' class="tttbt">is fitted <strong> better </strong> than ...</span>').appendTo($('div [id=bt'+produit+']'))
					} 
					else{
						$(this).attr('class','anydata').attr('value',0);
						$('.ttbt#'+produit).text("No condition is specified for the model");
						if($('.tttbt#'+produit)) $('.tttbt#'+produit).remove() }
				});
			}
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