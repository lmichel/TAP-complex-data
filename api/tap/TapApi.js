"use strict;";

var TapApi = (function(){

    function TapApi() {
        this.tapServiceConnector = "";
        this.votableQueryResult = undefined;
        this.dataTable1 = undefined;
        this.jsonAdqlBuilder = undefined;
        this.limit = 10;
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

                let obj = await this.tapServiceConnector.buildObjectMap();

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
            console.error(error);
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

    TapApi.prototype.getObjectMap = function () {
        let objectMap = {};
        if (this.getConnector().status) {
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

    TapApi.prototype.getActiveJoints = function(table){
        if (this.getConnector().status) {
            return this.jsonAdqlBuilder.getActiveJoints(table);
        } else {
            return {"logs":"No active TAP connection","prams":{"table":table}};
        }
    };

    /**
     * DEPRACTED use `getTableFields`
     */
    TapApi.prototype.getRootFields = async function () {
        return this.getTableFields();
    };

    /**
     * DEPRACTED use `getTableFieldsQuery`
     */
    TapApi.prototype.getRootFieldsQuery = async function(){
    return this.getTableFieldsQuery();
    };

    /**
     * DEPRACTED use `getTableSelectedField`
     */
    TapApi.prototype.getRootQueryIds = async function () {
        return this.getTableSelectedField();
    };

    /**
     * DEPRACTED use `getTableQuery`
     */
    TapApi.prototype.getRootQuery = async function () {
        return await this.getTableQuery();
    };

    TapApi.prototype.query = async function(query){
        if(this.getConnector().status){
            return this.tapServiceConnector.Query(query);
        } else {
            return {"status":false,"error" :{ "logs": "No active TAP connection","params":{"query":query}}};
        }
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
            let allField = this.formatColNames(table,(await this.getSelectedFields(table)).fields);
            let adql ="";

            let schema = this.tapServiceConnector.connector.service.schema;
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + table;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            adql = "SELECT " + ((this.limit>0)?"TOP " + this.limit + " ":"") + allField;
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
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            let query = await this.getTableQuery(table,joinKeyVal);
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
    TapApi.prototype.getTableFieldsQuery = async function(table,joinKeyVal){
        if(this.getConnector().status){
            if(table === undefined){
                table = this.getConnector().connector.service.table;
            }
            if(table === this.getConnector().connector.service.table && joinKeyVal !== undefined){
                return {"status":false,"error" :{ "logs": "Automatic constraint addition on root table is not allowed","params":{"table":table,"joinKeyVal":joinKeyVal}}};
            }

            let allField = this.formatColNames(table,(await this.getAllTableFields(table)).fields);
            let adql ="";

            let schema = this.tapServiceConnector.connector.service.schema;
            schema = schema.quotedTableName().qualifiedName;

            let formatTableName = schema + "." + table;
            let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;

            adql = "SELECT " + ((this.limit>0)?"TOP " + this.limit:"") + allField;
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

            let data = await this.query((await this.getTableFieldsQuery(table,joinKeyVal)).query);
            if (data.status) {

                return data;
            } else {
                return {"status" :false , "error":{"logs" :data.error.logs }};
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
     * @return {*} : Json the json containing all handler Attribut of the table as an array stored in the `attribute_handlers` field
     * */
    TapApi.prototype.getTableAttributeHandlers = async function (table) {
        let connector = this.getConnector();
        if(connector.status){
            return await this.tapServiceConnector.attributsHandler.getTableAttributeHandler(table, connector.connector.service.schema);
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"table":table}} };
        }
    };

    /**Bulk methods to get a lot of AH, this method is more efficient than using a for loop with `getTableAttributeHandlers`.
     * @param {*} table : String the name of table you want get handlerAttribut associeted with
     * @return {*} : Json the json containing all handler Attribut of the table as a map stored in the `attribute_handlers` field 
     * the map uses the full names as keys the field `name_map` constains a map fromp short names to full names.
     * */
    TapApi.prototype.getTablesAttributeHandlers = async function (tables) {
        let connector = this.getConnector();
        if(connector.status){
            return await this.tapServiceConnector.attributsHandler.getTablesAttributeHandlers(tables, connector.connector.service.schema);
        } else {
            return {"status" : false , "error":{"logs" :"No active TAP connection", "params":{"tables":tables}} };
        }
    };


    /**add the wanted fields to the selection of fields to query data from
     * apply verification on both the table name and the field name and will return an errored status if one of them is no correct
     * unless checkNames is set to false in this case the method is synchronous and no check is done on fieldName, no error are returned if table is unknown
     * note that other types of errors can still be returned
     */
    TapApi.prototype.selectField = async function(fieldName,table,checkNames){
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
        let obj = this.getObjectMap();
        let has_field = async function(table,fieldName,api){
            let handler = await api.getTableAttributeHandlers(table);
            if(handler.status){
                handler= handler.attribute_handlers;
                handler = handler.filter((val)=>val.nameattr === fieldName);
                return handler.length>0;
            }
            return false;
        };
        if(obj.status){
            obj = obj.object_map;
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
                
            } else if(table === obj.root_table.name){
                if(checkNames){
                    return has_field(table,fieldName,this).then((val)=>{
                        if(val){
                            if(!obj.root_table.columns.includes(fieldName))
                                obj.root_table.columns.push(fieldName);
                            return {"status":true};
                        }
                        return {"status" : false , "error":{"logs" :"The table " + table + " has no field named " + fieldName, "params":{"table":table,"fieldName":fieldName}} };
                    });
                }else {
                    if(!obj.root_table.columns.includes(fieldName))
                        obj.root_table.columns.push(fieldName);
                    return {"status":true};
                }
            }

            if(checkNames){
                return {"status" : false , "error":{"logs" :"Unkown table" + table, "params":{"table":table,"fieldName":fieldName}} };
            }
            return {"status":true};
            
        }
        return {"status" : false , "error":{"logs" :"Unable to gather object map :\n" + obj.error.logs, "params":{"table":table,"fieldName":fieldName}} };
    };

    /**add the wanted fields to the selection of fields to query data from
     * handle non existing fields and table
     */
    TapApi.prototype.unselectField = function(fieldName,table){
        if(table === undefined){
            return {"status" : false , "error":{"logs" :"no table selected", "params":{"table":table,"fieldName":fieldName}} };
        }
        if(fieldName === undefined){
            return {"status" : false , "error":{"logs" :"no field selected", "params":{"table":table,"fieldName":fieldName}} };
        }
        let obj = this.getObjectMap();
        if(obj.status){
            obj = obj.object_map;
            if(obj.tables[table] !== undefined ){
                obj.tables[table].columns.remove(fieldName);
            } else if(table === obj.root_table.name){
                obj.root_table.columns.remove(fieldName);
            }
            return {"status":true};
        }
        return {"status" : false , "error":{"logs" :"Unable to gather object map :\n" + obj.error.logs, "params":{"table":table,"fieldName":fieldName}} };
    };

    TapApi.prototype.unselectAllFields = function(table){
        let obj = this.getObjectMap();
        if(obj.status){
            obj = obj.object_map;
            if(obj.tables[table] !== undefined ){
                obj.tables[table].columns=[];
            } else if(table === obj.root_table.name){
                obj.root_table.columns=[];
            }
            return {"status":true};
        }
        return {"status" : false , "error":{"logs" :"Unable to gather object map :\n" + obj.error.logs, "params":{"table":table,"fieldName":fieldName}} };
    };

    /**
     * this methods return a set of selected columns either selected via the `selectField` method or via a custom selection algorithm if none are selected
     * @param {*} table the name of table you want get all selected columns of it
     * @returns {*} {"status": true|false,"error?":{},"fields?":[]}
     */
    TapApi.prototype.getSelectedFields = async function (table){
        let obj = this.getObjectMap();
        if(obj.status){
            obj = obj.object_map;
            if(obj.tables[table] !== undefined){
                if(obj.tables[table].columns.length>0){
                    return obj.tables[table].columns;
                }
            } else if (table === obj.root_table.name){
                if(obj.root_table.columns.length>0){
                    return obj.root_table.columns;
                }
            }
        }
        let fields = [];
        fields = fields.concat(this.jsonAdqlBuilder.getJoinKeys(table).keys);
        let handler = await this.getTableAttributeHandlers(table);
        if(handler.status){
            let AH = KnowledgeTank.selectAH(handler.attribute_handlers).selected;
            if(AH.length<1){ //there is no ucd set or no good field has been found 
                AH = KnowledgeTank.selectAHByUtypes(handler.attribute_handlers).selected;   
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
        if(obj.status){
            if(obj.tables[table] !== undefined){
                obj.tables[table].columns= fields;
            }
        }
        return {"status":true ,"fields":fields};
    };

    /**
     * 
     * @param {*} table the table name of the table which you want all fields that are use in joins
     * @returns {*} {"status": true|false,"error?":{},"keys?":[]}
     */
    TapApi.prototype.getJoinKeys = function(table){
        return this.jsonAdqlBuilder.getJoinKeys(table);
    };

    /**
     * this methods return a set of all columns of the table `table` if you want more information than the column name use getTableAttributeHandlers instead
     * @param {String} table  the name of table you want get all columns in it
     * @returns {*} {"status": true|false,"error?":{},"fields?":[]}
     */
    TapApi.prototype.getAllTableFields = async function (table){
        if(this.getConnector().status){
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

    /**
     * 
     * @param {*} table the table name of which you want to get the constraint
     * @returns {*} {"status": true|false,"error?":{},"constraint?":string}
     */
    TapApi.prototype.getTableConstraint = function(table){
        if (this.getConnector().status) {

            return this.jsonAdqlBuilder.getTableConstraint(table);
        }

        return {"status":false, "error":{"logs": "No active TAP connection","params":{"table":table}}};
    };

    /**return all known constraints in the form of a map where the table names are the keys and the values are the related constraints as a string.
     * 
     * @returns {*} {"status": true|false,"error?":{},"constraints?":{table:constraint}}
     */
    TapApi.prototype.getAllTablesConstraints = function(){
        if (this.getConnector().status) {

            return this.jsonAdqlBuilder.getAllTablesConstraints();
        }

        return {"status":false, "error":{"logs": "No active TAP connection"}};

    };

    /**
     * 
     * @param {number} limit number of line to request set to 0 or undefined to disable the limit
     * @returns {*} {"status": true}
     */
    TapApi.prototype.setLimit = function(limit){
        if(limit !== undefined && !isNaN(parseInt(limit)) && limit>0){
            this.limit = parseInt(limit);
        }else {
            this.limit = 0;
        }
        return {"status":true};
    };

    return TapApi;
}());