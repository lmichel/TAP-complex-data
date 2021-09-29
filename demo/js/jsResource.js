"use strict;";

/*/ Trigers function for radio button /*/

function OnRadioChange(radio) {
    if (!isSuccess("btnApiConnect")){

        if(isDisable("btnApiConnect")){
            enableButton("btnApiConnect");
        }
        let lastLab=$("label.btn-success[name=radioLabel]")[0];
        if(lastLab !== undefined ){
            enableButton(lastLab.id);
        }
        successButton("label_" + radio.value.toLowerCase());
    }
}

/*/ Builds buttons to select between all known TAP services /*/
function buildButtonSelctor(){
    let desc = (new KnowledgeTank()).getDescriptors().descriptors;
    for (let shortName in desc){
        $("#mainButtonHolder").append("<input style=\"display: none;\" type=\"radio\" name=\"radio\" id=\"radio_"+ shortName +
            "\" value=\"" + shortName + 
            "\" onclick=\"OnRadioChange(this)\" />");

        $("#mainButtonHolder").append("<label style=\"margin: 0.5em;width: 100%;\" for=\"radio_"+ shortName +
            "\" class=\"btn btn-primary\" id=\"label_"+ shortName +
            "\" name=\"radioLabel\">"+ shortName +
            "</label>");
    }

}


$(document).ready(function() {
    buildButtonSelctor();
    // ensure no radio button is check by default
    $("input:radio[name=radio]:checked").prop('checked', false);
    setupEventHandlers();
});