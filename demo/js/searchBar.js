"use strict;";

class MyLogger extends Logger {
    constructor(div) {
        super();
        this.div = div;
    }
    split(...args){
        let objects = [],text = "";
        for( let i=0;i<args.length;i++){
            if(typeof args[i] === "object"){
                objects.push(args[i]);
            } else if(typeof args[i] === "string"){
                text += args[i];
            } else {
                text += String(args[i]);
            }
        }
        return {objects:objects,text:text};
    }
    log(...log) {
        let out = this.split(...log);
        if(out.text.length>0){
            display(out.text,"querrySend");
        }
        if(out.objects.length>0){
            display(out.objects,"codeOutput");
        }
    }
    info(...log){
        let out = this.split(...log);
        if(out.text.length>0){
            let writing = $("p#logger_text", this.div);
            if (writing.length < 1) {
                this.div.html("<div class='cv-spinner'><span class='spinner'></span> <p id='logger_text'></p></div>");
                writing = $("p#logger_text", this.div);
            }
            writing.html(out.text);
        }
        if(out.objects.length>0){
            display(out.objects,"codeOutput");
        }

    }
}

async function setupEventHandlers(){
    let api = new TapApi();
    
    await api.connectService("//dc.zah.uni-heidelberg.de/tap/sync","Gavo");

    await api.selectSchema("rr");

    await api.setRootTable("resource");

    // default conditions
    let defaultConditions ={
        "capability":"rr.capability.standard_id='ivo://ivoa.net/std/tap'",
        "interface":"(rr.interface.intf_type = 'vs:paramhttp' AND rr.interface.url_use ='base')"
    }; 

    api.selectField("short_name","resource",false);

    //ouba ouba c'est lui name: le marsupilami utype: marsupiale url:%terre://amazonie/"hute au marsu"

    
    /*searchBarName:{tableName,conditionBase,type:("string","number"),transform,merger}
    * `transform` is a function called on each sub conditions before the merger gets called
    * `merger` is a function taking an array of (possibly one or more but not empty) condition and the base constraint 
    * to return a single string which will be use as condition
    */
    let allowedFieldsMap = {
        "name":{tableName:"resource",conditionBase:"rr.resource.short_name ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "roleIvoid":{tableName:"res_role",conditionBase:"rr.res_role.role_ivoid ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "ivoid":{tableName:"resource",conditionBase:"rr.resource.ivoid ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "desc":{tableName:"resource",conditionBase:"rr.resource.res_description ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "title":{tableName:"resource",conditionBase:"rr.resource.res_title ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "subject":{tableName:"res_subject",conditionBase:"rr.res_subject.res_subject ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "subjectUat":{tableName:"subject_uat",conditionBase:"rr.subject_uat.uat_concept ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "tableName":{tableName:"res_table",conditionBase:"rr.res_table.table_name ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "tableDesc":{tableName:"res_table",conditionBase:"rr.res_table.table_description ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "utype":{tableName:"res_table",conditionBase:"rr.res_table.table_utype ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "url":{tableName:"interface",conditionBase:"rr.interface.access_url ",
            transform:formatorRegistry.simpleStringFormator,
            merger:mergerRegistry.simpleStringMerger
        },
        "default":{
            tableName:"resource",
            conditionBase:"rr.resource.short_name ::rr.resource.ivoid ::rr.resource.res_title ",
            transform:formatorRegistry.lazyStringFormator,
            merger:mergerRegistry.multiTableStringMerger
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
        dataQueryier(
            api,
            allowedFieldsMap,
            defaultConditions,
            {"default":["name","ivoid","title"]},
            {
                "rr.resource.res_title ":"title",
                "rr.interface.access_url ":"url",
                "rr.resource.ivoid ":"ivoid",
                "rr.resource.short_name ":"name"
            },
            (data)=> data.url
        ),
        dataToHtmlList,
        undefined,
        undefined,
        new MyLogger($("#resultList"))
    );

    for (let field in allowedFieldsMap){
        $("#fieldNameBar").append("<p id='searchable_" + field + "' style='padding-left:.5em;'>" + field + "</p>");
        $("#searchable_" + field).click(()=>{
            $("#searchBar").val($("#searchBar").val() + " " + field + ": " );
        });
    }
}

$(document).ready(()=>{
    syncIt( ()=>{
        setupEventHandlers();
    });
    
});