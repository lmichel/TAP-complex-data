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
    function TapTree(api,tree,rootHolder,SB,meta={}){
        this.api = api;
        this.SB = SB;
        this.tree = tree;
        this.rootHolder = rootHolder;
        this.meta = meta;
        this.partial = {}; // store state of partially loaded schemas

        this.short_name = api.getConnector().connector.service.shortName;
        this.treeID = tree.create_node("#",{
            "text":this.short_name,
            "icon": "./images/database.png",
            "a_attr":{
                "title":"Double click to filter the visible tables"
            },
        });

        this.time = Date.now();
        let that = this;
        rootHolder.on("select_node.jstree",(event,object)=>{
            if(object.node.id ==this.treeID){
                // JStree keep changing the doms element so we need to recreate the double click event
                // TODO make this timing configurable
                if(Date.now() - this.time<200){
                    $("#" + this.treeID + "_meta").prop("src","http://i.stack.imgur.com/FhHRx.gif");
                    this.SB.setFilteringData(this.api.getConnector().connector.service,this).then(()=>{
                        this.SB.show();
                        $("#" + this.treeID + "_meta").prop("src","./images/info.png");
                    });
                }else{
                    that.time = Date.now();
                }
            }
            if(object.node.parents.length>2){
                if(object.node.parents[object.node.parents.length-2]==this.treeID){
                    let schem =  atob(object.node.parents[0].substr(this.treeID.length+1).replace(/_/g,"/").replace(/-/g,"+"));
                    if(object.node.text == "Unexpected Error"){
                        return;
                    }
                    api.selectSchema(schem).then((value)=>{
                        if( value.status){
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
                        }else{
                            $(document).trigger("error.application",{
                                error : value.error,
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
                    "icon": "//i.stack.imgur.com/FhHRx.gif",
                });

                rootHolder.on("before_open.jstree",this.schemaHandlerFactory(schema,safeSchem));
            }
        }else{
            console.error(schemas);
        }
        /*/ Auto redraw of schemas and service info  /*/
        ExtraDrawer.drawExtra(rootHolder,this.treeID,(id)=>{
            $("#" + id + "_anchor").before("<img id='" + id + "_meta' class='metadata' src='./images/info.png' title='Show metadata'/>");
            $("#" + id + "_meta").click(this.serviceMetaDataShowerFactory());


            let span = '<span style="font-size: .8em ; background-color:';
            $("#" + id + "_anchor").after("<span id='" + id + "_info'></span>");
            let infoSpan = $("#" + id + "_info");

            infoSpan.append(span + 'lightgreen;" title="Support synchronous queries">S</span>');
            infoSpan.append(span + 'lightgreen;" title="Support ADQL joins">J</span>'); // TODO test if it's not a lie ...
            infoSpan.append(span + '#6f6f6f; color:white" title="The application does not support asynchronous queries">A</span>');
            infoSpan.append(span + '#6f6f6f; color:white" title="The application does not support table upload">U</span>');
        });
    }

    TapTree.prototype.close = function(){
        this.tree.close_node(this.root);
    };

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

                        ExtraDrawer.drawExtra(this.rootHolder,nodeID,this.reDrawerFactory(safeSchem,tables,schema),["before_open.jstree","after_open.jstree"]);
                        ExtraDrawer.drawExtra(this.rootHolder,this.treeID,this.reDrawerFactory(safeSchem,tables,schema),["before_open.jstree"]);
                        if(partial){
                            this.rootHolder.on("before_open.jstree",fun);
                        }
                    }else {
                        $(document).trigger("error.application",{
                            error : tables.error,
                            origin : this,
                        });
                    }
                }else {
                    this.tree.delete_node(this.tree.get_node(nodeID+ "_dummy"));
                    this.tree.create_node(this.tree.get_node("#" + this.treeID + "_" + safeSchem),{
                        "id":this.treeID + "_" + safeSchem + "_error",
                        "text": "Unexpected Error",
                        "icon": "./images/red.png",
                    });
                    $(document).trigger("error.application",{
                        error : schem.error,
                        origin : this,
                    });
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


    TapTree.prototype.reDrawerFactory = function(safeSchem,tables,schema){
        let that = this;
        return (id)=>{
            let tableSafe;
            for(let table in tables){
                tableSafe = vizierToID(table);
                if($("#" + that.treeID + "_" + safeSchem + "_" + tableSafe + "_meta").length == 0){
                    $("#" + that.treeID + "_" + safeSchem + "_" + tableSafe + "_anchor").before("<img id='" + that.treeID + "_" + safeSchem + "_" + tableSafe + 
                        "_meta' class='metadata' src='./images/info.png' title='Show metadata (Does not work with Vizier)'/>");

                    that.bindMetaDataShower($("#" + that.treeID + "_" + safeSchem + "_" + tableSafe +"_meta" ),table,schema);
                    if(tables[table].type === "view"){
                        $("#" + that.treeID + "_" + safeSchem + "_" + tableSafe + "_anchor").before("<img id='" + that.treeID + "_" + safeSchem + "_" + tableSafe + 
                            "_view' src='./images/viewer_23.png' title='this table is defined as a view, query may be slower than usual querying by position on this table may take a while'/>");
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
            $("#modal_"+ModalInfo.counter + " .modal-content").append(
                "<div style='width: 100%; display: flex;justify-content: center;align-items: center;'>"+
                "<button class='btn btn-primary' style='margin: 0.5em;width: 100%;' id='btnDiconnect'>Disconnect this service</button></div>"
            );
            $("#modal_"+ModalInfo.counter +" #btnDiconnect").click(()=>{
                that.tree.delete_node(that.root);
                $(document).trigger("remove_service.tree",{
                    api:that.api,
                    tree:that,
                });
            });
        };
    };

    TapTree.prototype.bindMetaDataShower = function(obj,table,schema){
        let that = this;
        let fun =() => {
            obj.off({"click":fun});
            let conn = this.api.getConnector().connector.service;
            if(conn.schema == schema){
                if(conn.table === undefined){
                    this.api.setRootTable(table);
                }
            }
            let src = obj.attr("src");
            obj.attr("src","//i.stack.imgur.com/FhHRx.gif");
            MetaDataShower(that.api,table,conn.schema == schema,schema).then(()=>{
                obj.attr("src",src);
                obj.click(fun);
            });
        };
        obj.click(fun);
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
    };

    TapTree.prototype.applyFilter = function(){
        if(!this.filtered){
            return;
        }

        // tables of each schema are cached there if a table isn't cached we can't have a node for it
        let schemas = this.api.getSchemas();
        if(schemas.status){
            this.schemas = schemas.schemas;
        }

        let toHide=[],wasOpen=[];

        let safeSchem;
        let safeTable;

        for(let schem in this.schemas){ // hiding or showing individual nodes takes ages so we minimise the work
            if(schem.match(/TAP_SCHEMA/i) ||schem.match(/ivoa/i) ) { // never hiding IVOA and tap_schema schemas
                continue;
            }
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
            '<div style="display:flex;flex-flow: column;flex-grow: 1;"><div style="overflow:auto;"><div id="tree"></div></div></div>');
        $("input",this.holder).prop( "disabled", true );
        this.treeHolder = $("#tree",holder);
        this.treeMap={};

        this.protected = {
            sb : new TreeSearch(),
        };

        this.treeHolder.jstree({
            'core' : {
                'check_callback' : ()=>true
            }
        });
        this.tree = this.treeHolder.jstree(true);
        registerProtected(this);

        let that = this;

        $(document).on("remove_service.tree",(event, args)=>{
            let connector = args.api.getConnector();
            if(connector.status){
                delete that.treeMap[connector.connector.service.tapService];
            }
        });
    }

    /**
     * 
     * @param {TapTreeList} tree 
     */
    function registerProtected(tree){}

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
            for(let tree in this.treeMap){
                this.treeMap[tree].tree.close();
            }
            this.treeMap[connector.connector.service.tapService]= {"tree": new TapTree(tap,this.tree,this.treeHolder,this.protected.sb,meta),"api":tap};
        }
        return connector.status;
    };

    return TapTreeList;
}();