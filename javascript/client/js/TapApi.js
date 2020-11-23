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
let rootFields = []
var testLoadRootField = false;
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


let testSecondJson = false;
let jsonContaintHandlersValue1 =[]
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


        ////////////////////////////////////////////////////////////
        let singleArrayValue1 = [];
        let doubleArrayValue1 = []
       // let dataTable1 = '';
        let adql1 = "";


        //jsonContaintHandlerValues.attribute_handlers.db_name = this.connector.service["table"]
       // if (testSecondJson == false) {

            //adql1 = this.tapService.Query(this.handlerAttribut.addAllColumn(rootable));
          let  dataTable1 =this.handlerAttribut.getTableAttributeHandler(rootable,schema)// VOTableTools.votable2Rows(adql1);
            testSecondJson = true;
       // }
        for (let col = 0; col < Field.length; col++) {
            //let dataTableAhs = VOTableTools.votable2Rows(ahs);
            let val =Field[col]
            let cc=0;
            for (let ke in dataTable1.attribute_handlers) {

               // modifyKeys(dataTable1.attribute_handlers[ke])
                if (dataTable1.attribute_handlers[ke].column_name.trim() === val.trim()) {
                     jsonContaintHandlersValue1=dataTable1.attribute_handlers[ke]
                    //jsonContaintHandlersValue1 = Array.from(new Set(jsonContaintHandlersValue1));
                    cc++
                    console.log(dataTable1.attribute_handlers[ke]);
                    console.log(jsonContaintHandlersValue1);
                    // this.handlerAttribut.objectMapWithAllDescription.map[this.connector.service["table"]]["handler_attributs"]=jsonContaintHandlerValues.attribute_handlers[ke];
                    this.handlerAttribut.objectMapWithAllDescription.map['handler_attributs']=jsonContaintHandlersValue1;

                }else {

                    //console.log(dataTable1.attribute_handlers[ke].column_name !== val)

                }
            }
            //  console.log(val);
        }
        ///console.log(dataTable1.attribute_handlers[ke]);
        // let f = modifyKeys(dataTable1.attribute_handlers)
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

var testGetObjectMap = false;
var jsonAll
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

                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = " " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf("rr") != -1 && contentAdql.indexOf("ivoid=") == -1) {
                    //alert(schema+'.'+key+'.'+jsonAll.succes.object_map[keyRoot].join_tables[key].from );
                    //textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[k] + "\'";
                    this.jsonAdqlContent.constraint["value " + correctJoinFormaTable] = dataTable[k];
                    value = this.jsonAdqlContent.constraint["value " + correctJoinFormaTable]

                    textWhereConstraint = " WHERE " + schema + '.' + key + '.' + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.jsonAdqlContent.constraint["condition " + correctJoinFormaTable] = "  " + schema + "." + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + "=" + value;
                    this.tapWhereConstraint.push(textWhereConstraint);
                } else if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") == -1) {
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

TapApi.prototype.selecConstraints = function (tableName, txtImput) {
    var name = tableName //b[ii].id.slice(1);//the name of
    var schema = this.connector.service["schema"];
    // alert(name +' '+schema);
    var adql = this.handlerAttribut.addAllColumn(name, schema)
    var QObject = this.tapService.Query(adql);
    var dataTable = VOTableTools.votable2Rows(QObject)
    var contentText = QObject.responseText;
    var Field = VOTableTools.genererField(QObject, contentText)
    var nb = Field.length;
    var out = "<div class = 'AIDE ' " +
        "id='light'>" +
        "<span style='text-align: left;font-weight: bold;font-size: x-large;'> Columns of table " + name + "</span>" +
        "<button class='delete_right' id='d_right'><i class='fa fa-close' ></i></button><br></br>";//head
    out += "<table  class = 'table table-bordered table-striped table-hover'  role = 'grid' >";
    out += "<thead class='thead-dark'><tr role='row'>";//head
    //out +="<th/>";


    for (var j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
    var column = 0;
    for (var j = 0; j < dataTable.length; j++) {//table  content
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr class = 'odd table-primary' >";
                //out+="<td><input type='checkbox'></td>";
            } else {
                out += "<tr class = 'even table-primary'>";
                //out+="<td><input type='checkbox'></td>";
            }
            //var row = j/6+1;
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
    $("body").prepend(out);
    var td = $("td");
    for (var i = 0; i < td.length; i++) {
        $(td[i]).click(function () {
            var i = $(this).attr("id");
            if ($("#" + txtImput).val().length != 0) {
                var content = $("#" + txtImput).val();
                $("#" + txtImput).val(content + " AND " + name + "." + i + "=");
                document.getElementById('light').style.display = 'none';
            } else {
                $("#" + txtImput).val(name + "." + i + "=");
                document.getElementById('light').style.display = 'none';
            }

        });
    }

    $("#d_right").click(function () {
        document.getElementById("light").style.display = "none";
    })

    document.getElementById('light').style.display = 'block';

}

var jsonTempJoinTap = [];
var jsonTempWhereTap = [];
var countCondition = 0;
var testfor = false
TapApi.prototype.addConstraint = function (rootQuery, table, whereTable) {
    var buttons = "";
    this.tapButton = []
    var jsonAdqlContent = this.jsonAdqlContent;
    let api = this;
    let mytest = false;
    var schema = this.connector.service["schema"];
    //this.getObjectMapWithAllDescriptions();
    // var data = api.correctService.loadJson();
    //var sj = new jsonRead(data);

    //  api.correctService.Aide(sj, api.tapService)
    //api.correctService.limitJson2data(sj, api.tapService, api.correctService);


    if (testfor == false) {
        let j = 0;

        // for (let i = 0; i < table.length; i++) {
        for (let key in this.handlerAttribut.objectMapWithAllDescription.tables) {

            // j++


            let formats = schema + '.' + key;
            let correctTables = formats.quotedTableName().qualifiedName;
            buttons = "<span>" + "<button  type='button' class=\"btn btn-primary\" id='bbb" + key + "' value='" + key + "' name='Cbuttons' style=\"margin-top: 7px\">Click to select " + key + " constraints</button>" +
                "<button  type='button' class=\"btn btn-default\" id='" + key + "' value='" + key + "' style=\"margin-top: 7px\">Click to Join " + key + " constraint</button> " +
                " <input type='text' class='form form-control' id='txt" + key + "' value=' ' placeholder='Enter condition' name='Cinputs'> <hr>"

            //this.jsonAdqlContent.constraint["condition " + correctTables]
            // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

            if (testButton == true) {
                //alert( 'existe deja')
            } else {
                this.tapButton.push(buttons);
            }

        }

        $("#loadButton").append(this.tapButton);
        window.location.hash = "#loadButton";

        //var btns =this.tapButton;
        for (let key in this.handlerAttribut.objectMapWithAllDescription.tables) {
            $("#" + "bbb" + key).click(function () {
                api.selecConstraints(key, "txt" + key);
            })

            $("#" + key).click(function () {
                let format = schema + '.' + key;
                let correctTable = format.quotedTableName().qualifiedName;

                /**
                 * when we add a constraint, we try to add this constraint to objectMapWithAllDescription
                 * in a good place this object in in the HandlerAttribut.js class
                 *
                 */
                //api.setObjectMapWithAllDescriptionConstraint(correctTable);
                /**
                 *
                 * when we add one constraint we create a button containing represent this join table
                 * we will use this each buttun added to remove each constraint when we want.
                 * */
                for (let r = 0; r <= tabContaninBtnRemoveConstraint.length; r++) {
                    if (tabContaninBtnRemoveConstraint.indexOf(tabContaninBtnRemoveConstraint[r]) > -1) {
                    } else {

                        tabContaninBtnRemoveConstraint.push(key)
                        break;
                    }

                }
                tabContaninBtnRemoveConstraint = Array.from(new Set(tabContaninBtnRemoveConstraint));

                /**
                 *
                 * when we add one constraint we add correct join close  to our dic call son AdqlContent.allJoin[key]
                 * when we add one constraint we add where close  to our dic call son AdqlContent.allCondition[key]
                 * */
                let t = "";
                let count = 0;
                let testJoinOfJOIN = false;
                for (let keys in jsonAdqlContent.constraint) {

                    if (keys == correctTable) {
                        jsonAdqlContent.allJoin[keys] = jsonAdqlContent.constraint[keys]
                        //countCondition++;
                        for (let keyConst in jsonAdqlContent.constraint) {
                            if (keyConst == "condition " + correctTable) {
                                //if(jsonAdqlContent.allCondition ==""){
                                jsonAdqlContent.constraint[keyConst] = $("#txt" + key).val().replaceAll("WHERE", "") != " " ? jsonAdqlContent.constraint[keyConst] + " " + $("#txt" + key).val().replaceAll("WHERE", "") : jsonAdqlContent.constraint[keyConst];
                                if (mytest == false) {
                                    jsonAdqlContent.allCondition[keys] = jsonAdqlContent.constraint[keyConst];
                                    mytest = true;
                                } else {
                                    jsonAdqlContent.allCondition[keys] = " AND " + jsonAdqlContent.constraint[keyConst];
                                }

                                //alert(jsonAdqlContent.constraint[keyConst]);
                            }
                        }
                    } else {

                    }
                }
                let root = api.connector.service["table"];
                // for(myKey in api.handlerAttribut.objectMapWithAllDescription.tables){
                for (let myKeyj in api.handlerAttribut.objectMapWithAllDescription.map[root].joined_tables) {
                    //console.log(api.handlerAttribut.objectMapWithAllDescription.tables.indexOf(myKeyj));
                }

                let mytabContainFistjoin = [];
                var ajoin = []
                Object.keys(api.handlerAttribut.objectMapWithAllDescription.map).forEach(function (key) {
                    console.log(key);
                    JsonValue = api.handlerAttribut.objectMapWithAllDescription.map[key];
                    Object.keys(JsonValue).forEach(function (keyss) {
                        var queryValue = JsonValue[keyss]
                        Object.keys(queryValue).forEach(function (k) {
                            mytabContainFistjoin.push(k);
                            mytabContainFistjoin = Array.from(new Set(mytabContainFistjoin));
                            // console.log(k);
                            //console.log(api.handlerAttribut.objectMapWithAllDescription.tables.indexOf(key))
                            // }
                        });
                    });
                });
                // je parcoure la liste des tables si un element existe deja dans la listes des tables (mytabContainFistjoin) jointe à la route je ne fais rien
                // sinon si la tables correspond a la tables sur laquelle j'ai cliquer je recupere les tables jointes (ajoint) à la tales en question et je recupere le grand json
                // je parcours le grand json (myJsonJion)si je trouve une cle qui correspond à la table cliquer, je parcours mon ajoin et je verifie si mon mytabContainFistjoin)
                // qui contient les table directement connecter à la root table contient une table de mon ajoin si oui, je recuper les from et target column que je mais
                // en liaison avec les autre table de ajoin

                let keyFormat = schema + '.' + key;
                let correctKeyFormat = keyFormat.quotedTableName().qualifiedName;
                Object.keys(api.handlerAttribut.objectMapWithAllDescription.tables).forEach(function (k2) {
                    var jsonk21 = api.handlerAttribut.objectMapWithAllDescription.tables[k2];
                    if (mytabContainFistjoin.indexOf(k2) !== -1) {

                    } else {
                        if (k2 == key) {
                            ajoin = api.correctService.getJoinTables(key);
                            let myJsonJion = api.tapService.createJson();
                            console.log(myJsonJion);
                            Object.keys(myJsonJion).forEach(function (keyOfKey) {
                                if (keyOfKey == key) {

                                    /*
                                    * SELECT  TOP 100  *
FROM "public".basic join  "public".has_ref  on "public".basic.oid = "public".has_ref.oidref join "public".ref on "public".ref.oidbib = "public".has_ref.oidbibref
*/
                                    console.log(key);// ref for exemple
                                    console.log(myJsonJion[key].join_tables);
                                    for (let h = 0; h < ajoin.length; h++) {
                                        if (mytabContainFistjoin.indexOf(ajoin[h]) !== -1) {
                                            let nameFormat = schema + '.' + ajoin[h];
                                            let correctNameFormat = nameFormat.quotedTableName().qualifiedName;
                                            console.log(myJsonJion[key].join_tables[ajoin[h]]);
                                            console.log(api.jsonAdqlContent.constraint[correctNameFormat]);
                                            let fistJoinConstrain = api.jsonAdqlContent.constraint[correctNameFormat]
                                            let condition = $("#txt" + key).val().replaceAll("WHERE", "") != " " ? api.jsonAdqlContent.constraint["condition " + correctNameFormat] + " " + $("#txt" + key).val().replaceAll("WHERE", "") : api.jsonAdqlContent.constraint["condition " + correctNameFormat]
                                            // let formatTableName = schema + "." + keyRoot;
                                            //let correctTableNameFormat =formatTableName.quotedTableName().qualifiedName;
                                            let format = schema + '.' + ajoin[h];
                                            let correctJoinFormaTable = format.quotedTableName().qualifiedName;
                                            let textJoinConstraint = " JOIN  " + correctKeyFormat + " ";
                                            textJoinConstraint += "ON " + correctKeyFormat + "." + myJsonJion[key].join_tables[ajoin[h]].target;
                                            textJoinConstraint += "=" + correctJoinFormaTable + "." + myJsonJion[key].join_tables[ajoin[h]].from;
                                            // je verifie si la table possede deja jointure de la jointure
                                            if (jsonAdqlContent.rootQuery.indexOf(fistJoinConstrain) !== -1) {

                                                api.jsonAdqlContent.constraint[correctKeyFormat] = " " + textJoinConstraint
                                            } else {

                                                api.jsonAdqlContent.constraint[correctKeyFormat] = fistJoinConstrain + " " + textJoinConstraint
                                            }
                                            // je fais pareil pour la condition
                                            if (jsonAdqlContent.rootQuery.indexOf(condition) !== -1) {

                                                //api.jsonAdqlContent.constraint[correctKeyFormat] =" "+ textJoinConstraint
                                            } else {

                                                api.jsonAdqlContent.constraint["condition " + correctKeyFormat] = condition;
                                            }

                                            jsonAdqlContent.allJoin[correctKeyFormat] = api.jsonAdqlContent.constraint[correctKeyFormat];
                                            jsonAdqlContent.allCondition[correctKeyFormat] = api.jsonAdqlContent.constraint["condition " + correctKeyFormat] != undefined ? " " + api.jsonAdqlContent.constraint["condition " + correctKeyFormat] : ""
                                            //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                                            console.log(api.jsonAdqlContent.constraint["condition " + correctKeyFormat]);
                                            console.log(api.jsonAdqlContent.constraint[correctKeyFormat]);
                                        } else {

                                            let ajoin1 = api.correctService.getJoinTables(ajoin[h]);
                                            //  console.log("pppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp");
                                            //  console.log(ajoin[h] + ' nesiste pas');
                                            // console.log(ajoin1);


                                            for (let h1 = 0; h1 < ajoin1.length; h1++) {

                                                if (mytabContainFistjoin.indexOf(ajoin1[h1]) !== -1) {
                                                    let nameFormat1 = schema + '.' + ajoin1[h1];
                                                    let correctNameFormat1 = nameFormat1.quotedTableName().qualifiedName;
                                                    console.log(myJsonJion[key].join_tables[ajoin[h]]);
                                                    console.log(api.jsonAdqlContent.constraint[correctNameFormat1]);
                                                    let fistJoinConstrain1 = api.jsonAdqlContent.constraint[correctNameFormat1]
                                                    let condition1 = $("#txt" + key).val().replaceAll("WHERE", "") != " " ? api.jsonAdqlContent.constraint["condition " + correctNameFormat1] + " AND " + $("#txt" + key).val().replaceAll("WHERE", "") : api.jsonAdqlContent.constraint["condition " + correctNameFormat1]
                                                    // let formatTableName = schema + "." + keyRoot;
                                                    //let correctTableNameFormat =formatTableName.quotedTableName().qualifiedName;
                                                    let format1 = schema + '.' + ajoin1[h1];
                                                    let correctJoinFormaTable1 = format1.quotedTableName().qualifiedName;
                                                    let textJoinConstraint1 = " JOIN  " + correctKeyFormat + " ";
                                                    textJoinConstraint1 += "ON " + correctKeyFormat + "." + myJsonJion[key].join_tables[ajoin[h]].target;
                                                    textJoinConstraint1 += "=" + correctJoinFormaTable1 + "." + myJsonJion[key].join_tables[ajoin[h]].target;


                                                    if (jsonAdqlContent.rootQuery.indexOf(fistJoinConstrain1) !== -1) {

                                                        api.jsonAdqlContent.constraint[correctKeyFormat] = " " + textJoinConstraint1
                                                    } else {

                                                        api.jsonAdqlContent.constraint[correctKeyFormat] = fistJoinConstrain1 + " " + textJoinConstraint1
                                                    }
                                                    // je fais pareil pour la condition
                                                    if (jsonAdqlContent.rootQuery.indexOf(condition1) !== -1) {

                                                        //api.jsonAdqlContent.constraint[correctKeyFormat] =" "+ textJoinConstraint
                                                    } else {

                                                        api.jsonAdqlContent.constraint["condition " + correctKeyFormat] = condition1;
                                                    }

                                                    //api.jsonAdqlContent.constraint[correctKeyFormat] = fistJoinConstrain1 + " " + textJoinConstraint1
                                                    //  api.jsonAdqlContent.constraint["condition " + correctKeyFormat] = condition1;

                                                    jsonAdqlContent.allJoin[correctKeyFormat] = api.jsonAdqlContent.constraint[correctKeyFormat];
                                                    jsonAdqlContent.allCondition[correctKeyFormat] = api.jsonAdqlContent.constraint["condition " + correctKeyFormat] != undefined ? " AND " + api.jsonAdqlContent.constraint["condition " + correctKeyFormat] : ""
                                                    //console.log("444444444444444444444444444444444444444444444444444444444444444");
                                                    console.log(api.jsonAdqlContent.constraint["condition " + correctKeyFormat]);
                                                    console.log(api.jsonAdqlContent.constraint[correctKeyFormat]);
                                                }

                                            }


                                            ///////////////////////////////////////////////
                                        }
                                    }
                                }
                            })
                            //testJoinOfJOIN = true;
                            //break;
                        }
                        // console.log(k2);
                    }
                    //Object.keys(jsonk21).forEach(function (k3){

                    //})
                })


                /* let contraintOfConstrain = "";

                 for (let h = 0; h < ajoin.length; h++) {
                     for (let f = 0; f < table.length; f++) {
                         if (table[f][0] == ajoin[h]) {
                             contraintOfConstrain = table[f][1];
                         }
                     }
                 }

                 console.log(ajoin);
                 console.log(contraintOfConstrain);*/

                //console.log(api.correctService.getJoinTables("EpicObsImage"));

                document.getElementById("loadButton").style.display = "none"
                document.getElementById("btnConstraint").style.display = "none";
                $("#getJsonAll").text(jsonAdqlContent.rootQuery);
                console.log(jsonAdqlContent.rootQuery);
            })

        }
        testfor = true;


    }

    //alert(JSON.stringify(jsonAdqlContent.allJoin.length))
    /**
     * Search a good place to put where and AND close to adql query
     * */
    var testWhere = false;
    if (JSON.stringify(jsonAdqlContent.allJoin) !== "{}") {

        for (let key in jsonAdqlContent.allJoin) {

            if (jsonAdqlContent.rootQuery.indexOf(jsonAdqlContent.allJoin[key]) !== -1) {

            } else {

                jsonAdqlContent.rootQuery += jsonAdqlContent.allJoin[key];
            }
        }
        for (let keyconst in jsonAdqlContent.allCondition) {
            if (testWhere == false) {
                //jsonAdqlContent.rootQuery=jsonAdqlContent.rootQuery+" WHERE "
                jsonAdqlContent.rootQuery += " WHERE " + jsonAdqlContent.allCondition[keyconst] + ' ';
                testWhere = true;
            } else {
                if (jsonAdqlContent.rootQuery.indexOf(jsonAdqlContent.allCondition[keyconst]) !== -1) {

                } else {
                    jsonAdqlContent.rootQuery += jsonAdqlContent.allCondition[keyconst];
                }
            }

        }
    }

    /**
     * if you remouve a constrain we verified that there is not a duplication of WHERE OR AND condition
     * */
    /*if (jsonAdqlContent.rootQuery.search("WHERE   AND") > -1) {
        let g = jsonAdqlContent.rootQuery.slice(0, jsonAdqlContent.rootQuery.search("WHERE   AND"))
        let g2 = jsonAdqlContent.rootQuery.slice(jsonAdqlContent.rootQuery.search("WHERE   AND"), jsonAdqlContent.rootQuery.length);
        g2 = g2.replaceAll("WHERE   AND", "WHERE");
        //alert(g+' '+g2);
        g += " " + g2;
        jsonAdqlContent.rootQuery = g;
    }*/
    /*if (jsonAdqlContent.rootQuery.search("WHERE  AND") > -1) {
        alert("ddddd")
        var g = jsonAdqlContent.rootQuery.slice(0, jsonAdqlContent.rootQuery.search("WWHERE  AND"))
        var g2 = jsonAdqlContent.rootQuery.slice(jsonAdqlContent.rootQuery.search("WHERE  AND"), jsonAdqlContent.rootQuery.length);
        g2 = g2.replaceAll("WHERE  AND", " WHERE ");
        //alert(g+' '+g2);
        g += " " + g2;
        jsonAdqlContent.rootQuery = g;
    }*/
    jsonAdqlContent.rootQuery = replaceAll(jsonAdqlContent.rootQuery, "WHERE   AND", " WHERE ");
    jsonAdqlContent.rootQuery = replaceAll(jsonAdqlContent.rootQuery, "WHERE  AND", " WHERE ");
    /**
     * when we are removing all constraint, we verified if rootQuery end with WHERE close.
     * if so, we remove the WHERE close to rootQuery
     * */
    if (jsonAdqlContent.rootQuery.trim().endsWith("WHERE") == true) {
        jsonAdqlContent.rootQuery = jsonAdqlContent.rootQuery.trim().replaceAll("WHERE", "");
    }
    this.jsonAdqlContent = jsonAdqlContent;
    testButton = true
    return this.jsonAdqlContent;
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
            this.jsonAdqlContent.rootQuery.replaceAll("AND   AND", "AND")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE   AND ", "WHERE")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE  AND ", "WHERE")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE   AND ", "WHERE")
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
    ;

    //var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    for (let key in this.jsonAdqlContent.allJoin) {
        if (key) {
            delete this.jsonAdqlContent.allJoin[key] //= "";
            delete this.jsonAdqlContent.allCondition[key] //= "";
            this.jsonAdqlContent.rootQuery.replaceAll("AND   AND", "AND")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE   AND ", "WHERE")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE  AND ", "WHERE")
            this.jsonAdqlContent.rootQuery.replaceAll("WHERE   AND ", "WHERE")
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

//var splitUndefine;
function reset() {

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
/**
 * @param{*} table : String the table you want to get it join table
 * @return Array : the array containing all join table of the the table parse like parameter of the function
 * */
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

    //console.log(JSON.stringify(joinTable, undefined, 2));
    return joinTable;
};
