"use strict";
var jsonRead = /** @class */ (function () {
    function jsonRead(json) {
        this.json = json;
    }
    /**
    * This function reads the json object and get the most used table's name.
    * @param data :json object
    * RETURN: an array containing table's name.
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
        for (var key in jsonAll[table].join_tables) {
            if (key.indexOf("2") != -1) {
                continue; //same rootTable and join_table, I made the second name of the repeat followed by a number 2//@TODO 
            }
            else {
                joinTable.push(key);
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
        var joinTable = "";
        var flag2;
        flag2 = flag + 1;
        var niveau = flag2 + 2;
        var space = "    ";
        for (var i = 1; i <= flag2; i++) {
            space += space;
        }
        for (var key in jsonAll[table].join_tables) {
            if (list_exist.indexOf(key) == -1) {
                joinTable += space + "<B>" + key + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(key) + "</font>" + "<br/>";
                joinTable += space + "<input id=\"" + niveau + key + "\" type=\"text\" name = \"Cinput\" style = \"width: 200px\" placeholder=\"contraints\">" + "<button type=\"button\" id = " + "\"b" + niveau + key + "\" name = \"Cbutton\" class=\"btn btn-primary\">Add</button>" + "<br/>";
                list_exist.push(key);
                var table_1 = void 0;
                var tableCut = void 0;
                table_1 = this.json2HtmlJoin(key, list_exist, flag2);
                tableCut = table_1.replace(/ /g, "");
                if (tableCut.length != 0) {
                    joinTable += table_1;
                }
            }
        }
        return joinTable;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * The same logic of TapService.ts-"createNewJson()"
     * @param table the main(table) table
     * @return a string containing the html code
     */
    jsonRead.prototype.json2Html = function (table) {
        var jsonAll = this.json;
        var joinTable = "";
        var list_exist = [];
        list_exist.push(table);
        joinTable += "<B>" + table + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(table) + "</font>" + "<br/>";
        joinTable += "<input id=" + "\"1" + table + "\" type=\"text\" name = \"Cinput\" style = \"width: 200px\" placeholder=\"contraints\">" + "<button type=\"button\" id = " + "\"b1" + table + "\" name = \"Cbutton\" class=\"btn btn-primary\">Add</button>" + "<br/>";
        for (var key in jsonAll[table].join_tables) {
            joinTable += "    " + "<B>" + key + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(key) + "</font>" + "<br/>";
            joinTable += "    " + "<input id=\"2" + key + "\" type=\"text\" name = \"Cinput\" style = \"width: 200px\" placeholder=\"contraints\">" + "<button type=\"button\" id = " + "\"b2" + key + "\" name = \"Cbutton\" class=\"btn btn-primary\">Add</button>" + "<br/>";
            if (list_exist.indexOf(key) == -1) {
                list_exist.push(key);
                joinTable += this.json2HtmlJoin(key, list_exist, 0);
            }
        }
        return joinTable;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * @param table  the main(table) table
     * @return the table table's description
     */
    jsonRead.prototype.getDescription = function (table) {
        var jsonAll = this.json;
        var description;
        description = jsonAll[table].description;
        return description;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * @return a string containing the html code
     */
    jsonRead.prototype.showAll = function () {
        var rootTable = this.rootTable();
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
    jsonRead.prototype.CreateJsonAndContraint = function (list, constraint, flag, jsonJoin) {
        var jsonAll = {};
        var json = {};
        var list_rest = list;
        var key = list[0];
        if (0 == list.length - 1 && flag == 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = jsonJoin[key].description;
            jsonAll["columns"] = [];
            jsonAll["constraints"] = constraint;
            json[key] = jsonAll;
        }
        else if (0 != list.length - 1 && flag == 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = jsonJoin[key].description;
            jsonAll["columns"] = [];
            jsonAll["constraints"] = "";
            list_rest.shift();
            flag = flag + 1;
            jsonAll["join_tables"] = this.CreateJsonAndContraint(list_rest, constraint, flag, this.json[key].join_tables);
            json[key] = jsonAll;
        }
        else if (0 != list.length - 1 && flag != 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = this.json[key].description;
            jsonAll["columns"] = [jsonJoin[key].from];
            jsonAll["constraints"] = "";
            jsonAll["from"] = jsonJoin[key].from;
            jsonAll["target"] = jsonJoin[key].target;
            list_rest.shift();
            flag = flag + 1;
            jsonAll["join_tables"] = this.CreateJsonAndContraint(list_rest, constraint, flag, this.json[key].join_tables);
            json[key] = jsonAll;
        }
        else if (key == list[0] && 0 == list.length - 1 && flag != 0) {
            jsonAll["schema"] = jsonJoin[key].schema;
            jsonAll["description"] = this.json[key].description;
            jsonAll["columns"] = [jsonJoin[key].from];
            jsonAll["constraints"] = constraint;
            jsonAll["from"] = jsonJoin[key].from;
            jsonAll["target"] = jsonJoin[key].target;
            json[key] = jsonAll;
        }
        return json;
    };
    return jsonRead;
}());
