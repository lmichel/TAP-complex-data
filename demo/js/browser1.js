const Simbadschema = "public";

var test = false;

function display(data, id) {
    $("#" + id).html(data);
    window.location.hash = "#loadJson";
}

function reset() {
    display("", "getJsonConnector")
    display("", "getJsonObjectMap")
    display("", "getJsonRootField")
    display("", "getJsonJoinTable")
    display("", "getJsonRootFieldValue")
    display("", "getJsonRootQuery")
    display("", "getStatu");
    display("", "getJsonAll")
}

var a = new TapApi();
let handlerApi = new HandlerAttributs();
let testfor = false;
let tapButton = [];

var params = {
    tapService: "",
    schema: "",
    table: "",
    shortName: ""
}

var statusf = "failed"
var message = "The service is disconnected ! connect service and try again ..."

function remouveAtive(g) {
   /* if (document.getElementById("" + g).classList.contains('btn-dark')) {
        document.getElementById("" + g).classList.add('btn-success');
        document.getElementById("" + g).classList.remove('btn-dark');
    }*/
}

function removeConnectActive(g) {
    if (document.getElementById("" + g).classList.contains('btn-success')) {
        document.getElementById("" + g).classList.remove('btn-success');
        document.getElementById("" + g).classList.add('btn-secondary');
    }
}

function ConnectActive(a, b) {

    document.getElementById("" + a).classList.remove('btn-secondary');
    document.getElementById("" + a).classList.add('btn-success');
    removeConnectActive(b)
}

function setActive(btnId, g, c, x, v, a) {


    document.getElementById("" + btnId).classList.remove('btn-success');
    document.getElementById("" + btnId).classList.add('btn-dark');
    remouveAtive(g);
    remouveAtive(c);
    remouveAtive(x);
    remouveAtive(v)
    remouveAtive(a)

}
function OnChangeRadio(radio) {
    // alert ("The " + radio.value + " radio is selected.");
    switch (radio.value) {
        case "Simbad":
            if (a.getConnector().status !== 'OK') {
                params.tapService = "http://simbad.u-strasbg.fr/simbad/sim-tap/sync"
                params.schema = Simbadschema;
                params.table = "basic";
                params.shortName = "Simbad";
                display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
            } else {
                display("another service is currently connected ! Disconnect the service an try again", 'getStatu')
            }
            ;
            break;
        case "Gavo":
            if (a.getConnector().status !== 'OK') {
                params.tapService = "http://dc.zah.uni-heidelberg.de/tap/sync"
                params.schema = "rr";
                params.table = "resource";
                params.shortName = "Gavo";
                display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
            } else {
                display("another service is currently connected ! Disconnect the service an try again", "getStatu")
            }
            ;
            break;

        case "Caom":
            if (a.getConnector().status !== 'OK') {
                params.tapService = "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync"
                params.schema = "dbo";
                params.table = "CaomObservation";
                params.shortName = "CAOM";
                display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
            } else {
                display("another service is currently connected ! Disconnect the service an try again", "getStatu")
            }
            ;
            break;
        case "Xmm":
            if (a.getConnector().status !== 'OK') {
                params.tapService = "http://xcatdb.unistra.fr/3xmmdr8/tap/sync"
                params.schema = "EPIC";
                params.table = "EPIC_IMAGE";
                params.shortName = "3XMM";
                //var adql = "SELECT  TOP 1  * FROM EPIC.EPIC_IMAGE "
                display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
            } else {
                display("another service is currently connected ! Disconnect the service an try again", "getStatu")
            }
            ;
            break;

        case "Vizier":
            if (a.getConnector().status !== 'OK') {
                params.tapService = "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync"
                params.schema = "metaviz";
                params.table = "METAcat";
                params.shortName = "Vizier";
                //var adql = "SELECT  TOP 100  * FROM metaviz.METAcat"
                display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
            } else {
                display("another service is currently connected ! Disconnect the service an try again", "getStatu")
            }
            ;
            break;
    }
}
let rootQuery;
function newMain() {

    // initial();
    display("All service are now disconnected, connect one and enjoy it's services", "getStatu")
    let testfor = false;
    let tapButton = [];

    function createButton() {
        let buttons = "";
        let api = a;
        let schema = a.getConnector().service["schema"];
        if (testfor == false) {
            let j = 0;
            let value = ""
            console.log(a.getObjectMapWithAllDescriptions().tables);
            for (let key in a.getObjectMapWithAllDescriptions().tables) {
                value = a.getObjectMapWithAllDescriptions()//.tables[key].constraints
                let formats = schema + '.' + key;
                let correctTables = formats.quotedTableName().qualifiedName;
                buttons = "<span>" + "<button data-toggle=\"modal\" data-target=\"#myModal\" type='button' class=\"btn btn-primary\" " +
                    "id='bbb" + key + "' value='" + key + "' name='Cbuttons' style=\"margin-top: 7px\">" +
                    "Click to select " + key + " constraints</button>" +
                    "<button  type='button' class=\"btn btn-default\" id='" + key + "' value='" + key + "' style=\"margin-top: 7px\">Click to Join " + key + " constraint</button> " +
                    " <input type='text' class='form form-control' id='txt" + key + "' value='' placeholder='Enter condition' name='Cinputs'> <hr>"

                if (testButton == true) {
                    //alert( 'existe deja')
                } else {
                    tapButton.push(buttons);
                }
            }
            $("#loadButton").append(tapButton);
            window.location.hash = "#loadButton";
            testfor = true;


        }
        for (let key in api.tapServiceConnector.objectMapWithAllDescription.tables) {
            // api.tapServiceConnector.selecConstraints(key, "txt" + key, api);
            $("#" + "bbb" + key).click(function () {
                api.tapServiceConnector.selecConstraints(key, "txt" + key, api);
            })
        }

    }
////////////////////////////// API ////////////////////////////////////////////
    $("#d_right").click(function () {
        document.getElementById("light").style.display = "none";
    })

    $("#btnApiConnectS").click(function () {

        if (a.getConnector().status !== "OK") {
            if (params.tapService != "" && params.schema != "" && params.table != "" && params.shortName != "") {
                //console.log(a.connect(params))
                a.connect(params);


                rootQuery = a.getRootQuery()
                //var caomServices = connectDatabase(params.tapService, params.schema, params.shortName, a.query, a.connector.service["table"]);
                let status = a.getConnector().status;
                a.getObjectMapWithAllDescriptions();
                document.getElementById("testContent").style["display"] = "none";
                display(status, "getStatu");
                display( JSON.stringify(a.getConnector().service,undefined,2), "getJsonAll");
                ConnectActive("btnApiConnectS", "btnApiDisconnect")
            } else {
                display("no service selected... Choose service first and try again", "getStatu");

            }
        } else {
            display("the service is  already connected ! disconnect the service and try again ...", "getStatu");

            //alert("the service is  already connected ! disconnect the service and try again ...")
        }


    });

    $("#btnGetConnector").click(function () {
        if (a.getConnector().status === "OK") {

            let connector = JSON.stringify(a.getConnector().service, undefined, 2);
            let status = a.getConnector().status;
            display(status, "getStatu");
            display(connector, "getJsonAll")
            setActive("btnGetConnector", "btnGetObjectMap", "btnGetJoinTable", "btnGetRootField", "btnGetRootFieldValue", "btnGetRootQuery")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            //alert("The service is disconnected ! connect service and try again ..." )
        }
    })

    $("#btnGetRootFieldValue").click(function () {

        if (a.getConnector().status === "OK") {
            createHtmlTable(a.getConnector().service["table"]);
            setActive("btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector", "btnGetRootQuery")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            //alert("The service is disconnected ! connect service and try again ..." )
        }
    })

    var tesTabCRQ = false;
    $("#btnGetRootQuery").click(function () {
        //console.log("rootQuery")
        if (a.getConnector().status === "OK") {
            // JSON.stringify(a.getRootQuery(), undefined, 2);
            tesTabCRQ = true;
           // console.log(rootQuery)
            //rootQuery = a.addConstraint(rootQuery,this.tapJoinConstraint,this.tapWhereConstraint)
            let status = "OK"//a.getRootQueryIds().success.status;
            // rootQuerys=[]
            $("#rootQuery").val(rootQuery);
            display(status, "getStatu");
            display(rootQuery, "getJsonAll")
            setActive("btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector")

        }
    })

    $("#btnGetRootField").click(function () {

        if (a.getConnector().status === "OK") {
            createButton()
            let rootFields = JSON.stringify(a.getRootFields(), undefined, 2);
            let status = a.getRootFields().status;
            display(status, "getStatu");
            display(rootFields, "getJsonAll")
            setActive("btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector", "btnGetRootFieldValue", "btnGetRootQuery")
        } else {

            display(statusf, "getStatu");
            display(message, "getJsonAll")
            // alert("The service is disconnected ! connect service and try again ...")
        }
    })

    $("#btnApiDisconnect").click(function () {

        a.disconnect();


    })

}

/////////////////////////// END API //////////////////////////

/**
 *
 * @param {*} urlPath   the base urlPath of tapService exemple : http://xcatdb.unistra.fr/3xmmdr8/tap/sync
 * @param {*} schema    the schema of database exemple : for Gavo database, schema = "rr"
 * @param {*} shortname the shortname of database like Gavo for gavo database
 * @param {*} adql      the request you want for choosing table. exemble : SELECT TOP 1* FROM rr.resource for gavo
 * @param {*} tableName the name of table in datable like resource table in gavo database
 */
var flag;
let mainFound
let datatables = []
let fields=[];
let QObject="";
function createTableInHtmlTable(table, constraint) {
    let adql = a.setAdql(table, constraint)
    /* let fieldValue =a.getRootFieldValues(adql)
     //var QObject = a.tapService.Query(adql);
     var dataTable = fieldValue.datatable//VOTableTools.votable2Rows(QObject)
     console.log(dataTable)
     //var contentText = QObject.responseText;
     var Field = fieldValue.field*/
     QObject = "";
    if (adql !== undefined) {
        QObject = a.tapServiceConnector.Query(adql);
    }

    //console.log(QObject);
    let dataTable = a.tapServiceConnector.getDataTable(QObject)
    datatables = dataTable
    //let contentText = QObject.responseText;
    let Field = a.tapServiceConnector.getFields(QObject)//VOTableTools.genererField(QObject, contentText)
    let nb = Field.length;
    const regex = /[/,:,.,_,\,',", ,  ,+,-,*," ",]/g;
    const regex2 = /[']/g;
    var out = ""//handlerAttribut(table,Field);"\n"
    out += "<table  class = 'table table-bordered table-striped table-hover' id='mytable1' role = 'grid' >";
    out += "<thead class='thead-dark'><tr  role='row'>"
    for (var j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
    var column = 0;

    //console.log("valeur de la tables ")
   // console.log(dataTable.length)
   // console.log(dataTable)
    for (var j = 0; j < dataTable.length; j++) {//table  content
        //if (dataTable[dataTable.length - 1] == 0) {
            //dataTable.splice(dataTable.length - 1, 1);
       // }

        let jj = j%Field.length
        let tempFound = dataTable[j] + ""
        if (typeof dataTable[j] === "string") {
           // dataTable[j] //= "'" + dataTable[j].replaceAll(regex2,"") + "'"
        }

        let found = tempFound.replaceAll(regex, "");
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr id = 'tr" + j+'_'+table  + found + j+jj + "' data-event='eventA' class = 'odd table-primary' >";
            } else {
                out += "<tr id = 'tr" + j+'_'+table + found + j+jj + "' data-event='eventA' class = 'even table-primary'>";
            }
            if (dataTable.length > 0) {
                out += "<td  id = 'td" + j+'_'+table + found + j+jj + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2" + table + found + j + j + "'style='cursor: pointer'>" + dataTable[j];
                out += "</p></td>";
            } else if(dataTable.length === 0){
                out += "<td  id = 'td" + j+'_'+table + found + j+jj + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2" + table + found + j + j + "'style='cursor: pointer'> No Data Found";

                out += "</p></td>";
            }

        } else {
            out += "<td  id = 'td" + j+'_'+table   + found + j+jj + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2" + table + found + j + j + "'style='cursor: pointer'>" + dataTable[j];
            out += "</p></td>";
            //out += "<td id = 'td" + table + j + found + j + "' style='vertical-align:bottom;cursor: pointer'><p id='content3" + table + j + found + j + "'>" + dataTable[j] + "</p></td>";
        }
        column = column + 1;
        if (column == nb) {
            out += "</tr>";
            column = 0;
        }

    }
    out += "</tbody>"
    out += "</table>  </div>"
    out += "</div>\n" +
        "    </div>\n" +
        "\n" +
        "  </div>\n" +
        "</div>"

  /*  const regexb= /[/,:,.,_,\,',"]/g;
    var api = "";
    var td = $("td");
    let val
    let root = a.getConnector().service["table"]
    let jsonAll = a.tapServiceConnector.loadJson()//.getObjectMapWithAllDescriptions().map[root].join_tables
    let tesl = false;
    let tesl2 = false
    let tableIdTD = [];
    let f = '';
    let ff = "";
    let values = '';
    let f1 = '';
    let ff1 = "";
    let values2 = '';
    let ff2 = '';
    let fieldLenth;
    for (let i = 0; i < dataTable.length; i++) {
        let j = i//-3

        let tempFound = dataTable[j] + ""
        if (typeof dataTable[j] === "string") {
            dataTable[j] = "'" + dataTable[j] + "'"
        }
        //console.log( dataTable[j])

        const found = tempFound.replaceAll(regexb, "");
        tableIdTD.push(td[i])
        tableIdTD = Array.from(new Set(tableIdTD));
        let markup;
        values = ''*/

       // $("#tt").html(out);




            /*for (let k = 0; k < jointab.length; k++) {
                $("#s2" + key + found + j + k).click(function () {
                    let correctTable = $("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim().split(key);
                    // console.log(correctTable)
                    let testTable = correctTable[0].indexOf(jointab[k])?jointab[k]:correctTable[0];
                    // console.log(testTable)*/

            //console.log($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim().endsWith(jointab[k],correctTable.length))
            // console.log($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim() +"==="+k+'\n'+jointab[k])
            /*if (testTable === jointab[k]) {
                f1 += key + found + j + k + 1;
                let out = " <div class=\"tree-nav__item\">"
                let Fields = a.tapServiceConnector.getFields(QObject)
                fieldLenth=j%Fields.length
                console.log("j ="+j+"  fildlent ="+fieldLenth + "  fildd = "+Fields.length)
                constraint = Fields[fieldLenth]+' = '+dataTable[j]
                out +=createTableInHtmlTable(key, constraint);

                //out +=createTableInHtmlTable(jointab[k], dataTable[j]);
                out += "</div>"
                // console.log("teste affichage "+"#cx" + key + found + j + k + found)
                ///console.log(key +" === "+ jointab[k])
                for (let keys in jsonAll) {
                    if (keys === jointab[k]) {
                        // console.log(keys +" === "+ jointab[k])
                        name.find("#cx" + keys + found + j + k + found).html(out)
                        //$(this).html(out);
                    }
                }

            }*/


        /*$("#mytable1 tr td p ").click(function (index) {
            name.find('#tree-nav2' + key + found + j + j).toggle()

        })*/

        // }

        //  });

        // $(this).append("gfjfgfgfffffffffffffffffffff")


    return out //console.log(dataTable)

}

var tableIdTD2 = '';

function handlerAttribut(tableName,Field) {
    let handlerAttributs = a.getTableAttributeHandlers(tableName).attribute_handlers
    let handler = ""
    handler =  "<table  class = ' table table-bordered table-striped table-hover' id='mytable' role = 'grid' >";
    handler += "<thead class='thead-dark'><tr role='row'>"
    for (let j = 0; j < handlerAttributs.length; j++) {
        for (var k = 0; k < Field.length; k++) {
            if (Field[k] === handlerAttributs[j].column_name) {
                handler += "<tr rowspan='1'  colspan='1' class='table-danger' style='text-align:center;vertical-align:bottom'>" +
                    "<td>" + handlerAttributs[j].column_name + "</td>"
                    + "<td>" + handlerAttributs[j].dataType + "</td>"
                    + "<td>" + handlerAttributs[j].description + "</td>";
                +"<td>" + handlerAttributs[j].ucd + "</td></tr>";
            }
        }

    }
    handler += "</tr></thead>";
    handler += "<tbody>"
    console.log(handlerAttributs)
    //$("#getJsonAll").html(handler);
    return handler
}
let constraint;
function createHtmlTable(tableName) {

    var adql = a.getRootQuery();
    let fieldValue =a.getRootFieldValues(adql)
    //var QObject = a.tapService.Query(adql);
    var dataTable = fieldValue.datatable//VOTableTools.votable2Rows(QObject)
    //var contentText = QObject.responseText;
    var Field = fieldValue.field//VOTableTools.genererField(QObject, contentText)
    var nb = Field.length;


    let jointab = a.tapServiceConnector.getJoinTables(a.getConnector().service["table"])
    var out =""//handlerAttribut(tableName,Field);"";
    out += "<table  class = ' table table-bordered table-striped table-hover' id='mytable' role = 'grid' >";
    out += "<thead class='thead-dark'><tr role='row'>"
    for (var j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j]  +"</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
    var column = 0;
   /* if (dataTable[dataTable.length - 1] == 0) {
        dataTable.unshift(dataTable[dataTable.length - 1]);
        dataTable.splice(dataTable.length - 1, 1);
    }*/
    for (var j = 0; j < dataTable.length; j++) {//table  content

        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr class = 'odd table-primary' >"
            } else {
                out += "<tr class = 'even table-primary'>";//+handler+"<br>";;
            }
            if(dataTable.length>0){
                out += "<td id = '" + j + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content" + j + "'style='cursor: pointer'>" + dataTable[j];
                out += "</p></td>";
                }else if(dataTable.length===0) {
                    out += "<td   style='vertical-align:bottom;text-decoration:none;' ><p style='cursor: pointer'> No Data Found";
                    out += "</p></td>";
                }


        } else {
            out += "<td id = '" + j + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content" + j + "'style='cursor: pointer'>" + dataTable[j];
            out += "</p></td>";
            // out += "<p><td style='vertical-align:bottom;cursor: pointer'>" + dataTable[j] + "</td></p>";
        }
        column = column + 1;
        if (column == nb) {
            out += "</tr>";
            column = 0;
        }

    }
    out += "</tbody>"
    out += "</table>  </div>"
    out += "</div>\n" +
        "    </div>\n" +
        "\n" +
        "  </div>\n" +
        "</div>"


    $("#getJsonAll").html(out);


    $(document).ready(function () {
        const regex = /[/,:,.,_,\,'," ," ",  ,&,+,-,]/g;
        var api = "";
        var td = $("td");
        let val
        let root = a.getConnector().service["table"]
        let jsonAll = a.tapServiceConnector.loadJson()//.getObjectMapWithAllDescriptions().map[root].join_tables
        let tesl = false;
        let tesl2 = false
        let tableIdTD = [];
        let f = '';
        let ff = "";
        let values = '';
        let f1 = '';
        let ff1 = "";
        let values2 = '';
        let ff2 = '';
        let fieldLenth;
        for (let i = 0; i < td.length; i++) {
            let j = i//-3

            let tempFound = dataTable[j] + ""
            if (typeof dataTable[j] === "string") {
                dataTable[j] = "'" + dataTable[j] + "'"
            }
            //console.log( dataTable[j])

            const found = tempFound.replaceAll(regex, "");
            tableIdTD.push(td[i])
            tableIdTD = Array.from(new Set(tableIdTD));
            let markup;
            values = ''
            $(td[i]).click(function () {
                //console.log(j);
                var name = $(this)
               // console.log(name)
                let f =name.get()
                //console.log(f[0].getAttribute("id"))
                var i = $(this).attr("id");
               // console.log(i);
                let jointab = a.tapServiceConnector.getJoinTables(a.getConnector().service["table"])
                markup = "";
                markup = "<nav class=\"tree-nav\" id='tree-nav" + j + "'>\n"
                for (let k = 0; k < jointab.length; k++) {


                    markup += "<details class=\"tree-nav__item is-expandable\">" +
                        "   <summary type='button' class=\"tree-nav__item-title\" id='s" + jointab[k] + j + found +f[0].getAttribute("id")+ "'>" + jointab[k] + "</summary>" +
                        " <div class=\"tree-nav__item\">"
                    $('#s' + j + k).click(function () {
                        if (values.indexOf(jointab[k]) === -1) {
                            values += jointab[k];
                        }
                    })
                    for (let key in jsonAll) {
                        if (key == jointab[k]) {
                            markup += "<tr><td> <a class=\"tree-nav__item-title\" id='c" + key + j + found +f[0].getAttribute("id")+ "'></a> </td></tr></table>"
                        }
                    }
                    markup += "</div></details>"
                }
                markup += "</nav>"
                if (tableIdTD.indexOf(td[i]) !== -1) {
                    $(this).append(markup);
                    tableIdTD[i] = ""
                    //console.log(tableIdTD)
                    tesl = true
                }




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                let api3 = $(this)
                for (let key in jsonAll) {
                    //  let val1 =dataTable[j].replaceAll('-',"_");

                    $("#s" + key + j + found+f[0].getAttribute("id")).click(function () {
                        //console.log(j);
                        if (f1.indexOf(key + j + found) === -1) {
                            f1 += key + j + found;
                            let out = " <div class=\"tree-nav__item\">"
                            fieldLenth=j%Field.length
                           // console.log("j ="+j+"  fildlent ="+fieldLenth + "  fildd = "+Field.length)
                             constraint =key!=="otypedef"? Field[fieldLenth]+' = '+dataTable[j]:dataTable[j]
                           // alert(key)
                            if(key==="ObsPointing"){
                                constraint =dataTable[j]
                            }
                            out +=createTableInHtmlTable(key, constraint);
                            out += "</div>"
                            api3.find("#c" + key + j + found+f[0].getAttribute("id")).html(out);
                            let markup2;
                            $(function () {
                               $("#mytable1 tr td").click(function (index) {

                                    var name = $(this)
                                   //name.find('#tree-nav2' + key + found + j + j).toggle()
                                   //console.log(index.currentTarget.getAttribute("id"))
                                    let jointab = a.tapServiceConnector.getJoinTables(key)
                                    for (let u = 0; u < jointab.length; u++) {
                                        if (jointab[u] === root) {
                                            jointab.splice(u, 1)
                                        }
                                    }

                                    markup2 = "";
                                    let apis = $(this)
                                    let verifiedJoinTableAdd='';
                                    markup2 += "<nav class=\"tree-nav\" id='tree-nav2" + key +  +found+ j + j + index.currentTarget.getAttribute("id")+ "'>\n"
                                    for (let k = 0; k < jointab.length; k++) {
                                        markup2 += "<details class=\"tree-nav__item is-expandable\">" +
                                            "   <summary class=\"tree-nav__item-title\" id='s2" + key + found + j + k +index.currentTarget.getAttribute("id")+ "'>" + jointab[k] + "</summary>" +
                                            " <div class=\"tree-nav__item\">"
                                        for (let key in jsonAll) {
                                            if (key === jointab[k]) {
                                               // console.log("id test")
                                               //console.log("cx" + key + found + j + k + found )
                                                verifiedJoinTableAdd+=key
                                                markup2 += "<a class=\"tree-nav__item-title\" id='cx" + key + found + j + k + found+f[0].getAttribute("id") + index.currentTarget.getAttribute("id")+"'></a> "
                                            }
                                        }
                                        markup2 += "</div></details>"
                                    }
                                    markup2 += "</nav>"
                                   // if ($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(regex, "") === found) {
                                     //  $("#" + index.currentTarget.getAttribute("id")).click(function () {

                                            if (tableIdTD2.indexOf(key + j + dataTable[j]+verifiedJoinTableAdd + index.currentTarget.getAttribute("id")) === -1) {
                                                tableIdTD2 += key + j + dataTable[j]+verifiedJoinTableAdd + index.currentTarget.getAttribute("id")
                                                //$("#cx" + key + found + j + k + found +f[0].getAttribute("id")+ index.currentTarget.getAttribute("id")).html(out)

                                                $(this).append(markup2);

                                               // $(this).append(markup2);
                                            }
                                          // markup2="";
                                       //})


                                  //  }


                                    for (let k = 0; k < jointab.length; k++) {
                                        $("#s2" + key + found + j + k+index.currentTarget.getAttribute("id")).click(function () {
                                            let correctTable = $("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim().split(key);
                                            //console.log("correctTable"+index.currentTarget.getAttribute("id"))
                                            let testTable = correctTable[0].indexOf(jointab[k])?jointab[k]:correctTable[0];
                                           // console.log(testTable)

                                            //console.log($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim().endsWith(jointab[k],correctTable.length))
                                           // console.log($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim() +"==="+k+'\n'+jointab[k])
                                            if (testTable === jointab[k]) {
                                                f1 += key + found + j + k + 1;
                                                let out = " <div class=\"tree-nav__item\">"
                                               // let Fields = a.tapServiceConnector.getFields(QObject)
                                               // fieldLenth=j%Fields.length
                                                //console.log("j ="+j+"  fildlent ="+fieldLenth + "  fildd = "+Fields.length)
                                               // constraint = Fields[fieldLenth]+' = '+dataTable[j]
                                                out +=createTableInHtmlTable(jointab[k], dataTable[j]);

                                                //out +=createTableInHtmlTable(jointab[k], dataTable[j]);
                                                out += "</div>"
                                                //console.log(out)
                                                ///console.log(key +" === "+ jointab[k])
                                                markup2="";
                                                for (let keys in jsonAll) {
                                                    if (keys === jointab[k]) {
                                                       // console.log(keys +" === "+ jointab[k])
                                                        //if($("#cx" + keys + found + j + k + found + index.currentTarget.getAttribute("id")).text().indexOf(jointab[k])!==-1){
                                                            $("#cx" + keys + found + j + k + found +f[0].getAttribute("id")+ index.currentTarget.getAttribute("id")).html(out)
                                                       // }

                                                            //$(this).html(out);
                                                        //console.log("#cx" + keys + found + j + k + found +f[0].getAttribute("id")+ index.currentTarget.getAttribute("id"))


                                                    }
                                                }

                                            }

                                        })


                                    }
                                   //'content2" + table + found + j + j +
                                   $("#" + index.currentTarget.getAttribute("id")).click(function (index) {
                                       $('#tree-nav2' + key + found + j + j+ index.currentTarget.getAttribute("id")).toggle()

                                   })

                                });

                            });

                        }
                    })


                }
            });
            let api = $(this);


            $(this).find("#content" + j).click(function () {
                //console.log('#tree-nav' + j)
                api.find('#tree-nav' + j).toggle()
                api.find('#tree-nav2' + j+ j + j).toggle()

            })


        }

    });

}
