class TapApi {

    constructor() {
        this.tapService = '';
        let jsonStatu = {success: {}, faillure: {}};
        this.disconnectJsonStatu = {success: {}, faillure: {}}
        this.testConnection = false;
        this.testDeconnection = false;
        this.correctService = "";
        this.votableQueryResult = "";
        this.query = ""
        this.handlerAttribut = new HandlerAttributs();
        this.handlerAttribut.api = this;
        this.tapButton = undefined;
        this.adqlContent = [];
        this.testJoinConstraint = false;
        this.connector = {status: "", message: "", service: {}}
        this.jsonContaintJoinTable = {
            Succes: {
                status: "",
                base_table: "",
                joined_tables: []
            },
            Failure: {
                NotConnected: {status: "", message: ""},
                WrongTable: {status: "", message: ""}
            }
        }

        this.tapJoinConstraint = [];
        this.tapWhereConstraint = [];

        /**
         * @param votableQueryResult (Object) The return value of tabService.Query(query)
         * @return jsonStatu (Json Object) Return Json containning the status of adql query
         * */
        let isCorrectJsonStatu = function (votableQueryResult) {
            if (votableQueryResult.statusText == "OK") {
                jsonStatu.success["status"] = "OK";
            } else {
                jsonStatu.faillure["status"] = "failled";
                jsonStatu.faillure["message"] = "Bad Request";
            }
            return jsonStatu;
        }

        /**
         * @param votableQueryResult : (Object) The return value of tabService.Query(query)
         * @return jsonStatu : (String) The statuText of votableQueryResult
         * */
        this.getJsonStatu = function (votableQueryResult) {
            var jsonStatu = isCorrectJsonStatu(votableQueryResult)
            return jsonStatu;
        }

    }


}

/**
 * @param params (Json) with parameters (tapService,schema,table,shortName)
 * @param tapService (String) The URL of the Tap Servie
 * @param schema (String) Schema containing the complex object
 * @param table (String) Root table of the complex object
 * @param shortName (String) The Shortname of database
 * */
TapApi.prototype.connect = function ({tapService, schema, table, shortName}) {
    var formatTableName = schema + "." + table;

    //alert(formatTableName);
    var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    this.query = "SELECT TOP 5 * FROM " + correctTableNameFormat;
    this.tapService = new TapService(tapService, schema, shortName, true)
    this.correctService = new TapServiceConnector(tapService, schema, shortName);
    this.votableQueryResult = this.tapService.Query(this.query);

    if (this.getJsonStatu(this.votableQueryResult).success.status == 'OK') {
        this.testConnection = true;
        this.connector.status = 'OK';
        this.connector.service["tapService"] = tapService;
        this.connector.service["schema"] = schema;
        this.connector.service["table"] = table;
        this.connector.service["shortName"] = shortName;
        this.connector.message = "Active TAP : " + shortName
        //this.adqlContent = "";
        // console.log(JSON.stringify(this.getJsonStatu(this.votableQueryResult),undefined,2))

        //retirer dans l'api
        //var data = this.correctService.loadJson();
        //$("#loadJson").html(JSON.stringify(data,undefined,2));
        //window.location.hash = "#loadJson"

        //var jsonData = correctService.createVoTableResultJson(votableQueryResult,table)
        // $("#votableJson").html(JSON.stringify(jsonData,undefined,2));
        // window.location.hash = "#votableJson"

    } else if (this.getJsonStatu(this.votableQueryResult) != undefined && shortName == "Vizier") {
        this.testConnection = true;
        this.connector.status = 'OK';
        this.connector.service["tapService"] = tapService;
        this.connector.service["schema"] = schema;
        this.connector.service["table"] = table;
        this.connector.service["shortName"] = shortName;
        this.connector.message = "Active TAP : " + shortName
    } else {
        this.testConnection = false

        this.connector.status = 'Failled';
        this.connector.message = "No active TAP connection"
        console.log(JSON.stringify(this.getJsonStatu(this.votableQueryResult).faillure, undefined, 3));


    }
    return this.correctService;
}


TapApi.prototype.disconnect = function () {
    reset();
    //alert("disconnected")
    this.tapService = null;
    this.correctService = null;
    this.votableQueryResult = null;
    this.tapJoinConstraint = [];
    this.tapWhereConstraint = [];
    this.adqlContent = "";
    $("#getJsonAll").text("");

    if (this.correctService == null && this.tapService == null && this.votableQueryResult == null) {
        this.disconnectJsonStatu.success["DisconnectStatus"] = "OK";
        this.testDeconnection = true
        this.testConnection = false

        return this.disconnectJsonStatu.success;
    } else {
        this.disconnectJsonStatu.faillure["faillure"] = "failled";
        this.disconnectJsonStatu.faillure["message"] = "disconnecting failled";
        this.testDeconnection = false;
        this.testDeconnection = true;
        return this.disconnectJsonStatu.faillure;
    }
    //console.log(JSON.stringify(this.disconnectJsonStatu,undefined,2))


}


TapApi.prototype.getConnector = function () {
    if (this.testConnection == true) {
        return this.connector;
    } else {
        alert("No Tap service connected");
    }
}

TapApi.prototype.getObjectMap = function () {
    var objectMap = {
        succes: {status: "", object_map: {}},
        failure: {status: "", message: ""}
    }
    if (this.testConnection == true) {
        objectMap.succes.status = "OK"
        objectMap.succes.object_map = this.correctService.loadJson();
        // return objectMap.succes;
    } else {
        objectMap.failure.status = "Failed"
        objectMap.failure.message = "No active TAP connection";
        //return objectMap.failure
    }

    //console.log(JSON.stringify(objectMap,undefined,3));
    return objectMap;
}
/**
 * @param baseTable (string): Table from which joint table are searched
 * */
TapApi.prototype.getJoinedTables = function (baseTable) {


    if (this.testConnection == true) {
        this.jsonContaintJoinTable.Succes.status = "OK";
        this.jsonContaintJoinTable.Succes.base_table = baseTable;
        this.jsonContaintJoinTable.Succes.joined_tables = this.correctService.getJoinTables(baseTable);
        ;
    } else {
        this.jsonContaintJoinTable.Failure.NotConnected.status = "Failed";
        this.jsonContaintJoinTable.Failure.NotConnected.message = "No active TAP connection";
        this.jsonContaintJoinTable.Failure.WrongTable.status = "Failed";
        this.jsonContaintJoinTable.Failure.WrongTable.message = "table " + baseTable + " is not part of the object map"
    }

    return this.jsonContaintJoinTable;
}


/**
 *
 * @param {*} mainJsonData  the main json create by the method createMainJson of Tapservice
 * @returns return all the field of each join table of the mainJson
 */
TapApi.prototype.getCorrectFieldOfJoinTable = function (mainJsonData) {
    var tableContentQueryField = []
    Object.keys(mainJsonData).forEach(function (key) {
        tableContentQueryField.push(key);
    });
    return tableContentQueryField;
}

/**
 *
 * @param {*} mainJsonData the main json create by the method createMainJson of Tapservice
 * @returns return all join request of each join table of the mainJson
 */
TapApi.prototype.getRootFields = function () {

    let jsonContaintRootFields = {
        succes: {status: "", field_values: []},
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }

    let rootFields = [];
    if (this.testConnection === true) {
        let contentText = this.votableQueryResult.responseText;
        if (this.getConnector().service.tapService === "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.getConnector().service.tapService === "http://dc.zah.uni-heidelberg.de/tap/sync") {
            rootFields = VOTableTools.getField(this.votableQueryResult);
        } else {
            rootFields = VOTableTools.genererField(this.votableQueryResult, contentText);
        }
        jsonContaintRootFields.succes.status = "OK"
        jsonContaintRootFields.succes.field_values = rootFields;
        return jsonContaintRootFields.succes;
    } else {

        jsonContaintRootFields.failure.notConnected.status = "Failed";
        jsonContaintRootFields.failure.notConnected.message = "No active TAP connection"
        jsonContaintRootFields.failure.otherError.status = "failed"
        jsonContaintRootFields.failure.otherError.message = "error_message"

        return jsonContaintRootFields.failure
        // alert('you are not connected');
    }


}

TapApi.prototype.getRootFieldValues = function () {
    let jsonContaintRootFieldValues = {
        succes: {status: "", field_values: []},
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }
    let doubleArrayValue = [];
    let singleArrayValue = [];
    if (this.testConnection == true) {

        let Field = this.getRootFields().field_values;
        let dataTable = VOTableTools.votable2Rows(this.votableQueryResult);
        let tableName = this.getConnector().service["table"];

        let nbCols = Field.length;
        if (dataTable[dataTable.length - 1] == 0) {
            dataTable.splice(dataTable.length - 1, 1);
        }
        for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {//table  content
            for (let col = 0; col < nbCols; col++) {
                singleArrayValue.push(dataTable[rowNb + col]);
            }
            doubleArrayValue.push(singleArrayValue);
            singleArrayValue = [];
        }
        //console.log(doubleArrayValue);
        jsonContaintRootFieldValues.succes.status = "OK"
        jsonContaintRootFieldValues.succes.field_values = doubleArrayValue;

    } else {

        jsonContaintRootFieldValues.failure.notConnected.status = "Failed";
        jsonContaintRootFieldValues.failure.notConnected.message = "No active TAP connection"
        jsonContaintRootFieldValues.failure.otherError.status = "failed"
        jsonContaintRootFieldValues.failure.otherError.message = "error_message"
        // alert('you are not connected');
    }

    return jsonContaintRootFieldValues;

}

TapApi.prototype.getRootQueryIds = function () {
    let jsonContaintRootQueryIdsValues = {
        succes: {status: "", field_ids: []},
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }
    let doubleArrayValue = [];
    let singleArrayValue = [];
    if (this.testConnection == true) {

        let Field = this.getRootFields().field_values;
        //var query = "SELECT TOP 60 \"public\".basic.oid   FROM  \"public\".basic  JOIN   \"public\".otypes ON  \"public\".basic.oid= \"public\".otypes.oidref";
        var query = $("#getJsonAll").text();
        var a = "\\"
        let votableQueryResult
        //alert(query.substr(1))
        if (query.startsWith("SELECT TOP 60")) {
            //console.log(this.getRootQuery())
            //alert("dddddddddddd")
            votableQueryResult = this.tapService.Query(query);
        } else {
            //alert(query);
            // votableQueryResult = this.tapService.Query(query)


            votableQueryResult = this.tapService.Query(this.getRootQuery());
            this.tapButton = [];

        }
        if (votableQueryResult.statusText == "OK") {
            let dataTable = VOTableTools.votable2Rows(votableQueryResult);
            //let tableName = this.getConnector().service["table"];

            let nbCols = Field.length;
            // alert(nbCols);
            if (dataTable[dataTable.length - 1] == 0) {
                dataTable.splice(dataTable.length - 1, 1);
            }
            for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {//table  content
                for (let col = 0; col < nbCols; col++) {
                    singleArrayValue.push(dataTable[col]);
                }
                doubleArrayValue.push(singleArrayValue);
                singleArrayValue = [];
            }
            //console.log(doubleArrayValue);
            jsonContaintRootQueryIdsValues.succes.status = "OK"
            jsonContaintRootQueryIdsValues.succes.field_ids = doubleArrayValue;

        } else {

            jsonContaintRootQueryIdsValues.failure.notConnected.status = "Failed";
            jsonContaintRootQueryIdsValues.failure.notConnected.message = "No active TAP connection"
            jsonContaintRootQueryIdsValues.failure.otherError.status = "failed"
            jsonContaintRootQueryIdsValues.failure.otherError.message = "error_message"
            // alert('you are not connected');
        }
    }

    return jsonContaintRootQueryIdsValues;

}

TapApi.prototype.getRootQuery = function () {
    var rootQueyJson = {status: "", query: "query"}
    var rootTable = this.connector.service["table"]// .jsonContaintJoinTable.Succes.base_table;
    var jsonAll = this.getObjectMap();
    var schema;
    var contentAdql = "";
    let listJoinAndId = this.getListJoinAndId(this.getConnector().service['table'], this.getObjectMap().succes.object_map);
    let listId = this.getListeId(listJoinAndId)
    // console.log(this.getJoinedTables())
    // console.log(rootTable)

    var dataTable = VOTableTools.votable2Rows(this.votableQueryResult);
    console.log(dataTable);
    var joinIdDic = {};
    /**
     * @TODO JUSTE POUR BESOIN DE DEVELLOPEMENT
     */
    /* const VizierUrl = "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync";
     const XmmUrl = "http://xcatdb.unistra.fr/3xmmdr8/tap/sync";
     var jsonQuerySchema = {
         url : this.url,
         rootTable :root,
         withSchema :VizierUrl||XmmUrl? false:true
     }*/
    for (var i = 0; i < listJoinAndId.length; i = i + 2) {
        if (!json2Requete.isString(listJoinAndId[i])) {
            joinIdDic[listJoinAndId[i + 1]] = listJoinAndId[i][0];
        } else {
            joinIdDic[listJoinAndId[i + 1]] = listJoinAndId[i];
        }
    }
    var i = 0;
    var textJoinConstraint = "";
    var textWhereConstraint = "";
    this.tapWhereConstraint = [];
    this.tapJoinConstraint = []
    for (var keyRoot in jsonAll.succes.object_map) {
        if (keyRoot == rootTable) {

            console.log(keyRoot + " " + rootTable);
            schema = jsonAll.succes.object_map[keyRoot].schema;

            schema = schema.quotedTableName().qualifiedName;

            //var m = 0;
            for (var key in jsonAll.succes.object_map[keyRoot].join_tables) {

                var formatTableName = schema + "." + keyRoot;
                var formatJoinTable = schema + "." + key;
                var correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName
                //alert(formatTableName);
                var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
                //var schemaPrefix = "";
                //schemaPrefix = schema.quotedTableName().qualifiedName ;
                // console.log(schemaPrefix);
                // alert(correctTableNameFormat);
                //var temp1=[],temp2=[];
                contentAdql = "SELECT DISTINCT TOP 60 " + correctTableNameFormat + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].target;
                contentAdql += " FROM  " + correctTableNameFormat;
                textJoinConstraint = " JOIN  " + correctJoinFormaTable + " ";
                //temp1.push(key);

                textJoinConstraint += "ON " + correctTableNameFormat + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].target;
                textJoinConstraint += "=" + correctJoinFormaTable + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from;

                this.tapJoinConstraint.push([key, textJoinConstraint]);
                textJoinConstraint = "";

                let votableFields = this.getRootFields().field_values;

                ////console.log(k+"  iddic "+votableField[k]+" "+joinIdDic[key]+" "+dataTable[k])
                var k = 0;
                for (j = 0; j < votableFields.length; j++) {
                    //  console.log(votableField[j]+" =>  "+joinIdDic[key])
                    if (votableFields[j] == joinIdDic[key]) {
                        k = j;
                        //alert(votableField[j]+" "+joinIdDic[key])
                        // break
                    }

                }

                if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") != -1) {
                    textWhereConstraint = " WHERE " + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + dataTable[k];
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf("rr") != -1 && contentAdql.indexOf("ivoid=") == -1) {
                    //alert(schema+'.'+key+'.'+jsonAll.succes.object_map[keyRoot].join_tables[key].from );
                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") == -1) {
                    if (json2Requete.isString(dataTable[k])) {
                        textWhereConstraint += " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                        this.tapWhereConstraint.push(textWhereConstraint);
                    } else {
                        textWhereConstraint = " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + dataTable[k];
                        this.tapWhereConstraint.push(textWhereConstraint);
                    }
                } else {
                    textWhereConstraint = " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.tapWhereConstraint.push(textWhereConstraint);
                }

                //contentTable[dataTable[k]] = contentAdql;break;
                //break;

            }


            if (this.tapJoinConstraint.length == 0) {
                rootQueyJson.status = "OK";
                rootQueyJson.query = contentAdql;
                return contentAdql;
            } else {

                this.adqlContent = addConstraint(contentAdql, this.tapJoinConstraint, this.tapWhereConstraint);
                if (testRoot == false) {
                    testRoot = true;
                    contA = contentAdql;
                    rootQueyJson.status = "OK";
                    rootQueyJson.query = contentAdql;
                    return contentAdql;

                } else {
                    //console.log(finalQuery);
                    if (splitToJoin[0] != " " || splitToJoin[0] != undefined) {
                        rootQueyJson.status = "OK";
                        rootQueyJson.query = splitToJoin[0];;
                        return splitToJoin[0];
                        //return splitToJoin[0];
                    } else {
                        rootQueyJson.status = "OK";
                        rootQueyJson.query = finalQuery;
                        return finalQuery ;
                    }

                }

            }

            //console.log(this.tapJoinConstraint);
            // console.log(this.tapWhereConstraint);
            // return contentAdql;
        }
    }

}
let contA = "";
let testRoot = false;
testButton = false;
let tabAllQuery = []
let tab = []
let allQuery = "";
let finalQuery = "";
let tabContaninBtnRemoveConstraint = [];

let HtmltabContaninBtnRemoveConstraint = [];

var tempTab = [];
addConstraint = function (rootQuery, table, whereTable) {
    var buttons = "";
    var rootQuerys = []
    this.tapButton = []
    var removeBtn;
    var HtmlRemoveBtn;
    for (let i = 0; i < table.length; i++) {

        buttons = "<span>" +
            "<button  type='button' class=\"btn btn-default\" id='" + table[i][0] + "' value='" + table[i][0] + "' style=\"margin-top: 7px\">Join '" + table[i][0] + "'</button>" +
            " <input type='text' class='form form-control' id='txt" + table[i][0] + "' value='" + whereTable[i] + "'>"

        // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

        if (testButton == true) {
            //alert( 'existe deja')
        } else {
            this.tapButton.push(buttons);
        }

        $("#loadButton").append(this.tapButton[i]);
        window.location.hash = "#loadButton";
        //var btns =this.tapButton;
        $("#" + table[i][0]).click(function () {


            for (let r = 0; r <= tabContaninBtnRemoveConstraint.length; r++) {
                if (tabContaninBtnRemoveConstraint.indexOf(tabContaninBtnRemoveConstraint[r]) > -1) {

                } else {

                    tabContaninBtnRemoveConstraint.push(table[i][0])
                    break;
                }

            }
            tabContaninBtnRemoveConstraint = Array.from(new Set(tabContaninBtnRemoveConstraint));


            //console.log(tabContaninBtnRemoveConstraint);

            // addRemoveBtn(tabContaninBtnRemoveConstraint);


            //rootQuerys;
            //if(rootQuerys.indexOf(rootQuerys[i])>-1){
            //alert( 'existe deja')
            display("Has  been added ", "getStatu")
            // rootQuerys.splice(rootQuerys.indexOf(rootQuerys[i],1));
            //rootQuery +=" "+table[i][1];
            //}else {
            // rootQuerys.push(table[i][1]);
            //rootQuery +=" "+table[i][1]+" "+$("#txt"+table[i][0]).val();

            $("#getJsonAll").text("");
            $("#getJsonAll").append(rootQuery);
            $("#getJsonAll").append(table[i][1]);
            $("#getJsonAll").append($("#txt" + table[i][0]).val());
            // rootQuery = $("#getJsonAll").text();
            //display(rootQuery,"getJsonAll")

            // alert("join value "+table[i][1])
            //  }
            this.adqlContent = [];
            $("#getJsonAll").html($("#getJsonAll").text());
            window.location.hash = "#loadJson";
            tab = []
            tab.push(table[i][1] + " " + whereTable[i]);

            this.adqlContent.push($("#getJsonAll").text());


            document.getElementById("loadButton").style.display = "none"
            document.getElementById("btnConstraint").style.display = "none";


        })


    }
    contA += tab
    allQuery = contA;
    tab = []
    //console.log(this.adqlContent)
    var tabAllQuery2 = []
    console.log(allQuery);
    tabAllQuery = allQuery.split("WHERE");
    let textTabAllQuery = [];
    var joinEssai = "";
    for (let i = 1; i < tabAllQuery.length; i++) {
        joinEssai += tabAllQuery[i];
        textTabAllQuery.push(tabAllQuery[i].split(" "));
    }
    var tabjoinEssai = joinEssai.split(" ");

    for (let i = 0; i < textTabAllQuery.length; i++) {
        tabAllQuery2.push(textTabAllQuery[i][1]);
        tabAllQuery[i + 1].replaceAll(" " + tabAllQuery2[i], " ");
        for (let j = 0; j < tabjoinEssai.length; j++) {
            if (tabjoinEssai[j].trim() == tabAllQuery2[i].trim()) {
                tabjoinEssai.splice(j, 1);
            }
            //joinEssai +=tabjoinEssai[j];
        }

    }
    //var tabAllQuery2 = textTabAllQuery.split(" ");

    console.log(tabAllQuery);
    var final1 = tabAllQuery[0] + " ";
    for (let k = 0; k < tabjoinEssai.length; k++) {
        final1 += tabjoinEssai[k] + " ";
    }
    var final2 = final1;
    if (tabAllQuery2.length > 0) {

        final2 += " WHERE " + tabAllQuery2[0];
    }
    for (let c = 1; c < tabAllQuery2.length; c++) {
        let m = tabAllQuery2[c]
        for (let k = 1; k < tabAllQuery2.length; k++) {
            if (m.trim() == tabAllQuery2[k].trim()) {

            } else {
                if (m.trim() != tabAllQuery2[0].trim()) {
                    final2 += " AND " + tabAllQuery2[c]
                }

            }
        }

    }
    finalQuery = final2;
    $("#getJsonAll").text(finalQuery);
    //console.log("////////////////////////////////////////////////////////////////////////////////////");
    //console.log(final1);
    // console.log(final2);
    testButton = true

    // console.log(this.tapButton);

    // return finalQuery
}
var splitToJoin = [];
var finalQueryRemouve = "";
TapApi.prototype.resetTableConstraint = function (table) {

    //alert(table);
    var schema = this.connector.service["schema"];
    var formatTableName = schema + "." + table;

    var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    if (finalQuery != "") {
        splitToJoin = finalQuery.split('JOIN')
    }

    for (let i = 1; i < splitToJoin.length; i++) {
        if (splitToJoin[i].search(table) != -1) {
            splitToJoin.splice(splitToJoin.indexOf(splitToJoin[i]), 1);
            // finalQuery.replaceAll(splitToJoin[i].trim(), "");
        } else if (splitToJoin.length > 1) {

            splitToJoin[0] += " JOIN " + splitToJoin[i]

        }
        //console.log(splitToJoin)
        if (splitToJoin[i] == undefined) {
            //splitToJoin[i] = "";
        }


    }
    //  splitUndefine = splitToJoin[0];


    //finalQuery = finalQueryRemouve;
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$ " + splitToJoin[0])
    //finalQuery =splitToJoin[0];
    //$("#getJsonAll").text(splitToJoin[0]);
    console.log(splitToJoin[0]);
    tab = [];
    return splitToJoin[0];
}

//var splitUndefine;
function reset() {
    contA = "";
    this.query = "";
    this.tapService = "";
    this.votableQueryResult = "";
    this.correctService = "";
    this.connector.service = {};
    this.testConnection = false;
    this.testDeconnection = false;
    this.correctService = "";
    this.votableQueryResult = "";
    this.query = ""
    this.handlerAttribut = new HandlerAttributs();
    this.tapButton = [];
    this.adqlContent = [];
    this.testJoinConstraint = false;
    this.connector = {status: "", message: "", service: {}}
    this.jsonContaintJoinTable = {
        Succes: {
            status: "",
            base_table: "",
            joined_tables: []
        },
        Failure: {
            NotConnected: {status: "", message: ""},
            WrongTable: {status: "", message: ""}
        }
    }
    finalQuery = "";
    this.tapJoinConstraint = [];
    this.tapWhereConstraint = [];
    contA = "";
    testRoot = false;
    testButton = false;
    tabAllQuery = []
    tab = []
    allQuery = "";
    $(document).ajaxStop(function () {
        window.location.reload();
    });

}

TapApi.prototype.getTableAttributeHandlers = function (table) {

    return this.handlerAttribut.getTableAttributeHandler(table);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


TapApi.prototype.getRootQuery1 = function () {
    let out = "";
    let query
    if (this.testConnection == true) {
        let listJoinAndId = this.getListJoinAndId(this.getConnector().service['table'], this.getObjectMap().succes.object_map);
        let listId = this.getListeId(listJoinAndId)
        // alert(listId);
        //alert(listJoinAndId)
        out = this.tapService.createMainJson(this.query, this.getObjectMap().succes.object_map, this.getConnector().service["table"], listId, listJoinAndId);
        query = json2Requete.getAdql(this.getObjectMap().succes.object_map);
    }

    return query;
}


/**
 *
 * @param {*} listJoinAndId the list of id returned by TapServiceConnector.prototype.getListJoinAndId
 * @return   list of all id
 */

TapApi.prototype.getListeId = function (listJoinAndId) {
    var listId = [];
    for (var i = 0; i < listJoinAndId.length; i = i + 2) {
        if (!json2Requete.isString(listJoinAndId[i])) {
            var temp = listJoinAndId[i][0];
        } else {
            var temp = listJoinAndId[i];
        }
        if (listId.indexOf(temp) == -1) {
            listId.push(temp);//record the key linked to root table, No repeating
        }
    }
    return listId;
}
/**
 *
 *  @param {*} rootName |the root table names of tabservice
 * @param {*} mainJsonData the main json generated by the  method createJson()
 * @returns return array containing all join table with correct id
 */
TapApi.prototype.getListJoinAndId = function (rootName, mainJsonData) {
    //alert(rootName);
    var listJoinAndId = [];
    listJoinAndId = this.joinAndId(rootName, mainJsonData)
    return listJoinAndId;
}
/**
 *
 * @param {*} root  represent the root table
 * @param {*} json represent the main json create by the method createMainJson
 * @returns return the list of id of join table
 */
TapApi.prototype.joinAndId = function (root, json) {
    var list = [];
    for (var key in json) {
        if (key == root) {
            for (var join in json[key].join_tables) {
                list.push(json[key].join_tables[join].target);
                list.push(join);
            }
        }
    }
    return list;
}

TapApi.prototype.joinTable = function (table) {
    let jsonAll = this.getObjectMap().succes.object_map;
    let joinTable = [];

    //alert(jsonAll[table]);
    if (jsonAll[table] == undefined) {
        let json = {}
        jsonAll = json;
        joinTable.push(table);
        //alert(JSON.stringify(joinTable,undefined,2))
    } else {
        // alert(table+ " has join table")
        for (let key in jsonAll[table].join_tables) {
            //alert(key)
            if (key.indexOf("2") != -1) {
                continue; //same rootTable and join_table, I made the second name of the repeat followed by a number 2//@TODO
            } else {
                joinTable.push(key);
            }
        }
    }

    console.log(JSON.stringify(joinTable, undefined, 2));
    return joinTable;
};
