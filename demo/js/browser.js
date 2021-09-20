"use strict;"

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

function buildTable(colNames,data){
    let header = "<div class=\"table-responsive\"> <table class=\"table table-hover table-dark table-bordered\">";
    let footer =  "</table></div>";
    let body = "<thead><tr>";

    for (let i =0; i< colNames.length;i++){
        body += "<th scope=\"col\">" + colNames[i] + "</th>"
    }

    body += "</tr></thead><tbody>"

    for (let i=0;i<data.length;i++){
        body += "<tr>"
        for (let j =0;j<data[i].length;j++){
            if(j ==0){
                body += "<th scope=\"row\">" + data[i][j] + "</th>"
            } else {
                body += "<td>" + data[i][j] + "</td>"
            }
        }
        body += "</tr>"
    }
    body += "</tbody>";

    return header + body + footer;
}


/*/ confined area /*/

{
    /*/ Data storage /*/
        
    let connectorParams = {
        "Simbad" : {
            "tapService" : "http://simbad.u-strasbg.fr/simbad/sim-tap/sync",
            "schema" : "public",
            "table" : "basic",
            "shortName" : "Simbad"
        },
        
        "Gavo" : {
            "tapService" : "http://dc.zah.uni-heidelberg.de/tap/sync",
            "schema" : "rr",
            "table" : "resource",
            "shortName" : "Gavo"
        },

        "CAOM" : {
            "tapService" : "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync",
            "schema" : "dbo",
            "table" : "CaomObservation",
            "shortName" : "CAOM"
        },
        
        "3XMM" : {
            "tapService" : "https://xcatdb.unistra.fr/4xmmdr10/tap/sync",
            "schema" : "EPIC",
            "table" : "EPIC_IMAGE",
            "shortName" : "3XMM"
        },
        
        "Vizier" : {
            "tapService" : "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync",
            "schema" : "metaviz",
            "table" : "METAcat",
            "shortName" : "Vizier"
        }, 
                
        
    };

    let api = new TapApi();

    /*/ Steup of Event handlers functions /*/

    function setupEventHandlers(){
        
        bindClickAsyncEvent("btnApiConnect",async () => {
            
            if (isEnable("btnApiConnect")) {

                let params = connectorParams[$("input:radio[name=radio]:checked")[0].value];
                
                let connect = api.connect(params);
                let status = false;
                connect.catch((reason)=>console.error(reason));

                let thenFun = async ()=> {};

                connect.then( (value) => {
                    status = value.status;
                    thenFun = async () =>{

                        if (status){

                            /*/ disable all radio buttons so the user can't change their value /*/
                            $("input:radio[name=radio]").attr("disabled",true);
                            $("label[name=radioLabel]").each((i,btn)=>{
                                disableButton(btn.id);
                            })

                            enableButton("btnApiDisconnect");

                            let rootIds = await api.getRootQueryIds();

                            display(rootIds,"codeOutput")

                            if (rootIds.status){
                                let colNames = api.getAllSelectedRootField(api.getConnector().connector.service["table"]);
                                let table = buildTable(colNames,rootIds.field_ids);
                                $("#dataHolder").append("<div id = \"table_1\"></div>");
                                $("#table_1").html(table);
                            }

                        }
                    }
                })

                await connect;

                display(""+status , "getStatus");

                await thenFun();

                return status;

            } else {
                display("The service is  already connected ! disconnect the service and try again ...", "getStatus");
            }

        },"no service selected... Choose service first and try again" );

        bindClickEvent("btnApiDisconnect",() => {
            api.disconnect();

            enableButton("btnApiConnect");

            $("input:radio[name=radio]").attr("disabled",false);
            $("label[name=radioLabel]").each((i,btn)=>{
                enableButton(btn.id);
            })

            return false;

        });
        
        bindClickEvent("btnDebug",() => {
            if (document.getElementById("debugContainer").style.display == "block"){
                document.getElementById("debugContainer").style.display = "none";
            }else {
                document.getElementById("debugContainer").style.display = "block";
            }
        });

        /*/ Templates /*/
        /*
        bindClickEvent("",() => {

        });
        */
    }

    $(document).ready(function() {
        // ensure no radio button is check by default
        $("input:radio[name=radio]:checked").prop('checked', false);
        setupEventHandlers();
    });

}