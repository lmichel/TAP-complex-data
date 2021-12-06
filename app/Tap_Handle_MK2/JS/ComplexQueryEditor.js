function ComplexQueryEditor(api,holder){
    this.api = api;
    this.holder = holder;
    //@todo nicer editor
    holder.append('<pre style="max-height:16em;overflow:scroll;height:100%"><code id="queryPrettyText"></code></pre>');
    this.editor = $("#queryPrettyText",holder);
    this.constraintsHolder = new Set();
}

ComplexQueryEditor.prototype.registerConstraintsHolder=function (constHolder){
    this.constraintsHolder.add(constHolder);
};

/**
 * @param {String} type what is updated chose between the folowing valid options : "constraint"  "columns"
 * @param {*} data depends on `type` "constraint" : tapQEditor_Mvc "columns" tapColSelector
 * 
 */
ComplexQueryEditor.prototype.updateQuery = function(type, data){
    let asyncProm =(async ()=>{})();
    switch(type.toLowerCase()){
        case "constraint": 
        {
            this.api.resetAllTableConstraint();
            let constraints;
            let constraint;
            const it = this.constraintsHolder.values();
            let val = it.next();

            while(!val.done){
                constraints = val.value.editors;
                val= it.next();
                for (let c in constraints){
                    constraint = this.api.getTableConstraint( constraints[c].treePath.table);
                    constraint = constraint.constraint;
                    this.api.setTableConstraint( constraints[c].treePath.table,
                        constraint + " " + ((constraint.length>0)? constraints[c].getAndOr():"") + constraints[c].fireGetADQL() + 
                        (constraints[c].getOperator !== undefined && constraints[c].getOperand !== undefined?this.formatCondition(constraints[c].getOperator(),constraints[c].getOperand()):"")
                    );
                }
            }
            
            break;
        } 
        case "columns":{
            let columns = data.editors;
            let table = this.api.getConnector().connector.service.table;
            this.api.unselectAllFields(table);
            for (let c in columns){
                this.api.selectField(columns[c].fireGetADQL(),table,false);
            }
            break;
        }
    }

    //weird things going on as you update the query and then run it ? don't look any further 
    /**The following code is a mess which aims to reduce any troubles comming from the fact that jsResources doesn't handle async methods
     * we execute most of the code outside of promises when async/await behavior is needed we store the code inside an async IIFE named asyncProm
     * we then use the `then` methods of the promise to update the showed query ensuring that we don't update the showed query before the query hasn't fully updated
     * note that the .then method of promise returns promises and awaiting the outer promise await all the inners promises 
     * this way if anyone await the returned value of this method we can ensure that the query will have been correctly updated
     */

    let that = this;
    return asyncProm.then( ()=>{
        return this.api.getTableQuery().then((val)=>{ //TODO proper selection of the wanted table
            if(val.status){
                let query = val.query;
                query = utils.replaceAll(query,"\n (","(");
                query = utils.replaceAll(query,"AND","AND\n    ");
                query = utils.replaceAll(query,"  (","(");
                that.editor.html(hljs.highlight(query ,{"language":"SQL", "ignoreIllegals":true}).value);
            }
        });
    });
    
};

ComplexQueryEditor.prototype.formatCondition = function(operator,operand){
    if( operator == 'IS NULL' ) {
        operator = 'IS NULL';
        operand = '';								
    } else if( /^\s*$/.test(operand)  ) {
        operator = 'IS NOT NULL';
        operand = '';			
    } else { //ERROR_BUILDER : Revert condition
        if( ( isNaN(operand) || isNaN(parseInt(operand)) || isNaN(+operand) ) ) {
            operand = "'" + operand + "'";
        }
        operator = operator;	
    }
    return operator+operand;
};