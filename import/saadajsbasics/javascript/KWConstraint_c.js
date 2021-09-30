KWConstraint_mvC = function(model, view){
	/**
	 * listen to the view
	 */
	var vlist = {
			controlEnterEvent : function(andor, operator, operand, unit){
				model.processEnterEvent(andor, operator, operand, unit);
			},
			controlRemoveConstRef : function(operator, operand){
				model.processRemoveConstRef(operator, operand);
			},
			controlRemoveFirstAndOr: function(key){
				model.processRemoveFirstAndOr(key);
			},
			controlRemoveAndOr: function(key){
				model.removeAndOr(key);
			},
			controlGetADQL: function(attQuoted){
				return model.getADQL(attQuoted);
			}, 
			controlGetAttributeHandler: function(){
				return model.getAttributeHandler();
			}, 
			controlInit: function(){
				return model.notifyInitDone();
			},
			controlTypoMsg: function(fault, msg){
				return model.notifyTypoMsg(fault, msg);
			},
			controlRunQuery: function(){
				return model.notifyRunQuery();
			}
	};
	view.addListener(vlist);

	var mlist = {
			isInit : function(attributehandler, operators ,andors,range, default_value){
				view.initForm(attributehandler, operators ,andors,range,default_value);
			},
			notifyFault: function(fault){
				view.drawFault(fault);
			},
			controlAhName: function(ah){
				return view.getAhName(ah);
			}
	};
	model.addListener(mlist);
};
