DataLink_mvC = function(view, model){
	/**
	 * listen to the view
	 */
	var vlist = {
			controlStoreWebService : function(webservice, url){
				return model.storeWebService(webservice, url);
			},
			controlGetUrl : function(webservice){
				return model.getUrl(webservice);
			},
			controlWebServiceLoaded : function(webservice){
				model.webServiceLoaded(webservice);
			},
			controlIsWebServiceLoaded : function(webservice){
				return model.isWebServiceLoaded(webservice);
			}
	};
	view.addListener(vlist);

	var mlist = {
	};
	model.addListener(mlist);
};
