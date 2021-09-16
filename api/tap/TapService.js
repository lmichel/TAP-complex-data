"use strict";
var TapService = /** @class */ (function () {
    function TapService(url, schema, label, checkstatus) {
        this.url = url;
        this.schema = schema;
        this.label = label;
        this.checkstatus = checkstatus;// the result
        this.allTables = undefined;
        this.tableRemoveView = undefined;
        this.rootQuery = '';

    }

    /***
     * Receive adql, return votable objects
     * @params String :receive adql statements and perform queries
     * @returns :votable object, result of adql query
     */
    TapService.prototype.Query = async function (adql) {
        var site = this.url;
        var correctFormat = "votable";
        var reTable;
        if (this.url == "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.url == "http://dc.zah.uni-heidelberg.de/tap/sync") {
            correctFormat = "votable";
        } else {
            correctFormat = "votable";
        }
        console.log("AJAXurl: " + site + " query: " + adql)

        reTable = $.ajax({
                url: "" + site,
                type: "GET",
                data: {query: "" + adql, format: correctFormat, lang: 'ADQL', request: 'doQuery'},
            }).done((result)=>result);

        return await reTable;
    };

    /**
     * Get the names of all the tables.
     * It's for Simbad(schema_name = 'public'), GAVO(schema_name = 'rr'), VizieR(schema_name = 'metaviz'), CAOM(schema_name = 'dbo') XMM(schema_name = 'EPIC').
     * @returns :votable object
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
        console.log("AJAXurl: " + site + " query: " + checkvalue)
        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: {query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery'},
            async: false
        })
            .done(function (result) {

                return result;
            });
        if(site){
            setTimeout(function(){
                //$('#overlay').addClass('display-none')
                $("#overlay").fadeOut(1000);
            },2000);
        }

        return reTable;
    };
    /**
     *  INPUT : Get the from_table, target_table, from_column, target_column
     * @returns : OUPUT : votable object
     */
    TapService.prototype.allLinkQuery = function () {
        var site = this.url;
        var checkstatus = this.checkstatus;
        var reLink;
        var checkvalue = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
        if (checkstatus == true) {
            checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
        }


        // console.log("AJAXurl: " + site + " query: " + checkvalue)

        reLink = $.ajax({
            url: "" + site,
            type: "GET",
            data: {query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery'},
            async: false
        })
            .done(function (result) {
                if(site) {
                    setTimeout(function () {
                        //$('#overlay').addClass('display-none')
                        $("#overlay").fadeOut(1000);
                    }, 2000);
                }
                return result;
            });


        return reLink;
    };

    /**
     * Input : table
     * Add the schema name and return table with schema
     * @param table
     * @return schema.tablename
     */
    TapService.prototype.getQualifiedName = function (table) {
        if (table.indexOf(this.schema) != -1) {
            return table;
        } else {
            return this.schema + "." + table;
        }
    };

    /**
     * Delete the schema name and return table name withaout schema
     * @param table
     * @return table name
     */
    TapService.prototype.getRightName = function (table) {
        if (table.indexOf(this.schema) == -1) {
            return table;
        } else {
            //return table.replace(new RegExp(this.schema + '.', 'g'), "");
            // quotedTableName return a String by overloading String class 
            return table.quotedTableName().tableName;
        }


    };

    /**
     * Varibles : tt => target_table, ft => from_table
     *            tc => target column,fc => from_column
     * INPUT : VOTABLE OBJET Return by the method this.allLinkQuery(),
     *       : Array who is the return table of method votable2Rows(votableObjet)
     *  Get 2-dimensional array. The array returns all the information related to the rootTable.
     * @return : A 2-dimensional array. The array returns all the information related to the rootTable.
     */
    TapService.prototype.allLink = function () {
        var allLinkLimitObject;
        allLinkLimitObject = this.allLinkQuery();
        var reTableRe;
        //var everyLink = [];
        var allLink = [];
        // //console.log(allLinkLimitObject);
        reTableRe = VOTableTools.votable2Rows(allLinkLimitObject);
        ////console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
        //console.log(reTableRe);
        //console.log(reTableRe.length);
        // row format : from_table target_table key_id from_column target_column
        for (var i = 0; i < reTableRe.length; i = i + 5) { // i+ 5 return another row to the first position of retable
            // //console.log("@@@@ 1 " + reTableRe)
            var tt = reTableRe[i + 1]; // i+1 => represent the column of target table in retable
            tt = this.getRightName(tt);// return the target table name  withaout schema
            var tc = reTableRe[i + 4]; //return the target_ècolumn. (reTableRe[i + 4]) represent the column of target column
            var ft = reTableRe[i];
            ft = this.getRightName(ft); // return the from table name  withaout schema
            var fc = reTableRe[i + 3];  //return the from column. (reTableRe[i + 3]) represent the column of target column

            allLink.push([tt + '|' + tc,
                ft + '|' + fc]);
        }
        if (this.tableRemoveView == undefined) {

            this.tableRemoveView = this.removeViewTable(allLink);
        }
        return this.tableRemoveView;
    };

    /**
     * Get all the table's name object and convert them to a simple array
     * @return Return an array containing the names of the tables
     */
    TapService.prototype.allTable = function () {

        if (this.allTables === undefined) {
            let allTableObject = this.allTableQuery(); //Get all the tables
            this.allTables = VOTableTools.votable2Rows(allTableObject);
        }

        return this.allTables;

    };

    /**
     * return all tables with the name of the join table.
     * @return json object contening table,and thier description
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
            var arrJoint = {};// correct json of join table 
            var flag = 0;
            var ifSame = 0;
            var nowTable = allTtable[k];

            nowTable = this.getRightName(nowTable);// containt the name of table withaout schema
            for (var i = 0; i < alllink.length; i++) {
                var arrLinkJoint = {};
                var tt = alllink[i][0].split("|"); // target table name 
                var ft = alllink[i][1].split("|");// from table name
                if (tt[0] == nowTable) {
                    loop: for (var key in arrLink) { // contaning all joinTable of root table

                        if (ft[0] == key) {
                            ifSame = 1;
                            arrLinkJoint["schema"] = this.schema;
                            arrLinkJoint["columns"] = columns;
                            arrLinkJoint["constraints"] = constraints;
                            var temp1 = [];
                            if (Array.isArray(arrLink[ft[0]].from) && arrLink[ft[0]].from.indexOf(ft[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].from));
                                temp1.push(ft[1]);
                            } else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].from));
                            }
                            arrLinkJoint["from"] = temp1;
                            temp1 = [];
                            if (Array.isArray(arrLink[ft[0]].target) && arrLink[ft[0]].target.indexOf(tt[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].target));
                                temp1.push(tt[1]);
                            } else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].target));
                            }
                            arrLinkJoint["target"] = temp1;
                            arrLink[ft[0]] = arrLinkJoint;
                            break loop;
                        } else {
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
                } else if (ft[0] == nowTable) {
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
                            } else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].from));
                            }
                            arrLinkJoint["from"] = temp1;
                            temp1 = [];
                            if (Array.isArray(arrLink[tt[0]].target) && arrLink[tt[0]].target.indexOf(ft[1]) == -1) {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].target));
                                temp1.push(ft[1]);
                            } else {
                                temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].target));
                            }
                            arrLinkJoint["target"] = temp1;
                            arrLink[tt[0]] = arrLinkJoint;
                            break loop;
                        } else {
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
            } else {
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
     * @param data :json the return json file of createJson()
     * @param root :the main table: root table
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
     * @return json
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
    TapService.prototype.createSimpleAdqlWithConstraint = function (rootTable, constraint,api) {
        let adql = ''
        let root = api.getConnector().service["table"]
        let schema;

        let allField = api.getAllSelectedRootField(rootTable);
        let putIdInTopField="";
        let objectMap = api.getObjectMap().succes.object_map
        let map = objectMap.map[root].join_tables
        schema = api.getConnector().service["schema"];
        schema = schema.quotedTableName().qualifiedName;
        if (constraint !== "" || constraint !== undefined) {
            for (var keyRoot in map) {
                if (keyRoot === rootTable) {
                    let formatTableName = schema + "." + keyRoot;
                    let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
                    allField = allField.replaceAll(correctTableNameFormat + "." + map[keyRoot].from+' , ',"")
                    putIdInTopField +=correctTableNameFormat + "." + map[keyRoot].from+' , '+allField;
                   // alert(keyRoot)
                  //  console.log("allField11111111111")
                    //console.log(putIdInTopField);
                    adql = "SELECT DISTINCT TOP 10 " +putIdInTopField//+ correctTableNameFormat + "." + map[keyRoot].from;
                    adql += '\n' + " FROM  " + correctTableNameFormat;
                    adql += '\n' + " JOIN  " + schema+'.'+api.getConnector().service["table"];
                    adql += '\n' + " ON " + schema+'.'+api.getConnector().service["table"]+"."+map[keyRoot].target +" = "+ correctTableNameFormat + "." + map[keyRoot].from;
                    adql += '\n' + " WHERE  " + schema+'.'+api.getConnector().service["table"] + "."+constraint //+ map[keyRoot].from + " = " + constraint;
                    //adql += '\n' + " OR "
                    //adql += '\n' + " WHERE  " + correctTableNameFormat + "." + map[keyRoot].from + " = " + constraint;
                    //console.log(adql);
                    return adql;
                }
                if (keyRoot !== rootTable) {
                    let formatTableName = schema + "." + keyRoot;
                    let correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
                    let putIdInTopField2 =""
                    for (let ke in map[keyRoot]) {
                        if (ke === "join_tables") {
                            for (let k in map[keyRoot][ke]) {
                                if (k === rootTable) {
                                    let allField2 = api.getAllSelectedRootField(k);
                                    allField2=allField2.replaceAll("undefined","");
                                    //console.log("allField2")
                                   // console.log(allField2)
                                    let formatTableName2 = schema + "." + k;
                                    let correctTableNameFormat2 = formatTableName2.quotedTableName().qualifiedName;
                                    allField = allField.replaceAll(correctTableNameFormat2 + "." + map[keyRoot][ke][k].from+',',"")
                                    //alert(allField.indexOf(schema+"."+"ref.year"+' , '))
                                    allField = allField.replaceAll(schema+"."+"ref.year"+' , ',"")
                                    putIdInTopField2 +=correctTableNameFormat2 + "." + map[keyRoot][ke][k].from+' , '+allField;
                                    //console.log(putIdInTopField2);
                                    adql = "SELECT DISTINCT TOP 10 "+ putIdInTopField2//+ correctTableNameFormat2 + "." + map[keyRoot][ke][k].from;
                                    adql += '\n' + " FROM  " + correctTableNameFormat2;
                                    adql += " JOIN " + correctTableNameFormat + " ON " + correctTableNameFormat + "." + map[keyRoot].join_tables[k].target
                                    adql += " = " + correctTableNameFormat2 + "." + map[keyRoot][ke][k].from
                                    adql += '\n' + " WHERE  " + correctTableNameFormat + "." +map[keyRoot].from + " = " + constraint;

                                    return adql;
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    /***
     * remouve all view table if exist.
     * @param allLinkRe : Array containing all table
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
        //console.log("AJAXurl: " + site + " query: " + checkvalue)

        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: {query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery'},
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
                l = $(this).text().length;
            });
        });
        if (l == 0) {
            return allLinkRe;
        } else {
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


