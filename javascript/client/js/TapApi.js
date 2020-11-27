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
        this.handlerAttribut = ''//new HandlerAttributs();

        this.tapButton = undefined;
        this.adqlContent = [];
        this.jsonAdqlContent = {
            'rootQuery': "",
            "constraint": {},
            'allJoin': {},
            'allCondition': {},
            "status": {"status": "", 'orderErros': ""}
        }
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
        this.attributsHandler = new HandlerAttributs();
        this.attributsHandler.api = this;
        this.tapJoinConstraint = [];
        this.tapWhereConstraint = [];
        this.jsonCorrectTableColumnDescription = {"addAllColumn": {}};

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
 * Private variable for my classe
 * */
let testRoot = false;
let testButton = false;
let tab = []
let tabContaninBtnRemoveConstraint = [];
let HtmltabContaninBtnRemoveConstraint = [];
let tempTab = [];

//for add AHS to handlerJson after runing query

let testSecondJson = false;
let jsonContaintHandlersValue1 = []
let dataTable1 = [];
// for method getRootField

let rootFields = []
var testLoadRootField = false;

// for getrootQuery
var testGetObjectMap = false;
var jsonAll

// for getObjectWhith all description
var testLoadObjectMapWithAllDesc = false;
let getObjectMapWithAllDescription

var testApiRooQuery = false;
let api = "";
let table = []

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
    this.tapService.api = this;
    this.handlerAttribut.api = this.tapService.api;
    this.handlerAttribut = this.tapService;

    if (this.getJsonStatu(this.votableQueryResult).success.status == 'OK') {
        this.testConnection = true;
        this.connector.status = 'OK';
        this.connector.service["tapService"] = tapService;
        this.connector.service["schema"] = schema;
        this.connector.service["table"] = table;
        this.connector.service["shortName"] = shortName;
        this.connector.message = "Active TAP : " + shortName


        /* for vizier because somme error found */

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
        // alert("No Tap service connected");
    }
}

TapApi.prototype.getObjectMap = function () {
    var objectMap = {
        succes: {status: "", object_map: {}},
        failure: {status: "", message: ""}
    }
    if (this.testConnection == true) {

        objectMap.succes.status = "OK"
        objectMap.succes.object_map = this.getObjectMapWithAllDescriptions();
        return objectMap;
    } else {
        objectMap.failure.status = "Failed"
        objectMap.failure.message = "No active TAP connection";
        return objectMap
    }

    //console.log(JSON.stringify(objectMap,undefined,3));
    // return objectMap;
}
/**
 * @param baseTable (string): Table from which joint table are searched
 * */
TapApi.prototype.getJoinedTables = function (baseTable) {


    if (this.testConnection == true) {
        this.jsonContaintJoinTable.Succes.status = "OK";
        this.jsonContaintJoinTable.Succes.base_table = baseTable;
        this.jsonContaintJoinTable.Succes.joined_tables = this.handlerAttribut.objectMapWithAllDescription.map[baseTable].join_tables//this.correctService.getJoinTables(baseTable);
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
 * @param {*} mainJsonData the main json create by the method createMainJson of Tapservice
 * @returns return all join request of each join table of the mainJson
 */
let isloadRootQuery = false;
let votableQueryResult = ""
TapApi.prototype.getRootFields = function () {

    let jsonContaintRootFields = {
        succes: {status: "", field_values: []},
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }

    // let rootFields = [];
    if (this.testConnection === true) {
        //
        // alert(this.jsonAdqlContent.rootQuery);
        //let votableQueryResult = ""//this.tapService.Query(this.getRootQuery());
        if(isloadRootQuery == false){
            votableQueryResult = this.tapService.Query(this.getRootQuery());
            isloadRootQuery = true;
        }
        let contentText = votableQueryResult.responseText;
        if (this.getConnector().service.tapService === "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.getConnector().service.tapService === "http://dc.zah.uni-heidelberg.de/tap/sync") {

            rootFields = VOTableTools.getField(votableQueryResult);
        } else {
            rootFields = VOTableTools.genererField(votableQueryResult, contentText);
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
        this.votableQueryResult = this.tapService.Query(this.getRootQuery());
        let rootable = this.connector.service["table"];
        let schema = this.connector.service["schema"];
        ;
        let dataTable = VOTableTools.votable2Rows(this.votableQueryResult);
        let tableName = this.getConnector().service["table"];

        let nbCols = Field.length;
        if (dataTable[dataTable.length - 1] == 0) {
            dataTable.splice(dataTable.length - 1, 1);
        }
        for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {//table  content
            for (let col = 0; col < nbCols; col++) {
                if (dataTable[rowNb + col] != null)
                    singleArrayValue.push(dataTable[rowNb + col]);
            }
            doubleArrayValue.push(singleArrayValue);
            singleArrayValue = [];
        }


        /////////////////////////////BEGIN PART TO CREATE TABLE CONTENT AHS AFTER RUNING ROOT QUERY TO PU IN THE MAP/////////////////////////////

        if (testSecondJson == false) {
            dataTable1 = this.attributsHandler.getTableAttributeHandler(rootable, schema)// VOTableTools.votable2Rows(adql1);
            testSecondJson = true;
        }
        for (let b = 0; b < dataTable1.attribute_handlers.length; b++) {
            for (let ke in dataTable1.attribute_handlers[b]) {
                for (let col = 0; col < Field.length; col++) {
                    if (dataTable1.attribute_handlers[b][ke] === Field[col]) {
                        jsonContaintHandlersValue1.push(dataTable1.attribute_handlers[b])
                        jsonContaintHandlersValue1 = Array.from(new Set(jsonContaintHandlersValue1));

                    } else {

                    }
                }
            }
        }
        jsonContaintHandlersValue1 = Array.from(new Set(jsonContaintHandlersValue1));
        this.handlerAttribut.objectMapWithAllDescription.map['handler_attributs'] = jsonContaintHandlersValue1;

        ////////////////////////////////////END PART TO CREATE TABLE CONTENT AHS AFTER RUNING ROOT QUERY TO PU IN THE MAP////////////////////////

        jsonContaintRootFieldValues.succes.status = "OK"
        jsonContaintRootFieldValues.succes.field_values = doubleArrayValue;

    } else {

        jsonContaintRootFieldValues.failure.notConnected.status = "Failed";
        jsonContaintRootFieldValues.failure.notConnected.message = "No active TAP connection"
        jsonContaintRootFieldValues.failure.otherError.status = "failed"
        jsonContaintRootFieldValues.failure.otherError.message = "error_message"

    }

    return jsonContaintRootFieldValues;

}

// private function  to modify key
function modifyKeys(obj) {
    Object.keys(obj).forEach(key => {
        obj[`${obj[key].column_name}`] = obj[key];
        delete obj[key];
        if (typeof obj[`${obj[key].column_name}`] === "object") {
            modifyKeys(obj[`${obj[key].column_name}`]);
        }
    });
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

        this.votableQueryResult = this.tapService.Query(this.getRootQuery());
        let rootable = this.connector.service["table"];
        let schema = this.connector.service["schema"];
        let dataTable = []
        if (this.votableQueryResult.statusText == "OK") {
            dataTable = VOTableTools.votable2Rows(this.votableQueryResult);
            let tableName = this.getConnector().service["table"];

            let nbCols = Field.length;
            if (dataTable[dataTable.length - 1] == 0) {
                dataTable.splice(dataTable.length - 1, 1);
            }
            for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {//table  content
                for (let col = 0; col < nbCols; col++) {
                    if (dataTable[rowNb + col] != null)
                        singleArrayValue.push(dataTable[rowNb + col]);
                }
                doubleArrayValue.push(singleArrayValue);
                singleArrayValue = [];
            }
            //var query = "SELECT TOP 60 \"public\".basic.oid   FROM  \"public\".basic  JOIN   \"public\".otypes ON  \"public\".basic.oid= \"public\".otypes.oidref";
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
    //var rootQueyJson = {status: "", query: "query"}
    let rootTable = this.getConnector().service["table"]// .jsonContaintJoinTable.Succes.base_table;
    // jsonAll = this.getObjectMap().succes.object_map;
    let schema;
    let contentAdql = "";
    let textJoinConstraint = "";
    let objectMap = this.getObjectMap().succes.object_map //this.tapService.getObjectMapAndConstraint(jsonAll,rootTable);
    let map = objectMap.map
    for (var keyRoot in map) {
       // console.log(keyRoot + '  ' + rootTable)
        if (keyRoot == rootTable) {
            schema = this.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;
            for (var key in map[keyRoot].join_tables) {
                let formatTableName = schema + "." + keyRoot;
                let formatJoinTable = schema + "." + key;
                let correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName
                let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

                contentAdql = "SELECT DISTINCT TOP 60 " + correctTableNameFormat + "." + map[keyRoot].join_tables[key].target;
                contentAdql += '\n' + " FROM  " + correctTableNameFormat;
                this.jsonAdqlContent.rootQuery = contentAdql;
                textJoinConstraint = " JOIN  " + correctJoinFormaTable + " ";
                textJoinConstraint += "ON " + correctTableNameFormat + "." + map[keyRoot].join_tables[key].target;
                textJoinConstraint += "=" + correctJoinFormaTable + "." + map[keyRoot].join_tables[key].from;
                this.jsonAdqlContent.constraint[correctJoinFormaTable] = textJoinConstraint
                //this.tapJoinConstraint.push([key, textJoinConstraint]);
                textJoinConstraint = "";
                let json2 = map[keyRoot].join_tables[key]
                if (json2.join_tables !== undefined) {
                    for (let f in json2.join_tables) {
                        let firstJoin = this.jsonAdqlContent.constraint[correctJoinFormaTable]
                        let secondformatJoinTable = schema + "." + f;
                        let secondcorrectJoinFormaTable = secondformatJoinTable.quotedTableName().qualifiedName
                        textJoinConstraint = " JOIN  " + secondformatJoinTable + " ";
                        textJoinConstraint += "ON " + correctJoinFormaTable + "." + json2.join_tables[f].target;
                        textJoinConstraint += "=" + secondformatJoinTable + "." + json2.join_tables[f].from;
                        this.jsonAdqlContent.constraint["condition " + secondformatJoinTable] = ""
                        this.jsonAdqlContent.constraint[secondformatJoinTable] = firstJoin + " " + textJoinConstraint
                        for (let c in json2.join_tables[f]) {
                            let json3 = json2.join_tables[f].join_tables
                            if (json3 !== undefined) {
                                for (let c1 in json3) {
                                    let secondJoin = this.jsonAdqlContent.constraint[secondformatJoinTable]
                                    let thirdformatJoinTable = schema + "." + c1;
                                    let thirdcorrectJoinFormaTable = thirdformatJoinTable.quotedTableName().qualifiedName
                                    textJoinConstraint = " JOIN  " + thirdformatJoinTable + " ";
                                    textJoinConstraint += "ON " + secondcorrectJoinFormaTable + "." + json3[c1].target;
                                    textJoinConstraint += "=" + thirdformatJoinTable + "." + json3[c1].from;
                                    this.jsonAdqlContent.constraint["condition " + thirdformatJoinTable] = ""
                                    this.jsonAdqlContent.constraint[thirdformatJoinTable] = secondJoin + " " + textJoinConstraint
                                }
                            }
                        }
                    }
                }
                this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = " " + schema + "." + key + "." + map[keyRoot].join_tables[key].from + "=" + "";
            }
        }
    }
    for (let key in this.jsonAdqlContent.allJoin) {
        if (this.jsonAdqlContent.rootQuery.indexOf(this.jsonAdqlContent.allJoin[key]) !== -1) {
        } else {
            this.jsonAdqlContent.rootQuery += '\n' + this.jsonAdqlContent.allJoin[key];
        }
    }
    this.addConstraint();
    return this.jsonAdqlContent.rootQuery;
}

TapApi.prototype.addConstraint = function () {
    this.jsonAdqlContent = this.correctService.createCorrectJoin(this);
    let objectMapWithAllDescription = this.getObjectMap().succes.object_map;
    /**
     * Search a good place to put where and AND close to adql query
     * */
    //var testWhere = false;
    // if (JSON.stringify(jsonAdqlContent.allJoin) !== "{}") {

    for (let keyconst in objectMapWithAllDescription.tables) {
        if (this.jsonAdqlContent.rootQuery.indexOf("WHERE") === -1) {
            //jsonAdqlContent.rootQuery=jsonAdqlContent.rootQuery+" WHERE "
            if (objectMapWithAllDescription.tables[keyconst].constraints.length === 0) {

            } else {
                this.jsonAdqlContent.rootQuery += '\n' + " WHERE " + objectMapWithAllDescription.tables[keyconst].constraints + ' ';
            }
            /// testWhere = true;
        } else {
            if (this.jsonAdqlContent.rootQuery.indexOf(objectMapWithAllDescription.tables[keyconst].constraints) !== -1) {

            } else {
                this.jsonAdqlContent.rootQuery += '\n' + " AND " + objectMapWithAllDescription.tables[keyconst].constraints;
            }
        }
    }


    //}

    /**
     * if you remouve a constrain we verified that there is not a duplication of WHERE OR AND condition
     * */

    this.jsonAdqlContent.rootQuery = this.correctService.replaceWhereAnd(this.jsonAdqlContent.rootQuery);

    /**
     * when we are removing all constraint, we verified if rootQuery end with WHERE close.
     * if so, we remove the WHERE close to rootQuery
     * */
    if (this.jsonAdqlContent.rootQuery.trim().endsWith("WHERE") == true) {
        this.jsonAdqlContent.rootQuery = this.jsonAdqlContent.rootQuery.trim().replaceAll("WHERE", "");
    }
    // this.jsonAdqlContent = this.jsonAdqlContent;
}


/**
 *@param{*} str : String the root query
 * @param{*} find : String the short string you search in the root query
 * @param{*} replace : String the replace value of the search element
 **/
function replaceAll(str, find, replace) {

    var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}

//var splitToJoin = [];
//var finalQueryRemouve = "";
/**
 *@param{*} table : String the name of table you want to remove the contraint associeted with
 * @return{*} : Json the json containing root Query with all join table and all condition of each table
 **/
TapApi.prototype.resetTableConstraint = function (table) {
    ;
    var schema = this.connector.service["schema"];
    var formatTableName = schema + "." + table;

    var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    for (let key in this.getObjectMap().succes.object_map.tables) {
        if (key == table) {
            this.getObjectMap().succes.object_map.tables[key].constraints = ""//= "";
            delete this.jsonAdqlContent.allJoin[correctTableNameFormat];
            delete this.jsonAdqlContent.allCondition[correctTableNameFormat];
            this.jsonAdqlContent.status.status = "OK";
        } else {
            this.jsonAdqlContent.status.status = "Failed";
        }
    }
    return this.jsonAdqlContent;
}
/*TapApi.prototype.resetTableConstraint = function (table) {
    ;
    var schema = this.connector.service["schema"];
    var formatTableName = schema + "." + table;

    var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    for (let key in this.jsonAdqlContent.allJoin) {
        if (key == correctTableNameFormat) {
           delete this.jsonAdqlContent.allJoin[key] //= "";
            delete this.jsonAdqlContent.allCondition[key] //= "";
             this.jsonAdqlContent.status.status = "OK";
        } else {
            this.jsonAdqlContent.status.status = "Failed";
            //this.jsonAdqlContent.status.orderErros="The join table query not exist in rootQuery";
        }
        //jsonAdqlContent.rootQuery += " " + jsonAdqlContent.allJoin[key] + " ";
    }
    //$("#getJsonAll").text(this.jsonAdqlContent.rootQuery);
    return this.jsonAdqlContent;
}*/
/**
 *@param{*} table : String the name of table you want to remove the contraint associeted with
 * @return{*} : Json the json containing root Query with all join table and all condition of each table
 **/
TapApi.prototype.resetAll = function () {

    for (let key in this.getObjectMapWithAllDescriptions().tables) {
        this.resetTableConstraint(key);
        this.jsonAdqlContent.status.status = "OK";
    }
    return this.jsonAdqlContent;
}


/**
 * @param {*} table : String the name of table you want get handlerAttribut associeted with
 * @return{*} : Json the json containing all handler Attribut of the table
 * */
TapApi.prototype.getTableAttributeHandlers = function (table) {

    return this.handlerAttribut.getTableAttributeHandler(table);
}
/**
 *@return{*} : Json the json containing all detail about every singel table join to the root table with all join table of each table and all condition of each table
 **/

TapApi.prototype.getObjectMapWithAllDescriptions = function () {
    //if(testLoadObjectMapWithAllDesc==false){
    getObjectMapWithAllDescription = this.handlerAttribut.getObjectMapAndConstraints();
    // testLoadObjectMapWithAllDesc = true;
    //  }
    return getObjectMapWithAllDescription;
}
var testforConstrain = false
/**
 * @return{*} : Json the json containing all detail about every singel table join to the root table with hadler atribut of choosing table you want to get it handler attribut
 * */
TapApi.prototype.setObjectMapWithAllDescriptionConstraint = function () {
    var testButton = false;
//var h = new HandlerAttributs();
    var tapButton = [];
    api = this;
    //this.tapWhereConstraint = [];
    // this.tapJoinConstraint = []
    tapButton = [];
    let tempTable = []
    if (testApiRooQuery == false) {
        api.getRootQuery();
        table = api.tapService.allTable();
        testApiRooQuery = true;
    }
    let schema = api.connector.service["schema"];
    if (testforConstrain == false) {

        /* for (let key in this.handlerAttribut.objectMapWithAllDescription.tables) {
             tempTable.push(key)
         }
         tempTable = Array.from(new Set(tempTable));*/
        table = allJoinRootTable
        for (let i = 0; i < table.length; i = i + 1) {
            if (table[i].search(schema + ".") > -1) {
                table[i] = table[i].replaceAll(schema + ".", "")
            }
            var buttons = this.correctService.createB(table[i], i) // "<button  type='button' class=\"btn btn-warning\" id='b" + table[i] + i + "' value='" + table[i] + "' style=\"margin-top: 7px\">handler '" + table[i] + "'</button></span>"
            // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

            if (testButton == true) {
                //alert( 'existe deja')
            } else {
                tapButton.push(buttons);
            }
            document.getElementById("loadbuttonsHandler").style.display = "block"

        }

        $("#loadbuttonsHandler").append(tapButton);

        window.location.hash = "#loadbuttonsHandler";
        for (let i = 0; i < table.length; i = i + 1) {

            //document.getElementById("loadbuttonsHandler").style.display = "block"
            $("#b" + table[i] + i).click(function () {

                let format = schema + '.' + table[i];
                let correctTable = format.quotedTableName().qualifiedName;

                document.getElementById("loadbuttonsHandler").style.display = "none"
                var json = "";
                //console.log(json);

                //alert(api.jsonCorrectTableColumnDescription.addAllColumn[correctTable] )
                // document.getElementById("loadbuttonsHandler").style.display = "none"
                if (api.jsonCorrectTableColumnDescription.addAllColumn[correctTable] == undefined) {
                    json = api.getTableAttributeHandlers(table[i]);
                    api.jsonCorrectTableColumnDescription.addAllColumn[correctTable] = json.attribute_handlers;
                }

                display(JSON.stringify(api.jsonCorrectTableColumnDescription.addAllColumn[correctTable], undefined, 2), "getJsonAll")
                display(json.status, "getStatu")
                //return api.jsonCorrectTableColumnDescription;

            })
        }
    }
    testforConstrain = true;
    testButton = true;

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

