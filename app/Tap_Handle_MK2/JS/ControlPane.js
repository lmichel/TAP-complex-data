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
        $(this.box.body).html('<div style="justify-content: center;display: flex;flex-flow:column" id="controlPane"><div id="multiTabDiv" style="width: 100%;">' +
            '<ul><li><a href="#where">Where</a></li><li><a href="#pos" id="poslink">Position</a></li><li><a href="#query">Adql Query</a></li></ul>'+ 
            '<div id="where" style="justify-content: center;display: flex;"><div id="tapColEditor" style="display: flex;padding: .2em;"></div></div>' +
            '<div id="pos" style="justify-content: center;display: flex;"><div id="tapConeEditor" style="display: flex;padding: .2em;"></div></div>' +
            '<div id="query" style="text-align: left;display:grid;"></div></div><div style="display :none" id="adql_query_div"></div><button class="btn btn-primary" style="margin-top: 7px;width: 100%;" id="btnRunQuery">Run the Query</button></div>'
        );
        
        $("#multiTabDiv",this.box.body).tabs();
        $("#btnRunQuery",this.box.body).click(()=>{
            $(document).trigger("run_query.control",{});
        });
        $("li",this.box.body).click(()=>{
            console.log("click LI");
            this.box.snap();
        });
        $("a",this.box.body).click(()=>{
            this.box.snap();
        });

    }

    async buildEditors(){

        let tables = this.api.getJoinedTables(undefined,Number.MAX_SAFE_INTEGER);
        if(tables.status){
            tables = Object.keys(tables.joined_tables);
        }else{
            $(document).trigger("error.application",{
                error : tables.error,
                origin : this,
            });
            return;
        }

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
        if($("h3" , this.box.header).length == 0){
            $(this.box.header).prepend("<h3> " + connect.shortName + ": " + connect.schema + " </h3>");
        }else{
            $(this.box.header).children(h3).html(connect.shortName + ": " + connect.schema);
        }
        

        tables.unshift(connect.table);

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

        this.where = QueryConstraintEditor.complexConstraintEditor({
            parentDivId:'tapColEditor',
            formName: 'tapFormColName',
            sesameUrl:"sesame",
            upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}} ,
            queryView: this.compat,
            complexEditor: this.queryEditor,
            tables:tables,
        });

        this.pos = QueryConstraintEditor.ComplexPosConstraintEditor({
            parentDivId:'tapConeEditor',
            formName: 'tapFormConeName',
            sesameUrl:"schnaps",
            upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}} ,
            queryView: this.compat,
            complexEditor: this.queryEditor,
        });

        let dt = {"nodekey":connect.shortName, "schema": connect.schema, "table": connect.table, "tableorg": connect.table};

        $(document).on("cone_search_update_table.control",(e,args)=>{
            
            $("select#table_choice").val(args.table).change();
            if(!$(this.box.body).is(":visible")){
                this.box.reduce();
                if(!$("#pos",this.box.body).is(":visible")){
                    $("#poslink",this.box.body).click();
                }
            }
        });

        $("#pos .input-group *",this.box.body).remove();
        $("#pos .input-group",this.box.body).html("<select style='width:100%' id='table_choice'></select>");

        for (let i=0;i<tables.length;i++){
            $("select#table_choice",this.box.body).append("<option value='" + tables[i] + "'>" + tables[i] + "</option>");
        }

        $("select#table_choice",this.box.body).change(()=>{
            let cp = $.extend({},dt);
            cp.tableorg = $("select#table_choice").val();
            cp.table = cp.tableorg;
            this.pos.fireSetTreepath(new DataTreePath(cp));
            $(this.box.header).children("h3").html( connect.shortName + ": " + connect.schema + " (" + cp.table + ")");
        });

        $("#poslink").click(()=>{
            $(this.box.header).children("h3").html( connect.shortName + ": " + connect.schema + " (" + $("select#table_choice").val() + ")");
        });

        $("a:not([id=poslink])",this.box.body).click(()=>{
            $(this.box.header).children("h3").html( connect.shortName + ": " + connect.schema);
        });
        
        this.where.fireSetTreepath(new DataTreePath(dt));
        this.pos.fireSetTreepath(new DataTreePath(dt));

        this.where.model.updateQuery();
    }
}