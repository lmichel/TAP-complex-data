var ComplexQEditor_mVc;

function ComplexQEditor_mVcExtends(){
	ComplexQEditor_mVc = function(params){
        let that = this;
		tapQEditor_mVc.call(this,params);
        this.fieldListView = new ComplexFullFieldList_mVc(params.parentDivId, 
            this.formName ,
            {
                stackHandler: function(ahName){ that.fireAttributeEvent(ahName);} ,
                radec: false
            },
            params.tables
        );
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
        },
        fireAttributeEvent : { 
            value: function(ahname){
                let ah = this.fieldListView.getAttributeHandler(ahname);
                this.listener.controlAttributeHandlerEvent(ah, this.constListId);
                $("#" + this.constListId + " span.help").attr("style","display:none;");
            }
        }
    });
}