class ControlPane{

    constructor(){
        this.box = new DraggableBox();
        this.reset();
        this.api=undefined;
    }

    setApi(api){
        this.api=api;
        this.reset();
        this.buildEditors();
    }

    reset(){
        $(this.box.body).html('<div style="justify-content: center;display: flex;" id="controlPane"><div id="multiTabDiv" style="width: 100%;">' +
            '<ul><li><a href="#what">Select what</a></li><li><a href="#where">Where</a></li><li><a href="#query">Adql Query</a></li></ul>' +
            '<div id="what" style="justify-content: center;display: flex;"><div id="tapColSelector" style="display: flex;padding: .2em;"></div></div>' +
            '<div id="where" style="justify-content: center;display: flex;"><div id="tapColEditor" style="display: flex;padding: .2em;"></div></div>' +
            '<div id="query" style="text-align: left;"></div></div><div style="display :none" id="adql_query_div"></div></div>'
        );
        
        $("#multiTabDiv",this.box.body).tabs();
    }

    async buildEditors(){

        let object_map = this.api.getObjectMap();
        if(object_map.status){
            object_map=object_map.object_map;
        }else{
            $(document).trigger("error.application",{
                error : object_map.error,
                origin : this,
            });
            return;
        }
        
        let tables = Object.keys(object_map.tables);

        let connect = this.api.getConnector();
        if(connect.status){
            connect=connect.connector.service;
        }else{
            $(document).trigger("error.application",{
                error : connect.error,
                origin : this,
            });
            return;
        }

        let t =await this.api.getTablesAttributeHandlers(tables);
        if(!t.status){
            console.log(t.error.logs);
        }

        let treepath = {"nodekey":connect.shortName, "schema": connect.schema};
        for (let i =0;i<tables.length;i++){
            // remember to always hijack the cache before risquing using it.
            await MetadataSource.hijackCache($.extend({ "table": tables[i], "tableorg": tables[i]},treepath),this.api);
        }

        this.compat = QueryConstraintEditor.adqlTextEditor({ parentDivId: 'adql_query_div', defaultQuery: ''});

        this.queryEditor = new ComplexQueryEditor(this.api, $("#query"));

        this.what = QueryConstraintEditor.complexColumnSelector({
            parentDivId:'tapColSelector',
            formName: 'tapFormColSelector',
            queryView: this.compat,
            complexEditor: this.queryEditor
        });

        this.where = QueryConstraintEditor.complexConstraintEditor({
            parentDivId:'tapColEditor',
            formName: 'tapFormColName',
            sesameUrl:"sesame",
            upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}} ,
            queryView: this.compat,
            complexEditor: this.queryEditor,
            tables:tables,
            colSelector:this.what,
        });

        let dt = {"nodekey":connect.shortName, "schema": connect.schema, "table": connect.table, "tableorg": connect.table};

        this.where.fireSetTreepath(new DataTreePath(dt));
        this.what.fireSetTreepath(new DataTreePath(dt));

        let fields = await this.api.getSelectedFields(connect.table);
        fields=fields.fields;
        let ah = (await this.api.getTableAttributeHandlers(connect.table));
        ah = ah.attribute_handlers;
        
        this.what.select(ah.filter(val=>fields.includes(val.nameattr)));

        this.where.model.updateQuery();
    }
}