class TapServiceConnector {
    constructor(_serviceUrl, _schema, _shortname) {
        this.tapService = new TapService(_serviceUrl, _schema, _shortname, true)
        this.isLoadJson = false;
        this.objectMapWithAllDescription = {"root_table": {"name": "root_table_name", "schema": "schema", "columns":[]}, "tables": {}, "map": {"handler_attributs": {}}}
        this.jsonContaintJoinTable = {Succes:{status: "", base_table: "", joined_tables: []}, Failure: {NotConnected: {status: "", message: ""}, WrongTable: {status: "", message: ""}}}
        this.connector = {status: "", message: "", service: {}, votable: ""}
        this.jsonAdqlContent = {'rootQuery': "", "constraint": {}, 'allJoin': {}, 'allCondition': {}, "status": {"status": "", 'orderErros': ""}}
        this.api ="";
        this.attributsHandler = new HandlerAttributs();
        this.jsonCorrectTableColumnDescription = {"addAllColumn": {}};
        this.setAdqlConnectorQuery = function (correctTableNameFormat) {
            let query = "SELECT TOP 5 * FROM " + correctTableNameFormat;
            return query
        }



    }

}
let testButton = false;
/**
 * Private variable for our classe
 * */
let testRoot = false;
let tab = []
let tabContaninBtnRemoveConstraint = [];
let HtmltabContaninBtnRemoveConstraint = [];
let tempTab = [];
//for add AHS to handlerJson after runing query
let testSecondJson = false;
let jsonContaintHandlersValue1 = []
let dataTable1 = [];
// for getObjectWhith all description
let getObjectMapWithAllDescription
let testApiRooQuery = false;
let api = "";
let table = []
let isloadRootQuery = false;
const COUNT = 10;

/**
 * return the full json create by the method createJson()
 */
var jsonLoad = "";
TapServiceConnector.prototype.loadJson = function () {
    if(!this.isLoadJson){
        jsonLoad = this.tapService.createJson();
    }
    return jsonLoad;
}
TapServiceConnector.prototype.getFields=function (votableQueryResult,url){
    let contentText = votableQueryResult.responseText;
    let rootFields = [];
    if ( url === "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" ||  url === "http://dc.zah.uni-heidelberg.de/tap/sync") {

        rootFields = VOTableTools.getField(votableQueryResult);
    } else {
        rootFields = VOTableTools.genererField(votableQueryResult, contentText);
    }

    return rootFields;
}

/**
 *
 * @param {*} root  represent the root table
 * @param {*} json represent the main json create by the method createMainJson
 * @returns return the list of id of join table
 */
TapServiceConnector.prototype.joinAndId = function (root, json) {
    var list = [];
    for (var key in json) {
        if (key == root) {
            for (var join in json[key].join_tables) {
                list.push(json[key].join_tables[join].target);
                list.push(join);
            }
        }
    }
    return list;
}
/**
 *
 * @param {*} listJoinAndId the list of id returned by TapServiceConnector.prototype.getListJoinAndId
 * @return   list of all id
 */

TapServiceConnector.prototype.getListeId = function (listJoinAndId) {
    var listId = [];
    for (var i = 0; i < listJoinAndId.length; i = i + 2) {
        if (!json2Requete.isString(listJoinAndId[i])) {
            var temp = listJoinAndId[i][0];
        } else {
            var temp = listJoinAndId[i];
        }
        if (listId.indexOf(temp) == -1) {
            listId.push(temp);//record the key linked to root table, No repeating
        }
    }
    return listId;
}

/**
 *
 * @param {*} rootName |the root table names of tabservice
 * @param {*} mainJsonData the main json generated by the  method createJson()
 * @returns return array containing all join table with correct id
 */
TapServiceConnector.prototype.getListJoinAndId = function (rootName, mainJsonData) {
    var listJoinAndId = [];
    listJoinAndId = this.joinAndId(rootName, mainJsonData)
    return listJoinAndId;
}

/**
 *
 * @param {*} baseTableName  the root table name
 * @returns return all join table of the root table name
 */
TapServiceConnector.prototype.getJoinTables = function (baseTableName) {
    var data = this.loadJson();
    var jsonread = new jsonRead(data);
    return jsonread.joinTable(baseTableName);
}

TapServiceConnector.prototype.getDataTable=function (votableQueryResult){
   return  VOTableTools.votable2Rows(votableQueryResult);
}



var testMap = false;
let jsonWithaoutDescription = "";
let allTables = "";
let allJoinRootTable = [];
let map = {};
let attributHanler = [];
TapServiceConnector.prototype.getObjectMapAndConstraints = function () {
    let api = this.api;
     let rootTable = api.getConnector().service["table"]
    jsonWithaoutDescription = this.loadJson();
    let jsonAdqlContent = api.tapServiceConnector.jsonAdqlContent;
    this.objectMapWithAllDescription.root_table.name = rootTable;
    this.schema = api.getConnector().service["schema"];
    this.objectMapWithAllDescription.root_table.schema = this.schema;
    this.objectMapWithAllDescription.root_table.columns =  api.tapServiceConnector.objectMapWithAllDescription.map['handler_attributs']
    let correctCondition
    let formatJoinTable = "";
    let correctJoinFormaTable = "";
    let correctTableConstraint = "";
    let correctWhereClose = "";

    if (testMap == false) {
        map = this.getObjectMapAndConstraint(jsonWithaoutDescription, rootTable);
    }

    allJoinRootTable = this.createAllJoinTable(map)
    allTables = allJoinRootTable;
    for (let k = 0; k < allTables.length; k++) {
        for (let tableKey in jsonWithaoutDescription) {
            if (tableKey == allTables[k] || this.schema + "." + tableKey == allTables[k]) {
                formatJoinTable = this.schema + "." + tableKey;
                correctJoinFormaTable = formatJoinTable.quotedTableName().qualifiedName
                attributHanler = json[tableKey]!==undefined?json[tableKey].attribute_handlers:""// this.jsonCorrectTableColumnDescription.addAllColumn[correctJoinFormaTable]
                for (let keyConstraint in jsonAdqlContent.constraint) {
                    if (keyConstraint == correctJoinFormaTable) {
                        for (let keyConst in jsonAdqlContent.constraint) {
                            if (keyConst == "condition " + correctJoinFormaTable) {
                                correctWhereClose = api.tapServiceConnector.jsonAdqlContent.allCondition[keyConstraint];
                            }
                        }
                    }
                }
                this.objectMapWithAllDescription.tables[tableKey] = {
                    "description": jsonWithaoutDescription[tableKey].description,
                    "constraints": "",//correctTableConstraint!=undefined && correctWhereClose!=undefined && correctConstraint.trim()!="WHERE"?correctConstraint:"",
                    "columns": attributHanler != undefined ? attributHanler : [],
                }
                for (let keyConstraint in jsonAdqlContent.constraint) {
                    if (keyConstraint == correctJoinFormaTable) {
                        correctCondition = replaceAll(" WHERE " + correctWhereClose, "WHERE  AND ", "")
                        correctCondition = correctCondition.replaceAll("WHERE".trim(), " ");
                        this.objectMapWithAllDescription.tables[tableKey].constraints = correctTableConstraint != undefined && correctWhereClose != undefined ? correctCondition : "";
                    }
                }

            } else {
            }

        }

    }
    this.objectMapWithAllDescription.map = map
    return this.objectMapWithAllDescription;
}



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
                joinJsonJoin1["from"] = data[key].join_tables[join].from;
                joinJsonJoin1["target"] = data[key].join_tables[join].target;
                var a = this.verifiedJoin(data, list_exist, join);
                if (JSON.stringify(a) != '{}') {
                    joinJsonJoin1["join_tables"] = a;
                    // console.log(a);
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
TapServiceConnector.prototype.verifiedJoin = function (data, list_exist, root) {
    var joinJsonJoin = {};
    for (var key in data) {
        if (key == root) {
            for (var join in data[key].join_tables) {
                if (list_exist.indexOf(join) == -1) {
                    list_exist.push(join);
                    var joinJsonJoin1 = {};
                    joinJsonJoin1["from"] = data[key].join_tables[join].from;
                    joinJsonJoin1["target"] = data[key].join_tables[join].target;
                    var a = this.verifiedJoin(data, list_exist, join);
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

TapServiceConnector.prototype.Query = function(adql){

    return this.tapService.Query(adql)
}




TapServiceConnector.prototype.createB=function (name,i){
    return "<button  type='button' class=\"btn btn-warning\" id='b" + name + i + "' value='" + name + "' style=\"margin-top: 7px\">handler '" + name+ "'</button></span>"
}


function replaceAll(str, find, replace) {
    var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}


TapServiceConnector.prototype.selecConstraints = function (tableName, txtImput,api){
    var name = tableName //b[ii].id.slice(1);//the name of
    var schema = api.getConnector().service["schema"];
    // alert(name +' '+schema);
    var adql = this.attributsHandler.addAllColumn(name, schema)
    var QObject = this.Query(adql);
    var dataTable = VOTableTools.votable2Rows(QObject)
    var contentText = QObject.responseText;
    var Field = VOTableTools.genererField(QObject, contentText)
    var nb = Field.length;
    var out = "\n" +
        "  <!-- The Modal -->\n" +
        "  <div class=\"modal fade\" id=\"myModal\">\n" +
        "    <div class=\"modal-dialog modal-xl\">\n" +
        "      <div class=\"modal-content\">"+
        "    <div class=\"modal-content\">\n" +
        "      <div class=\"modal-body\">\n"+
       "<span style='text-align: left;font-weight: bold;font-size: x-large;'> Columns of table " + name + "</span>" +
       "<button class='delete_right btn btn-danger'  data-dismiss=\"modal\" id='d_right'><i class='fa fa-close ' ></i></button><br></br>";//head
    out += "<table  class = 'table table-bordered table-striped table-hover'  role = 'grid' >";
    out += "<thead class='thead-dark'><tr role='row'>"
    for (var j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
    var column = 0;
    for (var j = 0; j < dataTable.length; j++) {//table  content
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr class = 'odd table-primary' >";
            } else {
                out += "<tr class = 'even table-primary'>";
            }
            out += "<td id = '" + dataTable[j] + "' style='text-align: center;vertical-align:bottom;text-decoration:underline' >" + dataTable[j] + "</td>";
        } else {
            out += "<td style='text-align: center;vertical-align:bottom'>" + dataTable[j] + "</td>";
        }
        column = column + 1;
        if (column == nb) {
            out += "</tr>";
            column = 0;
        }

    }
    out += "</tbody>"
    out += "</table>  </div>"
    out+=    "</div>\n" +
        "      <div class=\"modal-footer\">\n" +
        "        <button type=\"button\" class=\"btn btn-danger\" data-dismiss=\"modal\">Close</button>\n" +
        "      </div>\n" +
        "    </div>\n" +
        "\n" +
        "  </div>\n" +
        "</div>"

        ;//head
    $("body").prepend(out);
    //let schema = this.connector.service["schema"];
    var td = $("td");
    for (var i = 0; i < td.length; i++) {
        $(td[i]).click(function () {
           // alert($("#" + txtImput).val().length);
            var i = $(this).attr("id");
            if ($("#" + txtImput).val().length !==1) {
                var content = $("#" + txtImput).val();
                let formatValue = schema+"."+name;
                let correctValue = formatValue.quotedTableName().qualifiedName
                if($("#" + txtImput).val().indexOf(" AND " + correctValue + "." + i)!==-1){
                    alert(i+" already added")
                }else{
                    $("#" + txtImput).val(content + " AND " + correctValue + "." + i + "=");
                   // document.getElementById('light').style.display = 'none';
                    alert(i+" is added to constraint")
                }
            } else {
                let formatValue = schema+"."+name;
                let correctValue = formatValue.quotedTableName().qualifiedName
                $("#" + txtImput).val(correctValue + "." + i + "=");
               // document.getElementById('light').style.display = 'none';
                alert(i+" is added to constraint")
            }

        });
    }
}




function fun_btnRemoveConstraint(tabContaninBtnRemoveConstraint,key){
    for (let r = 0; r <= tabContaninBtnRemoveConstraint.length; r++) {
        if (tabContaninBtnRemoveConstraint.indexOf(tabContaninBtnRemoveConstraint[r]) > -1) {
        } else {

            tabContaninBtnRemoveConstraint.push(key)
            break;
        }

    }
    tabContaninBtnRemoveConstraint = Array.from(new Set(tabContaninBtnRemoveConstraint));

    return tabContaninBtnRemoveConstraint;
}


TapServiceConnector.prototype.createCorrectJoin = function (api) {
    var testfor = false
    api.tapButton = []
    var jsonAdqlContent = api.tapServiceConnector.jsonAdqlContent;
    let mytest = false;
    var schema = api.tapServiceConnector.connector.service["schema"];
    if (testfor == false) {
        for (let key in api.getObjectMapWithAllDescriptions().tables) {
            $("#" + key).click(function () {
                let format = schema + '.' + key;
                let correctTable = format.quotedTableName().qualifiedName;
                fun_btnRemoveConstraint(tabContaninBtnRemoveConstraint,key);
                for (let keys in jsonAdqlContent.constraint) {
                    if (keys == correctTable) {
                        jsonAdqlContent.allJoin[keys] = jsonAdqlContent.constraint[keys]
                        for (let keyConst in jsonAdqlContent.constraint) {
                            if (keyConst == "condition " + correctTable) {
                                jsonAdqlContent.constraint[keyConst] = $("#txt" + key).val().length!==1?$("#txt" + key).val():"";
                                if (mytest == false) {
                                    jsonAdqlContent.allCondition[keys] = jsonAdqlContent.constraint[keyConst];
                                    mytest = true;
                                } else {
                                    jsonAdqlContent.allCondition[keys] =  jsonAdqlContent.constraint[keyConst];
                                }
                            }
                        }
                    }
                }
                document.getElementById("loadButton").style.display = "none"
                document.getElementById("btnConstraint").style.display = "none";
                $("#getJsonAll").text(jsonAdqlContent.rootQuery);
            })
        }
        testfor = true;
    }
    testButton = true
    api.tapServiceConnector.jsonAdqlContent = jsonAdqlContent
    return api.tapServiceConnector.jsonAdqlContent;
}


TapServiceConnector.prototype.createAllJoinTable = function (map){
    let table = []
    Object.keys(map).forEach(function (k) {
        let json = map[k];
        Object.keys(json.join_tables).forEach(function (k2) {
            table.push(k2);
            let json2 = json.join_tables[k2]
            if (json2.join_tables !== undefined) {
                for (let f in json2.join_tables) {
                    table.push(f);
                    for (let c in json2.join_tables[f]) {
                        let json3 = json2.join_tables[f].join_tables
                        if (json3 !== undefined) {;
                            for (let c1 in json3) {
                                table.push(c1);
                            }
                        }
                    }
                }
            }

        })
        table= Array.from(new Set(table));
    })
    return table;
}

TapServiceConnector.prototype.getAdqlAndConstraint = function (table,constraint){
    let api = this.api;
    return this.tapService.createSimpleAdqlWithConstraint(table,constraint,api);
}
var testforConstrain = false
/**
 * @return{*} : Json the json containing all detail about every singel table join to the root table with hadler atribut of choosing table you want to get it handler attribut
 * */
var json = {};
TapServiceConnector.prototype.setObjectMapWithAllDescriptionConstraint = function (api) {
    var testButton = false;
//var h = new HandlerAttributs();
    var tapButton = [];
    //api = this;
    //this.tapWhereConstraint = [];
    // this.tapJoinConstraint = []
    tapButton = [];
    let tempTable = []
    if (testApiRooQuery == false) {
        api.getRootQuery();
        table = this.tapService.allTable();
        testApiRooQuery = true;
    }
    let schema = api.tapServiceConnector.connector.service["schema"];
    if (testforConstrain == false) {

        /* for (let key in this.handlerAttribut.objectMapWithAllDescription.tables) {
             tempTable.push(key)
         }
         tempTable = Array.from(new Set(tempTable));*/
        table = this.createAllJoinTable(api.getObjectMapWithAllDescriptions().map)
        for (let i = 0; i < table.length; i = i + 1) {
            if (table[i].search(schema + ".") > -1) {
                table[i] = table[i].replaceAll(schema + ".", "")
            }
            var buttons = this.createB(table[i], i) // "<button  type='button' class=\"btn btn-warning\" id='b" + table[i] + i + "' value='" + table[i] + "' style=\"margin-top: 7px\">handler '" + table[i] + "'</button></span>"
            // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

            if (testButton == true) {
                //alert( 'existe deja')
            } else {
                tapButton.push(buttons);
            }
            document.getElementById("loadbuttonsHandler").style.display = "block"

        }

        $("#loadbuttonsHandler").append(tapButton);

        window.location.hash = "#loadbuttonsHandler";
        for (let i = 0; i < table.length; i = i + 1) {

            //document.getElementById("loadbuttonsHandler").style.display = "block"
            $("#b" + table[i] + i).click(function () {

                let format = schema + '.' + table[i];
                let correctTable = format.quotedTableName().qualifiedName;

                document.getElementById("loadbuttonsHandler").style.display = "none"

                //console.log(json);

                //alert(api.jsonCorrectTableColumnDescription.addAllColumn[correctTable] )
                // document.getElementById("loadbuttonsHandler").style.display = "none"
               // if (this.jsonCorrectTableColumnDescription.addAllColumn === undefined) {
                if(json[table[i]]==undefined){
                    json[table[i]] = api.getTableAttributeHandlers(table[i]);
                }
                  //  this.jsonCorrectTableColumnDescription.addAllColumn[correctTable] = json.attribute_handlers;
               // }

                display(JSON.stringify(json, undefined, 2), "getJsonAll")
                display(json.status, "getStatu")
                //return api.jsonCorrectTableColumnDescription;

            })
        }
    }
    api.tapServiceConnector.objectMapWithAllDescription.root_table.columns =  api.tapServiceConnector.objectMapWithAllDescription.map['handler_attributs']
    testforConstrain = true;


}

TapServiceConnector.prototype.replaceWhereAnd = function (jsonAdqlContent){
    let space=" "
    for (let i=0;i<COUNT;i++){
        jsonAdqlContent = replaceAll(jsonAdqlContent, "WHERE"+space+"AND", " WHERE ");
        jsonAdqlContent = replaceAll(jsonAdqlContent,"AND"+space+"AND"," AND ");
        space+=" ";
    }
    if(jsonAdqlContent.indexOf("WHERE")===-1 && jsonAdqlContent.indexOf("AND") !==-1){
        jsonAdqlContent =replaceAll(jsonAdqlContent,"AND","WHERE");
    }
    return jsonAdqlContent;
}
  
