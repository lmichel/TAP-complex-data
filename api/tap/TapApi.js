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

    TapApi.prototype.connect = function ({tapService, schema, table, shortName}) {
        let formatTableName = schema + "." + table;
        let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
        this.tapServiceConnector = new TapServiceConnector(tapService, schema, shortName);
        this.tapServiceConnector.connector.votable = this.tapServiceConnector.Query(this.tapServiceConnector.setAdqlConnectorQuery(correctTableNameFormat));
        this.tapServiceConnector.api = this;
        if (this.tapServiceConnector.connector.votable.status === 200) {
            this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector)
        }
        /* for vizier only*/
        else if (this.tapServiceConnector.connector.votable !== undefined && shortName === "Vizier") {
            this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector)
        } else {
            this.tapServiceConnector.connector.status = 'Failled';
            this.tapServiceConnector.connector.message = "No active TAP connection"
        }
        this.tapServiceConnector.attributsHandler.api = this.tapServiceConnector.api;

        this.tapServiceConnector.getJsonAdqlContent();

        this.jsonAdqlBuilder = new JsonAdqlBuilder(this.getObjectMap().succes.object_map);

        return this.tapServiceConnector.connector;
    }

    TapApi.prototype.disconnect = function () {
        /*this.tapServiceConnector = "";
        this.votableQueryResult = undefined;
        this.dataTable1 = undefined;*/
        document.location.reload();
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
            if(this.tapServiceConnector.objectMapWithAllDescription.map[baseTable] === undefined){
                this.tapServiceConnector.jsonContaintJoinTable.Succes.status = "Failed";
                this.tapServiceConnector.jsonContaintJoinTable.Failure.WrongTable.status = "Failed";
                this.tapServiceConnector.jsonContaintJoinTable.Failure.WrongTable.message = "table " + baseTable + " is not part of the object map"
            }else {
                this.tapServiceConnector.jsonContaintJoinTable.Succes.joined_tables = this.tapServiceConnector.objectMapWithAllDescription.map[baseTable].join_tables//this.tapServiceConnector.getJoinTables(baseTable);
                this.tapServiceConnector.jsonContaintJoinTable.Succes.status = "OK";
                this.tapServiceConnector.jsonContaintJoinTable.Succes.base_table = baseTable;
            }
            
        } else {
            this.tapServiceConnector.jsonContaintJoinTable.Succes.status = "Failed";
            this.tapServiceConnector.jsonContaintJoinTable.Failure.NotConnected.message = "No active TAP connection";
        }
        return this.tapServiceConnector.jsonContaintJoinTable;
    }

    /**
     * @param {*} mainJsonData the main json create by the method createMainJson of Tapservice
     * @returns return all join request of each join table of the mainJson
     */
    TapApi.prototype.getRootFields = function () {
        if (this.getConnector().status === 'OK') {

            let votable = this.tapServiceConnector.Query(this.getRootFieldsQuery().query);

            let dataTable = []

            let Field = this.getTableAttributeHandlers(this.getConnector().service["table"]).attribute_handlers

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

                return {"status" : "OK" , "field_values" :doubleArrayValue};
            } else {
                return {"status" : "Failed" , "message" :"votable.statusText" };
            }
            
        } else {
            return {"status" : "Failed" , "message" :"No active TAP connection" };
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
            let jsonContaintHandlersValue1 = [];
            if (this.dataTable1 === undefined) {
                this.dataTable1 = this.tapServiceConnector.attributsHandler.getTableAttributeHandler(rootable, schema)// VOTableTools.votable2Rows(adql1);
            }
            for (let b = 0; b < this.dataTable1.attribute_handlers.length; b++) {
                for (let ke in this.dataTable1.attribute_handlers[b]) {
                    for (let col = 0; col < Field.length; col++) {
                        if (this.dataTable1.attribute_handlers[b][ke] === Field[col]) {
                            jsonContaintHandlersValue1.push(this.dataTable1.attribute_handlers[b])
                        }
                    }
                }
            }
            jsonContaintHandlersValue1 = Array.from(new Set(jsonContaintHandlersValue1));
            this.tapServiceConnector.objectMapWithAllDescription.map['handler_attributs'] = jsonContaintHandlersValue1
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

    TapApi.prototype.getRootQueryIds = function () {
        let jsonContaintRootQueryIdsValues = {succes: {status: "", field_ids: []}, failure: {notConnected: {status: "", message: ""}, otherError: {status: "", message: ""}}}
        let doubleArrayValue = [];
        let singleArrayValue = [];
        if (this.getConnector().status == 'OK') {
            let Field = this.getAllSelectedRootField(this.getConnector().service["table"]);
            let votable = this.tapServiceConnector.Query(this.getRootQuery().query);
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
        if (this.getConnector().status === 'OK') {
            let rootTable = this.getConnector().service["table"];
            let allField = this.formatColNames(rootTable,this.getAllSelectedRootField(rootTable));
            let contentAdql = "";

            let schema = this.tapServiceConnector.connector.service["schema"];
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + rootTable;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            contentAdql = "SELECT TOP 10 " + allField;
            contentAdql += '\n' + " FROM  " + correctTableNameFormat;

            for (let key in this.tapServiceConnector.jsonAdqlContent.allJoin) {
                if (contentAdql.indexOf(this.tapServiceConnector.jsonAdqlContent.allJoin[key]) !== -1) {
                } else {
                    contentAdql += '\n' + this.tapServiceConnector.jsonAdqlContent.allJoin[key];
                }
            }

            this.tapServiceConnector.setRootQuery(contentAdql)

            this.addConstraint();
            return {"status": "OK", "query": this.tapServiceConnector.getJsonAdqlContent().rootQuery} ;
        }

        return {"status":"failed", "message": "No active TAP connection"}
    }

    /**
     * Create and return the correct adql querry to get the value of all fields of the selected root table, taking in account all user's defined constraints
     * @returns {string} the adql query
     */
    TapApi.prototype.getRootFieldsQuery = function(){
        if (this.getConnector().status === 'OK') {
            let rootTable = this.getConnector().service["table"];

            /**
             * Simbad doesn't support SELECT *
             * so we explicitly tell him every field.
             */
            let allField;
            if (this.getConnector().service.shortName == "Simbad"){
                allField = this.formatColNames(rootTable,this.getAllRootField(rootTable));
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

            for (let key in this.tapServiceConnector.jsonAdqlContent.allJoin) {
                if (contentAdql.indexOf(this.tapServiceConnector.jsonAdqlContent.allJoin[key]) !== -1) {
                } else {
                    contentAdql += '\n' + this.tapServiceConnector.jsonAdqlContent.allJoin[key];
                }
            }

            this.tapServiceConnector.setRootQuery(contentAdql)

            this.addConstraint();
            return {"status": "OK", "query": this.tapServiceConnector.getJsonAdqlContent().rootQuery} ;
        }

        return {"status":"failed", "message": "No active TAP connection"}
    }

    TapApi.prototype.addConstraint = function () {
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
     *@param {string} table :  the name of table you want to remove the contraint associeted with
    * @return {*} {status: ok} | {status:failed, message: error_message}
    **/
    TapApi.prototype.resetTableConstraint = function (table) {
        let objectMap = this.getObjectMap()
        if (objectMap.succes.status !== "OK"){
            return objectMap.failure;
        }

        let schema = this.tapServiceConnector.connector.service["schema"];
        let formatTableName = schema + "." + table;
        let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

        let status = {};
        
        if (objectMap.succes.object_map.tables[table] !== undefined ) {

            objectMap.succes.object_map.tables[table].constraints = ""
            delete this.tapServiceConnector.jsonAdqlContent.allJoin[correctTableNameFormat];
            delete this.tapServiceConnector.jsonAdqlContent.allCondition[correctTableNameFormat];
            status.status = "OK";
        }
        
        if (status.status===undefined){
            status = {"status":"failed","message":"Unknown table " + table}
        }
        return status;
    }

    /**
    * @return {*} {status: ok} | {status:failed, message: error_message}
    **/
    TapApi.prototype.resetAllTableConstraint = function () {
        let status;
        
        for (let key in this.getObjectMapWithAllDescriptions().tables) {
            status = this.resetTableConstraint(key);
            if (status.status !== "OK"){
                return status;
            }
        }

        return status;
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
        return  this.tapServiceConnector.getObjectMapAndConstraints();
    }

    TapApi.prototype.setAdql = function (rootTable, constraint) {
        return this.tapServiceConnector.getAdqlAndConstraint(rootTable,constraint)
    }

    TapApi.prototype.getAllSelectedRootField = function (rootTable){

        /**
         * We get all the tables joined with the root table
         * then we gather all the columns which connect the root table with those tables
         * finaly we create a set to ensure not selecting any columns more than once
         */

        let join_tables = this.getObjectMap().succes.object_map.map[rootTable].join_tables;

        let columns = []
        for (let key in join_tables){
            columns.push(join_tables[key].target);
        }
        
        return columns =Array.from(new Set(columns));;

    }

    TapApi.prototype.getAllRootField = function (rootTable){

        let columns = [];


        let jsonField = this.getTableAttributeHandlers(rootTable).attribute_handlers
        
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
     * @returns {*} {status: ok} | {status:failed, message: error_message}
     */
    TapApi.prototype.setTableConstraint = function(table, constraint){
        if (this.getConnector().status == 'OK') {
            let schema = this.tapServiceConnector.connector.service["schema"];
            let format = schema + '.' + table;
            let correctTable = format.quotedTableName().qualifiedName;
            let jsonAdqlContent = this.tapServiceConnector.jsonAdqlContent;

            if (jsonAdqlContent.constraint[correctTable] !== undefined ) {
                /*/ constraint cleanup /*/
                constraint = constraint.trim();

                while (constraint.startsWith("AND") || constraint.startsWith("WHERE")){
                    while (constraint.startsWith("AND")){
                        constraint = constraint.substring(3).trim();
                    }
                    while (constraint.startsWith("WHERE")){
                        constraint = constraint.substring(5).trim();
                    }
                }
                
                jsonAdqlContent.allJoin[correctTable] = jsonAdqlContent.constraint[correctTable];
                jsonAdqlContent.allCondition[correctTable] = constraint

            } else {
                return {"status" : "failed", "message" : "Unknown table " + table};
            }

            return {"status": "OK"};
        }

        return {"status":"failed", "message": "No active TAP connection"};
        
    }

    /**
     * 
     * @returns {*} {"status":"OK", "jsonADQLContent": jsonADQLContent} | {"status":"failed", "message": "No active TAP connection"}
     */
    TapApi.prototype.getJsonAdqlContent = function() {
        if (this.getConnector().status == 'OK'){
            return {"status":"OK", "jsonADQLContent": this.tapServiceConnector.getJsonAdqlContent()}
        } else {
            return {"status":"failed", "message": "No active TAP connection"};
        }
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