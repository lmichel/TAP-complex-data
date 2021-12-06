    var ComplexPosFieldList_mVc;

    function ComplexPosFieldList_mVcExtends(){
        ComplexPosFieldList_mVc = function(parentDivId, formName, handlers, getTableAttUrl, sessionID){
            TapFieldList_mVc.call(this,parentDivId, formName, handlers, getTableAttUrl, sessionID);
        };
        ComplexPosFieldList_mVc.prototype = Object.create(TapFieldList_mVc.prototype,{
            draw : {
                value: function() {
                    var that = this;
                    this.attributesHandlers = new Array();
                    var radec = "";
                    if (this.radec) {
                        radec += '<div id="div-'+this.raFieldId.substring(0, this.raFieldId.length-8)+'">'
                        + ' <div>'
                        + '    <span class="help" style="margin-left:5px;">ra&nbsp;&nbsp;</span>'
                        + '    <div id="' + this.raFieldId +  '"  style="display:inline-block;"/>'
                        + ' </div>'
                        + ' <div>'
                        + '    <span class="help"  style="margin-left:5px;">dec&nbsp;</span>'
                        + '    <div id="' + this.decFieldId +  '"  style="display:inline-block;"/>'
                        + ' </div>'
                        + ' </div>';
                    }
                    this.parentDiv.html('<div class=fielddiv>'
                            + ' <div class="fieldlist" id="' + this.fieldListId +  '" style="height: 245px"></div>'
                            + ' <div class="form-group" style="margin-bottom:8px; margin-top: 8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'
                            + ' <input id="' + this.fieldFilterId +  '" class="form-control input-sm" type="text" placeholder="Search"/></div></div>'
                            + radec
                            + '  </div>');
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