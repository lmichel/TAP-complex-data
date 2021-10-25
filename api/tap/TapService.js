"use strict;";

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
        console.log("Async AJAXurl: " + site + " query: " + adql);

        reTable = $.ajax({
                url: "" + site,
                type: "GET",
                data: {query: "" + adql, format: correctFormat, lang: 'ADQL', request: 'doQuery'},
            });
        
        let output = {};
        reTable.then((value)=>{
            output.status = 200;
            output.statusText = "OK";
            output.responseText = new XMLSerializer().serializeToString(value);
            output.responseXML = value;
        });

        try {
            await reTable;
        } catch (error) {
            output = error;
        }
        // just because CAOM always respond with code 200 even if something went wrong
        if(this.url.includes("vao.stsci.edu/CAOMTAP/tapservice.aspx")){
            let status = $("INFO[name=\"QUERY_STATUS\"]",output.responseXML)[0];
            if(status !== undefined){
                if(status.attributes.value.value == "ERROR"){
                    output.status = 400;
                    output.statusText = "Bad Request";
                }
            }
            
        }
        if (output.status === 200){
            dataTable = VOTableTools.votable2Rows(output);
            let fields = VOTableTools.genererField(output,output.responseText);
            let nbCols = fields.length;
            let singleArrayValue = [];
            let doubleArrayValue = [];
            let col;
            if(nbCols <1 && dataTable.length > 0){
                return {"status" : false , "error":{"logs" :"Error in columns parsing" } };
            }
            for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {
                for (col = 0; col < nbCols; col++) {
                    singleArrayValue.push(dataTable[rowNb+col]);
                }
                doubleArrayValue.push(singleArrayValue);

                singleArrayValue = [];
            }

            return {"status" : true , "field_values" :doubleArrayValue,"field_names":fields,"answer":output};

        } else {
            console.error(output);
            return {"status":false,"error":{
                "logs":$("INFO[name=\"QUERY_STATUS\"]",output.responseXML)[0].textContent,
                "params" : {"adql":adql}
            }};
        }
        
    };

    /**
     *  INPUT : Get the from_table, target_table, from_column, target_column
     * @returns : OUPUT : votable object
     */
    TapService.prototype.allLinkQuery = async function () {
        try {
            var checkstatus = this.checkstatus;
            var reTable;
            var checkvalue = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
            if (checkstatus == true) {
                checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
            }

            reTable = await this.Query(checkvalue);

            if(reTable.status){
                return {"status":true,"votable":reTable.answer};
            }
            return {"status":false,"error":{
                "logs":"Error while querying " + JSON.stringify(reTable.error.params) + " : \n" + reTable.error.logs
            }};
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString()
            }};
        }
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
    TapService.prototype.allLink = async function () {
        try {
            if (this.tableRemoveView === undefined) {
                var allLinkLimitObject;
                allLinkLimitObject = await this.allLinkQuery();
                if (allLinkLimitObject.status){
                    allLinkLimitObject = allLinkLimitObject.votable;
                } else {
                    return {"status":false,"error":{
                        "logs":"Error while querying data : \n" + allLinkLimitObject.error.logs
                    }};
                }
                var reTableRe;
                var allLink = [];
                reTableRe = VOTableTools.votable2Rows(allLinkLimitObject);
                // row format : from_table target_table key_id from_column target_column

                for (var i = 0; i < reTableRe.length; i = i + 5) { // i+ 5 return another row to the first position of retable
                    var tt = reTableRe[i + 1]; // i+1 => represent the column of target table in retable
                    tt = this.getRightName(tt);// return the target table name  withaout schema
                    var tc = reTableRe[i + 4]; //return the target_column. (reTableRe[i + 4]) represent the column of target column
                    var ft = reTableRe[i];
                    ft = this.getRightName(ft); // return the from table name  withaout schema
                    var fc = reTableRe[i + 3];  //return the from column. (reTableRe[i + 3]) represent the column of target column

                    allLink.push([tt + '|' + tc,
                        ft + '|' + fc]);
                }
            

                this.tableRemoveView = await this.removeViewTable(allLink);

                if (this.tableRemoveView.status){
                    this.tableRemoveView = this.tableRemoveView.allLinkRe;
                } else {
                    this.tableRemoveView = undefined;
                    return {"status":false,"error":{
                        "logs":"Error while processing data : \n" + this.tableRemoveView.error.logs
                    }};
                }
            }
            return {"status":true , "allLink":this.tableRemoveView} ;
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString()
            }};
        }
        
    };

    /**
     * return all tables with the name of the join table.
     * @return json object contening table,and thier description
     */
    TapService.prototype.createJson = async function () {
        try {
            var allTtable = [];
            var jsonAll = {};
            var columns = [];
            var constraints = "";
            var alllink = [[]];
            alllink = await this.allLink();
            if(alllink.status){
                alllink = alllink.allLink;
            } else{
                return {"status":false,"error":{
                    "logs":"Error while querrying links data : \n" + alllink.error.logs
                }};
            }
            allTtable = await this.allTable(); //Get the array containing the names of the tables.//Even number is the table name.
            if(allTtable.status){
                allTtable = allTtable.allTables;
            } else{
                return {"status":false,"error":{
                    "logs":"Error while querrying table's name data : \n" + allTtable.error.logs
                }};
            }
            console.log(allTtable); //OK
            console.log(alllink); //NOK
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
                        loop: for (let key in arrLink) { // contaning all joinTable of root table

                            if (ft[0] == key) {
                                ifSame = 1;
                                arrLinkJoint.schema = this.schema;
                                arrLinkJoint.columns = columns;
                                arrLinkJoint.constraints = constraints;
                                let temp1 = [];
                                if (Array.isArray(arrLink[ft[0]].from) && arrLink[ft[0]].from.indexOf(ft[1]) == -1) {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].from));
                                    temp1.push(ft[1]);
                                } else {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].from));
                                }
                                arrLinkJoint.from = temp1;
                                temp1 = [];
                                if (Array.isArray(arrLink[ft[0]].target) && arrLink[ft[0]].target.indexOf(tt[1]) == -1) {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].target));
                                    temp1.push(tt[1]);
                                } else {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[ft[0]].target));
                                }
                                arrLinkJoint.target = temp1;
                                arrLink[ft[0]] = arrLinkJoint;
                                break loop;
                            } else {
                                ifSame = 0;
                            }
                        }
                        if (ifSame == 0) {
                            flag = flag + 1;
                            arrLinkJoint.schema = this.schema;
                            arrLinkJoint.columns = columns;
                            arrLinkJoint.constraints = constraints;
                            arrLinkJoint.from = ft[1];
                            arrLinkJoint.target = tt[1];
                            arrLink[ft[0]] = arrLinkJoint;
                        }
                    } else if (ft[0] == nowTable) {
                        loop: for (let key in arrLink) {
                            if (tt[0] == key) {
                                ifSame = 1;
                                arrLinkJoint.schema = this.schema;
                                arrLinkJoint.columns = columns;
                                arrLinkJoint.constraints = constraints;
                                let temp1 = [];
                                if (Array.isArray(arrLink[tt[0]].from) && arrLink[tt[0]].from.indexOf(tt[1]) == -1) {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].from));
                                    temp1.push(tt[1]);
                                } else {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].from));
                                }
                                arrLinkJoint.from = temp1;
                                temp1 = [];
                                if (Array.isArray(arrLink[tt[0]].target) && arrLink[tt[0]].target.indexOf(ft[1]) == -1) {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].target));
                                    temp1.push(ft[1]);
                                } else {
                                    temp1 = JSON.parse(JSON.stringify(arrLink[tt[0]].target));
                                }
                                arrLinkJoint.target = temp1;
                                arrLink[tt[0]] = arrLinkJoint;
                                break loop;
                            } else {
                                ifSame = 0;
                            }
                        }

                        if (ifSame == 0) {
                            flag = flag + 1;
                            arrLinkJoint.schema = this.schema;
                            arrLinkJoint.columns = columns;
                            arrLinkJoint.constraints = constraints;
                            arrLinkJoint.from = tt[1];
                            arrLinkJoint.target = ft[1];
                            arrLink[tt[0]] = arrLinkJoint;
                        }
                    }

                }
                if (flag == 0) {
                    continue;
                } else {
                    arrJoint.schema = this.schema;
                    arrJoint.description = allTtable[k + 1];
                    arrJoint.join_tables = arrLink;
                    jsonAll[nowTable] = arrJoint;

                }
            }
            return {"status":true, "json":jsonAll };
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString()
            }};
        }
        
    };


    /**
     * In order to create the json with all join table
     * @param data :json the return json file of createJson()
     * @param root :the main table: root table
     * @return the json with all join table
     */
    TapService.prototype.createNewJson = function (data, root) {
        try {
            var reJson = {};
            for (var key in data) {
                var list_exist = [];
                list_exist.push(key);
                var joinJson = {};
                if (root == key) {
                    joinJson.schema = data[key].schema;
                    joinJson.description = data[key].description;
                    joinJson.columns = [];
                    joinJson.constraints = "";
                    var joinJsonJoin = {};
                    for (var join in data[key].join_tables) {
                        var joinJsonJoin1 = {};
                        list_exist.push(join);
                        joinJsonJoin1.schema = data[join].schema;
                        joinJsonJoin1.description = data[join].description;
                        joinJsonJoin1.columns = data[key].join_tables[join].columns;
                        joinJsonJoin1.constraints = data[key].join_tables[join].constraints;
                        joinJsonJoin1.from = data[key].join_tables[join].from;
                        joinJsonJoin1.target = data[key].join_tables[join].target;
                        var a = this.ifJoin(data, list_exist, join);
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
            return {"status":false,"newJson": reJson};
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString(),
                "params" : {"data":data, "root":root}
            }};
        }

    };


    /***
     * @param data: the main json
     * @param list_exist:list of tables who are already recorded
     * @param root: the root table
     * @return json
     */
    TapService.prototype.ifJoin = function (data, list_exist, root) {
        try {
            var joinJsonJoin = {};
            for (var key in data) {
                if (key == root) {
                    for (var join in data[key].join_tables) {
                        if (list_exist.indexOf(join) == -1) {
                            list_exist.push(join);
                            var joinJsonJoin1 = {};
                            joinJsonJoin1.schema = data[join].schema;
                            joinJsonJoin1.description = data[join].description;
                            joinJsonJoin1.columns = data[key].join_tables[join].columns;
                            joinJsonJoin1.constraints = data[key].join_tables[join].constraints;
                            joinJsonJoin1.from = data[key].join_tables[join].from;
                            joinJsonJoin1.target = data[key].join_tables[join].target;
                            var a = this.ifJoin(data, list_exist, join);
                            if (JSON.stringify(a) != '{}') {
                                joinJsonJoin1.join_tables = a;
                            }
                            joinJsonJoin[join] = joinJsonJoin1;
                        }
                    }
                    break;
                }
            }
            return {"status":true,"json":joinJsonJoin} ;
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString(),
                "params" : {"data":data, "list_exist":list_exist, "root":root}
            }};
        }
        
    };

    /***
     * remouve all view table if exist.
     * @param allLinkRe : Array containing all table
     * @return: an array containing the names of the tables
     */
    TapService.prototype.removeViewTable = async function (allLinkRe) {
        try {
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

            reTable = await this.Query(checkvalue);
            if(reTable.status){
                reTable = reTable.answer;
            } else{
                return {"status":false,"error":{
                    "logs":"Error while querying data : \n" + reTable.error.logs,
                    "params" : {"allLinkRe":allLinkRe}
                }};
            }
            var allTable = [];
            var content = reTable.responseText;
            var l = 0;
            $(content).find('RESOURCE[type="results"]').each(function () {
                $(this).find("STREAM").each(function () {
                    l = $(this).text().length;
                });
            });
            if (l == 0) {
                return {"status":true, "allLinkRe":allLinkRe};
            } else {
                allTable = VOTableTools.votable2Rows(reTable);
                var viewTable = [];
                var j = 0;
                for (let i = 0; i < allTable.length; i++) {
                    if (allTable[i] != undefined && allTable[i].length != 0) {
                        viewTable[j] = allTable[i];
                        j++;
                    }
                }
                for (let i = 0; i < viewTable.length; i++) {
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
                for (let i = 0; i < position.length - 1; i++) {
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
                return {"status":true, "allLinkRe":allLinkRe} ;
            }
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString(),
                "params" : {"allLinkRe":allLinkRe}
            }};
        }
    };

    return TapService;
}());


