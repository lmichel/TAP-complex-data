var ComplexPos_mVc;

function ComplexPos_mVcExtends(){
    ComplexPos_mVc = function(...args){
        TapSimplePos_mVc.call(this,...args);
    };

    ComplexPos_mVc.prototype = Object.create(TapSimplePos_mVc.prototype,{
        setSesameForm : {
            value : function() {
                var that = this;
                var inputfield = $('#' + this.cooFieldId);
                var handler = (this.sesameURL != null) ? function() {
                    Processing.show("Waiting on SESAME response");
                    PositionParser.resolveName(inputfield.val()).then((v)=>{
                        if(v.status){
                            inputfield.val(v.ra + ' +'+v.de);
							that.readAndUpdate();
                        } else {
                            Processing.jsonError(v,"Sesame failure");
                        }
                        Processing.hide();
                    });
                }
                : function() {
                    Modalinfo
                    .info("name resolver not implemented yet");
                };

                $('#' + this.sesameId).click(handler);
            }
        },
    });
}