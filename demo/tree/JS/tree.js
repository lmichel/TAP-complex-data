"use strict;";

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

class TreeSBLogger extends MyLogger {
    constructor(div){
        super(div);
        this.STATUS_OK = "ok";
        this.STATUS_INFO = "info";
        this.STATUS_ERROR = "error";
        this.statusIconMap={
            "info":"./images/info.png",
            "ok":"./images/check.png",
            "error":"./images/red.png",
        };
    }

    log(...log) {
        let out = this.split(...log);
        if(out.text.length>0){
            console.log(out.text);
        }
        if(out.objects.length>0){
            console.log(out.objects);
        }
    }
    info(...log){
        let out = this.split(...log);
        if(out.text.length>0){
            this.div.html("<div class='cv-spinner'><span class='spinner' title='" + out.text +"'></span></div>");
        }
        if(out.objects.length>0){
            this.log(out.objects);
        }
    }
    status(statusText,statusType){
        this.div.html("<img style='background-position: center center;background-size: auto;background-repeat:no-repeat;vertical-align: top;height:100%;width:100%' src='" +
            this.statusIconMap[statusType]+"' title='" + statusText +"'></img>");
    }
}

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

        this.short_name = api.getConnector().connector.service.shortName;
        this.treeID = tree.create_node("#",{
            "text":this.short_name,
            "icon": "./images/database.png",
            "a_attr":{
                "title":"Double click to filter the visible tables"
            },
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
            if(node.node.id == this.treeID + "_" + safeSchem){
                this.rootHolder.off({"before_open.jstree":fun});
                let schem = await this.api.selectSchema(schema);
                if(schem.status){
                    let tables = this.api.getTables();
                    let tableSafe;
                    if(tables.status){
                        let node = this.tree.get_node("#" + this.treeID + "_" + safeSchem);
                        tables = tables.tables;
                        if(Object.keys(tables).length>500){
                            this.tree.close_node(node);
                        }
                        for (let table in tables){
                            tableSafe = vizierToID(table);
                            this.tree.create_node(node,{
                                "id":this.treeID + "_" + safeSchem + "_" + tableSafe,
                                "text":table,
                                "a_attr":{
                                    "title":tables[table].description
                                },
                                "icon": false,
                            });
                        }
                        this.applyFilter();
                        if(Object.keys(tables).length>500){
                            this.tree.open_node(node);
                        }
                        this.tree.delete_node(this.tree.get_node("#" + this.treeID + "_" + safeSchem + "_dummy"));
                        ExtraDrawer.drawExtra(this.rootHolder,this.treeID + "_" + safeSchem,this.reDrawerFactory(safeSchem,tables),["before_open.jstree","after_open.jstree"]);
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
        this.logger.status("No filter applied, results are up to date",this.logger.STATUS_OK);
    };

    TapTree.prototype.applyFilter = function(){
        if(!this.filtered){
            return;
        }
        this.tree.show_all();
        this.logger.info("Showing search results ...");

        // tables of each schema are cached there if a table isn't cached we can't have a node for it
        let schemas = this.api.getSchemas();
        if(schemas.status){
            this.schemas = schemas.schemas;
        } 
        let safeSchem;
        let schemNode;
        let wasOpen;
        let toClose;
        for (let schem in this.schemas){
            safeSchem = vizierToID(schem);
            schemNode = this.tree.get_node("#" + this.treeID + "_" + safeSchem);
            if(this.filterMap[schem]=== undefined){
                this.tree.hide_node(schemNode);
            } else {
                if(this.schemas[schem].tables !== undefined){
                    let safeTable;
                    wasOpen =this.tree.is_open(schemNode);
                    toClose = true;
                    if(Object.keys(this.schemas[schem].tables).length>500 && wasOpen){
                        
                        this.tree.close_node(schemNode,false);
                        toClose = false;
                    }
                    for (let table in this.schemas[schem].tables ){
                        if(!this.filterMap[schem].includes(table)){
                            safeTable = vizierToID(table);
                            this.tree.hide_node(this.tree.get_node("#" + this.treeID + "_" + safeSchem + "_" + safeTable));
                        }
                    }
                    if(wasOpen){
                        if(toClose){
                            this.tree.close_node(schemNode,false);
                        }
                        this.tree.open_node(schemNode);
                    }
                }
            }
        }

        this.logger.status("Results are up to date",this.logger.STATUS_OK);
    };

    TapTree.prototype.filter = function(filter){
        this.filtered = true;
        let schemas = Array.from(new Set(filter.map(x=>x.schema)));
        this.filterMap = schemas.map(s=>{
            let v ={};
            v[jw.Api.safeQualifier([s]).qualified]=filter.reduce((p,c)=>{
                if(c.schema == s){
                    p.push(utils.unqualifyName(c.default,s));
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
        
        this.holder.html('<div style="display:flex;flex-flow: column;flex-grow: 1;"><div style="display:flex"><input id="searchBar" type="text" autocomplete="off" style="width: 90%;margin: .5em;" ><div id="logger" style="width:10%;height:100%;padding: .5em;"></div></div><div id="tree"></div></div>');
        $("input",this.holder).prop( "disabled", true );
        this.logger = new TreeSBLogger($("#logger",this.holder));
        this.treeHolder = $("#tree",holder);
        this.treeMap={};

        this.protected = {
            constraintMap:{
                _default : {
                    schema : "",
                },
                default : {
                    table : "tables",
                    column : "table_name",
                    merger : jw.widget.SearchBar.mergers.likeMerger(),
                    formator : jw.widget.SearchBar.formators.fuzzyStringFormator
                }
            },
            barApi : new jw.Api(),
            sBarOut : {
                push:(data)=>{
                    if(data.length ==0 || data[0].default !== undefined){
                        this.protected.sBarOut.cache = data;
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
        this.logger.status("the tree is initialized, please add a service to start using the tree, select one to enable the search Bar",this.logger.STATUS_INFO);
    }

    /**
     * 
     * @param {TapTreeList} tree 
     */
    function registerProtected(tree){
        tree.protected.connectSearchBar = function(map){
            $("input",tree.holder).prop( "disabled", true );
            let connector = map.api.getConnector().connector.service;
            
            tree.protected.barApi.connectService(connector.tapService).then(()=>{
                tree.logger.info("connecting the search bar to the selected service");
                let schema = Object.keys(map.tree.getSchemas()).filter(v=>v.match(/TAP_SCHEMA/i))[0];
                let upper= true;
                tree.protected.constraintMap._default.schema = schema;
                tree.protected.barApi.selectSchema(schema).then(()=>{
                    tree.protected.barApi.query('SELECT UPPER(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables').then( (val)=>{
                        tree.logger.info("checking case insensitive function");
                        if(val.status){
                            tree.protected.constraintMap.default.merger = jw.widget.SearchBar.mergers.likeMerger("UPPER");
                        }else {
                            return tree.protected.barApi.query('SELECT uppercase(TAP_SCHEMA.tables.table_name) FROM TAP_SCHEMA.tables').then((val)=>{
                                if(val.status){
                                    tree.protected.constraintMap.default.merger = jw.widget.SearchBar.mergers.likeMerger("uppercase");
                                }else {
                                    tree.protected.constraintMap.default.merger = jw.widget.SearchBar.mergers.likeMerger("");
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
                                            "schema":{
                                                table:"tables",
                                                column:"schema_name",
                                            },
                                        },
                                        undefined,
                                        tree.logger
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
                                tree.logger.status("The search bar has been succefully initialized and connected",tree.logger.STATUS_OK);
                            }else {
                                tree.logger.status("Unable to connect the search bar to the select service",tree.logger.STATUS_ERROR);
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

let tree;

/*/ Trigers function for radio button /*/

function OnRadioChange(radio) {
    syncIt(async ()=>{
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
        
    });
}

function setupEventHandlers(){

}

$(document).ready(function() {
    syncIt(async ()=>{
        buildButtonSelector("#mainButtonHolder");
        // ensure no radio button is check by default
        $("input:radio[name=radio]:checked").prop('checked', false);
        tree = new TapTreeList($("#tapTree"));
        setupEventHandlers();
    });
});