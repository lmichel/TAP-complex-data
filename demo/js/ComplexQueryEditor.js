function ComplexQueryEditor(api,holder){
    this.api = api;
    this.holder = holder;
    //@todo nicer editor
    holder.append('<pre style="max-height:16em;overflow:scroll;height:100%"><code id="queryPrettyText"></code></pre>');
    this.editor = $("#queryPrettyText",holder);
}
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
            let constraints = data.editors;
            this.api.resetAllTableConstraint();
            let constraint;
            for (let c in constraints){
                constraint = this.api.getTableConstraint( constraints[c].treePath.table);
                constraint = constraint.constraint;
                let r = this.api.setTableConstraint( constraints[c].treePath.table,
                    constraint + " " + ((constraint.length>0)? constraints[c].getAndOr():"") + constraints[c].fireGetADQL() + this.formatCondition(constraints[c].getOperator(),constraints[c].getOperand())
                );
            }
        } break;
        case "columns":{
            let columns = data.editors;
            let table = this.api.getConnector().connector.service.table;
            this.api.unselectAllFields(table);
            asyncProm = (async ()=>{
                for (let c in columns){
                    await this.api.selectField(columns[c].fireGetADQL(),table);
                }
            })();
        }break;
    }

    //weird things going on as you update the query and then run it ? don't look any further 
    /**The following code is a mess which aims to reduce any troubles comming from the fact that jsResources doesn't handle async methods
     * we execute most of the code outside of promises when async/await behavior is needed we store the code inside an async IIFE named asyncProm
     * we then use the `then` methods of the promise to update the showed query ensuring that we don't update the showed query before the query hasn't fully updated
     * the rProm is a rather empty promise used in a way to be able to return a promise which will resolve once everything has ended thus enabling to await 
     * the method when possible. 
     */

    let that = this;
    let resolv;
    let rProm = new Promise((resolve)=>{
        resolv = resolve;
    });
    asyncProm.then( ()=>{
        this.api.getTableQuery().then((val)=>{ //TODO proper selection of the wanted table
            if(val.status){
                let query = val.query;
                query = replaceAll(query,"\n (","(");
                query = replaceAll(query,"AND","AND\n    ");
                query = replaceAll(query,"  (","(");
                that.editor.html(hljs.highlight(query ,{"language":"SQL", "ignoreIllegals":true}).value);
            }
            resolv();
        });
    });
    return rProm;
    
};

ComplexQueryEditor.prototype.formatCondition = function(operator,operand){
    if( operator == 'IS NULL' ) {
        operator = 'IS NULL';
        operand = '';								
    } else if( /^\s*$/.test(operand)  ) {
        operator = 'IS NOT NULL';
        operand = '';			
    } else {
        if ( /^\s*'.*'\s*$/.test(operand)  ) {
            operand = operand;
        } else {
            operand = "'" + operand + "'";
        }
        operator = operator;	
    }
    return operator+operand;
};