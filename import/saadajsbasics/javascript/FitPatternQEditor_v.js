/**
 * 
 */

function FitPatternEditor_mVc(params /*{parentDivId, formName, queryView, help}*/){
	FitQEditor_mVc.call(this, params);
};
/**
 * Method overloading
 */
FitPatternEditor_mVc.prototype = Object.create(FitQEditor_mVc.prototype, {	
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