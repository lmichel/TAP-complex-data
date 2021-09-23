"use strict;";
"esversion: 6";

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

/*/ build the table html from data prevously collected /*/

function buildTable(colNames,data,id){
    let header = "<div class=\"table-responsive text-center\"> <table class=\"table table-hover table-dark table-bordered\" data-table-id =" + id + ">";
    let footer =  "</table></div>";
    let body = "<thead data-table-id =" + id + "><tr data-table-id =" + id + ">";

    for (let i =0; i< colNames.length;i++){
        body += "<th scope=\"col\" data-table-id =\"" + id + 
        "\"data-table-row = \"0\" data-table-col =\"" + i + "\">" + colNames[i] + "</th>";
    }

    body += "</tr></thead><tbody data-table-id =" + id + ">";

    for (let i=0;i<data.length;i++){
        body += "<tr data-table-id =" + id + ">";
        for (let j =0;j<data[i].length;j++){
            body += "<td data-table-id =\"" + id + 
            "\"data-table-row = \""+ (i+1) + "\" data-table-col =\"" + j + "\">" + data[i][j] + "</td>";
        }
        body += "</tr>";
    }
    body += "</tbody>";

    return header + body + footer;
}

/*/ gather and transform data to an acceptable format for the buildTable function /*/

async function getTableData(api,table,jointVal){
    if(jointVal !== undefined){
        // we want strings to be quoted or else the query will fail.
        // isNaN alone consider things like empty strings and whitespaces are valid number
        // parseFloat doesn't agree on that so we get a better number detection by adding it
        // parseFloat allow things like 12.5px while isNaN refuse it
        // this may need some improvement over time with valid exemple of failure.
        if(isNaN(jointVal) || isNaN(parseFloat(jointVal))){
            // double quotes don't always work but single ones seems to
            jointVal = "\'" + jointVal + "\'";
        }
    }
    let data = await api.getTableSelectedField(table,jointVal);

    display(data,"codeOutput");

    if(data.status){
        let dataCols = api.getAllSelectedFields(table);
        let subJoint = api.getJoinedTables(table).joined_tables;

        let subTables = Object.keys(subJoint);
        
        for (let i=0;i<data.field_values.length;i++){
            for (let j=0;j<subTables.length;j++){
                data.field_values[i].push(subTables[j] + "'s related data");
            }
        }

        return {
            "status":true,
            "data":{
                "colNames":dataCols,
                "value":data.field_values
            },
            "joints":subJoint,
            "joinedTables":subTables
        };
    }

    return {"status":false};
}

function makeTableHeader(tableName,jointKey,jointVal){
    let head = "<hr><h4 class=\"text-center\" >";
    head += tableName + "</h4>";
    if(jointKey !== undefined){
        head += "<h5 class=\"text-center\" >";
        head += "where " + jointKey + " = " + jointVal;
        head += "</h5>" ;
    }
    return head;
}

/*/ bind all the click event for all the required cell of a given table /*/

function bindTableEvent(api, tableID,data){
    let tableFullID = "table_" + tableID;
    let nextID = "table_" + (tableID+1);

    let joints = data.joints;
    let colNames = data.data.colNames; // columns containing data
    let joinedTables = data.joinedTables; // tables which are joint to the actual main table.

    // we don't want to bind events on the columns containing true data so we start at colNames.length to ignore them
    for (let i=colNames.length;i<joinedTables.length + colNames.length;i++){
        // jquery gather the whole columns with this statement and bind to them the event handler 
        $("[data-table-id='" + tableFullID + "'][data-table-col='"+i+"']").click((cell)=>{
            
            let row = cell.target.dataset.tableRow;
            if(row == 0){
                return; // the 0th row is the row containing columns name ...
            }

            syncIt(async () =>{
                let table = joinedTables[i-colNames.length];
                let joint = joints[table];

                // if we have multiple colmuns of data we need to know which one contains the data we want in order to constrain the subtable.
                let valCol = $("th[data-table-id='" + tableFullID + "'][data-table-row='0']").filter((i,val)=>{
                    return val.textContent ==joint.target;
                }).data("tableCol");

                let jointVal = $("[data-table-id='" + tableFullID + "'][data-table-col='"+valCol+"'][data-table-row='"+row+"']").text();

                // creation and binding of a new sub table
                let data = await getTableData(api,table,jointVal);
                if(data.status){
                    let tableHtml = buildTable(data.data.colNames.concat(data.joinedTables),data.data.value,nextID);
                    if ($("#" + nextID).length == 0){
                        $("#dataHolder").append("<div id = '" + nextID + "'></div>");
                    }
                    $("#" + nextID).html(makeTableHeader(table,joint.from,jointVal) + tableHtml);
                    bindTableEvent(api,tableID+1,data);
                    let offset = 2;
                    // we remove old tables which was generated from the table we are replacing
                    while ($("#table_" + (tableID +offset)).length > 0){
                        $("#table_" + (tableID +offset)).remove();
                        offset++;
                    }
                    
                }
            });
        });
    }
}
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
                display(value,"codeOutput");
                thenFun = async () =>{

                    if (status){

                        /*/ disable all radio buttons so the user can't change their value /*/
                        $("input:radio[name=radio]").attr("disabled",true);
                        $("label[name=radioLabel]").each((i,btn)=>{
                            disableButton(btn.id);
                        });

                        enableButton("btnApiDisconnect");

                        // create and bind the main table
                        let root = api.getConnector().connector.service.table;
                        let rootData = await getTableData(api,root);

                        if (rootData.status){
                            let table = buildTable(rootData.data.colNames.concat(rootData.joinedTables),rootData.data.value,"table_1");
                            
                            $("#dataHolder").append("<div id = \"table_1\"></div>");
                            $("#table_1").html(table);

                            bindTableEvent(api,1,rootData);
                        }
                    }
                };
            });

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
        });

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