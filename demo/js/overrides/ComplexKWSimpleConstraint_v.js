var ComplexKWSimpleConstraint_mVc;

function ComplexKWSimpleConstraint_mVcExtends(){
	ComplexKWSimpleConstraint_mVc = function(params){
		TapKWSimpleConstraint_mVc.call(this,params);
        this.editorModel = params.editorModel;
        this.cantTouchThis = params.cantTouchThis;
	};
	/**
	 * Tap Complex custom model extends the tapQEditor_Mvc class
	 */
    ComplexKWSimpleConstraint_mVc.prototype = Object.create(TapKWSimpleConstraint_mVc.prototype, {
        initForm :{
            value : function(){
                var that = this;
                $('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='overflow: hidden;'>");
                var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
                var rootDiv = $(baseSelector);		
                if(!this.cantTouchThis){
                    rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Unselect this columns"></a>&nbsp;');
                }
                rootDiv.append('<span style="cursor: pointer;" id="' + this.rootId + '_name" style="float: left;">' + this.name + '</span>&nbsp;');

                $("#" + this.rootId + " span").click(function(){
                    Modalinfo.info(that.defValue, "Pattern statement");
                });
                if(this.rootId.endsWith("_rafield") || this.rootId.endsWith("_decfield")) {
                    $(".kwConstraint#"+this.rootId).css("display","inline");
                }

                $('#' + this.constListId).append("</div>");	

                var closeInput = $('#' + this.constListId + ' a[id="' + this.rootId + '_close"]');
                if(!this.cantTouchThis){
                    closeInput.click(function() {
                        rootDiv.remove();
                        that.fireRemoveFirstAndOr(this.rootId);
                        that.editorModel.updateQuery();	
                    });
                }
                
                that.editorModel.updateQuery();	
            }
        } ,
        fireGetADQL:{
            value : function(){
                return this.name;
            }
        }
    });
}