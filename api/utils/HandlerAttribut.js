class HandlerAttributs {
    constructor() {
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
HandlerAttributs.prototype.getTableAttributeHandler = async function (table) {
    let doubleArrayValue = [];
    let singleArrayValue = [];
    //console.log(this.api)
    this.db_name = this.api.getConnector().connector.service["table"]
    let api = this.api;
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


    if (api.getConnector().connector.status === "OK") {

        if (testJsonRead == false) {
            sj = new jsonRead((await api.getObjectMap()).object_map);
            testJsonRead = true;
        }

        var adql = this.addAllColumn(table, api.getConnector().connector.service["schema"]);

        var s = api.tapServiceConnector;
        var votableQueryResult = await s.Query(adql);

        let dataTable;
        let contentText;
        let Field;
        let nbCols;
        if (votableQueryResult != undefined) {
            dataTable = VOTableTools.votable2Rows(votableQueryResult);
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
                    "db_name": api.tapServiceConnector.connector.service["table"],
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
            jsonContaintHandlerValues.failure.otherError.message = "Unknown error : Query Result undefined"
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


