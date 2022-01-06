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
        let fName;
        for (let i =0 ;i<tables.length;i++){
            fName = [schema, tables[i]].join('.').quotedTableName().qualifiedName;
            if(cache[fName]!== undefined){
                ahMap[tables[i].toLowerCase()]=Array.from(cache[fName]);
                nameMap[tables[i].toLowerCase()]=fName.toLowerCase();
            }else {
                fullNames[tables[i]]=fName;
            }
        }
        let adql = Holder.getAHsAdql(fullNames);

        let fuzzyNames = {};

        for(let name in fullNames){
            fuzzyNames[name.toLowerCase().replace(/"/g,'')]= fullNames[name].toLowerCase().replace(/"/g,'');
        }
        fullNames = fuzzyNames;

        let queryResult = await queryAble.query(adql);

        if(queryResult.status){
            let AHList = doubleArrayToAHList(queryResult.field_values);
            for (let i=0;i<AHList.length;i++){
                if(ahMap[AHList[i].table_name.toLowerCase().replace(/"/g,'')]!==undefined){
                    ahMap[AHList[i].table_name.toLowerCase().replace(/"/g,'')].push(AHList[i]);
                } else if (fullNames[AHList[i].table_name.toLowerCase().replace(/"/g,'')] !== undefined){
                    if(ahMap[fullNames[AHList[i].table_name.toLowerCase().replace(/"/g,'')].toLowerCase().replace(/"/g,'')]===undefined){
                        ahMap[fullNames[AHList[i].table_name.toLowerCase().replace(/"/g,'')].toLowerCase().replace(/"/g,'')] = [];
                    }
                    ahMap[fullNames[AHList[i].table_name.toLowerCase().replace(/"/g,'')].toLowerCase().replace(/"/g,'')].push(AHList[i]);
                }else if(Object.values(fullNames).includes(AHList[i].table_name.toLowerCase().replace(/"/g,''))){
                    ahMap[AHList[i].table_name.toLowerCase().replace(/"/g,'')] = [];
                    ahMap[AHList[i].table_name.toLowerCase().replace(/"/g,'')].push(AHList[i]);
                } else {
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
            return {"status":true,"attribute_handlers":ahMap,"name_map":$.extend(nameMap, fullNames)};

        } else {
            return {"status":false,"error":{
                "logs":"Query failed:\n " + queryResult.error.logs,
                "params":{"tables":tables, "schema":schema}
            }};
        }
    };

    Holder.getAHColAdql = function(){
        return "SELECT " +
        "TAP_SCHEMA.columns.column_name" +
        ",TAP_SCHEMA.columns.unit" +
        ",TAP_SCHEMA.columns.ucd" +
        ",TAP_SCHEMA.columns.utype" +
        ",TAP_SCHEMA.columns.dataType" +
        ",TAP_SCHEMA.columns.description" +
        ",TAP_SCHEMA.columns.table_name" +
        " FROM TAP_SCHEMA.columns";
    };

    Holder.getAHAdql = function(table,schema){
        return Holder.getAHColAdql() +
        " WHERE TAP_SCHEMA.columns.table_name = " + "\'" + utils.replaceAll(table,"\"","\\\"") + "\'" + 
        " OR TAP_SCHEMA.columns.table_name = " + "\'" + utils.replaceAll( [schema, table].join('.').quotedTableName().qualifiedName ,"\"","\\\"") + "\'";
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

    /*/ protected methods and vars can be used when extending the AttributeHolder object /*/
    Holder.protected = {
        "cache":cache,
        "AHTemplate":AHTemplate,
        "doubleArrayToAHList":doubleArrayToAHList
    };

    return Holder;
};