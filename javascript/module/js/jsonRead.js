"use strict";
var jsonRead = /** @class */ (function () {
    function jsonRead(json) {
        this.json = json;
    }
    /**
    * This function reads the json object and get the most used table's name.
    * @return : an array containing table's name.
    */
    jsonRead.prototype.mostUsed = function () {
        var data = this.json;
        var mostUsedDic = {};
        var rootTable = this.rootTable();
        var mostUsedTable = []; //the higher the front, the larger the number of jointable.
        for (var i = 0; i < rootTable.length; i++) {
            var count = 0;
            for (var key in data[rootTable[i]].join_tables) {
                count += 1;
            }
            mostUsedDic[rootTable[i]] = count;
        }
        if (mostUsedDic[rootTable[0]] < mostUsedDic[rootTable[1]]) {
            mostUsedTable[0] = rootTable[1];
            mostUsedTable[1] = rootTable[0];
        }
        else {
            mostUsedTable[0] = rootTable[0];
            mostUsedTable[1] = rootTable[1];
        }
        for (var h = 2; h < rootTable.length; h++) {
            mostUsedTable[h] = rootTable[h];
            for (var j = h - 1; j >= 0; j--) {
                var tempi = mostUsedDic[mostUsedTable[j + 1]];
                var tempj = mostUsedDic[mostUsedTable[j]];
                if (tempj >= tempi) {
                    break;
                }
                else {
                    var temp = mostUsedTable[j + 1];
                    mostUsedTable[j + 1] = mostUsedTable[j];
                    mostUsedTable[j] = temp;
                }
            }
        }
        return mostUsedTable;
    };
    /**
    * This function reads the json object and gets all the table names
    * @return all the root table's name.
    */
    jsonRead.prototype.rootTable = function () {
        var jsonAll = this.json;
        var rootTable = [];
        for (var key in jsonAll) {
            rootTable.push(key);
        }
        return rootTable;
    };
    /**
     * Returns the join_table element of table "table"
     * @param table the main table.
     * @return all the join table's name.
     */
    jsonRead.prototype.joinTable = function (table) {
        var jsonAll = this.json;
        var joinTable = [];
        //console.log(JSON.stringify(jsonAll,undefined,2));
        //alert(jsonAll[table]);
        if(jsonAll[table]==undefined){
            this.json={}
            jsonAll=this.json;
            
            joinTable.push(table);
            //alert(JSON.stringify(joinTable,undefined,2))
        }else{
            // alert(table+ " has join table")
            for (var key in jsonAll[table].join_tables) {
                //alert(key)
                 if (key.indexOf("2") != -1) {
                     continue; //same rootTable and join_table, I made the second name of the repeat followed by a number 2//@TODO 
                 }
                 else {
                     joinTable.push(key);
                 }
             }
        }

      
        return joinTable;
    };
    /**
     * This is a recursive function. In order to get all the join table of table "table"
     * @param table the main(root) table
     * @param list_exist store the recorded table name
     * @param flag record the number of recursions and format the output.
     * @return a string containing the html code
     */
    jsonRead.prototype.json2HtmlJoin = function (table, list_exist, flag) {
        var jsonAll = this.json;
        var htmlbuffer = "";
        var joinTable = [];
        var flag2;
        flag2 = flag + 1;
        var niveau = flag2 + 2;
        var space1 = [];
        var space = "    ";
        for (var i = 0; i <= flag2; i++) {
            space1.push(space);
        }
        space = space1.join('');
        if (jsonAll[table] == undefined) {
        }
        else {
            for (var key in jsonAll[table].join_tables) {
                if (list_exist.indexOf(key) == -1) {
                    joinTable.push(space + "<B>" + key + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(key) + "</font>" + "<br/>");
                    joinTable.push(space + "<button type=\"button\" id = " + "\"b" + niveau + key + "\" name = \"Cbutton\" class=\"btn btn-primary\" >Aide</button>" + "<input id=\"" + niveau + key + "\" type=\"text\" name = \"Cinput\" style = \"width: 500px\" placeholder=\"constrains \">" + "<br/>");
                    list_exist.push(key);
                    var table_1 = void 0;
                    var tableCut = void 0;
                    table_1 = this.json2HtmlJoin(key, list_exist, flag2);
                    tableCut = table_1.replace(/ /g, "");
                    if (tableCut.length != 0) {
                        joinTable.push(table_1);
                    }
                }
            }
        }
        htmlbuffer = joinTable.join('');
        return htmlbuffer;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * The same logic of TapService.ts-"createNewJson()"
     * @param table the main(table) table
     * @return a string containing the html code
     */
    jsonRead.prototype.json2Html = function (table) {
        var jsonAll = this.json;
        var joinTable = [];
        var htmlbuffer = "";
        var list_exist = [];
        list_exist.push(table);
        joinTable.push("<B>" + table + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(table) + "</font>" + "<br/>");
        joinTable.push("<button type=\"button\" id = " + "\"b1" + table + "\" name = \"Cbutton\" class=\"btn btn-primary\">Aide</button>" + "<input id=" + "\"1" + table + "\" type=\"text\" name = \"Cinput\" style = \"width: 500px\" placeholder=\"constrains\">" + "<br/>");
        for (var key in jsonAll[table].join_tables) {
            joinTable.push("    " + "<B>" + key + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(key) + "</font>" + "<br/>");
            joinTable.push("    " + "<button type=\"button\" id = " + "\"b2" + key + "\" name = \"Cbutton\" class=\"btn btn-primary\">Aide</button>" + "<input id=\"2" + key + "\" type=\"text\" name = \"Cinput\" style = \"width: 500px\" placeholder=\"constrains\">" + "<br/>");
            if (list_exist.indexOf(key) == -1) {
                list_exist.push(key);
                joinTable.push(this.json2HtmlJoin(key, list_exist, 0));
            }
        }
        htmlbuffer = joinTable.join('');
        return htmlbuffer;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * @param table  the main(table) table
     * @return the table table's description
     */
    jsonRead.prototype.getDescription = function (table) {
        var jsonAll = this.json;
        var description;
        if (jsonAll[table] == undefined) {
            return "No description";
        }
        else {
            description = jsonAll[table].description;
            return description;
        }
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * @return a string containing the html code
     */
    jsonRead.prototype.showAll = function () {
        var rootTable = this.rootTable();
       // console.log(rootTable);
        var joinTable = [];
        var output = "";
        for (var i = 0; i < rootTable.length; i++) {
            joinTable = this.joinTable(rootTable[i]);
            output += "<B>" + rootTable[i] + "</B>" + " : " + "<font color = \"#545454\">" + this.getDescription(rootTable[i]) + "</font>" + "<br/>";
            for (var j = 0; j < joinTable.length; j++) {
                output += "    " + "<B>" + joinTable[j] + "</B>" + " : " + "<font color = \"#545454\">" + this.getDescription(joinTable[j]) + "</font>" + "<br/>";
            }
            output += "<br/>";
        }
        return output;
    };
    /**
     * Generate json with contraints
     * @param list : Recorded all table names from the table to the child table
     * @param constraints :the constraint
     * @param column: the columns to select
     * @param flag: control the number of recursions
     * @param jsonJoin: the json of join table
     * @return :json with contraints,column(key)
     */
    jsonRead.prototype.CreateJsonAndContraint = function (list, constraints, column, flag, jsonJoin) {
        var jsonAll = {};
        var json = {};
        var list_rest = JSON.parse(JSON.stringify(list));
        var key = list[0];
        var schema = jsonJoin[key].schema;
        var flagC = 0, flagColumn = 0;
        if (schema == "public") {
            schema = "\"" + "public" + "\"";
        }
        if (0 == list.length - 1 && flag == 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = jsonJoin[key].description;
            var temp = [];
            for (var i = 0; i < column.length; i = i + 2) {
                if (column[i] == key) {
                    flagColumn = 1;
                    temp.push(column[i + 1]);
                }
            }
            jsonAll["columns"] = temp;
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagColumn == 0) {
                jsonAll["columns"] = [];
            }
            ;
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            json[key] = jsonAll;
            flagC = 0;
            flagColumn = 0;
        }
        else if (0 != list.length - 1 && flag == 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = jsonJoin[key].description;
            var temp = [];
            for (var i = 0; i < column.length; i = i + 2) {
                if (column[i] == key) {
                    flagColumn = 1;
                    temp.push(column[i + 1]);
                }
            }
            jsonAll["columns"] = temp;
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagColumn == 0) {
                jsonAll["columns"] = [];
            }
            ;
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            list_rest.shift();
            flag = flag + 1;
            jsonAll["join_tables"] = this.CreateJsonAndContraint(list_rest, constraints, column, flag, this.json[key].join_tables);
            json[key] = jsonAll;
            flagC = 0;
            flagColumn = 0;
        }
        else if (0 != list.length - 1 && flag != 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = this.json[key].description;
            var temp = [];
            for (var i = 0; i < column.length; i = i + 2) {
                if (column[i] == key) {
                    flagColumn = 1;
                    temp.push(column[i + 1]);
                }
            }
            jsonAll["columns"] = temp;
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagColumn == 0) {
                jsonAll["columns"] = [];
            }
            ;
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            jsonAll["from"] = jsonJoin[key].from;
            jsonAll["target"] = jsonJoin[key].target;
            list_rest.shift();
            flag = flag + 1;
            jsonAll["join_tables"] = this.CreateJsonAndContraint(list_rest, constraints, column, flag, this.json[key].join_tables);
            json[key] = jsonAll;
            flagC = 0;
            flagColumn = 0;
        }
        else if (key == list[0] && 0 == list.length - 1 && flag != 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = this.json[key].description;
            var temp = [];
            for (var i = 0; i < column.length; i = i + 2) {
                if (column[i] == key) {
                    flagColumn = 1;
                    temp.push(column[i + 1]);
                }
            }
            jsonAll["columns"] = temp;
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagColumn == 0) {
                jsonAll["columns"] = [];
            }
            ;
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            var from = jsonJoin[key].from;
            jsonAll["from"] = from;
            jsonAll["target"] = jsonJoin[key].target;
            json[key] = jsonAll;
            flagC = 0;
            flagColumn = 0;
        }
        return json;
    };
    /**
     * @param list root table and his join table
     * @param constraints the constranits entered
     * @param flag record the number of recursion
     * @param jsonJoin the json of join table
     */
    jsonRead.prototype.CreateJsonWithoutColumns = function (list, constraints, flag, jsonJoin) {
        var jsonAll = {};
        var json = {};
        var list_rest = JSON.parse(JSON.stringify(list));
        var key = list[0];
        var schema = jsonJoin[key].schema;
        var flagC = 0;
        if (schema == "public") {
            schema = "\"" + "public" + "\"";
        }
        var c = schema + "." + key + "." + "*";
        if (0 == list.length - 1 && flag == 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = jsonJoin[key].description;
            jsonAll["columns"] = [c];
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            json[key] = jsonAll;
            flagC = 0;
        }
        else if (0 != list.length - 1 && flag == 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = jsonJoin[key].description;
            jsonAll["columns"] = [c];
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            list_rest.shift();
            flag = flag + 1;
            jsonAll["join_tables"] = this.CreateJsonWithoutColumns(list_rest, constraints, flag, this.json[key].join_tables);
            json[key] = jsonAll;
            flagC = 0;
        }
        else if (0 != list.length - 1 && flag != 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = this.json[key].description;
            jsonAll["columns"] = [];
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            jsonAll["from"] = jsonJoin[key].from;
            jsonAll["target"] = jsonJoin[key].target;
            list_rest.shift();
            flag = flag + 1;
            jsonAll["join_tables"] = this.CreateJsonWithoutColumns(list_rest, constraints, flag, this.json[key].join_tables);
            json[key] = jsonAll;
            flagC = 0;
        }
        else if (key == list[0] && 0 == list.length - 1 && flag != 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = this.json[key].description;
            jsonAll["columns"] = [];
            for (var i = 0; i < constraints.length; i = i + 2) {
                if (constraints[i] == key) {
                    flagC = 1;
                    jsonAll["constraints"] = constraints[i + 1];
                }
            }
            if (flagC == 0) {
                jsonAll["constraints"] = "";
            }
            ;
            var from = jsonJoin[key].from;
            jsonAll["from"] = from;
            jsonAll["target"] = jsonJoin[key].target;
            json[key] = jsonAll;
            flagC = 0;
        }
       // console.log("======================");
       // console.log(json);
        return json;
    };
    /**
     * generate adql statements for querying table information
     * @param name table's name
     * @param schema schema name
     */
    jsonRead.prototype.AdqlAllColumn = function (name, schema) {
        var adql = "";
        adql = "SELECT "
            + "TAP_SCHEMA.columns.column_name"
            + ",TAP_SCHEMA.columns.unit"
            + ",TAP_SCHEMA.columns.ucd"
            + ",TAP_SCHEMA.columns.utype"
            + ",TAP_SCHEMA.columns.dataType"
            + ",TAP_SCHEMA.columns.description"
            + " FROM TAP_SCHEMA.columns";
        if (schema == 'public' || schema == 'metaviz') {
            adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + name + "'";
        }
        else {
            adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + schema + "." + name + "'";
        }
        return adql;
    };
    return jsonRead;
}());
