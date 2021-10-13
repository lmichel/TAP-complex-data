/**
 * Subclass of ConstQEditor_mVc handling the edition of FITs bases constraints
 * @param parentDivId
 * @param formName
 * @param queryview
 * @returns {FitQEditor_mVc}
 */
function FitQEditor_mVc(params /*{parentDivId,formName,queryView, help}*/){
	ConstQEditor_mVc.call(this, params);
	var that = this;
	this.help = params.help;
	this.fieldListView = new FitFieldList_mVc(params.parentDivId
			, this.formName
			, { stackHandler: function(ahName){ that.fireAttributeEvent(ahName);}
	, orderByHandler: function(ahName){ that.fireOrderBy(ahName);}
	}
	);
};

/**
 * Method overloading
 */
FitQEditor_mVc.prototype = Object.create(ConstQEditor_mVc.prototype, {	
	draw : { 
		value: function() {
			this.fieldListView.draw();
			this.parentDiv.append('<div id=' + this.constContainerId + ' style="background: transparent; width:450px;float: left;"></div>');
			var isPos = {"fieldset":"130px", "div":"102px"};
			this.constListId = this.constListView.draw(isPos);
			if( this.help != undefined)
				$('#' + this.constContainerId).append('<div style="width: 100%;"><span class=spanhelp>' + this.help + '</span></div>');
		}
	},		
	updateQuery : { 
		value:  function(consts) {	
			if( this.queryView != null ) {
				this.queryView.fireAddConstraint(this.formName, "relation", consts);
			} else {
				Out.info("No Query View:" + JSON.stringify(consts));
			}
		}
	}
});