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


    $("#btnApiConnectS").click(function () {
        // alert(a.testConnection);
        if (a.testConnection == false) {
            if (params.tapService != "" && params.schema != "" && params.table != "" && params.shortName != "") {
                a.connect(params);
                let status = a.connector.status;
                //alert("you are now connected")
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

    $("#btnGetObjectMap2").click(function () {
        if (a.testConnection == true) {
           /* let objectMap = JSON.stringify(a.getObjectMap(), undefined, 2);
            let status = a.getObjectMap().succes.status;
            display(status, "getStatu");
            display(objectMap, "getJsonAll")
            a.joinTable("basic");
            alert($("#btnGetObjectMap").val())
            setActive("btnGetObjectMap", "btnGetConnector", "btnGetJoinTable", "btnGetRootField", "btnGetRootFieldValue", "btnGetRootQuery")*/

            display('ok', "getStatu");
            display(JSON.stringify(a.getObjectMapWithAllDescriptions(),undefined,2), "getJsonAll")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            // alert("The service is disconnected ! connect service and try again ..." )
        }
    })



    $("#btnGetJoinTable").click(function () {
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
    })

    $("#btnGetRootFieldValue").click(function () {
        if (a.testConnection == true) {

            let rootFieldValues = JSON.stringify(a.getRootFieldValues().succes, undefined, 3);
            let status = a.getRootFieldValues().succes.status;
            display(status, "getStatu");
            display(rootFieldValues, "getJsonAll")

            setActive("btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector", "btnGetRootQuery")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            //alert("The service is disconnected ! connect service and try again ..." )
        }
    })
    var temp = '';
    var isCallRootQuery = false;
    var tabContainRemoveQuery = []
    var tesTabCRQ = false;
    let testRemoveButton = false;
    $("#btnGetRootQuery").click(function () {

        if (a.testConnection == true) {
            let rootQuery;
            //if(isCallRootQuery == false){
            //t//his.tapWhereConstraint =[];
            // this.tapJoinConstraint =[]
            rootQuery = JSON.stringify(a.getRootQuery(), undefined, 2);
            //  temp = rootQuery;
            // alert(temp);
            // isCallRootQuery = true;
            //  }else {
            // alert(temp);
            // rootQuery = temp;
            // }

            tesTabCRQ = true;
            //rootQuery = a.addConstraint(rootQuery,this.tapJoinConstraint,this.tapWhereConstraint)
            let status = "OK"//a.getRootQueryIds().success.status;
            // rootQuerys=[]
            $("#rootQuery").val(rootQuery);
            display(status, "getStatu");
            display(rootQuery, "getJsonAll")
            //a.resetTableConstraint("otypes");

            setActive("btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector")
            document.getElementById("btnConstraint").style.display = "block";

            document.getElementById("btnRemoveConstraint").style.display = "block";
            let table
            $("#btnRemoveConstraint").click(function () {
                document.getElementById("loadRemoveButton").style.display = "block"

                var HtmlRemoveBtn = "";

                table = Array.from(new Set(tabContaninBtnRemoveConstraint));
                console.log(table.length);


                var k =0;


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
                                    if(rootq.status.orderErros!=""){

                                        display(""+JSON.stringify(rootq.status,undefined,2), "getJsonAll")
                                    }else {

                                        display("{ status : "+JSON.stringify(rootq.status.status,undefined,2)+" }", "getJsonAll")
                                    }


                               // display("{status : ok}", "getJsonAll")

                                //document.getElementById("loadRemoveButton").style.display = "none"
                            }else {
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
                    })



                testRemoveButton = true;
                setActive("btnRemoveConstraint", "btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap")

            })
            $("#btnConstraint").click(function () {
                //console.log(a.getTableAttributeHandlers("basic"));
                // let rootQuer= addConstraint(rootQuery,a.tapJoinConstraint);



                document.getElementById("loadButton").style.display = "block"


                setActive("btnConstraint", "btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap")
            })
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            //alert("The service is disconnected ! connect service and try again ..." )
        }
    })

    function addRemoveBtn(table) {
        display(status, "getStatu");
        display(a.resetTableConstraint(table[i]), "getJsonAll")
        tabContaninBtnRemoveConstraint.splice(table.indexOf(tabContaninBtnRemoveConstraint[i],1));
        console.log(tabContaninBtnRemoveConstraint)
        $("#loadRemoveButton").html("");
        window.location.hash = "#loadRemoveButton";
        document.getElementById("loadRemoveButton").style.display = "none";
    }

    var testButton = false;
//var h = new HandlerAttributs();
    var tapButton = [];
    $("#btnLoadbuttonsHandler").click(function () {
        this.tapWhereConstraint = [];
        this.tapJoinConstraint = []
        tapButton = [];
        a.getRootQuery();
        var table = a.tapJoinConstraint;
        //alert(table.length)
        for (let i = 0; i < table.length; i++) {
            var buttons = "<button  type='button' class=\"btn btn-warning\" id='b" + table[i][0] + i + "' value='" + table[i][0] + "' style=\"margin-top: 7px\">handler '" + table[i][0] + "'</button></span>"
            // button+="<button  type='button' class=\"btn btn-default\" id='"+table[i][0]+"' value='"+table[i][0]+"' style=\"margin-top: 7px\">Join '"+table[i][0]+"'</button>"

            if (testButton == true) {
                //alert( 'existe deja')
            } else {
                tapButton.push(buttons);
            }
            document.getElementById("loadbuttonsHandler").style.display = "block"

            $("#loadbuttonsHandler").append(tapButton[i]);
            window.location.hash = "#loadbuttonsHandler";
            $("#b" + table[i][0] + i).click(function () {
                //alert(table[i][0])
                document.getElementById("loadbuttonsHandler").style.display = "none"
                var json = a.getTableAttributeHandlers(table[i][0]);
                console.log(json);
                display(json.status, "getStatu")

                // document.getElementById("loadbuttonsHandler").style.display = "none"
                display(JSON.stringify(json, undefined, 2), "getJsonAll")

            })
        }
        testButton = true;
        /*var json = a.getTableAttributeHandlers('otypes');
        console.log(json);
         display(json.succes.status, "getStatu")

        // document.getElementById("loadbuttonsHandler").style.display = "none"
         display(JSON.stringify(json.succes, undefined, 2), "getJsonAll")*/


    })

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

    /////////////////////////// END API //////////////////////////
    var rootQuerys = []

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
    }


    var mainData, newMainData;
    var listJoinTable;
    var queryTable, index;
    $("#btnSimbad").click(function () {
        var simbadService = new TapServiceConnector("http://simbad.u-strasbg.fr/simbad/sim-tap/sync", Simbadschema, "Simbad");
        var data = simbadService.loadJson();
        var sj = new jsonRead(data);
        //alert(sj.joinTable('basic'))
        var output = "";
        output += sj.showAll(data);
        $("#loadJson").html(output);
        window.location.hash = "#loadJson"
    });

    $("#btnBasic").click(function () {
        var simbadService = new TapServiceConnector("http://simbad.u-strasbg.fr/simbad/sim-tap/sync", Simbadschema, "Simbad");
        var value = $("#selectToJoin").val()
        var adqlQuery = $("#txtArea").val();
        simbadService.setAdqlQuery(adqlQuery);
        var data = simbadService.loadJson();
        $("#loadJson").html(JSON.stringify(data, undefined, 2));
        window.location.hash = "#loadJson"
        var QObject = simbadService.connect();
        var listJoinAndId = simbadService.getListJoinAndId('basic', data);
        var listId = simbadService.getListeId(listJoinAndId);
        var mainData = simbadService.tapService.createMainJson(simbadService.getAdqlQuery(), data, 'basic', listId, listJoinAndId);

        getTableJsonQueryValue(mainData, simbadService, 'basic');
        var tableContentJoinTable = getJoinTable(mainData);

        $("#selectDiv").html(selectTableToJoin_html(tableContentJoinTable))
        window.location.hash = "#selectDiv"
        var out = simbadService.joinTableByField(mainData, 'basic')

    });

////////////////////////////// block service connection /////////////////////////////////////////////////////

    $("#connectBasic").click(function () {
        var adql = "SELECT TOP 1* FROM \"public\".basic"
        const Schemas = "public";
        const Url = "http://simbad.u-strasbg.fr/simbad/sim-tap/sync";
        const ShortName = "Simbad";
        var tableName = 'basic'
        $(window).load(function () {
            $(".loader").fadeOut("1000");
        })
        var simbadServices = connectDatabase(Url, Schemas, ShortName, adql, tableName);


    });

    $("#connectResource").click(function () {
        var adql = "SELECT TOP 1* FROM rr.resource "
        const Schemas = "rr";
        const Url = "http://dc.zah.uni-heidelberg.de/tap/sync";
        const ShortName = "Gavo";
        var tableName = 'resource'
        var gavoServices = connectDatabase(Url, Schemas, ShortName, adql, tableName);
    })
    $("#connectCaomObservation").click(function () {
        var adql = "SELECT  TOP 1 dbo.CaomObservation.* FROM dbo.CaomObservation"
        const Schemas = "dbo";
        const Url = "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync";
        const ShortName = "CAOM";
        var tableName = 'CaomObservation'
        var caomServices = connectDatabase(Url, Schemas, ShortName, adql, tableName);
    })

    $("#connectMETACat").click(function () {

        var adql = "SELECT  TOP 100  * FROM metaviz.METAcat"
        const Schemas = "metaviz";
        const Url = "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync";
        const ShortName = "Vizier";
        var tableName = 'METAcat'
        var caomServices = connectDatabase(Url, Schemas, ShortName, adql, tableName);
    })
    $("#connectEPIC_IMAGE").click(function () {
        var adql = "SELECT  TOP 1  * FROM EPIC.EPIC_IMAGE "
        const Schemas = "EPIC";
        const Url = "http://xcatdb.unistra.fr/3xmmdr8/tap/sync";
        const ShortName = "3XMM";
        var tableName = 'EPIC_IMAGE'
        var caomServices = connectDatabase(Url, Schemas, ShortName, adql, tableName);
    })

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

    function connectDatabase(urlPath, schema, shortname, adql, tableName) {
        showLoader();
        var databaseServices = new TapServiceConnector(urlPath, schema, shortname);
        var value = $("#selectToJoin").val()
        var adqlQuery = $("#txtArea").val(adql);
        databaseServices.setAdqlQuery(adqlQuery.val());
        //alert(urlPath)
        var data = databaseServices.loadJson();
        if (data[tableName] == undefined) {
            data = {
                tables: {
                    "base_table": tableName,
                    "join_table": {}
                }
            }
            //alert(JSON.stringify(joinTable,undefined,2))
        }

        $("#loadJson").html(JSON.stringify(data, undefined, 2));
        window.location.hash = "#loadJson"
        var listJoinAndId = databaseServices.getListJoinAndId(tableName, data);
        var listId = databaseServices.getListeId(listJoinAndId);
        // alert(adqlQuery.val());
        var mainData = databaseServices.tapService.createMainJson(databaseServices.getAdqlQuery(), data, tableName, listId, listJoinAndId);

        getTableJsonQueryValue(mainData, databaseServices, tableName);
        var tableContentJoinTable = getJoinTable(mainData);
        if (tableContentJoinTable.length == 0) {
            tableContentJoinTable.push(tableName);
            mainData = databaseServices.tapService.createMainJson(databaseServices.getAdqlQuery(), data, tableName, listId, listJoinAndId);


        }
        $("#selectDiv").html(selectTableToJoin_html(tableContentJoinTable))
        window.location.hash = "#selectDiv"
        var out = databaseServices.joinTableByField(mainData, tableName, urlPath, schema, shortname);

        return databaseServices;
    }


    /**
     *
     * @param {*} tableContentJoinTable  the table tha containing all join table get by calling the method
     *                                   getJoinTable(mainData) parse insite the main json data create by method
     *                                   createMainJson(@parameters)
     * @return {*}   return a html div with select option menu that containt all join table as option
     */


    /**
     *
     * @param {*} json the main json create by the method createMainJson(@params)
     * @returns   return all array containing all join table of the main json
     */
    function getJoinTable(json) {
        var tableContentJoinTable = [];
        Object.keys(json).forEach(function (key) {
            var value = key;
            tableContentJoinTable.push(value);
            //console.log(isJSON(mainData));
        });
        return tableContentJoinTable;
    }

///////////////////////////////////////////////////////////////////////////////


    $("#refresh").click(function () {
        var value = $("#selectToJoin").val()
        // alert("dfffffffff")
        var adqlQuery = $("#txtArea").val();
        var data = simbadService.loadJson();
        var QObject = simbadService.connect();
        var listJoinAndId = simbadService.getListJoinAndId('basic', data);
        var listId = simbadService.getListeId(listJoinAndId);
        mainData = simbadService.tapService.createMainJson(adqlQuery, data, 'basic', listId, listJoinAndId);
        /*listJoinTable = getJoinTable(mainData);
        queryTable = getTableJsonQueryValue(mainData);
        index = listJoinTable.indexOf(value);
         simbadService.setAdqlQuery(queryTable[index]);
         newMainData = mainJsonData(queryTable[index])
        test=true;

        listJoinTable = getJoinTable(newMainData);
        queryTable = getTableJsonQueryValue(newMainData);
        index = listJoinTable.indexOf(value);
         simbadService.setAdqlQuery(queryTable[index]);
         newMainData = mainJsonData(queryTable[index])*/

        var out = simbadService.joinTableByField(mainData, 'basic')
    })


    $("#btnQuery").click(function () {
        var adqlQuery = $("#txtArea").val();
        simbadService.connectService(adqlQuery);
        var data = simbadService.loadJson();
        simbadService.setAdqlQuery(adqlQuery);
        var QObject = simbadService.connect();
        var sj = new jsonRead(data);
        var listJoinAndId = simbadService.getListJoinAndId('basic', data);
        var listId = simbadService.getListeId(listJoinAndId);
        simbadService.setAdqlQuery(adqlQuery);

        mainData = simbadService.tapService.createMainJson(adqlQuery, data, 'basic', listId, listJoinAndId);
        $("#loadJson").html(JSON.stringify(mainData, undefined, 2));
        window.location.hash = "#loadJson"

        var out = simbadService.joinTableByField(mainData, 'basic')
        $("#votableJson").html(out);
        window.location.hash = "#votableJson"
        // console.log(out)
        getTableJsonQueryValue(mainData);
        var a = getJoinTable(mainData);
        $("#selectDiv").html(selectTableToJoin_html(a))
        window.location.hash = "#selectDiv"
    });


    $("#btnBuild").click(function () {
        var value = $("#selectToJoin").val()
        var data = simbadService.loadJson();
        var QObject = simbadService.connect();
        var listJoinAndId = simbadService.getListJoinAndId('basic', data);
        var listId = simbadService.getListeId(listJoinAndId);
        mainData = simbadService.tapService.createMainJson(simbadService.getAdqlQuery(), data, 'basic', listId, listJoinAndId);
        /*listJoinTable = getJoinTable(mainData);
        queryTable = getTableJsonQueryValue(mainData);
        index = listJoinTable.indexOf(value);
         simbadService.setAdqlQuery(queryTable[index]);
         newMainData = mainJsonData(queryTable[index])
        test=true;

        listJoinTable = getJoinTable(newMainData);
        queryTable = getTableJsonQueryValue(newMainData);
        index = listJoinTable.indexOf(value);
         simbadService.setAdqlQuery(queryTable[index]);
         newMainData = mainJsonData(queryTable[index])*/

        var out = simbadService.joinTableByField(mainData, 'basic')
        //document.getElementById("btnJoin").style["display"] = "block";


    })
    $("#btnJoin").click(function () { //document.getElementById("btnBuild").style["display"] = "none";
        listJoinTable = getJoinTable(newMainData);
        var data = simbadService.loadJson();
        // queryTable = getTableJsonQueryValue(newMainData);
        //index = listJoinTable.indexOf(value);
        // simbadService.setAdqlQuery(queryTable[index]);
        // newMainData = mainJsonData(queryTable[index])
        var QObject = simbadService.connect();
        var out = simbadService.setRootTable(data, 'basic')
        $("#votableJson").html(out);
        window.location.hash = "#votableJson"
        // alert(out)

    })
}


function mainJsonData(adql) {
    var data = simbadService.loadJson();
    var QObject = simbadService.connect();
    var listJoinAndId = simbadService.getListJoinAndId('basic', data);
    var listId = simbadService.getListeId(listJoinAndId);
    return simbadService.tapService.createMainJson(adql, data, 'basic', listId, listJoinAndId);
    ;

}


function getTableJsonQueryValue(json, simbadService, tableBase) {
    var data = simbadService.loadJson();
    // var QObject = simbadService.connect();
    var listJoinAndId = simbadService.getListJoinAndId(tableBase, data);
    // var listId = simbadService.getListeId(listJoinAndId);
    var tableContentQuery = [];
    //var tableContentInstanceOfMainData=[]
    Object.keys(json).forEach(function (key) {
        var value = json[key];
        Object.keys(value).forEach(function (key) {
            var valu;
            if (key != "key") {
                valu = value[key];
                tableContentQuery.push(valu);

            }
        });

        //console.log(isJSON(mainData));
    });


    //  console.log(tableContentInstanceOfMainData[0])
    return tableContentQuery;
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


function selectTableToJoin_html(tableContentJoinTable) {
    var out = '<div class="card" id ="">' +
        '<div class="card-body">' +
        '<div class="row">' +
        '<div class="col-lg-6">' +
        ' <div class="form-group">' +
        '<label for="selectToJoin">Select Table To Join &nbsp &nbsp &nbsp' +
        '</label>' +
        '<select class="form-control" id="selectToJoin">' +
        '<option seleted>...</option>'
    for (var i = 0; i < tableContentJoinTable.length; i++) {

        out += "<option id='" + i + "'>" + tableContentJoinTable[i] + "</option>"
    }
    out += '</select>' +
        '</div>' + '</div>' + '</div>' +
        '<hr class="btn-primary">' +
        '<div> ' +
        '<textarea class="form-control" id="txtAreaAdql" value=""></textArea><br>' +
        '</div>' +
        '<button class="btn btn-success" id="executeAdql">Run Adql</button>'
    '</div>' + '</div>'


    return out;
}


$("#simbadService").click(function () {
    // var adql = "SELECT TOP 1* FROM \"public\".basic"
    if (a.testConnection == false) {
        params.tapService = "http://simbad.u-strasbg.fr/simbad/sim-tap/sync"
        params.schema = Simbadschema;
        params.table = "basic";
        params.shortName = "Simbad";
        display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
    } else {
        display("another service is currently connected ! Disconnect the service an try again", 'getStatu')
    }

});
$("#gavoService").click(function () {
    //var adql = "SELECT TOP 1* FROM rr.resource "
    if (a.testConnection == false) {
        params.tapService = "http://dc.zah.uni-heidelberg.de/tap/sync"
        params.schema = "rr";
        params.table = "resource";
        params.shortName = "Gavo";
        display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
    } else {
        display("another service is currently connected ! Disconnect the service an try again", "getStatu")
    }
});
$("#caomService").click(function () {
    //var adql = "SELECT  TOP 1 dbo.CaomObservation.* FROM dbo.CaomObservation"
    if (a.testConnection == false) {
        params.tapService = "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync"
        params.schema = "dbo";
        params.table = "CaomObservation";
        params.shortName = "CAOM";
        display(params.shortName + " is now initialised click now to connect button to connect service", "getStatu")
    } else {
        display("another service is currently connected ! Disconnect the service an try again", "getStatu")
    }
});
$("#xmmService").click(function () {
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
});
$("#vizierService").click(function () {
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

});


