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
                            + ' <div class="fieldlist" id="' + this.fieldListId +  '" style="height: 250px"></div>'
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
                /**
             * Draw one field in the container
             * Field described by the attribute handler ah
             */
            displayField:{
                value : function(ah){
                    var that = this;
                    var id = this.formName + "_" + vizierToID(ah.nameattr);
                    var title = this.getAttributeTitle(ah);
                    var row ="<tr class=attlist id=" + vizierToID(ah.nameattr) + ">" 
                    +"<td class=attlist><span title='" + title + "'>"+ ah.nameorg+"</span></td>"
                    +"<td class='attlist help'>" + ah.type +"</td>"
                    +"<td class='attlist help'>" + ((ah.unit != undefined)? ah.unit:"") +"</td>"
                    ;
    
                    if( this.orderByHandler != null ) {
                        row += "<td class='attlist attlistcmd'>"
                            +"<input id=order_" + id + " title=\"Click to order the query result by this field\" class=\"orderbybutton\" type=\"button\" ></input>"
                            +"</td>";
                    }
                    if( this.stackHandler != null ) {
                        row += "<td class='attlist attlistcmd'>"
                            +"<input id=stack_" + id + " title=\"" + this.stackTooltip  + "\"  class=\"stackconstbutton\" type=\"button\"></input>"
                            +"</td>";
                    }
                    if( this.raHandler != null ) {
                        row += "<td class='attlist attlistcmd'>"
                            +"<input id=tora_" + id + " title=\"Click to use this field as RA coordinate\"  class=\"raconstbutton\" type=\"button\"></input>"
                            +"</td>";
                    }
                    if( this.decHandler != null ) {
                        row += "<td class='attlist attlistcmd'>"
                            +"<input id=todec_" + id + " title=\"Click to use this field as DEC coordinate\"  class=\"decconstbutton\" type=\"button\"></input>"
                            +"</td>";
                    }
                    row += "</tr>";
                    $('#' + this.fieldTableId).append(row);
                    var id = this.formName + "_" + vizierToID(ah.nameattr);
                    if( this.orderByHandler != null ) {
                        $('#' + this.fieldListId + ' input[id="order_' + id + '"]' ).click(function() {that.orderByHandler($(this).closest("tr").attr("id"));});
                    }
                    if( this.stackHandler != null ){
                        $('#' + this.fieldListId + ' input[id="stack_' + id + '"]' ).click(function() {
                            that.stackHandler($(this).closest("tr").attr("id"));});
                    }
                    if( this.raHandler != null ){
                        $('#' + this.fieldListId + ' input[id="tora_' + id + '"]' ).click(function() {that.raHandler($(this).closest("tr").attr("id"));});
                    }
                    if( this.decHandler != null ){
                        $('#' + this.fieldListId + ' input[id="todec_' + id + '"]' ).click(function() {that.decHandler($(this).closest("tr").attr("id"));});
                    }
                    $('#' + this.fieldTableId + " tr#" + vizierToID(ah.nameattr) + " span").tooltip( {
                    //$('#' + this.fieldTableId + ' tr[id="'+ vizierToID(ah.nameattr) + '"]span').tooltip( {
                        track: true,
                        delay: 0,
                        showURL: false,
                        opacity: 1,
                        fixPNG: true,
                        showBody: " - ",
                        // extraClass: "pretty fancy",
                        top: -15,
                        left: 5
                    });
                },
            },
        });

    }