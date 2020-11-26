class HandlerAttributs {
    constructor() {
        /* let name; //Orginal name of the field
         let db_name; //Field name as known by the DB. Must be used to set constraints
         let type; //data abse type of the attribute (string, int...)
         let ucd; //Unified Content Descriptor
         let utype; //Model binding
         let descriptor; //Text descriptor*/
        //this.tapApi = new TapApi();
        this.api = "";
        this.ucd = ''
        this.name = '';
        this.db_name = '';
        this.type = '';
        this.utype = '';
        this.description = '';
        this.range = '';
        this.schema = "";

    }
}

function replaceAll(str, find, replace) {
    var escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}

function modifyKeys(obj) {
    Object.keys(obj).forEach(key => {
        obj[`${obj[key]}`] = obj[key];
        delete obj[key];
        if (typeof obj[`${obj[key]}`] === "object") {
            modifyKeys(obj[`${obj[key]}`]);
        }
    });
}

var testJsonRead = false
var sj = '';
HandlerAttributs.prototype.getTableAttributeHandler = function (table) {
    let doubleArrayValue = [];
    let singleArrayValue = [];
    this.db_name = this.api.connector.service["table"]
    var api = this.api;
    let jsonContaintHandlerValues = {
        succes: {
            status: "",
            "table": table,
            attribute_handlers:
                {
                    "db_name": this.db_name,
                    "column_name": this.name,
                    "unit": this.range,
                    "ucd": this.ucd,
                    "utype": this.utype,
                    "dataType": this.type,
                    "description": this.description
                }

        },
        failure: {
            notConnected: {status: "", message: ""},
            otherError: {status: "", message: ""}
        }
    }


    if (api.testConnection == true) {

        if (testJsonRead == false) {
            sj = new jsonRead(api.getObjectMap().succes.object_map);
            testJsonRead = true;
        }

        var adql = this.addAllColumn(table, api.connector.service["schema"]);

        var s = api.tapService;
        var votableQueryResult = s.Query(adql);

        let dataTable;
        let contentText;
        let Field;
        let nbCols;
        if (votableQueryResult != undefined) {
            dataTable = VOTableTools.votable2Rows(votableQueryResult);
            // console.log(dataTable);
            contentText = votableQueryResult.responseText;
            Field = VOTableTools.genererField(votableQueryResult, contentText)

            nbCols = Field.length;

            let rowN

            for (rowN = 0; rowN < dataTable.length; rowN += nbCols) {//table  content
                for (let k = rowN; k < dataTable.length; k++) {

                    singleArrayValue.push(dataTable[k]);

                }
                doubleArrayValue.push(singleArrayValue);

                singleArrayValue = []
            }
            //doubleArrayValue.splice(doubleArrayValue[0][0], 0);
            // console.log(doubleArrayValue);
            //alert(doubleArrayValue);
            jsonContaintHandlerValues.succes.status = "OK"
            let jsonContaintHandlersValue = []
            for (let c = 0; c < doubleArrayValue.length; c++) {
                jsonContaintHandlerValues.succes.attribute_handlers.column_name = doubleArrayValue[c][0];
                jsonContaintHandlerValues.succes.attribute_handlers.unit = doubleArrayValue[c][1];
                jsonContaintHandlerValues.succes.attribute_handlers.ucd = doubleArrayValue[c][2];
                jsonContaintHandlerValues.succes.attribute_handlers.utype = doubleArrayValue[c][3];
                jsonContaintHandlerValues.succes.attribute_handlers.dataType = doubleArrayValue[c][4];
                jsonContaintHandlerValues.succes.attribute_handlers.description = doubleArrayValue[c][5];
                jsonContaintHandlersValue.push(jsonContaintHandlerValues.succes.attribute_handlers);
                jsonContaintHandlerValues.succes.attribute_handlers = {
                    "name": table,
                    "db_name": api.connector.service["table"],
                    "column_name": "",
                    "unit": "",
                    "ucd": "",
                    "utype": "",
                    "dataType": "",
                    "description": ""
                }
            }
            jsonContaintHandlerValues.succes.attribute_handlers = jsonContaintHandlersValue;

        } else {

            jsonContaintHandlerValues.failure.otherError.status = "Failed"
            jsonContaintHandlerValues.failure.otherError.message = "error_message"
            // alert('you are not connected');
        }
    } else {
        jsonContaintHandlerValues.failure.notConnected.status = "Failed";
        jsonContaintHandlerValues.failure.notConnected.message = "No active TAP connection"
    }
    if (jsonContaintHandlerValues.succes.status == "OK") {
        return jsonContaintHandlerValues.succes
    } else if (jsonContaintHandlerValues.failure.notConnected.status == "Failed") {
        return jsonContaintHandlerValues.failure.notConnected
    } else {
        return jsonContaintHandlerValues.failure.otherError;
    }
}


HandlerAttributs.prototype.addAllColumn = function (table, schema) {
    //alert(schema)
    var adql = "SELECT "
        + "TAP_SCHEMA.columns.column_name"
        + ",TAP_SCHEMA.columns.unit"
        + ",TAP_SCHEMA.columns.ucd"
        + ",TAP_SCHEMA.columns.utype"
        + ",TAP_SCHEMA.columns.dataType"
        + ",TAP_SCHEMA.columns.description"
        + " FROM TAP_SCHEMA.columns";
    if (schema == 'public' || schema == 'metaviz') {
        adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + table + "'";

    } else {
        adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + schema + "." + table + "'";

    }
    return adql;

}

HandlerAttributs.prototype.addSingelColumn = function () {
    //alert(schema)
    let adql1 = "SELECT "
        + "TAP_SCHEMA.columns.column_name"
        + ",TAP_SCHEMA.columns.unit"
        + ",TAP_SCHEMA.columns.ucd"
        + ",TAP_SCHEMA.columns.utype"
        + ",TAP_SCHEMA.columns.dataType"
        + ",TAP_SCHEMA.columns.description"
        + " FROM TAP_SCHEMA.columns";

    return adql1;

}
