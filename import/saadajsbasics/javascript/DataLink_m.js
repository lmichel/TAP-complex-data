/**
 * @returns {QueryTextEditor_Mvc}
 */
function DataLink_Mvc() {
	this.formEntries =  new Array();
	this.listener = null;
};

DataLink_Mvc.prototype = {
		addListener : function(list){
			this.listener = list;
		},
		storeWebService: function(webservice, url) {
			this.formEntries[webservice] = {url: url, loaded: false};
		},
		getUrl: function(webservice) {
			return ( this.formEntries[webservice] == null ) ? null: this.formEntries[webservice].url;
		},
		webServiceLoaded: function(webservice) {
			if( this.formEntries[webservice] != null ) {
				this.formEntries[webservice].loaded = true;
			}
		},
		isWebServiceLoaded: function(webservice) {
			return ( this.formEntries[webservice] == null ) ? false: this.formEntries[webservice].loaded;
		}
};