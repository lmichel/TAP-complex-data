"use strict;";
/**
 * 
 * @param {*} keyWords list of keywords to use when parsing strings
 * @param {*} separator string putted after the keywords to better differenciate keywords from normal text 
 * @returns 
 */
var StringParser = function(keyWords,separator){
    if (separator === undefined){
        separator = ":";
    }

    var parser = {};

    parser.keyWords = keyWords;
    parser.separator = separator;

    parser.parseString = function(str){
        let splitted = [str];
        let newSplit, partialSplit;
        let data = {"default":[]};
        let j,k;

        //splitting the string on all separator to get nice strings to work with
        // can be optimized but would this worth the time spent ? 
        for (let i=0;i<parser.keyWords.length;i++){
            data[parser.keyWords[i]]=[];
            newSplit = [];
            for (j=0;j<splitted.length;j++){
                partialSplit = splitted[j].split(parser.keyWords[i]+parser.separator);

                for(k=1;k<partialSplit.length;k++){
                    partialSplit[k] = parser.keyWords[i]+parser.separator + partialSplit[k].trim();
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
        for (let i=0;i<parser.keyWords.length;i++){
            for (j=0;j<splitted.length;j++){
                if(splitted[j].startsWith(parser.keyWords[i]+parser.separator)){
                    defaultVal.remove(splitted[j]);
                    data[parser.keyWords[i]].push(splitted[j].substr(parser.keyWords[i].length+parser.separator.length));
                }
            }
        }
        data.default = defaultVal;

        return data;
    };

    return parser;

};

var dataQueryier = function(api,fieldMap,defaultConditions){
    let nbRequest=0;

    let cache,cachedMap;
    let publicObject = {};
    publicObject.defaultConditions = defaultConditions;

    publicObject.processConditions = function(conditionMap){
        let processed = {};
        let partialProcess;
        
        for (let consName in conditionMap){
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
        for(let table in processed){
            processed[table] = processed[table].join(" OR ");
        }
        return processed;
    };

    publicObject.getSelect = function(conditionMap){
        let fields = {
            "rr.resource.res_title":"title",
            "rr.interface.access_url":"url",
            "rr.resource.ivoid":"ivoid",
            "rr.resource.short_name":"name"
        };
        for (let consName in conditionMap){
            if(conditionMap[consName].length>0 && consName != "default"){
                fields[fieldMap[consName].conditionBase] = consName;
            }
        }
        
        let select = "SELECT ";
        for (let field in fields){
            select +=  field + " AS " + fields[field] + ", ";
        }
        return select.substr(0,select.length-2) + " ";
    };

    function arraysToMaps(arrays){
        let maps = [];
        let map;
        for (let i=0;i<arrays.field_values.length;i++){
            map = {};
            for(let j=0;j<arrays.field_names.length;j++){
                map[arrays.field_names[j]] = arrays.field_values[i][j];
            }
            maps.push(map);
        }
        return maps;
    }

    
    function arrayEquals(a, b) {
        return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
    }

    function getDelta(conditionMap){
        let delta =0,min,max,d;
        let changed =[];
        for (let table in conditionMap){
            for (let i=0;i<conditionMap[table].length;i++){
                d = conditionMap[table][i].length-cachedMap[table][i].length;
                if(min>d || min === undefined){
                    min =d;
                }else if(max<d || max === undefined){
                    max=d;
                }
                delta += Math.abs(d);
                if(d!=0){
                    changed.push(table);
                }
            }
        }
        return {delta:delta,min:min,max:max,changed:Array.from(new Set(changed))};
    }

    function toCachedMap(conditionMap){
        let map = {};
        for (let table in conditionMap){
            // removing fields without constraints
            if(conditionMap[table].length>0){
                // ignoring empty constraints
                map[table]=Array.from(conditionMap[table]);
                while(map[table].indexOf("")!== -1){
                   map[table].remove("");
                }
                if(map[table].length<1){
                    delete map[table];
                }
            }
        }
        return map;
    }

    let defaultToTables = ["name","ivoid","title"];

    function fromCache(conditionMap,changed){
        let vals = Array.from(cache),test;
        return vals.filter((val)=>{
            return changed.every((table)=>{
                return conditionMap[table].every((condition)=>{
                    if(table == "default"){
                        test = false;
                        defaultToTables.forEach((table)=>{
                            test = test || val[table].toLowerCase().includes(condition.toLowerCase().replace("%",""));
                        });
                        return test;
                    }else{
                        return val[table].toLowerCase().includes(condition.toLowerCase().replace("%",""));
                    }
                });
            });
        });
    }

    publicObject.queryData = function(conditionMap){
        conditionMap = toCachedMap(conditionMap);
        //checking if no new constraint fields are set 
        if(cache !== undefined && arrayEquals(Object.keys(conditionMap),Object.keys(cachedMap))){
            //checking if no new constraint as been added to any field
            if(Object.keys(conditionMap).every((table)=>conditionMap[table].length == cachedMap[table].length)){
                let delta = getDelta(conditionMap);
                if(delta.delta == 0){ // conditions are the same
                    return cache;
                // if some chars has been removed the condition is probably less restrictive, we can't assure accuraty of the result in this case
                } else if( delta.delta < 5 && delta.min >= 0){ 
                    return fromCache(conditionMap,delta.changed);
                }
            }
            
        }

        nbRequest++;
        console.log(nbRequest);

        let allCond = publicObject.processConditions(conditionMap);
        cachedMap = conditionMap;

        for (let table in publicObject.defaultConditions){
            if(allCond[table]!== undefined){
                allCond[table] += " AND ( " + publicObject.defaultConditions[table] + " )";
            } else {
                allCond[table] = publicObject.defaultConditions[table];
            }
        }

        api.resetAllTableConstraint();

        for (let table in allCond){
            api.setTableConstraint(table,allCond[table]);
        }

        display(allCond,"codeOutput");

        return api.getTableQuery("resource").then((val)=>{
            let query = val.query;
            console.log(query);
            query = publicObject.getSelect(conditionMap) + query.substr(query.toLowerCase().indexOf(" from "));

            display(query,"querrySend");
            return api.query(query).then((val)=>{
                display(val,"codeOutput");
                cache = arraysToMaps(val);
                return Array.from(cache);
            });
        });
        
        
    };

    return publicObject;

};

/**
 * 
 * @param {*} input jQuery object from where the research string will be collected.
 * @param {*} output jQuery object where the list will be outputed.
 * @param {*} parser string parser used to parse the string from the input must have a `parseString` method taking.
 * a string as argument return type depend on the queryier.
 * @param {*} queryier queryier use to get the data to build the result list must have a `queryData` (can be async) method taking as argument the object
 * returned by the parser, the queryier return type is an array of object where each object will be passed to the elemBuilder to build each
 * element of the list.
 * @param {*} elemBuilder builder use to create each element of the html output list taking as input a element of the array returned by the queryier.
 * @param {*} handler handler which may take as argument the same object sent to the elemBuilder, a jQuery object representing
 * the object which has been clicked and a jQuery EventObject.
 */
var searchBar = function(input,output,parser,queryier,elemBuilder,handler){ //TO-DO : use a class
    output.html("<ul class = '' role='listbox' style='text-align: center; border-radius: 4px;"+
    "border: 1px solid #aaaaaa;padding:0;margin: 0.5em'> </ul>");
    let list = $("ul",output);

    let promList = [];

    input.keyup((event)=>{
        let parsed = parser.parseString(input.val());
        display(parsed,"codeOutput");
        //if(event.originalEvent.keyCode == 13 ||event.originalEvent.keyCode == 32){
            let data;
            if(promList.length>0){
                data = promList[promList.length-1].then(()=>{
                    return queryier.queryData(parsed);
                });
            }else{
                data = queryier.queryData(parsed);
            }

            let endProcess= (data)=>{
                list.html('');
                for (let i=0;i<data.length;i++){
                    list.append(elemBuilder(data[i]));
                    let last = $(":last-child",list); // the varaiable creation in loop is done on purpose.
                    if(handler !== undefined){
                        last.click((event)=>{
                            handler(data[i],last,event);
                        });
                    }
                }
            };
            if (data.then !== undefined){
                promList.push(data);
                data.then((val)=>{
                    endProcess(val);
                    promList.remove(data);
                });
            } else {
                endProcess(data);
            }
            
        //}
    });
};

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
        "capability":"rr.capability.standard_id='ivo://ivoa.net/std/tap'",
        "interface":"(rr.interface.intf_type = 'vs:paramhttp' AND rr.interface.url_use ='base')"
    }; 

    api.selectField("short_name","resource",false);

    function simpleStringMerger(conditions,base){
        let condition = "";
        for (let i=0;i<conditions.length;i++){
            if(condition.length>0){
                condition += " OR ";
            }
            if(conditions[i].indexOf("%")==-1){
                condition += base + "= " + conditions[i];
            }else {
                condition += "UPPER(" + base + ") LIKE " + conditions[i].toUpperCase();
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
        "name":{tableName:"resource",conditionBase:"rr.resource.short_name ",transform:simpleStringFormator,merger:simpleStringMerger},
        "ivoid":{tableName:"resource",conditionBase:"rr.resource.ivoid ",transform:simpleStringFormator,merger:simpleStringMerger},
        "desc":{tableName:"resource",conditionBase:"rr.resource.res_description ",transform:simpleStringFormator,merger:simpleStringMerger},
        "title":{tableName:"resource",conditionBase:"rr.resource.res_title ",transform:simpleStringFormator,merger:simpleStringMerger},
        "role_ivoid":{tableName:"res_role",conditionBase:"rr.res_role.role_ivoid ",transform:simpleStringFormator,merger:simpleStringMerger},
        "subject":{tableName:"res_subject",conditionBase:"rr.res_subject.res_subject ",transform:simpleStringFormator,merger:simpleStringMerger},
        "subject_uat":{tableName:"subject_uat",conditionBase:"rr.subject_uat.uat_concept ",transform:simpleStringFormator,merger:simpleStringMerger},
        "table_name":{tableName:"res_table",conditionBase:"rr.res_table.table_name ",transform:simpleStringFormator,merger:simpleStringMerger},
        "table_desc":{tableName:"res_table",conditionBase:"rr.res_table.table_description ",transform:simpleStringFormator,merger:simpleStringMerger},
        "utype":{tableName:"res_table",conditionBase:"rr.res_table.table_utype ",transform:simpleStringFormator,merger:simpleStringMerger},
        "url":{tableName:"interface",conditionBase:"rr.interface.access_url ",transform:simpleStringFormator,merger:simpleStringMerger},
        "default":{
            tableName:"resource",
            conditionBase:"rr.resource.short_name ::rr.resource.ivoid ::rr.resource.res_title ",
            transform:lazyStringFormator,
            merger:multiTableStringMerger
        },
    };

    function dataToHtmlList(data){
        let dat;
        let li;
        dat = $.extend({},data);
        li= "<li style='border-radius: 4px; margin: 0.5em;" +
            "border: 1px solid #aaaaaa;background: #ffffff 50% 50%;color: #222222;'>" + 
            "[" + dat.name +"]" +dat.title + "<br><small>" + dat.url + "<br>" + dat.ivoid;
        delete dat.name;
        delete dat.title;
        delete dat.url;
        delete dat.ivoid;
        for (let field in dat){
            li += "<br>" + field + " : " + dat[field]; 
        }
        li += "</small></li>";
        return li;
    }

    searchBar(
        $("#searchBar"),
        $("#resultList"),
        StringParser(Object.keys(allowedFieldsMap),":"),
        dataQueryier(api,allowedFieldsMap,defaultConditions),
        dataToHtmlList
    );
}

$(document).ready(()=>{
    syncIt( ()=>{
        setupEventHandlers();
    });
    
});

