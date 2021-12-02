var ExtraDrawer ={
    "data":{},
    "eventMap":{},
    "drawExtra" : function(holder,nodeID,drawer,events = ["redraw.jstree"]){
        for(let i=0;i<holder.length;i++){
            for (let j=0;j<events.length;j++){
                if(ExtraDrawer.data[holder[i]] === undefined){
                    ExtraDrawer.data[holder[i]] = {};
                }
                if(ExtraDrawer.data[holder[i]][events[j]] === undefined){
                    ExtraDrawer.data[holder[i]][events[j]] = {};
                    $(holder[i]).on(events[j],ExtraDrawer.reDrawer(holder[i],events[j]));
                }
                if(ExtraDrawer.data[holder[i]][events[j]][nodeID] === undefined){
                    ExtraDrawer.data[holder[i]][events[j]][nodeID] = [];
                }
                ExtraDrawer.data[holder[i]][events[j]][nodeID].push(drawer);
            }
        }
        drawer(nodeID);
    },
    "reDrawer" : function(holder,eventName){
        return function(event,node){
            if( node.nodes){
                for (let i=0;i<node.nodes.length;i++){

                    if(ExtraDrawer.data[holder][eventName][node.nodes[i]] !== undefined){

                        for (let j=0;j<ExtraDrawer.data[holder][eventName][node.nodes[i]].length;j++){

                            ExtraDrawer.data[holder][eventName][node.nodes[i]][j](node.nodes[i]);
                        }
                    }
                }
            } else if(node.node) {
                if(ExtraDrawer.data[holder][eventName][node.node.id] !== undefined){

                    for (let j=0;j<ExtraDrawer.data[holder][eventName][node.node.id].length;j++){

                        ExtraDrawer.data[holder][eventName][node.node.id][j](node.node.id);
                    }
                }
            }
        };
    }
};

var TapTree = function(){

    /**
     * 
     * @param {jw.Api} api 
     */
    function TapTree(api,tree,rootHolder,logger,meta={}){
        this.api = api;
        this.tree = tree;
        this.rootHolder = rootHolder;
        this.meta = meta;
        this.logger = logger;
        this.partial = {}; // store state of partially loaded schemas

        this.short_name = api.getConnector().connector.service.shortName;
        this.treeID = tree.create_node("#",{
            "text":this.short_name,
            "icon": "./images/database.png",
            "a_attr":{
                "title":"Double click to filter the visible tables"
            },
        });

        let that = this;
        rootHolder.on("select_node.jstree",(event,object)=>{
            if(object.node.parents.length>2){
                if(object.node.parents[object.node.parents.length-2]==this.treeID){
                    api.setRootTable(object.node.text).then(val=>{
                        if(val.status){
                            $(document).trigger("new_root_table.tree",{
                                api:api,
                                tree:that,
                            });
                        } else {
                            $(document).trigger("error.application",{
                                error : val.error,
                                origin : that,
                            });
                        }
                    });
                }
            }
        });

        this.filterMap = {};
        this.filtered = false;

        this.root = tree.get_node("#" + this.treeID);

        let schemas = api.getSchemas();
        if(schemas.status){
            let safeSchem;
            schemas = schemas.schemas;
            this.schemas = schemas;

            let pos,icon,tap = false;
            for (let schema in schemas){
                icon = "./images/baseCube.png";
                pos = "last";
                if(schema.match(/TAP_SCHEMA/i) ) {
                    icon = "./images/redCube.png";
                    pos= "first";
                    tap = true;
                } else if(schema.match(/ivoa/i) ) {
                    icon =  "./images/greenCube.png";
                    pos= tap ?1:"first";
                }

                safeSchem = vizierToID(schema);
                    tree.create_node(this.root,{
                        "text":schema,
                        "id":this.treeID + "_" + safeSchem,
                        "icon": icon,
                    },
                    pos,
                );

                tree.create_node(tree.get_node("#" + this.treeID + "_" + safeSchem),{
                    "id":this.treeID + "_" + safeSchem + "_dummy",
                    "text": "loading...",
                    "icon": "http://i.stack.imgur.com/FhHRx.gif",
                });

                rootHolder.on("before_open.jstree",this.schemaHandlerFactory(schema,safeSchem));
            }
        }else{
            console.error(schemas);
        }
        /*/ Auto redraw of schemas and service info  /*/
        ExtraDrawer.drawExtra(rootHolder,this.treeID,(id)=>{
            $("#" + id + "_anchor").before("<img id='" + id + "_meta' class='metadata' src='./images/info.png' title='Show metadata (Does not work with Vizier)'/>");
            $("#" + id + "_meta").click(this.serviceMetaDataShowerFactory());


            let span = '<span style="font-style: normal; font-size: x-small ; background-color:';
            $("#" + id + "_anchor").after("<span id='" + id + "_info'></span>");
            let infoSpan = $("#" + id + "_info");

            infoSpan.append(span + 'lightgreen;" title="Support synchronous queries">S</span>');
            infoSpan.append(span + 'lightgreen;" title="Support ADQL joins">J</span>'); // TODO test if it's not a lie ...
            infoSpan.append(span + 'grey; color:white" title="The application does not support asynchronous queries">A</span>');
            infoSpan.append(span + 'grey; color:white" title="The application does not support table upload">U</span>');
        });
    }

    TapTree.prototype.getSchemas = function(){
        return this.schemas;
    };

    TapTree.prototype.schemaHandlerFactory = function(schema,safeSchem){
        let fun = async (event,node) => {
            let nodeID = this.treeID + "_" + safeSchem;
            if(node.node.id == nodeID){
                this.rootHolder.off({"before_open.jstree":fun});
                let schem = await this.api.selectSchema(schema);
                if(schem.status){
                    let schemas = this.api.getSchemas();
                    if(schemas.status){
                        this.schemas = schemas.schemas;
                        let tables = this.schemas[schema].tables;

                        let toClose = Array.from(this.tree.get_node("#").children);

                        let wasOpen = [];
                        let node;

                        for(let i=0;i<toClose.length;i++){
                            node = this.tree.get_node(toClose[i]);
                            if(this.tree.is_open(node)){
                                wasOpen.push(node);
                                this.tree.close_node(node,false);
                            }
                        }

                        let partial = this.loadNodes(schema,nodeID);
                        this.applyFilter([schema]);
                        this.tree.delete_node(this.tree.get_node(nodeID+ "_dummy"));
                        
                        for(let i=0;i<wasOpen.length;i++){
                            this.tree.open_node(wasOpen[i],undefined,false);
                        }

                        ExtraDrawer.drawExtra(this.rootHolder,nodeID,this.reDrawerFactory(safeSchem,tables),["before_open.jstree","after_open.jstree"]);
                        ExtraDrawer.drawExtra(this.rootHolder,this.treeID,this.reDrawerFactory(safeSchem,tables),["before_open.jstree"]);
                        if(partial){
                            this.rootHolder.on("before_open.jstree",fun);
                        }
                    }else {
                        alert(tables.error.logs);
                    }
                }else {
                    alert(schem);
                }
            }
        };
        return fun;
    };

    TapTree.prototype.loadNodes= function(schema,nodeID){
        let tables = this.schemas[schema].tables;
        
        // when data is filtered we limit how much tables we put in the tree at once
        let partial = false, inTree = 0;
        if(this.partial[schema] !== undefined){
            inTree = this.partial[schema].size;
        }
        if(Object.keys(tables).length - inTree >200 && this.filtered){
            tables = {};
            for (let table in this.schemas[schema].tables){
                // tables contains arround 200 entries or has many as required by the filtermap
                if( !(inTree>0 && this.partial[schema].has(table)) && (this.filterMap[schema].includes(table) || Object.keys(tables).length<(200-this.filterMap[schema].length))){
                    tables[table] = this.schemas[schema].tables[table];
                }
            }
            console.log('loading only ' + Object.keys(tables).length + " nodes ");
            partial = true;
        }else if(inTree>0){
            for (let table in this.schemas[schema].tables){
                if(!this.partial[schema].has(table)){
                    tables[table] = this.schemas[schema].tables[table];
                }
            }
            partial = true;
        }

        if(partial && inTree == 0){
            this.partial[schema] = new Set();
        }

        let node = this.tree.get_node(nodeID);
        // each string concat create a new instance of string when done too many time in a small time span this cause the GC to work hard
        let node_ = nodeID + "_";
        for (let table in tables){
            tableSafe = vizierToID(table);
            this.tree.create_node(node,{
                "id":node_ + tableSafe,
                "text":table,
                "a_attr":{
                    "title":tables[table].description
                },
                "icon": false,
            });
            if(partial){
                this.partial[schema].add(table);
            }
        }
        //if partial is true but we have put every tables in the tree then it is not partial anymore
        if(partial && this.partial[schema].size == Object.keys(tables).length ){
            delete this.partial[schema];
            return false;
        }
        return partial;
    };


    TapTree.prototype.reDrawerFactory = function(safeSchem,tables){
        let that = this;
        return (id)=>{
            let tableSafe;
            for(let table in tables){
                tableSafe = vizierToID(table);
                if($("#" + that.treeID + "_" + safeSchem + "_" + tableSafe + "_meta").length == 0){
                    $("#" + that.treeID + "_" + safeSchem + "_" + tableSafe + "_anchor").before("<img id='" + that.treeID + "_" + safeSchem + "_" + tableSafe + 
                        "_meta' class='metadata' src='./images/info.png' title='Show metadata (Does not work with Vizier)'/>");
                    if(tables[table].type === "view"){
                        $("#" + that.treeID + "_" + safeSchem + "_" + tableSafe + "_anchor").before("<img id='" + that.treeID + "_" + safeSchem + "_" + tableSafe + 
                            "_view' src='./images/viewer_23.png' title='this table is defined as a view, query may be slower than usual ...'/>");
                        $("#" + that.treeID + "_" + safeSchem + "_" + tableSafe +"_view" ).click(that.tableMetaDataShowerFactory(table));
                    }
                }
            }
        };
    };

    TapTree.prototype.getID = function(){
        return this.treeID;
    };

    // factory patern needed because of `this` which doesn't represent a TapTree anymore when the method is used as an external handler ...
    TapTree.prototype.serviceMetaDataShowerFactory = function(){
        let that = this;
        return ()=>{
            ModalInfo.infoObject({"Info":this.meta},this.short_name).show();
        };
    };

    TapTree.prototype.tableMetaDataShowerFactory = function(table){
        return () => {};
    };

    TapTree.prototype.resetFilter = function(){
        this.filtered = false;
        this.filterMap = {};
        this.tree.show_all();
        let safeSchem;
        let schemNode;
        for (let schem in this.schemas){
            safeSchem = vizierToID(schem);
            schemNode = this.tree.get_node("#" + this.treeID + "_" + safeSchem);
            if(this.tree.is_open(schemNode)){
                this.tree.close_node(schemNode,false);
                this.tree.open_node(schemNode);
            }
        }
        this.logger.status("No filter applied, results are up to date",TreeSBLogger.STATUS_OK);
    };

    TapTree.prototype.applyFilter = function(){
        if(!this.filtered){
            return;
        }
        this.logger.info("Showing search results ...");

        // tables of each schema are cached there if a table isn't cached we can't have a node for it
        let schemas = this.api.getSchemas();
        if(schemas.status){
            this.schemas = schemas.schemas;
        }

        let toHide=[],wasOpen=[];

        let safeSchem;
        let safeTable;

        for(let schem in this.schemas){ // hiding or showing individual nodes takes ages so we minimise the work
            safeSchem = vizierToID(schem);
            if(this.filterMap[schem]=== undefined){
                toHide.push(this.treeID + "_" + safeSchem);
            }else{
                if(this.schemas[schem].tables !== undefined){
                    // praise boolean optimisation this block of code will be executed if and only if all tables aren't in the tree and partial[schem] still exist
                    if(this.partial[schem] !== undefined && this.loadNodes(schem,this.treeID + "_" + safeSchem)){
                        for (let table in this.schemas[schem].tables ){
                            if(!this.filterMap[schem].includes(table) &&this.partial[schema].has(table)){
                                safeTable = vizierToID(table);
                                toHide.push(this.treeID + "_" + safeSchem + "_" + safeTable);
                            }
                        }
                    }else{
                        for (let table in this.schemas[schem].tables ){
                            if(!this.filterMap[schem].includes(table)){
                                safeTable = vizierToID(table);
                                toHide.push(this.treeID + "_" + safeSchem + "_" + safeTable);
                            }
                        }
                    }
                    
                }
            }
        }

        let toClose = Array.from(this.tree.get_node("#").children);

        let node;
        for(let i=0;i<toClose.length;i++){
            node = this.tree.get_node(toClose[i]);
            if(this.tree.is_open(node)){
                wasOpen.push(node);
                this.tree.close_node(node,false);
            }
        }

        this.tree.show_all();

        for(let i =0;i<toHide.length;i++){
            this.tree.hide_node(this.tree.get_node(toHide[i]));
        }

        for(let i=0;i<wasOpen.length;i++){
            this.tree.open_node(wasOpen[i],undefined,false);
        }
        
        this.logger.status("Results are up to date",TreeSBLogger.STATUS_OK);
    };

    TapTree.prototype.filter = function(filter){
        this.filtered = true;
        let schemas = Array.from(new Set(filter.map(x=>x.schemaName)));
        this.filterMap = schemas.map(s=>{
            let v ={};
            v[jw.Api.safeQualifier([s]).qualified]=filter.reduce((p,c)=>{
                if(c.schemaName == s){
                    p.push(utils.unqualifyName(c.noField,s));
                }
                return p;
            },[]);
            return v;
        }).reduce((o,n)=>{
            for(let k in n){
                o[k] = n[k];
            }
            return o;
        },{});

        this.applyFilter();

    };

    return TapTree;
}();

var TapTreeList = function(){

    function TapTreeList(holder){
        this.holder = holder;
        
        this.holder.html(
            '<div style="display:flex;flex-flow: column;flex-grow: 1;"><div style="display:flex">'+
            // 3.5 = 2 (logger width) + 0.5 (input left margin) + 0.5 (logger left margin) + 0.5(logger right margin)
            '<input id="searchBar" type="text" autocomplete="off" style="width: calc(100% - 3.5em);margin: .5em;margin-right: 0;" >'+ 
            '<div id="logger" style="width:2em;height:2em;margin: .5em;"></div></div><div style="overflow:auto;"> <div id="tree"></div></div></div>');
        $("input",this.holder).prop( "disabled", true );
        this.logger = new TreeSBLogger($("#logger",this.holder));
        this.treeHolder = $("#tree",holder);
        this.treeMap={};

        this.protected = {
            constraintMap:{
                _default : {
                    schema : "", // place holder the true selected schema is updated later
                },
                noField : {
                    table : "tables",
                    column : "table_name",
                    merger : jw.widget.SearchBar.mergers.likeMerger(),
                    formator : jw.widget.SearchBar.formators.fuzzyStringFormator
                }
            },
            barApi : new jw.Api(),
            sBarOut : {
                push:(data)=>{
                    if(data.length ==0 || data[0].noField !== undefined){
                        this.protected.sBarOut.pusher(data);
                    }else {
                        this.protected.sBarOut.reset();
                    }
                },
                pusher:()=>{},
                reset : ()=>{}
            }
        };

        this.treeHolder.jstree({
            'core' : {
                'check_callback' : ()=>true
            }
        });
        this.tree = this.treeHolder.jstree(true);
        this.treeHolder.on("activate_node.jstree",(event,node)=>{
            node = node.node;
            let ID = node.parents.length == 1 ? node.id : node.parents[node.parents.length-2];
            let tree = this.treeMap[Object.keys(this.treeMap).filter(id=>this.treeMap[id].tree.getID()==ID)];
            this.protected.connectSearchBar(tree);
        });
        registerProtected(this);
        this.logger.status("the tree is initialized, please add a service to start using the tree, select one to enable the search Bar",TreeSBLogger.STATUS_INFO);
    }

    /**
     * 
     * @param {TapTreeList} tree 
     */
    function registerProtected(tree){
        tree.protected.connectSearchBar = function(map){
            let connector = map.api.getConnector().connector.service;
            if(tree.protected.barApi.getConnector().connector !== undefined && 
                connector.tapService == tree.protected.barApi.getConnector().connector.service.tapService){
                return;
            }

            $("input",tree.holder).prop( "disabled", true );
            tree.protected.barApi.connectService(connector.tapService).then(()=>{
                tree.logger.info("connecting the search bar to the selected service");
                let schema = Object.keys(map.tree.getSchemas()).filter(v=>v.match(/TAP_SCHEMA/i))[0];
                let upper= true;
                tree.protected.constraintMap._default.schema = schema;
                tree.protected.barApi.selectSchema(schema).then(()=>{
                    tree.protected.barApi.query('SELECT UPPER(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables').then( (val)=>{
                        tree.logger.info("checking case insensitive function");
                        if(val.status){
                            tree.protected.constraintMap.noField.merger = jw.widget.SearchBar.mergers.likeMerger("UPPER");
                        }else {
                            return tree.protected.barApi.query('SELECT uppercase(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables').then((val)=>{
                                if(val.status){
                                    tree.protected.constraintMap.noField.merger = jw.widget.SearchBar.mergers.likeMerger("uppercase");
                                }else {
                                    tree.protected.constraintMap.noField.merger = jw.widget.SearchBar.mergers.likeMerger("");
                                    upper = false;
                                }
                            });
                        }
                    }).then(()=>{
                        tree.logger.info("Setting up the search bar");
                        tree.protected.barApi.setRootTable("tables").then((val)=>{
                            if( val.status){
                                tree.protected.sBarOut.pusher = map.tree.filter.bind(map.tree);
                                tree.protected.sBarOut.reset = map.tree.resetFilter.bind(map.tree);
                                if(tree.protected.searchBar === undefined){
                                    let querier = new jw.widget.SearchBar.Querier(tree.protected.barApi,
                                        {
                                            "schemaName":{
                                                table:"tables",
                                                column:"schema_name",
                                            },
                                        },
                                        undefined,
                                        tree.logger,
                                        false
                                    );
                                    let processor = new jw.widget.SearchBar.ConstraintProcessor(tree.protected.constraintMap,tree.logger);
                                    let parser = new jw.widget.SearchBar.StringParser(Object.keys(tree.protected.constraintMap),":");
                                    tree.protected.searchBar = new jw.widget.SearchBar(
                                        $("input",tree.holder),
                                        tree.protected.sBarOut,
                                        parser,
                                        processor,
                                        querier,
                                        undefined,
                                        tree.logger
                                    );
                                } else {
                                    tree.protected.searchBar.processEvent();
                                }
                                $("input",tree.holder).prop( "disabled", false );
                                tree.logger.status("The search bar has been succefully initialized and connected",TreeSBLogger.STATUS_OK);
                            }else {
                                tree.logger.status("Unable to connect the search bar to the select service",TreeSBLogger.STATUS_ERROR);
                            }
                        });
                    });
                });
            });
        };
    }

    /**
     * @param {jw.Api} tap 
     */
    TapTreeList.prototype.contains = function(tap){
        if(!tap.getConnector().status){
            return false;
        }
        return this.treeMap[tap.getConnector().connector.service.tapService] !== undefined;
    };

    /**
     * @param {jw.Api} tap 
     */
    TapTreeList.prototype.append = function(tap,meta){
        let connector = tap.getConnector();
        if(connector.status && !this.contains(tap)){
            this.treeMap[connector.connector.service.tapService]= {"tree": new TapTree(tap,this.tree,this.treeHolder,this.logger,meta),"api":tap};
        }
        return connector.status;
    };

    return TapTreeList;
}();