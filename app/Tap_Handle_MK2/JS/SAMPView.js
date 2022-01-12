class SAMPView{
    constructor(sampIndicator){
        let that  = this;

        this.listener = {};
        this.sampClients = {};
        this.sampIndicator = sampIndicator;
        this.modal = ModalInfo.info('dummy','Samp Info',false);
        this.modalHolder = $("#modal_" + ModalInfo.counter);
        $(".modal-content",this.modalHolder).append("<div class='modal-footer'></div>");
        this.modalHolder.on("hide.bs.modal",()=>{
            that.modalOpen = false;
            if(that.isConnected()){
                that.mode = SAMPView.JUSTCONNECT;
            } else {
                that.mode = SAMPView.SLEEPING;
            }
        });
        
        this.modalOpen = false;
        this.modalType = "";
        this.mode = SAMPView.SLEEPING;
        this.last = undefined;
        
        sampIndicator.click(()=>{that.toggleSamp();});
    }

    addListener(listener){
        this.listener = listener;
    }

    isConnected(){
        return this.listener !== undefined && this.listener.controlIsConnected();
    }

    showHubError(message){
        if(!SAMPView.NOHUB_REGEXP.test(message)) {
			return;
		}
        this.SAMPOff();
        if(this.mode != SAMPView.SLEEPING){
            this.showHubLauncher();
            // we plan to try to connect again only if we haven't already planned this.
            if(this.last === undefined || this.last.timedOut){
                this.last = utils.Timeout(this.SAMPOn.bind(this),SAMPView.REGISTERDELAY);
            }
        }
    }

    showHubLauncher(){
        if(!this.modalOpen || this.modalType !== "hubLauncher"){
            this.modalOpen = true;
            this.modalType = "hubLauncher";

            $(".modal-body",this.modalHolder).html(
                "<h3>No running SAMP hub detected</h3>" +
                "<p>You need to start a hub before to export data towards VO clients<br>" +
                'You can either run it by hand or by clicking on one icon below.<br>' + 
				'If the applcation doesn\'t start, make sure that Java '+ 
				'<a target="_blank" href="http://www.java.com/fr/download/faq/java_webstart.xml">Web Start</a> ' + 
                'is properly installed on your machine.</p>'
            );
            let hub;
            let list = "";
            for ( let hubName in SAMPView.HUBS) {
                hub = SAMPView.HUBS[hubName];
                list += "<a href='#' onclick=PageLocation.changeLocation('"+
                        hub.webStartUrl +
                        "');><img class=clickableicon align=middle style='height: 32px; border: 0ps;' src='" +
                        hub.iconUrl +  "'></a>" + "<span class=help> <b>" +
                        hubName + "</b> " + hub.description +
                        " </span><a style='font-color: blue; font-size: small; font-style: italic;' target=_blank href='" +
                        hub.webUrl + "'>read more...</a><br>";
            }
            $(".modal-body",this.modalHolder).append(list);
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
        }
    }


    toggleSamp(){
        if(this.isConnected()){
            this.SAMPOff();
        }else{
            this.mode = SAMPView.JUSTCONNECT;
            this.SAMPOn();
        }
    }

    displayTable(attributesHandlers){
        console.log(attributesHandlers);
    }

    showTrackerReply(id,action,data){
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
			if (!this.sampClients[id]) {
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
        if (this.mode == SAMPView.SENDDATA){
            this.updateClientList();
        }
    }
}

SAMPView.NOHUB_REGEXP = new RegExp(/no\s+hub/i);
SAMPView.REGISTERDELAY = 2000;

SAMPView.SLEEPING    = 0;
SAMPView.JUSTCONNECT = 1;
SAMPView.SENDDATA    = 2;

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
