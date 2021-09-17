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
        this.tapServiceConnector.connector.votable = await this.tapServiceConnector.Query(this.tapServiceConnector.setAdqlConnectorQuery(correctTableNameFormat));
        this.tapServiceConnector.api = this;
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
                "logs":"Failed to initialize TAP connection:\n" + status,
                "params":{"tapService":tapService, "schema":schema, "table":table, "shortName":shortName}
            }};
        }
        this.tapServiceConnector.attributsHandler.api = this.tapServiceConnector.api;

        this.jsonAdqlBuilder = new JsonAdqlBuilder((await this.getObjectMap()).object_map);

        return {"status":true};
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
            objectMap.status = true
            objectMap.object_map = await this.getObjectMapWithAllDescriptions();
            return objectMap;
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
            if(this.tapServiceConnector.objectMapWithAllDescription.map[baseTable] === undefined){
                jsonContaintJoinTable.status = false;
                jsonContaintJoinTable.error = {"logs":"table " + baseTable + " is not part of the object map","prams":{"baseTable":baseTable}};
            }else {
                jsonContaintJoinTable.joined_tables = this.tapServiceConnector.objectMapWithAllDescription.map[baseTable].join_tables//this.tapServiceConnector.getJoinTables(baseTable);
                jsonContaintJoinTable.status = true;
                jsonContaintJoinTable.base_table = baseTable;
            }
            
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

            if (votable.status == 200) {
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
                return {"status" :false , "error":{"logs" :votable.statusText }};
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
            let Field = await this.getAllSelectedRootField(this.getConnector().connector.service["table"]);
            let votable = await this.tapServiceConnector.Query( (await this.getRootQuery()).query);
            let dataTable = []
            if (votable.status == 200) {
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
                jsonContaintRootQueryIdsValues.error = {"logs" : votable.statusText}
                jsonContaintRootQueryIdsValues.status = false;
            }
        } else{
            jsonContaintRootQueryIdsValues.error = {"logs" : "No active TAP connection"}
            jsonContaintRootQueryIdsValues.status = false;
        }
        return jsonContaintRootQueryIdsValues;
    }

    TapApi.prototype.getRootQuery = async function () {
        if (this.getConnector().status) {
            let rootTable = this.getConnector().connector.service["table"];
            let allField = this.formatColNames(rootTable,await this.getAllSelectedRootField(rootTable));
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
     * Create and return the correct adql querry to get the value of all fields of the selected root table, taking in account all user's defined constraints
     */
    TapApi.prototype.getRootFieldsQuery = async function(){
        if (this.getConnector().status) {
            let rootTable = this.getConnector().connector.service["table"];

            /**
             * Simbad doesn't support SELECT *
             * so we explicitly tell him every field.
             */
            let allField;
            if (this.getConnector().connector.service.shortName == "Simbad"){
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

    TapApi.prototype.setAdql = function (rootTable, constraint) {
        return this.tapServiceConnector.getAdqlAndConstraint(rootTable,constraint)
    }

    TapApi.prototype.getAllSelectedRootField = async function (rootTable){

        /**
         * We get all the tables joined with the root table
         * then we gather all the columns which connect the root table with those tables
         * finaly we create a set to ensure not selecting any columns more than once
         */

        let join_tables = (await this.getObjectMap()).object_map.map[rootTable].join_tables;

        let columns = []
        for (let key in join_tables){
            columns.push(join_tables[key].target);
        }
        
        return columns =Array.from(new Set(columns));;

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
        schema = schema.quotedTableName().qualifiedName;
        
        for(let i=0;i<columns.length; i++){
            if(schema==="dbo"){
                // just for CaomMembers tables because request lenth is limited
                if(rootTable=="CaomMembers"){
                    if(i<3){
                        allField +=schema+'.'+rootTable+'.'+columns[i]+" , "
                    }else {
                        allField +=schema+'.'+rootTable+'.'+columns[i]
                        break;
                    }
                    // just for CAOM because request lenth is limited
                }else if(i<20){
                    allField +=schema+'.'+rootTable+'.'+columns[i]+" , "
                }else {
                    allField +=schema+'.'+rootTable+'.'+columns[i]
                    break;
                }
                // just for 3XMM because request lenth is limited
            }else if(schema==="EPIC"){
                if(i<20){
                    allField +=schema+'.'+rootTable+'.'+columns[i]+" , "
                }else {
                    allField +=schema+'.'+rootTable+'.'+columns[i]
                    break;
                }
            }
            else if(i<columns.length-1){
                allField +=schema+'.'+rootTable+'.'+columns[i]+" , "
            }else {
                allField +=schema+'.'+rootTable+'.'+columns[i]
                break;
            }

        }
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

        return {"status":false, "error":{"logs": "No active TAP connection","param":{"table":table,"constraint":constraint}}};
        
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