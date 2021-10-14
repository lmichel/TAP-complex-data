ConstQEditor_mvC = function(view,model){
	/**
	 * listen to the view
	 */

	var vlist = {
			controlLoadFields: function(treePath, handler){
				model.loadFields(treePath, handler);
			},
			controlAttributeEvent: function(ahname, constListId){
				model.processAttributeEvent(ahname, constListId);
			},
			controlAttributeHandlerEvent: function(ah, constListId){
				model.processAttributeHandlerEvent(ah, constListId);
			},
			controlClearAllConst : function() {
				model.clearAllConst();
			},
			controlClearConst : function(filter) {
				model.clearConst(filter);
			},
			controlGetNumberOfEditor : function() {
				return model.getNumberOfEditor();
			},
			controlInputCoord: function(ra, dec, radius, frame, rakw, deckw, constListId) {
				model.processInputCoord(ra, dec, radius, frame, rakw, deckw, constListId);
			},
			controlOrderBy: function(nameattr) {
				model.processOrderBy(nameattr);
			},
			controlGetAttributeHandlers: function() {
				return model.getAttributeHandlers();
			},
			controlGetDefaultValue: function() {
				return model.getDefaultValue();
			}
	};

	view.addListener(vlist);

	var mlist = {
			nextListener: function(){
				view.nextListener();
			}, 
			controlTypoMsg : function(fault, msg) {
				view.printTypoMsg(fault, msg);
			},
			controlTypoGreen : function() {
				return view.isTypoGreen();
			},
			controlUpdateQuery : function(consts, joins) {
				view.updateQuery(consts, joins);
			},
			controlRunQuery : function(consts) {
				view.runQuery(consts);
			},
			controlAddTableOption: function(treePath) {
				view.addTableOption(treePath);
			},
			controlCurrentTreePath: function() {
				return view.getCurrentTreePath();
			}, 
			controlFieldsStored: function(attributeHandlers) {
				view.fieldsStored(attributeHandlers);
			}
	};

	model.addListener(mlist);
};
