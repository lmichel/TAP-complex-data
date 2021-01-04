class TapApi {
    constructor() {
        this.tapServiceConnector = "";
    }
}

/**
 * @param params (Json) with parameters (tapService,schema,table,shortName)
 * @param tapService (String) The URL of the Tap Servie
 * @param schema (String) Schema containing the complex object
 * @param table (String) Root table of the complex object
 * @param shortName (String) The Shortname of database
 * */
let votableQueryResult = ""
TapApi.prototype.initConnetor =function (tapService, schema, table, shortName,initJson){
    initJson.status = 'OK';
    initJson.service["tapService"] = tapService;
    initJson.service["schema"] = schema;
    initJson.service["table"] = table;
    initJson.service["shortName"] = shortName;
    initJson.message = "Active TAP : " + shortName
}

TapApi.prototype.connect = function ({tapService, schema, table, shortName}) {
    let formatTableName = schema + "." + table;
    let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    this.tapServiceConnector = new TapServiceConnector(tapService, schema, shortName);
    this.tapServiceConnector.connector.votable = this.tapServiceConnector.Query(this.tapServiceConnector.setAdqlConnectorQuery(correctTableNameFormat));
    this.tapServiceConnector.api = this;
    if (this.tapServiceConnector.connector.votable.statusText === "OK") {
        this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector)
    }
    /* for vizier only*/
    else if (this.tapServiceConnector.connector.votable !== undefined && shortName === "Vizier") {
        this.initConnetor(tapService, schema, table, shortName)
    } else {
        this.tapServiceConnector.connector.status = 'Failled';
        this.tapServiceConnector.connector.message = "No active TAP connection"
    }
    this.tapServiceConnector.attributsHandler.api = this.tapServiceConnector.api;
    return this.tapServiceConnector.connector;
}

TapApi.prototype.disconnect = function () {
    this.tapServiceConnector = null;
    this.getConnector().votable = null;
    if (this.tapServiceConnector === null && this.getConnector().votable == null) {
        this.tapServiceConnector.connector.status = 'Failed'
        return this.tapServiceConnector.connector.status;
    }
}

TapApi.prototype.getConnector = function () {
    if(this.tapServiceConnector.connector===undefined){
        return ""
    }else {
        return this.tapServiceConnector.connector;
    }

}

TapApi.prototype.getObjectMap = function () {
    let objectMap = {succes: {status: "", object_map: {}}, failure: {status: "", message: ""}}
    if (this.getConnector().status === 'OK') {
        objectMap.succes.status = "OK"
        objectMap.succes.object_map = this.getObjectMapWithAllDescriptions();
        return objectMap;
    } else {
        objectMap.failure.status = "Failed"
        objectMap.failure.message = "No active TAP connection";
        return objectMap
    }
}

/**
 * @param baseTable (string): Table from which joint table are searched
 * */
TapApi.prototype.getJoinedTables = function (baseTable) {
    if (this.getConnector().status === 'OK') {
        this.tapServiceConnector.jsonContaintJoinTable.Succes.status = "OK";
        this.tapServiceConnector.jsonContaintJoinTable.Succes.base_table = baseTable;
        this.tapServiceConnector.jsonContaintJoinTable.Succes.joined_tables = this.tapServiceConnector.objectMapWithAllDescription.map[baseTable].join_tables//this.tapServiceConnector.getJoinTables(baseTable);
    } else {
        this.tapServiceConnector.jsonContaintJoinTable.succes.status = "Failed";
        this.tapServiceConnector.jsonContaintJoinTable.Failure.NotConnected.message = "No active TAP connection";
        this.tapServiceConnector.jsonContaintJoinTable.Failure.WrongTable.status = "Failed";
        this.tapServiceConnector.jsonContaintJoinTable.Failure.WrongTable.message = "table " + baseTable + " is not part of the object map"
    }
    return this.tapServiceConnector.jsonContaintJoinTable;
}

/**
 * @param {*} mainJsonData the main json create by the method createMainJson of Tapservice
 * @returns return all join request of each join table of the mainJson
 */
TapApi.prototype.getRootFields = function () {
    let jsonContaintRootFields = {succes: {status: "", field_values: []}, failure: {notConnected: {status: "", message: ""}, otherError: {status: "", message: ""}}}
    let rootFields = [];
    if (this.getConnector().status === 'OK') {
        if (isloadRootQuery == false) {
            votableQueryResult = this.tapServiceConnector.Query(this.getRootQuery());
            isloadRootQuery = true;
        }
        rootFields = this.tapServiceConnector.getFields(votableQueryResult, this.getConnector().service.tapService)
        jsonContaintRootFields.succes.status = "OK"
        jsonContaintRootFields.succes.field_values = rootFields;
        return jsonContaintRootFields.succes;
    } else {
        jsonContaintRootFields.failure.notConnected.status = "Failed";
        jsonContaintRootFields.failure.notConnected.message = "No active TAP connection"
        jsonContaintRootFields.failure.otherError.status = "failed"
        jsonContaintRootFields.failure.otherError.message = "error_message"
        return jsonContaintRootFields.failure
    }
}


TapApi.prototype.getRootFieldValues = function (query) {
    let jsonContaintRootFieldValues = {succes: {status: "", field_values: []}, datatable: [], field: [], failure: {notConnected: {status: "", message: ""}, otherError: {status: "", message: ""}}}
    let doubleArrayValue = [];
    let singleArrayValue = [];
    if (this.getConnector().status === 'OK') {
        let rootable = this.getConnector().service["table"];
        let schema = this.tapServiceConnector.connector.service["schema"];
        let votableQueryResult = "";
        if (query !== undefined) {
            votableQueryResult = this.tapServiceConnector.Query(query);
        }
       let Field = this.tapServiceConnector.getFields(votableQueryResult, this.getConnector().service.tapService)
        let dataTable = this.tapServiceConnector.getDataTable(votableQueryResult);
        jsonContaintRootFieldValues.datatable = dataTable;
        jsonContaintRootFieldValues.field = Field
        let nbCols = Field.length;
        for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {
            for (let col = 0; col < nbCols; col++) {
                if (dataTable[rowNb + col] != null)
                    singleArrayValue.push(dataTable[rowNb + col]);
            }
            doubleArrayValue.push(singleArrayValue);
            singleArrayValue = [];
        }
        if (testSecondJson == false) {
            dataTable1 = this.tapServiceConnector.attributsHandler.getTableAttributeHandler(rootable, schema)// VOTableTools.votable2Rows(adql1);
            testSecondJson = true;
        }
        for (let b = 0; b < dataTable1.attribute_handlers.length; b++) {
            for (let ke in dataTable1.attribute_handlers[b]) {
                for (let col = 0; col < Field.length; col++) {
                    if (dataTable1.attribute_handlers[b][ke] === Field[col]) {
                        jsonContaintHandlersValue1.push(dataTable1.attribute_handlers[b])
                        jsonContaintHandlersValue1 = Array.from(new Set(jsonContaintHandlersValue1));
                    }
                }
            }
        }
        jsonContaintHandlersValue1 = Array.from(new Set(jsonContaintHandlersValue1));
        this.tapServiceConnector.objectMapWithAllDescription.map['handler_attributs'] = jsonContaintHandlersValue1;
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
    let jsonContaintRootQueryIdsValues = {succes: {status: "", field_ids: []}, failure: {notConnected: {status: "", message: ""}, otherError: {status: "", message: ""}}}
    let doubleArrayValue = [];
    let singleArrayValue = [];
    if (this.getConnector().status == 'OK') {
        let Field = this.getRootFields().field_values;
        let votable = this.tapServiceConnector.Query(this.getRootQuery());
        let dataTable = []
        if (votable.statusText == "OK") {
            dataTable = this.tapServiceConnector.getDataTable(votable);
            let nbCols = Field.length;
            for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {//table  content
                for (let col = 0; col < nbCols; col++) {
                    if (dataTable[rowNb + col] != null)
                        singleArrayValue.push(dataTable[rowNb + col]);
                }
                doubleArrayValue.push(singleArrayValue);
                singleArrayValue = [];
            }
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
    let schema;
    let contentAdql = "";
    let textJoinConstraint = "";
    let objectMap = this.getObjectMap().succes.object_map
    let map = objectMap.map
    for (let keyRoot in map) {
        if (keyRoot == rootTable) {
            schema = this.tapServiceConnector.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;
            for (let key in map[rootTable].join_tables) {
                let formatTableName = schema + "." + rootTable;
                let formatJoinTable = schema + "." + key;
                let correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName
                let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
                contentAdql = "SELECT DISTINCT TOP 60 " + correctTableNameFormat + "." + map[rootTable].join_tables[key].target;
                contentAdql += '\n' + " FROM  " + correctTableNameFormat;
                this.tapServiceConnector.jsonAdqlContent.rootQuery = contentAdql;
                textJoinConstraint = " JOIN  " + correctJoinFormaTable + " ";
                textJoinConstraint += "ON " + correctTableNameFormat + "." + map[rootTable].join_tables[key].target;
                textJoinConstraint += "=" + correctJoinFormaTable + "." + map[rootTable].join_tables[key].from;
                this.tapServiceConnector.jsonAdqlContent.constraint[correctJoinFormaTable] = textJoinConstraint
                textJoinConstraint = "";
                let json2 = map[rootTable].join_tables[key]
                if (json2.join_tables !== undefined) {
                    for (let f in json2.join_tables) {
                        let firstJoin = this.tapServiceConnector.jsonAdqlContent.constraint[correctJoinFormaTable]
                        let secondformatJoinTable = schema + "." + f;
                        let secondcorrectJoinFormaTable = secondformatJoinTable.quotedTableName().qualifiedName
                        textJoinConstraint = " JOIN  " + secondformatJoinTable + " ";
                        textJoinConstraint += "ON " + correctJoinFormaTable + "." + json2.join_tables[f].target;
                        textJoinConstraint += "=" + secondformatJoinTable + "." + json2.join_tables[f].from;
                        this.tapServiceConnector.jsonAdqlContent.constraint["condition " + secondformatJoinTable] = ""
                        this.tapServiceConnector.jsonAdqlContent.constraint[secondformatJoinTable] = firstJoin + " " + textJoinConstraint
                        for (let c in json2.join_tables[f]) {
                            let json3 = json2.join_tables[f].join_tables
                            if (json3 !== undefined) {
                                for (let c1 in json3) {
                                    let secondJoin = this.tapServiceConnector.jsonAdqlContent.constraint[secondformatJoinTable]
                                    let thirdformatJoinTable = schema + "." + c1;
                                    let thirdcorrectJoinFormaTable = thirdformatJoinTable.quotedTableName().qualifiedName
                                    textJoinConstraint = " JOIN  " + thirdformatJoinTable + " ";
                                    textJoinConstraint += "ON " + secondcorrectJoinFormaTable + "." + json3[c1].target;
                                    textJoinConstraint += "=" + thirdformatJoinTable + "." + json3[c1].from;
                                    this.tapServiceConnector.jsonAdqlContent.constraint["condition " + thirdformatJoinTable] = ""
                                    this.tapServiceConnector.jsonAdqlContent.constraint[thirdformatJoinTable] = secondJoin + " " + textJoinConstraint
                                }
                            }
                        }
                    }
                }
                this.tapServiceConnector.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = " " + schema + "." + key + "." + map[keyRoot].join_tables[key].from + "=" + "";
            }
        }
    }
    for (let key in this.tapServiceConnector.jsonAdqlContent.allJoin) {
        if (this.tapServiceConnector.jsonAdqlContent.rootQuery.indexOf(this.tapServiceConnector.jsonAdqlContent.allJoin[key]) !== -1) {
        } else {
            this.tapServiceConnector.jsonAdqlContent.rootQuery += '\n' + this.tapServiceConnector.jsonAdqlContent.allJoin[key];
        }
    }
    this.addConstraint();
    return this.tapServiceConnector.jsonAdqlContent.rootQuery;
}

TapApi.prototype.addConstraint = function () {
    this.tapServiceConnector.jsonAdqlContent = this.tapServiceConnector.createCorrectJoin(this);
    let objectMapWithAllDescription = this.getObjectMap().succes.object_map;
    for (let keyconst in objectMapWithAllDescription.tables) {
        if (this.tapServiceConnector.jsonAdqlContent.rootQuery.indexOf("WHERE") === -1) {
            if (objectMapWithAllDescription.tables[keyconst].constraints.length !== 0) {
                this.tapServiceConnector.jsonAdqlContent.rootQuery += '\n' + " WHERE " + objectMapWithAllDescription.tables[keyconst].constraints + ' ';
            }
        } else {
            if (this.tapServiceConnector.jsonAdqlContent.rootQuery.indexOf(objectMapWithAllDescription.tables[keyconst].constraints) === -1) {
                this.tapServiceConnector.jsonAdqlContent.rootQuery += '\n' + " AND " + objectMapWithAllDescription.tables[keyconst].constraints;
            }
        }
    }
    this.tapServiceConnector.jsonAdqlContent.rootQuery = this.tapServiceConnector.replaceWhereAnd(this.tapServiceConnector.jsonAdqlContent.rootQuery);
    if (this.tapServiceConnector.jsonAdqlContent.rootQuery.trim().endsWith("WHERE") == true) {
        this.tapServiceConnector.jsonAdqlContent.rootQuery = this.tapServiceConnector.jsonAdqlContent.rootQuery.trim().replaceAll("WHERE", "");
    }
}

/**
 *@param{*} str : String the root query
 * @param{*} find : String the short string you search in the root query
 * @param{*} replace : String the replace value of the search element
 **/
function replaceAll(str, find, replace) {
    let escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}

/**
 *@param{*} table : String the name of table you want to remove the contraint associeted with
 * @return{*} : Json the json containing root Query with all join table and all condition of each table
 **/
TapApi.prototype.resetTableConstraint = function (table) {
    let schema = this.tapServiceConnector.connector.service["schema"];
    let formatTableName = schema + "." + table;
    let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    for (let key in this.getObjectMap().succes.object_map.tables) {
        if (key == table) {
            this.getObjectMap().succes.object_map.tables[key].constraints = ""
            delete this.tapServiceConnector.jsonAdqlContent.allJoin[correctTableNameFormat];
            delete this.tapServiceConnector.jsonAdqlContent.allCondition[correctTableNameFormat];
            this.tapServiceConnector.jsonAdqlContent.status.status = "OK";
        } else {
            this.tapServiceConnector.jsonAdqlContent.status.status = "Failed";
        }
    }
    return this.tapServiceConnector.jsonAdqlContent;
}

/**
 *@param{*} table : String the name of table you want to remove the contraint associeted with
 * @return{*} : Json the json containing root Query with all join table and all condition of each table
 **/
TapApi.prototype.resetAll = function () {
    for (let key in this.getObjectMapWithAllDescriptions().tables) {
        this.resetTableConstraint(key);
        this.tapServiceConnector.jsonAdqlContent.status.status = "OK";
    }
    return this.tapServiceConnector.jsonAdqlContent;
}

/**
 * @param {*} table : String the name of table you want get handlerAttribut associeted with
 * @return{*} : Json the json containing all handler Attribut of the table
 * */
TapApi.prototype.getTableAttributeHandlers = function (table) {
    return this.tapServiceConnector.attributsHandler.getTableAttributeHandler(table);
}

/**
 *@return{*} : Json the json containing all detail about every singel table join to the root table with all join table of each table and all condition of each table
 **/
TapApi.prototype.getObjectMapWithAllDescriptions = function () {
    getObjectMapWithAllDescription = this.tapServiceConnector.getObjectMapAndConstraints();
    return getObjectMapWithAllDescription;
}
TapApi.prototype.setAdql = function (rootTable, constraint) {
    return this.tapServiceConnector.getAdqlAndConstraint(rootTable,constraint)
}
