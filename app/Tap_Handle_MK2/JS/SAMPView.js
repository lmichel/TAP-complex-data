class SAMPView{
    constructor(sampIndicator){
        this.listener = {};
        this.sampClients = undefined;
        this.sampIndicator = sampIndicator;
        sampIndicator.click(()=>this.toggleSamp());
        this.modal = ModalInfo.info('dummy','Samp Info');
        this.modal.hide();
        this.modalHolder = $("#modal_" + ModalInfo.counter);
        this.modalOpen = false;
        this.modalType = "";
    }

    addListener(listener){
        this.listener = listener;
    }

    isConnected(){
        return this.listener !== undefined && this.listener.controlIsConnected();
    }

    showHubError(message){
        console.error(message);
        if(!SAMPView.NOHUB_REGEXP.test(message)) {
			return;
		}
        this.SAMPOff();
		this.showHubLauncher();
		setTimeout(this.SAMPOn.bind(this), SAMPView.REGISTERDELAY);
    }

    showHubLauncher(){
        if(!this.modalOpen || this.modalType == "hubLauncher"){
            this.modalOpen = true;
            this.modalType = "hubLauncher";
            this.modal.show();
        }
        
    }

    SAMPOff(){
        this.listener.controlUnregisterToHub();
        this.sampIndicator.removeClass("sampOn");
        this.sampIndicator.addClass("sampOff");
    }

    SAMPOn(){
        if(this.listener.controlRegisterToHub().HubRunning){
            this.sampIndicator.addClass("sampOn");
            this.sampIndicator.removeClass("sampOff");
        } else {
            setTimeout(this.registerToHub, SAMPView.REGISTERDELAY);
        }
    }


    toggleSamp(){
        if(this.isConnected()){
            this.SAMPOff();
        }else{
            this.SAMPOn();
        }
    }

    displayTable(attributesHandlers){
        console.log(attributesHandlers);
    }

    showTrackerReply(id,type,data){
        // Hub is not considered as a SAMP client
		if (!id || id.match(/hub/i)) {
			return;
		}
        if (action == "unregister") {
			if (this.sampClients[id]) {
				delete this.sampClients[id];
				removed = id;
			}
		} else {
			if (!sampClients[id]) {
				this.sampClients[id] = {};
			}
			if (action == "meta") {
				this.sampClients[id].meta = data;
			} 
			// Only accept to deal with clients accepting VOtable
            //TODO : deal with FITS ?
			else if (action == "subs") {
				if (/*data["table.load.fits"] &&*/ data["table.load.votable"] ){  //&&  data["coord.pointAt.sky"] ) for casssis 
					this.sampClients[id].subs = data;
				} else {
					delete this.sampClients[id];
				}
			}
		}

        this.updateClientList();

    }
}

SAMPView.NOHUB_REGEXP = new RegExp(/no\s+hub/i);
SAMPView.REGISTERDELAY = 2000;

SAMPView.HUBS = {
    "topcat": {
        webStartUrl : "http://www.star.bris.ac.uk/~mbt/topcat/topcat-full.jnlp",
        iconUrl : "http://www.star.bris.ac.uk/~mbt/topcat/images/tc_sok.png",
        webUrl : "http://www.star.bris.ac.uk/~mbt/topcat/",
        description : "Tool for Operations on Catalogues And Tables"
    },
    "aladin": {
        webStartUrl : "http://aladin.u-strasbg.fr/java/nph-aladin.pl?frame=get&id=aladin.jnlp",
        iconUrl : "http://aladin.u-strasbg.fr/aladin_large.gif",
        webUrl : "http://aladin.u-strasbg.fr/",
        description : "The Aladin sky atlas and VO Portal"
    },
    "cassis": {
        webStartUrl : "http://cassis.irap.omp.eu/online/cassis.jnlp",
        iconUrl : "http://saada.unistra.fr/taphandle/images/cassis.png",
        webUrl : "http://cassis.irap.omp.eu/",
        description : "CASSIS is able to retrieve some useful informations for the modeling or identification from databases"
    },
};
