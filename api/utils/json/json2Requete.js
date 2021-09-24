"use strict";
var json2Requete = /** @class */ (function () {
    function json2Requete() {
    }
    /**
     * Receive json, generate adql
     * @param json :the json with constraints
     * @return : adql
     */
    json2Requete.getAdql = function (json) {
        var jsonAll = json;
        var adql = "";
        var column = [];
        var constraint = "";
        var schema = "";
        for (var key in jsonAll) {
            if (jsonAll[key].schema == "public") {
                schema = "\"public\"";
            }
            else {
                schema = jsonAll[key].schema;
            }
            if (jsonAll[key].columns != []) {
                for (var columnkey in jsonAll[key].columns) {
                    if (jsonAll[key].columns[columnkey].indexOf("*") != -1) {
                        column.push(jsonAll[key].columns[columnkey]);
                    }
                    else {
                        column.push(schema + "." + key + "." + jsonAll[key].columns[columnkey]);
                    }
                }
            }
            if (jsonAll[key].join_tables != undefined) {
                var columnJoin = json2Requete.getColumn(jsonAll[key].join_tables, schema);
                column.push.apply(column, columnJoin);
                if (jsonAll[key].constraints != undefined && jsonAll[key].constraints.length != 0) {
                    constraint = jsonAll[key].constraints;
                    constraint += json2Requete.getConstraint(jsonAll[key].join_tables, 1);
                }
                else {
                    constraint += json2Requete.getConstraint(jsonAll[key].join_tables, 0);
                }
            }
            else {
                if (jsonAll[key].constraints != "") {
                    constraint = jsonAll[key].constraints;
                }
            }
        }
        adql += "SELECT " + "\n" + "TOP 100" + "\n"; //"\n"+"DISTINCT"+
        for (var i = 0; i < column.length; i++) {
            if (i == column.length - 1) {
                adql += column[i] + "\n";
            }
            else {
                adql += column[i] + ", " + "\n";
            }
        }
        adql += "FROM ";
        for (var key in jsonAll) {
            adql += schema + "." + key + " " + "\n";
            adql += json2Requete.getJoin(jsonAll[key].join_tables, key, schema);
        }
        if (constraint != "") {
            adql += "WHERE " + "\n" + constraint;
        }
        var table = "";
        for (var key in jsonAll) {
            for (var keyJoin in jsonAll[key].join_tables) {
                var id = jsonAll[key].join_tables[keyJoin].target;
                table = keyJoin;
                console.log("id");
                console.log(id);
            }
        }
        if (adql.indexOf("ref.") != -1) {
            id = "oidbib";
        }
        console.log(id);
        if (id != undefined) {
            adql += "\n";
            //adql += "ORDER BY " + id; // THE ORDERED BY ID GERERATE SOMME ERROR THAT'IS
        }
        return adql
    };
    /**
     * Receive json and schema to get the column
     * @param json :the json with constraints
     * @param schema :the schema of the service
     * @return : column
     */
    json2Requete.getColumn = function (json, schema) {
        var column = [];
        for (var key in json) {
            for (var columnkey in json[key].columns) {
                if (json[key].columns[columnkey].indexOf("*") != -1) {
                    column.push(json[key].columns[columnkey]);
                }
                else {
                    if (json2Requete.isString(json[key].columns[columnkey])) {
                        column.push(schema + "." + key + "." + json[key].columns[columnkey]);
                    }
                    else {
                        column.push(schema + "." + key + "." + json[key].columns[columnkey][0]);
                    }
                }
            }
            if (json[key].join_tables != undefined) {
                column.push.apply(column, json2Requete.getColumn(json[key].join_tables, schema));
            }
        }
        return column;
    };
    /**
     * Receive json and schema to get the constraint
     * @param json :the json with constraints
     * @param flag :record iterations
     * @return : content of constraint recorded in json
     */
    json2Requete.getConstraint = function (json, flag) {
        var constraint = "";
        for (var key in json) {
            if (json[key].constraints != undefined && flag != 0 && json[key].constraints.length != 0) {
                constraint += "\n" + "AND" + "\n";
                constraint += json[key].constraints;
                flag++;
            }
            else if (json[key].constraints != undefined && flag == 0 && json[key].constraints.length != 0) {
                constraint += json[key].constraints;
                flag++;
            }
            if (json[key].join_tables != undefined) {
                constraint += json2Requete.getConstraint(json[key].join_tables, flag);
            }
        }
        return constraint;
    };
    /**
     * Determine if the parameter is a string
     * @param s :judged content
     * @return : boleen true:is string ; false:not string
     */
    json2Requete.isString = function (s) {
        return typeof s === 'string';
    };
    /**
     * Determine whether the table has been joined and return the joined part in adql
     * @param json :the json with constraints
     * @param table :juded table
     * @param schema :the schema of the service
     * @return : part of adql statement
     */
    json2Requete.getJoin = function (json, table, schema) {
        var retour = "";
        //let flag:number=0
        for (var key in json) {
            retour += "JOIN " + schema + "." + key + " " + "\n";
            if (json2Requete.isString(json[key].target) && json2Requete.isString(json[key].from)) {
                //if(json[key].target==json[key].from&&json[key].target=='otype'){
                //    retour += "USING("+json[key].target+")"+"\n";
                //}else{
                retour += "ON " + schema + "." + table + "." + json[key].target + "=" + schema + "." + key + "." + json[key].from + " " + "\n";
                // }
                if (json2Requete.getJoin(json[key].join_tables, key, schema) != "") {
                    retour += json2Requete.getJoin(json[key].join_tables, key, schema);
                }
            }
            else {
                var n = json[key].target.length;
                //if(json[key].target[0]==json[key].from[0]&&json[key].target[0]=='otype'){
                //   retour += "USING("+ json[key].target[0]+")"+"\n";
                //}else{
                retour += "ON " + schema + "." + table + "." + json[key].target[0] + "=" + schema + "." + key + "." + json[key].from[0] + " " + "\n";
                //}
                for (var i = 1; i < n; i++) {
                    retour += "AND ";
                    retour += schema + "." + table + "." + json[key].target[i] + "=" + schema + "." + key + "." + json[key].from[i] + " " + "\n";
                }
                if (json2Requete.getJoin(json[key].join_tables, key, schema) != "") {
                    retour += json2Requete.getJoin(json[key].join_tables, key, schema);
                }
            }
        }
        return retour;
    };
    return json2Requete;
}());
