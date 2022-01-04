class TablePane{
    constructor(div,logger = new utils.DisabledLogger()){
        this.api = undefined;
        div.html("<div id='TP-header' style='text-align:center'></div><div id='TP-holder' style='display: flex;flex-direction: column;'>");
        this.header = $("#TP-header",div) ;
        this.holder = $("#TP-holder",div);
        this.logger = logger;
        let that = this;
        $("").click(()=>{
            if(that.api !== undefined){
                ModalInfo.info("Bookmark the following URL\nhttps://saada.unistra.fr/tapcomplex/app/Tap_Handle_MK2/taphandle.html?url=" +
                    that.api.getConnector().connector.service.tapService +
                    "\nto connect TapHandle on the current node at starting time."
                );
            }
        });
        if(logger.hide == undefined){
            logger.hide = ()=>{};
        }
        $(document).on("column_selection_changed.meta",(e,args)=>{
            if (args.api === this.api){
                if(args.selected.size == 0 && args.unselected.size == 0){
                    return;
                }
                let s = this.getStruct(args.table);
                if( s === undefined){
                    return;
                }
                if(s.div.div.data("clicked") || s == this.struct){
                    this.removeChilds(s);
                    s.div.div.html("");
                    this.makeTable(s,s.kMap);
                }
            }
        });
    }

    getStruct(table,startStruct){
        if(startStruct === undefined){
            startStruct = this.struct;
        }
        if( startStruct === undefined){
            return undefined;
        }
        if(startStruct.table === table){
            return startStruct;
        }
        if(startStruct.childs.length == 0){
            return undefined;
        }else{
            let i=0;
            let s = this.getStruct(table,startStruct.childs[i]);
            while (i<startStruct.childs.length && s === undefined){
                i++;
                s = this.getStruct(table,startStruct.childs[i]);
            }
            return s;//s equals undefined if no childs contains the right struct or is the right struct
        }
    }

    quoteIfString(str){

        if(isNaN(str) || isNaN(parseInt(str)) || isNaN(+str) ){
            return "'" + str+ "'";
        }
    
        return  str ;
    }
    setApi(api){
        this.logger.info("Setting up tables");
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
        let connector = api.getConnector().connector.service;
        this.header.html("<h3> " +
            connector.shortName + ": " +
            connector.schema + "." + connector.table+
            " </h3> </h4>" + connector.schemas[connector.schema].description +
            "</h4>");
        let table = connector.table;
        let tableB64 = btoa(table).replace(/\//g,"_").replace(/\+/g,"-").replace(/=/g,""); // btoa use the B64 charset containing / and + not good for ids

        this.logger.info("building internal structure");
        this.struct = {
            div:new CollapsableDiv(this.holder,tableB64,false,undefined,
                [
                    {txt:table,type:"title",pos:"center"},
                    {pos:"left",txt:object_map.tables[table].description,type:"desc",monoline:true,weight:2},
                    {
                        toDom:"<a id='"+tableB64+"_columns' name='"+tableB64+
                        "' style='padding-left: 25;background: transparent url(./icons/header_23.png) center left no-repeat;' class='bannerbtn' title='select columns to query'></a>",
                        pos:"right"
                    },
                    {
                        toDom:"<a id='"+tableB64+"_cone' name='"+tableB64+
                        "'style='padding-left: 25;background: transparent url(./icons/source_detail_23.png) center left no-repeat;' class='bannerbtn' title = 'Refine Query'></a>",
                        pos:"right"
                    },
                    {
                        toDom:"<a id='"+tableB64+"_dll' style='padding-left: 25;background: transparent url(./icons/download_23.png) center left no-repeat;' title='dowload VO table' class='bannerbtn'></a>",
                        pos:"right"
                    },
                ],
                "title"
            ),
            table:table,
            childs:[]
        };
        $("#" +tableB64+"_columns", this.struct.div.header).click(()=>{
            MetaDataShower(this.api,table);
        });
        $("#" +tableB64+"_cone", this.struct.div.header).click(()=>{
            $(document).trigger("cone_search_update_table.control",{table:table});
        });
        this.refresh();
    }

    refresh(){

        this.logger.info("refrashing table content");
        this.struct.childs = [];
        this.struct.div.div.html("");
        this.makeTable(this.struct);
    }
    /**
     * 
     * @param {CollapsableDiv} colDiv 
     */
    async makeTable(struct,keyvals){

        this.logger.info("Gathering meta data 1");
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
            this.logger.hide();
            ModalInfo.error("An unexpected error has occured please retry. If the error persist check the logs for more info");
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
            this.logger.hide();
            ModalInfo.error("An unexpected error has occured please retry. If the error persist check the logs for more info");
            return;
        }

        this.logger.info("updating fields selection");
        if(object_map.tables[tableName].columns.length == 0){
            let t = await this.api.getSelectedFields(tableName);
            
            if(t.status){ // out object map is a copy so I need to update it by hand
                object_map.tables[tableName].columns = t.fields;
            }else{
                $(document).trigger("error.application",{
                    error : t.error,
                    origin : that,
                });
                this.logger.hide();
                ModalInfo.error("An unexpected error has occured please retry. If the error persist check the logs for more info");
                return;
            }
        }
        $("#" + tableB64+"_dll").prop("href",
            this.api.getConnector().connector.service.tapService + 
            "?format=votable&request=doQuery&lang=ADQL&query=" + 
            encodeURIComponent((await this.api.getTableQuery(tableName,keyvals)).query)
        );

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
            this.logger.hide();
            ModalInfo.error("An unexpected error has occured please retry. If the error persist check the logs for more info");
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

        this.logger.info("Gathering meta data 2");

        let ahs = await this.api.getTableAttributeHandlers(tableName);
        if(!ahs.status){
            $(document).trigger("error.application",{
                error : ahs,
                origin : that,
            });
            this.logger.hide();
            ModalInfo.error("An unexpected error has occured please retry. If the error persist check the logs for more info");
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

        this.logger.info("Formating table");
        let tableID = "datatable_" + tableB64;
        colDiv.div.append("<table id=\"" + tableID + "\" class=\"display\"></table>");
        
        CustomDataTable.create(tableID, options, positions);

        $("table#" + tableID)[0].style.width = "fit-content";
        $("#"+ tableID + "_wrapper input.filter-result",colDiv.div)[0].style = "padding: .1em;font-size: 1em;padding-left: .5em;";
        
        $("#"+tableID+"_wrapper").css("overflow", "hidden");

        let arr;
        $("#"+tableID+" span").each((i,e)=>{
            arr = e.title.split(" - ");
            if(e.parentElement.nodeName == "TD"){
                // some description have some " - " inside them making arr[1] not containing the whole text this is why I create a special var for the text
                // for some reason clientWidth works better than offsetWidth better stick on that 
                let oWidth = e.parentElement.clientWidth,a=27,b=arr[1].length,c,text = e.title.replace(" - ","");
                let oDelta = oWidth - e.offsetWidth;
                while (b-a>1){
                    c = Math.floor((b+a)/2);
                    e.textContent = text.substr(0,c);
                    if(oWidth<e.parentElement.clientWidth){
                        b=c;
                    }else{
                        a=c;
                    }
                }
                c=b;

                if(c<text.length){
                    e.textContent = text.substr(0,c-4)+" ...";
                }else{
                    e.textContent = text.substr(0,c);
                }
                let safe = 0;
                // this value is the minimal difference between e.offsetWidth and e.parentElement.clientWidth
                let padmarg = parseFloat(window.getComputedStyle(e, null).getPropertyValue('margin-left')) + 
                    parseFloat(window.getComputedStyle(e.parentElement, null).getPropertyValue('margin-right')) +
                    parseFloat(window.getComputedStyle(e.parentElement, null).getPropertyValue('padding-left')) + 
                    parseFloat(window.getComputedStyle(e.parentElement, null).getPropertyValue('padding-right'));

                // this computation aims to ensure that the final data table will be able to shrink enought to let some space for a scroll bar 
                // while not reducing text beyond what they where before this whole process 

                // this process have a least a flaw : this can occur multiple times per row leading to more free space than what could be required 

                if(oDelta> oWidth - e.offsetWidth && c>27){
                    if(oDelta>=padmarg + DraggableBox.scrollWidth){
                        safe = DraggableBox.scrollWidth;
                    }
                }
                while(oWidth<(e.offsetWidth + padmarg +safe)){
                    c--;
                    e.textContent = text.substr(0,c-4)+" ...";
                }

                if(c==text.length){
                    arr = [""];
                    delete e.onclick;
                }

            }
            arr[0] ="<h3>" + arr[0].trim() + "</h3>";
            // replace only replace the first occurence
            e.title = arr.join("<br>").replace("<br>","").replace("<h3></h3>","");
        });

        $("#"+tableID+" span:not([title=''])").tooltip({ 
            template : '<div class="tooltip" role="tooltip"><div class="tooltip-inner"></div></div>',
            html:true,
            customClass :"ressource-tooltip",
        });

        this.logger.hide();
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
        if(Object.keys(subtables).length == 0){
            return (nRow,data)=>{
                nRow.classList.add("clickable");
                let fun = ()=>{
                    let h = $(".rHighlight",$(nRow).parent());
                    if(h.get(0)==nRow){
                        return;
                    }
                    h.removeClass("rHighlight");
                    $(nRow).addClass("rHighlight");
                };
                $(nRow).click(fun);
            };// no need to check for data in related tables if there is no related tables
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
            nRow.classList.add("clickable");
            let fun = ()=>{

                that.logger.info("Gathering meta data");

                let h = $(".rHighlight",$(nRow).parent());
                if(h.get(0)==nRow){
                    this.logger.hide();
                    return;
                }
                h.removeClass("rHighlight");
                $(nRow).addClass("rHighlight");

                let open = struct.childs.filter(s=>s.div.div.is(":visible"));
                open = open.map(s=> s.div.name);
                open = new Set(open);

                that.removeChilds(struct);
                if($("h5",struct.div.div).length == 0){
                    $(struct.div.div).append("<h5>The following entries tables joined with "+tableName+
                        " click on the table's name to show data related to the selected line</h5>");
                }

                let gKMap = Hmap[data.join("")];
                let joints = that.api.getJoinedTables(tableName).joined_tables;

                that.logger.info("Building tables");
                for(let table in subtables){
                    tableB64 = btoa(table).replace(/\//g,"_").replace(/\+/g,"-").replace(/=/g,"");
                    let nb = Object.keys(that.api.getJoinedTables(table).joined_tables).length;
                    let kMap = {};
                    let nkey;
                    for (let oKey in gKMap){
                        nkey = joints[table].keys.filter(v=>v.from==oKey)[0];
                        if(nkey !== undefined){
                            kMap[nkey.target] = gKMap[oKey];
                        }
                    }
                    let s = {
                        div : {},
                        childs:[],
                        table:table,
                        kMap:kMap
                    };
                    s.div = new CollapsableDiv(struct.div.div,tableB64,true,
                        that.makeTable.bind(that,s,kMap),
                        [
                            {txt:table + (nb>0?" " + nb +"+":""),type:"title",pos:"center"},
                            {pos:"left",txt:object_map.tables[table].description,type:"desc",monoline:true,weight:2},
                            /*{
                                toDom:"<div style='font-size: small;padding-left:0.5em;border-left:0.1em black solid;'><label for='" + tableB64 + 
                                    "_limit'>Queryied entries :</label><select id='" +
                                    tableB64 + "_limit'> <option value='10'>10</option>" +
                                    "<option value='20'>20</option><option value='50'>50</option><option value='100'>100</option>" +
                                    "<option value='0'>unlimited</option> </select></div>",
                                pos:"right"
                            },*/
                            {
                                toDom:"<a id='"+tableB64+"_columns' name='"+tableB64+
                                "' style='padding-left: 25;background: transparent url(./icons/header_23.png) center left no-repeat;' class='bannerbtn' title='select columns to query'></a>",
                                pos:"right"
                            },
                            {
                                toDom:"<a id='"+tableB64+"_dll' style='padding-left: 25;background: transparent url(./icons/download_23.png) center left no-repeat;' title='dowload VO table' class='bannerbtn'></a>",
                                pos:"right"
                            },
                        ],
                        "title",
                        !struct.div.parity,
                    );
                    $("#" +tableB64+"_columns", s.div.header).click(()=>{
                        MetaDataShower(that.api,table);
                    });
                    $("#" +tableB64+"_cone", s.div.header).click(()=>{
                        $(document).trigger("cone_search_update_table.control",{table:table});
                    });
                    $(".collapsable-title",s.div.header)[0].title = "Click here to see <strong>" + table +
                        "</strong>'s data related to the one you selected in <strong>" + tableName + "</strong>";
                    $(".collapsable-title",s.div.header).tooltip({html:true});

                    if(subtables.length == 1){
                        $(".collapsable-title",$("#collapsable-header-" + tableB64,struct.div.div)).click();
                    }else if(open.has(tableB64)){
                        $(".collapsable-title",$("#collapsable-header-" + tableB64,struct.div.div)).click();
                    }

                    struct.childs.push(s);
                }
                that.logger.hide();
            };
            $(nRow).click(fun);
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