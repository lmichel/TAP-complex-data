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
        this.jsonAdqlContent = {'rootQuery': "", "constraint": {}, 'allJoin': {}, 'allCondition': {},"status":{"status":"",'orderErros':""}}
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
                this.jsonAdqlContent.rootQuery = contentAdql;
                textJoinConstraint = " JOIN  " + correctJoinFormaTable + " ";
                //temp1.push(key);

                textJoinConstraint += "ON " + correctTableNameFormat + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].target;
                textJoinConstraint += "=" + correctJoinFormaTable + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from;
                this.jsonAdqlContent.constraint[correctJoinFormaTable] = textJoinConstraint

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
                var value = '';
                if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") != -1) {

                    textWhereConstraint = " WHERE " + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + dataTable[k];
                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = " "+ schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf("rr") != -1 && contentAdql.indexOf("ivoid=") == -1) {
                    //alert(schema+'.'+key+'.'+jsonAll.succes.object_map[keyRoot].join_tables[key].from );
                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  "+ schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") == -1) {
                    if (json2Requete.isString(dataTable[k])) {
                        textWhereConstraint += " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                        this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                        value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]
                        this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  "+ schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                        this.tapWhereConstraint.push(textWhereConstraint);
                    } else {
                        textWhereConstraint = " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + dataTable[k];
                        this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                        value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]
                        this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  "+ schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                        this.tapWhereConstraint.push(textWhereConstraint);
                    }
                } else {
                    textWhereConstraint = " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    var value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  "+ schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                }

                //contentTable[dataTable[k]] = contentAdql;break;
                //break;

            }

            // console.log(JSON.stringify(this.jsonAdqlContent,undefined,2));


            //console.log(this.tapJoinConstraint);
            // console.log(this.tapWhereConstraint);
            // return contentAdql;
        }
    }
    if (this.tapJoinConstraint.length == 0) {
        rootQueyJson.status = "OK";
        rootQueyJson.query = contentAdql;
        return contentAdql;
    } else {

        this.addConstraint(contentAdql, this.tapJoinConstraint, this.tapWhereConstraint);

        return this.jsonAdqlContent.rootQuery;
       /* if (testRoot == false) {
            testRoot = true;
            contA = contentAdql;
            rootQueyJson.status = "OK";
            rootQueyJson.query = contentAdql;
            return contentAdql;

        } else {
            //console.log(finalQuery);
            if (splitToJoin[0] != " " || splitToJoin[0] != undefined) {
                rootQueyJson.status = "OK";
                rootQueyJson.query = splitToJoin[0];
                ;
                return splitToJoin[0];
                //return splitToJoin[0];
            } else {
                rootQueyJson.status = "OK";
                rootQueyJson.query = finalQuery;
                return finalQuery;
            }

        }*/

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

function getJsonAdqlQuery() {
    //return this.jsonAdqlContent;
}

var jsonTempJoinTap = [];
var jsonTempWhereTap = [];
var countCondition = 0;
var testfor = false
TapApi.prototype.addConstraint = function (rootQuery, table, whereTable) {
    var buttons = "";
    this.tapButton = []
    var jsonAdqlContent = this.jsonAdqlContent;
    let mytest = false;
    var schema = this.connector.service["schema"];
    if(testfor==false) {
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


                let format = schema + '.' + table[i][0];
                let correctTable = format.quotedTableName().qualifiedName;
                for (let r = 0; r <= tabContaninBtnRemoveConstraint.length; r++) {
                    if (tabContaninBtnRemoveConstraint.indexOf(tabContaninBtnRemoveConstraint[r]) > -1) {

                    } else {

                        tabContaninBtnRemoveConstraint.push(table[i][0])
                        break;
                    }

                }
                tabContaninBtnRemoveConstraint = Array.from(new Set(tabContaninBtnRemoveConstraint));

                for (let key in jsonAdqlContent.constraint) {
                    if (key == correctTable) {
                        jsonAdqlContent.allJoin[key] = jsonAdqlContent.constraint[key]
                        //countCondition++;
                        for (let keyConst in jsonAdqlContent.constraint) {
                            if (keyConst == "condition " + correctTable) {
                                //if(jsonAdqlContent.allCondition ==""){
                                jsonAdqlContent.constraint[keyConst] =$("#txt" + table[i][0]).val().replaceAll("WHERE","");
                                    if(mytest==false){
                                        jsonAdqlContent.allCondition[key]=jsonAdqlContent.constraint[keyConst];
                                        mytest =true;
                                    }else {
                                        jsonAdqlContent.allCondition[key]=" AND "+ jsonAdqlContent.constraint[keyConst];
                                    }

                                //alert(jsonAdqlContent.constraint[keyConst]);
                            }
                        }
                    }
                }

                document.getElementById("loadButton").style.display = "none"
                document.getElementById("btnConstraint").style.display = "none";
                 $("#getJsonAll").text(jsonAdqlContent.rootQuery);
                console.log(jsonAdqlContent.rootQuery);
            })

            testfor = true;
        }

    }
    //alert(JSON.stringify(jsonAdqlContent.allJoin.length))
    var testWhere = false; var testFistAnd = false;var testEndAnd = false
    if(JSON.stringify(jsonAdqlContent.allJoin)!=="{}") {

        for (let key in jsonAdqlContent.allJoin) {
            jsonAdqlContent.rootQuery += jsonAdqlContent.allJoin[key] ;
        }
        for (let keyconst in jsonAdqlContent.allCondition) {
            if(testWhere==false){
                //jsonAdqlContent.rootQuery=jsonAdqlContent.rootQuery+" WHERE "
                jsonAdqlContent.rootQuery+=" WHERE "+jsonAdqlContent.allCondition[keyconst]+' ';
                testWhere = true;
            }else {

                jsonAdqlContent.rootQuery+=jsonAdqlContent.allCondition[keyconst];
            }

        }
    }

    /**
     * if you remouve a constrain we verified that there is not a duplication of WHERE OR AND condition
     * */
    if(jsonAdqlContent.rootQuery.search("WHERE   AND")>-1){
        let g = jsonAdqlContent.rootQuery.slice(0,jsonAdqlContent.rootQuery.search("WHERE   AND"))
        let g2 = jsonAdqlContent.rootQuery.slice(jsonAdqlContent.rootQuery.search("WHERE   AND"),jsonAdqlContent.rootQuery.length);
        g2 = g2.replaceAll("WHERE   AND","WHERE");
       //alert(g+' '+g2);
        g+=" "+g2;
        jsonAdqlContent.rootQuery=g;
    }
    if(jsonAdqlContent.rootQuery.search("WHERE  AND")>-1){
        var g = jsonAdqlContent.rootQuery.slice(0,jsonAdqlContent.rootQuery.search("WWHERE  AND"))
        var g2 = jsonAdqlContent.rootQuery.slice(jsonAdqlContent.rootQuery.search("WHERE  AND"),jsonAdqlContent.rootQuery.length);
        g2 = g2.replaceAll("WHERE  AND"," WHERE ");
        //alert(g+' '+g2);
        g+=" "+g2;
        jsonAdqlContent.rootQuery=g;
    }


    if(jsonAdqlContent.rootQuery.trim().endsWith("WHERE") ==true){
        jsonAdqlContent.rootQuery = jsonAdqlContent.rootQuery.trim().replaceAll("WHERE","");
    }
    this.jsonAdqlContent = jsonAdqlContent;
    testButton = true
    return this.jsonAdqlContent;
}

//var splitToJoin = [];
//var finalQueryRemouve = "";
TapApi.prototype.resetTableConstraint = function (table) {
;
    var schema = this.connector.service["schema"];
    var formatTableName = schema + "." + table;

    var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    for (let key in this.jsonAdqlContent.allJoin) {
        if(key==correctTableNameFormat){
            this.jsonAdqlContent.allJoin[key]="";
            this.jsonAdqlContent.allCondition[key]="";
            this.jsonAdqlContent.rootQuery.replaceAll("AND   AND","AND")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE   AND ","WHERE")
            this.jsonAdqlContent.status.status="OK";
        }else {
            this.jsonAdqlContent.status.status="Failed";
            //this.jsonAdqlContent.status.orderErros="The join table query not exist in rootQuery";
        }
        //jsonAdqlContent.rootQuery += " " + jsonAdqlContent.allJoin[key] + " ";
    }
    //$("#getJsonAll").text(this.jsonAdqlContent.rootQuery);
    return this.jsonAdqlContent;

}

//var splitUndefine;
function reset() {

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
