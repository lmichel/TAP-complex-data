"use strict;";

(function() {
    jw.core.ServiceConnector = function(_serviceUrl, _shortname,api){
        this.tapService = new jw.core.ServiceRequest(_serviceUrl);

        this.api = api;
        this.tables = {};
        this.joins = undefined;

        this.connector = {status: false, service: {"shortName":_shortname,"tapService":_serviceUrl}};

        this.attributsHandler =jw.core.AttributeHolder(this);
    };

    jw.core.ServiceConnector.prototype.testService = async function (){
        let result = await this.query("SELECT tap_schema.schemas.schema_name, tap_schema.schemas.description from tap_schema.schemas");
        if(result){
            this.connector.service.schemas = {};
            for (let i =0;i<result.field_values.length;i++){
                this.connector.service.schemas[result.field_values[i][0].quotedTableName().qualifiedName] = {
                    description : result.field_values[i][1]
                };
            }
            this.connector.status =true;
            return {"status":true};
        }else{
            return {"status":false,"error":{
                "logs":result.error.logs
            }};
        }
    };

    jw.core.ServiceConnector.prototype.selectSchema = async function(schema,cache=true){
        this.connector.service.schema = schema;
        this.joins = undefined;
        if(this.connector.service.schemas[schema].tables !== undefined){
            this.tables = this.connector.service.schemas[schema].tables;
            for (let table in this.tables){
                this.tables[table].columns=[];
            }
            if(!cache){
                this.connector.service.schemas[schema].tables= undefined;
                delete this.connector.service.schemas[schema].tables;
            }
            return {"status":true};
        }
        let allTables = await this.getAllTables();
        this.tables = {};
        if (allTables.status ){
            allTables = allTables.all_tables;
            for (let i=0;i<allTables.length;i++){
                this.tables[allTables[i][0]]= {description:allTables[i][1],columns:[],type:allTables[i][2]};
            }
            if(cache){
                this.connector.service.schemas[schema].tables = this.tables;
            }
            return {"status":true};
        }else{
            delete this.connector.service.schema;
            return {"status":false,"error":{
                "logs":allTables.error.logs,
                "params":{"schema":schema}
            }};
        }
    };

    jw.core.ServiceConnector.prototype.getTables = function(){
        return this.tables;
    };

    jw.core.ServiceConnector.prototype.selectRootTable = async function(table){
        this.connector.service.table = table;
        let map = await this.buildObjectMap();
        if(map.status){
            return {"status":true};
        }else {
            return {"status":false,"error":{
                "logs":map.error.logs,
                "params":{"table":table}
            }};
        }
    };

    jw.core.ServiceConnector.prototype.getConnector = function (){
        return this.connector;
    };

    /**
     * Get all the table's name and description returned as a double array
     */
    jw.core.ServiceConnector.prototype.getAllTables = async function () {
        try {
            let schema  = this.connector.service.schema;
            let request = 'SELECT DISTINCT tap_schema.tables.table_name as'+
                ' table_name, tap_schema.tables.description, tap_schema.tables.table_type  FROM tap_schema.tables WHERE tap_schema.tables.schema_name = \'' + 
                schema + '\' OR  tap_schema.tables.schema_name = \'' +  replaceAll(schema,'"',"") + '\'';

            let query =await this.query(request);

            for(let i=0;i<query.field_values.length;i++){
                query.field_values[i][0] = unqualifyName(query.field_values[i][0],schema);
            }

            return {"status":true,"all_tables":query.field_values};

        }catch(error){
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString()
            }};
        }
    };

    jw.core.ServiceConnector.prototype.getAllJoins = async function(){
        try {
            let schema  = this.connector.service.schema;
            let request = 'SELECT tap_schema.keys.from_table, tap_schema.keys.target_table,tap_schema.keys.key_id' +
                ' , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column \nFROM tap_schema.keys\n' +
                ' JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id\n' +
                'JOIN tap_schema.tables ON  tap_schema.keys.from_table = tap_schema.tables.table_name\n' +
                'WHERE  tap_schema.tables.schema_name = \'' + schema + '\' OR  tap_schema.tables.schema_name = \'' + 
                replaceAll(schema,'"',"") + '\'';
                
            let query =await this.query(request);
            
            if(query.status){
                let joins = [];
                let join;
                for (let i=0;i<query.field_values.length;i++){
                    join={};
                    join.from = {table:unqualifyName(query.field_values[i][0],schema),column:query.field_values[i][3]};
                    join.target = {table:unqualifyName(query.field_values[i][1],schema),column:query.field_values[i][4]};
                    joins.push(join);
                }
                // very few tap schema describes themself so we need to import extra data about it to browse it correctly
                if(schema.toLowerCase() == "tap_schema"){
                    joins = joins.concat(jw.KnowledgeTank.tapSchemaJoins);
                }
                this.joins = joins;
                return {"status":true,"all_joins":joins};
            }else{
                return {"status":false,"error":{
                    "logs":query.error.logs
                }};
            }
        }catch(error){
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString()
            }};
        }
    };

    jw.core.ServiceConnector.prototype.buildRawJoinMap = function(allJoins){
        
        /** map = {
         *      "T1":{
         *          T2 : [
         *              {from : "c1", target:"c2"}, ...
         *          ], 
         *          ...
         *      },
         *      T2:{
         *          T1 : [
         *              {from:"c2",target;"c1"},...
         *          ],
         *          ...
         *      }, 
         *      ...
         *  }
         * 
         */

        let map = {},partialDup,fullDup;
        //map building
        for(let i=0;i<allJoins.length;i++){

            if(map[allJoins[i].from.table] === undefined){
                map[allJoins[i].from.table] = {};
            }
            if(map[allJoins[i].target.table] === undefined){
                map[allJoins[i].target.table] = {};
            }

            if(map[allJoins[i].from.table][allJoins[i].target.table] === undefined){
                map[allJoins[i].from.table][allJoins[i].target.table] = [];
            }
            if(map[allJoins[i].target.table][allJoins[i].from.table] === undefined){
                map[allJoins[i].target.table][allJoins[i].from.table] = [];
            }
            
            /**Duplicated joins detection
             * in the same time we check for suspicious joins ie 
             * joins such that other joins use the same columns from one table but different columns from the second while both uses the same tables
             */

            partialDup = map[allJoins[i].from.table][allJoins[i].target.table].filter(val => val.target == allJoins[i].target.column);

            if(partialDup.length>0){
                fullDup = partialDup.filter(val => val.from == allJoins[i].from.column);
                if (fullDup.length<partialDup.length){
                    console.warn("suspicious joins found between tables " + allJoins[i].from.table + " and " + allJoins[i].target.table);
                }
                if(fullDup.length>0){
                    continue;
                }
            }

            map[allJoins[i].from.table][allJoins[i].target.table].push({from:allJoins[i].from.column,target:allJoins[i].target.column});
            map[allJoins[i].target.table][allJoins[i].from.table].push({from:allJoins[i].target.column,target:allJoins[i].from.column});

        }

        return map;

    };

    jw.core.ServiceConnector.prototype.buildJoinTreeMap = function (rawJoinMap,root,listExist){
        if(root === undefined){
            root = this.connector.service.table;
        }
        if(listExist === undefined){
            listExist = [];
        }
        listExist.push(root);
        let treeMap = {};
        treeMap[root] = {join_tables:{}};
        for(let table in rawJoinMap[root]){
            if(!listExist.includes(table)){
                treeMap[root].join_tables[table] = this.buildJoinTreeMap(rawJoinMap,table,Array.from(listExist))[table];
                treeMap[root].join_tables[table].joins = rawJoinMap[root][table];
            }
        }

        if(Object.keys(treeMap[root].join_tables).length<1){
            delete treeMap[root].join_tables;
        }

        return treeMap;
    };

    jw.core.ServiceConnector.prototype.buildObjectMap = async function() {
        let allJoins;
        if( this.joins === undefined){
            allJoins = await this.getAllJoins();
            if(allJoins.status){
                allJoins = allJoins.all_joins;
            }else{
                return {"status":false,"error":{
                    "logs":allJoins.error.logs
                }};
            }
        }else {
            allJoins = this.joins;
        }
        
        let raw = this.buildRawJoinMap(allJoins);
        let treeMap = this.buildJoinTreeMap(raw);

        let map = {
            "tables": this.tables, // setup in selectSchema
            "map": treeMap
        };
        this.objectMap = map;
        return {status:true,object_map:map};
    };

    jw.core.ServiceConnector.prototype.getObjectMap = function(){
        if(this.objectMap === undefined){
            return {status:false,error:{logs:"Object map isn't build run buildObjectMap before trying to use this method"}};
        }else{
            return {status:true,object_map:$.extend(true,{},this.objectMap)};
        }
    };

    /**Apply custom post processing on the object map in order to fix various issues like wrong columns name declared in joints
     * this method is meant to hold quick fixes ensuring the api still work while waiting for the orignal issue to be fixed
     * meaning no permanent code should be written here
     */
    jw.core.ServiceConnector.prototype.postProcessObjectMap = function(){
        // no post process required right now.
    };

    jw.core.ServiceConnector.prototype.query = async function(adql){
        return await this.tapService.query(adql);
    };
}());