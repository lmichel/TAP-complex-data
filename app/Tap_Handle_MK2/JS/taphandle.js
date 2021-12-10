
let tree; // temporary export

async function OnRadioChange(radio){
    if(isEnable("label_" + radio.value)){
        disableButton("label_" + radio.value);
        let api = new jw.Api();
        let params = jw.KnowledgeTank.getDescriptors().descriptors[radio.value];
        let connect = await api.connectService(params.tapService,radio.value);
        if(connect.status){
            tree.append(api,params);

            successButton("label_" + radio.value);
            return;
        }
        console.error(connect);
        errorButton("label_" + radio.value);
    }
}

function specSB(...args){
    jw.widget.SearchBar.call(this,...args);
}

specSB.prototype = Object.create(jw.widget.SearchBar.prototype,{
    processEvent : {
        value:function(){
            let val = this.input.val().trim();
            let url = false;
            if(val.startsWith("http")){
                url = true;
                val = val.substring(val.indexOf(":")+1);
            }else if(val.startsWith("//")){
                url = true;
            }
            if(url){
                this.processUrl("%" + val);
            }else{
                jw.widget.SearchBar.prototype.processEvent.call(this);
            }
        }
    },
    processUrl : {
        value: function(url){
            
            let parsed = {url:[url]};

            this.logger.info("processing url");
            let processed = this.processor.processConditions(parsed);

            let data;
            this.logger.info("Gathering data");
            if (this.promList.length > 0) {
                data = this.promList[this.promList.length - 1].then(() => {
                    return this.querier.queryData(processed, this.logger);
                });
            } else {
                data = this.querier.queryData(processed, this.logger);
            }

            if (data.then !== undefined) {
                this.promList.push(
                    data.then((val) => {
                        this.output.push(val);
                        this.promList.remove(data);
                    })
                );
                return this.promList[this.promList.length - 1];
            } else {
                this.output.push(data);
                return;
            }
        }
    },
});

async function setupSB(ologger){
    $("#mainButtonHolder").html("<div id='fieldNameBar' style='display:flex;justify-content: space-between;'></div><input id='mainSB' style='width:100%'></input>"+
        "<div id='mainSB_out' style='max-height:350px;overflow:auto;z-index:999;position:absolute;width:100%;left:0;padding:.5em'></div>");
    
    let api = new jw.Api();
    
    await api.connectService("//dc.zah.uni-heidelberg.de/tap/sync","Gavo");

    await api.selectSchema("rr");

    await api.setRootTable("resource");

    let logger = new MyLogger($("#mainSB_out"));

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

    let clickHandlerBuilder=function(dataList){
        return (event)=>{
            ologger.info("connecting to the slected service");
            let dat = dataList[+(event.currentTarget.id.substring(event.currentTarget.id.lastIndexOf("_")+1))];
            dat = $.extend({},dat);
            if(dat.url.startsWith("http")){
                dat.url = dat.url.substring(dat.url.indexOf(":")+1);
            }

            let api = new jw.Api();
            api.connectService(dat.url,dat.name).then((connect)=>{
                if(connect.status){
                    tree.append(api,dat);
                }else{
                    event.currentTarget.style.background = 'red';
                }
                ologger.hide();
            });
        };
    };

    let out = {
        push: function (dataList){
            let dat;
            let li;
            let list = "<ul class = '' role='listbox' style='text-align: center; border-radius: 4px;" +
            "border: 1px solid #aaaaaa;padding:0;margin: 0.5em'>";
            for(let i=0;i<dataList.length;i++){
                dat = $.extend({},dataList[i]);
                li= "<li tabindex='-1' class='clickable' id='list_elem_" + i + "' style='border-radius: 4px; margin: 0.5em;" +
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
            $("#mainSB_out").html(list + "</ul>");
            $("#mainSB_out li").click(clickHandlerBuilder(dataList));
        }
    };

    let sb = new specSB(
        $("#mainSB"),
        out,
        parser,
        processor,
        querier,
        undefined,
        logger
    );

    for (let field in constraintMap){
        if(field[0] == "_")
            continue;
        $("#fieldNameBar").append("<p class='clickable' tabindex='-1' id='searchable_" + field + "' style='padding-left:.5em;margin:0'>" + field + "</p>");
        $("#searchable_" + field).click(()=>{
            $("#mainSB").val($("#mainSB").val() + " " + field + ": " );
        });
    }

    let bound = document.getElementById('mainSB').getBoundingClientRect();
    document.getElementById('mainSB_out').style.top = bound.bottom;

    let list = $("#mainSB_out");
    list.toggle();

    document.getElementById('mainSB').addEventListener('focus', () => {
        setTimeout(()=>{
            list.toggle();
        },200);
    });
    
    document.getElementById('mainSB').addEventListener('blur', () => {
        setTimeout(()=>{
            list.toggle();
        },200);
    });

    return sb;
}

function setupApp(logger){

    tree = new TapTreeList($("#tree"));

    let control ;
    let tablePane = new TablePane($("#tablePane"),logger);

    $(document).on("new_root_table.tree",(event, args)=>{
        if(control === undefined){
            control = new ControlPane();
            setTimeout(()=>{
                control.box.reduce();
            },1000);
        }
        tablePane.setApi(args.api);
        control.setApi(args.api);
    });
    $(document).on("error.application",(...args)=>{
        console.log("error event recieved");
        console.log(args);
    });
    $(document).on("run_query.control",()=>{
        tablePane.refresh();
    });
}

function clickOnFisrtLi(logger){
    let li = $("#mainSB_out li:first-child");
    if(li.length>0){
        li.click();
        return;
    }else{
        logger.hide();
        ModalInfo.error("The provided tap service hasn't been found");
    }
}

$(document).ready(async ()=>{
    let logger = new GlobalLogger();
    logger.info("Setting up everything");
    resourceLoader.setCss([]);
    resourceLoader.setScripts([]);
    await resourceLoader.loadAll().then((result) => {
        // applying IIFE overrides right after jsResources ended his loading
        overrides();
        extend();
    });
    //buildButtonSelector("#mainButtonHolder");
    // ensure no radio button is check by default
    //$("input:radio[name=radio]:checked").prop('checked', false);
    setupSB(logger).then((sb)=>{
        setupApp(logger);
        let params = new URLSearchParams(window.location.search);
        if( params.has("url")){
            logger.info("Connecting to the service");
            let url = params.get("url");
            if(url.startsWith("http")){
                url = url.substring(url.indexOf(":")+1);
            }
            let process = sb.processUrl("%" + url);
            if( process !== undefined && process.then !== undefined){
                process.then(()=>{
                    clickOnFisrtLi(logger);
                });
            }else{
                clickOnFisrtLi(logger);
            }

        }else{
            logger.hide();
        }
    });
    
});