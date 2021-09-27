"use strict;";

var TapApi = (function(){

    function TapApi() {
        this.tapServiceConnector = "";
        this.votableQueryResult = undefined;
        this.dataTable1 = undefined;
        this.jsonAdqlBuilder = undefined;
    }

    /** Internal function do not use.
     * @param params (Json) with parameters (tapService,schema,table,shortName)
     * @param schema (String) Schema containing the complex object
     * @param table (String) Root table of the complex object
     * @param shortName (String) The Shortname of database
     * */
    TapApi.prototype.initConnetor =function (tapService, schema, table, shortName,initJson){
        initJson.status = 'OK';
        initJson.service.tapService = tapService;
        initJson.service.schema = schema;
        initJson.service.table = table;
        initJson.service.shortName= shortName;
        initJson.message = "Active TAP : " + shortName;
    };

    TapApi.prototype.connect = async function ({tapService, schema, table, shortName}) {
        try {
            let formatTableName = schema + "." + table;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
            this.tapServiceConnector = new TapServiceConnector(tapService, schema, shortName);
            this.tapServiceConnector.api = this;
            this.tapServiceConnector.connector.votable = await this.tapServiceConnector.Query(this.tapServiceConnector.setAdqlConnectorQuery(correctTableNameFormat));
            if (this.tapServiceConnector.connector.votable.status){ // status = true mean you get an answer
                
                this.tapServiceConnector.connector.votable = this.tapServiceConnector.connector.votable.answer;

                if (this.tapServiceConnector.connector.votable.status === 200) {// status = 200 mean the answer is positive
                    this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector);
                }
                /* for vizier only*/
                else if (this.tapServiceConnector.connector.votable !== undefined && shortName === "Vizier") {
                    this.initConnetor(tapService, schema, table, shortName,this.tapServiceConnector.connector);
                } else {
                    let status = this.tapServiceConnector.connector.votable.statusText;
                    this.tapServiceConnector.connector = undefined;
                    return {"status":false,"error":{
                        "logs":"Failed to initialize TAP connection:\n " + status,
                        "params":{"tapService":tapService, "schema":schema, "table":table, "shortName":shortName}
                    }};
                }
                this.tapServiceConnector.attributsHandler.api = this.tapServiceConnector.api;

                let obj = await this.getObjectMap();

                if (obj.status){
                    this.jsonAdqlBuilder = new JsonAdqlBuilder(obj.object_map);
                } else {
                    this.tapServiceConnector.connector = undefined;
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
        } catch (error) {
            return {"status":false,"error":{
                "logs":error.toString(),
                "params":{"tapService":tapService, "schema":schema, "table":table, "shortName":shortName}
            }};
        }
        
        
    };

    TapApi.prototype.disconnect = function () {
        /*this.tapServiceConnector = "";
        this.votableQueryResult = undefined;
        this.dataTable1 = undefined;*/
        document.location.reload();
    };

    TapApi.prototype.getConnector = function () {
        if(this.tapServiceConnector.connector===undefined){
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }else {
            return {"status" : true , "connector":this.tapServiceConnector.connector};
        }

    };

    TapApi.prototype.getObjectMap = async function () {
        let objectMap = {};
        if (this.getConnector().status) {
            let map = await this.getObjectMapWithAllDescriptions();
            objectMap.status = map.status;
            delete map.status;

            if(objectMap.status){
                objectMap.object_map = map;
                return objectMap;
            } else {
                objectMap.error = { "logs": map.error.logs};
                return objectMap;
            }
        } else {
            objectMap.status = false;
            objectMap.error = { "logs": "No active TAP connection"};
            return objectMap;
        }
    };

    /**Search and return all direct joint from the selected table to another. Only joints which goes deeper une the tree representation are returned 
     * ie table 1 is joined to the root and to table 2 and 3 then this method will only return joints to table 2 and 3.
     * joints are described following the same pattern as in the JsonAdqlBuilder specs
     * 
     * @param {String} baseTable Table from which joined table are searched 
     */
    TapApi.prototype.getJoinedTables = function (baseTable) {
        let jsonContaintJoinTable = {};
        if (this.getConnector().status) {
            
            jsonContaintJoinTable.joined_tables = this.jsonAdqlBuilder.getLowerJoints(baseTable).joints;
            jsonContaintJoinTable.status = true;
            jsonContaintJoinTable.base_table = baseTable;
            
        } else {
            jsonContaintJoinTable.status = false;
            jsonContaintJoinTable.error = {"logs":"No active TAP connection","prams":{"baseTable":baseTable}};
        }
        return jsonContaintJoinTable;
    };

    /**
     * @returns Returns all fields of root table rows returned by the ADQL query on the root table filtered by all constraints put on joined tables at any levels.
     */
    TapApi.prototype.getRootFields = async function () {
        return this.getTableFields();
    };

    /**
     * Create and return the correct adql querry to get the value of all fields of the selected root table, taking in account all user's defined constraints
     */
    TapApi.prototype.getRootFieldsQuery = async function(){
    return this.getTableFieldsQuery();
    };

    TapApi.prototype.getRootQueryIds = async function () {
        return this.getTableSelectedField();
    };

    TapApi.prototype.getRootQuery = async function () {
        return await this.getTableQuery();
    };


    /**
     * Create and return the correct adql query to get the value of the slected fields (or joining keys if none are selected) of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     * @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    TapApi.prototype.getTableQuery = async function(table,joinKeyVal){
        if(this.getConnector().status){
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }
            let allField = this.formatColNames(table,await this.getAllSelectedFields(table));
            let adql ="";

            let schema = this.tapServiceConnector.connector.service.schema;
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + table;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            adql = "SELECT TOP 10 " + allField;
            adql += '\n' + " FROM  " + correctTableNameFormat + "\n";

            adql += this.jsonAdqlBuilder.getAdqlJoints(table).adqlJoints;

            adql += this.jsonAdqlBuilder.getAdqlConstraints(table,joinKeyVal).adqlConstraints;
            return {"status": true, "query": adql} ;
        }
        return {"status":false,"error" :{ "logs": "No active TAP connection","params":{"table":table,"joinKeyVal":joinKeyVal}}};
    };

    /**
     * run the correct adql query to gather the value of the slected fields (or joining keys if none are selected) of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     * @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    TapApi.prototype.getTableSelectedField = async function(table,joinKeyVal){
        if (this.getConnector().status) {
            let query = await this.getTableQuery(table,joinKeyVal);
            if(!query.status){
                return query;
            }
            query = query.query;
            let votable = await this.tapServiceConnector.Query(query);

            let dataTable = [];

            let Field = await this.getAllSelectedFields(table);

            if (votable.status) {
                votable = votable.answer;
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
                return {"status" :false , "error":{"logs" :"Error while running query :" + query + "\n" + votable.error.logs }};
            }
            
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }
    };

    /**
     * run the correct adql query to get the value of all the fields of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     *  @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    TapApi.prototype.getTableFieldsQuery = async function(table,joinKeyVal){
        if(this.getConnector().status){
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }

            let allField = this.formatColNames(table,await this.getAllTableField(table));
            let adql ="";

            let schema = this.tapServiceConnector.connector.service.schema;
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
    };
    
    /**
     * Create and return the correct adql query to get the value of all the fields of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     *  @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    TapApi.prototype.getTableFields = async function(table,joinKeyVal){
        if (this.getConnector().status) {
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }
            let votable = await this.tapServiceConnector.Query((await this.getTableFieldsQuery(table,joinKeyVal)).query);
            let dataTable = [];
            let Field = await this.getAllTableField(table);
            if (votable.status) {

                votable = votable.answer;
                dataTable = this.tapServiceConnector.getDataTable(votable);
                let nbCols = Field.length;
                let singleArrayValue = [];
                let doubleArrayValue = [];
                if(nbCols <1 && dataTable.length > 0){
                    return {"status" : false , "error":{"logs" :"Error in columns parsing" } };
                }
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
    };

    /**
     *@param {string} table :  the name of table you want to remove the contraint associeted with
    * @return {*} {status: true|false, "error?": {}}
    **/
    TapApi.prototype.resetTableConstraint = function (table) {

        return this.jsonAdqlBuilder.removeTableConstraints(table);
    };

    /**
    * @return {*} {status: true|false, "error?": {}}
    **/
    TapApi.prototype.resetAllTableConstraint = function () {
        return this.jsonAdqlBuilder.removeAllTableConstraints();
    };

    /**
     * @param {*} table : String the name of table you want get handlerAttribut associeted with
     * @return {*} : Json the json containing all handler Attribut of the table
     * */
    TapApi.prototype.getTableAttributeHandlers = async function (table) {
        return await this.tapServiceConnector.attributsHandler.getTableAttributeHandler(table);
    };

    /**
     *@return {*} : Json the json containing all detail about every singel table join to the root table with all join table of each table and all condition of each table
    **/
    TapApi.prototype.getObjectMapWithAllDescriptions = async function () {
        return await this.tapServiceConnector.getObjectMapAndConstraints();
    };

    TapApi.prototype.getAllSelectedFields = async function (table){
        let fields = [];
        fields = fields.concat(this.jsonAdqlBuilder.getJoinKeys(table).keys);
        let handler = await this.getTableAttributeHandlers(table);
        if(handler.status){
            let KT = new KnowledgeTank();
            let AH = KT.selectAH(handler.attribute_handlers).selected;
            if(AH.length<1){ //there is no ucd set or no good field has been found 
                AH = KT.selectAHByUtypes(handler.attribute_handlers).selected;   
            }
            for(let i=0;i<AH.length;i++){
                fields.push(AH[i].column_name); 
            }
        }
        return Array.from(new Set(fields));
    };

    TapApi.prototype.getJoinKeys = function(table){
        return this.jsonAdqlBuilder.getJoinKeys(table).keys;
    };

    /**
     * this methods return a set of all columns of the table `table` if you want more information than the column name use getTableAttributeHandlers instead
     * @param {String} table  the name of table you want get all columns in it
     * @returns 
     */
    TapApi.prototype.getAllTableField = async function (table){

        let columns = [];
        let jsonField = (await this.getTableAttributeHandlers(table)).attribute_handlers;
        
        for (let i =0;i<jsonField.length;i++){
            columns.push(jsonField[i].column_name);
        }

        return Array.from(new Set(columns));

    };

    /**this is an internal helping function useless outside of the TAP Complex API
     * this function takes a list of columns name and format them as a string taking care of request length limitation, last columns are the ones trucated if necessery
     * @param {*} table the base table 
     * @param {*} columns columns of the table `table`
     * @returns 
     */
    TapApi.prototype.formatColNames = function(table,columns){
        let allField ="";
        let schema;
        schema = this.tapServiceConnector.connector.service.schema;
        
        for(let i=0;i<columns.length; i++){
            allField +=(schema+'.'+table+'.'+columns[i]).quotedTableName().qualifiedName+" , ";

            if(schema==="dbo"){
                // just for CaomMembers tables because request lenth is limited
                if(table=="CaomMembers"){
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
    };

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
        
    };

    return TapApi;
}());