document.write("<script type='text/javascript' src= '../../module/js/json2Requete.js'></script>");

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
    if (document.getElementById("" + g).classList.contains('btn-dark')) {
        document.getElementById("" + g).classList.add('btn-success');
        document.getElementById("" + g).classList.remove('btn-dark');
    }
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
            if (a.testConnection == false) {
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
            if (a.testConnection == false) {
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
            if (a.testConnection == false) {
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
            if (a.testConnection == false) {
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
            if (a.testConnection == false) {
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

function newMain() {

    // initial();

////////////////////////////// API ////////////////////////////////////////////
    $("#d_right").click(function () {
        document.getElementById("light").style.display = "none";
    })

    $("#btnApiConnectS").click(function () {
        if (a.testConnection == false) {
            if (params.tapService != "" && params.schema != "" && params.table != "" && params.shortName != "") {
                let connect = a.connect(params);  //  var caomServices = connectDatabase(params.tapService, params.schema, params.shortName, a.query, a.connector.service["table"]);
                let status = a.connector.status;
                a.getObjectMapWithAllDescriptions();
                let connector = JSON.stringify(a.getConnector().service, undefined, 2);
                // let status = a.getConnector().status;
                display(connector, "getJsonAll")
                document.getElementById("testContent").style["display"] = "none";
                display(status, "getStatu");
                ConnectActive("btnApiConnectS", "btnApiDisconnect")
            } else {
                display("no service selected... Choose service first and try again", "getStatu");

            }
        } else {
            display("the service is  already connected ! disconnect the service and try again ...", "getStatu");

        }


    });

    $("#btnGetConnector").click(function () {
        if (a.testConnection == true) {

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
        if (a.testConnection == true) {
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
        if (a.testConnection == true) {
            let rootQuery;
            rootQuery = a.getRootQuery() // JSON.stringify(a.getRootQuery(), undefined, 2);
            tesTabCRQ = true;
            //rootQuery = a.addConstraint(rootQuery,this.tapJoinConstraint,this.tapWhereConstraint)
            let status = "OK"//a.getRootQueryIds().success.status;
            // rootQuerys=[]
            $("#rootQuery").val(rootQuery);
            display(status, "getStatu");
            display(rootQuery, "getJsonAll")
            setActive("btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector")

        }
    })

    $("#btnApiDisconnect").click(function () {
        $(document).ajaxStop(function () {
            window.location.reload();
        });
        if (a.testConnection == true) {
            a.disconnect();

            if (a.testDeconnection == false) {
                a.disconnect();
                reset();
                display("The service is now disconnected", "getStatu")

                ConnectActive("btnApiDisconnect", "btnApiConnectS")
                document.getElementById("testContent").style["display"] = "none";
            }
            a.testDeconnection = false;
        } else {
            display("The service are already disconnected", "getStatu");
        }

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

function createTableInHtmlTable(table, constraint) {
    let adql = a.setConnector(table, constraint)
   /* let fieldValue =a.getRootFieldValues(adql)
    //var QObject = a.tapService.Query(adql);
    var dataTable = fieldValue.datatable//VOTableTools.votable2Rows(QObject)
    console.log(dataTable)
    //var contentText = QObject.responseText;
    var Field = fieldValue.field*/
    let QObject = "";
    if (adql !== undefined) {
        QObject = a.correctService.Query(adql);
    }

    console.log(QObject);

    let dataTable = VOTableTools.votable2Rows(QObject)
    datatables = dataTable
    let contentText = QObject.responseText;
    let Field = VOTableTools.genererField(QObject, contentText)
    let nb = Field.length;
    const regex = /[/,:,.,_,\,',"]/g;
    var out = "\n"
    out += "<table  class = 'table table-bordered table-striped table-hover' id='mytable1' role = 'grid' >";
    out += "<thead class='thead-dark'><tr  role='row'>"
    for (var j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
    var column = 0;
    for (var j = 0; j < dataTable.length; j++) {//table  content
        if (dataTable[dataTable.length - 1] == 0) {
            dataTable.splice(dataTable.length - 1, 1);
        }
        let tempFound = dataTable[j] + ""
        if (typeof dataTable[j] === "string") {
            dataTable[j] = "'" + dataTable[j] + "'"
        }
        let found = tempFound.replaceAll(regex, "");
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr id = 'tr" + table + j + found + j + "' data-event='eventA' class = 'odd table-primary' >";
            } else {
                out += "<tr id = 'tr" + table + j + found + j + "' data-event='eventA' class = 'even table-primary'>";
            }
            if (dataTable.length !== 0) {
                out += "<td  id = 'td" + table + j + found + j + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2" + table + found + j + j + "'style='cursor: pointer'>" + dataTable[j];
                out += "</p></td>";
            } else {
                out += "<td  id = 'td" + table + j + found + j + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2" + table + found + j + j + "'style='cursor: pointer'> No Data Found";

                out += "</p></td>";
            }

        } else {
            out += "<td id = 'td" + table + j + found + j + "' style='vertical-align:bottom;cursor: pointer'><p id='content3" + table + j + found + j + "'>" + dataTable[j] + "</p></td>";
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


    return out //console.log(dataTable)

}

var tableIdTD2 = '';

function createHtmlTable(tableName) {
    var name = tableName //b[ii].id.slice(1);//the name of
    var schema = a.connector.service["schema"];
    // alert(name +' '+schema);
    var adql = a.getRootQuery();
    let fieldValue =a.getRootFieldValues(adql)
    //var QObject = a.tapService.Query(adql);
    var dataTable = fieldValue.datatable//VOTableTools.votable2Rows(QObject)
    //var contentText = QObject.responseText;
    var Field = fieldValue.field//VOTableTools.genererField(QObject, contentText)
    var nb = Field.length;
    let jointab = a.correctService.getJoinTables(a.getConnector().service["table"])
    var out = "\n"
    out += "<table  class = 'clickable-table  table table-bordered table-striped table-hover' id='mytable' role = 'grid' >";
    out += "<thead class='thead-dark'><tr role='row'>"
    for (var j = 0; j < nb; j++) {
        out += "<th rowspan='1'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "</th>";
    }
    out += "</tr></thead>";
    out += "<tbody>"
    var column = 0;
    if (dataTable[dataTable.length - 1] == 0) {
        dataTable.unshift(dataTable[dataTable.length - 1]);
        dataTable.splice(dataTable.length - 1, 1);
    }
    for (var j = 0; j < dataTable.length; j++) {//table  content

        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr class = 'odd table-primary' >";
            } else {
                out += "<tr class = 'even table-primary'>";
            }
            out += "<td id = '" + j + "' style='vertical-align:bottom;text-decoration:none;' ><p id='content" + j + "'style='cursor: pointer'>" + dataTable[j];
            out += "</p></td>";

        } else {
            out += "<p><td style='vertical-align:bottom;cursor: pointer'>" + dataTable[j] + "</td></p>";
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
        const regex = /[/,:,.,_,\,',"]/g;
        var api = "";
        var td = $("td");
        let val
        let root = a.getConnector().service["table"]
        let jsonAll = a.correctService.loadJson()//.getObjectMapWithAllDescriptions().map[root].join_tables
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
        for (let i = 0; i < td.length; i++) {
            let j = i
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

                var i = $(this).attr("id");
                let jointab = a.correctService.getJoinTables(a.getConnector().service["table"])
                markup = "<div id=\"overlay\">\n" +
                    "    <div class=\"cv-spinner\">\n" +
                    "        <span class=\"spinner\"></span>\n" +
                    "    </div>\n" +
                    "</div>\n"
                markup = "<nav class=\"tree-nav\" id='tree-nav" + j + "'>\n"
                for (let k = 0; k < jointab.length; k++) {


                    markup += "<details class=\"tree-nav__item is-expandable\">" +
                        "   <summary type='button' class=\"tree-nav__item-title\" id='s" + jointab[k] + j + found + "'>" + jointab[k] + "</summary>" +
                        " <div class=\"tree-nav__item\">"
                    $('#s' + j + k).click(function () {
                        if (values.indexOf(jointab[k]) === -1) {
                            values += jointab[k];
                        }
                    })
                    for (let key in jsonAll) {
                        if (key == jointab[k]) {
                            markup += "<tr><td> <a class=\"tree-nav__item-title\" id='c" + key + j + found + "'></a> </td></tr></table>"
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

                    $("#s" + key + j + found).click(function () {
                        // console.log(id);
                        if (f1.indexOf(key + j + found) === -1) {
                            f1 += key + j + found;
                            let out = " <div class=\"tree-nav__item\">"
                            out += createTableInHtmlTable(key, dataTable[j]);
                            out += "</div>"
                            api3.find("#c" + key + j + found).html(out);
                            $(function () {
                                $("#mytable1 tr td").click(function (index) {
                                    var name = $(this)
                                    let jointab = a.correctService.getJoinTables(key)
                                    for (let u = 0; u < jointab.length; u++) {
                                        if (jointab[u] === root) {
                                            jointab.splice(u, 1)
                                        }
                                    }
                                    let markup2;
                                    markup2 = " ";
                                    let apis = $(this)
                                    markup2 += "<nav class=\"tree-nav\" id='tree-nav2" + key + j + j + j + "'>\n"
                                    for (let k = 0; k < jointab.length; k++) {
                                        markup2 += "<details class=\"tree-nav__item is-expandable\">" +
                                            "   <summary class=\"tree-nav__item-title\" id='s2" + key + found + j + k + "'>" + jointab[k] + "</summary>" +
                                            " <div class=\"tree-nav__item\">"
                                        for (let key in jsonAll) {
                                            if (key === jointab[k]) {
                                                markup2 += "<a class=\"tree-nav__item-title\" id='cx" + key + found + j + k + found + "'></a> "
                                            }
                                        }
                                        markup2 += "</div></details>"
                                    }
                                    markup2 += "</nav>"
                                    if ($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(regex, "") == found) {
                                        $("#" + index.currentTarget.getAttribute("id")).click(function () {
                                            if (tableIdTD2.indexOf(key + j + dataTable[j] + index.currentTarget.getAttribute("id")) === -1) {
                                                tableIdTD2 += key + j + dataTable[j] + index.currentTarget.getAttribute("id")
                                                $(this).append(markup2);
                                            }
                                        })

                                    }

                                    for (let k = 0; k < jointab.length; k++) {
                                        $("#s2" + key + found + j + k).click(function () {
                                            if ($("#" + index.currentTarget.getAttribute("id")).text().replaceAll(j, "").trim() === jointab[k]) {
                                                f1 += key + found + j + k + 1;
                                                let out = " <div class=\"tree-nav__item\">"
                                                out += createTableInHtmlTable(jointab[k], dataTable[j]);
                                                out += "</div>"
                                                for (let key in jsonAll) {
                                                    if (key === jointab[k]) {
                                                        name.find("#cx" + key + found + j + k + found).html(out)
                                                    }
                                                }

                                            }

                                        })
                                        $("#mytable1 tr td p ").click(function (index) {
                                             name.find('#tree-nav2' + key + found + j + j).toggle()

                                        })

                                    }

                                });

                            });

                        }
                    })


                }
            });
            let api = $(this);
            $(this).find("#content" + j).click(function () {
                console.log('#tree-nav' + j)
                api.find('#tree-nav' + j).toggle()
                api.find('#tree-nav2' + j + j + j).toggle()

            })


        }

    });

}
