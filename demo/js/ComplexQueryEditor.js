function ComplexQueryEditor(api,holder){
    this.api = api;
    this.holder = holder;
    //@todo nicer editor
    holder.append('<div class = "sql" id="queryPrettyText" style="width:35em;height:100%;overflow:auto;border: black inset;"></div>');
    this.editor = holder.children().last();
}
/**
 * @param {String} type what is updated chose between the folowing valid options : "constraint" 
 * @param {*} data depends on `type` "constraint" : tapQEditor_Mvc
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
                constraint = this.api.getTableConstraint( constraints[c].treePath.table).constraint;
                let r = this.api.setTableConstraint( constraints[c].treePath.table,
                    constraint + " " + constraints[c].getAndOr() + constraints[c].fireGetADQL() + this.formatCondition(constraints[c].getOperator(),constraints[c].getOperand())
                );
            }
            this.api.getTableQuery().then((val)=>{ //TODO proper selection of the wanted table
                if(val.status){
                    that.editor.html(hljs.highlight( val.query,{"language":"SQL", "ignoreIllegals":true}).value);
                }
            });
        } break;
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