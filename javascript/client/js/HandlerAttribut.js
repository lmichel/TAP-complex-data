class HandlerAttributs {
    constructor() {
        /* let name; //Orginal name of the field
         let db_name; //Field name as known by the DB. Must be used to set constraints
         let type; //data abse type of the attribute (string, int...)
         let ucd; //Unified Content Descriptor
         let utype; //Model binding
         let descriptor; //Text descriptor*/
        //this.tapApi = new TapApi();
        this.api = "";
        this.ucd = ''
        this.name = '';
        this.db_name = '';
        this.type = '';
        this.utype = '';
        this.description = '';
        this.range = '';
        this.schema = "";
        this.objectMapWithAllDescription = {
            "root_table": {
                "name": "root_table_name",
                "schema": "schema"
            },
            //"table": {},
            "tables": {},
            "map": {}
        }
    }
}

var testLoadJson = false;
var testLoadallTable = false;
var testJoinRootTable = false
var testOtherJoinTables = false;
let jsonWithaoutDescription = "";
let allTables = "";
let allJoinRootTable =[];
let testJoinTableOfJoin = false;
let tempJson = {
    "map": {
        "join_tables": {}
    }
}
var testTempJoinMap = false
HandlerAttributs.prototype.getObjectMapWithAllDescription = function () {
    let api = this.api;
    let objectMapWithAllDescription;
    let attributHanler = [];

    let rootTable = api.connector.service["table"]
    if (testLoadallTable == false) {
        allTables = api.tapService.allTable();
        testLoadallTable = true
    }
    if (testLoadJson == false) {
        jsonWithaoutDescription = api.correctService.loadJson();
        allJoinRootTable = api.correctService.getJoinTables(rootTable);
        testLoadJson = true;
    }
    //api.getRootQuery();
    let jsonAdqlContent = api.jsonAdqlContent;
    this.objectMapWithAllDescription.root_table.name = rootTable;
    this.objectMapWithAllDescription.root_table.schema = api.connector.service["schema"];
    let column = [];
    let correctCondition
    this.db_name = this.api.connector.service["table"];
    this.schema = this.api.connector.service["schema"];
    let formatJoinTable = "";
    let correctJoinFormaTable = "";
    let correctTableConstraint = "";
    let correctWhereClose = "";



//console.log(jsonWithaoutDescription);
//////////////////////////////////////////////////// begin  get correct allJoin table of Join ////////////////////////////////////////////
        for (let tableKey in jsonWithaoutDescription) {

            if(allJoinRootTable.indexOf(tableKey)!==-1){

            }else {
                if (testJoinTableOfJoin === false) {
                    let joinTableOfJoin = api.correctService.getJoinTables(tableKey)
                    for (let h = 0; h < joinTableOfJoin.length; h++) {
                        if (allJoinRootTable.indexOf(joinTableOfJoin[h]) !== -1) {
                            allJoinRootTable.push(tableKey);
                        } else {
                            let g = api.correctService.getJoinTables(tableKey);
                            for (let c = 0; c < g.length; c++) {
                                if (allJoinRootTable.indexOf(g[c]) !== -1) {
                                    allJoinRootTable.push(tableKey);
                                } else {
                                    let g1 = api.correctService.getJoinTables(g[c])
                                    console.log(g1);
                                    for (let c1 = 0; c1 < g1.length; c1++) {
                                        if (allJoinRootTable.indexOf(g1[c1]) !== -1) {
                                            allJoinRootTable.push(tableKey);
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }


        }
        testJoinTableOfJoin = true;
    allJoinRootTable = Array.from(new Set(allJoinRootTable))
    //console.log(allJoinRootTable.length)
   // console.log(allJoinRootTable)

//////////////////////////////////////////////////// end get  allJoin table of Join ////////////////////////////////////////////




    // ----------------------------------------------- created json begin with alltables -------------------------------------------------------------------------
    allTables = allJoinRootTable;
    for (let k = 0; k < allTables.length; k++) {
        for (let tableKey in jsonWithaoutDescription) {


            //console.log(tableKey+" =++++= "+allTables[k].replaceAll(this.schema,"") )
            if (tableKey == allTables[k] || this.schema + "." + tableKey == allTables[k]) {
                formatJoinTable = this.schema + "." + tableKey;
                correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName

                //console.log(tableKey+" =++++= "+correctJoinFormaTable)
                // console.log(api.jsonCorrectTableColumnDescription.addAllColumn[correctJoinFormaTable])
                attributHanler = api.jsonCorrectTableColumnDescription.addAllColumn[correctJoinFormaTable]
                for (let keyConstraint in jsonAdqlContent.constraint) {

                    if (keyConstraint == correctJoinFormaTable) {
                        // console.log(jsonAdqlContent.constraint)
                        correctTableConstraint = api.jsonAdqlContent.allJoin[correctJoinFormaTable];
                        for (let keyConst in jsonAdqlContent.constraint) {
                            if (keyConst == "condition " + correctJoinFormaTable) {
                                correctWhereClose = api.jsonAdqlContent.allCondition[keyConstraint];
                            }
                        }
                    }
                }
                //attributHanler = api.jsonCorrectTableColumnDescription.addAllColumn//this.getTableAttributeHandler(tableKey);

                let correctConstraint = replaceAll(correctTableConstraint + " WHERE " + correctWhereClose, "WHERE   AND", " ");
                correctConstraint = replaceAll(correctTableConstraint + " WHERE " + correctWhereClose, "WHERE  AND", " ");
                this.objectMapWithAllDescription.tables[tableKey] = {
                    "description": jsonWithaoutDescription[tableKey].description,
                    "constraints": "",//correctTableConstraint!=undefined && correctWhereClose!=undefined && correctConstraint.trim()!="WHERE"?correctConstraint:"",
                    "columns": attributHanler != undefined ? attributHanler : [],
                }
                for (let keyConstraint in jsonAdqlContent.constraint) {
                    if (keyConstraint == correctJoinFormaTable) {
                        correctCondition = replaceAll(" WHERE " + correctWhereClose, "WHERE  AND ", "")
                        this.objectMapWithAllDescription.tables[tableKey].constraints =
                            correctTableConstraint != undefined && correctWhereClose != undefined && correctConstraint.trim() != "WHERE" ? correctCondition : "";

                    }
                }


            } else {
                //console.log(tableKey+" =----= "+allTables[k]);
            }

        }

    }
    //----------------------------------------------------------------------------------------------------------------------------------------------------------

    //console.log(JSON.stringify(this.objectMapWithAllDescription.tables, undefined, 2));
    // console.log(JSON.stringify(this.objectMapWithAllDescription.tables, undefined, 2));

    let joinTables = [];
    if (testJoinRootTable == false) {
        joinTables = api.correctService.getJoinTables(rootTable);
        testJoinRootTable = true;
    }

    //var arr = [5, 6, 7, 8];
    let joinTablesToString = JSON.stringify(Object.assign({}, joinTables));  // convert array to string
    let joinTablesJsonObject = JSON.parse(joinTablesToString);  // convert string to json object
    modifyKeys(joinTablesJsonObject);
    this.objectMapWithAllDescription.map[rootTable] = {}

    let otherJoinTables = [];

    for (let joinTableKey in joinTablesJsonObject) {
        if (testOtherJoinTables == false) {
            otherJoinTables = api.correctService.getJoinTables(joinTablesJsonObject[joinTableKey])
        }
        // console.log(otherJoinTables);
        let otherJoinTablesToString = JSON.stringify(Object.assign({}, otherJoinTables));  // convert array to string
        let otheJoinTablesJsonObject = JSON.parse(otherJoinTablesToString);
        modifyKeys(otheJoinTablesJsonObject);
        let mytabContainFistjoin = []
        for (let tableKey in jsonWithaoutDescription) {
            // co
            if (joinTableKey == tableKey) {

                mytabContainFistjoin.push(tableKey);
                mytabContainFistjoin = Array.from(new Set(mytabContainFistjoin));
                formatJoinTable = this.schema + "." + tableKey;
                correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName
                // jsonAll[keyRoot].join_tables[key].target
                this.objectMapWithAllDescription.map[rootTable][joinTableKey] = {
                    "from": jsonWithaoutDescription[rootTable].join_tables[joinTableKey].from,
                    "target": jsonWithaoutDescription[rootTable].join_tables[joinTableKey].target,

                }
                // my tabableeee///////////////////////////////////////////////////////////////////////////////////

                /*  this.objectMapWithAllDescription.table[rootTable]={

                      "description": this.objectMapWithAllDescription.tables[rootTable].description,
                      "constraints": this.objectMapWithAllDescription.tables[rootTable].constraints,//"",//correctTableConstraint!=undefined && correctWhereClose!=undefined && correctConstraint.trim()!="WHERE"?correctConstraint:"",
                      "columns": this.objectMapWithAllDescription.tables[rootTable].columns,

                  }
                  this.objectMapWithAllDescription.table[tableKey]={
                  "description": this.objectMapWithAllDescription.tables[tableKey].description,
                      "constraints": correctCondition,//"",//correctTableConstraint!=undefined && correctWhereClose!=undefined && correctConstraint.trim()!="WHERE"?correctConstraint:"",
                      "columns": attributHanler

              }
                 let  ajoin = api.correctService.getJoinTables(tableKey);
                  this.objectMapWithAllDescription.table[tableKey]["join_tables"]={

                  };this.objectMapWithAllDescription.table[tableKey]["constraint"]={

                  };
                  for (let h = 0; h < ajoin.length; h++) {
                       this.objectMapWithAllDescription.table[tableKey]["join_tables"][ajoin[h]]=ajoin[h]
                          let api = this;
                     this.objectMapWithAllDescription.table[tableKey]["constraint"][ajoin[h]]='fdddddddddddddddddd'
                      for(let k in this.objectMapWithAllDescription.tables){
                         // console.log(k+" ++++++++++++ "+ajoin[h]);
                          if (ajoin[h].trim() === k.trim()) {
                              console.log(k);

                              if(this.objectMapWithAllDescription.table[tableKey]!=undefined) {
                                  this.objectMapWithAllDescription.table[tableKey]["constraint"][ajoin[h]] = correctCondition
                                  console.log(this.objectMapWithAllDescription.table[tableKey]["constraint"][ajoin[h]]);
                              }
                          }

                      }
                          }*/
                //////////////////////////////////////////////////////////////////////////////////////////
            } else {


            }

            ///////////////////////////////////////////////////////
        }
        for (let otherJoinTableKey in otheJoinTablesJsonObject) {

            /*Object.keys(this.objectMapWithAllDescription.tables).forEach(function (k) {
                if (otherJoinTableKey == k) {
                    console.log(k);
                    /*this.objectMapWithAllDescription.table[k] = {
                        "description": this.objectMapWithAllDescription.tables[k].description,
                        "constraints": this.objectMapWithAllDescription.tables[k].constraints,//"",//correctTableConstraint!=undefined && correctWhereClose!=undefined && correctConstraint.trim()!="WHERE"?correctConstraint:"",
                        "columns": this.objectMapWithAllDescription.tables[k].columns,
                    }
                }
            })*/

            this.objectMapWithAllDescription.map[rootTable][joinTableKey]["join_tables"] = otheJoinTablesJsonObject
            for (let tableKey in jsonWithaoutDescription) {
                if (tableKey == otherJoinTableKey) {

                }
            }
        }
        this.objectMapWithAllDescription.map[rootTable]['join_tables'] = this.objectMapWithAllDescription.map[rootTable][joinTableKey].join_tables;
        // this.objectMapWithAllDescription.map[rootTable].join_tables[joinTableKey].join_tables =this.objectMapWithAllDescription.map[rootTable][joinTableKey].join_tables;
        if (testTempJoinMap == false) {

            tempJson.map.join_tables = this.objectMapWithAllDescription.map[rootTable]

        }
    }
    testOtherJoinTables = true;
    TestTempJoinMap = true;
    for (let join_table_key in this.objectMapWithAllDescription.map[rootTable]) {
        if (join_table_key == "join_tables") {
            delete this.objectMapWithAllDescription.map[rootTable].join_tables;
        }

        //this.objectMapWithAllDescription.map[rootTable]['join_tables'][join_table_key] = this.objectMapWithAllDescription.map[rootTable][join_table_key]
    }


    this.objectMapWithAllDescription.map[rootTable] = tempJson.map;

    // console.log(JSON.stringify(this.objectMapWithAllDescription.map[rootTable], undefined, 4));

    return this.objectMapWithAllDescription;


}

function replaceAll(str, find, replace) {
    var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}

function modifyKeys(obj) {
    Object.keys(obj).forEach(key => {
        obj[`${obj[key]}`] = obj[key];
        delete obj[key];
        if (typeof obj[`${obj[key]}`] === "object") {
            modifyKeys(obj[`${obj[key]}`]);
        }
    });
}

var testJsonRead = false
var sj = '';
HandlerAttributs.prototype.getTableAttributeHandler = function (table) {
    let doubleArrayValue = [];
    let singleArrayValue = [];
    this.db_name = this.api.connector.service["table"]
    var api = this.api;
    let jsonContaintHandlerValues = {
        succes: {
            status: "",
            "table": table,
            attribute_handlers:
                {
                    "db_name": this.db_name,
                    "column_name": this.name,
                    "unit": this.range,
                    "ucd": this.ucd,
                    "utype": this.utype,
                    "dataType": this.type,
                    "description": this.description
                }

        },
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }


    if (api.testConnection == true) {

        if (testJsonRead == false) {
            sj = new jsonRead(api.getObjectMap().succes.object_map);
            testJsonRead = true;
        }
        var adql = this.addAllColumn(table, api.connector.service["schema"]);

        var s = api.tapService;
        var votableQueryResult = s.Query(adql);

        let dataTable;
        let contentText;
        let Field;
        let nbCols;
        if (votableQueryResult != undefined) {
            dataTable = VOTableTools.votable2Rows(votableQueryResult);
            // console.log(dataTable);
            contentText = votableQueryResult.responseText;
            Field = VOTableTools.genererField(votableQueryResult, contentText)

            nbCols = Field.length;

            let rowN

            for (rowN = 0; rowN < dataTable.length; rowN += nbCols) {//table  content
                for (let k = rowN; k < dataTable.length; k++) {

                    singleArrayValue.push(dataTable[k]);

                }
                doubleArrayValue.push(singleArrayValue);

                singleArrayValue = []
            }
            //doubleArrayValue.splice(doubleArrayValue[0][0], 0);
            // console.log(doubleArrayValue);
            //alert(doubleArrayValue);
            jsonContaintHandlerValues.succes.status = "OK"
            let jsonContaintHandlersValue = []
            for (let c = 0; c < doubleArrayValue.length; c++) {
                jsonContaintHandlerValues.succes.attribute_handlers.column_name = doubleArrayValue[c][0];
                jsonContaintHandlerValues.succes.attribute_handlers.unit = doubleArrayValue[c][1];
                jsonContaintHandlerValues.succes.attribute_handlers.ucd = doubleArrayValue[c][2];
                jsonContaintHandlerValues.succes.attribute_handlers.utype = doubleArrayValue[c][3];
                jsonContaintHandlerValues.succes.attribute_handlers.dataType = doubleArrayValue[c][4];
                jsonContaintHandlerValues.succes.attribute_handlers.description = doubleArrayValue[c][5];
                jsonContaintHandlersValue.push(jsonContaintHandlerValues.succes.attribute_handlers);
                jsonContaintHandlerValues.succes.attribute_handlers = {
                    "name": table,
                    "db_name": api.connector.service["table"],
                    "column_name": "",
                    "unit": "",
                    "ucd": "",
                    "utype": "",
                    "dataType": "",
                    "description": ""
                }
            }
            jsonContaintHandlerValues.succes.attribute_handlers = jsonContaintHandlersValue;

        } else {

            jsonContaintHandlerValues.failure.otherError.status = "Failed"
            jsonContaintHandlerValues.failure.otherError.message = "error_message"
            // alert('you are not connected');
        }
    } else {
        jsonContaintHandlerValues.failure.notConnected.status = "Failed";
        jsonContaintHandlerValues.failure.notConnected.message = "No active TAP connection"
    }
    if (jsonContaintHandlerValues.succes.status == "OK") {
        return jsonContaintHandlerValues.succes
    } else if (jsonContaintHandlerValues.failure.notConnected.status == "Failed") {
        return jsonContaintHandlerValues.failure.notConnected
    } else {
        return jsonContaintHandlerValues.failure.otherError;
    }
}


HandlerAttributs.prototype.addAllColumn = function (table, schema) {
    //alert(schema)
    var adql = "SELECT "
        + "TAP_SCHEMA.columns.column_name"
        + ",TAP_SCHEMA.columns.unit"
        + ",TAP_SCHEMA.columns.ucd"
        + ",TAP_SCHEMA.columns.utype"
        + ",TAP_SCHEMA.columns.dataType"
        + ",TAP_SCHEMA.columns.description"
        + " FROM TAP_SCHEMA.columns";
    if (schema == 'public' || schema == 'metaviz') {
        adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + table + "'";

    } else {
        adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + schema + "." + table + "'";

    }
    return adql;

}
