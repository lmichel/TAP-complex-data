Modalcommand = function() {
	var divId     = 'modalcommanddiv';
	var divSelect = '#' + divId;
	/*
	 * Privates functions
	 */
	var initDiv = function() {
		if( $(divSelect).length != 0){		
			$(divSelect).remove();
		}		
		$(document.documentElement).append("<div id=" + divId + " style='display: none; width: auto; hight: auto;'></div>");
	}; 
	/*
	 * Public functions
	 */
	var commandPanel = function (title, htmlContent, closeHandler) {
		initDiv();
		var chdl = ( closeHandler == null )? function(ev, ui)  {}: closeHandler;
		$(divSelect).html(htmlContent);
		$(divSelect).dialog({resizable: false
			, width: 'auto'
				, title: title 			                      
				, zIndex: (zIndexModalinfo -1)
				, close: chdl});
	};
	/**
	 * Open a modal dialog with an handler called once the html is attached to the DOM
	 */
	var commandPanelAsync = function (title, htmlContent, openHandler, closeHandler) {
		initDiv();
		var chdl = ( closeHandler == null )? function(ev, ui)  {}: closeHandler;
		var ohdl = ( openHandler == null )? function(ev, ui)  {}: openHandler;
		$(divSelect).html(htmlContent);
		$(divSelect).dialog({resizable: false
			, width: 'auto'
				, title: title 			                      
				, zIndex: (zIndexModalinfo -1)
				, close: chdl
				, open: ohdl
		});
	};
	var setDivToggling = function(handler) {
		$(divSelect + " fieldset legend").click(function() {
			$(this).parent().find("div").first().toggle(handler);		  
		});
	};
	/**
	 * Collapse or expand all top div in fieldsets
	 */
	var collapseDiv= function(handler) {
		$(divSelect + " fieldset legend").each(function() {
			$(this).parent().find("div").first().toggle(handler);		  
		});
	};
	/*
	 * exports
	 */
	var pblc = {};
	pblc.commandPanel = commandPanel;
	pblc.commandPanelAsync = commandPanelAsync;
	pblc.setDivToggling = setDivToggling;
	pblc.collapseDiv = collapseDiv;
	return pblc;
}();