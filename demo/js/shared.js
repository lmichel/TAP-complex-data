"use strict";

/*/ Utility function used by all demo pages /*/

function display(data, id) {
    let highlight = false
    if (typeof data != "string"){
        data = JSON.stringify(data,undefined,4);
        if (hljs){
            highlight = true;
        }
    }
    $("#" + id).html(data);
    if(highlight){
        hljs.highlightElement(document.getElementById(id));
    }
}

function addClass(elemId,className){
    document.getElementById(elemId).classList.add(className);
}

function removeClass(elemId,className){
    if (document.getElementById(elemId).classList.contains(className)) {
        document.getElementById(elemId).classList.remove(className);
    }
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
            console.error(error)
            errorButton(elemId)
            display("An unexpected Error has append see logs for more information", "getStatus");
        }
    })
}

async function syncIt(promise){
    $("#overlay").fadeIn(1);
    try {
        await promise()
    } catch (error) {
        console.error(error);
    }
    $("#overlay").fadeOut(1000)
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
            console.error(error)
            errorButton(elemId)
            display("An unexpected Error has append see logs for more information", "getStatus");
        }
    })});
}