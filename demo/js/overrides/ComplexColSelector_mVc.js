var ComplexColSelector_mVc;

function ComplexColSelector_mVcExtends(){
	ComplexColSelector_mVc = function(params){
		tapColSelector_mVc.call(this,params);
        let that = this;
        this.fieldListView = new ComplexFieldList(params.parentDivId ,
            this.formName ,
            {
                stackHandler: function(ahName){ that.fireAttributeEvent(ahName);} ,
                orderByHandler: function(ahName){ that.fireOrderBy(ahName);}
            },       
            params.sessionID
        );
    
        this.fieldListView.setStackTooltip("Click to select this field");
	};
	/**
	 * Tap Complex custom model extends the tapQEditor_mVc class
	 */
     ComplexColSelector_mVc.prototype = Object.create(tapColSelector_mVc.prototype, {
         hardSelect:{
             value:function(ah){
                for (let i=0;i<ah.length;i++){
                    this.model.processAttributeHandlerEvent(ah[i],this.constListId,true);
                }
             }
         },
         select:{
            value:function(ah){
                for (let i=0;i<ah.length;i++){
                    this.model.processAttributeHandlerEvent(ah[i],this.constListId);
                }
            }
        }
	});

	
}