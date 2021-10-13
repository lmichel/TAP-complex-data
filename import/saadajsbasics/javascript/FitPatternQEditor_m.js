/**
 * 
 */
function FitPatternEditor_Mvc(relationName,className){
	FitQEditor_Mvc.call(this);
	this.relationName = relationName;
	this.className=className;
	
};
/**
 * Method overloading
 */
FitPatternEditor_Mvc.prototype = Object.create(FitQEditor_Mvc.prototype, {
	updateQuery : {
		value : function() {
			var that = this;
			var retour= "";
			var and = "";
			var i=0;
			var ver=false;
			for( var e in this.editors) {
				 var q = this.editors[e].fireGetADQL();
				if( q != null ) {
					retour += and + q;
					if( and == "" ) and = "\n        AND " ;
				}
			}
			if( retour != "" ) {
				retour = "  matchPattern { "+ this.relationName + ",\n"
				+ "     AssObjClass{" + this.className + "},\n"
				+ "     AssObjAttSaada{" + retour + "}}";
			}
			this.listener.controlUpdateQuery(retour);
		} 
	}
 
});



