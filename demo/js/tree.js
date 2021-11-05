"use strict;";

var TapTree = function(){

    /**
     * 
     * @param {TapApi} api 
     */
    function TapTree(api,tree){
        this.api = api;
        this.tree = tree;

        let short_name = api.getConnector().connector.service.shortName;
        let treeID = tree.create_node("#",{"text":short_name});

        this.root = tree.get_node("#" + treeID);

        let schemas = api.getSchemas();
        if(schemas.status){
            schemas = schemas.schemas;
            let elem;
            for (let schema in schemas){
                elem = "<li> <span title = '"+ schemas[schema].description + 
                    "'>" + schema +"</span></li>";
                
                console.log(tree.create_node(this.root,{"text":schema,"id":schema}));
                /*tooltip = new bootstrap.Tooltip(
                    $(":last-child span",this.list),
                    { 
                        template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
                        offset : [0,10],
                        placement : 'right',
                        html : true,
                        //trigger : 'manual',
                    }
                );*/
                //tooltip.show();
            }
        }else{
            console.error(schemas);
        }
    }

    TapTree.getID = function(){
        return this.api.getConnector().connector.service.tapService;
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
            this.treeMap[connector.connector.service.tapService]= {"tree": new TapTree(tap,this.tree)};
        }
        return connector.status;
    };

    return TapTreeList;
}();

let tree;

/*/ Trigers function for radio button /*/

function OnRadioChange(radio) {
    syncIt(async ()=>{
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