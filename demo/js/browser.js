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

function buildTable(colNames,data,id){
    let header = "<div class=\"table-responsive text-center\"> <table class=\"table table-hover table-dark table-bordered\" data-table-id =" + id + ">";
    let footer =  "</table></div>";
    let body = "<thead data-table-id =" + id + "><tr data-table-id =" + id + ">";

    for (let i =0; i< colNames.length;i++){
        body += "<th scope=\"col\" data-table-id =\"" + id + 
        "\"data-table-row = \"0\" data-table-col =\"" + i + "\">" + colNames[i] + "</th>"
    }

    body += "</tr></thead><tbody data-table-id =" + id + ">"

    for (let i=0;i<data.length;i++){
        body += "<tr data-table-id =" + id + ">"
        for (let j =0;j<data[i].length;j++){
            body += "<td data-table-id =\"" + id + 
            "\"data-table-row = \""+ (i+1) + "\" data-table-col =\"" + j + "\">" + data[i][j] + "</td>"
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
                                let root = api.getConnector().connector.service["table"];
                                let colNames = api.getAllSelectedRootField(root);

                                let joinedTables = api.getJoinedTables(root).joined_tables;
                                let tables = Object.keys(joinedTables);

                                for (let i=0;i<rootIds.field_ids.length;i++){
                                    for (let j=0;j<tables.length;j++){
                                        rootIds.field_ids[i].push(tables[j] + "'s related data")
                                    }
                                }

                                let table = buildTable(colNames.concat(tables),rootIds.field_ids,"table_1")
                                
                                $("#dataHolder").append("<div id = \"table_1\"></div><div id = \"table_2\"></div>");
                                $("#table_1").html(table);

                                for (let i=colNames.length;i<tables.length + colNames.length;i++){
                                    $("[data-table-id='table_1'][data-table-col='"+i+"']").click((cell)=>{
                                        syncIt(async () =>{
                                            let row = cell.target.dataset["tableRow"];
                                            if(row == 0){
                                                return; // the 0th row is the row containing columns name ...
                                            }
                                            let table = tables[i-colNames.length];
                                            let joint = joinedTables[table];

                                            let valCol = $("th[data-table-id='table_1'][data-table-row='0']").filter((i,val)=>{
                                                return val.textContent ==joint.target;
                                            }).data("tableCol");

                                            let jointVal = $("[data-table-id='table_1'][data-table-col='"+valCol+"'][data-table-row='"+row+"']").text();

                                            let data = await api.getTableQueryIds(table,jointVal);

                                            display(data,"codeOutput")

                                            if(data.status){
                                                let dataCols = api.getAllSelectedRootField(table);
                                                let subJoint = api.getJoinedTables(table)
                                                
                                                subJoint=subJoint.joined_tables
                                                let subTables = Object.keys(subJoint);
                                                
                                                for (let i=0;i<data.field_values.length;i++){
                                                    for (let j=0;j<subTables.length;j++){
                                                        data.field_values[i].push(subTables[j] + "'s related data")
                                                    }
                                                }

                                                let tableHtml = buildTable(dataCols.concat(subTables),data.field_values,"table_2");
                                                $("#table_2").html(tableHtml);
                                            }
                                        });
                                    });
                                }
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