"use strict;";
// Tree Search widget

class abstractTreeSearchElem{
    constructor(holder,api){
        if(this.constructor == abstractTableSearchElem){
            throw new TypeError("cant' instanciate abstract class");
        }
        this.api = api;
        this.holder = holder;
        this.buildFrame();
        this.SB = this.createSB();
    }

    buildFrame(){
        this.holder.html("<div><div id='output'></div>" + 
            "<div style = 'display:flex'><input style='width: calc(100% - 3.5em);margin: .5em;margin-right: 0;'></input>"+ 
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
    }

    getProcessor(){
        if(this.processor === undefined){
            this.processor = new jw.widget.SearchBar.ConstraintProcessor(this.getConstraintMap(),this.getLogger());
        }
        return this.processor;
    }

    getQuerrirerDefalts(){
        throw new Error("this methods isn't implemented");
    }

    getKeyBuilder(){
        return undefined;
    }

    getQuerier(){
        if( this.querier === undefined){
            this.querier = new jw.widget.SearchBar.Querier(this.api,
                getQuerrirerDefalts(),
                getKeyBuilder(),
                this.getLogger(),
                false
            );
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
        $("#output").html("");
        this.getInput().val("");
    }
}

class TreeTableSearch extends abstractTreeSearchElem{
    constructor(...args){
        super(...args);
    }
    
    getQuerrirerDefalts(){
        return  {
                    "schemaName":{
                        table:"tables",
                        column:"schema_name",
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
        return {
            push: function (dataList){
                let dat;
                let li;
                let list = "<ul class = '' role='listbox' style='text-align: center;padding:0;margin: 0'>";
                for(let i=0;i<dataList.length;i++){
                    dat = $.extend({},dataList[i]);
                    li= "<li tabindex='-1' class='clickable' id='list_elem_" + i + "' style='border-radius: 4px; margin: 0.5em;" +
                        "border: 1px solid #aaaaaa;background: #ffffff 50% 50%;color: #222222;'>" + 
                        "[" + dataList.schemaName + "]" + dat.tables + "</li>";
                    list += li;
                }
                $("#output").html(list + "</ul>");
            }
        };
    }
}
/**
 * TODO : 
 * Add Logger
 * Build the modal itself
 * validation and reset buttons 
 * 
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

        let body = '<div class="modal-body" id="multiTabDiv" style="width: 100%;>' +
        '<ul><li><a href="#table">Tables</a></li><li><a href="#schema" >Schema</a></li></ul>'+ 
        '<div id="schema" style="justify-content: center;display: flex;"></div>'+ 
        '<div id="table" style="justify-content: center;display: flex;"></div></div>';

        let footer = '<div style="width: 100%; display: flex;justify-content: center;align-items: center;">'+
            '<button class="btn btn-dark" style="margin-top: 0.5em;width: 100%;" id="btnApply">Apply</button>'+
            '<button class="btn btn-dark" style="margin-top: 0.5em;width: 100%;" id="btnReset">Reset</button></div>';

        this.id = ModalInfo.getNextID();
        let modal = ModalInfo.buildModal(
            this.id,
            header,
            body,
            footer
        );
    }


    setFilteringData(connector,tree){
        this.connector = connector;
        this.tree = tree;
        let current = this.api.getConnector().connector;
        if(current === undefined || current.service.tapService != connector.tapService){
            this.last = this.last.then(()=>{this.connect(connector);});
        }
        return this.last;
    }

    async connect(){
        await this.api.connectService(this.connector.tapService);
        let schema = Object.keys(this.tree.getSchemas()).filter(v=>v.match(/TAP_SCHEMA/i))[0];
        let upper= true;
        
        this.getConstraintMap()._default.schema = schema;
        await this.api.selectSchema(schema);

        //this.logger.info("checking case insensitive function");
        let val = await this.api.query('SELECT UPPER(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables');
        if(val.status){
            this.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("UPPER");
        }else {
            val = await this.api.query('SELECT uppercase(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables');
            if(val.status){
                this.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("uppercase");
            }else {
                this.getConstraintMap().noField.merger = jw.widget.SearchBar.mergers.likeMerger("");
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
