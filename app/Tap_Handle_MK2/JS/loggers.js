class TreeSBLogger extends MyLogger {

    constructor(div){
        super(div);
        this.statusIconMap={
            "info":"./images/info.png",
            "ok":"./images/check.png",
            "error":"./images/red.png",
        };
    }

    log(...log) {
        let out = this.split(...log);
        if(out.text.length>0){
            console.log(out.text);
        }
        if(out.objects.length>0){
            console.log(out.objects);
        }
    }
    info(...log){
        let out = this.split(...log);
        if(out.text.length>0){
            this.div.html("<div class='cv-spinner'><span class='spinner' title='" + out.text +"'></span></div>");
        }
        if(out.objects.length>0){
            this.log(out.objects);
        }
    }
    status(statusText,statusType){
        this.div.html("<img style='background-position: center center;background-size: auto;background-repeat:no-repeat;vertical-align: top;height:100%;width:100%' src='" +
            this.statusIconMap[statusType]+"' title='" + statusText +"'></img>");
    }
}

TreeSBLogger.STATUS_OK = "ok";
TreeSBLogger.STATUS_INFO = "info";
TreeSBLogger.STATUS_ERROR = "error";