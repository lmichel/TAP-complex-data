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
            $('span',this.div).tooltip();
        }
        if(out.objects.length>0){
            this.log(out.objects);
        }
    }
    status(statusText,statusType){
        this.div.html("<img style='background-position: center center;background-size: auto;background-repeat:no-repeat;vertical-align: top;height:100%;width:100%' src='" +
            this.statusIconMap[statusType]+"' title='" + statusText +"'></img>");
        $('img',this.div).tooltip();
    }
}

TreeSBLogger.STATUS_OK = "ok";
TreeSBLogger.STATUS_INFO = "info";
TreeSBLogger.STATUS_ERROR = "error";

class GlobalLogger extends MyLogger {
    constructor(){
        $("body").prepend("<div id='overlay'><div class='cv-spinner'><span class='spinner' style = 'width: 10em;height: 10em;'></span><p></p></div></div>");
        super($("#overlay"));
        this.text = $("p",this.div);
        this.div.hide();
        this.time = undefined;
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
            if(!this.div.is(":visible")){
                this.div.fadeIn(100);
                this.time = Date.now();
            }
            this.text.html(out.text);
        }
        if(out.objects.length>0){
            this.log(out.objects);
        }
    }
    hide(t=500){
        //avoiding logs that are too short
        if(this.time+1000<Date.now()){
            this.div.fadeOut(t);
        }else{
            setTimeout(()=>{this.div.fadeOut(t);},this.time + 1000 - Date.now());
        }
        
    }
}