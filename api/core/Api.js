"use strict;";

(()=>{
    jw.Api = function() {
        this.tapServiceConnector = undefined;
        this.jsonAdqlBuilder = undefined;
        this.connectLevel = 0;
        this.limit = 10;
        this.capabilities = {};
    };

    /** Internal function do not use.
     * @param params (Json) with parameters (tapService,schema,table,shortName)
     * @param schema (String) Schema containing the complex object
     * @param table (String) Root table of the complex object
     * @param shortName (String) The Shortname of database
     * 
     */
    jw.Api.prototype.initConnetor =function (tapService, schema, table, shortName,initJson){
        initJson.status = 'OK';
        initJson.service.tapService = tapService;
        initJson.service.schema = schema;
        initJson.service.table = table;
        initJson.service.shortName= shortName;
        initJson.message = "Active TAP : " + shortName;
    };

    jw.Api.prototype.connectService = async function(tapService, shortName){
        if (shortName === undefined){
            shortName = "Unknown Tap";
        }
        if(tapService === undefined){
            return {"status":false,"error":{
                "logs":"Can't initialize Tap service : Missing required Argument",
                "params":{"tapService":tapService, "shortName":shortName}
            }};
        }
        if(!tapService.endsWith("sync") && !tapService.endsWith("sync/")){
            if(tapService.endsWith("/")){
                tapService += "sync";
            }else {
                tapService += "/sync";
            }
        }
        this.tapServiceConnector = new jw.core.ServiceConnector(tapService, shortName,this);
        let test = await this.tapServiceConnector.testService();
        if(test.status){
            this.connectLevel = 1;
            await this.testService();
        }else {
            this.connectLevel = 0;
            test.error.params = {"tapService":tapService,"shortName":shortName};
        }
        return test;
    };

    jw.Api.prototype.selectSchema = async function(schema){
        if(this.connectLevel>0){
            schema = schema.quotedTableName().qualifiedName.toString();
            if(schema == this.tapServiceConnector.getConnector().service.schema){
                return {status:true};
            }
            if(Object.keys(this.tapServiceConnector.getConnector().service.schemas).includes(schema)){
                let test = await this.tapServiceConnector.selectSchema(schema);
                if (test.status){
                    this.connectLevel = 2;
                } else {
                    this.connectLevel = 1;
                }
                return test;
            } else {
                return {"status":false,"error":{
                    "logs":"Unknown schema",
                    "params":{"schema":schema}
                }};
            }
        } else {
            return {"status":false,"error":{
                "logs":"Can't connect to selected schema : connect to a service first",
                "params":{"schema":schema}
            }};
        }
    };

    jw.Api.prototype.setRootTable = async function(table){
        if(this.connectLevel>1){

            if(Object.keys(this.tapServiceConnector.getTables()).includes(table)){
                let test = await this.tapServiceConnector.selectRootTable(table);
                if(test.status){
                    this.connectLevel = 3;
                    this.jsonAdqlBuilder = new jw.core.JsonAdqlBuilder(
                        this.tapServiceConnector.getObjectMap().object_map,table,
                        this.getConnector().connector.service.schema,
                        this.capabilities.quotes || this.capabilities["quotes-bis"]);
                } else {
                    this.connectLevel = 2;
                }

                return test;
            } else {
                return {"status":false,"error":{
                    "logs":"Unknown table",
                    "params":{"table":table}
                }};
            }
            
        }else {
            return {"status":false,"error":{
                "logs":"Can't set the root table : select a schema first",
                "params":{"table":table}
            }};
        }
    };

    jw.Api.prototype.disconnect = function () {
        this.connectLevel = 0;
        delete this.tapServiceConnector;
        delete this.jsonAdqlBuilder;
        return {"status":true};
    };

    jw.Api.prototype.getConnector = function () {
        if(this.tapServiceConnector === undefined || this.tapServiceConnector.getConnector()===undefined){
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }else {
            return {"status" : true , "connector":this.tapServiceConnector.getConnector()};
        }

    };

    jw.Api.prototype.getObjectMap = function () {
        let objectMap = {};
        if (this.connectLevel==3) {
            let map = this.tapServiceConnector.getObjectMap();
            objectMap.status = map.status;

            if(objectMap.status){
                objectMap.object_map = map.object_map;
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

    /**Search and return all direct joint from the selected table to another. Only joints which goes deeper in the tree representation are returned 
     * ie table 1 is joined to the root and to table 2 and 3 then this method will only return joints to table 2 and 3.
     * joints are described following the same pattern as in the JsonAdqlBuilder specs
     * 
     * @param {String} baseTable Table from which joined table are searched 
     */
    jw.Api.prototype.getJoinedTables = function (baseTable,degree) {
        let jsonContaintJoinTable = {};
        if (this.connectLevel==3) {
            
            jsonContaintJoinTable.joined_tables = this.jsonAdqlBuilder.getLowerJoints(baseTable,degree).joints;
            jsonContaintJoinTable.status = true;
            jsonContaintJoinTable.base_table = baseTable;
            
        } else {
            jsonContaintJoinTable.status = false;
            jsonContaintJoinTable.error = {"logs":"No active TAP connection","prams":{"baseTable":baseTable}};
        }
        return jsonContaintJoinTable;
    };

    jw.Api.prototype.getActiveJoints = function(table){
        if (this.connectLevel==3) {
            return this.jsonAdqlBuilder.getActiveJoints(table);
        } else {
            return {"logs":"No active TAP connection","prams":{"table":table}};
        }
    };

    /**
     * DEPRACTED use `getTableFields`
     */
    jw.Api.prototype.getRootFields = async function () {
        return this.getTableFields();
    };

    /**
     * DEPRACTED use `getTableFieldsQuery`
     */
    jw.Api.prototype.getRootFieldsQuery = async function(){
        return this.getTableFieldsQuery();
    };

    /**
     * DEPRACTED use `getTableSelectedField`
     */
    jw.Api.prototype.getRootQueryIds = async function () {
        return this.getTableSelectedField();
    };

    /**
     * DEPRACTED use `getTableQuery`
     */
    jw.Api.prototype.getRootQuery = async function () {
        return await this.getTableQuery();
    };

    jw.Api.prototype.query = async function(query){
        if(this.connectLevel>0){
            return this.tapServiceConnector.query(query);
        } else {
            return {"status":false,"error" :{ "logs": "No active TAP connection","params":{"query":query}}};
        }
    };

    /**
     * Create and return the correct adql query to get the value of the slected fields (or joining keys if none are selected) of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     * @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    jw.Api.prototype.getTableQuery = async function(table,joinKeyVal,upperTable){
        if(this.connectLevel==3){
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }
            let allField = this.formatColNames(table,(await this.getSelectedFields(table)).fields);
            if(allField.status){
                allField = allField.allField;
            }else{
                allField.error.params.joinKeyVal = joinKeyVal;
                delete allField.error.params.columns;
                return allField;
            }
            let adql ="";

            let schema = this.tapServiceConnector.connector.service.schema;
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = jw.Api.safeQualifier([schema ,table]).qualified;
            if(!(this.getCapabilitie("quotes").capabilitie || this.getCapabilitie("quotes-bis").capabilitie) ){
                formatTableName = formatTableName.replace(/"/g,"");
            }

            adql = "SELECT " + ((this.limit>0)?"TOP " + this.limit + " ":"") + allField;
            adql += '\n' + " FROM  " + formatTableName + "\n";

            adql += this.jsonAdqlBuilder.getAdqlJoints(table).adqlJoints;

            adql += this.jsonAdqlBuilder.getAdqlConstraints(table,joinKeyVal,upperTable).adqlConstraints;
            return {"status": true, "query": adql} ;
        }
        return {"status":false,"error" :{ "logs": "No active TAP connection","params":{"table":table,"joinKeyVal":joinKeyVal}}};
    };

    /**
     * run the correct adql query to gather the value of the slected fields (or joining keys if none are selected) of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     * @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    jw.Api.prototype.getTableSelectedField = async function(table,joinKeyVal,upperTable){
        if (this.connectLevel==3) {
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            let query = await this.getTableQuery(table,joinKeyVal,upperTable);
            if(!query.status){
                return query;
            }
            query = query.query;
            let data = await this.query(query);

            if (data.status) {
                return data;
            } else {
                return {"status" :false , "error":{"logs" :"Error while running query :" + query + "\n" + data.error.logs }};
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
    jw.Api.prototype.getTableFieldsQuery = async function(table,joinKeyVal,upperTable){
        if(this.connectLevel==3){
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }

            let allField = this.formatColNames(table,(await this.getAllTableFields(table)).fields);
            if(allField.status){
                allField = allField.allField;
            }else{
                allField.error.params.joinKeyVal = joinKeyVal;
                delete allField.error.params.columns;
                return allField;
            }
            let adql ="";

            let schema = this.tapServiceConnector.connector.service.schema;
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = jw.Api.safeQualifier([schema ,table]).qualified;
            if(!(this.getCapabilitie("quotes").capabilitie || this.getCapabilitie("quotes-bis").capabilitie) ){
                formatTableName = formatTableName.replace(/"/g,"");
            }
            
            adql = "SELECT " + ((this.limit>0)?"TOP " + this.limit + " ":"") + allField;
            adql += '\n' + " FROM  " + formatTableName + "\n";

            adql += this.jsonAdqlBuilder.getAdqlJoints(table).adqlJoints;

            adql += this.jsonAdqlBuilder.getAdqlConstraints(table,joinKeyVal,upperTable).adqlConstraints;
            return {"status": true, "query": adql} ;
        }
        return {"status":false,"error" :{ "logs": "No active TAP connection"}};
    };
    
    /**
     * Create and return the correct adql query to get the value of all the fields of the selected table any constraint put on sub tables are added to the query
     * @param {String} table Optional unqualified name of the node table or the root table if unspecified
     *  @param {String} joinKeyVal Optional, specific value of the key used to join table to his parentNode. This value is used to create an additional constraint and will make the call fail if specified when the table is the root table.
     */
    jw.Api.prototype.getTableFields = async function(table,joinKeyVal,upperTable){
        if (this.connectLevel==3) {
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }

            let query = await this.getTableFieldsQuery(table,joinKeyVal,upperTable);
            if(!query.status){
                return query;
            }

            query = query.query;

            let data = await this.query(query);
            if (data.status) {

                return data;
            } else {
                return {"status" :false , "error":{"logs" :data.error.logs,params:{table:table,joinKeyVal:joinKeyVal} }};
            }
            
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection" } };
        }
    };

    /**
     *@param {string} table :  the name of table you want to remove the contraint associeted with
    * @return {*} {status: true|false, "error?": {}}
    **/
    jw.Api.prototype.resetTableConstraint = function (table) {
        if(this.connectLevel==3){
            return this.jsonAdqlBuilder.removeTableConstraints(table);
        }else {
            return {"status" : false , "error":{"logs" :"No active TAP connection"} };
        }
    };

    /**
    * @return {*} {status: true|false, "error?": {}}
    **/
    jw.Api.prototype.resetAllTableConstraint = function () {
        if(this.connectLevel==3){
            return this.jsonAdqlBuilder.removeAllTableConstraints();
        }else {
            return {"status" : false , "error":{"logs" :"No active TAP connection"} };
        }
    };

    /**
     * @param {*} table : String the name of table you want get handlerAttribut associeted with
     * @return {*} : Json the json containing all handler Attribut of the table as an array stored in the `attribute_handlers` field
     * */
    jw.Api.prototype.getTableAttributeHandlers = function (table,schema) {
        
        if(this.connectLevel>1){
            let connector = this.getConnector();
            if(schema === undefined){
                schema = connector.connector.service.schema ;
            }
            return this.tapServiceConnector.attributsHandler.getTableAttributeHandler(table, schema);
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"table":table}} };
        }
    };

    /**Bulk methods to get a lot of AH, this method is more efficient than using a for loop with `getTableAttributeHandlers`.
     * @param {*} table : String the name of table you want get handlerAttribut associeted with
     * @return {*} : Json the json containing all handler Attribut of the table as a map stored in the `attribute_handlers` field 
     * the map uses the full names as keys the field `name_map` constains a map fromp short names to full names.
     * */
    jw.Api.prototype.getTablesAttributeHandlers = function (tables) {
        if(this.connectLevel>1){
            let connector = this.getConnector();
            return this.tapServiceConnector.attributsHandler.getTablesAttributeHandlers(tables, connector.connector.service.schema);
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"tables":tables}} };
        }
    };


    /**add the wanted fields to the selection of fields to query data from
     * apply verification on both the table name and the field name and will return an errored status if one of them is no correct
     * unless checkNames is set to false in this case the method is synchronous and no check is done on fieldName, no error are returned if table is unknown
     * note that other types of errors can still be returned
     */
    jw.Api.prototype.selectField = function(fieldName,table,checkNames){
        if(this.connectLevel<3){
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"table":table,"fieldName":fieldName}} };
        }
        if(checkNames === undefined){
            checkNames = true;
        }
        if(table === undefined ){
            if(checkNames){
                return {"status" : false , "error":{"logs" :"no table selected", "params":{"table":table,"fieldName":fieldName}} };
            }
            return {"status":true};
        }
        if(fieldName === undefined){
            if(checkNames){
                return {"status" : false , "error":{"logs" :"no field selected", "params":{"table":table,"fieldName":fieldName}} };
            }
            return {"status":true};
        }
        let obj = this.tapServiceConnector.objectMap;
        let has_field = async function(table,fieldName,api){
            let handler = await api.getTableAttributeHandlers(table);
            if(handler.status){
                handler= handler.attribute_handlers;
                handler = handler.filter((val)=>val.nameattr === fieldName);
                return handler.length>0;
            }
            return false;
        };
        /*this parts handle async code in a way that keep the method sync if checkNames is set to false
        * async methods just wrap the whole function in a promise thus you can use .then to handle them
        * in addition the .then method of a promise return another promise allowing us to return the result of 
        * the .then method
        * this way of handling async adds a little overhead due to the user who may await the function while the function not returning a promise
        * another source of overhead may comme from the fact that most of the methods work in the main loop
        */
        if(obj.tables[table] !== undefined ){
            if(checkNames){
                return has_field(table,fieldName,this).then((val)=>{
                    if(val){
                        if(!obj.tables[table].columns.includes(fieldName))
                            obj.tables[table].columns.push(fieldName);
                        return {"status":true};
                    } else {
                        return {"status" : false , "error":{"logs" :"The table " + table + " has no field named " + fieldName, "params":{"table":table,"fieldName":fieldName}} };
                    }
                });
                
            } else{
                if(!obj.tables[table].columns.includes(fieldName))
                    obj.tables[table].columns.push(fieldName);
                return {"status":true};
            }
        }

        if(checkNames){
            return {"status" : false , "error":{"logs" :"Unkown table" + table, "params":{"table":table,"fieldName":fieldName}} };
        }
        return {"status":true};
};

    /**add the wanted fields to the selection of fields to query data from
     * handle non existing fields and table
     */
    jw.Api.prototype.unselectField = function(fieldName,table){
        if(this.connectLevel<3){
            return {"status" : false , "error":{"logs" :"No active TAP connection"} };
        }
        if(table === undefined){
            return {"status" : false , "error":{"logs" :"no table selected", "params":{"table":table,"fieldName":fieldName}} };
        }
        if(fieldName === undefined){
            return {"status" : false , "error":{"logs" :"no field selected", "params":{"table":table,"fieldName":fieldName}} };
        }
        let obj = this.tapServiceConnector.objectMap;
        if(obj.tables[table] !== undefined ){
            obj.tables[table].columns.remove(fieldName);
        }
        return {"status":true};
    };

    jw.Api.prototype.unselectAllFields = function(table){
        if(this.connectLevel<3){
            return {"status" : false , "error":{"logs" :"No active TAP connection"} };
        }
        let obj = this.tapServiceConnector.objectMap;
        if(obj.tables[table] !== undefined ){
            obj.tables[table].columns=[];
        }
        return {"status":true};
    };

    /**
     * this methods return a set of selected columns either selected via the `selectField` method or via a custom selection algorithm if none are selected
     * @param {*} table the name of table you want get all selected columns of it
     * @returns {*} {"status": true|false,"error?":{},"fields?":[]}
     */
    jw.Api.prototype.getSelectedFields = async function (table){
        if(this.connectLevel <3){
            return {"status":false,"error":{"logs":"No Tap service conneted","params":{"table":table}}};
        }
        let obj = this.tapServiceConnector.objectMap;
        if(obj.tables[table] !== undefined){
            if(obj.tables[table].columns.length>0){
                return {"status":true ,"fields":obj.tables[table].columns};
            }
        }
        let fields = [];
        fields = fields.concat(this.jsonAdqlBuilder.getJoinKeys(table).keys);
        let handler = await this.getTableAttributeHandlers(table);
        if(handler.status){
            let AH = jw.KnowledgeTank.selectAH(handler.attribute_handlers).selected;
            if(AH.length<1){ //there is no ucd set or no good field has been found 
                AH = jw.KnowledgeTank.selectAHByUtypes(handler.attribute_handlers).selected;   
            }
            if(AH.length<1){//there is no Utypes set or no good field has been found 
                let m = Math.min(3,handler.attribute_handlers.length);
                for (let i=0;i<m;i++){
                    AH.push(handler.attribute_handlers[i]);
                }
            }
            for(let i=0;i<AH.length;i++){
                fields.push(AH[i].column_name); 
            }
        }
        fields = Array.from(new Set(fields));
        if(obj.tables[table] !== undefined){
            obj.tables[table].columns= fields;
        }
        return {"status":true ,"fields":fields};
    };

    /**
     * 
     * @param {*} table the table name of the table which you want all fields that are use in joins
     * @returns {*} {"status": true|false,"error?":{},"keys?":[]}
     */
    jw.Api.prototype.getJoinKeys = function(table){
        if(this.connectLevel==3){
            return this.jsonAdqlBuilder.getJoinKeys(table);
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"table":table}} };
        }
        
    };

    /**
     * this methods return a set of all columns of the table `table` if you want more information than the column name use getTableAttributeHandlers instead
     * @param {String} table  the name of table you want get all columns in it
     * @returns {*} {"status": true|false,"error?":{},"fields?":[]}
     */
    jw.Api.prototype.getAllTableFields = async function (table){
        if(this.connectLevel>1){
            let columns = [];
            let jsonField = (await this.getTableAttributeHandlers(table)).attribute_handlers;
            
            for (let i =0;i<jsonField.length;i++){
                columns.push(jsonField[i].column_name);
            }

            return {"status":true,"fields":Array.from(new Set(columns))};
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"table":table}} };
        }
    };

    /**this is an internal helping function useless outside of the TAP Complex API
     * this function takes a list of columns name and format them as a string taking care of request length limitation, last columns are the ones trucated if necessery
     * @param {*} table the base table 
     * @param {*} columns columns of the table `table`
     * @returns {string}
     */
    jw.Api.prototype.formatColNames = function(table,columns){
        if(columns.length < 1){
            return {status:false, error:{params:{table:table,columns:columns},logs:"No columns provided for " + table}};
        }
        let allField ="";
        let schema;
        schema = this.getConnector().connector.service.schema;
        
        for(let i=0;i<columns.length; i++){
            allField += jw.Api.safeQualifier([schema,table,columns[i]]).qualified +" , ";

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
        if(!(this.getCapabilitie("quotes").capabilitie || this.getCapabilitie("quotes-bis").capabilitie) ){
            allField = allField.replace(/\"([A-Za-z_\-0-9]*)\"\./g,"$1.");
            allField = allField.replace(/\.\"([A-Za-z_\-0-9]*)\"/g,".$1");
        }
        

        return {status:true, allField:allField};
    };

    /**
     * 
     * @param {string} table the table name on which the constraint is set
     * @param {string} constraint an ADQL constraint (to be put after a WHERE: no aggregation)
     * @returns {*} {"status": true|false,"error?":{}}
     */
    jw.Api.prototype.setTableConstraint = function(table, constraint){
        if (this.connectLevel==3) {

            constraint = constraint.trim();
            return this.jsonAdqlBuilder.setTableConstraint(table, constraint);

        }

        return {"status":false, "error":{"logs": "No active TAP connection","params":{"table":table,"constraint":constraint}}};
        
    };

    /**
     * 
     * @param {*} table the table name of which you want to get the constraint
     * @returns {*} {"status": true|false,"error?":{},"constraint?":string}
     */
    jw.Api.prototype.getTableConstraint = function(table){
        if (this.connectLevel==3) {

            return this.jsonAdqlBuilder.getTableConstraint(table);
        }

        return {"status":false, "error":{"logs": "No active TAP connection","params":{"table":table}}};
    };

    /**return all known constraints in the form of a map where the table names are the keys and the values are the related constraints as a string.
     * 
     * @returns {*} {"status": true|false,"error?":{},"constraints?":{table:constraint}}
     */
    jw.Api.prototype.getAllTablesConstraints = function(){
        if (this.connectLevel==3) {

            return this.jsonAdqlBuilder.getAllTablesConstraints();
        }

        return {"status":false, "error":{"logs": "No active TAP connection"}};

    };

    /**
     * 
     * @param {number} limit number of line to request set to 0 or undefined to disable the limit
     * @returns {*} {"status": true}
     */
    jw.Api.prototype.setLimit = function(limit){
        if(limit !== undefined && !isNaN(parseInt(limit)) && limit>0){
            this.limit = parseInt(limit);
        }else {
            this.limit = 0;
        }
        return {"status":true};
    };

    jw.Api.prototype.getSchemas = function(){
        if(this.connectLevel>0){
            let co = this.tapServiceConnector.getConnector();
            if(co.status){
                return {"status":true,"schemas": co.service.schemas};
            }else {
                return {"status":false,"error": co.error};
            }
        }
        return {"status":false,"error": {"logs":"No active TAP connection"}};
    };

    jw.Api.prototype.getTables = function(){
        if(this.connectLevel>1){
            return { "status":true,"tables":this.tapServiceConnector.getTables()};
        }
        return {"status":false,"error": {"logs":"No active TAP connection"}};
    };

    jw.Api.prototype.testService = async function(){
        if(this.connectLevel>0){
            let query;
            for (let capa in jw.Api.tests){
                query = await this.query(jw.Api.tests[capa]);
                this.capabilities[capa] = query.status;
            }
            return {status:true};
        }
        return {"status":false,"error": {"logs":"No active TAP connection"}};
    };

    jw.Api.prototype.getCapabilitie = function(key){
        return {"status":true,"capabilitie": this.capabilities[key]};
    };

    jw.Api.prototype.setCapabilitie = function(key,val){
        if(jw.Api.tests[key] === undefined){
            this.capabilities[key] = val;
            return {"status":true};
        }
        return {"status":false,error:{logs:"You can't override defaults capabilities",params:{key:key,val:val}}};
    };

    /**This function take a list of string and then join them with `.` ensuring each componnent is quoted if necessery
     * this method is designed to ease qualifying table names and column names
     * 
     * @param {[String]} list 
     * @returns 
     */
    jw.Api.safeQualifier = function(list){
        return jw.core.JsonAdqlBuilder.safeQualifier(list);
    };

    jw.Api.tests = {
        "joins":"SELECT TOP 1 tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id",
        "multi-joins":"SELECT TOP 1 tap_schema.key_columns.target_column  FROM tap_schema.tables JOIN tap_schema.keys ON  tap_schema.keys.from_table = tap_schema.tables.table_name JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id",
        "quotes":"SELECT TOP 1 * FROM \"tap_schema\".keys",
        "quotes-bis":"SELECT TOP 1 * FROM \"TAP_SCHEMA\".keys"
    };

})();