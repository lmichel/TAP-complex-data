/**
 * JS file containing all the function used to embed the Tap Complex API in the demo web page.
 */

/*/ modal generation /*/

async function selectConstraints(tableName, txtInput,api){
    
    let schema = api.getConnector().connector.service.schema;
    let AHList = await api.getTableAttributeHandlers(tableName);
    if(AHList.status){
        AHList = AHList.attribute_handlers;
        
        let out = "\n" +
            "  <!-- The Modal -->\n" +
            "  <div class=\"modal fade\" id=\"myModal\">\n" +
            "    <div class=\"modal-dialog modal-xl\">\n" +
            "      <div class=\"modal-content\">"+
            "    <div class=\"modal-content\">\n" +
            "      <div class=\"modal-body\">\n"+
            "<span style='text-align: left;font-weight: bold;font-size: x-large;'> Columns of table " + tableName + "</span>" +
            "<button class='delete_right btn btn-danger'  data-dismiss=\"modal\" id='d_right'><i class='fa fa-close ' ></i></button><br></br>";//head
        out += "<table  class = 'table table-bordered table-striped table-hover table-responsive'  role = 'grid' >";
        out += "<thead class='thead-dark'><tr role='row'>";
        
        for (let field in AHList[0]) {
            out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + field + "</th>";
        }
        out += "</tr></thead>";
        out += "<tbody>";
        
        for (let j = 0; j < AHList.length; j++) {//table  content
            if (j % 2 == 1) {
                out += "<tr class = 'odd table-primary' >";
            } else {
                out += "<tr class = 'even table-primary'>";
            }

            for (let field in AHList[j]){
                if (field == "nameattr"){
                    out += "<td id = '" + AHList[j][field] + "'";
                }else{
                    out += "<td";
                }
                out += " style='text-align: center;vertical-align:bottom;text-decoration:underline' >" + AHList[j][field] + "</td>";
            }

            out += "</tr>";

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
                let id = td[i].id;
                
                if(id.length > 0){
                    if ($("#" + txtInput).val().length !==1) {
                        var content = $("#" + txtInput).val();
                        let formatValue = schema+"."+tableName;
                        let correctValue = formatValue.quotedTableName().qualifiedName;
                        if($("#" + txtInput).val().indexOf(correctValue + "." + id)!==-1){
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
                }
                

            });
        }
    }
    
    
}

/*/ Button creation for constrain selection /*/

async function createButton(api) {
    let buttons = "";
    let tapButton = [];
    let map = (await api.getObjectMap()).object_map;
    let safe;

    for (let key in map.tables) {
        safe = vizierToID(key);
        buttons = "<span>" + "<button type='button' class=\"btn btn-primary\" " +
            "id='bbb" + safe + "' value='" + key + "' name='Cbuttons' style=\"margin-top: 7px\">" +
            "Click to select " + key + " constraints</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='" + safe + "' value='" + key + "' style=\"margin-top: 7px\">Click to Join " + key + " constraint</button> " +
            " <input type='text' class='form form-control' id='txt" + safe + "' value='' placeholder='Enter condition' name='Cinputs'> </span> <hr>";
        
        tapButton.push(buttons);
        
    }

    $("#loadButton").append(tapButton);

    for (let key in map.tables) {
        bindClickAsyncEvent("bbb" + safe,async () => {
            await selectConstraints(key, "txt" + key, api);
            $('#myModal').modal({"backdrop" : "static"});
            return true;
        });

        bindClickAsyncEvent(safe, async () => {
            if($("#txt" + safe).val().length > 1){
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
                    display((await api.getRootQuery()).query,"getJsonAll");
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

            map["handler_" + handlers.attribute_handlers[i].column_name] = handlers.attribute_handlers[i];
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
    let safe;

    for (let key in api.getObjectMap().object_map.tables) {
        safe = vizierToID(key);
        buttons ="<button type='button' class=\"btn btn-primary\" " +
            "id='btnSeeQueryID" + safe + "' value='" + key + "' style=\"margin-top: 7px;width: 100%;\">" +
            "See Table Query for " + key + "</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='btnRunQueryID" + safe + "' value='" + key + 
            "' style=\"margin-top: 7px;width: 100%;\">Run Table Query for " + key + "</button> " +
            " <input type='text' class='form form-control' id='txtJointValID" + safe + "' value='' placeholder='value for joint key'> <hr>";
        
        tapButton.push(buttons);
        
    }
    $("#loadTableQueryIds").append(tapButton);

    for (let key in  api.getObjectMap().object_map.tables) {
        safe = vizierToID(key);
        bindClickAsyncEvent("btnSeeQueryID" + safe, async () =>{
            let val = $("#txtJointValID" + safe).val().trim();
            let query = await api.getTableQuery(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(query.query,"getJsonAll");
            return query.status;
        });
        
        bindClickAsyncEvent("btnRunQueryID" + safe, async () =>{
            let val = $("#txtJointValID" + safe).val().trim();
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
    let safe;

    for (let key in api.getObjectMap().object_map.tables) {
        safe = vizierToID(key);
        buttons ="<button type='button' class=\"btn btn-primary\" " +
            "id='btnSeeQueryField" + safe + "' value='" + key + "' style=\"margin-top: 7px;width: 100%;\">" +
            "See Table Query for " + key + "</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='btnRunQueryField" + safe + "' value='" + key + 
            "' style=\"margin-top: 7px;width: 100%;\">Run Table Query for " + key + "</button> " +
            " <input type='text' class='form form-control' id='txtJointValField" + safe + "' value='' placeholder='value for joint key'> <hr>";
        
        tapButton.push(buttons);
        
    }
    $("#loadTableFields").append(tapButton);

    for (let key in api.getObjectMap().object_map.tables) {
        safe = vizierToID(key);
        
        bindClickAsyncEvent("btnSeeQueryField" + safe, async () =>{
            let val = $("#txtJointValField" + safe).val().trim();
            let query = await api.getTableFieldsQuery(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(query.query,"getJsonAll");
            return query.status;
        });
        
        bindClickAsyncEvent("btnRunQueryField" + safe, async () =>{
            let val = $("#txtJointValField" + safe).val().trim();
            let query = await api.getTableFields(key, val ==="" ? undefined : val);
            display(query.status,"getStatus");
            display(JSON.stringify(query.field_values,undefined,4),"getJsonAll");
            return query.status;
        });
        
    }
}

function tableHandlerFactory(table,api){
    return async () =>{
        let tableCo = await api.setRootTable(table);
        display(tableCo, "getJsonAll");
        $("#loadButton").html("");
        $("#loadButtonsHandler").html("");
        $("#loadTableQueryIds").html("");

        if (tableCo.status){

            enableButton("btnGetObjectMap");
            enableButton("btnGetJoinTable");
            enableButton("btnGetRootQuery");
            enableButton("btnGetRootFieldsQuery");
            enableButton("btnGetRootQueryIds");
            enableButton("btnGetRootFields");
            enableButton("btnGetTableQueryIds");
            enableButton("btnGetTableFields");
            enableButton("btnGetAdqlJsonMap");
            enableButton("btnGetSelectedAH");
            enableButton("btnCustom");
            enableButton("btnConstraint");
            enableButton("btnRemoveConstraint");
            enableButton("btnRemoveAllConstraint");
            enableButton("btnLoadButtonsHandler");

            await createButton(api);
            await createHandlersButton(api);
            await createTableIDsButton(api);
            await createTableFieldsButton(api);
        }
        return tableCo.status;
    };

}

function schemasHandlerFactory(schema,api){
    return async () => {
        let tableHolder = $("#tableList");
        tableHolder.html("");

        $("#loadButton").html("");
        $("#loadButtonsHandler").html("");
        $("#loadTableQueryIds").html("");

        disableButton("btnGetObjectMap");
        disableButton("btnGetJoinTable");
        disableButton("btnGetRootQuery");
        disableButton("btnGetRootFieldsQuery");
        disableButton("btnGetRootQueryIds");
        disableButton("btnGetRootFields");
        disableButton("btnGetTableQueryIds");
        disableButton("btnGetTableFields");
        disableButton("btnGetAdqlJsonMap");
        disableButton("btnGetSelectedAH");
        disableButton("btnCustom");
        disableButton("btnConstraint");
        disableButton("btnRemoveConstraint");
        disableButton("btnRemoveAllConstraint");
        disableButton("btnLoadButtonsHandler");

        let schemCo = await api.selectSchema(schema);
        display(schemCo,"getJsonAll");
        if(schemCo.status){
            let tables = api.getTables();
            display(tables,"getJsonAll");
            if(tables.status){
                tables = tables.tables;
                for(let table in tables){
                    let safe = vizierToID(table);
                    tableHolder.append("<button  type='button' class=\"btn btn-primary\" id='table_" + 
                    safe + "' style=\"margin-top: 7px;width: 100%;\">" + 
                    table + "</button> ");
                    bindClickAsyncEvent("table_" + safe,tableHandlerFactory(table,api));
                }
                return true;
            }
        }
        return false;
    };
}


let api = new jw.Api();

/*/ Trigers function for radio button /*/

function OnRadioChange(radio) {
    syncIt(async ()=>{
        $("#tableList").html("");
        $("#schemas").html("");

        $("#loadButton").html("");
        $("#loadButtonsHandler").html("");
        $("#loadTableQueryIds").html("");

        disableButton("btnApiDisconnect");
        disableButton("btnGetObjectMap");
        disableButton("btnGetJoinTable");
        disableButton("btnGetRootQuery");
        disableButton("btnGetRootFieldsQuery");
        disableButton("btnGetRootQueryIds");
        disableButton("btnGetRootFields");
        disableButton("btnGetTableQueryIds");
        disableButton("btnGetTableFields");
        disableButton("btnGetAdqlJsonMap");
        disableButton("btnGetSelectedAH");
        disableButton("btnCustom");
        disableButton("btnConstraint");
        disableButton("btnRemoveConstraint");
        disableButton("btnRemoveAllConstraint");
        disableButton("btnLoadButtonsHandler");

        let lastLab=$("label.btn-success[name=radioLabel]")[0];
        if(lastLab !== undefined ){
            enableButton(lastLab.id);
        }

        let params = jw.KnowledgeTank.getDescriptors().descriptors[radio.value];
        let connect = await api.connectService(params.tapService,params.shortName);
        display(connect,"getJsonAll");
        if(connect.status){

            enableButton("btnApiDisconnect");
            enableButton("btnGetConnector");

            let schemas = api.getSchemas();
            display(schemas,"getJsonAll");
            if(schemas.status){
                let holder = $("#schemas");
                holder.html("");
                let unqSchem;
                for (let schema in schemas.schemas){
                    unqSchem = utils.replaceAll(schema,'"',"");
                    holder.append("<button  type='button' class=\"btn btn-primary\" id='schema_" + 
                        unqSchem + "' style=\"margin-top: 7px;width: 100%;\">" + 
                        schema + "</button> ");
                    bindClickAsyncEvent("schema_" + unqSchem , schemasHandlerFactory(schema,api));
                }
                successButton("label_" + radio.value);
                display(radio.value + " is now connected selected the wanted schema to use", "getStatus");
                return;
            }
        }
        errorButton("label_" + radio.value);
    });
}

/*/ Steup of Event handlers functions /*/

function setupEventHandlers(){

    bindClickAsyncEvent("btnCustom",async ()=>{
        if (isEnable("btnCustom")) {
            let map = await api.tapServiceConnector.buildObjectMap();
            display(map,"getJsonAll");
        }
    });

    bindClickEvent("btnApiDisconnect",() => {
        api.disconnect();
        $("#tableList").html("");
        $("#schemas").html("");
        
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
        disableButton("btnGetSelectedAH");
        disableButton("btnCustom");
        disableButton("btnConstraint");
        disableButton("btnRemoveConstraint");
        disableButton("btnRemoveAllConstraint");
        disableButton("btnLoadButtonsHandler");

        enableButton("btnApiConnect");

        $("#loadButton").html("");
        $("#loadButtonsHandler").html("");
        $("#loadTableQueryIds").html("");

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

        let objectMap = api.getObjectMap();
        let status = objectMap.status;

        display(status, "getStatus");
        display(objectMap, "getJsonAll");

        return status;

    });

    bindClickEvent("btnGetJoinTable",() => {

        let joinTables = api.getJoinedTables(api.getConnector().connector.service.table);
        let status = joinTables.status;

        display(status, "getStatus");
        display(joinTables, "getJsonAll");

        return status;
        
    });

    bindClickAsyncEvent("btnGetRootQuery", async () => {

        let rootQuery = await api.getRootQuery();

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

    bindClickAsyncEvent("btnGetSelectedAH", async () => {
        let AHS = await api.getTableAttributeHandlers(api.getConnector().connector.service.table);
        if(AHS.status){
            display(AHS.attribute_handlers,"getJsonAll");
            AHS = jw.KnowledgeTank.selectAH(AHS.attribute_handlers);
            display(AHS.selected,"getJsonAll");
            display("true","getStatus");
            return true;
        }
        display("false","getStatus");
        display(AHS.error,"getJsonAll");
        return false;
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
    buildButtonSelector("#mainButtonHolder");
    // ensure no radio button is check by default
    $("input:radio[name=radio]:checked").prop('checked', false);
    setupEventHandlers();
});