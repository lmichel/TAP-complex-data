"use strict;";

AttributeHolder = function(queryAble){

    let AHTemplate = {
        "nameattr":"",
        "nameorg":"",
        "column_name": "",
        "unit": "",
        "ucd": "",
        "utype": "",
        "type": "",
        "description": "",
        "default_value":"",
        "available_value":[],
        "format":""
    };

    let cache = {};
    let Holder = {};

    Holder.getTableAttributeHandler= async function(table,schema){
        if(schema === undefined){
            console.warn("Missing argument `schema` to getTableAttributeHandler you may get an empty list depending on the TAP sevirce ");
            schema = "";
        }
        let fullName = [schema, table].join('.').quotedTableName().qualifiedName;
        if(cache[fullName ]=== undefined){
            let adql = Holder.getAHAdql(table,schema);
            let queryResult = await queryAble.Query(adql);
            if(queryResult.status){
                let data = queryResultToDoubleArray(queryResult.answer);
                cache[fullName] = doubleArrayToAHList(data);
            } else {
                return {"status":false,"error":{
                    "logs":"Query failed:\n " + queryResult.error.logs,
                    "params":{"table":table, "schema":schema}
                }};
            }
            
        }
        return {"status":true,"attribute_handlers":cache[ fullName]};
    };

    Holder.getAHAdql = function(table,schema){
        return "SELECT " +
        "TAP_SCHEMA.columns.column_name" +
        ",TAP_SCHEMA.columns.unit" +
        ",TAP_SCHEMA.columns.ucd" +
        ",TAP_SCHEMA.columns.utype" +
        ",TAP_SCHEMA.columns.dataType" +
        ",TAP_SCHEMA.columns.description" +
        " FROM TAP_SCHEMA.columns" +
        " WHERE TAP_SCHEMA.columns.table_name = " + "\'" + replaceAll(table,"\"","\\\"") + "\'" + 
        " OR TAP_SCHEMA.columns.table_name = " + "\'" + replaceAll( [schema, table].join('.').quotedTableName().qualifiedName ,"\"","\\\"") + "\'";
    };

    function queryResultToDoubleArray(queryResult){
        let dataTable = VOTableTools.votable2Rows(queryResult);
        let nbCols = VOTableTools.genererField(queryResult, queryResult.responseText).length;

        let singleArrayValue =[], doubleArrayValue=[];

        let k;
        for (let rowN = 0; rowN < dataTable.length; rowN += nbCols) {
            for (k = rowN; k < dataTable.length; k++) {
                singleArrayValue.push(dataTable[k]);
            }
            doubleArrayValue.push(singleArrayValue);

            singleArrayValue = [];
        }

        return doubleArrayValue;
    }

    function doubleArrayToAHList(data){
        let AHList = [];
        let AH;
        for (let i=0;i<data.length;i++){
            AH = $.extend(true,{},AHTemplate);
            AH.nameattr = data[i][0];
            AH.nameorg = data[i][0];
            AH.column_name = data[i][0];
            AH.unit = data[i][1];
            AH.ucd = data[i][2];
            AH.utype = data[i][3];
            AH.type = data[i][4];
            AH.description = data[i][5];
            AHList.push(AH);
        }
        return AHList;
    }

    /*/ protected methods and vars can be used when extending the AttributeHolder object /*/
    Holder.protected = {
        "cache":cache,
        "AHTemplate":AHTemplate,
        "queryResultToDoubleArray":queryResultToDoubleArray,
        "doubleArrayToAHList":doubleArrayToAHList
    };

    return Holder;
};