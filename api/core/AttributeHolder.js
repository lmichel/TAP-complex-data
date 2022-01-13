"use strict;";

jw.core.AttributeHolder = function(queryAble){

    let AHTemplate = {
        "table_name":"",
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
        let fullName = [schema, table].join(".").toLowerCase().replace(/"/g,'');
        if(cache[fullName]=== undefined){
            let adql = Holder.getAHAdql(table,schema);
            let queryResult = await queryAble.query(adql);
            if(queryResult.status){
                cache[fullName] = doubleArrayToAHList(queryResult.field_values);
            } else {
                return {"status":false,"error":{
                    "logs":"Query failed:\n " + queryResult.error.logs,
                    "params":{"table":table, "schema":schema}
                }};
            }
            
        }
        return {"status":true,"attribute_handlers":Array.from(cache[fullName]).map(v=>$.extend({},v))};
    };

    Holder.getTablesAttributeHandlers = async function(tables,schema){
        if(schema === undefined){
            console.warn("Missing argument `schema` to getTableAttributeHandler you may get an empty list depending on the TAP sevirce ");
            schema = "";
        }
        let fullNames = {};
        let nameMap = {};
        let ahMap = {};
        let fName,fNameLow;
        for (let i =0 ;i<tables.length;i++){
            fName = [schema, tables[i]].join('.').quotedTableName().qualifiedName;
            fNameLow = fName.toLowerCase().replace(/"/g,"");
            if(cache[fNameLow]!== undefined){
                ahMap[fNameLow]=Array.from(cache[fNameLow]);
            }else {
                fullNames[tables[i]]=fName;
            }
            nameMap[tables[i]]=fNameLow;
        }

        if(Object.keys(fullNames).length > 0){
            let adql = Holder.getAHsAdql(fullNames);

            let queryResult = await queryAble.query(adql);

            if(queryResult.status){
                let AHList = doubleArrayToAHList(queryResult.field_values);
                for (let i=0;i<AHList.length;i++){
                    fNameLow = getMatchingFullName(AHList[i].table_name,schema);
                    if(ahMap[fNameLow] !== undefined){
                        ahMap[fNameLow].push(AHList[i]);
                    } else if (Object.values(nameMap).includes(fNameLow)) {
                        ahMap[fNameLow] = [];
                        ahMap[fNameLow].push(AHList[i]);
                    }else {
                        console.error(AHList[i],AHList,fullNames,ahMap);
                        return {"status":false,"error":{
                            "logs":"Parsing error unexpected table name " + AHList[i].table_name,
                            "params":{"tables":tables, "schema":schema}
                        }};
                    }
                }
                for(let name in ahMap){
                    if(cache[name] === undefined){
                        cache[name] = Array.from(ahMap[name]);
                    }
                }
            } else {
                return {"status":false,"error":{
                    "logs":"Query failed:\n " + queryResult.error.logs,
                    "params":{"tables":tables, "schema":schema}
                }};
            }
        }

        return {"status":true,"attribute_handlers":ahMap,"name_map":nameMap};
        
    };

    Holder.getAHColAdql = function(){
        return "SELECT " +
        "TAP_SCHEMA.columns.column_name" +
        ",TAP_SCHEMA.columns.unit" +
        ",TAP_SCHEMA.columns.ucd" +
        ",TAP_SCHEMA.columns.utype" +
        ",TAP_SCHEMA.columns.datatype" +
        ",TAP_SCHEMA.columns.description" +
        ",TAP_SCHEMA.columns.table_name" +
        " FROM TAP_SCHEMA.columns";
    };

    Holder.getAHAdql = function(table,schema){
        return Holder.getAHColAdql() +
        " WHERE TAP_SCHEMA.columns.table_name = " + "\'" + utils.replaceAll(table,"\"","\\\"") + "\'" + 
        " OR TAP_SCHEMA.columns.table_name = " + "\'" + utils.replaceAll( [schema, table].join('.').quotedTableName().qualifiedName ,"\"","\\\"") + "\'"+ 
        " OR TAP_SCHEMA.columns.table_name = " + "\'" + utils.replaceAll( [schema, table].join('.').quotedTableName().qualifiedName ,"\"","") + "\'"  ;
    };

    Holder.getAHsAdql = function(names){
        let full = [];
        for (let name in names){
            full.push("\'" + utils.replaceAll(names[name],"\"","\\\"") + "\'");
            full.push("\'" + utils.replaceAll(name,"\"","\\\"") + "\'");
            full.push("\'" + utils.replaceAll(names[name],"\"","") + "\'");
            full.push("\'" + utils.replaceAll(name,"\"","") + "\'");
        }
        full = Array.from(new Set(full));
        return Holder.getAHColAdql() +
        " WHERE TAP_SCHEMA.columns.table_name IN ( " + full.join(" , ") + " ) ";
    };

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
            AH.table_name = data[i][6];
            console.log(AH.table_name + "." + AH.nameattr);
            if(jw.KnowledgeTank.presetValues[AH.table_name + "." + AH.nameattr] !== undefined){
                AH.available_value = Array.from(jw.KnowledgeTank.presetValues[AH.table_name + "." + AH.nameattr]);
            }
            for (let val in AH){
                if(AH[val]===null){
                    AH[val] = "";
                }
            }
            AHList.push(AH);
        }
        return AHList;
    }

    function getMatchingFullName(dbName,schema){
        dbName = dbName.toLowerCase();
        schema = schema.toLowerCase().replace(/"/g,"");
        let table = utils.unqualifyName(dbName,schema);
        return [schema,table].join(".");
    }

    /*/ protected methods and vars can be used when extending the AttributeHolder object /*/
    Holder.protected = {
        "cache":cache,
        "AHTemplate":AHTemplate,
        "doubleArrayToAHList":doubleArrayToAHList,
        "getMatchingFullName":getMatchingFullName,
    };

    return Holder;
};