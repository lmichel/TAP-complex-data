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
    let api = new jw.Api();
    
    await api.connectService("//dc.zah.uni-heidelberg.de/tap/sync","Gavo");

    await api.selectSchema("rr");

    await api.setRootTable("resource");

    let logger = new MyLogger($("#resultList"));

    /**
     * Default conditions and fields
     */
    let defaults = {
        "_capa":{
            table:"capability",
            column:"standard_id",
            condition: new jw.widget.SearchBar.ConstraintsHolder(["ivo://ivoa.net/std/tap"],"rr.capability.standard_id='ivo://ivoa.net/std/tap'")
        },
        "_int":{
            table:"interface",
            column:"url_use",
            condition: new jw.widget.SearchBar.ConstraintsHolder(["vs:paramhttp"],"(rr.interface.intf_type = 'vs:paramhttp' AND rr.interface.url_use ='base')")
        },
        "name":{
            table:"resource",
            column:"short_name",
        },
        "ivoid":{
            table:"resource",
            column:"ivoid",
        },
        "url":{
            table:"interface",
            column:"access_url",
        },
        "title":{
            table:"resource",
            column:"res_title",
        },
    };

    api.selectField("short_name","resource",false);

    let querier = new jw.widget.SearchBar.Querier(api,defaults,data=>data.url,logger);

    let constraintMap = {
        "_default": {
            table : "resource",
            schema : "rr",
            merger : jw.widget.SearchBar.mergers.likeMerger,
            formator : jw.widget.SearchBar.formators.simpleStringFormator
        },
        "name":{column:"short_name"},
        "roleIvoid":{column:"role_ivoid"},
        "ivoid":{column:"ivoid"},
        "desc":{column:"res_description"},
        "title":{column:"res_title"},
        "subject":{tableName:"res_subject",column:"res_subject"},
        "subjectUat":{tableName:"subject_uat",column:"uat_concept"},
        "tableName":{tableName:"res_table",column:"table_name"},
        "tableDesc":{tableName:"res_table",column:"table_description"},
        "utype":{tableName:"res_table",column:"table_utype"},
        "url":{tableName:"interface",column:"access_url"},
        "default":{
            aliases : ["name","ivoid","title"],
            formator:jw.widget.SearchBar.formators.lazyStringFormator,
        },
    };

    let processor = new jw.widget.SearchBar.ConstraintProcessor(constraintMap,logger);

    let parser = new jw.widget.SearchBar.StringParser(Object.keys(constraintMap).filter(v=>v[0]!=="_"),":");

    let out = {
        push: function (dataList){
            let dat;
            let li;
            let list = "<ul class = '' role='listbox' style='text-align: center; border-radius: 4px;" +
            "border: 1px solid #aaaaaa;padding:0;margin: 0.5em'>";
            console.log(dataList);
            for(let i=0;i<dataList.length;i++){
                dat = $.extend({},dataList[i]);
                li= "<li style='border-radius: 4px; margin: 0.5em;" +
                    "border: 1px solid #aaaaaa;background: #ffffff 50% 50%;color: #222222;'>" + 
                    "[" + dat.name +"]" +dat.title + "<br><small>" + dat.url + "<br>" + dat.ivoid;
                delete dat.name;
                delete dat.title;
                delete dat.url;
                delete dat.ivoid;
                for (let field in dat){
                    if(field[0] == "_")
                        continue;
                    li += "<br>" + field + " : " + dat[field]; 
                }
                li += "</small></li>";
                list += li;
            }
            $("#resultList").html(list + "</ul>");
        }
    };

    //ouba ouba c'est lui name: le marsupilami utype: marsupiale url:%terre://amazonie/"hute au marsu"

    new jw.widget.SearchBar(
        $("#searchBar"),
        out,
        parser,
        processor,
        querier,
        undefined,
        new MyLogger($("#resultList"))
    );

    for (let field in constraintMap){
        if(field[0] == "_")
            continue;
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