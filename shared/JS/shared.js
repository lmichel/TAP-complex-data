"use strict;";

/*/ Utility function used by all demo pages /*/

class MyLogger extends utils.Logger {
    constructor(div) {
        super();
        this.div = div;
    }
    split(...args){
        let objects = [],text = "";
        for( let i=0;i<args.length;i++){
            if(typeof args[i] === "object"){
                objects.push(args[i]);
            } else if(typeof args[i] === "string"){
                text += args[i];
            } else {
                text += String(args[i]);
            }
        }
        return {objects:objects,text:text};
    }
    log(...log) {
        let out = this.split(...log);
        if(out.text.length>0){
            display(out.text,"querrySend");
        }
        if(out.objects.length>0){
            display(out.objects,"codeOutput");
        }
    }
    info(...log){
        let out = this.split(...log);
        if(out.text.length>0){
            let writing = $("p#logger_text", this.div);
            if (writing.length < 1) {
                this.div.html("<div class='cv-spinner'><span class='spinner'></span> <p id='logger_text'></p></div>");
                writing = $("p#logger_text", this.div);
            }
            writing.html(out.text);
        }
        if(out.objects.length>0){
            display(out.objects,"codeOutput");
        }

    }
}

function display(data, id) {
    let highlight = false;

    // auto converting object
    if (typeof data != "string"){
        highlight = true;
        data = JSON.stringify(data,undefined,4);
    }
    if(data !== undefined){
        // html escaping usefull sometimes.
        data = data.toHtmlSafe();
    }
    

    $("#" + id).html(data);
    try {
        if (highlight)
            hljs.highlightElement(document.getElementById(id));
    }catch(error){}
}

if(!String.prototype.toHtmlSafe){
    String.prototype.toHtmlSafe = function(){
        return this.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };
}

function addClass(elemId,className){
    document.getElementById(elemId).classList.add(className);
}

function removeClass(elemId,className){
    if (document.getElementById(elemId).classList.contains(className)) {
        document.getElementById(elemId).classList.remove(className);
    }
}

function vizierToID(schema){
    let chars = ["'",'"',"(","<","{","\\","/","}",">",")","*","$","^","`","."];
    for (let i=0;i<chars.length;i++){
        schema = utils.replaceAll(schema,chars[i],"");
    }
    return schema;
}

/*/
 * Disable : btn-dark
 * Success : btn-success
 * Enable  : btn-primary
 * Errored : btn-danger
/*/

function disableButton(btnId){
    removeClass(btnId,"btn-primary");
    removeClass(btnId,"btn-success");
    addClass(btnId,"btn-dark");
}

function successButton(btnId){
    removeClass(btnId,"btn-primary");
    removeClass(btnId,"btn-dark");
    addClass(btnId,"btn-success");
}

function enableButton(btnId){
    removeClass(btnId,"btn-dark");
    removeClass(btnId,"btn-success");
    addClass(btnId,"btn-primary");
}

function errorButton(btnId){
    removeClass(btnId,"btn-primary");
    removeClass(btnId,"btn-dark");
    removeClass(btnId,"btn-success");
    addClass(btnId,"btn-danger");
}

function isEnable(btnId){
    return document.getElementById(btnId).classList.contains("btn-primary");
}

function isDisable(btnId){
    return document.getElementById(btnId).classList.contains("btn-dark");
}

function isSuccess(btnId){
    return document.getElementById(btnId).classList.contains("btn-success");
}

function bindClickEvent(elemId,handler,disableText){
    $("#" + elemId).click(() =>{
        try{

            if (!isDisable(elemId)){
                if(handler()){
                    successButton(elemId);
                }
            } else if (disableText === undefined){
                display("This button is currently disabled, you can't use it.", "getStatus");
            } else {
                display(disableText, "getStatus");
            }

        }catch(error){
            console.error(error);
            errorButton(elemId);
            display("An unexpected Error has append see logs for more information", "getStatus");
        }
    });
}

async function syncIt(promise){
    $("#overlay").fadeIn(1);
    try {
        await promise();
    } catch (error) {
        console.error(error);
    }
    $("#overlay").fadeOut(1000);
}


function bindClickAsyncEvent(elemId,handler,disableText){
    $("#" + elemId).click(async() =>{ syncIt( async ()=>{
        try{
            if (!isDisable(elemId)){
                let val = await handler();
                if(val){
                    successButton(elemId);
                }
            } else if (disableText === undefined){
                display("This button is currently disabled, you can't use it.", "getStatus");
            } else {
                display(disableText, "getStatus");
            }

        }catch(error){
            console.error(error);
            errorButton(elemId);
            display("An unexpected Error has append see logs for more information", "getStatus");
        }
    });});
}

/*/ Builds buttons to select between all known TAP services /*/
function buildButtonSelector(holderID){
    let desc = jw.KnowledgeTank.getDescriptors().descriptors;
    for (let shortName in desc){
        $(holderID).append("<input style=\"display: none;\" type=\"radio\" name=\"radio\" id=\"radio_"+ shortName +
            "\" value=\"" + shortName + 
            "\" onclick=\"OnRadioChange(this)\" />");

        $(holderID).append("<label style=\"margin: 0.5em;width: 100%;\" for=\"radio_"+ shortName +
            "\" class=\"btn btn-primary\" id=\"label_"+ shortName +
            "\" name=\"radioLabel\">"+ shortName +
            "</label>");
    }

}