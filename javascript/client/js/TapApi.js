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
let  testButton = false;
let tab = []
let tabContaninBtnRemoveConstraint = [];
let HtmltabContaninBtnRemoveConstraint = [];
let tempTab = [];

//for add AHS to handlerJson after runing query

let testSecondJson = false;
let jsonContaintHandlersValue1 =[]
let dataTable1 =[];
// for method getRootField

let rootFields = []
var testLoadRootField = false;

// for getrootQuery
var testGetObjectMap = false;
var jsonAll

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
        let votableQueryResult = this.tapService.Query(this.getRootQuery());
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
            dataTable1 =this.handlerAttribut.getTableAttributeHandler(rootable,schema)// VOTableTools.votable2Rows(adql1);
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
        let dataTable =[]
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
    var rootQueyJson = {status: "", query: "query"}
    var rootTable = this.connector.service["table"]// .jsonContaintJoinTable.Succes.base_table;
    if (testGetObjectMap == false) {
        jsonAll = this.getObjectMap();
        testGetObjectMap = true;
    }
    var schema;
    var contentAdql = "";
    let listJoinAndId = this.getListJoinAndId(this.getConnector().service['table'], this.getObjectMap().succes.object_map);
    let listId = this.getListeId(listJoinAndId)
    // console.log(this.getJoinedTables())
    // console.log(rootTable)

    var dataTable = VOTableTools.votable2Rows(this.votableQueryResult);
    //console.log(dataTable);
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
    const root_key="oid";
    const root_key1="ivoid="
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
                contentAdql +='\n'+ " FROM  " + correctTableNameFormat;
                this.jsonAdqlContent.rootQuery = contentAdql;
                textJoinConstraint = " JOIN  " + correctJoinFormaTable + " ";
                //temp1.push(key);

                textJoinConstraint += "ON " + correctTableNameFormat + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].target;
                textJoinConstraint += "=" + correctJoinFormaTable + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from;
                this.jsonAdqlContent.constraint[correctJoinFormaTable] = textJoinConstraint

                this.tapJoinConstraint.push([key, textJoinConstraint]);
                textJoinConstraint = "";

                let votableFields = []//this.getRootFields().field_values;


                let contentText = this.votableQueryResult.responseText;
                if (this.getConnector().service.tapService === "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.getConnector().service.tapService === "http://dc.zah.uni-heidelberg.de/tap/sync") {

                    votableFields = VOTableTools.getField(this.votableQueryResult);
                } else {
                    votableFields = VOTableTools.genererField(this.votableQueryResult, contentText);
                }


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
                /* modifier pour recuperer */
                let sch = this.handlerAttribut.objectMapWithAllDescription.root_table.schema;// public, rr

                if (schema.indexOf(sch) != -1 && contentAdql.indexOf(root_key) != -1) {

                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = " " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf(sch) != -1 && contentAdql.indexOf(root_key1) == -1) {
                    //alert(schema+'.'+key+'.'+jsonAll.succes.object_map[keyRoot].join_tables[key].from );
                    //textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf(sch) != -1 && contentAdql.indexOf(root_key) == -1) {
                    if (json2Requete.isString(dataTable[k])) {
                        // textWhereConstraint += " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                        this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                        value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                        textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                        this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                        this.tapWhereConstraint.push(textWhereConstraint);
                    } else {
                        //textWhereConstraint = " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + dataTable[k];
                        this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                        value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                        textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                        this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                        this.tapWhereConstraint.push(textWhereConstraint);
                    }
                } else {
                    //textWhereConstraint = " WHERE " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    var value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
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
        this.addConstraint();

        return this.jsonAdqlContent.rootQuery;

    }

}

TapApi.prototype.addConstraint = function (){
   let jsonAdqlContent = this.correctService.createCorrectJoin(this);
   let objectMapWithAllDescription= this.handlerAttribut.getObjectMapWithAllDescription();
    /**
     * Search a good place to put where and AND close to adql query
     * */
    var testWhere = false;
    if (JSON.stringify(jsonAdqlContent.allJoin) !== "{}") {


        for (let key in jsonAdqlContent.allJoin) {

            if (jsonAdqlContent.rootQuery.indexOf(jsonAdqlContent.allJoin[key]) !== -1) {

            } else {

                jsonAdqlContent.rootQuery += '\n' + jsonAdqlContent.allJoin[key];
            }
        }
        for (let keyconst in objectMapWithAllDescription.tables) {
            if (testWhere == false) {
                //jsonAdqlContent.rootQuery=jsonAdqlContent.rootQuery+" WHERE "
                if(objectMapWithAllDescription.tables[keyconst].constraints.length===0){

                }else {
                    jsonAdqlContent.rootQuery += '\n' + " WHERE " + objectMapWithAllDescription.tables[keyconst].constraints + ' ';
                }
                testWhere = true;
            } else {
                if (jsonAdqlContent.rootQuery.indexOf(objectMapWithAllDescription.tables[keyconst].constraints) !== -1) {

                } else {
                    jsonAdqlContent.rootQuery += '\n'+" AND "+  objectMapWithAllDescription.tables[keyconst].constraints;
                }
            }
        }


    }

    /**
     * if you remouve a constrain we verified that there is not a duplication of WHERE OR AND condition
     * */

    jsonAdqlContent.rootQuery = this.correctService.replaceWhereAnd(jsonAdqlContent.rootQuery);

    /**
     * when we are removing all constraint, we verified if rootQuery end with WHERE close.
     * if so, we remove the WHERE close to rootQuery
     * */
    if (jsonAdqlContent.rootQuery.trim().endsWith("WHERE") == true) {
        jsonAdqlContent.rootQuery = jsonAdqlContent.rootQuery.trim().replaceAll("WHERE", "");
    }
    this.jsonAdqlContent = jsonAdqlContent;
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

}
/**
 *@param{*} table : String the name of table you want to remove the contraint associeted with
 * @return{*} : Json the json containing root Query with all join table and all condition of each table
 **/
TapApi.prototype.resetAll = function () {

    for (let key in this.handlerAttribut.getObjectMapWithAllDescription().tables) {
        this.resetTableConstraint(key);
        this.jsonAdqlContent.status.status = "OK";
    }

    /*for (let key in this.jsonAdqlContent.allJoin) {
        if (key) {
            //delete this.jsonAdqlContent.allJoin[key] //= "";
           // delete this.jsonAdqlContent.allCondition[key] //= "";
            this.jsonAdqlContent.status.status = "OK";
        } else {
            this.jsonAdqlContent.status.status = "Failed";
            //this.jsonAdqlContent.status.orderErros="The join table query not exist in rootQuery";
        }
        //jsonAdqlContent.rootQuery += " " + jsonAdqlContent.allJoin[key] + " ";
    }*/
    //$("#getJsonAll").text(this.jsonAdqlContent.rootQuery);
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
var testLoadObjectMapWithAllDesc = false;
var getObjectMapWithAllDescription
TapApi.prototype.getObjectMapWithAllDescriptions = function () {

    //if(testLoadObjectMapWithAllDesc==false){
    getObjectMapWithAllDescription = this.handlerAttribut.getObjectMapWithAllDescription();
    // testLoadObjectMapWithAllDesc = true;
    //  }
    return getObjectMapWithAllDescription;
}
var testforConstrain = false
/**
 * @return{*} : Json the json containing all detail about every singel table join to the root table with hadler atribut of choosing table you want to get it handler attribut
 * */
var testApiRooQuery = false;
let api = "";
let table = []
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
            var buttons = "<button  type='button' class=\"btn btn-warning\" id='b" + table[i] + i + "' value='" + table[i] + "' style=\"margin-top: 7px\">handler '" + table[i] + "'</button></span>"
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

