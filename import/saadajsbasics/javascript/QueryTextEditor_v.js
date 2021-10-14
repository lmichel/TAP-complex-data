
/**
 * @param params { parentDivId: 'query_div',defaultQuery}
 * @returns
 */
function QueryTextEditor_mVc(params) {
	this.parentDiv = $("#" +params.parentDivId );
	this.textareaid = params.parentDivId + "_text";
	this.defaultQuery = (params.defaultQuery.endsWith("\n"))? params.defaultQuery: params.defaultQuery + "";
	
	this.listener = null;
}
QueryTextEditor_mVc.prototype = {

		addListener : function(list){
			this.listener = list;
		},
		draw : function(){
			this.parentDiv.html('<textarea id="' + this.textareaid + '" class="querytext" id="Catalogue"></textarea><p class="help">Widgets do not reflect the query anymore after you modified it directly</p>');
			this.displayQuery("");
		},
		fireGetQuery: function() {
			return $("#" + this.textareaid ).val();
		},		
		/*
		 *	Params: {type, constraints}
		 *	where supported typed are "column" "orderby" "ucd" "position" "relation" "limit"
		 *  Label is used to identify the form  constraints are coming from
		 */
		fireAddConstraint : function(label, type, constraints, joins) {
			this.listener.controlAddConstraint(label, type, constraints, joins);
		},
		fireDelConstraint : function(label, type) {
			this.listener.controlDelConstraint(label, type);
		},
		fireSetTreePath : function(treePath) {
			this.listener.controlSetTreePath(treePath);
		},
		reset: function(defaultQuery){
			this.defaultQuery = defaultQuery;
			this.displayQuery("");
			this.listener.controlReset();
		},
		displayQuery : function(query) {
			$("#" + this.textareaid ).val(this.defaultQuery + query);
		},
		getQuery : function(query) {
			return $("#" + this.textareaid ).val();
		},
		toggle: function() {
			this.parentDiv.toggle();
		}
};
