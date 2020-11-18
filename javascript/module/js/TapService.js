"use strict";
var TapService = /** @class */ (function () {
    function TapService(url, schema, label, checkstatus) {
        this.url = url;
        this.schema = schema;
        this.label = label;
        this.checkstatus = checkstatus;
    }
    /***
     * Receive adql, return query objects
     * @param :receive adql statements and perform queries
     * @returns :votavle object
     */
    TapService.prototype.Query = function (adql) {
        var site = this.url;
        //alert(adql);
        var correctFormat = "votable";
        var reTable;
        if(this.url=="http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.url == "http://dc.zah.uni-heidelberg.de/tap/sync"){
            correctFormat ="votable";
        }
        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: { query: "" + adql, format: correctFormat, lang: 'ADQL', request: 'doQuery' },
            async: false
        })
            .done(function (result) {
            return result;
        });
        return reTable;
    };
    /**
     * Get the names of all the tables.
     * It's for Simbad(schema_name = 'public'), GAVO(schema_name = 'rr'), VizieR(schema_name = 'metaviz'), CAOM(schema_name = 'dbo').
     * @returns :votavle object
     */
    TapService.prototype.allTableQuery = function () {
        var site = this.url;
        var checkstatus = this.checkstatus;
        var schema_name = this.schema;
        var reTable;
        //By default, all are displayed.
        var checkvalue = 'SELECT DISTINCT T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'' + schema_name + '\' ';
        if (checkstatus == true) {
            checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'' + schema_name + '\' ';
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
     * tap_schema_quotes
     * Get the from_table, target_table, from_column, target_column
     * @returns :votavle object
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
     * @return schema.tablename
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
     * @return table name
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
     * @return : A 2-dimensional array. The array returns all the information related to the rootTable.
     */
    TapService.prototype.allLink = function () {
        var allLinkLimitObject;
        allLinkLimitObject = this.allLinkQuery();
        var reTableRe;
        var everyLink = [];
        var allLink = [[]];
        console.log(allLinkLimitObject);
        reTableRe = VOTableTools.votable2Rows(allLinkLimitObject);
        console.log(reTableRe);
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
        console.log(allLinkRe);
        var t = this.removeViewTable(allLinkRe);
        console.log(t);
        var re = JSON.parse(JSON.stringify(t));
        console.log(re);
        return re;
    };
    /**
     * Get all the table's name.
     * @return all the table's name.
     */
    TapService.prototype.allTable = function () {
        var allTableObject = this.allTableQuery(); //Get all the tables
        var allTable = [];
        allTable = VOTableTools.votable2Rows(allTableObject);
        return allTable; //Return an array contaFining the names of the tables
    };
    /**
     * return all tables with the name of the join table.
     * @return json object
     */
    TapService.prototype.createJson = function () {
        var allTtable = [];
        var jsonAll = {};
        var columns = [];
        var constraints = "";
        var alllink = [[]];
        alllink = this.allLink();
        console.log(alllink);
        allTtable = this.allTable(); //Get the array containing the names of the tables.//Even number is the table name.
        console.log(allTtable);
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
                            if (Array.isArray(arrLink[ft[0]].from) && arrLink[ft[0]].from.indexOf(ft[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].from));
                                temp1.push(ft[1]);
                            }
                            else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].from));
                            }
                            arrLinkJoint["from"] = temp1;
                            temp1 = [];
                            if (Array.isArray(arrLink[ft[0]].target) && arrLink[ft[0]].target.indexOf(tt[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].target));
                                temp1.push(tt[1]);
                            }
                            else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].target));
                            }
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
                else if (ft[0] == nowTable) {
                    loop: for (var key in arrLink) {
                        if (tt[0] == key) {
                            ifSame = 1;
                            arrLinkJoint["schema"] = this.schema;
                            arrLinkJoint["columns"] = columns;
                            arrLinkJoint["constraints"] = constraints;
                            var temp1 = [];
                            if (Array.isArray(arrLink[tt[0]].from) && arrLink[tt[0]].from.indexOf(tt[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].from));
                                temp1.push(tt[1]);
                            }
                            else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].from));
                            }
                            arrLinkJoint["from"] = temp1;
                            temp1 = [];
                            if (Array.isArray(arrLink[tt[0]].target) && arrLink[tt[0]].target.indexOf(ft[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].target));
                                temp1.push(ft[1]);
                            }
                            else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].target));
                            }
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
   * @return the json with all join table
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
    /***
     * @param data: the main json
     * @param list_exist:list of tables who are already recorded
     * @param root: the root table
     */
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
    /**
     *
     * @param adql
     * @param jsonAll json
     * @param root root table's name
     * @param listId all the key between root table and join table
     * @param listJoinAndId all the join table and it's id with root table
     */
    TapService.prototype.createMainJson = function (adql, jsonAll, root, listId, listJoinAndId) {
        var QObject = this.Query(adql);
        var joinIdDic = {};
        for (var i = 0; i < listJoinAndId.length; i = i + 2) {
            if (!json2Requete.isString(listJoinAndId[i])) {
                joinIdDic[listJoinAndId[i + 1]] = listJoinAndId[i][0];
            }
            else {
                joinIdDic[listJoinAndId[i + 1]] = listJoinAndId[i];
            }
        }
        var IdDic = {};
        for (var i = 0; i < listId.length; i++) {
            IdDic[listId[i]] = i;
        }
        var dataTable = VOTableTools.votable2Rows(QObject);
        var json = {};
        var contentTable = {};
        var contentAdql;
        var schema;
        for (var keyRoot in jsonAll) {
            if (keyRoot == root) {
                schema = jsonAll[keyRoot].schema;
                if (schema == 'public') {
                    schema = "\"" + "public" + "\"";
                }
                for (var key in jsonAll[keyRoot].join_tables) {
                    contentTable = {};
                    for (var i = 0; i < dataTable.length; i = i + listId.length) {
                        contentAdql = "";
                        contentAdql = "SELECT \nTOP 100 \n" + schema + "." + key + ".*" + "\n";
                        contentAdql += "FROM " + schema + "." + keyRoot + "\n";
                        contentAdql += "JOIN " + schema + "." + key + "\n";
                        if (!json2Requete.isString(jsonAll[keyRoot].join_tables[key].target)) {
                            contentAdql += "ON " + schema + "." + keyRoot + "." + jsonAll[keyRoot].join_tables[key].target[0];
                            contentAdql += "=" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].from[0];
                            var temp = IdDic[joinIdDic[key]];
                            if (schema.indexOf("public") != -1) {
                                contentAdql += "\nWHERE \n" + jsonAll[keyRoot].join_tables[key].target[0] + "=" + dataTable[i + temp];
                            }
                            else if (schema.indexOf("rr") != -1) {
                                contentAdql += "\nWHERE \n" + jsonAll[keyRoot].join_tables[key].target + "=" + "\'" + dataTable[i + temp] + "\'";
                            }
                            else if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") == -1) {
                                contentAdql += "\nWHERE \n" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].target + "=" + dataTable[i + temp];
                            }
                            else {
                                contentAdql += "\nWHERE \n" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].target[0] + "=" + "\'" + dataTable[i + temp] + "\'";
                            }
                            contentTable[dataTable[i + temp]] = contentAdql;
                        }
                        else {
                            contentAdql += "ON " + schema + "." + keyRoot + "." + jsonAll[keyRoot].join_tables[key].target;
                            contentAdql += "=" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].from;
                            var temp = IdDic[joinIdDic[key]];

                            if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") != -1) {
                                contentAdql += "\nWHERE \n" + jsonAll[keyRoot].join_tables[key].from + "=" + dataTable[i + temp];

                            console.log("0 "+joinIdDic[key]+" "+i + temp+" => "+dataTable[i + temp]);
                            }
                            else if (schema.indexOf("rr") != -1 && contentAdql.indexOf("ivoid=") == -1) {
                                contentAdql += "\nWHERE \n" + jsonAll[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[i + temp] + "\'";
                            
                                console.log("1 "+joinIdDic[key]+" "+i + temp+" => "+dataTable[i + temp]);
                            }
                            else if (schema.indexOf("public") != -1 && contentAdql.indexOf("oid") == -1) {
                                if (json2Requete.isString(dataTable[i + temp])) {
                                    contentAdql += "\nWHERE \n" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[i + temp] + "\'";
                                
                            console.log("2 "+joinIdDic[key]+" "+i + temp+" => "+dataTable[i + temp]);
                                }
                                else {
                                    contentAdql += "\nWHERE \n" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].from + "=" + dataTable[i + temp];
                                
                            console.log("3 "+joinIdDic[key]+" "+i + temp+" => "+dataTable[i + temp]);
                                }
                            }
                            else {
                                contentAdql += "\nWHERE \n" + schema + "." + key + "." + jsonAll[keyRoot].join_tables[key].from + "=" + "\'" + dataTable[i + temp] + "\'";
                                console.log("4 "+joinIdDic[key]+" "+i + temp+" => "+dataTable[i + temp]);
                                console.log(contentAdql);
                                
                                
                            }
                        }
                        contentTable[dataTable[i + temp]] = contentAdql;
                       break
                    }
                    contentTable["key"] = joinIdDic[key];
                    json[key] = contentTable;
                }
                break;
            }
        }
        console.log(JSON.stringify(json,undefined,2));
        return json;
    };
    /***
     * @param allLinkRe: all table
     * @return: an array containing the names of the tables
     */
    TapService.prototype.removeViewTable = function (allLinkRe) {
        var site = this.url;
        var checkstatus = this.checkstatus;
        var schema_name = this.schema;
        var reTable;
        var position = [];
        var flag = 0;
        //By default, all are displayed.
        var checkvalue = 'SELECT DISTINCT T.table_name as table_name FROM tap_schema.tables as T WHERE T.schema_name = \'' + schema_name + '\' AND T.table_type = \'view\'';
        if (checkstatus == true) {
            checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name FROM tap_schema.tables as T WHERE T.schema_name = \'' + schema_name + '\' AND T.table_type = \'view\'';
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
        var allTable = [];
        var content = reTable.responseText;
        var l = 0;
        $(content).find('RESOURCE[type="results"]').each(function () {
            $(this).find("STREAM").each(function () {
                l = $(this).context.textContent.length;
            });
        });
        if (l == 0) {
            return allLinkRe; //
        }
        else {
            allTable = VOTableTools.votable2Rows(reTable);
            var viewTable = [];
            var j = 0;
            for (var i = 0; i < allTable.length; i++) {
                if (allTable[i] != undefined && allTable[i].length != 0) {
                    viewTable[j] = allTable[i];
                    j++;
                }
            }
            for (var i = 0; i < viewTable.length; i++) {
                var a = viewTable[i];
                for (var j_1 = 0; j_1 < allLinkRe.length; j_1++) {
                    for (var h = 0; h < allLinkRe[j_1].length; h++) {
                        if (allLinkRe[j_1][h].indexOf(a) != -1) {
                            flag = 1;
                        }
                    }
                    if (flag == 1) {
                        position.push(j_1); //record the position of the "view" table
                        flag = 0;
                    }
                }
            }
            for (var i = 0; i < position.length - 1; i++) {
                for (var j_2 = 0; j_2 < position.length - 1; j_2++) {
                    if (position[j_2] < position[j_2 + 1]) {
                        var temp = position[j_2];
                        position[j_2] = position[j_2 + 1];
                        position[j_2 + 1] = temp;
                    }
                }
            }
            for (var i = 0; i < position.length; i++) {
                allLinkRe.splice(position[i], 1); //delete "view" table
            }
            return allLinkRe;
        }
    };
    return TapService;
}());
