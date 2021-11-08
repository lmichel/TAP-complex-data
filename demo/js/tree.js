"use strict;";

var ExtraDrawer ={
    "data":{},
    "drawExtra" : function(holder,nodeID,drawer){
        for(let i=0;i<holder.length;i++){
            if(ExtraDrawer.data[holder[i]] === undefined){
                ExtraDrawer.data[holder[i]] = {};
                $(holder[i]).on("redraw.jstree",ExtraDrawer.reDrawer(holder[i]));
            }
            if(ExtraDrawer.data[holder[i]][nodeID] === undefined){
                ExtraDrawer.data[holder[i]][nodeID] = [];
            }
            ExtraDrawer.data[holder[i]][nodeID].push(drawer);
        }
        drawer(nodeID);
    },
    "reDrawer" : function(holder){
        return function(event,node){
            for (let i=0;i<node.nodes.length;i++){

                if(ExtraDrawer.data[holder][node.nodes[i]] !== undefined){

                    console.log("ID ok");
                    for (let j=0;j<ExtraDrawer.data[holder][node.nodes[i]].length;j++){

                        ExtraDrawer.data[holder][node.nodes[i]][j](node.nodes[i]);
                    }
                }
            }
        };
    }
};

function vizierToID(schema){
    let chars = ["'",'"',"(","<","{","\\","/","}",">",")","*","$","^","`"];
    for (let i=0;i<chars.length;i++){
        schema = replaceAll(schema,chars[i],"");
    }
    return schema;
}

var TapTree = function(){

    /**
     * 
     * @param {TapApi} api 
     */
    function TapTree(api,tree,rootHolder){
        this.api = api;
        this.tree = tree;
        this.rootHolder = rootHolder;

        let short_name = api.getConnector().connector.service.shortName;
        this.treeID = tree.create_node("#",{
            "text":short_name,
            "icon": "../images/database.png",
            "a_attr":{
                "title":"Double click to filter the visible tables"
            },
        });

        this.root = tree.get_node("#" + this.treeID);

        let schemas = api.getSchemas();
        if(schemas.status){
            let safeSchem;
            schemas = schemas.schemas;
            let pos,icon,tap = false;
            for (let schema in schemas){
                icon = "../images/baseCube.png";
                pos = "last";
                if(schema.match(/TAP_SCHEMA/i) ) {
                    icon = "../images/redCube.png";
                    pos= "first";
                    tap = true;
                } else if(schema.match(/ivoa/i) ) {
                    icon =  "../images/greenCube.png";
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
            $("#" + id + "_anchor").before("<img id='" + id + "_meta' class='metadata' src='../images/info.png' title='Show metadata (Does not work with Vizier)'/>");
            $("#" + id + "_meta").click(this.showMetaData);


            let span = '<span style="font-style: normal; font-size: small ; background-color:';
            $("#" + id + "_anchor").after("<span id='" + id + "_info'></span>");
            let infoSpan = $("#" + id + "_info");

            infoSpan.append(span + 'lightgreen;" title="Support synchronous queries">S</span>');
            infoSpan.append(span + 'lightgreen;" title="Support ADQL joins">J</span>'); // TODO test if it's not a lie ...
            infoSpan.append(span + 'grey; color:white" title="The application does not support asynchronous queries">A</span>');
            infoSpan.append(span + 'grey; color:white" title="The application does not support table upload">U</span>');
        });
    }

    TapTree.prototype.schemaHandlerFactory = function(schema,safeSchem){
        let fun = async (event,node) => {
            if(node.node.id == this.treeID + "_" + safeSchem){
                this.rootHolder.off({"before_open.jstree":fun});
                let schem = await this.api.selectSchema(schema);
                if(schem.status){
                    let tables = this.api.getTables();
                    let tableSafe;
                    if(tables.status){

                        tables = tables.tables;
                        for (let table in tables){
                            tableSafe = vizierToID(table);
                            this.tree.create_node(this.tree.get_node("#" + this.treeID + "_" + safeSchem),{
                                "id":this.treeID + "_" + safeSchem + "_" + tableSafe,
                                "text":table,
                                "a_attr":{
                                    "title":tables[table].description
                                },
                                "icon": false,
                            });
                            let editing=false;
                            let f= ()=>{
                                console.log("eddited " + tableSafe);
                                if(editing){
                                    return;
                                }
                                editing = true;
                                console.log("drawing " + this.treeID + "_" + safeSchem + "_" + tableSafe);
                                $("#" + this.treeID + "_" + safeSchem + "_" + tableSafe + "_anchor").before("<img id='" + this.treeID + "_" + safeSchem + "_" + tableSafe + 
                                    "_meta' class='metadata' src='../images/info.png' title='Show metadata (Does not work with Vizier)'/>");
                                if(tables[table].type === "view"){
                                    $("#" + this.treeID + "_" + safeSchem + "_" + tableSafe + "_anchor").before("<img id='" + this.treeID + "_" + safeSchem + "_" + tableSafe + 
                                        "_view' src='../images/viewer_23.png' title='this table is defined as a view query may be slower than usual ...'/>");
                                    $("#" + this.treeID + "_" + safeSchem + "_" + tableSafe +"_view" ).click(this.metaDataShowerFactory(table));
                                }
                                editing = false;
                            };
                            $("#" + this.treeID + "_" + safeSchem + "_" + tableSafe).on("DOMSubtreeModified",f );
                            f();
                        }
                        this.tree.delete_node(this.tree.get_node("#" + this.treeID + "_" + safeSchem + "_dummy"));
                        // this is done in two step becose jsTree rewrite the whole node when doing some updates to it ...
                        for (let table in tables){
                            tableSafe = vizierToID(table);
                            
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

    TapTree.prototype.getID = function(){
        return this.api.getConnector().connector.service.tapService;
    };

    TapTree.prototype.showMetaData = function(){

    };

    TapTree.prototype.metaDataShowerFactory = function(table){
        return () => {};
    };

    return TapTree;
}();

var TapTreeList = function(){

    function TapTreeList(holder){
        this.holder = holder;
        this.treeMap={};
        this.protected = {};
        this.holder.jstree({
            'core' : {
                'check_callback' : ()=>true
            }
        });
        this.tree = this.holder.jstree(true);
        registerProtected(this);
    }

    /**
     * 
     * @param {TapTreeList} tree 
     */
    function registerProtected(tree){
    }

    TapTreeList.prototype.filter = function(filter){

    };

    /**
     * @param {TapApi} tap 
     */
    TapTreeList.prototype.contains = function(tap){
        if(!tap.getConnector().status){
            return false;
        }
        return this.treeMap[tap.getConnector().connector.service.tapService] !== undefined;
    };

    /**
     * @param {TapApi} tap 
     */
    TapTreeList.prototype.append = function(tap){
        let connector = tap.getConnector();
        if(connector.status && !this.contains(tap)){
            this.treeMap[connector.connector.service.tapService]= {"tree": new TapTree(tap,this.tree,this.holder)};
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
            let api = new TapApi();
            let params = KnowledgeTank.getDescriptors().descriptors[radio.value];
            let connect = await api.connectService(params.tapService,radio.value);
            if(connect.status){
                tree.append(api);

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