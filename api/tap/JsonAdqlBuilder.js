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
                break;
            } else {
                this.adqlJsonMap.activeJoints.push(table);
            }

            table = this.adqlJsonMap.joints[table].parentNode
        }

        return {"status" : true};

    }

    /**
     * This method builds and set multiple constraints for a single table.
     * @param {String} table unqualified name of the constraint table
     * @param {Array[String]} constraints an array of valid adql constraint only constraining table, without any starting or leading adql keyword (WHERE,OR,AND, ...)
     * @param {Array[String]} logic Optional an array of valid adql binary boolean operator (AND,OR) to be use to merge the constraints. If logic is too small and strict is either undefined or false no error is raised and the array gets looped to fill the missing blank.
     * @param {Boolean} strict  Optional define if logic should exactly have the correct size according to logic's size
     * @returns 
     */
    JsonAdqlBuilder.prototype.setTableConstraints = function(table,constraints,logic,strict){
        if (strict){
            if (logic.length !== constraints.length -1){
                return {"status" : false, "error":{"logs":"logic length doesn't match with constraints length","params" : {"table":table,"constraints":constraints,"logic":logic,"strict":strict}}};
            }
        } 
        
        if (constraints == undefined){
            return {"status" : false, "error":{"logs":"Invalid parameter : constraints","params" : {"table":table,"constraints":constraints,"logic":logic,"strict":strict}}};
        }

        if (logic == undefined){
            logic = ["AND"];
        }

        let mainConstraint = constraints[0];

        for (let i=1; i< constraints.length;i++){
            mainConstraint += " " + logic[i%logic.length].trim() + " " + constraints[i];
        }

        let val = this.setTableConstraint(table, mainConstraint);
        
        if(val.status){
            return {"status" : true, "constraint" :mainConstraint};
        } else {
            return {"status" : false, "error":{"logs":"Error while setting constraint :\n" + val.error.logs,"params" : {"table":table,"constraints":constraints,"logic":logic,"strict":strict}}};
        }
    }

    JsonAdqlBuilder.prototype.removeTableConstraints = function(table){
        if(this.adqlJsonMap.joints[table] === undefined){
            return {"status" : false, "error":{"logs":"Unknown table " + table,"params" : {"table":table}}};
        }

        this.adqlJsonMap.conditions[table] = undefined;

        while (table !== this.adqlJsonMap.rootTable){

            if ( this.adqlJsonMap.conditions[table] !== undefined){
                break;
            } else {
                this.adqlJsonMap.activeJoints.remove(table);
            }

            table = this.adqlJsonMap.joints[table].parentNode
        }

        return {"status" : true};
    }

    JsonAdqlBuilder.prototype.getAdqlJoints = function(table){
        if (table == undefined){
            table = this.adqlJsonMap.rootTable;
        }

        let whitelist = [];
        if (table !== this.adqlJsonMap.rootTable){
            if(this.adqlJsonMap.joints[table] === undefined){
                return {"status" : false, "error":{"logs":"Unknown table " + table,"params" : {"table":table}}};
            }
            
            /*/ Whitelist building /*/
            /**
             * only table that are deeper in the tree than the selected base table are allowed
             */
            branch = this.adqlJsonMap.nodeTreeBranches[table]
            while (branch !== undefined && branch.length >0){
                whitelist.push(branch)
                let nextBranch = [];
                for (let i =0;i<branch.length;i++){
                    nextBranch.push(this.adqlJsonMap.nodeTreeBranches[branch[i]]);
                }
                branch = nextBranch;
            }

            whitelist = Array.from(new Set(whitelist));
        } else {
            whitelist = Object.keys(this.adqlJsonMap.joints);
        }

        let joints = this.adqlJsonMap.activeJoints.filter(value => whitelist.includes(value))

        let adqlJoints = ""

        for (let i=0;i<joints.length;i++){
            let joint = this.adqlJsonMap.joints[joints[i]];
            adqlJoints += " JOIN " + this.adqlJsonMap.scheme + "." + joints[i] + " ON " +
            this.adqlJsonMap.scheme + "." + joint.parentNode + "." + joint.target + "=" +
            this.adqlJsonMap.scheme + "." + joints[i] + "." + joint.from + "\n"
        }

        // remove leading \n

        if (adqlJoints.length>0){
            adqlJoints=adqlJoints.substring(0,adqlJoints.length-1)
        }

        return {"status":true,"adqlJoints":adqlJoints};

    }

    return JsonAdqlBuilder;
})();