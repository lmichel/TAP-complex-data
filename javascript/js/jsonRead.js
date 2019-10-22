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
     * This function reads the json object and gets all the join table's names
     * @param root the main table.
     * @return all the join table's name.
     */
    jsonRead.prototype.joinTable = function (root) {
        var jsonAll = this.json;
        var joinTable = [];
        for (var key in jsonAll[root].join_tables) {
            joinTable.push(key);
        }
        return joinTable;
    };
    /**
     * This is a recursive function. In order to get all the join table of root table
     * @param root the main(root) table
     * @param list_exist store the recorded table name
     * @param flag record the number of recursions and format the output.
     * @return a string containing the html code
     */
    jsonRead.prototype.readJsonJoinTable = function (root, list_exist, flag) {
        var jsonAll = this.json;
        var joinTable = "";
        var flag2;
        flag2 = flag + 1;
        var space = "    ";
        for (var key in jsonAll[root].join_tables) {
            if (list_exist.indexOf(key) == -1) {
                for (var i = 0; i <= flag2; i++) {
                    joinTable += space;
                }
                joinTable += "<B>" + key + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(key) + "</font>" + "<br/>";
                list_exist.push(key);
                var table = void 0;
                var tableCut = void 0;
                table = this.readJsonJoinTable(key, list_exist, flag2);
                tableCut = table.replace(/ /g, "");
                if (tableCut.length != 0) {
                    joinTable += table;
                }
            }
        }
        return joinTable;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * @param root the main(root) table
     * @return a string containing the html code
     */
    jsonRead.prototype.readJsonJoin = function (root) {
        var jsonAll = this.json;
        var joinTable = "";
        var list_exist = [];
        list_exist.push(root);
        joinTable += "<B>" + root + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(root) + "</font>" + "<br/>";
        for (var key in jsonAll[root].join_tables) {
            joinTable += "    " + "<B>" + key + "</B>" + ": " + "<font color = \"#545454\">" + this.getDescription(key) + "</font>" + "<br/>";
            if (list_exist.indexOf(key) == -1) {
                list_exist.push(key);
                joinTable += this.readJsonJoinTable(key, list_exist, 0);
            }
        }
        return joinTable;
    };
    /**
     * This function reads the json object and get a string containing the html code.
     * @param root  the main(root) table
     * @return the root table's description
     */
    jsonRead.prototype.getDescription = function (root) {
        var jsonAll = this.json;
        var description;
        description = jsonAll[root].description;
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
    return jsonRead;
}());
