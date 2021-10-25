"use strict;";
var TapServiceConnector = (function() {
    function TapServiceConnector(_serviceUrl, _schema, _shortname){
        this.tapService = new TapService(_serviceUrl, _schema, _shortname, true);
        
        this.jsonLoad = undefined;

        this.testforConstrain = false;
        this.json = {};

        this.tabContaninBtnRemoveConstraint = [];
        this.testApiRooQuery = false;
        this.table = [];

        this.connector = {status: "", message: "", service: {}, votable: ""};
        this.attributsHandler = AttributeHolder(this);
        this.jsonCorrectTableColumnDescription = {"addAllColumn": {}};
        this.setAdqlConnectorQuery = function (correctTableNameFormat) {
            let query = "SELECT TOP 5 * FROM " + correctTableNameFormat;
            return query;
        };
    }

    /**
     * Get all the table's name and description returned as a double array
     */
    TapServiceConnector.prototype.getAllTables = async function () {
        try {
            let schema  = this.connector.service.schema;
            let request = 'SELECT DISTINCT tap_schema.tables.table_name as'+
                ' table_name, tap_schema.tables.description FROM tap_schema.tables WHERE tap_schema.tables.schema_name = \'' + schema + '\' ';

            let query =await this.Query(request);

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

    TapServiceConnector.prototype.getAllJoins = async function(){
        try {
            let schema  = this.connector.service.schema;
            let request = 'SELECT tap_schema.keys.from_table, tap_schema.keys.target_table,tap_schema.keys.key_id'+
                ' , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys'+
                ' JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
                
            let query =await this.Query(request);
            
            if(query.status){
                let joins = [];
                let join;
                for (let i=0;i<query.field_values.length;i++){
                    join={};
                    join.from = {table:unqualifyName(query.field_values[i][0],schema),column:query.field_values[i][3]};
                    join.target = {table:unqualifyName(query.field_values[i][1],schema),column:query.field_values[i][4]};
                    joins.push(join);
                }
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

    TapServiceConnector.prototype.buildRawJoinMap = function(allJoins){
        
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

            partialDup = map[allJoins[i].from.table][allJoins[i].target.table].filter(val => val.from == allJoins[i].from.column);

            if(partialDup.length>0){
                fullDup = partialDup.filter(val => val.target == allJoins[i].target.column);
                if (fullDup.length<partialDup.length){
                    console.warn("suspicious joins found between tables " + allJoins[i].from.table + "and" + allJoins[i].target.table);
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

    TapServiceConnector.prototype.buildJoinTreeMap = function (rawJoinMap,root,listExist){
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

    TapServiceConnector.prototype.buildObjectMap = async function() {
        let allTables = await this.getAllTables();
        if(allTables.status){
            let allJoins = await this.getAllJoins();
            if(allJoins.status){
                allTables = allTables.all_tables;
                allJoins = allJoins.all_joins;
                let raw = this.buildRawJoinMap(allJoins);
                let treeMap = this.buildJoinTreeMap(raw);

                let map = {
                    "root_table": {
                        "name": this.connector.service.table,
                        "schema": this.connector.service.schema,
                        "columns":[]
                    }, 
                    "tables": {},
                    "map": treeMap
                };

                for (let i=0;i<allTables.length;i++){
                    if(allTables[i][0] == this.connector.service.table){
                        map.root_table.description = allTables[i][1];
                    } else {
                        map.tables[allTables[i][0]]= {description:allTables[i][1],columns:[]};
                    }
                }
                this.objectMap = map;
                return {status:true,object_map:map};

            } else{
                return {"status":false,"error":{
                    "logs":allJoins.error.logs
                }};
            }
        }  else {
            return {"status":false,"error":{
                "logs":allJoins.error.logs
            }};
        }
    };

    TapServiceConnector.prototype.getObjectMap = function(){
        if(this.objectMap === undefined){
            return {status:false,error:{logs:"Object map isn't build run buildObjectMap before trying to use this method"}};
        }else{
            return {status:true,object_map:$.extend(true,{},this.objectMap)};
        }
    };

    /**
    * return the full json created by the method createJson()
    */
    TapServiceConnector.prototype.loadJson = async function () {
        if(this.jsonLoad === undefined){
            this.jsonLoad = await this.tapService.createJson();
            if(this.jsonLoad.status){
                this.jsonLoad = this.jsonLoad.json;
            }else{
                let val = this.jsonLoad;
                this.jsonLoad = undefined;
                return val;
            }
        }
        return {"status":true,"json": this.jsonLoad};
    };

    /**Apply custom post processing on the object map in order to fix various issues like wrong columns name declared in joints
     * this method is meant to hold quick fixes ensuring the api still work while waiting for the orignal issue to be fixed
     * meaning no permanent code should be written here
     */
    TapServiceConnector.prototype.postProcessObjectMap = function(){
        // no post process required right now.
    };

    TapServiceConnector.prototype.Query = async function(adql){
        return await this.tapService.Query(adql);
    };

    return TapServiceConnector;
}());