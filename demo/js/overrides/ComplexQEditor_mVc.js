var ComplexQEditor_mVc;

function ComplexQEditor_mVcExtends(){
	ComplexQEditor_mVc = function(params){
		tapQEditor_mVc.call(this,params);
	};
	/**
	 * Tap Complex custom model extends the tapQEditor_mVc class
	 */
	ComplexQEditor_mVc.prototype = Object.create(tapQEditor_mVc.prototype, {
        fireUpdateTreepath : { 
            value: function(treePath, handler){
                var that = this;
    
                this.dataTreePath = treePath;	
                // table name can include the schema
                //this.dataTreePath.table = this.dataTreePath.table.split('.').pop();
                this.queryView.fireSetTreePath(this.dataTreePath);
                this.queryView.fireAddConstraint(this.formName, "select", ["*"]);
                this.orderByView.fireClearAllConst();
                this.listener.controlLoadFields(that.dataTreePath, handler);
                this.fieldListView.setDataTreePath(this.dataTreePath);
            }
        }
    });
}