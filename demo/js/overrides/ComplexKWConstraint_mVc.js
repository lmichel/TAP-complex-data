var ComplexKWConstraint_mVc;

function ComplexKWConstraint_mVcExtends(){
    ComplexKWConstraint_mVc = function(params){
        TapKWConstraint_mVc.call(this,params);
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
                    var select='<select id="' + this.rootId + '_andor" style="font-size: small;font-family: courier;\">';
                    for( var i=0 ; i<andors.length; i++ ) {
                        var op = andors[i];
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
                    var select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
                    for( i=0 ; i<operators.length; i++ ) {
                        var op = operators[i];
                        var selected = '';
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
                        for( var v=0 ; v<range.values.length ; v++ ) {
                            var txt = (ah.type == "String")? "'" + range.values[v].value + "'": range.values[v].value;
                            select += '<option value="= ' + txt + '">= ' + txt + '</option>';
                        }
                    }
                    select += '</select>';
                    rootDiv.append(select);

                    rootDiv.append('<input type=text id="' + this.rootId 
                            + '_val" class="inputvalue form-control input-sm" style="display: inline-block; height: 21px; width:100px; font-size: small;font-family: courier;" value="' 
                            + default_value + '">');
                    if( range != undefined && range.values.length>0 ){
                        this.loadRange( '#' + this.constListId + ' input[id="' + this.rootId + '_val"]',range);
                    }
                }
                $('#' + this.constListId).append("</div>");	

                var opSelected = '#' + this.constListId      + ' select[id="' + this.rootId + '_op"] option:selected';
                var opInput    = $('#' + this.constListId    + ' select[id="' + this.rootId + '_op"]');
                var andorInput = $('#' + this.constListId    + ' select[id="' + this.rootId + '_andor"]');
                var andorInputOpt = $('#' + this.constListId + ' select[id="' + this.rootId + '_andor"] option:selected');
                var valInput   = $('#' + this.constListId    + ' input[id="' + this.rootId + '_val"]');
                var closeInput = $('#' + this.constListId    + ' a[id="' + this.rootId + '_close"]');
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
                    that.fireEnterEvent();
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
                    that.fireEnterEvent(ao
                            , this.value
                            , valInput.val());				
                });
                andorInput.change(function() {
                    that.fireEnterEvent(this.value
                            , $(opSelected).text()
                            , valInput.val());				
                });
                valInput.keyup(function(event) {
                    /*
                    * Run the query is CR is typed in a KW editor
                    */
                    if (event.which == '13') {
                        if( that.isConstraintOK() ) {
                            that.fireRunQuery();
                        } else {
                            Modalinfo.error("Current contraint is not valid: cannot run the query");
                        }
                    } else {
                        that.fireEnterEvent(that.getAndOr()
                                , $(opSelected).text()
                                , this.value);
                    }
                });
                valInput.click(function(event) {
                    that.fireEnterEvent(that.getAndOr()
                            , $(opSelected).text()
                            , this.value);

                });
                valInput.on('input', function(event) {
                    that.fireEnterEvent(that.getAndOr()
                            , $(opSelected).text()
                            , this.value);			
                });
                this.fireEnterEvent(this.getAndOr()
                        , $(opSelected).text()
                        ,valInput.val());
            }
        }
    });
}

