
WebSamp_mvC = function(view,model){
	/**
	 * listen to the view
	 */

	var vlist = {
			controlIsConnected: function(){
				return model.isConnected();
			},
			controlRegisterToHub: function(){
				return  model.registerToHub();
			},
			controlUnregisterToHub: function(){
				return model.unregisterToHub();
			},
			controlIsHubRunning: function(){
				model.isHubRunning();
			},
			controlSendFileToClient: function(target, message){
				model.sendMessageToClient(target, message);
			},
			controlSendUrlToClient: function(target, message){
				model.sendMessageToClient(target, message);
			},
			controlSkyatToClient: function(target, message){
				model.sendMessageToClient(target, message);
			}
	};

	view.addListener(vlist);

	var mlist = {
			controlTrackerReply: function(id, type, data){
				view.showTrackerReply(id, type, data);
			},
			controlHubError: function(message){
				view.showHubError(message);
			},
			isInit : function(attributesHandlers){
				view.displayTable(attributesHandlers);
			}
	};

	model.addListener(mlist);
};
