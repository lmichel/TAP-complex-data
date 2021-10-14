function ComplexQueryEditor(api,holder){
    this.api = api;
    this.holder = holder;
    //@todo nicer editor
    holder.append('<pre id="queryPrettyText" style="max-height:16em;overflow-wrap: break-word;overflow:auto"></pre>');
    this.editor = $("#queryPrettyText",holder);
}
/**
 * @param {String} type what is updated chose between the folowing valid options : "constraint"  "columns"
 * @param {*} data depends on `type` "constraint" : tapQEditor_Mvc "columns" tapColSelector
 * 
 */
ComplexQueryEditor.prototype.updateQuery = function(type, data){
    switch(type.toLowerCase()){
        case "constraint": 
        {
            let constraints = data.editors;
            this.api.resetAllTableConstraint();
            let constraint;
            let that = this;
            for (let c in constraints){
                constraint = this.api.getTableConstraint( constraints[c].treePath.table);
                constraint = constraint.constraint;
                let r = this.api.setTableConstraint( constraints[c].treePath.table,
                    constraint + " " + ((constraint.length>0)? constraints[c].getAndOr():"") + constraints[c].fireGetADQL() + this.formatCondition(constraints[c].getOperator(),constraints[c].getOperand())
                );
            }
            this.api.getTableQuery().then((val)=>{ //TODO proper selection of the wanted table
                if(val.status){
                    let query = val.query;
                    query = replaceAll(query,"\n (","(");
                    query = replaceAll(query,"AND","AND\n    ");
                    query = replaceAll(query,"  (","(");
                    that.editor.html(hljs.highlight(query ,{"language":"SQL", "ignoreIllegals":true}).value);
                }
            });
        } break;
        case "columns":{
            let columns = data.editors;
            for (let c in columns){
                console.log(columns[c].fireGetADQL());
            }
        }break;
    }
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