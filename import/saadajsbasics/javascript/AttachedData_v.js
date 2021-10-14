/**
 * Form for selecting data by cardinality (0 or not)
 * @param params
 *  - parentDivId: id of the div where the view is drawn
 *  - queryView:  widget managing the global quey: invoked at each change on the view 
 *  - formName   : Name of the current form
 *  - title : Title of the field set
 *  - products : [{relation, label}]: array of object attached to each checkbox
 *         - relation: name of the relationship pointing on the attached product
 *         - label: label to display by the check box
 * @returns
 */
function AttachedData_mVc(params){
	this.queryView   = params.queryView;
	this.parentDivId = params.parentDivId;
	this.title       = params.title;
	this.formName    = params.formName;
	this.products    = params.products;

	this.productListId = this.formName + "_ProductList";
};


/**
 * Methods prototypes
 */
AttachedData_mVc.prototype = {
		/**
		 * Draw the field container
		 */
		draw : function() {
			var that = this;
			var html = '<fieldset style="display inline-block; width: 100%;" >\n'
				+ '  <legend>' + this.title + '</legend>\n'
				+ '    <div id="' + this.productListId + '" style="display: inline; float: left; width: 50%">\n'
				+ '	   </div>\n'
				+ '	   <div style="display: inline; float: left; margin-left: 30px;"class="spanhelp">\n'
				+ '		one click on the check button for with,<br> two click on the\n'
				+ '		check button for without,<br> three click on the check button\n'
				+ '		for nothing ...\n'
				+ '	   </div>\n'
				+ '</fieldset>\n';
			$('#' + this.parentDivId).html(html);

			this.drawItems();

			$('#' + this.productListId + ' input').click(function(element) {
				var val = $(this).val();
				var id = $(this).attr('id');
				if( val == 0){
					$(this).attr('class','withdata').attr('value',1);
					$(this).next('.tt').text("With");
					//$('.tt#'+id).text("With");
				}
				else if(val == 1){
					$(this).attr('class','withoutdata').attr('value',2);
					$(this).next('.tt').text("Without");

					//$('.tt#'+id).text("Without");
				}
				else if(val == 2){
					$(this).attr('class','anydata').attr('value',0);
					$(this).next('.tt').text("Whatever");
					//$('.tt#'+id).text("Whatever");
				}	
				that.updateQuery();
			});



		},

		drawItems: function(){
			var that = this;
			for( var i=0 ;  i<this.products.length ; i++ ) {
				var html = '<div id=' + this.products[i].relation + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + this.products[i].relation + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + this.products[i].relation + ' class="tt">Whatever</span>\n'
				+ '  <span class="tt">' + this.products[i].label + '</span>\n'
				+ '</div><br>\n';
				$('#' + this.productListId).append(html);

			}
		},

		updateQuery: function(element){
			var pattern = "";		
			var nl = "";
			$("#" + this.productListId + " input").each(function(){
				var val = $(this).attr("class");
				var produit = $(this).attr("id");
				if( val == "withdata") {
					pattern += nl + '    matchPattern{ '+produit +'}';
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
			$('#' + this.productListId + " input").attr('class','anydata').attr('value',0);
			$('#' + this.productListId + ' .tt[id]').text("Whatever");
			this.updateQuery();
		}
};
/**
 * Form for selecting data by match pattern (0 or not)
 * @param params
 *  - parentDivId: id of the div where the view is drawn
 *  - queryView:  widget managing the global quey: invoked at each change on the view 
 *  - formName   : Name of the current form
 *  - title : Title of the field set
 *  - products : [{relation, label}]: array of object attached to each checkbox
 *         - relation: name of the relationship pointing on the attached product
 *         - pattern: Saada matchPattern withoyut cardinality
 *         - label: label to display by the check box
 * @returns
 */

function AttachedPattern_mVc(params){
	AttachedData_mVc.call(this, params);
	this.patterns = {};
	for( var i=0 ; i<params.products.length ; i++){
		/*
		 * Item can run on the same relation, thus relations can not be  used as IDs. We used the label (without spaces) instead
		 */
		var localId = this.products[i].label.replace(/ /g, '_');		
		this.patterns[localId] = { pattern: params.products[i].pattern, relation: params.products[i].relation};
	}
}

AttachedPattern_mVc.prototype = Object.create(AttachedData_mVc.prototype, {

	drawItems: {
		value: function(){
			var that = this;
			for( var localId in this.patterns) {
				var html = '<div id=' + localId + ' style="width: 100%;display: block; float: left">\n'
				+ '  <input id=' + localId + ' class="anydata" type="button" value="0" />\n'
				+ '  <span id=' + localId + ' class="tt">Whatever</span>\n'
				+ '  <span class="tt">' + localId + '</span>\n'
				+ '</div><br>\n';
				$('#' + this.productListId).append(html);
			}
		}
	},

	updateQuery : {
		value: function(element){
			var pattern = "";		
			var nl = ""
				var that = this;
			$("#" + this.productListId + " input").each(function(){
				var val = $(this).attr("class");
				var produit = $(this).attr("id");
				if( val == "withdata") {
					pattern += nl + '    matchPattern{\n      '
					              + that.patterns[produit].relation 
					              + '\n      ' + that.patterns[produit].pattern + '\n      }';
					nl = "\n";
					
				} else if( val == "withoutdata") {
					pattern += nl + '    matchPattern{\n      '
					              + that.patterns[produit].relation 
					              + '\n      , Cardinality = 0,\n      ' 
					              + that.patterns[produit].pattern + '\n      }';
					nl = "\n";
				}
			});
			if( this.queryView != null )
				this.queryView.fireAddConstraint(this.formName, "relation", pattern);
			else Out.info("Add pattern " + pattern + " no query view");
		}
	}
});

/**
 * Form for selecting data by match pattern (0 or not)
 * @param params
 *  - parentDivId: id of the div where the view is drawn
 *  - queryView:  widget managing the global quey: invoked at each change on the view 
 *  - formName   : Name of the current form
 *  - title : Title of the field set
 *  - products : [{relation, label}]: array of object attached to each checkbox
 *         - relation: name of the relationship pointing on the attached product
 *         - patternWith: Saada matchPattern for green button
 *         - patternWithout: Saada matchPattern for red button
 *         - label: label to display by the check box
 * @returns
 */

function AttachedPatterns_mVc(params){
	AttachedPattern_mVc.call(this, params);
	this.patterns = {};
	for( var i=0 ; i<params.products.length ; i++){
		/*
		 * Item can run on the same relation, thus relations can not be  used as IDs. We used the label (without spaces) instead
		 */
		var localId = this.products[i].label.replace(/ /g, '_');		
		this.patterns[localId] = { patternWith: params.products[i].patternWith
				                 , patternWithout: params.products[i].patternWithout
				                 , relation: params.products[i].relation};
	}
}

AttachedPatterns_mVc.prototype = Object.create(AttachedPattern_mVc.prototype, {

	updateQuery : {
		value: function(element){
			var pattern = "";		
			var nl = ""
				var that = this;
			$("#" + this.productListId + " input").each(function(){
				var val = $(this).attr("class");
				var produit = $(this).attr("id");
				if( val == "withdata") {
					pattern += nl + '    matchPattern{\n      '
					              + that.patterns[produit].relation 
					              + '\n      ' + that.patterns[produit].patternWith + '\n      }';
					nl = "\n";
				} else if( val == "withoutdata") {
					pattern += nl + '    matchPattern{\n      '
					              + that.patterns[produit].relation 
					              + '\n      ' + that.patterns[produit].patternWithout + '\n      }';
					nl = "\n";
				} 
			});
			if( this.queryView != null )
				this.queryView.fireAddConstraint(this.formName, "relation", pattern);
			else Out.info("Add pattern " + pattern + " no query view");
		}
	}

});
/**
 * 
 * ****/
function AttachedMatch_mVc(params){
	AttachedPattern_mVc.call(this, params);
	this.relation = params.relation;
	this.pattern = params.pattern;
	this.conditions = {};
	for( var i=0 ; i<params.products.length ; i++){
		/*
		 * Item can run on the same relation, thus relations can not be  used as IDs. We used the label (without spaces) instead
		 */
		var localId = this.products[i].label.replace(/ /g, '_');		
		this.conditions[localId] = params.products[i].condition;
	}
}

AttachedMatch_mVc.prototype = Object.create(AttachedPattern_mVc.prototype, {

	updateQuery : {
		value: function(element){
			var pattern = '    matchPattern{\n      ' + this.relation + '\n      ' + this.pattern + '\n      }';		
			var nl = ""
				var condition = "";
			var that = this;

			$("#" + this.productListId + " input").each(function(){
				var val = $(this).attr("class");
				var produit = $(this).attr("id");
				if( val == "withdata") {
					if( condition != "" ){
						condition += " AND " ;
					}
					condition += that.conditions[produit].yes;
				} else if( val == "withoutdata") {
					if( condition != "" ){
						condition += " AND " ;
					}
					condition += that.conditions[produit].no;
				} 
			});
			if( condition != "") {
				if( this.queryView != null )
					this.queryView.fireAddConstraint(this.formName, "relation", pattern.replace("{}", "{" + condition + "}"));
				else Out.info("Add pattern " + pattern + " no query view");
			} else {
				this.queryView.fireAddConstraint(this.formName, "relation", "");
			}
		}
	}

});