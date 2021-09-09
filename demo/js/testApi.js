const Simbadschema = "public";

let test = false;
let HtmltabContaninBtnRemoveConstraint = [];


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
let testfor1 = false;
let tapButton = [];
let testButton111=false

function createButton() {
    let buttons = "";
    let api = a;
    let schema = a.getConnector().service["schema"];
    if (testfor1 == false) {
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
            if (testButton111 == true) {
              //  alert( 'existe deja')
            } else {
                tapButton.push(buttons);

            }
        }
        $("#loadButton").append(tapButton);
        window.location.hash = "#loadButton";
        testfor1 = true;
        testButton111 =true;


    }
    for (let key in api.tapServiceConnector.objectMapWithAllDescription.tables) {
        // api.tapServiceConnector.selecConstraints(key, "txt" + key, api);
        $("#" + "bbb" + key).click(function () {
            api.tapServiceConnector.selecConstraints(key, "txt" + key, api);
        })
    }

}

let params = {
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


function newMain() {
    display("All service are now disconnected, connect one and enjoy it's services", "getStatu")
    // initial();

////////////////////////////// API ////////////////////////////////////////////
    $("#d_right").click(function () {
        document.getElementById("light").style.display = "none";
    })

    $("#btnApiConnectS").click(function () {
        // alert(a.testConnection);
        if (a.getConnector().status !== "OK") {
            if (params.tapService != "" && params.schema != "" && params.table != "" && params.shortName != "") {

                a.connect(params);

                // Add remove loading class on body element based on Ajax request status

                //  var caomServices = connectDatabase(params.tapService, params.schema, params.shortName, a.query, a.connector.service["table"]);

                let status = a.getConnector().status;
				let message = a.getConnector().message;
                //alert("you are now connected")
                a.getObjectMapWithAllDescriptions();
                document.getElementById("testContent").style["display"] = "none";
                display(status + ": " + message, "getStatu");
				display(JSON.stringify(params,undefined, 4),"getJsonAll");
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

            let connector = JSON.stringify(a.getConnector().service, undefined, 4);
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
        if (a.getConnector().status === "OK") {
            let objectMap = JSON.stringify(a.getObjectMap(), undefined, 4);
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
        if (a.getConnector().status === "OK") {


            display('ok', "getStatu");
            display(JSON.stringify(a.getObjectMapWithAllDescriptions(), undefined, 4), "getJsonAll")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            // alert("The service is disconnected ! connect service and try again ..." )
        }
    })


    $("#btnGetJoinTable").click(function () {
        if (a.getConnector().status === "OK") {

            let joinTables = JSON.stringify(a.getJoinedTables(params.table), undefined, 4);
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
        if (a.getConnector().status === "OK") {
            createButton()
            let rootFields = JSON.stringify(a.getRootFields(), undefined, 4);
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

        if (a.getConnector().status === "OK") {
            //console.log(a.getRootQuery())

            let values = a.getRootFieldValues(a.getRootQuery());
            let rootFieldValues = JSON.stringify(values.succes, undefined, 3);
            let status = values.succes.status;
            display(status, "getStatu");
            display(rootFieldValues, "getJsonAll")

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

            display("" + JSON.stringify(rootq.status, undefined, 4), "getJsonAll")
        } else {
            statu = rootq.status.status != "" ? rootq.status.status : "Failed"
            display("{ status : " + JSON.stringify(statu, undefined, 4) + " }", "getJsonAll")
        }
    });

    var tesTabCRQ = false;
    let testRemoveButton = false;

    $("#btnGetRootQuery").click(function () {

        if (a.getConnector().status === "OK") {
            let rootQuery;
            var f = "\\"
            // alert(f)
            createButton();
            rootQuery = a.getRootQuery() // JSON.stringify(a.getRootQuery(), undefined, 4);

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

                table = Array.from(new Set(a.tapServiceConnector.tabContaninBtnRemoveConstraint));
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
                            display("Inter the name of table you want ton remove constraints", "getJsonAll")

                            //document.getElementById("loadRemoveButton").style.display = "block"
                        } else if ($("#txtConstraint").val() == table[i]) {
                            let rootq = a.resetTableConstraint(table[i])
                            display("OK", "getStatu");
                            display("{ status : OK  }", "getJsonAll")
                            //$("#getJsonAll").text("Constraint removed successful");
                            if (rootq.status.orderErros != "") {

                                display("" + JSON.stringify(rootq.status, undefined, 4), "getJsonAll")
                            } else {

                                display("{ status : OK }", "getJsonAll")
                            }


                        } else {

                        }

                    }

                })


                testRemoveButton = true;
                setActive("btnRemoveConstraint", "btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap")

            })
            $("#btnConstraint").click(function () {

                document.getElementById("loadButton").style.display = "block"


                setActive("btnConstraint", "btnGetRootQuery", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap")
            })
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
        }
    })


    $("#btnLoadbuttonsHandler").click(function () {

        document.getElementById("loadbuttonsHandler").style.display = "block"
        a.tapServiceConnector.setObjectMapWithAllDescriptionConstraint(a);
    })


    $("#btnGetRootQueryId").click(function () {
        if (a.getConnector().status === "OK") {
            let rootValue = JSON.stringify(a.getRootQueryIds().succes, undefined, 3);
            let status = a.getRootQueryIds().succes.status;
            setTimeout(function(){
                //$('#overlay').addClass('display-none')
                $("#overlay").fadeOut(1000);
            },3000);
            display(status, "getStatu");
            display(rootValue, "getJsonAll")
            setActive("btnGetRootQueryId", "btnGetRootFieldValue", "btnGetRootField", "btnGetJoinTable", "btnGetObjectMap", "btnGetConnector")
        } else {
            display(statusf, "getStatu");
            display(message, "getJsonAll")
            //alert("The service is disconnected ! connect service and try again ..." )
        }
    })




    /////////////////////////// END API //////////////////////////

////////////////////////////// block service connection /////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////


}









