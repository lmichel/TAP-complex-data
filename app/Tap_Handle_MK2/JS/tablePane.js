class CollapsableDiv{
    constructor(holder,name,collapsed,firstClickHandler,elems,expendOn=undefined,parity=true){
        let id = "collapsable-holder-" + name;
        if($("#" + id,holder).length>0){
            $("#" + id,holder).html("").removeClass("collapsable-holder "+ (parity?"odd":"even")).addClass("collapsable-holder "+ (parity?"even":"odd"));
        }else{
            holder.append("<div class='collapsable-holder "+ (parity?"even":"odd") + "' id = '" + id + "' ></div>");
        }
        this.holder = $("#" + id,holder);
        this.name = name;
        this.parity = parity;
        this.header=undefined;
        this.div = undefined;

        this.buildHeader(elems);

        this.holder.append("<div class='collapsable-div' id = 'collapsable-div-" + name + "' style = 'max-width:" + this.header[0].offsetWidth + "' ></div>");
    
        this.div = $("#collapsable-div-" + name,this.holder );
        if(collapsed){
            this.div.hide();
        }

        this.registerEvents(firstClickHandler,expendOn);
    }

    buildHeader(elems){
        let header = "<div class='collapsable-header' id = 'collapsable-header-" + this.name + "'>";
        if(elems){
            let r=[],c=[],l=[];
            let totWeight=0,lWeight=0,rWeight=0,cWeight=0;
            let addition;

            for (let i=0;i<elems.length;i++){

                if(elems[i].weight === undefined){
                    elems[i].weight=1;
                }
                totWeight +=elems[i].weight;

                if(elems[i].txt){
                    addition="class ='";
                    if (elems[i].type){
                        addition += " collapsable-" + elems[i].type;
                    }
                    if (elems[i].monoline){
                        addition += " monoline";
                    }
                    addition += "'";
                    elems[i].toDom = "<p "+ addition +">" + elems[i].txt + "</p>";
                }

                switch(elems[i].pos){
                    case "center":{
                        c.push(elems[i]);
                        cWeight+=elems[i].weight;
                    }break;
                    case "left":{
                        l.push(elems[i]);
                        lWeight+=elems[i].weight;
                    }break;
                    case "right":{
                        r.push(elems[i]);
                        rWeight+=elems[i].weight;
                    }break;
                }
            }

            if(l.length>0){
                header += '<div class="txt-left col-'+Math.floor(lWeight/totWeight*12)+'">';
                    l.forEach(function(element) {
                        header += '<div class="side-div">'+ element.toDom + "</div>";
                    });
                    header += "</div>";
            }
            if(c.length>0){
                header += '<div class="txt-center col-'+Math.floor(cWeight/totWeight*12)+'">';
                    c.forEach(function(element) {
                        header += '<div class="side-div">'+ element.toDom + "</div>";
                    });
                    header += "</div>";
            }
            if(r.length>0){
                header += '<div class="txt-right col-'+Math.floor(rWeight/totWeight*12)+'">';
                    r.forEach(function(element) {
                        header += '<div class="side-div">'+ element.toDom + "</div>";
                    });
                    header += "</div>";
            }
        }

        header += "</div>";
        this.holder.append(header);
        this.header = $("#collapsable-header-" + this.name,this.holder);

        let getNBLines = function(e,h){
            return Math.round(e.clientHeight/h);
        };

        $("p.monoline",this.header).each((i,e)=>{
            let h = 1.5*parseFloat(getComputedStyle(e).fontSize); //the 1.5 factor comes from empirical tests
            if(getNBLines(e,h)>1){
                let a,b,text = e.innerText,c=getNBLines(e,h);
                e.innerText = text.substr(0, Math.round(text.length/c));
                if(getNBLines(e)>1){
                    b = e.innerText.length;
                    a = Math.round(text.length/(c+1));
                } else {
                    a = e.innerText.length;
                    b = Math.round(text.length/(c-1));
                }
                while(a!=b){

                    c = Math.floor((a+b)/2);
                    e.innerText = text.substr(0,c);
                    if(getNBLines(e,h)>1){
                        b=c;
                    }else{
                        if(c==a){
                            b=a;
                        }
                        a=c;
                    }
                }
                e.innerText = text.substr(0,c-3) + "...";
                //final adjustement sometimes usefull
                while(getNBLines(e,h)>1){
                    e.innerText = text.substr(0,c-4) + "...";
                }
            }
        });
    }

    registerEvents(firstClickHandler,expendOn){

        this.div.data("clicked",false);
        let handler = ()=>{
            if(!this.div.data("clicked")){
                this.div.data("clicked",true);
                if(firstClickHandler!==undefined){
                    firstClickHandler(this.div);
                }
            }
            this.div.toggle();
        };

        if(expendOn !== undefined){
            let elem =  $(".collapsable-"+expendOn,this.header);
            if(elem.length>0){
                elem.click(handler);
            }else{
                this.header.click(handler);
            }
        }else{
            this.header.click(handler);
        }
    }


}

class TablePane{
    constructor(div,logger = new utils.DisabledLogger()){
        this.api = undefined;
        this.holder = div;
        this.holder.html("");
        this.logger = logger;
        if(logger.hide == undefined){
            logger.hide = ()=>{};
        }
    }
    quoteIfString(str){

        if(isNaN(str) || isNaN(parseInt(str)) || isNaN(+str) ){
            return "'" + str+ "'";
        }
    
        return  str ;
    }
    setApi(api){
        let object_map = api.getObjectMap();
        if(object_map.status){
            object_map=object_map.object_map;
        }else{
            let that = this;
            $(document).trigger("error.application",{
                error : object_map.error,
                origin : that,
            });
        }
        this.holder.html("");
        this.api = api;
        let table = api.getConnector().connector.service.table;
        let tableB64 = btoa(table).replace(/\//g,"_").replace(/\+/g,"-").replace(/=/g,""); // btoa use the B64 charset containing / and + not good for ids
        this.struct = {
            div:new CollapsableDiv(this.holder,tableB64,false,undefined,
                [
                    {txt:table,type:"title",pos:"center"},
                    {pos:"left",txt:object_map.tables[table].description,type:"desc",weight:2,monoline:true},
                    {
                        toDom:"<div><input type='checkbox' id='"+tableB64+"_constraint' name='"+tableB64+
                            "' style='margin:.4em' checked><label for='"+tableB64+"'>Constraints</label></div>",
                        pos:"right"
                    },
                    {
                        toDom:"<div style='font-size: small;padding-left:0.5em;border-left:0.1em black solid;'><label for='" + tableB64 + 
                            "_limit'>Queryied entries :</label><select id='" +
                            tableB64 + "_limit'> <option value='10'>10</option>" +
                            "<option value='20'>20</option><option value='50'>50</option><option value='100'>100</option>" +
                            "<option value='0'>unlimited</option> </select></div>",
                        pos:"right"
                    },
                    {
                        toDom:"<div style='padding-left:0.5em;border-left:0.1em black solid;'><input type='checkbox' id='" + tableB64 + "_fullTables'" +
                            " style='margin:.4em' checked><label for='" + tableB64 + "_fullTables'>Selected tables only</label></div>",
                        pos:"right"
                    }
                ],
                "title"
            ),
            childs:[]
        };
        this.refresh();
    }

    refresh(){
        this.struct.childs = [];
        this.struct.div.div.html("");
        this.makeTable(this.struct);
    }
    /**
     * 
     * @param {CollapsableDiv} colDiv 
     */
    async makeTable(struct,keyvals){
        let colDiv = struct.div;
        let tableB64 = colDiv.name;
        let tableName = atob(tableB64.replace(/_/g,"/").replace(/-/g,"+"));

        let that = this;
        /*/ checking that all joining keys are selected and select them if needed /*/
        let object_map = this.api.getObjectMap();
        if(object_map.status){
            object_map=object_map.object_map;
        }else{
            $(document).trigger("error.application",{
                error : object_map.error,
                origin : that,
            });
            return;
        }

        let keys = this.api.getJoinKeys(tableName);

        if(keys.status){
            keys=keys.keys;
        }else{
            $(document).trigger("error.application",{
                error : keys.error,
                origin : that,
            });
            return;
        }

        if(object_map.tables[tableName].columns.length == 0){
            console.log("selecting fields");
            let t = await this.api.getSelectedFields(tableName);
            
            if(t.status){ // out object map is a copy so I need to update it by hand
                object_map.tables[tableName].columns = t.fields;
            }else{
                $(document).trigger("error.application",{
                    error : t.error,
                    origin : that,
                });
                return;
            }
        }

        let toSelect = keys.filter((k)=>object_map.tables[tableName].columns.includes(k));

        let selected = new Set(object_map.tables[tableName].columns);
        
        for (let i=0;i<toSelect.length;i++){
            this.api.selectField(toSelect[i],tableName,false);
        }

        this.logger.info("gathering table's data");

        let fieldsData = await this.api.getTableSelectedField(tableName,keyvals);
        
        if(!fieldsData.status){
            $(document).trigger("error.application",{
                error : fieldsData,
                origin : that,
            });
            return;
        }
        
        // fieldsData.field_values is a two dim array : an array of rows
        // fieldsData.field_names is a single dim array : the array of the col names
        // the order is important as fieldsData.field_names[i] is the column names of all fieldsData.field_values[n][i] where n is the line number

        /* Building a "hash" map to get the keys from the row data */
        let Hmap = {};
        let kMap;
        for(let l = 0;l<fieldsData.field_values.length;l++){
            kMap = {};
            fieldsData.field_values[l] = fieldsData.field_values[l].filter((val,index)=>{
                if(keys.includes(fieldsData.field_names[index])){
                    kMap[fieldsData.field_names[index]] = this.quoteIfString(val);
                }
                return selected.has(fieldsData.field_names[index]);
            });
            Hmap[fieldsData.field_values[l].join("")] = kMap;
        }
        // why not simply fieldsData.field_names = Array.from(selected) ?
        // because of the order of the fields which we want to keep in order for the data to still be relevant
        // and for the Hmap to work
        
        fieldsData.field_names = fieldsData.field_names.filter((v)=>selected.has(v)); 

        let ahs = await this.api.getTableAttributeHandlers(tableName);
        if(!ahs.status){
            $(document).trigger("error.application",{
                error : ahs,
                origin : that,
            });
            return;
        }
        ahs = ahs.attribute_handlers;

        let handler = this.makeSubdivsFactory(struct,Hmap);

        let options = {
            "aaData":fieldsData.field_values,
            "aoColumns":fieldsData.field_names.map((e)=>{
                return {
                    "sTitle":'<span title="' + 
                        that.ahToTooltip(ahs.filter((v)=>{return v.nameorg.toUpperCase() == e.toUpperCase();})[0]) + 
                        '">' + e + '</span>'};
            }),
            "pagingType" : "simple",
            "aaSorting" : [],
            "bSort" : false,
            "bFilter" : true,
            "aLengthMenu": [5, 10, 25, 50, 100],
            "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
                ValueFormator.reset();
                for( var c=0 ; c<aData.length ; c++ ) {
                    var copiedcolumnMap = {access_format: -1, s_ra: -1, s_dec: -1, s_fov: -1, currentColumn: -1};
                    var colName = $(this.fnSettings().aoColumns[c].sTitle).text();
                    /*
                     * Makes sure the mime type is for the current column 
                     */
                    if( colName != "access_url" ) {
                        copiedcolumnMap.access_format = -1;
                    }
                    copiedcolumnMap.currentColumn = c;
    
                    ValueFormator.formatValue(colName, aData, $('td:eq(' + c + ')', nRow), copiedcolumnMap);
                        
                }
                
                //------------------ load alix in the firt position coordonnate -------------------------
                /*if(isloadAlix==false){
                    if(columnMap.s_ra != -1 && columnMap.s_dec !=-1){
                    ra=aData[columnMap.s_ra];
                    dec=aData[columnMap.s_dec];
                    var dec_name = $(this.fnSettings().aoColumns[columnMap.s_dec].sTitle).text();
                    var ra_name = $(this.fnSettings().aoColumns[columnMap.s_ra].sTitle).text();
                    var tab=  getCurrentName().quotedTableName().qualifiedName;
                    isloadAlix=true;
                    //dataTreeView.showNodeInfos( dataTreePath.nodekey );
                    var nameTitle =dataTreeView.dataTreePath.nodekey+">"+tab;
                    var urlPath = myNodeInfo(dataTreePath.nodekey).info.url;
                    //ValueFormator.addAlixButton(nameTitle,ra,dec,urlPath,tab,ra_name,dec_name);
                    }
                }*/
                
                handler(nRow, aData, iDisplayIndex);
                return nRow;
            }
        };
        let positions = [
            { "name": "information",
                "pos" : "top-center"
            },
            { "name": "pagination",
                "pos": "top-center"
            },
            { "name": "length",
                "pos": "top-left"
            },
            { "name": 'filter',
                "pos" : "top-right"
            }
        ];

        let tableID = "datatable_" + tableB64;
        colDiv.div.append("<table id=\"" + tableID + "\" class=\"display\"></table>");
        
        CustomDataTable.create(tableID, options, positions);
    
        $("#"+tableID+" span").tooltip( { 
            track: true, 
            delay: 0, 
            showURL: false, 
            opacity: 1, 
            fixPNG: true, 
            showBody: " - ", 
            top: -15, 
            left: 5 	
        });

        let oldW = parseInt($("table#" + tableID)[0].style.width);
        let newW = parseInt($("div#collapsable-div-" + tableB64)[0].style["max-width"]);
        if(Math.abs(oldW-newW)<10){
            $("table#" + tableID)[0].style.width = (newW -1) + "px";
        }
        
        $("#"+tableID+"_wrapper").css("overflow", "hidden");
    }

    removeChilds(struct){
        for (let i = 0;i<struct.childs.length;i++){
            struct.childs[i].div.holder.remove();
            delete struct.childs[i].div;
            this.removeChilds(struct.childs[i]);
        }
        struct.childs = [];
    }

    makeSubdivsFactory(struct,Hmap){
        let colDiv = struct.div;
        let tableB64 = colDiv.name;
        let tableName = atob(tableB64.replace(/_/g,"/").replace(/-/g,"+"));
        let that = this;

        let subtables = this.api.getJoinedTables(tableName);
        if(subtables.status){
            subtables = subtables.joined_tables;
        }else{
            $(document).trigger("error.application",{
                error : subtables.error,
                origin : that,
            });
            return;
        }

        let object_map = this.api.getObjectMap();
        if(object_map.status){
            object_map=object_map.object_map;
        }else{
            $(document).trigger("error.application",{
                error : object_map.error,
                origin : that,
            });
            return;
        }

        return (nRow,data)=>{
            $(nRow).click(()=>{

                // TODO : re-open divs

                let h = $(".rHighlight",$(nRow).parent());
                if(h.get(0)==nRow){
                    return;
                }
                h.removeClass("rHighlight");
                $(nRow).addClass("rHighlight");

                let open = struct.childs.filter(s=>s.div.div.is(":visible"));
                open = open.map(s=> s.div.name);
                open = new Set(open);

                that.removeChilds(struct);

                let gKMap = Hmap[data.join("")];
                let joints = that.api.getJoinedTables(tableName).joined_tables;
                for(let table in subtables){
                    tableB64 = btoa(table).replace(/\//g,"_").replace(/\+/g,"-").replace(/=/g,"");
                    let nb = Object.keys(that.api.getJoinedTables(table).joined_tables).length;
                    let s = {
                        div : {},
                        childs:[]
                    };
                    let kMap = {};
                    let nkey;
                    for (let oKey in gKMap){
                        nkey = joints[table].keys.filter(v=>v.from==oKey)[0];
                        if(nkey !== undefined){
                            kMap[nkey.target] = gKMap[oKey];
                        }
                        
                    }
                    s.div = new CollapsableDiv(struct.div.div,tableB64,true,
                        that.makeTable.bind(that,s,kMap),
                        [
                            {txt:table + (nb>0?" " + nb +"+":""),type:"title",pos:"center"},
                            {pos:"left",txt:object_map.tables[table].description,type:"desc",weight:2,monoline:true},
                            {
                                toDom:"<div><input type='checkbox' id='"+tableB64+"_constraint' name='"+tableB64+
                                    "' style='margin:.4em' checked><label for='"+tableB64+"'>Constraints</label></div>",
                                pos:"right"
                            },
                            {
                                toDom:"<div style='font-size: small;padding-left:0.5em;border-left:0.1em black solid;'><label for='" + tableB64 + 
                                    "_limit'>Queryied entries :</label><select id='" +
                                    tableB64 + "_limit'> <option value='10'>10</option>" +
                                    "<option value='20'>20</option><option value='50'>50</option><option value='100'>100</option>" +
                                    "<option value='0'>unlimited</option> </select></div>",
                                pos:"right"
                            },
                            {
                                toDom:"<div style='padding-left:0.5em;border-left:0.1em black solid;'><input type='checkbox' id='" + tableB64 + "_fullTables'" +
                                    " style='margin:.4em' checked><label for='" + tableB64 + "_fullTables'>Selected tables only</label></div>",
                                pos:"right"
                            }
                        ],
                        "title",
                        !struct.div.parity,
                    );
                    if(open.has(tableB64)){
                        $(".collapsable-title",$("#collapsable-header-" + tableB64,struct.div.div)).click();
                    }

                    struct.childs.push(s);
                }
            });
            
        };
        
    }

    ahToTooltip(ah){
        if(ah === undefined){
            return "No description available";
        }else {
            return ah.description.replace(/&[a-z]+;/g, '').replace(/[<>]/g, ' ').replace(/"/g, '') +
                " - Name: " + ah.nameorg +
                " - Unit: " + ah.unit +
                " - UCD: " + ah.ucd +
                " - UType: " + ah.utype +
                " - DataType: " + ah.dataType;
        }
    }
}