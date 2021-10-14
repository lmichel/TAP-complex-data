/**
 * Sorter_mVc: Small widget commanding column sorting (ascedent or descendant). The sorter layout includes the 2 arrows and the the filed label.
 * It corresponds to the whole content of the container. 
 * The Sorter is supposed to belongs to a TR container
 * @param container       : JQuery ref of container. It must exist with the DOM  before.
 * @param parentContainer : JQUERY ref of the container containing all coupled sorters (typically all row heads)
 * @param fieldAh         : Attribute handler of the field: namorg is displayed and nameattr is sent to the sort handler
 * @param  handler        : handler called   when  the state of the arrows change. 
 *                          This handler must have be prototyped as function(field, sort)
 *                          where field is the name of the filed given to the constructor
 *                          and sort is the command. It is equals to 
 *                          	- "asc" : for ascendant sort
 *                              - "desc": for descendant sort
 *                              - null  : for no sort
 */

/**
 * class prototype
 */
function Sorter_mVc(container, parentContainer, fieldAh, handler, scrollHandler){

	/*
	 * Some reference and IDs on useful  DOM elements
	 */
	this.container = container;
	this.scrollPaneSelector = null;
	this.scrollLeft = 0;
	this.parentContainer = parentContainer;
	this.fieldAh = fieldAh;
	this.handler = (handler == null)? function(fieldName, sortCommand){alert("Sort command: " + fieldName + " " +  sortCommand);}: handler;
	this.scrollHandler = scrollHandler;
}
/**
 * Methods prototypes
 */
Sorter_mVc.prototype = {
		/**
		 * Draw the field container
		 */
		draw : function() {
			var that = this;
			this.container.html("<div style='display: inline;'>"
					+ "<div class=sorter><a class=sort_asc_disabled href='#'></a><a class=sort_desc_disabled href='#'></a></div>"
					// add 4 spaces to keep room for the order arrows.
					+ "<span class=sorter>" + this.fieldAh.nameorg+ "&nbsp;&nbsp;&nbsp;&nbsp;</span>"
					+ "</div>");
			this.container.find("a").click(function(){
				var clickedAnchor = $(this);
				that.enableDisable(clickedAnchor);
				var nodeClass = clickedAnchor.attr("class");

				if( nodeClass == "sort_asc" ) {
					that.handler(that.fieldAh.nameattr, "asc");
				} else if( nodeClass == "sort_desc" ) {
					that.handler(that.fieldAh.nameattr, "desc");
				} else {
					that.handler(that.fieldAh.nameattr, null);
				}
				/*
				 * Send the scroll position to the caller 
				 */
				if( that.scrollPaneSelector != null && that.scrollHandler != null ) {
					var x = $(that.scrollPaneSelector).scrollLeft();
					that.scrollHandler(x);
				}
			});
		},
		/**
		 * Set a jquery selector pointing on the scrollable data panel
		 */
		setScrollPaneSelector: function(scrollPaneSelector) {
			this.scrollPaneSelector = scrollPaneSelector;
		},
		enableDisable: function(clickedAnchor) {
			var initClass =  clickedAnchor.attr("class");
			
			this.parentContainer.find('a').each(function() {
				var node = $(this);
				var nodeClass = node.attr("class");
				if( nodeClass == "sort_asc") {
					node.attr("class","sort_asc_disabled" );
				} else if( nodeClass == "sort_desc") {
					node.attr("class","sort_desc_disabled" );
				} 
			});
			clickedAnchor.attr("class",
					(initClass == "sort_asc_disabled")? "sort_asc"
							:(initClass == "sort_asc")? "sort_asc_disabled"
									: (initClass == "sort_desc_disabled")? "sort_desc"
											: "sort_desc_disabled");
		},
		activeArrow: function(asc) {
			this.container.find("a").each(function() {
				var node = $(this);
				var nodeClass = node.attr("class");
				if( nodeClass == "sort_asc_disabled" && asc) {
					node.attr("class","sort_asc" );
				} else if( nodeClass == "sort_desc_disabled" && !asc ) {
					node.attr("class","sort_desc" );
				} 
				
				
			});
		}
};


