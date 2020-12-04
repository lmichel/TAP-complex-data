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

function createButton() {
    let buttons = "";
    let api = a;
    let schema = a.getConnector().service["schema"];
    if (testfor == false) {
        let j = 0;

        // for (let i = 0; i < table.length; i++) {
        let value = ""
        for (let key in a.getObjectMapWithAllDescriptions().tables) {
            value = a.getObjectMapWithAllDescriptions()//.tables[key].constraints
            let formats = schema + '.' + key;
            let correctTables = formats.quotedTableName().qualifiedName;
            buttons = "<span>" + "<button data-toggle=\"modal\" data-target=\"#myModal\" type='button' class=\"btn btn-primary\" id='bbb" + key + "' value='" + key + "' name='Cbuttons' style=\"margin-top: 7px\">Click to select " + key + " constraints</button>" +
                "<button  type='button' class=\"btn btn-default\" id='" + key + "' value='" + key + "' style=\"margin-top: 7px\">Click to Join " + key + " constraint</button> " +
                " <input type='text' class='form form-control' id='txt" + key + "' value='' placeholder='Enter condition' name='Cinputs'> <hr>"

            //this.jsonAdqlContent.constraint["condition " + correctTables]
            // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

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
    for (let key in api.handlerAttribut.objectMapWithAllDescription.tables) {
        // api.correctService.selecConstraints(key, "txt" + key, api);
        $("#" + "bbb" + key).click(function () {

            api.correctService.selecConstraints(key, "txt" + key, api);

            //document.getElementById('light').style.display = 'block';
        })
    }

}

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
        // alert(a.testConnection);

        if (a.testConnection == false) {
            if (params.tapService != "" && params.schema != "" && params.table != "" && params.shortName != "") {
                a.connect(params);
                //  var caomServices = connectDatabase(params.tapService, params.schema, params.shortName, a.query, a.connector.service["table"]);
                let status = a.connector.status;
                //alert("you are now connected")
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

            //alert("the service is  already connected ! disconnect the service and try again ...")
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

    $("#btnGetObjectMap").click(function () {
        if (a.testConnection == true) {
            let objectMap = JSON.stringify(a.getObjectMap(), undefined, 2);
            let status = a.getObjectMap().succes.status;
            display(status, "getStatu");
            display(objectMap, "getJsonAll")
            a.joinTable("basic");
            alert($("#btnGetObjectMap").val())
            setActive("btnGetObjectMap", "btnGetConnector", "btnGetJoinTable", "btnGetRootField", "btnGetRootFieldValue", "btnGetRootQuery")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            // alert("The service is disconnected ! connect service and try again ..." )
        }
    })
    /*
        $("#btnGetObjectMap2").click(function () {
            if (a.testConnection == true) {
                /* let objectMap = JSON.stringify(a.getObjectMap(), undefined, 2);
                 let status = a.getObjectMap().succes.status;
                 display(status, "getStatu");
                 display(objectMap, "getJsonAll")
                 a.joinTable("basic");
                 alert($("#btnGetObjectMap").val())
                 setActive("btnGetObjectMap", "btnGetConnector", "btnGetJoinTable", "btnGetRootField", "btnGetRootFieldValue", "btnGetRootQuery")*/

    /*    display('ok', "getStatu");
        display(JSON.stringify(a.getObjectMapWithAllDescriptions(), undefined, 2), "getJsonAll")
    } else {
        display(statusf, "getStatu");
        display(message, "getJsonAll")
        // alert("The service is disconnected ! connect service and try again ..." )
    }
})*/


    /* $("#btnGetJoinTable").click(function () {
         if (a.testConnection == true) {

             let joinTables = JSON.stringify(a.getJoinedTables(params.table).Succes, undefined, 2);
             let status = a.getJoinedTables(params.table).Succes.status;
             display(status, "getStatu");
             display(joinTables, "getJsonAll")
             setActive("btnGetJoinTable", "btnGetObjectMap", "btnGetConnector", "btnGetRootField", "btnGetRootFieldValue", "btnGetRootQuery")
         } else {
             display(statusf, "getStatu");
             display(message, "getJsonAll")
             //alert("The service is disconnected ! connect service and try again ..." )
         }
     })
     $("#btnGetRootField").click(function () {
         if (a.testConnection == true) {

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
     })*/

    $("#btnGetRootFieldValue").click(function () {
        if (a.testConnection == true) {

            let rootFieldValues = JSON.stringify(a.getRootFieldValues().succes, undefined, 3);
            let status = a.getRootFieldValues().succes.status;
            display(status, "getStatu");
            display(rootFieldValues, "getJsonAll")
            createHtmlTable(a.getConnector().service["table"]);
            setActive("btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector", "btnGetRootQuery")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            //alert("The service is disconnected ! connect service and try again ..." )
        }
    })
    $("#btnRemoveAllConstraint").click(function () {
        let rootq = a.resetAll()
        alert(rootq.status.status);
        var statu = rootq.status.status != "" ? rootq.status.status : "NO constraint yet"
        display(statu, "getStatu");
        //$("#getJsonAll").text("Constraint removed successful");
        if (rootq.status.orderErros != "") {

            display("" + JSON.stringify(rootq.status, undefined, 2), "getJsonAll")
        } else {
            statu = rootq.status.status != "" ? rootq.status.status : "Failed"
            display("{ status : " + JSON.stringify(statu, undefined, 2) + " }", "getJsonAll")
        }
    });
    var temp = '';
    var isCallRootQuery = false;
    var tabContainRemoveQuery = []
    var tesTabCRQ = false;
    let testRemoveButton = false;

    $("#btnGetRootQuery").click(function () {

        if (a.testConnection == true) {
            let rootQuery;
            ;
            rootQuery = a.getRootQuery() // JSON.stringify(a.getRootQuery(), undefined, 2);


            tesTabCRQ = true;
            //rootQuery = a.addConstraint(rootQuery,this.tapJoinConstraint,this.tapWhereConstraint)
            let status = "OK"//a.getRootQueryIds().success.status;
            // rootQuerys=[]
            $("#rootQuery").val(rootQuery);
            display(status, "getStatu");
            display(rootQuery, "getJsonAll")
            //a.resetTableConstraint("otypes");

            setActive("btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector")
            //document.getElementById("btnConstraint").style.display = "block";

            // document.getElementById("btnRemoveConstraint").style.display = "block";

            /*let table

            $("#btnRemoveConstraint").click(function () {
                document.getElementById("loadRemoveButton").style.display = "block"

                var HtmlRemoveBtn = "";

                table = Array.from(new Set(tabContaninBtnRemoveConstraint));
                console.log(table.length);


                var k = 0;


                // var t = table[i];
                HtmlRemoveBtn += " <button  type='button' class=\"btn btn-danger\" id='rbtnConstraint' value='" + table[i] + "' style=\"margin-top: 7px\">Remove Join Table</button>" +
                    "<input type='text' class='form form-control' id='txtConstraint' value= '' placeholder='name of table : exp,otypes'>"
                // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

                if (testRemoveButton == true) {
                    //alert( 'existe deja')
                } else {
                    HtmltabContaninBtnRemoveConstraint.push(HtmlRemoveBtn);
                }
                HtmltabContaninBtnRemoveConstraint = Array.from(new Set(HtmltabContaninBtnRemoveConstraint));
                //$("#loadRemoveButton").html("");
                $("#loadRemoveButton").html(HtmlRemoveBtn);
                window.location.hash = "#loadRemoveButton";

                $("#rbtnConstraint").click(function () {

                    for (let i = 0; i < table.length; i++) {
                        if ($("#txtConstraint").val() == "") {
                            display("Failed", "getStatu");
                            display("Inter the name of table you want ton remove constraint", "getJsonAll")

                            //document.getElementById("loadRemoveButton").style.display = "block"
                        } else if ($("#txtConstraint").val() == table[i]) {
                            let rootq = a.resetTableConstraint(table[i])
                            display(rootq.status.status, "getStatu");
                            //$("#getJsonAll").text("Constraint removed successful");
                            if (rootq.status.orderErros != "") {

                                display("" + JSON.stringify(rootq.status, undefined, 2), "getJsonAll")
                            } else {

                                display("{ status : " + JSON.stringify(rootq.status.status, undefined, 2) + " }", "getJsonAll")
                            }


                            // display("{status : ok}", "getJsonAll")

                            //document.getElementById("loadRemoveButton").style.display = "none"
                        } else {
                            //display("Failed", "getStatu");
                            // display("Inter the name of table you want ton remove constraint", "getJsonAll")

                        }
                        // display( "getJsonAll")

                    }


                    /* tabContaninBtnRemoveConstraint.splice(table.indexOf(tabContaninBtnRemoveConstraint.indexOf(tabContaninBtnRemoveConstraint[i]),1));
                     console.log(tabContaninBtnRemoveConstraint)
                     $("#loadRemoveButton").html("");
                     window.location.hash = "#loadRemoveButton";
                     document.getElementById("loadRemoveButton").style.display = "none";*/
            /*  })


              testRemoveButton = true;
              setActive("btnRemoveConstraint", "btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap")

          })
          $("#btnConstraint").click(function () {
              //console.log(a.getTableAttributeHandlers("basic"));
              // let rootQuer= addConstraint(rootQuery,a.tapJoinConstraint);

              // createButton();

              document.getElementById("loadButton").style.display = "block"


              setActive("btnConstraint", "btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap")
          })
      } else {
          display(statusf, "getStatu");
          display(message, "getJsonAll")
          //alert("The service is disconnected ! connect service and try again ..." )
      }*/
        }
    })

    /*

        $("#btnGetRootQueryId").click(function () {
            if (a.testConnection == true) {
                let rootValue = JSON.stringify(a.getRootQueryIds().succes, undefined, 3);
                let status = a.getRootQueryIds().succes.status;
                display(status, "getStatu");
                display(rootValue, "getJsonAll")
                setActive("btnGetRootQueryId", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector")
            } else {
                display(statusf, "getStatu");
                display(message, "getJsonAll")
                //alert("The service is disconnected ! connect service and try again ..." )
            }
        })*/


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
/*  var rootQuerys = []

  function addConstraint(rootQuery, table) {
      var buttons = "";
      var tapButton = [];

      for (let i = 0; i < table.length; i++) {

          buttons = "<button  type='button' class=\"btn btn-default\" id='" + table[i][0] + "' value='" + table[i][0] + "' style=\"margin-top: 7px\">Join '" + table[i][0] + "'</button>"
          // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

          tapButton.push(buttons);
          $("#loadButton").append(tapButton[i]);
          window.location.hash = "#loadButton";
          $("#" + table[i][0]).click(function () {


              if (rootQuerys.indexOf(rootQuerys[i]) > -1) {
                  alert('existe deja')
              } else {
                  rootQuerys.push(table[i][1]);
                  rootQuery += " " + table[i][1];


                  $("#getJsonAll").text(rootQuery);
                  $("#getJsonAll").html(rootQuery);
                  window.location.hash = "#loadJson";
                  //display(rootQuery,"getJsonAll")

                  // alert("join value "+table[i][1])
              }


          })


      }

      // console.log(tapButton);
      return rootQuery;
  }*/


function showLoader() {
    var head = document.getElementsByTagName('HEAD')[0];

    // Create new link Element
    var link = document.createElement('link');

    // set the attributes for link element
    link.rel = 'stylesheet';

    link.type = 'text/css';

    link.href = 'css/main.css';

    // Append link element to HTML head
    head.appendChild(link);
    $("head").append('<script type="text/javascript" src="js/vendor/modernizr-2.6.2.min.js""></script>');
}

/**
 *
 * @param {*} urlPath   the base urlPath of tapService exemple : http://xcatdb.unistra.fr/3xmmdr8/tap/sync
 * @param {*} schema    the schema of database exemple : for Gavo database, schema = "rr"
 * @param {*} shortname the shortname of database like Gavo for gavo database
 * @param {*} adql      the request you want for choosing table. exemble : SELECT TOP 1* FROM rr.resource for gavo
 * @param {*} tableName the name of table in datable like resource table in gavo database
 */
var flag;

function createTableInHtmlTable(table,constraint) {
    //let root = a.getConnector().service["table"]

    let adql = a.setConnector(table, constraint)
    console.log(adql);
    let QObject = a.tapService.Query(adql);
    let dataTable = VOTableTools.votable2Rows(QObject)
    let contentText = QObject.responseText;
    let Field = VOTableTools.genererField(QObject, contentText)
    let nb = Field.length;
   // var schema = a.connector.service["schema"];

   // let jsonAll = a.correctService.getJoinTables(table)
    //let jointab = a.correctService.getJoinTables(a.getConnector().service["table"])

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
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out += "<tr data-event='eventA' class = 'odd table-primary' >";
            } else {
                out += "<tr data-event='eventA' class = 'even table-primary'>";
            }
            if(dataTable.length!==0){
                out += "<td data-event='eventA' id = 'td" +table+ j + dataTable[j] + j+ "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2"+table +j+ j + j+ "'style='cursor: pointer'>" + dataTable[j];
                out += "</p></td>";
            }else {
                out += "<td data-event='eventA' id = 'td" +table+ j + dataTable[j] + j+ "' style='vertical-align:bottom;text-decoration:none;' ><p id='content2"+table + j+ j + j+ "'style='cursor: pointer'> No Data Found";
                out += "</p></td>";
            }
            
        } else {
            out += "<p id='content2"+table + j+ j + j+ "'><td id = 'td" +table+ j + dataTable[j] + j+ "' data-event='eventA' style='vertical-align:bottom;cursor: pointer'>" + dataTable[j] + "</td></p>";
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
        "</div>"/*
let markup = "";
    for (let key =0;key<jsonAll.length; key++) {

            markup += "<table class='table  table-dark' id='secondTable'> <tr><td ><a class=\"tree-nav__item-title\" id='c" + key  + "'><i class=\"fa fa-key\"></i>" + jsonAll[key] + "</a></td></tr>" +
                "<tr><td> <a class=\"tree-nav__item-title\" id='c" + key + j + "'><i class=\"fa fa-key\"></i>" + jsonAll[key] + "</a> </td></tr></table>"

    }*/





    return out //console.log(dataTable)

}

var tableIdTD2 = '';
function createHtmlTable(tableName) {
    var name = tableName //b[ii].id.slice(1);//the name of
    var schema = a.connector.service["schema"];
    // alert(name +' '+schema);
    var adql = a.getRootQuery();
    var QObject = a.tapService.Query(adql);
    var dataTable = VOTableTools.votable2Rows(QObject)
    var contentText = QObject.responseText;
    var Field = VOTableTools.genererField(QObject, contentText)
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
       // let temp = dataTable[dataTable.length - 1];
        //dataTable[0] = temp;
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
            out += "<td id = '" + j+ "' style='vertical-align:bottom;text-decoration:none;' ><p id='content"+j+"'style='cursor: pointer'>" + dataTable[j];
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


    // Add remove loading class on body element depending on Ajax request status

    //let schema = this.connector.service["schema"];
    $(document).ready(function () {

        var api ="";
        var  td = $("td");
        //console.log(td)
        //console.log(td.length)
        let val
        let root = a.getConnector().service["table"]
        let jsonAll = a.getObjectMapWithAllDescriptions().map[root].join_tables
        let tesl = false;
        let tesl2 = false
        let tableIdTD = [];
        let tableIndex = []

        //tableIdTD=td;

        //
        let f = '';
        let ff = "";let values=''; let f1 = '';
        let ff1 = "";let values2=''
        for (let i = 0; i < td.length; i++) {
            let j = i
            tableIdTD.push(td[i])
            tableIdTD = Array.from(new Set(tableIdTD));
            let markup;
            values=''
            $(td[i]).click(function () {


                var i = $(this).attr("id");
                let jointab = a.correctService.getJoinTables(a.getConnector().service["table"])
                markup = "<div id=\"overlay\">\n" +
                    "    <div class=\"cv-spinner\">\n" +
                    "        <span class=\"spinner\"></span>\n" +
                    "    </div>\n" +
                    "</div>\n"
                markup = "<nav class=\"tree-nav\" id='tree-nav"+j+"'>\n"
                for (let k = 0; k < jointab.length; k++) {
                    markup += "<details class=\"tree-nav__item is-expandable\">" +
                        "   <summary type='button' class=\"tree-nav__item-title\" id='s"+jointab[k]+j+dataTable[j]+"'>" + jointab[k] + "</summary>" +
                        " <div class=\"tree-nav__item\">"

                    $('#s'+j+k).click(function (){
                        if(values.indexOf(jointab[k])===-1){
                            values+=jointab[k];
                           // console.log(jointab[k]);

                            //markup+= createTableInHtmlTable(jointab[k]);
                        }
                    })
                    for (let key in jsonAll) {
                        if (key == jointab[k]) {
                           // let val =dataTable[j].replaceAll('-',"_");
                               markup+= "<tr><td> <a class=\"tree-nav__item-title\" id='c" + key + j+dataTable[j] + "'><i class=\"fa fa-key\"></i> </a> </td></tr></table>"
                        }
                    }
                    markup +="</div></details>"
                }
                markup += "</nav>"
                //let markup = "<table class='table record table-striped table-bordered' id='secondTable'><th style='cursor: pointer'>join table of " + a.getConnector().service["table"] + "</th><tbody>";


                //markup += "</tbody></table>"*/
                // $(this).html(markup);
                if (tableIdTD.indexOf(td[i]) !== -1) {
                    $(this).append(markup);
                    tableIdTD[i] = ""
                    //console.log(tableIdTD)
                    tesl = true
                }




///////////////////////////////////////////////////////////////////////////////////////////////
                let api3 =$(this)
                for (let key in jsonAll) {
                  //  let val1 =dataTable[j].replaceAll('-',"_");

                    $("#s" + key + j+dataTable[j]).click(function () {
                        // console.log(id);
                        if (f1.indexOf(key+j+dataTable[j]) === -1) {
                            f1 += key+j+dataTable[j];
                            let out =" <div class=\"tree-nav__item\">"
                                out += createTableInHtmlTable(key,dataTable[j]);
                            //console.log(out);

                            out +="</div>"
                            api3.find("#c" + key + j+dataTable[j]).html(out);

                           // $("#mytable1 tr td").html(out);

                            $(function(){
                                $( "#mytable1 tr td" ).click(function(index) {

                                    var name = $(this).find('td:eq(0)').html;
                                   // console.log(index.currentTarget.getAttribute("id"));
                                   // tableIdTD =""
                                    let jointab = a.correctService.getJoinTables(key)
                                    let markup2 = ""
                                    markup2 = " ";
                                    markup2 += "<nav class=\"tree-nav\" id='tree-nav2"+key + j + j+ j+ "'>\n"
                                    for (let k = 0; k < jointab.length; k++) {
                                        markup2 += "<details class=\"tree-nav__item is-expandable\">" +
                                            "   <summary class=\"tree-nav__item-title\" id='s2" + j + k + "'>" + jointab[k] + "</summary>" +
                                            " <div class=\"tree-nav__item\">"
                                        for (let key in jsonAll) {
                                            if (key == jointab[k]) {
                                                markup2 += "<a class=\"tree-nav__item-title\" id='c2" + key + j + 1 + "'><i class=\"fa fa-key\"></i>" + jsonAll[key].from + "</a> "
                                            }
                                        }
                                        markup2 += "</div></details>"
                                    }
                                    markup2 += "</nav>"


                                        //tableIdTD2 = Array.from(new Set(tableIdTD2))
                                        if($("#"+index.currentTarget.getAttribute("id")).text()==dataTable[j]) {
                                            $("#"+index.currentTarget.getAttribute("id")).click(function (){
                                                if (tableIdTD2.indexOf(key+j+dataTable[j]+index.currentTarget.getAttribute("id"))===-1) {
                                                    tableIdTD2 += key + j + dataTable[j] + index.currentTarget.getAttribute("id")
                                                    $(this).append(markup2);
                                                }
                                            })

                                       // $(this).parent().last().add(this);
                                        //console.log(tableIdTD2)
                                    }
                                    $(this).find('#tree-nav2'+key + j+ j+ j).toggle()
                                    let api2 = $(this);
                                    $(this).find("#content2"+key + dataTable[j]+ j+ j).click(function () {
                                       // console.log('#tree-nav2'+key+ j+j+j)

                                        api2.find('#tree-nav2'+key + j+ j+ j).toggle()
                                        //console.log("tableIdTD")
                                        // api.find("#tree-nav").toggle();
                                    })
                                });

                            });



                          /*  for (let i = 0; i < tds.length; i++) {
                                let j = i
                                tableIdTD.push(tds[i])
                                tableIdTD = Array.from(new Set(tableIdTD));

                                // values2 = ''

                                $("#td"+j + j + j).click(function () {

                                    var i = $(this).attr("id");



                                });
                                let  api = $(this);
                                $(this).find("#content2" + j).click(function () {
                                    console.log('#tree-nav2' + j)
                                    api.find('#tree-nav2' + j).toggle()

                                    // api.find("#tree-nav").toggle();
                                })



                            }*/





                        }
                    })


                }
            });
            let api = $(this);
            $(this).find("#content"+j).click(function (){
                console.log('#tree-nav'+j)
                api.find('#tree-nav'+j).toggle()
                api.find('#tree-nav2'+j+j+j).toggle()

               // api.find("#tree-nav").toggle();
            })



            /* let td = $("td");
             for (let i = 0; i < td.length; i++) {
                 $(td[i]).click(function () {
                     let i = $(this).attr("id");
                     alert($(td[i]).text())
                 })
             }*/

            //$('.record td').toggle()
            //
            /* if(document.getElementById('secondTable').style.display==="none"){
                 document.getElementById('secondTable').style.display="block"
             }else {
                 document.getElementById('secondTable').style.display="none";
             }*/
            // generate_table(td[i]);
            //alert(i + " is added to constraint")
            /* $("button").click(function(){
                 $("p").toggle();
             });*/

            // });


        }

    });

}


function generate_table(id) {
    // get the reference for the body
    var body = document.getElementsByTagName("body")[0];

    // creates a <table> element and a <tbody> element
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");

    // creating all cells
    for (var i = 0; i < 2; i++) {
        // creates a table row
        var row = document.createElement("tr");

        for (var j = 0; j < 2; j++) {
            // Create a <td> element and a text node, make the text
            // node the contents of the <td>, and put the <td> at
            // the end of the table row
            var cell = document.createElement("td");
            var cellText = document.createTextNode("cell in row " + i + ", column " + j);
            cell.appendChild(cellText);
            row.appendChild(cell);
        }

        // add the row to the end of the table body
        tblBody.appendChild(row);
    }

    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    // appends <table> into <body>

    id.createHTMLDocument(tbl)
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");
}

var votable2data = function (vObject) {
    var contentText = "";
    contentText = vObject.responseText;
    var method = contentText.indexOf("base64");
    var data
    if (method != -1) {
        data = VOTableTools.content2Rows(contentText);
    }
    ;

    return data;
};

function createVoTableResultJson(votableQueryResult, s) {

    var voTableData = VOTableTools.votable2Rows(votableQueryResult);
    var data = votable2data(votableQueryResult)
    var votableField = VOTableTools.getField(votableQueryResult);
    var jsonData = {
        data: {}
    }
    var k = 0;

    /* jsonData = {votableField:voTableData[i]}
    for (var j = 0; j <votableField.length ; j = j + 1) {
      for(var i=0;i<data.length;i++){
      jsonData.data[votableField[j]] =voTableData[j] ;
  }*/
    for (var i = 0; i < votableField.length; i++) {

        jsonData.data[votableField[i]] = voTableData[i];
    }


    /*  console.log(JSON.stringify(jsonData,undefined,2))
      console.log(votableField)
      console.log(voTableData)*/
    return jsonData;
}

/*
const arr = JSON.parse(json);
arr.forEach( obj => renameKey( obj, '_id', 'id' ) );
const updatedJson = JSON.stringify( arr );*/

function renameKey(obj, oldKey, newKey) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
}

function getCorrectOutputJson(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });


}

function genererDataTable(Field, dataTable) {//zone 3 except textarea class = 'white_content'

    var out1 = "<table class='table table-bordered table-striped table-sm' cellspacing='0' width='100%' id='dtBasicExample'>"
    out1 += "<thead><tr role='row'>";//head
//out +="<th/>";
    var nb = Field.length;
    for (var j = 0; j < nb; j++) {
        out1 += "<th rowspan='1' class='th-sm'  colspan='1' style='text-align:center;vertical-align:bottom'>" + Field[j] + "&nbsp&nbsp</th>";
    }
    out1 += "</tr></thead>";
    out1 += "<tbody>";
    var column = 0;
    for (var j = 0; j < dataTable.length; j++) {//table  content
        if (column == 0) {
            var judge = (j + nb) / nb;
            if (judge % 2 == 1) {
                out1 += "<tr>";
                //out+="<td><input type='checkbox'></td>";
            } else {
                out1 += "<tr>";
                //out+="<td><input type='checkbox'></td>";
            }
            out1 += "<td id = '" + dataTable[j] + "' >" + dataTable[j] + "</td>";

        } else {
            out1 += "<td >" + dataTable[j] + "</td>";
        }
        column = column + 1;
        if (column == nb) {
            out1 += "</tr>";
            column = 0;
        }
    }
    out1 += "</tbody>";
    out1 += "</table></div></td></tr>";
    return out1;




}

document.write("<script src='../js/jquery-clickable-tr.js'></script>");
document.write("<script src='../js/script.js'></script>");
