"use strict;";

var JsonAdqlBuilder = (function(){

    function JsonAdqlBuilder(objectMap,rootTable,schema){
        this.adqlJsonMap = {
            "rootTable" :rootTable,
            "scheme" : schema, 
            "joints" : {}, 
            "nodeTreeBranches":{}, 
            "conditions":{}, 
            "activeJoints" : [] 
        };

        /*/ Building adqlJsonMap from objectMap /*/

        if(objectMap.map[rootTable] !== undefined){
            let map = {};
            map[this.adqlJsonMap.rootTable] = objectMap.map[rootTable].join_tables;
            let nextMap;
            let mapHasKey = true;
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
                                "keys":map[parent][key].joins,
                                "parentNode" : parent
                            };
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
        

    }

    /**
     * @param {String} table unqualified name of the constraint table
     * @param {String} constraint valid adql constraint constraining only the table `table`, without any starting or leading adql keyword (WHERE,OR,AND, ...)
     */
    JsonAdqlBuilder.prototype.setTableConstraint = function(table,constraint){

        if(this.adqlJsonMap.joints[table] === undefined && table !== this.adqlJsonMap.rootTable){
            return {"status" : false, "error":{"logs":"Unknown table " + table,"params" : {"table":table,"constraint":constraint}}};
        }

        if(constraint == undefined){
            return {"status" : false, "error":{"logs":"Invalid constraint","params" : {"table":table,"constraint":constraint}}};
        }
        
        this.adqlJsonMap.conditions[table] = constraint;

        let joints = [];

        while (table !== this.adqlJsonMap.rootTable){

            if ( this.adqlJsonMap.activeJoints.includes(table)){
                break;
            } else {
                joints.push(table);
            }

            table = this.adqlJsonMap.joints[table].parentNode;
        }

        joints.reverse(); // we reverse the array so we don't start by joining the outer-most table
        
        this.adqlJsonMap.activeJoints = this.adqlJsonMap.activeJoints.concat(joints);

        return {"status" : true};

    };

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

        if (logic === undefined ||logic.length == 0){
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
    };

    /**
     * Remove any constraints put on the table
     * @param {String} table unqualified name of the table
     */
    JsonAdqlBuilder.prototype.removeTableConstraints = function(table){
        if(this.adqlJsonMap.joints[table] === undefined && table !== this.adqlJsonMap.rootTable){
            return {"status" : false, "error":{"logs":"Unknown table " + table,"params" : {"table":table}}};
        }

        delete this.adqlJsonMap.conditions[table];

        /*/ check if other tables rely on the table's joints tree /*/
        let deepNeeds = false;
        let subTables = this.getSubTables(table).subTables;

        for (let i =0;i<subTables.length;i++){
            deepNeeds = deepNeeds || this.adqlJsonMap.activeJoints.includes(subTables[i]);
        }

        if (!deepNeeds){
            while (table !== this.adqlJsonMap.rootTable){

                if ( this.adqlJsonMap.conditions[table] !== undefined){
                    break;
                } else {
                    this.adqlJsonMap.activeJoints.remove(table);
                }

                table = this.adqlJsonMap.joints[table].parentNode;
            }
        }

        return {"status" : true};
    };
    /**
     * Remove any constraints put on any table
     */
     JsonAdqlBuilder.prototype.removeAllTableConstraints = function(){

        this.adqlJsonMap.conditions = {};
        this.adqlJsonMap.activeJoints = [];

        return {"status" : true};
    };
    /**
     * create a list of all tables which are deeper than the selected rootTable in the objectMap's tree representation of the DB
     * @param {String} table Optional, unqualified name of the node table or the root table if unspecified
     * @param {int} degree Optional, degree of deepness allowed. `Number.MAX_VALUE` if unspecified.
     */
    JsonAdqlBuilder.prototype.getSubTables = function(table,degree){
        if (table == undefined){
            table = this.adqlJsonMap.rootTable;
        }

        if (degree === undefined){
            degree = Number.MAX_VALUE;
        }

        let subTables = [];
        if (table !== this.adqlJsonMap.rootTable){
            if(this.adqlJsonMap.joints[table] === undefined){
                return {"status" : false, "error":{"logs":"Unknown table " + table,"params" : {"table":table}}};
            }
            
            let branch = this.adqlJsonMap.nodeTreeBranches[table];
            let nextBranch;
            while (branch !== undefined && branch.length >0 && degree > 0){
                subTables=subTables.concat(branch);
                nextBranch = [];
                for (let i =0;i<branch.length;i++){
                    if(this.adqlJsonMap.nodeTreeBranches[branch[i]] !== undefined){
                        nextBranch = nextBranch.concat(this.adqlJsonMap.nodeTreeBranches[branch[i]]);
                    }
                }
                branch = nextBranch;
                degree--;
            }

            subTables = Array.from(new Set(subTables));
        } else {
            subTables = Object.keys(this.adqlJsonMap.joints);
        }

        return {"status":true,"subTables":subTables};
    };

    /**Search and return all direct joint from the selected table to another. Only joints which goes deeper une the tree representation are returned 
     * ie table 1 is joined to the root and to table 2 and 3 then this method will only return joints to table 2 and 3.
     * joints are described following the same pattern as in the JsonAdqlBuilder specs
     * 
     * @param {String} table Table from which joined table are searched 
     */

    JsonAdqlBuilder.prototype.getLowerJoints =function(table){
        if (table == undefined){
            table = this.adqlJsonMap.rootTable;
        }
        let joints = {};
        for (let key in this.adqlJsonMap.joints){
            if (this.adqlJsonMap.joints[key].parentNode === table){
                joints[key] = JSON.parse(JSON.stringify(this.adqlJsonMap.joints[key]));
            }
        }
        return {"status":true,"joints":joints};
    };

    /**
     * Create a string containing all active ADQL joints from the starting node ignoring any joints on same or higher level other nodes
     * @param {String} table Optional, unqualified name of the node table or the root table if unspecified
     */
    JsonAdqlBuilder.prototype.getAdqlJoints = function(table){
        let joints = this.getActiveJoints(table);

        if(joints.status){
            joints = joints.joints;
        }else{
            return joints;
        }

        let adqlJoints = "",j;

        for (let i=0;i<joints.length;i++){
            let joint = this.adqlJsonMap.joints[joints[i]];
            adqlJoints += " JOIN " + this.adqlJsonMap.scheme + "." + joints[i] + " ON ( ";
            for(j=0;j<joint.keys.length;j++){
                adqlJoints += this.adqlJsonMap.scheme + "." + joint.parentNode + "." + joint.keys[j].from + "=" +
                this.adqlJsonMap.scheme + "." + joints[i] + "." + joint.keys[j].target + " AND ";
            }
            adqlJoints = adqlJoints.substring(0,adqlJoints.length-5);
            adqlJoints += " ) \n";
        }

        return {"status":true,"adqlJoints":adqlJoints};

    };

    JsonAdqlBuilder.prototype.getActiveJoints = function(table){
        let whitelist = this.getSubTables(table);
        
        if(whitelist.status){
            whitelist = whitelist.subTables;
        }else{
            return whitelist;
        }

        let joints = this.adqlJsonMap.activeJoints.filter(value => whitelist.includes(value));

        return {"status":true,"joints":joints};
    };

    /**
     * create a string containing all active ADQL constraints from the starting node ignoring any joints on same or higher level other nodes
     * @param {String} table Optional, unqualified name of the node table or the root table if unspecified
     * @param {*} joinKeyVal Optional, specific values of the keys used to join `table` to his `parentNode`.
     * Theise values are used to create an additional constraint and ignore if `table` is either undefined or the rootTable .
     * This must take the form of a map where each keys represent a key from the table `table` (target field in the join object)
     */
    JsonAdqlBuilder.prototype.getAdqlConstraints = function(table,joinKeyVal){
        let whitelist = this.getSubTables(table);
        
        if(whitelist.status){
            whitelist = whitelist.subTables;
            whitelist.push(table); // the table itself isn't the sub tables but we still want to keep constraints put on it
        }else{
            return whitelist;
        }

        let tables = Object.keys(this.adqlJsonMap.conditions).filter(value => whitelist.includes(value));

        let adqlConstraints = "";

        for (let i=0;i<tables.length;i++){
            adqlConstraints += "( " + this.adqlJsonMap.conditions[tables[i]] + " ) AND \n ";
        }

        if (table !== undefined && table !== this.adqlJsonMap.rootTable && joinKeyVal !== undefined){
            let keys =Object.keys(joinKeyVal);
            if(keys.length == this.adqlJsonMap.joints[table].keys.length){
                if(this.adqlJsonMap.joints[table].keys.every((val)=>keys.includes(val.target))){
                    adqlConstraints += "( ";
                    for (let key in joinKeyVal){
                        adqlConstraints +=this.adqlJsonMap.scheme + "." + table + "." + key + "=" + joinKeyVal[key] + " AND ";
                    }
                    adqlConstraints = adqlConstraints.substring(0,adqlConstraints.length-5) + " )";
                } else {
                    console.warn("specified joinKeyVal contains invalid keys, this constraint will be ignored");
                }
            }else {
                console.warn("specified joinKeyVal doesn't contains all keys, this constraint will be ignored");
            }
        } else{
            adqlConstraints=adqlConstraints.substring(0,adqlConstraints.length - 7); // remove trailing AND
        }

        if(adqlConstraints.length > 0){
            return {"status":true,"adqlConstraints": " WHERE " + adqlConstraints};
        } else {
            return {"status":true,"adqlConstraints": ""};
        }

    };

    /**
     * return a set containing all fields which are use as join keys on/by the selected table 
     * @param {String} table unqualified name of the node table or the root table if unspecified
     */
    JsonAdqlBuilder.prototype.getJoinKeys = function(table){
        if(table === undefined){
            table = this.adqlJsonMap.rootTable;
        }
        let keys = [],i;
        if(this.adqlJsonMap.joints[table] !== undefined){
            for (i=0;i<this.adqlJsonMap.joints[table].keys.length;i++){
                keys.push(this.adqlJsonMap.joints[table].keys[i].target);
            }
        }

        for (let join in this.adqlJsonMap.joints ){
            if(this.adqlJsonMap.joints[join].parentNode === table){
                for (i=0;i<this.adqlJsonMap.joints[join].keys.length;i++){
                    keys.push(this.adqlJsonMap.joints[join].keys[i].from);
                }
            }
        }

        keys = Array.from(new Set(keys));

        return {"status":true,"keys": keys};
    };


    /**
     * check if the selected table is actively joint
     * @param {String} table unqualified name of the node table
     */
    JsonAdqlBuilder.prototype.isTableJoined = function(table){
        return {"status":true,"joined": this.adqlJsonMap.activeJoints.includes(table)};
    };

    /**
     * return the constraint put on the selected table or an empty string if no constraint is set
     * @param {String} table unqualified name of the node table
     */
    JsonAdqlBuilder.prototype.getTableConstraint = function(table){
        let constraint = this.adqlJsonMap.conditions[table];
        if (constraint === undefined){
            constraint = "";
        }
        return {"status": true, "constraint":`${constraint}`};
    };

    JsonAdqlBuilder.prototype.getAllTablesConstraints = function(){
        let constraints = {};
        for(let table in this.adqlJsonMap.conditions){
            constraints[table] = `${this.adqlJsonMap.conditions[table]}`;
        }
        return {"status": true, "constraints":constraints};
    };

    return JsonAdqlBuilder;
})();