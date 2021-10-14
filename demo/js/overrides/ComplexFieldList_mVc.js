var ComplexFieldList_mVc;

function ComplexFieldList_mVcExtends(){
    ComplexFieldList = function(parentDivId, formName, handlers){
        TapColList_mVc.call(this, parentDivId, formName, handlers);
    };
    
    ComplexFieldList.prototype = Object.create(TapColList_mVc.prototype, {
        draw : {
            value: function() {
                var that = this;
                this.attributesHandlers = [];
                this.joinedTableLoaded = false;
                this.parentDiv.html('<div class="fielddiv">'+
                        '<div class="fieldlist" id="' + this.fieldListId +  '" style="height: 175px"></div>'+
                        ' <div class="form-group" style="width:347px; margin-bottom:8px; margin-top:8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'+
                        ' <input id="' + this.fieldFilterId +  '" class="form-control input-sm" type="text" placeholder="Search"/></div></div>'+
                        '  </div>');		
    
                $('#' + this.fieldFilterId).keyup(function() {
                    that.filterPattern = new RegExp($(this).val(), 'i');
                    that.fireFilter();
                });
                $('#' + this.fieldFilterId).one("click",function() {
                    $(this).css('color','black');
                    $(this).css('font-style','');
                    $(this).attr('value','');
                });		
                this.setChangeTableHandler();
            }
        },
    });

}