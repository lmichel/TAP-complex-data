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

let isloadRootQuery = false;
let votableQueryResult = ""

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
    //this.correctService.tapService = new TapService(tapService, schema, shortName, true)
    this.correctService = new TapServiceConnector(tapService, schema, shortName);
    this.votableQueryResult = this.correctService.Query(this.query);
    this.correctService.api = this;
    this.handlerAttribut.api = this.correctService.api;
    this.handlerAttribut = this.correctService;

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
    this.setConnectionQuery = {"query": {}}
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
        if (isloadRootQuery == false) {
            votableQueryResult = this.correctService.Query(this.getRootQuery());
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


TapApi.prototype.getRootFieldValues = function (query) {
    let jsonContaintRootFieldValues = {
        succes: {status: "", field_values: []},
        datatable : [],
        field : [],
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }

    let doubleArrayValue = [];
    let singleArrayValue = [];
    if (this.testConnection == true) {
        let Field =[]// this.getRootFields().field_values;
        this.votableQueryResult = this.correctService.Query(query);
        let rootable = this.connector.service["table"];
        let schema = this.connector.service["schema"];
        ;
        let dataTable = VOTableTools.votable2Rows(this.votableQueryResult);
        let tableName = this.getConnector().service["table"];
        jsonContaintRootFieldValues.datatable=dataTable;
        let votableQueryResult="";
        if(query!==undefined) {
            votableQueryResult = this.correctService.Query(query);
        }
        let contentText = votableQueryResult.responseText;

            if (this.getConnector().service.tapService === "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.getConnector().service.tapService === "http://dc.zah.uni-heidelberg.de/tap/sync") {

                Field = VOTableTools.getField(votableQueryResult);
            } else {
                Field = VOTableTools.genererField(votableQueryResult, contentText);
            }

        jsonContaintRootFieldValues.field=Field
        //////////////////////////////////////////

        let nbCols = Field.length;
        if (dataTable[dataTable.length - 1] == 0) {
          //  dataTable.splice(dataTable.length - 1, 1);
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
                console.log(ke +"-----------------");
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
        this.votableQueryResult = this.correctService.Query(this.getRootQuery());
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
        }
    }
    return jsonContaintRootQueryIdsValues;
}

TapApi.prototype.getRootQuery = function () {
       let rootTable = this.getConnector().service["table"];
    //let rootTable = this.getConnector().service["table"]// .jsonContaintJoinTable.Succes.base_table;
    // jsonAll = this.getObjectMap().succes.object_map;
    let schema;
    let contentAdql = "";
    let textJoinConstraint = "";
    let objectMap = this.getObjectMap().succes.object_map //this.tapService.getObjectMapAndConstraint(jsonAll,rootTable);
    let map = objectMap.map
    for (var keyRoot in map) {//jou
        // console.log(keyRoot + '  ' + rootTable)
        if (keyRoot == rootTable){
            schema = this.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;
            for (var key in map[rootTable].join_tables) {
                let formatTableName = schema + "." + rootTable;
                let formatJoinTable = schema + "." + key;
                let correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName
                let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

                contentAdql = "SELECT DISTINCT TOP 60 " + correctTableNameFormat + "." + map[rootTable].join_tables[key].target;
                contentAdql += '\n' + " FROM  " + correctTableNameFormat;
                this.jsonAdqlContent.rootQuery = contentAdql;
                textJoinConstraint = " JOIN  " + correctJoinFormaTable + " ";
                textJoinConstraint += "ON " + correctTableNameFormat + "." + map[rootTable].join_tables[key].target;
                textJoinConstraint += "=" + correctJoinFormaTable + "." + map[rootTable].join_tables[key].from;
                this.jsonAdqlContent.constraint[correctJoinFormaTable] = textJoinConstraint
                //this.tapJoinConstraint.push([key, textJoinConstraint]);
                textJoinConstraint = "";
                let json2 = map[rootTable].join_tables[key]
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
    for (let keyconst in objectMapWithAllDescription.tables) {
        if (this.jsonAdqlContent.rootQuery.indexOf("WHERE") === -1) {
            //jsonAdqlContent.rootQuery=jsonAdqlContent.rootQuery+" WHERE "
            if (objectMapWithAllDescription.tables[keyconst].constraints.length === 0) {

            } else {
                this.jsonAdqlContent.rootQuery += '\n' + " WHERE " + objectMapWithAllDescription.tables[keyconst].constraints + ' ';
            }
        } else {
            if (this.jsonAdqlContent.rootQuery.indexOf(objectMapWithAllDescription.tables[keyconst].constraints) !== -1) {

            } else {
                this.jsonAdqlContent.rootQuery += '\n' + " AND " + objectMapWithAllDescription.tables[keyconst].constraints;
            }
        }
    }
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
    return this.attributsHandler.getTableAttributeHandler(table);
}
/**
 *@return{*} : Json the json containing all detail about every singel table join to the root table with all join table of each table and all condition of each table
 **/

TapApi.prototype.getObjectMapWithAllDescriptions = function () {
    getObjectMapWithAllDescription = this.handlerAttribut.getObjectMapAndConstraints();
    return getObjectMapWithAllDescription;
}
TapApi.prototype.setConnector = function (rootTable, constraint) {
    let adql = ''
    let root = this.getConnector().service["table"]
    let schema;
    let objectMap = this.getObjectMap().succes.object_map
    let map = objectMap.map[root].join_tables
    schema = this.connector.service["schema"];
    schema = schema.quotedTableName().qualifiedName;
    if(constraint!=="" || constraint!==undefined){
        for (var keyRoot in map) {//jou
            if (keyRoot === rootTable) {
                let formatTableName = schema + "." + keyRoot;
                let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
                adql = "SELECT DISTINCT TOP 60 " + correctTableNameFormat + "." + map[keyRoot].from;
                adql += '\n' + " FROM  " + correctTableNameFormat;
                adql += '\n' + " WHERE  " + correctTableNameFormat + "." + map[keyRoot].from + " = " + constraint;
                console.log(adql);
                return adql;
            }
            if (keyRoot !== rootTable) {
                let formatTableName = schema + "." + keyRoot;
                let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
                for (let ke in map[keyRoot]) {
                    //console.log(ke)
                    if (ke === "join_tables") {
                        for (let k in map[keyRoot][ke]) {
                            //console.log(k);
                            if (k === rootTable) {
                                // console.log(map[keyRoot][ke])
                                let formatTableName2 = schema + "." + k;
                                let correctTableNameFormat2 = formatTableName2.quotedTableName().qualifiedName;
                                adql = "SELECT DISTINCT TOP 60 " + correctTableNameFormat2 + "." + map[keyRoot][ke][k].from;
                                adql += '\n' + " FROM  " + correctTableNameFormat2;
                                adql += " JOIN " + correctTableNameFormat + " ON " + correctTableNameFormat + "." + map[keyRoot].join_tables[k].target
                                adql += " = " + correctTableNameFormat2 + "." + map[keyRoot][ke][k].from
                                adql += '\n' + " WHERE  " + correctTableNameFormat + "." + map[keyRoot].from + " = " + constraint;
                                return adql;
                            }
                        }
                    }
                }
            }
        }
    }
}
