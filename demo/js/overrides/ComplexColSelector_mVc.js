var ComplexColSelector_mVc;

function ComplexColSelector_mVcExtends(){
	ComplexColSelector_mVc = function(params){
		tapColSelector_mVc.call(this,params);
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