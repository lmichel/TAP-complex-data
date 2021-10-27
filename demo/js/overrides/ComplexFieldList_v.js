var ComplexFieldList_mVc;
var ComplexFullFieldList_mVc;

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
                        ' <div class="form-group" style="width:100%; margin-bottom:8px; margin-top:8px;"><div class="input-group"><div class="input-group-addon input-sm"><span class="glyphicon glyphicon-search"></span></div>'+
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
        getAttributeTitle : {
            value: function(ah) {
                return ah.nameorg  +
                " - database name: " +  ah.nameattr +
                " - description: " +  ah.description +
                " - UCD: " +  ah.ucd +
                " - Unit: " +  ah.unit +
                " - Type: " +  ah.type +
                ((ah.range)?(" - Range: " +  JSON.stringify( ah.range).replace(/'/g,"&#39;")): "");
            }
        },
        
    });

    ComplexFullFieldList_mVc = function(parentDivId, formName, handlers,tables){
        ComplexFieldList.call(this, parentDivId, formName, handlers);
        this.tables = tables;
    };

    ComplexFullFieldList_mVc.prototype = Object.create(ComplexFieldList.prototype, {
        /**
        * Draw one field in the container
        * Field described by the attribute handler ah
        */ 
        displayField:{
            value:function(ah){
                var that = this;
                let trId = `${ah.table_name}`.replace(".","_") +"_"+ah.nameattr;
                var id = this.formName + "_" +trId;
                var title = this.getAttributeTitle(ah).toHtmlSafe();
                var row ="<tr class=attlist id=" + trId + ">" +
                "<td class=attlist><span title='" + title + "'>"+ ah.table_name +"." + ah.nameorg+"</span></td>" +
                "<td class='attlist help'>" + ah.type +"</td>" +
                "<td class='attlist help'>" + ((ah.unit != undefined)? ah.unit:"") +"</td>";

                if( this.orderByHandler != null ) {
                    row += "<td class='attlist attlistcmd'>" +
                        "<input id=order_" + id + " title=\"Click to order the query result by this field\" class=\"orderbybutton\" type=\"button\" ></input>" +
                        "</td>";
                }
                if( this.stackHandler != null ) {
                    row += "<td class='attlist attlistcmd'>" +
                        "<input id=stack_" + id + " title=\"" + this.stackTooltip  + "\"  class=\"stackconstbutton\" type=\"button\"></input>" +
                        "</td>";
                }
                if( this.raHandler != null ) {
                    row += "<td class='attlist attlistcmd'>"  +
                        "<input id=tora_" + id + " title=\"Click to use this field as RA coordinate\"  class=\"raconstbutton\" type=\"button\"></input>" +
                        "</td>";
                }
                if( this.decHandler != null ) {
                    row += "<td class='attlist attlistcmd'>" +
                        "<input id=todec_" + id + " title=\"Click to use this field as DEC coordinate\"  class=\"decconstbutton\" type=\"button\"></input>" +
                        "</td>";
                }
                row += "</tr>";
                $('#' + this.fieldTableId).append(row);
                if( this.orderByHandler != null ) {
                    $('#' + this.fieldListId + ' input[id="order_' + id + '"]' ).click(function() {that.orderByHandler($(this).closest("tr").attr("id"));});
                }
                if( this.stackHandler != null ){
                    $('#' + this.fieldListId + ' input[id="stack_' + id + '"]' ).click(function() {
                        that.stackHandler($(this).closest("tr").attr("id"));
                    });
                }
                if( this.raHandler != null ){
                    $('#' + this.fieldListId + ' input[id="tora_' + id + '"]' ).click(function() {that.raHandler($(this).closest("tr").attr("id"));});
                }
                if( this.decHandler != null ){
                    $('#' + this.fieldListId + ' input[id="todec_' + id + '"]' ).click(function() {that.decHandler($(this).closest("tr").attr("id"));});
                }
                
                $('#' + this.fieldTableId + " tr#" + trId + " span").tooltip( {
                    track: true,
                    delay: 0,
                    showURL: false,
                    opacity: 1,
                    fixPNG: true,
                    showBody: " - ",
                    top: -15,
                    left: 5
                });
            }
        },
        displayFields : {
            value : function(){
                var that = this;
                this.attributesHandlers ={};
                let dt = $.extend({},this.dataTreePath);
                let table  = "<table id=" + this.fieldTableId + " style='width: 100%; border-spacing: 0px; border-collapse:collapse' class='table'></table>";
                $('#' + this.fieldListId).html(table);

                for (let i =0;i<this.tables.length;i++){
                    dt.table = this.tables[i];
                    dt.tableorg = this.tables[i];
                    dt.key = [dt.nodekey, dt.schema, dt.table].join(".");
                    MetadataSource.getTableAtt(
                        dt,
                        function(cache) {
                            that.resetPosKeywords();
                            var ahm = cache.hamap;
                            for( var k=0 ; k<ahm.length ; k++) {
                                var ah = ahm[k];
                                that.attributesHandlers[`${ah.table_name}`.replace(".","_") +"_"+ ah.nameattr] = ah;				
                                that.displayField(ah);
                            }
                            that.lookForAlphaKeyword();
                            that.lookForDeltaKeyword();
                        }
                    );
                }
    
            }
        } ,
    });
}