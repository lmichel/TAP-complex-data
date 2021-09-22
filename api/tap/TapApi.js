"use strict";
var TapApi = (function(){

    function TapApi() {
        this.tapServiceConnector = "";
        this.votableQueryResult = undefined;
        this.dataTable1 = undefined;
        this.jsonAdqlBuilder = undefined;
    }

    /**
     * @param params (Json) with parameters (tapService,schema,table,shortName)
     * @param schema (String) Schema containing the complex object
     * @param table (String) Root table of the complex object
     * @param shortName (String) The Shortname of database
     * */
    TapApi.prototype.initConnetor =function (tapService, schema, table, shortName,initJson){
        initJson.status = 'OK';
        initJson.service["tapService"] = tapService;
        initJson.service["schema"] = schema;
        initJson.service["table"] = table;
        initJson.service["shortName"] = shortName;
        initJson.message = "Active TAP : " + shortName;
    }

    TapApi.prototype.connect = async function ({tapService, schema, table, shortName}) {
        let formatTableName = schema + "." + table;
        let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
        this.tapServiceConnector = new TapServiceConnector(tapService, schema, shortName);
        this.tapServiceConnector.api = this;
        this.tapServiceConnector.connector.votable = await this.tapServiceConnector.Query(this.tapServiceConnector.setAdqlConnectorQuery(correctTableNameFormat));
        if (this.tapServiceConnector.connector.votable.status){
            
            this.tapServiceConnector.connector.votable = this.tapServiceConnector.connector.votable.answer;

            if (this.tapServiceConnector.connector.votable.status === 200) {
                this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector)
            }
            /* for vizier only*/
            else if (this.tapServiceConnector.connector.votable !== undefined && shortName === "Vizier") {
                this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector)
            } else {
                let status = this.tapServiceConnector.connector.votable.statusText
                this.tapServiceConnector.connector = undefined;
                return {"status":false,"error":{
                    "logs":"Failed to initialize TAP connection:\n " + status,
                    "params":{"tapService":tapService, "schema":schema, "table":table, "shortName":shortName}
                }};
            }
            this.tapServiceConnector.attributsHandler.api = this.tapServiceConnector.api;

            let obj = await this.getObjectMap()

            if (obj.status){
                this.jsonAdqlBuilder = new JsonAdqlBuilder(obj.object_map);
            } else {
                return {"status":false,"error":{
                    "logs":"Failed to initialize internal data structures :\n " + obj.error.logs,
                    "params":{"tapService":tapService, "schema":schema, "table":table, "shortName":shortName}
                }};
            }
            return {"status":true};
        }
        return {"status":false,"error":{
            "logs":"Failed to initialize TAP connection:\n " + this.tapServiceConnector.connector.votable.error.logs,
            "params":{"tapService":tapService, "schema":schema, "table":table, "shortName":shortName}
        }};
        
    }

    TapApi.prototype.disconnect = function () {
        /*this.tapServiceConnector = "";
        this.votableQueryResult = undefined;
        this.dataTable1 = undefined;*/
        document.location.reload();
    }

    TapApi.prototype.getConnector = function () {
        if(this.tapServiceConnector.connector===undefined){
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }else {
            return {"status" : true , "connector":this.tapServiceConnector.connector}
        }

    }

    TapApi.prototype.getObjectMap = async function () {
        let objectMap = {}
        if (this.getConnector().status) {
            let map = await this.getObjectMapWithAllDescriptions()
            objectMap.status = map.status
            delete map.status;

            if(objectMap.status){
                objectMap.object_map = map;
                return objectMap;
            } else {
                objectMap.error = { "logs": map.error.logs};
                return objectMap
            }
        } else {
            objectMap.status = false
            objectMap.error = { "logs": "No active TAP connection"};
            return objectMap
        }
    }

    /**
     * @param baseTable (string): Table from which joint table are searched
     * */
    TapApi.prototype.getJoinedTables = function (baseTable) {
        let jsonContaintJoinTable = {};
        if (this.getConnector().status) {
            
            jsonContaintJoinTable.joined_tables = this.jsonAdqlBuilder.getLowerJoints(baseTable).joints
            jsonContaintJoinTable.status = true;
            jsonContaintJoinTable.base_table = baseTable;
            
        } else {
            jsonContaintJoinTable.status = false;
            jsonContaintJoinTable.error = {"logs":"No active TAP connection","prams":{"baseTable":baseTable}};
        }
        return jsonContaintJoinTable;
    }

    /**
     * @returns Returns all fields of root table rows returned by the ADQL query on the root table filtered by all constraints put on joined tables at any levels.
     */
    TapApi.prototype.getRootFields = async function () {
        if (this.getConnector().status) {

            let votable = await this.tapServiceConnector.Query((await this.getRootFieldsQuery()).query);

            let dataTable = []

            let Field = (await this.getTableAttributeHandlers(this.getConnector().connector.service["table"])).attribute_handlers

            if (votable.status) {
                votable = votable.answer
                dataTable = this.tapServiceConnector.getDataTable(votable);
                let nbCols = Field.length;
                let singleArrayValue = [];
                let doubleArrayValue = [];
                for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {
                    for (let col = 0; col < nbCols; col++) {
                        singleArrayValue.push(dataTable[rowNb+col]);
                    }
                    doubleArrayValue.push(singleArrayValue);

                    singleArrayValue = [];
                }

                return {"status" : true , "field_values" :doubleArrayValue};
            } else {
                return {"status" :false , "error":{"logs" :votable.error.logs }};
            }
            
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }
    }

    TapApi.prototype.getRootQueryIds = async function () {
        let jsonContaintRootQueryIdsValues = {}
        let doubleArrayValue = [];
        let singleArrayValue = [];
        if (this.getConnector().status) {
            let Field = this.getAllSelectedRootField(this.getConnector().connector.service["table"]);
            let votable = await this.tapServiceConnector.Query( (await this.getRootQuery()).query);
            let dataTable = []
            if (votable) {
                votable = votable.answer;
                dataTable = this.tapServiceConnector.getDataTable(votable);
                let nbCols = Field.length;
                for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {//table  content
                    for (let col = 0; col < nbCols; col++) {
                        singleArrayValue.push(dataTable[rowNb+col]);
                    }
                    doubleArrayValue.push(singleArrayValue);

                    singleArrayValue = [];
                }
                jsonContaintRootQueryIdsValues.status = true;
                jsonContaintRootQueryIdsValues.field_ids = doubleArrayValue;
            } else {
                jsonContaintRootQueryIdsValues.error = {"logs" : votable.error.logs}
                jsonContaintRootQueryIdsValues.status = false;
            }
        } else{
            jsonContaintRootQueryIdsValues.error = {"logs" : "No active TAP connection"}
            jsonContaintRootQueryIdsValues.status = false;
        }
        return jsonContaintRootQueryIdsValues;
    }

    TapApi.prototype.getRootQuery = function () {
        if (this.getConnector().status) {
            let rootTable = this.getConnector().connector.service["table"];
            let allField = this.formatColNames(rootTable, this.getAllSelectedRootField(rootTable));
            let contentAdql = "";

            let schema = this.tapServiceConnector.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + rootTable;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            contentAdql = "SELECT TOP 10 " + allField;
            contentAdql += '\n' + " FROM  " + correctTableNameFormat + "\n";

            contentAdql += this.jsonAdqlBuilder.getAdqlJoints().adqlJoints;

            contentAdql += this.jsonAdqlBuilder.getAdqlConstraints().adqlConstraints;
            return {"status": true, "query": contentAdql} ;
        }

        return {"status":false,"error" :{ "logs": "No active TAP connection"}};
    }


    /**
     * Create and return the correct adql query to get the value of the IDs of the selected table
     */
    TapApi.prototype.getTableQuery = function(table,joinKeyVal){
        if(this.getConnector().status){
            let allField = this.formatColNames(table,this.getAllSelectedRootField(table));
            let adql =""

            let schema = this.tapServiceConnector.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + table;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            adql = "SELECT TOP 10 " + allField;
            adql += '\n' + " FROM  " + correctTableNameFormat + "\n";

            adql += this.jsonAdqlBuilder.getAdqlJoints(table).adqlJoints;

            adql += this.jsonAdqlBuilder.getAdqlConstraints(table,joinKeyVal).adqlConstraints;
            return {"status": true, "query": adql} ;
        }
        return {"status":false,"error" :{ "logs": "No active TAP connection"}};
    }

    TapApi.prototype.getTableQueryIds = async function(table,joinKeyVal){
        if (this.getConnector().status) {

            let votable = await this.tapServiceConnector.Query((await this.getTableQuery(table,joinKeyVal)).query);

            let dataTable = []

            let Field = this.getAllSelectedRootField(table);

            if (votable) {
                votable = votable.answer
                dataTable = this.tapServiceConnector.getDataTable(votable);
                let nbCols = Field.length;
                let singleArrayValue = [];
                let doubleArrayValue = [];
                for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {
                    for (let col = 0; col < nbCols; col++) {
                        singleArrayValue.push(dataTable[rowNb+col]);
                    }
                    doubleArrayValue.push(singleArrayValue);

                    singleArrayValue = [];
                }

                return {"status" : true , "field_values" :doubleArrayValue};
            } else {
                return {"status" :false , "error":{"logs" :votable.error.logs }};
            }
            
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }
    }

    /**
     * Create and return the correct adql query to get the value of all the fields of the selected table
     */
    TapApi.prototype.getTableFieldsQuery = async function(table,joinKeyVal){
        if(this.getConnector().status){
            let allField = this.formatColNames(table,await this.getAllRootField(table));
            let adql =""

            let schema = this.tapServiceConnector.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + table;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            adql = "SELECT TOP 10 " + allField;
            adql += '\n' + " FROM  " + correctTableNameFormat + "\n";

            adql += this.jsonAdqlBuilder.getAdqlJoints(table).adqlJoints;

            adql += this.jsonAdqlBuilder.getAdqlConstraints(table,joinKeyVal).adqlConstraints;
            return {"status": true, "query": adql} ;
        }
        return {"status":false,"error" :{ "logs": "No active TAP connection"}};
    }
    
    TapApi.prototype.getTableFields = async function(table,joinKeyVal){
        if (this.getConnector().status) {

            let votable = await this.tapServiceConnector.Query((await this.getTableFieldsQuery(table,joinKeyVal)).query);

            let dataTable = []

            let Field = await this.getAllRootField(table);

            if (votable.status) {
                votable = votable.answer
                dataTable = this.tapServiceConnector.getDataTable(votable);
                let nbCols = Field.length;
                let singleArrayValue = [];
                let doubleArrayValue = [];
                for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {
                    for (let col = 0; col < nbCols; col++) {
                        singleArrayValue.push(dataTable[rowNb+col]);
                    }
                    doubleArrayValue.push(singleArrayValue);

                    singleArrayValue = [];
                }

                return {"status" : true , "field_values" :doubleArrayValue};
            } else {
                return {"status" :false , "error":{"logs" :votable.error.logs }};
            }
            
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }
    }
    /**
     * Create and return the correct adql querry to get the value of all fields of the selected root table, taking in account all user's defined constraints
     */
    TapApi.prototype.getRootFieldsQuery = async function(){
        if (this.getConnector().status) {
            let rootTable = this.getConnector().connector.service["table"];

            /**
             * Simbad doesn't support SELECT *
             * Vizier has a weird management of *
             * so we explicitly tell them every field.
             */
            let allField;
            if (this.getConnector().connector.service.shortName == "Simbad" || this.getConnector().connector.service.shortName == "Vizier"){
                allField = this.formatColNames(rootTable,await this.getAllRootField(rootTable));
            }else {
                allField = this.formatColNames(rootTable,["*"]);
            }

            let contentAdql = "";

            let schema = this.tapServiceConnector.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + rootTable;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            contentAdql = "SELECT TOP 10 " + allField;
            contentAdql += '\n' + " FROM  " + correctTableNameFormat;

            contentAdql += this.jsonAdqlBuilder.getAdqlJoints().adqlJoints;

            contentAdql += this.jsonAdqlBuilder.getAdqlConstraints().adqlConstraints;
            return {"status": true, "query": contentAdql} ;
        }

        return {"status":false,"error" :{ "logs": "No active TAP connection"}};
    }

    /**
     *@param {string} table :  the name of table you want to remove the contraint associeted with
    * @return {*} {status: true|false, "error?": {}}
    **/
    TapApi.prototype.resetTableConstraint = function (table) {

        return this.jsonAdqlBuilder.removeTableConstraints(table);
    }

    /**
    * @return {*} {status: true|false, "error?": {}}
    **/
    TapApi.prototype.resetAllTableConstraint = function () {
        return this.jsonAdqlBuilder.removeAllTableConstraints();
    }

    /**
     * @param {*} table : String the name of table you want get handlerAttribut associeted with
     * @return {*} : Json the json containing all handler Attribut of the table
     * */
    TapApi.prototype.getTableAttributeHandlers = async function (table) {
        return await this.tapServiceConnector.attributsHandler.getTableAttributeHandler(table);
    }

    /**
     *@return {*} : Json the json containing all detail about every singel table join to the root table with all join table of each table and all condition of each table
    **/
    TapApi.prototype.getObjectMapWithAllDescriptions = async function () {
        return await this.tapServiceConnector.getObjectMapAndConstraints();
    }

    TapApi.prototype.getAllSelectedRootField = function (rootTable){
        
        return this.jsonAdqlBuilder.getJoinKeys(rootTable).keys;

    }

    TapApi.prototype.getAllRootField = async function (rootTable){

        let columns = [];


        let jsonField = (await this.getTableAttributeHandlers(rootTable)).attribute_handlers
        
        for (let i =0;i<jsonField.length;i++){
            columns.push(jsonField[i].column_name);
        }

        return columns =Array.from(new Set(columns));;

    }

    TapApi.prototype.formatColNames = function(rootTable,columns){
        let allField ="";
        let schema;
        schema = this.tapServiceConnector.connector.service["schema"];
        
        for(let i=0;i<columns.length; i++){
            allField +=(schema+'.'+rootTable+'.'+columns[i]).quotedTableName().qualifiedName+" , "

            if(schema==="dbo"){
                // just for CaomMembers tables because request lenth is limited
                if(rootTable=="CaomMembers"){
                    if(i>3){
                        break;
                    }
                    // just for CAOM because request lenth is limited
                }else if(i>20){
                    break;
                }
                // just for 3XMM because request lenth is limited
            }else if(schema==="EPIC"){
                if(i>20){
                    break;
                }
            }

        }

        allField = allField.substring(0,allField.length - 3);

        return allField;
    }

    /**
     * 
     * @param {string} table the table name on which the constraint is set
     * @param {string} constraint an ADQL constraint (to be put after a WHERE: no aggregation)
     * @returns {*} {"status": true|false,"error?":{}}
     */
    TapApi.prototype.setTableConstraint = function(table, constraint){
        if (this.getConnector().status) {

            constraint = constraint.trim();
            return this.jsonAdqlBuilder.setTableConstraint(table, constraint);

        }

        return {"status":false, "error":{"logs": "No active TAP connection","params":{"table":table,"constraint":constraint}}};
        
    }

    return TapApi;
}());

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