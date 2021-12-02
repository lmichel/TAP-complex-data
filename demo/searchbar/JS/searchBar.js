"use strict;";

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
            condition: new jw.widget.SearchBar.ConstraintsHolder(["vs:paramhttp"],"(rr.interface.intf_type = 'vs:paramhttp')")
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
            merger : jw.widget.SearchBar.mergers.likeMerger(),
            formator : jw.widget.SearchBar.formators.simpleStringFormator
        },
        "name":{column:"short_name"},
        "roleIvoid":{table:"res_role",column:"role_ivoid"},
        "ivoid":{column:"ivoid"},
        "desc":{column:"res_description"},
        "title":{column:"res_title"},
        "subject":{table:"res_subject",column:"res_subject"},
        "subjectUat":{table:"subject_uat",column:"uat_concept"},
        "tableName":{table:"res_table",column:"table_name"},
        "tableDesc":{table:"res_table",column:"table_description"},
        "utype":{table:"res_table",column:"table_utype"},
        "url":{table:"interface",column:"access_url"},
        "noField":{
            aliases : ["name","ivoid","title"],
            column : "short_name",
            formator:jw.widget.SearchBar.formators.fuzzyStringFormator,
            merger : jw.widget.SearchBar.mergers.likeMerger("UPPER"),
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
                    if(field == "noField")
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