"use strict;";

function parseString(str,keyWords,separator){
    let splitted = [str];
    let newSplit, partialSplit;
    let data = {"default":[]};
    let j,k;

    //splitting the string on all separator to get nice strings to work with
    // can be optimized but would this worth the time spent ? 
    for (let i=0;i<keyWords.length;i++){
        data[keyWords[i]]=[];
        newSplit = [];
        for (j=0;j<splitted.length;j++){
            partialSplit = splitted[j].split(keyWords[i]+separator);

            for(k=1;k<partialSplit.length;k++){
                partialSplit[k] = keyWords[i]+separator + partialSplit[k].trim();
            }
            partialSplit[0] = partialSplit[0].trim();
            if(partialSplit[0].length<1){
                partialSplit.shift();
            }
            newSplit = newSplit.concat(partialSplit);
        }
        splitted = newSplit;
    }
    let defaultVal = Array.from(splitted);
    // sorting all data in a convenient way
    for (let i=0;i<keyWords.length;i++){
        for (j=0;j<splitted.length;j++){
            if(splitted[j].startsWith(keyWords[i]+separator)){
                defaultVal.remove(splitted[j]);
                data[keyWords[i]].push(splitted[j].substr(keyWords[i].length+separator.length));
            }
        }
    }
    data.default = defaultVal;

    return data;
}

async function setupEventHandlers(){
    let api = new TapApi();
    await api.connect({
        "tapService" : "//dc.zah.uni-heidelberg.de/tap/sync",
        "schema" : "rr",
        "table" : "resource",
        "shortName":"Gavo"
    });

    // default conditions
    let defaultConditions ={
        "cabability":"rr.cabability.standard_id='ivo://ivoa.net/std/tap'",
        "interface":"rr.interface.intf_type = 'vs:paramhttp'"
    }; 
    
    for (let table in defaultConditions){
        api.setTableConstraint(table,defaultConditions[table]);
    }

    function simpleStringMerger(conditions,base){
        let condition = "";
        for (let i=0;i<conditions.length;i++){
            if(condition.length>0){
                condition += " OR ";
            }
            if(conditions[i].indexOf("%")==-1){
                condition += base + "= " + conditions[i];
            }else {
                condition += base + "LIKE " + conditions[i];
            }
        }
        return condition;
    }

    function multiTableStringMerger(conditions,base){
        let bases = base.split("::");
        let mergedConditions=[];
        for (let i=0;i<bases.length;i++){
            mergedConditions.push("(" + simpleStringMerger(conditions,bases[i]) + ")");
        }
        return mergedConditions.join(" OR ");
    }

    function simpleStringFormator(str){
        str=str.replace(/([\"\\])/g, "\\$1");
        return "'" + str + "'";
    }

    function lazyStringFormator(str){
        if (!str.startsWith("%")){
            str = "%" + str;
        }
        if(!str.endsWith("%")){
            str+="%";
        }
        return simpleStringFormator(str);
    }
    //ouba ouba c'est lui name: le marsupilami utype: marsupiale url:%terre://amazonie/"hute au marsu"

    
    /*searchBarName:{tableName,conditionBase,type:("string","number"),transform,merger}
    * `transform` is a function called on each sub conditions before the merger gets called
    * `merger` is a function taking an array of (possibly one or more but not empty) condition and the base constraint 
    * to return a single string which will be use as condition
    */
    let allowedFieldsMap = {
        "name":{tableName:"ressource",conditionBase:"rr.ressource.short_name ",transform:simpleStringFormator,merger:simpleStringMerger},
        "ivoid":{tableName:"ressource",conditionBase:"rr.ressource.ivoid ",transform:simpleStringFormator,merger:simpleStringMerger},
        "desc":{tableName:"ressource",conditionBase:"rr.ressource.res_description ",transform:simpleStringFormator,merger:simpleStringMerger},
        "title":{tableName:"ressource",conditionBase:"rr.ressource.res_title ",transform:simpleStringFormator,merger:simpleStringMerger},
        "role_ivoid":{tableName:"res_role",conditionBase:"rr.res_role.role_ivoid ",transform:simpleStringFormator,merger:simpleStringMerger},
        "subject":{tableName:"res_subject",conditionBase:"rr.res_subject.res_subject ",transform:simpleStringFormator,merger:simpleStringMerger},
        "subject_uat":{tableName:"subject_uat",conditionBase:"rr.subject_uat.uat_concept ",transform:simpleStringFormator,merger:simpleStringMerger},
        "table_name":{tableName:"res_table",conditionBase:"rr.res_table.table_name ",transform:simpleStringFormator,merger:simpleStringMerger},
        "table_desc":{tableName:"res_table",conditionBase:"rr.res_table.table_description ",transform:simpleStringFormator,merger:simpleStringMerger},
        "utype":{tableName:"res_table",conditionBase:"rr.res_table.table_utype ",transform:simpleStringFormator,merger:simpleStringMerger},
        "url":{tableName:"interface",conditionBase:"rr.interface.access_url ",transform:simpleStringFormator,merger:simpleStringMerger},
        "default":{
            tableName:"ressource",
            conditionBase:"rr.ressource.short_name ::rr.ressource.ivoid ::rr.ressource.res_title ",
            transform:lazyStringFormator,
            merger:multiTableStringMerger
        },
    };

    function processConditions(conditionMap,fieldMap){
        let processed = {};
        let partialProcess;
        
        for (let consName in conditionMap){
            if(conditionMap[consName].length>0){
                partialProcess=[];
                if(fieldMap[consName].transform){
                    for(let i=0;i<conditionMap[consName].length;i++){
                        partialProcess.push(fieldMap[consName].transform(conditionMap[consName][i]));
                    }
                } else {
                    partialProcess = Array.from(conditionMap[consName]);
                }
                if(processed[fieldMap[consName].tableName] === undefined){
                    processed[fieldMap[consName].tableName]=[];
                }
                processed[fieldMap[consName].tableName].push(fieldMap[consName].merger(partialProcess,fieldMap[consName].conditionBase));
            }
        }
        for(let table in processed){
            processed[table] = processed[table].join(" OR ");
        }
        return processed;
    }

    $("#searchBar").keyup(()=>{
        let parsedData = parseString($("#searchBar").val(),Object.keys(allowedFieldsMap),":");
        display(processConditions(parsedData,allowedFieldsMap),"codeOutput") ;
    });

}

$(document).ready(()=>{
    syncIt( ()=>{
        setupEventHandlers();
    });
    
});

