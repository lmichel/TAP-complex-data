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

        this.objectMapWithAllDescription = undefined;
        this.connector = {status: "", message: "", service: {}, votable: ""};
        this.api ="";
        this.attributsHandler = new HandlerAttributs();
        this.jsonCorrectTableColumnDescription = {"addAllColumn": {}};
        this.setAdqlConnectorQuery = function (correctTableNameFormat) {
            let query = "SELECT TOP 5 * FROM " + correctTableNameFormat;
            return query;
        };
    }

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

    /**
    *
    * @param {*} root  represent the root table
    * @param {*} json represent the main json create by the method createMainJson
    * @returns return the list of id of join table
    */
    TapServiceConnector.prototype.joinAndId = function (root, json) {
        try {
            var list = [];
            for (var key in json) {
                if (key == root) {
                    for (var join in json[key].join_tables) {
                        list.push(json[key].join_tables[join].target);
                        list.push(join);
                    }
                }
            }
            return {"status":true,"joinedTables":list};
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString(),
                "params":{"root":root,"json":json}
            }};
        }
       
    };

    TapServiceConnector.prototype.getDataTable=function (votableQueryResult){
        return  VOTableTools.votable2Rows(votableQueryResult);
    };
    
    TapServiceConnector.prototype.getObjectMapAndConstraints = async function () {
        try {
            if( this.objectMapWithAllDescription === undefined){
                this.objectMapWithAllDescription = {"root_table": {"name": "root_table_name", "schema": "schema", "columns":[]}, "tables": {}, "map": {"handler_attributs": {}}};
            
                let api = this.api;
                let rootTable = api.getConnector().connector.service.table;
                let jsonWithaoutDescription = await this.loadJson();
                if(jsonWithaoutDescription.status){
                    jsonWithaoutDescription = jsonWithaoutDescription.json;
                } else {
                    return {"status":false,"error":{
                        "logs": "Error while loading base data : \n" + jsonWithaoutDescription.error.logs,
                    }};
                }
                this.objectMapWithAllDescription.root_table.name = rootTable;
                this.schema = api.getConnector().connector.service.schema;
                this.objectMapWithAllDescription.root_table.schema = this.schema;
                this.objectMapWithAllDescription.root_table.columns =  api.tapServiceConnector.objectMapWithAllDescription.map.handler_attributs;
                let formatJoinTable = "";
                let correctJoinFormaTable = "";
                
                let testMap = false;
                let map = {};
                if (testMap == false) {
                    map = this.getObjectMapAndConstraint(jsonWithaoutDescription, rootTable);
                }

                let allJoinRootTable = this.createAllJoinTable(map);
                let allTables = allJoinRootTable;
                for (let k = 0; k < allTables.length; k++) {
                    for (let tableKey in jsonWithaoutDescription) {
                        if (tableKey == allTables[k] || this.schema + "." + tableKey == allTables[k]) {

                            formatJoinTable = this.schema + "." + tableKey;
                            correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName;
                            let attributHanler = this.json[tableKey]!==undefined?this.json[tableKey].attribute_handlers:"";

                            this.objectMapWithAllDescription.tables[tableKey] = {
                                "description": jsonWithaoutDescription[tableKey].description,
                                "columns": attributHanler !== undefined ? attributHanler : [],
                            };

                        } 
                    }

                }
                this.objectMapWithAllDescription.map = map;
                this.objectMapWithAllDescription.status = true;
                this.postProcessObjectMap();
            }
            return this.objectMapWithAllDescription;
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString(),
            }};
        }
    };

    /**Apply custom post processing on the object map in order to fix various issues like wrong columns name declared in joints
     * this method is meant to hold quick fixes ensuring the api still work while waiting for the orignal issue to be fixed
     * meaning no permanent code should be written here
     */
    TapServiceConnector.prototype.postProcessObjectMap = function(){
        // no post process required right now.
    };

    /**
     * In order to create the json with all join table
     * @param data :json the return json file of createJson()
     * @param root :the main table: root table
     * @return the json with all join table
     */
    TapServiceConnector.prototype.getObjectMapAndConstraint = function (data, root) {
        var reJson = {};
        for (var key in data) {
            var list_exist = [];
            list_exist.push(key);
            var joinJson = {};
            if (root == key) {
                var joinJsonJoin = {};
                for (var join in data[key].join_tables) {
                    var joinJsonJoin1 = {};
                    list_exist.push(join);
                    joinJsonJoin1.from = data[key].join_tables[join].from;
                    joinJsonJoin1.target = data[key].join_tables[join].target;
                    var a = this.verifiedJoin(data, list_exist, join);
                    if (JSON.stringify(a) != '{}') {
                        joinJsonJoin1.join_tables = a;
                    }
                    joinJsonJoin[join] = joinJsonJoin1;
                    joinJson.join_tables = joinJsonJoin;
                }
                reJson[key] = joinJson;
                break;
            }
        }
        return reJson;
    };

    /***
     * @param data: the main json
     * @param list_exist:list of tables who are already recorded
     * @param root: the root table
     */
    TapServiceConnector.prototype.verifiedJoin = function (data, list_exist, root) {
        var joinJsonJoin = {};
        for (var key in data) {
            if (key == root) {
                for (var join in data[key].join_tables) {
                    if (list_exist.indexOf(join) == -1) {
                        list_exist.push(join);
                        var joinJsonJoin1 = {};
                        joinJsonJoin1.from = data[key].join_tables[join].from;
                        joinJsonJoin1.target = data[key].join_tables[join].target;
                        var a = this.verifiedJoin(data, list_exist, join);
                        if (JSON.stringify(a) != '{}') {
                            joinJsonJoin1.join_tables = a;
                        }
                        joinJsonJoin[join] = joinJsonJoin1;
                    }
                }
                break;
            }
        }
        return joinJsonJoin;
    };

    TapServiceConnector.prototype.Query = async function(adql){
        return await this.tapService.Query(adql);
    };

    TapServiceConnector.prototype.createAllJoinTable = function (map){
        let table = [];
        Object.keys(map).forEach(function (k) {
            let json = map[k];
            Object.keys(json.join_tables).forEach(function (k2) {
                table.push(k2);
                let json2 = json.join_tables[k2];
                if (json2.join_tables !== undefined) {
                    for (let f in json2.join_tables) {
                        table.push(f);
                        for (let c in json2.join_tables[f]) {
                            let json3 = json2.join_tables[f].join_tables;
                            if (json3 !== undefined) {
                                for (let c1 in json3) {
                                    table.push(c1);
                                }
                            }
                        }
                    }
                }

            });
            table= Array.from(new Set(table));
        });
        return table;
    };

    return TapServiceConnector;
}());