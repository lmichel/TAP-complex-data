/**
 * JS file containing all the function used to embed the Tap Complex API in the demo web page.
 */

/*/ Utility function area /*/

function display(data, id) {
    $("#" + id).html(data);
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
                display(String.toString(disableText), "getStatus");
            }

        }catch(error){
            console.error(error)
            errorButton(elemId)
            display("An unexpected Error has append see logs for more information", "getStatus");
        }
    })
}

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

function selectConstraints(tableName, txtInput,api){
    
    let schema = api.getConnector().service["schema"];
    let adql = api.tapServiceConnector.attributsHandler.addAllColumn(tableName, schema)
    let QObject = api.tapServiceConnector.Query(adql);
    let dataTable = VOTableTools.votable2Rows(QObject)
    let contentText = QObject.responseText;
    let Field = VOTableTools.genererField(QObject, contentText)
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
    out += "<thead class='thead-dark'><tr role='row'>"
    
    for (let j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
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
    out += "</tbody>"
    out += "</table>  </div>"
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
        $(td[i]).click(function () {
            let id = $(this).attr("id");
            if ($("#" + txtInput).val().length !==1) {
                var content = $("#" + txtInput).val();
                let formatValue = schema+"."+tableName;
                let correctValue = formatValue.quotedTableName().qualifiedName
                if($("#" + txtInput).val().indexOf(" AND " + correctValue + "." + id)!==-1){
                    alert(id+" already added")
                }else{
                    $("#" + txtInput).val(content + " AND " + correctValue + "." + id + "=");
                    alert(id+" is added to constraint")
                }
            } else {
                let formatValue = schema+"."+tableName;
                let correctValue = formatValue.quotedTableName().qualifiedName
                $("#" + txtInput).val(correctValue + "." + id + "=");
                alert(id+" is added to constraint")
            }

        });
    }
}

/*/ Button creation for constrain selection /*/

function createButton(api) {
    let buttons = "";
    let value = ""
    let tapButton = [];

    for (let key in api.getObjectMapWithAllDescriptions().tables) {
        value = api.getObjectMapWithAllDescriptions()

        buttons = "<span>" + "<button data-toggle=\"modal\" data-target=\"#myModal\" type='button' class=\"btn btn-primary\" " +
            "id='bbb" + key + "' value='" + key + "' name='Cbuttons' style=\"margin-top: 7px\">" +
            "Click to select " + key + " constraints</button>" +
            "<button  type='button' class=\"btn btn-primary\" id='" + key + "' value='" + key + "' style=\"margin-top: 7px\">Click to Join " + key + " constraint</button> " +
            " <input type='text' class='form form-control' id='txt" + key + "' value='' placeholder='Enter condition' name='Cinputs'> </span> <hr>"
        
        tapButton.push(buttons);
        
    }

    $("#loadButton").append(tapButton);

    for (let key in api.tapServiceConnector.objectMapWithAllDescription.tables) {
        bindClickEvent("bbb" + key,() => {
            selectConstraints(key, "txt" + key, api);
            return true;
        });

        bindClickEvent(key,() => {
            if($("#txt" + key).val().length!==1){
                let result = api.setTableConstraint(key, $("#txt" + key).val());
                if (result.status === "OK"){
                    display(result.status,"getStatus");
                    display(api.getRootQuery().query,"getJsonAll");
                    return true;
                }else{
                    display(result.status + " : " + result.message,"getStatus");
                    return false;
                }

            } else {
                return false;
            }
            
        });

    }

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
            "tapService" : "http://xcatdb.unistra.fr/3xmmdr8/tap/sync",
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
        
        bindClickEvent("btnApiConnect",() => {
            
            if (isEnable("btnApiConnect")) {

                let params = connectorParams[$("input:radio[name=sex]:checked")[0].value];
                
                api.connect(params);


                let status = api.getConnector().status;
                let message = api.getConnector().message;

                display(status + ": " + message, "getStatus");

                if (status === "OK"){

                    /*/ disable all radio buttons so the user can't change their value /*/
                    $("input:radio[name=sex]").attr("disabled",true);
                    $("label[name=radioLabel]").each((i,btn)=>{
                        disableButton(btn.id);
                    })

                    enableButton("btnApiDisconnect");
                    enableButton("btnGetConnector");
                    enableButton("btnGetJsonAdqlContent");
                    enableButton("btnGetObjectMap");
                    enableButton("btnGetJoinTable");
                    enableButton("btnGetRootQuery");
                    //enableButton("btnGetRunRootQuery");
                    enableButton("btnGetRootQueryIds");
                    enableButton("btnGetRootFields");
                    //enableButton("btnGetTableQueryIds");
                    //enableButton("btnGetTableFields");
                    enableButton("btnConstraint");
                    enableButton("btnRemoveConstraint");
                    enableButton("btnRemoveAllConstraint");

                    createButton(api);

                    return true;

                }

            } else {
                display("The service is  already connected ! disconnect the service and try again ...", "getStatus");
            }

        }, "no service selected... Choose service first and try again" );

        bindClickEvent("btnApiDisconnect",() => {
            api.disconnect();
            
            disableButton("btnApiDisconnect");
            disableButton("btnGetConnector");
            disableButton("btnGetJsonAdqlContent");
            disableButton("btnGetObjectMap");
            disableButton("btnGetJoinTable");
            disableButton("btnGetRootQuery");
            //disableButton("btnGetRunRootQuery");
            disableButton("btnGetRootQueryIds");
            disableButton("btnGetRootFields");
            //disableButton("btnGetTableQueryIds");
            //disableButton("btnGetTableFields");
            disableButton("btnConstraint");
            disableButton("btnRemoveConstraint");
            disableButton("btnRemoveAllConstraint");

            enableButton("btnApiConnect");

            $("input:radio[name=sex]").attr("disabled",false);
            $("label[name=radioLabel]").each((i,btn)=>{
                enableButton(btn.id);
            })

            $("loadButton").html("");

            return false;

        });

        bindClickEvent("btnGetConnector",() => {

            let connector = api.getConnector();
            let status = connector.status;

            display(status, "getStatus");
            display(JSON.stringify(connector, undefined, 4), "getJsonAll")

            return status === "OK";

        });

        bindClickEvent("btnGetObjectMap",() => {

            /*/ TODO : update api.getObjectMap output object /*/

            let objectMap = api.getObjectMap();
            let status = objectMap.succes.status;

            display(status, "getStatus");
            display(JSON.stringify(objectMap, undefined, 4), "getJsonAll");

            return status === "OK";

        });

        bindClickEvent("btnGetJsonAdqlContent",() => {
            let jsonAdql = api.getJsonAdqlContent()
            if (jsonAdql.status === "OK"){
                display(jsonAdql.status,"getStatus");
                display(JSON.stringify(jsonAdql.jsonADQLContent,undefined,4),"getJsonAll");
                return true;
            } else {
                display(jsonAdql.status + " : " +jsonAdql.message ,"getStatus")
                return false;
            }

        });

        bindClickEvent("btnGetJoinTable",() => {
            
            /*/ TODO : update api.getJoinedTables output object /*/

            let params = connectorParams[$("input:radio[name=sex]:checked")[0].value];

            let joinTables = api.getJoinedTables(params.table);
            let status = joinTables.Succes.status;

            display(status, "getStatus");
            display(JSON.stringify(joinTables,undefined,4), "getJsonAll");

            return status === "OK";
            
        });

        bindClickEvent("btnGetRootQuery",() => {
            
            /*/ TODO : Re-Do  api.getRootQuery/*/

            let rootQuery = api.getRootQuery();

            if (rootQuery.status == "OK"){
                display(rootQuery.status, "getStatus");
                display(rootQuery.query, "getJsonAll");
                return true
            }
            display(rootQuery.status + " : " + rootQuery.message, "getStatus");
            return false;
            
        });

        bindClickEvent("btnGetRunRootQuery",() => {

            /*/ TODO : Do  api.getRunRootQuery/*/

            let runRootQuery = api.getRunRootQuery();
            let status = runRootQuery.Succes.status;

            display(status, "getStatus");
            display(JSON.stringify(runRootQuery,undefined,4), "getJsonAll");

            return status === "OK";
        });

        bindClickEvent("btnGetRootQueryIds",() => {

            /*/ TODO : update api.getRootQueryIds output object /*/

            let rootQueryIds = api.getRootQueryIds();
            let status = rootQueryIds.succes.status;

            display(status, "getStatus");
            display(JSON.stringify(rootQueryIds,undefined,4), "getJsonAll");

            return status === "OK";
        });

        bindClickEvent("btnGetRootFields",() => {

            /*/ TODO : update api.getRootQueryIds output object /*/

            let rootFields = api.getRootFields();
            let status = rootFields.succes.status;

            display(status, "getStatus");
            display(JSON.stringify(rootFields,undefined,4), "getJsonAll");

            return status === "OK";
        });

        bindClickEvent("btnGetTableQueryIds",() => {

            /*/ TODO : Do api.getTableQueryIds /*/

            let tableQueryIds = api.getTableQueryIds();
            let status = tableQueryIds.succes.status;

            display(status, "getStatus");
            display(JSON.stringify(tableQueryIds,undefined,4), "getJsonAll");

            return status === "OK";
        });

        bindClickEvent("btnGetTableFields",() => {

            /*/ TODO : Do api.getTableFields /*/

            let tableFields = api.getTableFields();
            let status = tableFields.succes.status;

            display(status, "getStatus");
            display(JSON.stringify(tableFields,undefined,4), "getJsonAll");

            return status === "OK";
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

            if (rootq.status === "OK"){
                display(rootq.status, "getStatus");
                display(api.getRootQuery(), "getJsonAll");
                return true;
            } else {
                display(rootq.status + " : " + rootq.message, "getStatus");
                return false;
            }
        });

        bindClickEvent("btnRemoveAllConstraint",() => {
            let r = api.resetAllTableConstraint();

            if (r.status === "OK"){
                display(r.status, "getStatus");
                display(api.getRootQuery(), "getJsonAll");
                return true;
            } else {
                display(r.status + " : " + r.message, "getStatus");
                return false;
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

}
