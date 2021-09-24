/**
 * JS file containing all the function used to embed the Tap Complex API in the demo web page.
 */


/*/ Trigers function for radio button /*/

function OnRadioChange(radio) {
    if (!isSuccess("btnApiConnect")){

        if(isDisable("btnApiConnect")){
            enableButton("btnApiConnect");
        }

        display(radio.value + " is now selected click now to the connect button to connect service.", "getStatus");
    } else {
        display("Another database is already in use please disconect it first.", "getStatus");
    }
}

/*/ modal generation /*/

async function selectConstraints(tableName, txtInput,api){
    
    let schema = api.getConnector().connector.service.schema;
    let adql = api.tapServiceConnector.attributsHandler.addAllColumn(tableName, schema);
    let QObject = await api.tapServiceConnector.Query(adql);
    QObject = QObject.answer;
    let dataTable = VOTableTools.votable2Rows(QObject);
    let contentText = QObject.responseText;
    let Field = VOTableTools.genererField(QObject, contentText);
    let nb = Field.length;
    
    let out = "\n" +
        "  <!-- The Modal -->\n" +
        "  <div class=\"modal fade\" id=\"myModal\">\n" +
        "    <div class=\"modal-dialog modal-xl\">\n" +
        "      <div class=\"modal-content\">"+
        "    <div class=\"modal-content\">\n" +
        "      <div class=\"modal-body\">\n"+
        "<span style='text-align: left;font-weight: bold;font-size: x-large;'> Columns of table " + tableName + "</span>" +
        "<button class='delete_right btn btn-danger'  data-dismiss=\"modal\" id='d_right'><i class='fa fa-close ' ></i></button><br></br>";//head
    out += "<table  class = 'table table-bordered table-striped table-hover'  role = 'grid' >";
    out += "<thead class='thead-dark'><tr role='row'>";
    
    for (let j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>";
    let column = 0;
    
    for (let j = 0; j < dataTable.length; j++) {//table  content
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr class = 'odd table-primary' >";
            } else {
                out += "<tr class = 'even table-primary'>";
            }
            out += "<td id = '" + dataTable[j] + "' style='text-align: center;vertical-align:bottom;text-decoration:underline' >" + dataTable[j] + "</td>";
        } else {
            out += "<td style='text-align: center;vertical-align:bottom'>" + dataTable[j] + "</td>";
        }
        column = column + 1;
        if (column == nb) {
            out += "</tr>";
            column = 0;
        }

    }
    out += "</tbody>";
    out += "</table>  </div>";
    out+=    "</div>\n" +
        "      <div class=\"modal-footer\">\n" +
        "        <button type=\"button\" class=\"btn btn-danger\" data-dismiss=\"modal\">Close</button>\n" +
        "      </div>\n" +
        "    </div>\n" +
        "\n" +
        "  </div>\n" +
        "</div>"

    ;//head
    $("body").prepend(out);
    let td = $("td");
    for (let i = 0; i < td.length; i++) {
        $(td[i]).click( () => {
            let id = $(this).attr("id");
            if ($("#" + txtInput).val().length !==1) {
                var content = $("#" + txtInput).val();
                let formatValue = schema+"."+tableName;
                let correctValue = formatValue.quotedTableName().qualifiedName;
                if($("#" + txtInput).val().indexOf(" AND " + correctValue + "." + id)!==-1){
                    alert(id+" already added");
                }else{
                    $("#" + txtInput).val(content + " AND " + correctValue + "." + id + "=");
                    alert(id+" is added to constraint");
                }
            } else {
                let formatValue = schema+"."+tableName;
                let correctValue = formatValue.quotedTableName().qualifiedName;
                $("#" + txtInput).val(correctValue + "." + id + "=");
                alert(id+" is added to constraint");
            }

        });
    }
}

/*/ Button creation for constrain selection /*/

async function createButton(api) {
    let buttons = "";
    let tapButton = [];

    for (let key in (await api.getObjectMapWithAllDescriptions()).tables) {

        buttons = "<span>" + "<button type='button' class=\"btn btn-primary\" " +
            "id='bbb" + key + "' value='" + key + "' name='Cbuttons' style=\"margin-top: 7px\">" +
            "Click to select " + key + " constraints</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='" + key + "' value='" + key + "' style=\"margin-top: 7px\">Click to Join " + key + " constraint</button> " +
            " <input type='text' class='form form-control' id='txt" + key + "' value='' placeholder='Enter condition' name='Cinputs'> </span> <hr>"
        
        tapButton.push(buttons);
        
    }

    $("#loadButton").append(tapButton);

    for (let key in api.tapServiceConnector.objectMapWithAllDescription.tables) {
        bindClickAsyncEvent("bbb" + key,async () => {
            await selectConstraints(key, "txt" + key, api);
            $('#myModal').modal({"backdrop" : "static"});
            return true;
        });

        bindClickEvent(key, () => {
            if($("#txt" + key).val().length > 1){
                let constraint = $("#txt" + key).val().trim();

                /*/ constraint cleanup /*/
                while (constraint.startsWith("AND") || constraint.startsWith("WHERE") || constraint.startsWith("OR")){
                    while (constraint.startsWith("AND")){
                        constraint = constraint.substring(3).trim();
                    }
                    while (constraint.startsWith("WHERE")){
                        constraint = constraint.substring(5).trim();
                    }
                    while (constraint.startsWith("OR")){
                        constraint = constraint.substring(2).trim();
                    }
                }

                let result = api.setTableConstraint(key, constraint);
                if (result.status ){
                    display(result.status,"getStatus");
                    display((api.getRootQuery()).query,"getJsonAll");
                    return true;
                }else{
                    display(result.status,"getStatus");
                    display(JSON.stringify(result.error,undefined,4),"getJsonAll");
                    return false;
                }

            } else {
                return false;
            }
            
        });

    }

}

/*/ Button creation for Handlers /*/

async function createHandlersButton(api){
    let table = api.getConnector().connector.service.table;
    let handlers = await api.getTableAttributeHandlers(table);
    if (handlers.status){
        let buttons = [];
        let map = {};
        
        for (let i=0;i<handlers.attribute_handlers.length;i++){
            buttons.push(
                "<button  type='button' class=\"btn btn-primary\" id='handler_" + 
                handlers.attribute_handlers[i].column_name + "' value='" + 
                handlers.attribute_handlers[i].column_name + "' style=\"margin-top: 7px;width: 100%;\">Click to show " + 
                handlers.attribute_handlers[i].column_name + "'s handler</button> ");

            map["handler_" + handlers.attribute_handlers[i].column_name] = handlers.attribute_handlers[i]
        }

        $("#loadButtonsHandler").append(buttons);

        for (let key in map){
            bindClickEvent(key,() =>{
                display("OK","getStatus");
                display(JSON.stringify(map[key],undefined,4),"getJsonAll");
                return true;
            });
        }
    } else{
        $("#loadButtonsHandler").append( "<button  type='button' class=\"btn btn-primary\" id='handler_error' value='error' style=\"margin-top: 7px\">Click to show status and error</button> ");
        bindClickEvent("handler_error",() =>{
            display(handlers.status + " : " + handlers.message,"getStatus");
        });
    }
    
}

/*/ Button creation for table IDs /*/

async function createTableIDsButton(api){
    let buttons = "";
    let tapButton = [];

    for (let key in (await api.getObjectMap()).object_map.tables) {

        buttons ="<button type='button' class=\"btn btn-primary\" " +
            "id='btnSeeQueryID" + key + "' value='" + key + "' style=\"margin-top: 7px;width: 100%;\">" +
            "See Table Query for " + key + "</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='btnRunQueryID" + key + "' value='" + key + 
            "' style=\"margin-top: 7px;width: 100%;\">Run Table Query for " + key + "</button> " +
            " <input type='text' class='form form-control' id='txtJointValID" + key + "' value='' placeholder='value for joint key'> <hr>"
        
        tapButton.push(buttons);
        
    }
    $("#loadTableQueryIds").append(tapButton);

    for (let key in (await api.getObjectMap()).object_map.tables) {
        bindClickEvent("btnSeeQueryID" + key, () =>{
            let val = $("#txtJointValID" + key).val().trim();
            let query = api.getTableQuery(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(query.query,"getJsonAll");
            return query.status;
        });
        
        bindClickAsyncEvent("btnRunQueryID" + key, async () =>{
            let val = $("#txtJointValID" + key).val().trim();
            let query = await api.getTableSelectedField(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(JSON.stringify(query.field_values,undefined,4),"getJsonAll");
            return query.status;
        });
        
    }
}

async function createTableFieldsButton(api){
    let buttons = "";
    let tapButton = [];

    for (let key in (await api.getObjectMap()).object_map.tables) {

        buttons ="<button type='button' class=\"btn btn-primary\" " +
            "id='btnSeeQueryField" + key + "' value='" + key + "' style=\"margin-top: 7px;width: 100%;\">" +
            "See Table Query for " + key + "</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='btnRunQueryField" + key + "' value='" + key + 
            "' style=\"margin-top: 7px;width: 100%;\">Run Table Query for " + key + "</button> " +
            " <input type='text' class='form form-control' id='txtJointValField" + key + "' value='' placeholder='value for joint key'> <hr>"
        
        tapButton.push(buttons);
        
    }
    $("#loadTableFields").append(tapButton);

    for (let key in (await api.getObjectMap()).object_map.tables) {
        
        bindClickAsyncEvent("btnSeeQueryField" + key, async () =>{
            let val = $("#txtJointValField" + key).val().trim();
            let query = await api.getTableFieldsQuery(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(query.query,"getJsonAll");
            return query.status;
        });
        
        bindClickAsyncEvent("btnRunQueryField" + key, async () =>{
            let val = $("#txtJointValField" + key).val().trim();
            let query = await api.getTableFields(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(JSON.stringify(query.field_values,undefined,4),"getJsonAll");
            return query.status;
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

            let params = connectorParams[$("input:radio[name=sex]:checked")[0].value];
            
            let connect = api.connect(params);
            let status = false;
            connect.catch((reason)=>console.error(reason));

            let thenFun = async ()=> {};

            connect.then((value) => {
                status = value.status;
                display(value , "getJsonAll");
                thenFun = async () =>{

                if (status){

                    /*/ disable all radio buttons so the user can't change their value /*/
                    $("input:radio[name=sex]").attr("disabled",true);
                    $("label[name=radioLabel]").each((i,btn)=>{
                        disableButton(btn.id);
                    });

                    enableButton("btnApiDisconnect");
                    enableButton("btnGetConnector");
                    enableButton("btnGetObjectMap");
                    enableButton("btnGetJoinTable");
                    enableButton("btnGetRootQuery");
                    enableButton("btnGetRootFieldsQuery");
                    enableButton("btnGetRootQueryIds");
                    enableButton("btnGetRootFields");
                    enableButton("btnGetTableQueryIds");
                    enableButton("btnGetTableFields");
                    enableButton("btnGetAdqlJsonMap");
                    enableButton("btnConstraint");
                    enableButton("btnRemoveConstraint");
                    enableButton("btnRemoveAllConstraint");
                    enableButton("btnLoadButtonsHandler");

                    await createButton(api);
                    await createHandlersButton(api);
                    await createTableIDsButton(api);
                    await createTableFieldsButton(api);
                }
            };
            });

            display(""+status , "getStatus");

            await connect;
            await thenFun();

            return status;

        } else {
            display("The service is  already connected ! disconnect the service and try again ...", "getStatus");
        }

    },"no service selected... Choose service first and try again" );

    bindClickEvent("btnApiDisconnect",() => {
        api.disconnect();
        
        disableButton("btnApiDisconnect");
        disableButton("btnGetConnector");
        disableButton("btnGetObjectMap");
        disableButton("btnGetJoinTable");
        disableButton("btnGetRootQuery");
        disableButton("btnGetRootFieldsQuery");
        disableButton("btnGetRootQueryIds");
        disableButton("btnGetRootFields");
        disableButton("btnGetTableQueryIds");
        disableButton("btnGetTableFields");
        disableButton("btnGetAdqlJsonMap");
        disableButton("btnConstraint");
        disableButton("btnRemoveConstraint");
        disableButton("btnRemoveAllConstraint");
        disableButton("btnLoadButtonsHandler");

        enableButton("btnApiConnect");

        $("input:radio[name=sex]").attr("disabled",false);
        $("label[name=radioLabel]").each((i,btn)=>{
            enableButton(btn.id);
        });

        $("loadButton").html("");
        $("loadButtonsHandler").html("");

        return false;

    });

    bindClickEvent("btnGetConnector",() => {

        let connector = api.getConnector();
        let status = connector.status;

        display(status, "getStatus");
        display(connector.connector, "getJsonAll");

        return status;

    });

    bindClickAsyncEvent("btnGetObjectMap",async () => {

        let objectMap = await api.getObjectMap();
        let status = objectMap.status;

        display(status, "getStatus");
        display(objectMap, "getJsonAll");

        return status;

    });

    bindClickEvent("btnGetJoinTable",() => {

        let params = connectorParams[$("input:radio[name=sex]:checked")[0].value];

        let joinTables = api.getJoinedTables(params.table);
        let status = joinTables.status;

        display(status, "getStatus");
        display(joinTables, "getJsonAll");

        return status;
        
    });

    bindClickEvent("btnGetRootQuery", () => {

        let rootQuery = api.getRootQuery();

        if (rootQuery.status){
            display(rootQuery.status, "getStatus");
            display(rootQuery.query, "getJsonAll");
            return true;
        }
        display(rootQuery.status, "getStatus");
        display(rootQuery.error, "getJsonAll");
        return false;
        
    });

    bindClickAsyncEvent("btnGetRootFieldsQuery",async () => {

        let rootQuery = await api.getRootFieldsQuery();

        if (rootQuery.status){
            display(rootQuery.status, "getStatus");
            display(rootQuery.query, "getJsonAll");
            return true;
        }
        display(rootQuery.status, "getStatus");
        display(rootQuery.error, "getJsonAll");
        return false;
        
    });

    bindClickAsyncEvent("btnGetRootQueryIds", async () => {

        let rootQueryIds = await api.getRootQueryIds();
        let status = rootQueryIds.status;

        display(status, "getStatus");
        display(rootQueryIds, "getJsonAll");

        return status;
    });

    bindClickAsyncEvent("btnGetRootFields", async () => {

        let rootFields = await api.getRootFields();
        let status = rootFields.status;
        if (status){
            display(status, "getStatus");
            display(rootFields.field_values, "getJsonAll");
            return true;
        }
        
        display(status, "getStatus");
        display(rootFields.error, "getJsonAll");

        return false;
    });

    bindClickEvent("btnGetTableQueryIds",() => {
        if (document.getElementById("loadTableQueryIds").style.display == "block"){
            document.getElementById("loadTableQueryIds").style.display = "none";
        }else {
            document.getElementById("loadTableQueryIds").style.display = "block";
        }
    });

    bindClickEvent("btnGetTableFields",() => {
        if (document.getElementById("loadTableFields").style.display == "block"){
            document.getElementById("loadTableFields").style.display = "none";
        }else {
            document.getElementById("loadTableFields").style.display = "block";
        }
    });

    bindClickEvent("btnGetAdqlJsonMap",() => {
        display("Internal Object State Debug purpose only", "getStatus");
        display(JSON.stringify(api.jsonAdqlBuilder.adqlJsonMap,undefined,4), "getJsonAll");
        return true;
    });

    bindClickEvent("btnConstraint",() => {
        if (document.getElementById("loadButton").style.display == "block"){
            document.getElementById("loadButton").style.display = "none";
        }else {
            document.getElementById("loadButton").style.display = "block";
        }

    });

    bindClickEvent("btnRemoveConstraint",() => {

        let rootq = api.resetTableConstraint($("#txtConstraint").val());

        if (rootq.status){
            display(rootq.status, "getStatus");
            display(api.getRootQuery().query, "getJsonAll");
            return true;
        } else {
            display("" + rootq.status, "getStatus");
            display(JSON.stringify(rootq.error,undefined,4), "getJsonAll");
            return false;
        }
    });

    bindClickEvent("btnRemoveAllConstraint",() => {
        let r = api.resetAllTableConstraint();

        if (r.status){
            display(r.status, "getStatus");
            display(api.getRootQuery(), "getJsonAll");
            return true;
        } else {
            display(r.status, "getStatus");
            display(JSON.stringify(r.error,undefined,4), "getJsonAll");
            return false;
        }

    });

    bindClickEvent("btnLoadButtonsHandler",() => {
        if (document.getElementById("loadButtonsHandler").style.display == "block"){
            document.getElementById("loadButtonsHandler").style.display = "none";
        }else {
            document.getElementById("loadButtonsHandler").style.display = "block";
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
    $("input:radio[name=sex]:checked").prop('checked', false);
    setupEventHandlers();
});

