"use strict";
var TapService = /** @class */ (function () {
    function TapService(url, schema, label, checkstatus) {
        this.url = url;
        this.schema = schema;
        this.label = label;
        this.checkstatus = checkstatus;
    }
    TapService.prototype.Query = function (adql) {
        var site = this.url;
        var reTable;
        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: { query: "" + adql, format: 'votable', lang: 'ADQL', request: 'doQuery' },
            async: false
        })
            .done(function (result) {
            return result;
        });
        console.log(reTable);
        return reTable;
    };
    /**
     * Get the names of all the tables.
     * It's for Simbad(schema_name = 'public'), GAVO(schema_name = 'rr'), VizieR(schema_name = 'metaviz'), CAOM(schema_name = 'dbo').
     * @param site : website as as tring
     * @param checkstatus : true(TOP 100), false(all)
     */
    TapService.prototype.allTableQuery = function () {
        var site = this.url;
        var checkstatus = this.checkstatus;
        var schema_name = this.schema;
        var reTable;
        //By default, all are displayed.
        var checkvalue = 'SELECT DISTINCT T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'' + schema_name + '\'';
        if (checkstatus == true) {
            checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'' + schema_name + '\'';
        }
        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: { query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery' },
            async: false
        })
            .done(function (result) {
            return result;
        });
        return reTable;
    };
    /**
     * Get the from_table, target_table, from_column, target_column
     * @param site : website as as tring
     * @param checkstatus : true(TOP 100), false(all)
     */
    TapService.prototype.allLinkQuery = function () {
        var site = this.url;
        var checkstatus = this.checkstatus;
        var reLink;
        var checkvalue = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
        if (checkstatus == true) {
            checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
        }
        reLink = $.ajax({
            url: "" + site,
            type: "GET",
            data: { query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery' },
            async: false
        })
            .done(function (result) {
            return result;
        });
        return reLink;
    };
    /**
     * Add the schema name
     * @param table
     */
    TapService.prototype.getQualifiedName = function (table) {
        if (table.indexOf(this.schema) != -1) {
            return table;
        }
        else {
            return this.schema + "." + table;
        }
    };
    /**
     * Delete the schema name
     * @param table
     */
    TapService.prototype.getRightName = function (table) {
        if (table.indexOf(this.schema) == -1) {
            return table;
        }
        else {
            return table.replace(new RegExp(this.schema + '.', 'g'), "");
        }
    };
    /**
     * Get 2-dimensional array. The array returns all the information related to the rootTable.
     * RETURN: A 2-dimensional array. The array returns all the information related to the rootTable.
     */
    TapService.prototype.allLink = function () {
        var allLinkLimitObject;
        allLinkLimitObject = this.allLinkQuery();
        var reTableRe;
        var everyLink = [];
        var allLink = [[]];
        reTableRe = VOTableTools.votable2Rows(allLinkLimitObject);
        for (var i = 0; i < reTableRe.length; i = i + 5) {
            var tt = reTableRe[i + 1];
            tt = this.getRightName(tt);
            var tc = reTableRe[i + 4];
            var ft = reTableRe[i];
            ft = this.getRightName(ft);
            var fc = reTableRe[i + 3];
            var k_1 = 0;
            everyLink[k_1] = tt + '|' + tc;
            k_1 = 1;
            everyLink[k_1] = ft + '|' + fc;
            allLink.push(everyLink);
            everyLink = [];
        }
        var allLinkRe = [[]];
        var k = 0;
        for (var h = 1; h < allLink.length; h++) {
            allLinkRe[k] = allLink[h];
            k = k + 1;
        }
        return allLinkRe;
    };
    /**
     * Get all the table's name.
     * @return all the table's name.
     */
    TapService.prototype.allTable = function () {
        var allTableObject = this.allTableQuery(); //Get all the tables
        var allTable = [];
        allTable = VOTableTools.votable2Rows(allTableObject);
        return allTable; //Return an array containing the names of the tables
    };
    /**
     * return all tables with the name of the join table.
     * @param site
     * @param checkstatus
     * @return json object
     */
    TapService.prototype.createJson = function () {
        var allTtable = [];
        var jsonAll = {};
        var columns = [];
        var constraints = "";
        var alllink = [[]];
        alllink = this.allLink();
        allTtable = this.allTable(); //Get the array containing the names of the tables.//Even number is the table name.
        for (var k = 0; k < allTtable.length; k = k + 2) {
            var arrLink = {};
            var arrJoint = {};
            var flag = 0;
            var ifSame = 0;
            var nowTable = allTtable[k];
            nowTable = this.getRightName(nowTable);
            for (var i = 0; i < alllink.length; i++) {
                var arrLinkJoint = {};
                var tt = alllink[i][0].split("|");
                var ft = alllink[i][1].split("|");
                if (tt[0] == nowTable) {
                    loop: for (var key in arrLink) {
                        if (ft[0] == key) {
                            ifSame = 1;
                            arrLinkJoint["schema"] = this.schema;
                            arrLinkJoint["columns"] = columns;
                            arrLinkJoint["constraints"] = constraints;
                            var temp1 = [];
                            temp1.push(arrLink[ft[0]].from);
                            temp1.push(ft[1]);
                            arrLinkJoint["from"] = temp1;
                            temp1 = [];
                            temp1.push(arrLink[ft[0]].target);
                            temp1.push(tt[1]);
                            arrLinkJoint["target"] = temp1;
                            arrLink[ft[0]] = arrLinkJoint;
                            break loop;
                        }
                        else {
                            ifSame = 0;
                        }
                    }
                    if (ifSame == 0) {
                        flag = flag + 1;
                        arrLinkJoint["schema"] = this.schema;
                        arrLinkJoint["columns"] = columns;
                        arrLinkJoint["constraints"] = constraints;
                        arrLinkJoint["from"] = ft[1];
                        arrLinkJoint["target"] = tt[1];
                        arrLink[ft[0]] = arrLinkJoint;
                    }
                }
                ;
                if (ft[0] == nowTable) {
                    loop: for (var key in arrLink) {
                        if (tt[0] == key) {
                            ifSame = 1;
                            arrLinkJoint["schema"] = this.schema;
                            arrLinkJoint["columns"] = columns;
                            arrLinkJoint["constraints"] = constraints;
                            var temp1 = [];
                            temp1.push(arrLink[tt[0]].from);
                            temp1.push(tt[1]);
                            arrLinkJoint["from"] = temp1;
                            temp1 = [];
                            temp1.push(arrLink[tt[0]].target);
                            temp1.push(ft[1]);
                            arrLinkJoint["target"] = temp1;
                            arrLink[tt[0]] = arrLinkJoint;
                            break loop;
                        }
                        else {
                            ifSame = 0;
                        }
                    }
                    ;
                    if (ifSame == 0) {
                        flag = flag + 1;
                        arrLinkJoint["schema"] = this.schema;
                        arrLinkJoint["columns"] = columns;
                        arrLinkJoint["constraints"] = constraints;
                        arrLinkJoint["from"] = tt[1];
                        arrLinkJoint["target"] = ft[1];
                        arrLink[tt[0]] = arrLinkJoint;
                    }
                }
            }
            if (flag == 0) {
                continue;
            }
            else {
                arrJoint["schema"] = this.schema;
                arrJoint["description"] = allTtable[k + 1];
                arrJoint["join_tables"] = arrLink;
                jsonAll[nowTable] = arrJoint;
            }
        }
        return jsonAll;
    };
    /**
   * In order to create the json with all join table
   * @param data :json
   * @param root :the main table
   */
    TapService.prototype.createNewJson = function (data, root) {
        var reJson = {};
        for (var key in data) {
            var list_exist = [];
            list_exist.push(key);
            var joinJson = {};
            if (root == key) {
                joinJson["schema"] = data[key].schema;
                joinJson["description"] = data[key].description;
                joinJson["columns"] = [];
                joinJson["constraints"] = "";
                var joinJsonJoin = {};
                for (var join in data[key].join_tables) {
                    var joinJsonJoin1 = {};
                    list_exist.push(join);
                    joinJsonJoin1["schema"] = data[join].schema;
                    joinJsonJoin1["description"] = data[join].description;
                    joinJsonJoin1["columns"] = data[key].join_tables[join].columns;
                    joinJsonJoin1["constraints"] = data[key].join_tables[join].constraints;
                    joinJsonJoin1["from"] = data[key].join_tables[join].from;
                    joinJsonJoin1["target"] = data[key].join_tables[join].target;
                    var a = this.ifJoin(data, list_exist, join);
                    if (JSON.stringify(a) != '{}') {
                        joinJsonJoin1["join_tables"] = a;
                    }
                    joinJsonJoin[join] = joinJsonJoin1;
                    joinJson["join_tables"] = joinJsonJoin;
                }
                reJson[key] = joinJson;
                break;
            }
        }
        return reJson;
    };
    TapService.prototype.ifJoin = function (data, list_exist, root) {
        var joinJsonJoin = {};
        for (var key in data) {
            if (key == root) {
                for (var join in data[key].join_tables) {
                    if (list_exist.indexOf(join) == -1) {
                        list_exist.push(join);
                        var joinJsonJoin1 = {};
                        joinJsonJoin1["schema"] = data[join].schema;
                        joinJsonJoin1["description"] = data[join].description;
                        joinJsonJoin1["columns"] = data[key].join_tables[join].columns;
                        joinJsonJoin1["constraints"] = data[key].join_tables[join].constraints;
                        joinJsonJoin1["from"] = data[key].join_tables[join].from;
                        joinJsonJoin1["target"] = data[key].join_tables[join].target;
                        var a = this.ifJoin(data, list_exist, join);
                        if (JSON.stringify(a) != '{}') {
                            joinJsonJoin1["join_tables"] = a;
                        }
                        joinJsonJoin[join] = joinJsonJoin1;
                    }
                }
                break;
            }
        }
        return joinJsonJoin;
    };
    return TapService;
}());
