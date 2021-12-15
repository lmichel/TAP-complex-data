"use strict;";
// Tree Search widget

class abstractTreeSearchElem{
    constructor(holder,api){
        if(this.constructor == abstractTreeSearchElem){
            throw new TypeError("cant' instanciate abstract class");
        }
        this.api = api;
        this.holder = holder;
        this.buildFrame();
        this.SB = this.createSB();
        this.id = "SW_" + abstractTreeSearchElem.ID++;
        console.log(this.id);
    }

    buildFrame(){
        this.holder.html("<div style='width: 100%;'><div id='output'  style='width: 100%;height:15em;overflow: auto;'></div>" + 
            "<div style = 'display:flex;width: 100%;'><input placeholder='pouette pouette :)' style='width: calc(100% - 3.5em);margin: .5em;margin-right: 0;'></input>"+ 
            "<div id='logger' style='width:2em;height:2em;margin: .5em;'></div></div>");
        this.input = $("input",this.holder);
    }

    getInput(){
        return this.input ;
    }

    getOut(){
        throw new Error("this methods isn't implemented");
    }

    getConstraintMap(){
        throw new Error("this methods isn't implemented");
    }

    setSchema(schema){
        this.getConstraintMap()._default.schema = schema;
    }

    getParser(){
        if(this.parser === undefined){
            this.parser = new jw.widget.SearchBar.StringParser(Object.keys(this.getConstraintMap()),":");
        }
        return this.parser;
    }

    getProcessor(){
        if(this.processor === undefined){
            this.processor = new jw.widget.SearchBar.ConstraintProcessor(this.getConstraintMap(),this.getLogger());
        }
        return this.processor;
    }

    getQuerrirerDefaults(){
        throw new Error("this methods isn't implemented");
    }

    getKeyBuilder(){
        return undefined;
    }

    getQuerier(){
        if( this.querier === undefined){
            this.querier = new jw.widget.SearchBar.Querier(this.api,
                this.getQuerrirerDefaults(),
                this.getKeyBuilder(),
                this.getLogger(),
                false
            );
            let old = this.querier.protected.getSelect.bind(this.querier.protected);
            this.querier.protected.getSelect = (...args)=>{
                let val = old(...args);
                val =  val.replace("SELECT ","SELECT TOP 500 ");
                return val;
            };
        }

        return this.querier;
        
    }

    getTimeout(){
        return undefined;
    }

    getLogger(){
        if(this.logger === undefined){
            this.logger = new TreeSBLogger($("#logger",this.holder));
        }
        return this.logger;
    }

    createSB(){
        return new jw.widget.SearchBar(
            this.getInput(),
            this.getOut(),
            this.getParser(),
            this.getProcessor(),
            this.getQuerier(),
            this.getTimeout(),
            this.getLogger()
        );
    }

    reset(){
        $("#output",this.holder).html("<p>Showing up to 500 tables</p>");
        this.getInput().val("");
    }
}

abstractTreeSearchElem.ID = 0;

class TreeTableSearch extends abstractTreeSearchElem{
    constructor(...args){
        super(...args);
    }
    
    getQuerrirerDefaults(){
        return  {
                    "schemaName":{
                        table:"tables",
                        column:"schema_name",
                    },
                    "tableDesc":{
                        table:"tables",
                        column:"description",
                    },
                    "schemDesc":{
                        table:"schemas",
                        column:"description",
                    },
                    "tableName":{
                        table:"tables",
                        column:"table_name",
                    },
                };
    }

    getConstraintMap(){
        if( this.constraintMap === undefined){
            this.constraintMap = {
                _default : {
                    schema : "", // place holder the true selected schema is updated later
                },
                noField : {
                    table : "tables",
                    column : "table_name",
                    merger : jw.widget.SearchBar.mergers.likeMerger(),
                    formator : jw.widget.SearchBar.formators.fuzzyStringFormator
                }
            };
        }
        return this.constraintMap;
    }

    getOut(){
        let that = this;
        return {
            push: function (dataList){
                let dat;
                let map = {};
                for(let i=0;i<dataList.length;i++){
                    dat = dataList[i];
                    if(map[dat.schemaName] === undefined){
                        map[dat.schemaName] = {desc:dat.schemDesc,tables:[]};
                    }
                    map[dat.schemaName].tables.push(["<input type='checkbox' id='" + vizierToID(dat.schemaName) + "_check_" + vizierToID(dat.tableName) + 
                    "' style='margin:.4em' checked>",dat.tableName,dat.tableDesc]);
                }

                $("#output",that.holder).html("<p>Showing up to 500 tables</p>");

                let options = {
                    "aaData":[],
                    "aoColumns":["","name","description"].map((e)=>{
                        return {
                            "sTitle":e};
                        }),
                    "bPaginate": false,
                    "aaSorting" : [],
                    "bSort" : false,
                    "bFilter" : true,
                    /*"aLengthMenu": [],*/
                    "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
                        if(aData[2].length > 24 ) {
                            let value = aData[2].replace(/'/g,"&#146;");
                            $("td:eq(2)",nRow).html("<span title=' - " + value + "' style =' cursor: pointer;' onclick='ModalInfo.info(\"" + value + "\", \"Full Value\");'>" + value.substring(0, 23) + " ...</span>");
                        }                      
                        return nRow;
                    }
                };

                let positions = [
                    { "name": 'filter',
                        "pos" : "top-right"
                    }
                ];

                let arr;
                let colaps;
                let tableID;
                for (let schema in map){
                    colaps = new CollapsableDiv($("#output",that.holder),vizierToID(schema),false,undefined,
                        [
                            {pos:"right",txt:map[schema].desc,type:"desc",monoline:true,weight:4},
                            {
                                toDom:"<input type='checkbox' id='" + vizierToID(schema) + "_check" + 
                                "' style='margin:.4em' checked>",
                                pos:"left"
                            },
                            {txt:schema,type:"title",pos:"left"},
                        ],
                        "title",
                        false
                    );
                    options.aaData = map[schema].tables;

                    tableID = that.id + "modal_datatable_" + vizierToID(schema);
                    colaps.div.append("<table id=\"" + tableID + "\" class=\"display\"></table>");
                    
                    CustomDataTable.create(tableID, options, positions);
            
                    $("table#" + tableID,that.holder)[0].style.width = "fit-content";
                    $("#"+ tableID + "_wrapper input.filter-result",colaps.div)[0].style = "padding: .1em;font-size: 1em;padding-left: .5em;";

                    $("#"+tableID+" th",colaps.div).each((i,e)=>{
                        e.style.width = "unset";
                    });
                    
                    $("#"+tableID+" tr",colaps.div).each((i,e)=>{
                        e.id = vizierToID(schema);
                    });
                    // auto margin makes magin left and right being equals
                    let width = parseFloat(window.getComputedStyle($("#"+tableID+" th:eq(2)",colaps.div)[0], null).getPropertyValue('width')) + 
                        parseFloat(window.getComputedStyle($("#"+tableID,colaps.div)[0], null).getPropertyValue('margin-left'))*2;
                    
                    $("#"+tableID+" th:eq(2)",colaps.div)[0].style.width = width;

                    let oWidth,a,b,c,text, i;
                    let oDelta;
                    let spans = $("#"+tableID+" span",colaps.div);
                    let limit = spans.length > 50;
                    let max = spans.length > 200 ? 0:(spans.length >100 ? 2 : 5);
                    spans.each((i,e)=>{
                        arr = e.title.split(" - ");
                        if(e.parentElement.nodeName == "TD"){
                            // some description have some " - " inside them making arr[1] not containing the whole text this is why I create a special var for the text
                            // for some reason clientWidth works better than offsetWidth better stick on that 
                            oWidth = e.parentElement.clientWidth;
                            text = e.title.replace(" - ","");
                            oDelta = oWidth - e.offsetWidth;

                            // small optimisation loop by re-using values computed with the last cell (probably close to what we are looking for)
                            if(c!==undefined){
                                e.textContent = text.substr(0,c);
                                if(oWidth<e.parentElement.clientWidth){
                                    b=c;
                                    a=27;
                                }else{
                                    a=c;
                                    b=arr[1].length;
                                    if(a>b){
                                        a=b;
                                    }
                                }
                            }else{
                                a=27;
                                b=arr[1].length;
                            }
                            i = 0;
                            while (b-a>1 && (!limit || i<max)){
                                i++;
                                c = Math.floor((b+a)/2);
                                e.textContent = text.substr(0,c);
                                if(oWidth<e.parentElement.clientWidth){
                                    b=c;
                                }else{
                                    a=c;
                                }
                            }
                            c=limit ? a:b;

                            if(c<text.length){
                                e.textContent = text.substr(0,c-4)+" ...";
                            }else{
                                e.textContent = text.substr(0,c);
                            }
                            let safe = 0;
                            // this value is the minimal difference between e.offsetWidth and e.parentElement.clientWidth
                            let padmarg = parseFloat(window.getComputedStyle(e, null).getPropertyValue('margin-left')) + 
                                parseFloat(window.getComputedStyle(e.parentElement, null).getPropertyValue('margin-right')) +
                                parseFloat(window.getComputedStyle(e.parentElement, null).getPropertyValue('padding-left')) + 
                                parseFloat(window.getComputedStyle(e.parentElement, null).getPropertyValue('padding-right'));

                            // this computation aims to ensure that the final data table will be able to shrink enought to let some space for a scroll bar 
                            // while not reducing text beyond what they where before this whole process 

                            // this process have a least a flaw : this can occur multiple times per row leading to more free space than what could be required 

                            if(oDelta> oWidth - e.offsetWidth && c>27){
                                if(oDelta>=padmarg + DraggableBox.scrollWidth){
                                    safe = DraggableBox.scrollWidth;
                                }
                            }
                            while(oWidth<(e.offsetWidth + padmarg +safe)){
                                c--;
                                e.textContent = text.substr(0,c-4)+" ...";
                            }

                            if(c==text.length){
                                arr = [""];
                                delete e.onclick;
                            }

                        }
                        arr[0] ="<h3>" + arr[0].trim() + "</h3>";
                        // replace only replace the first occurence
                        e.title = arr.join("<br>").replace("<br>","").replace("<h3></h3>","");
                    });

                    $("#"+tableID+" span:not([title=''])",colaps.div).tooltip({ 
                        template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
                        html:true,
                        customClass :"ressource-tooltip",
                    });
                    
                    let checkSchem = $("input",colaps.header);
                    let checkTable = $("input[type=checkbox]",colaps.div);

                    checkSchem.click(()=>{
                        if(checkSchem.is(":checked")){
                            checkTable.each((i,e)=>{
                                e.checked = true;
                            });
                        }else{
                            checkTable.each((i,e)=>{
                                e.checked = false;
                            });
                        }
                    });
                    checkTable.each((i,e)=>{
                        e.checked = true;
                    });
                    checkTable.change(()=>{
                        let allchecked = true;
                        let allunchecked = true;
                        checkTable.each((i,e)=>{
                            allchecked &= e.checked;
                            allunchecked &= !e.checked;
                            return allchecked || allunchecked;
                        });
                        if(allchecked){
                            checkSchem.prop("checked",true);
                            checkSchem.prop("indeterminate",false);
                        } else if(allunchecked){
                            checkSchem.prop("checked",false);
                            checkSchem.prop("indeterminate",false);
                        }else{
                            checkSchem.prop("indeterminate",true);
                        }
                        
                    });
                }

                that.getLogger().status("Results are up to date",TreeSBLogger.STATUS_OK);
            }
        };
    }
}

class TreeSchemaSearch extends TreeTableSearch{
    getConstraintMap(){
        if( this.constraintMap === undefined){
            this.constraintMap = {
                _default : {
                    schema : "", // place holder the true selected schema is updated later
                },
                noField : {
                    table : "tables",
                    column : "schema_name",
                    merger : jw.widget.SearchBar.mergers.likeMerger(),
                    formator : jw.widget.SearchBar.formators.fuzzyStringFormator
                }
            };
        }
        return this.constraintMap;
    }
}
/**
 * TODO : 
 * Add Logger
 * Build the modal itself
 * validation and reset buttons 
 * make the logger update
 * 
 */

class TreeSearch{
    constructor(){
        this.api = new jw.Api();
        this.last = (async ()=>{})();
        this.buildModal();
    }

    buildModal(){
        let header = '<div class="modal-header"><h5 class="modal-title"></h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>';

        let body = '<div class="modal-body" id="multiTabDiv" style="width: 100%;">' +
        '<ul><li><a href="#table">Tables</a></li><li><a href="#schema" >Schema</a></li></ul>'+ 
        '<div id="schema" style="justify-content: center;display: flex;"></div>'+ 
        '<div id="table" style="justify-content: center;display: flex;"><p> Start searching by typing in the search bar below </p></div></div>';

        let footer = '<div style="width: 100%; display: flex;justify-content: center;align-items: center;">'+
            '<button class="btn btn-primary" style="margin: 0.5em;margin-right:0;width: 100%;" id="btnApply">Apply</button>'+
            '<button class="btn btn-primary" style="margin: 0.5em;width: 100%;" id="btnReset">Reset</button></div>';

        this.id = ModalInfo.getNextID();
        let modal = ModalInfo.buildModal(
            this.id,
            header,
            body,
            footer
        );
        $("body").append(modal);
        $("#" + this.id +" #multiTabDiv").tabs();
        this.modal = new bootstrap.Modal($("#" + this.id)[0]);

        $("#btnApply").click(()=>{
            let filter = [];
            $("#" + this.id + " table input:checked:visible").closest("tr").each((i,e)=>{
                filter.push({schemaName:atob(e.id.replace(/_/g,"/").replace(/-/g,"+")),noField:$("td:eq(1)",e).text()});
            });
            if(filter.length>0){
                this.tree.filter(filter);
            }
        });
        $("#btnReset").click(()=>{
            $("#" + this.id + " input:visible").prop("checked",true).prop("indeterminate",false);
            this.tree.resetFilter();
        });
    }


    setFilteringData(connector,tree){
        this.connector = connector;
        $("#" + this.id + " h5.modal-title").text("Table Selection for " +  connector.shortName);
        this.tree = tree;
        let current = this.api.getConnector().connector;
        if(current === undefined || current.service.tapService != connector.tapService){
            this.last = this.last.then(()=>{return this.connect(connector);});
        }
        return this.last;
    }

    async connect(){
        await this.api.connectService(this.connector.tapService);
        let schema = Object.keys(this.tree.getSchemas()).filter(v=>v.match(/TAP_SCHEMA/i))[0];
        let upper= true;
        
        await this.api.selectSchema(schema);

        if( this.tableSearch == undefined){
            this.tableSearch = new TreeTableSearch($("#" + this.id + " #table"),this.api);
        }else{
            this.tableSearch.reset();
        }

        if( this.schemaSearch == undefined){
            this.schemaSearch = new TreeSchemaSearch($("#" + this.id + " #schema"),this.api);
        }else{
            this.schemaSearch.reset();
        }

        this.tableSearch.getConstraintMap()._default.schema = schema;
        this.schemaSearch.getConstraintMap()._default.schema = schema;

        //this.logger.info("checking case insensitive function");
        let val = await this.api.query('SELECT UPPER(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables');
        if(val.status){
            this.tableSearch.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("UPPER");
            this.schemaSearch.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("UPPER");
        }else {
            val = await this.api.query('SELECT uppercase(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables');
            if(val.status){
                this.tableSearch.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("uppercase");
                this.schemaSearch.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("uppercase");
            }else {
                this.tableSearch.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("");
                this.schemaSearch.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("");
                upper = false;
            }
        }
        //tree.logger.info("Setting up the search bar");
        await this.api.setRootTable("tables");

    }

    show(){
        this.modal.show();
    }
}
