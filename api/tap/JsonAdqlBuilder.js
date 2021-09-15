"use strict";

var JsonAdqlBuilder = (function(){

    function JsonAdqlBuilder(objectMap){
        this.adqlJsonMap = {
            "rootTable" :objectMap.root_table.name,
            "scheme" : '"' + objectMap.root_table.schema + '"', 
            "joints" : {}, 
            "nodeTreeBranches":{}, 
            "conditions":{}, 
            "activeJoints" : [] 
        };

        /*/ Building adqlJsonMap from objectMap /*/

        let map = {}
        map[this.adqlJsonMap.rootTable] = objectMap.map[objectMap.root_table.name].join_tables
        let nextMap;
        let mapHasKey = true
        while (mapHasKey){
            nextMap = {};
            mapHasKey = false;
            for (let parent in map){
                mapHasKey = true;
                for (let key in map[parent]){

                    /* We cant register a table twice 
                    * so we choose to only keep the smallest path to the rooTable
                    * we also don't want to register branches in nodeTreeBranches that their joints isn't 
                    * in the joint map.
                    */
                    if(this.adqlJsonMap.joints[key] === undefined){

                        /*/ nodeTreeBranches building /*/
                        if (parent !== this.adqlJsonMap.rootTable){
                            if (this.adqlJsonMap.nodeTreeBranches[parent] === undefined){
                                this.adqlJsonMap.nodeTreeBranches[parent] = [key];
                            }else{
                                this.adqlJsonMap.nodeTreeBranches[parent].push(key);
                            }
                        }

                        /*/ joints map building /*/
                        this.adqlJsonMap.joints[key] = {
                            "from":map[parent][key].from,
                            "target":map[parent][key].target,
                            "parentNode" : parent
                        };
                    } else {
                        console.warn("the table " + key + " is in more than one tree !");
                    }
                    
                    /*/ nextMap building /*/
                    if (map[parent][key].join_tables !== undefined){
                        if (nextMap[key] === undefined){
                            nextMap[key] = map[parent][key].join_tables;
                        }else {
                            for (let subKey in map[parent][key].join_tables){
                                nextMap[key][subKey] = map[parent][key].join_tables[subKey];
                            }
                        }
                    }

                }
            }
            map = nextMap;
        }

    }

    /**
     * @param {String} table unqualified name of the constraint table
     * @param {String} constraint valid adql constraint constraining only the table `table`, without any starting or leading adql keyword (WHERE,OR,AND, ...)
     */
    JsonAdqlBuilder.prototype.setTableConstraint = function(table,constraint){

        if(this.adqlJsonMap.joints[table] === undefined){
            return {"status" : false, "error":{"logs":"Unknown table " + table,"params" : {"table":table,"constraint":constraint}}};
        }

        if(constraint == undefined){
            return {"status" : false, "error":{"logs":"Invalid constraint","params" : {"table":table,"constraint":constraint}}};
        }
        
        this.adqlJsonMap.conditions[table] = constraint;

        while (table !== this.adqlJsonMap.rootTable){

            if ( this.adqlJsonMap.activeJoints.includes(table)){
                return;
            } else {
                this.adqlJsonMap.activeJoints.push(table);
            }

            table = this.adqlJsonMap.joints[table].parentNode
        }

    }

    return JsonAdqlBuilder;
})();