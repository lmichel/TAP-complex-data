var ComplexKWConstraint_mVc;

function ComplexKWConstraint_mVcExtends(){
    ComplexKWConstraint_mVc = function(params){
        TapKWConstraint_mVc.call(this,params);
        this.editorModel = params.editorModel;
    };
    /**
     * Tap Complex custom view extends the TapKWConstraint_mVc class
     */
    ComplexKWConstraint_mVc.prototype = Object.create(TapKWConstraint_mVc.prototype, {
        initForm : {
            value: function(ah, operators ,andors,range,default_value){

                var that = this;
                $('#' + this.constListId).append("<div class='kwConstraint' id=" + this.rootId + " style='float: none;'>");
                var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
                var rootDiv = $(baseSelector);
                rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
                /*
                * AND/OR operators
                */
                if( andors.length > 0 ) {
                    let select='<select id="' + this.rootId + '_andor" style="font-size: small;font-family: courier;\">';
                    for( let i=0 ; i<andors.length; i++ ) {
                        let op = andors[i];
                        select += '<option value=' + op + '>' +op + '</option>';
                    }	
                    select += '</select>&nbsp;';
                    rootDiv.append(select);
                }
                rootDiv.append('<span id="' + this.rootId + '_name">' + this.getAhName(ah) + '</span>&nbsp;');
                /*
                * Logical operators
                */
                if( operators.length > 0 ) {
                    let select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
                    for( let i=0 ; i<operators.length; i++ ) {
                        let op = operators[i];
                        let selected = '';
                        if( op == '>' ) {
                            op = '&gt;';
                            if( ah.nameattr == 'Cardinality' ) {
                                selected = 'selected';
                            } 
                        } else if( op == '<' ) {
                            op = '&lt;';
                        }
                        select += '<option value="' + op + '" ' + selected + '>' +op + '</option>';
                    }	
                    if( range != undefined && range.type == "list" ){
                        for( let v=0 ; v<range.values.length ; v++ ) {
                            let txt = (ah.type == "String")? "'" + range.values[v].value + "'": range.values[v].value;
                            select += '<option value="= ' + txt + '">= ' + txt + '</option>';
                        }
                    }
                    select += '</select>';
                    rootDiv.append(select);

                    rootDiv.append('<input type=text id="' + this.rootId +
                            '_val" class="inputvalue form-control input-sm" style="display: inline-block;' + 
                            ' height: 21px; width:100px; font-size: small;font-family: courier;" value="' +
                            default_value + '">');
                    if( range != undefined && range.values.length>0 ){
                        this.loadRange( '#' + this.constListId + ' input[id="' + this.rootId + '_val"]',range);
                    }
                }
                $('#' + this.constListId).append("</div>");	

                let opSelected = '#' + this.constListId      + ' select[id="' + this.rootId + '_op"] option:selected';
                let opInput    = $('#' + this.constListId    + ' select[id="' + this.rootId + '_op"]');
                let andorInput = $('#' + this.constListId    + ' select[id="' + this.rootId + '_andor"]');
                let andorInputOpt = $('#' + this.constListId + ' select[id="' + this.rootId + '_andor"] option:selected');
                let valInput   = $('#' + this.constListId    + ' input[id="' + this.rootId + '_val"]');
                let closeInput = $('#' + this.constListId    + ' a[id="' + this.rootId + '_close"]');
                closeInput.click(function() {
                    rootDiv.remove();
                    if($("#" + this.id)){}
                    that.fireRemoveFirstAndOr(this.rootId);
                    if( ah.nameattr.startsWith('Qualifier ') ||  ah.nameorg.startsWith('Qualifier ') || ah.nameattr.startsWith('Cardinality')) {
                        that.fireRemoveConstRef(ah.nameattr); 
                    }
                    if( ah.nameattr.startsWith('POSLIST:') ){
                        $("#" + $("#" + "tapwhereposition_constposcont input:text")[0].id).val("");
                        $("span#uploadresult").text("");
                    }
                    that.editorModel.updateQuery();
                    that.fireTypoMsg(false, '');
                });
                opInput.change(function() {
                    var v = this.value;
                    var regex = /=\s+(.+)/;
                    var results = regex.exec(v);
                    if( results ) {	
                        $('#' + that.constListId + ' select[id="' + that.rootId + '_op"] option[value="="]').prop('selected', true);
                        valInput.val(results[1]);
                    }
                    var ao =  (andorInputOpt.length > 0)? andorInputOpt.text(): "";
                    that.editorModel.updateQuery();				
                });
                andorInput.change(function() {
                    that.editorModel.updateQuery();			
                });

                valInput.keyup(function(event) {
                    that.editorModel.updateQuery();
                });

                valInput.click(function(event) {
                    that.editorModel.updateQuery();
                });

                valInput.on('input', function(event) {
                    that.editorModel.updateQuery();			
                });

                that.editorModel.updateQuery();

            }
        },
        getOperator : {
            value: function(){
                return $('#' + this.constListId      + ' select[id="' + this.rootId + '_op"] option:selected').text();
            }
        },
        getOperand : {
            value: function(){
                return $('#' + this.constListId    + ' input[id="' + this.rootId + '_val"]').val();
            }
        }
    });
}

