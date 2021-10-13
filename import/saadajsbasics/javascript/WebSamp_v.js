
WebSamp_mVc = function() {
	/*
	 * debug on
	 */
	
	Out.debugModeOn();
	
	var that = this;
	/**
	 * who is listening to us?
	 */
	var listener = null;
	/**
	 * add a listener to this view
	 */
	var addListener = function(list) {
		listener = list;
	};
	/*
	 * used to transform local URLs in full URLs
	 */
	//if (typeof rootUrl != 'undefined') 
	var rootUrl = "http://" + window.location.hostname +  (location.port?":"+location.port:"") + "/" + window.location.pathname.split( '/' )[1] + "/";
	/*
	 * list of connected clients updated by model notifications
	 */
	var sampClients = new Object(); 
	
	var hubs = new Array();
	hubs["topcat"] = {
			webStartUrl : "http://www.star.bris.ac.uk/~mbt/topcat/topcat-full.jnlp",
			iconUrl : "http://www.star.bris.ac.uk/~mbt/topcat/images/tc_sok.png",
			webUrl : "http://www.star.bris.ac.uk/~mbt/topcat/",
			description : "Tool for Operations on Catalogues And Tables"
	};
	hubs["aladin"] = {
			webStartUrl : "http://aladin.u-strasbg.fr/java/nph-aladin.pl?frame=get&id=aladin.jnlp",
			iconUrl : "http://aladin.u-strasbg.fr/aladin_large.gif",
			webUrl : "http://aladin.u-strasbg.fr/",
			description : "The Aladin sky atlas and VO Portal"
	};
	hubs["cassis"] = {
			webStartUrl : "http://cassis.irap.omp.eu/online/cassis.jnlp",
			iconUrl : "http://saada.unistra.fr/taphandle/images/cassis.png",
			webUrl : "http://cassis.irap.omp.eu/",
			description : "CASSIS is able to retrieve some useful informations for the modeling or identification from databases"
	};
	/*
	hubs["splat"] = {
			webStartUrl : "http://soft.g-vo.org/splat-beta/splatvo/splat.jnlp",
			iconUrl : "http://soft.g-vo.org/splat-beta/splat.png",
			webUrl : "http://www.g-vo.org/pmwiki/About/SPLAT",
			description : ""			
	};*/
	/*
	 * Internal flags
	 */
	var waitForHub = false;
	var modalOpen = false;
	var requete = new Object();
	/*
	 * Initiate the div receiving any information from SAMP model
	 */
	var sampModalId = "sampModalId";
	/*
	 * Connection mode: avoid to open the send messaqe window when the user just want to connect the hud
	 */
	var JUSTCONNECT = 1;
	var SENDDATA    = 2;
	var SLEEPING    = 0;
	var mode        = SLEEPING;
	/*
	 * Avoid flooding the hub with multiple connection attemps
	 */
	var lastAttempt = Date.now();
	var REGISTERDELAY = 2000;
	var NOHUB_REGEXP = new RegExp(/no\s+hub/i);
	/*
	 * Methods handling the content of the modal box
	 */
	var getElement = function(eleSuffix) {
		/*
		 * Make sure we are working on the div attached to this view. Its content
		 * is duplicated in the dialog panel and the selectors are lost, 2 hours waste
		 */
		return $('#' + sampModalId + 'Container #'  + sampModalId + eleSuffix);
	};
	var setLoadIcon = function() {
		Processing.show("Talking with the HUB");
//		$('#' + sampModalId + 'Icon').attr("src",
//		"images/ajax-loader.gif");
	};
	var setIvoaIcon = function() {
		Processing.hide();
//		$('#' + sampModalId + 'Icon')
//		.attr("src", "images/ivoa.jpg");
	};
	var setTitle = function(title) {
		getElement('Title ').text(title);
	};
	var setHelp = function(text) {
		getElement('Help').html(text);
	};
	var setPostHelp = function(text) {
		getElement('PostHelp').html(text);
	};
	var addItem = function(text) {
		getElement('ItemList').append(
				"<li>" + text + "</li>");
	};
	var removeAllItems = function() {
		getElement('ItemList').empty();
	};
	var openModalWithClose = function() {
		if (modalOpen == false) {
			modalOpen = true;			
		}
		if( mode != SLEEPING){
		Modalinfo.dataPanel("Samp Info"
				, getElement('').html()
				, function() {
					WebSamp_mVc.fireCloseModal();
				});}
	};
	/*************************************************************************************************
	 * Information display out (private)
	 */
	var makeUrlAbsolute = function (url){
		if( !url.match(/https?:\/\// ) ) {
			return rootUrl + "/" + requete.param;
		} else {
			return url;
		}
	} ;
	var showConnectionOff = function() {
		$("#sampIndicator").attr("class", "sampOff");
	};
	var showConnectionOn = function() {
		$("#sampIndicator").attr("class", "sampOn");
	};
	var showClientList = function(callback) {
		Out.debug("showClientList");
		setIvoaIcon();
		setTitle("Available SAMP Clients");
		setHelp('Below is the list of SAMP clients accepting data<br>\n'
				+ '- Click on the icon of the client you want to send data.<BR>'
				+ '- Click on the broadcast icon if you want your data to be sent to all clients.');
		setPostHelp('');
		removeAllItems();				
		var callback = (requete.type == "oid" )     ? "WebSamp_mVc.fireSendFileToClient"
				      :(requete.type == "voreport") ? "WebSamp_mVc.fireSendUrlToClient"
					  :(requete.type == "skyat")    ? "WebSamp_mVc.fireSendSkyatToClient"
					  :(requete.type == "script")   ? "WebSamp_mVc.fireSendAladinScript"
					  : "";
		var found = false;
		for (ident in sampClients) {
			found = true;
			if (sampClients[ident].meta && sampClients[ident].subs) {
				var meta = sampClients[ident].meta;

				var onclick = (callback == "")? "Modalinfo.info(&quot;No message to send&quot;);"
						: callback + "(\"" +  ident + "\");";
				// the icon send by the hub doens't works so we upload our icon
				if(meta["samp.name"] == "Cassis"){
					meta["samp.icon.url"] = "http://saada.unistra.fr/taphandle/images/cassis.png";
					meta["home.page"] = "http://cassis.irap.omp.eu/";
				}
				else if(meta["samp.name"] == "splat"){
					meta["home.page"] = "http://star-www.dur.ac.uk/~pdraper/splat/index.html";
				}
				
				
				addItem("<img class=clickableicon align=bottom style='height: 32px; border: 0px;' src='"
						+ meta["samp.icon.url"]
						+ "' onclick='" + onclick + "'>"
						+ "<span class=help> <b>"
						+ meta["samp.name"]
						+ "</b> "
						+ meta["samp.description.text"]
						+ " </span><a style='font-color: blue; font-size: small; font-style: italic;' target=_blank href='"
						+ meta["home.page"] + "'>read more...</a>");
			}
		}
		if (found) {
			addItem("<a class=sampOn "
					+ " onclick='" + callback + "(null);'></a>"
					+ "<span class=help> <b>Broadcast</b> to any client");
			openModalWithClose();
		} else {
			fireCloseModal();
			Modalinfo.info("No SAMP Clients Available: Is your Hub still running?");			
			if (fireIsConnected()) showConnectionOff();

		}
	};
	var processOrShowClientList = function(callback) {
		var cpt=0;
		var loneIdent="";
		for (var ident in sampClients) {
			cpt++;
			loneIdent = ident;
		}
		if( cpt == 1) {
			if(requete.type == "oid" ){
				WebSamp_mVc.fireSendFileToClient(loneIdent);
			} else if(requete.type == "voreport") {
				WebSamp_mVc.fireSendUrlToClient(loneIdent);
			} else if( requete.type == "skyat") {
				WebSamp_mVc.fireSendSkyatToClient(loneIdent);
			} else if( requete.type == "script"){
				WebSamp_mVc.fireSendAladinScript(loneIdent);
			}
			return;
		}
		Out.debug("showClientList");
		setIvoaIcon();
		setTitle("Available SAMP Clients");
		setHelp('Below is the list of SAMP clients accepting data<br>\n'
				+ '- Click on the icon of the client you want to send data.<BR>'
				+ '- Click on the broadcast icon if you want your data to be sent to all clients.');
		setPostHelp('');
		removeAllItems();				
		var callback = (requete.type == "oid" )? "WebSamp_mVc.fireSendFileToClient"
			      :(requete.type == "voreport") ? "WebSamp_mVc.fireSendUrlToClient"
				  :(requete.type == "skyat") ?"WebSamp_mVc.fireSendSkyatToClient"
				  :(requete.type == "script") ?"fireSendAladinScript"
				  : "";
		var found = false;
		for (var ident in sampClients) {
			found = true;
			if (sampClients[ident].meta && sampClients[ident].subs) {
				var meta = sampClients[ident].meta;

				var onclick = (callback == "")? "Modalinfo.info(&quot;No message to send&quot;);"
						: callback + "(\"" +  ident + "\");";

				addItem("<img class=clickableicon align=bottom style='height: 32px; border: 0px;' src='"
						+ meta["samp.icon.url"]
						+ "' onclick='" + onclick + "'>"
						+ "<span class=help> <b>"
						+ meta["samp.name"]
						+ "</b> "
						+ meta["samp.description.text"]
						+ " </span><a style='font-color: blue; font-size: small; font-style: italic;' target=_blank href='"
						+ meta["home.page"] + "'>read more...</a>");
			}
		}
		if (found) {
			addItem("<a class=sampOn "
					+ " onclick='" + callback + "(null);'></a>"
					+ "<span class=help> <b>Broadcast</b> to any client");
			openModalWithClose();
		} else {
			fireCloseModal();
			Modalinfo.info("No SAMP Clients Available: Is your Hub still running?");			
			if (fireIsConnected()) showConnectionOff();

		}
	};

	var showHupLauncher = function() {
		Out.debug("showHupLauncher");
		setIvoaIcon();
		setTitle("No running SAMP hub detected");
		setHelp('You need to start a hub before to export data towards VO clients<br> \n'
				+ 'You can either run it by hand or by clicking on one icon below.<br>'
				+ 'If the applcation doesn\'t start, make sure that Java <a target="_blank" href="http://www.java.com/fr/download/faq/java_webstart.xml">Web Start</a> '
				+ 'is properly installed on your machine.');
		setPostHelp('IMPORTANT: Once the hub is running, click on the <span style="diplay: inline-block;width: 23px"><a href="#" class="dlivoalogo"></a>icon</span>  again to send data\n');
		removeAllItems();
		for ( var h in hubs) {
			var hub = hubs[h];
			addItem("<a href='#' onclick=WebSamp_mVc.fireLaunchHub('"
					+ h
					+ "','"
					+ hub.webStartUrl
					+ "');><img class=clickableicon align=middle style='height: 32px; border: 0ps;' src='"
					+ hub.iconUrl
					+ "'></a>"
					+ "<span class=help> <b>"
					+ h
					+ "</b> "
					+ hub.description
					+ " </span><a style='font-color: blue; font-size: small; font-style: italic;' target=_blank href='"
					+ hub.webUrl + "'>read more...</a>");
		}
		openModalWithClose();
	};

	/**************************************************************
	 * Methods handling messages (private)
	 */
	var fireRegisterToHub = function() {
		waitForHub = !listener.controlRegisterToHub().HubRunning;
	};

	/**************************************************************
	 * Methods invoked by the controller (public)
	 */		
	var fireCloseModal = function() {
		if( modalOpen ) {
			modalOpen = false;
			waitForHub = false;
			mode = SLEEPING;
			Modalinfo.close();
		}
	};
	var fireSendOid = function(oid, mtype, displayName) {
		Out.info("Send OID " + oid);
		mode = SENDDATA;
		requete = {type: "oid", param: oid};			
		if (!fireIsConnected()) {
			fireRegisterToHub();
		} else {
			var cpt=0;
			/*
			 * If more than one client: propose a choice window
			 */
			for (ident in sampClients) {
				cpt++;
				showClientList();
				return ;
			}
			showClientList();
		}
	};
	/*
	 * Closely bind to Saada
	 */
	var fireSendFileToClient = function(target) {
		mode = SENDDATA;
		var oid = requete.param;
		var url = rootUrl + "download?oid=" + oid;
		var urlinfo = "getproductinfo?url=" + encodeURIComponent(url);
		$.getJSON(urlinfo,function(data) {
			var ContentType = data.ContentType;
			var fileName = data.ContentDisposition;
			var results = /.*filename=(.*)$/.exec(data.ContentDisposition);
			if( results == null ) {
				fileName = "3XMMDataFile";
			} else {
				fileName = results[1].replace(/"/g, '');
			}
			var mtype = (ContentType.match(/fits/i) )? "table.load.fits": "table.load.votable";
			var message = new Object();
			message["samp.mtype"] = mtype;
			message["samp.params"] = {'table-id': oid, url:url, name: fileName};
			Processing.showAndHide("File sent to SAMP "+  JSON.stringify(message));
			listener.controlSendFileToClient(target, message); 
			fireCloseModal();
		});
	};
	var fireSendAladinScript = function(script) {		
		if (!fireIsConnected()) {
			fireRegisterToHub();
		} else {
			requete = {type: "script", param: script};			
			mode = SENDDATA;
			var mtype = "script.aladin.send";
			var message = new Object();
			message["samp.mtype"] = mtype;
			message["samp.params"] = {"script": script};
			Processing.showAndHide("Script sent to Aladin "+  JSON.stringify(message));
			listener.controlSendFileToClient(null, message); 
			fireCloseModal();
		}

	};
	var fireSendVoreport = function(reportUrl, mtype, name) {
		mode = SENDDATA;
		requete = {type: "voreport"
			, param: reportUrl
			, mtype: (mtype == null)?null: mtype
			, name: (name == null)?null: name};			
		Out.info("Send report" + JSON.stringify(requete));
		if (!fireIsConnected()) {
			fireRegisterToHub();
		} else {
			var cpt=0;
			/*Out.debug(
			 * If more than one client: propose a choice window
			 */
			for (ident in sampClients) {
				cpt++;
			}
			if( cpt > 1){
				showClientList();
			} else {
				fireSendUrlToClient(null);
			}
		}
	};
	var fireSendUrlToClient = function(target) {
		mode = SENDDATA;
		var reportUrl = makeUrlAbsolute(requete.param);

		var message = new Object();
		var rn ;
		if( requete.name == null ) {
			if( requete.param.match(/.*\.fit.*/i) ) {
				rn = "table.load.fits";
			} else {
				rn = "table.load.votable";
			}
		} else{
			rn = requete.name;
		}
		message["samp.mtype"] = (requete.mtype == null)? "table.load.votable": requete.mtype;
		message["samp.params"] = {
				'table-id': rn
				, url:reportUrl
				, name: rn};
		Processing.showAndHide("URL sent to SAMP " +  JSON.stringify(message).replace(/,/g, ",<br>"));
		listener.controlSendUrlToClient(target, message); 
		fireCloseModal();
	};

	var fireSendSkyat = function(ra, dec) {
		mode = SENDDATA;
		Out.info("Send SkyAt " + ra + " " +  dec );
		requete = {type: "skyat", param: {ra: ra, dec: dec}};			
		if (!fireIsConnected()) {
			fireRegisterToHub();
		} else {
			var cpt=0;
			for (ident in sampClients) {
				cpt++;
			}
			if( cpt > 1){
				showClientList();	
			} else {
				fireSendSkyatToClient(null);
			}
		}
	};	
	var fireSendSkyatToClient = function(target) {
		mode = SENDDATA;
		Out.info("Send SkyAt to Client " + target );
		var message = new Object();
		message["samp.mtype"] = "coord.pointAt.sky";
		message["samp.params"] = {ra: String(requete.param.ra), dec: String(requete.param.dec)};
		Processing.showAndHide("Sky position sent to SAMP");
		listener.controlSkyatToClient(target, message);
		fireCloseModal();
	};
	var fireRegisterToHubAttempt = function() {
		var t = Date.now();
		if( (t - lastAttempt) < REGISTERDELAY ) {
			return
		}
		if (mode != SLEEPING && waitForHub && modalOpen ) {
			Out.debug("attempt " + waitForHub );
			fireRegisterToHub();
			lastAttempt = t;
			setTimeout("WebSamp_mVc.fireRegisterToHubAttempt();", REGISTERDELAY);
		} else {
			waitForHub = false;
			if( mode == JUSTCONNECT) {
				fireCloseModal();				
			}
		}
	};
	var fireUnregister = function() {
		if (fireIsConnected()) {
			Out.debug("unregister");
			listener.controlUnregisterToHub();
			showConnectionOff();
		} else {
			Modalinfo.info("Not registered");
		}
	};
	var fireJustConnect = function() {
		mode = JUSTCONNECT;
		if (!fireIsConnected()) {
			fireRegisterToHub();
//			if (!fireIsConnected()) {
//			showHupLauncher();
//			}

		} else {
			fireUnregister();
		}
	};
	var fireIsConnected = function() {
		var retour = listener.controlIsConnected();
		if (retour) {
			showConnectionOn();
		} else {
			showConnectionOff();
		}
		return retour;
	};
	var fireIsHubRunning = function() {
		listener.controlIsHubRunning();
	};
	var showTrackerReply = function(id, action, data) {
		Out.debugModeOn();
		Out.debug("showTrackerReply " + id + " " +action);
		Out.debug("data : " + JSON.stringify(data));
		waitForHub = false;
		showConnectionOn();
		var removed = "";
		var completed = "";
		// Hub is not considered as a SAMP client
		if (!id || id.match(/hub/i)) {
			return;
		}
		if (action == "unregister") {
			if (sampClients[id]) {
				delete sampClients[id];
				removed = id;
			}
		} else {
			if (!sampClients[id]) {
				Out.debug("new client, id : " + id);
				sampClients[id] = new Object();
			}
			if (action == "meta") {
				sampClients[id].meta = data;
			} 
			// Only accept to deal with clients accepting VOtable or FITS
			else if (action == "subs") {
				Out.debug("try to sub client " + data["samp.name"]);
				if (data["table.load.fits"] && data["table.load.votable"] ){  //&&  data["coord.pointAt.sky"] ) for casssis 
					sampClients[id].subs = data;
					Out.debug("sub successful");
				} else {
					delete sampClients[id];
					Out.debug("sub fail");
				}
			}
			if (sampClients[id] && sampClients[id].meta && sampClients[id].subs)
				completed = id;
		}
		/*
		 * Display the client list only if it has changed and if its
		 * content is complete
		 */
		if (mode == SENDDATA && (removed != "" || completed != "") ) {
			showClientList();
		}
	};
	var showHubError = function(message) {
		Out.debug("showHubError " + message + " " + NOHUB_REGEXP.test(message));
		if( NOHUB_REGEXP.test(message) == false) {
			return
		}
		waitForHub = true;
		showConnectionOff();
		setIvoaIcon();
		showHupLauncher();
		setTimeout(WebSamp_mVc.fireRegisterToHubAttempt, REGISTERDELAY);
	};		
	var fireLaunchHub = function(name, url) {
		setLoadIcon();
		PageLocation.changeLocation(url);
		setIvoaIcon();
	};
	var init = function(name, url, description){
		/*
		 * Must be done from $.ready, once  document.body is complete 
		 */
		$(document.body).append(
				"<div id=" + sampModalId + "Container>"
				+ "<div id="
				+ sampModalId
				+ " style='width: 99%; display: none;'>"
				+ '<a id="' // dummy a just to have the image referenced by the css
				+ sampModalId
				+ 'Icon" class="ivoalogo"></a>'
				+ '<span id='
				+ sampModalId
				+ 'Title style="display: inline; font-size: 1.5em;font-weight: bold;"> TITLE</span><BR>'
				+ '<div><ul id=sampClientListItems></ul></div>'
				+ '<span id=' + sampModalId
				+ 'Help class=help></span>'
				+ '<ul id=' + sampModalId
				+ 'ItemList></ul>' + '<span id='
				+ sampModalId
				+ 'PostHelp class=help></span>'
				+ "</div>"
				+ "</div>"
		);
		new WebSamp_mvC(WebSamp_mVc, new WebSamp_Mvc(name, url, description));	
	};

	/* Exports. */
	var jss = {};
	jss.init = init;
	jss.fireCloseModal = fireCloseModal;
	jss.fireSendOid = fireSendOid; //
	jss.fireSendFileToClient = fireSendFileToClient;
	jss.fireSendVoreport = fireSendVoreport;
	jss.fireSendUrlToClient = fireSendUrlToClient;
	jss.fireSendAladinScript = fireSendAladinScript;
	jss.fireSendSkyat = fireSendSkyat; //
	jss.fireSendSkyatToClient = fireSendSkyatToClient;
	jss.fireRegisterToHubAttempt = fireRegisterToHubAttempt;//
	jss.fireUnregister = fireUnregister; //
	jss.fireJustConnect = fireJustConnect;
	jss.fireIsConnected = fireIsConnected; //
	jss.fireIsHubRunning = fireIsHubRunning;//
	jss.showTrackerReply = showTrackerReply; //
	jss.showHubError = showHubError;
	jss.fireLaunchHub = fireLaunchHub;
	jss.addListener = addListener;
	return jss;
}();

