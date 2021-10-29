"use strict;";

/*/ Trigers function for radio button /*/

function OnRadioChange(radio) {
    if (!isSuccess("btnApiConnect")){

        if(isDisable("btnApiConnect")){
            enableButton("btnApiConnect");
        }
        let lastLab=$("label.btn-success[name=radioLabel]")[0];
        if(lastLab !== undefined ){
            enableButton(lastLab.id);
        }
        successButton("label_" + radio.value);
    }
}


/*/ Builds the selecting table for tables /*/
function buildTableNameTable(holder,api,qce){
    let map = api.getObjectMap();
    if(map.status){

        /*/ Table building /*/
        let tables = Object.keys(map.object_map.tables);
        tables.unshift(map.object_map.root_table.name);

        let connector = api.getConnector().connector;

        let header = "<table class=\"table table-hover table-bordered table-sm text-center \">";
        let body = "<thead><tr><th scope=\"col\"> Tables of " + connector.service.shortName + "</th></tr></thead><tbody>";
        let footer = "</table>";

        for (let i=0;i<tables.length;i++){
            body += "<tr><td data-table-id=\"tableName\" data-table = \""+ tables[i] +"\">" + tables[i] + "</td></tr>";
        }

        body+="</tbody>";

        holder.html(header+body+footer);

        let dataTreePath = {"nodekey":connector.service.shortName, "schema": connector.service.schema};

        /*/ Binding events of the cells /*/
        $("[data-table-id='tableName']",holder).click((cell)=>{
            let treepath = $.extend({ "table": cell.target.dataset.table, "tableorg": cell.target.dataset.table},dataTreePath);
            
            qce.fireUpdateTreepath(new DataTreePath(treepath));
        });
    }
}

function quoteIfString(str){

    if(isNaN(str) || isNaN(parseInt(str)) || isNaN(+str) ){
        return "'" + str+ "'";
    }

    return  str ;
}

async function buildData(dataTreePath,api,constraint,allColumns){
    let fieldsData;
    if(allColumns){
        fieldsData = await api.getTableFields(dataTreePath.table,constraint);
    }else{
        fieldsData = await api.getTableSelectedField(dataTreePath.table,constraint);
    }
    
    let fields = fieldsData.field_names;

    if(fieldsData.status){

        let data = {"aaData":fieldsData.field_values,"aoColumns":[]};
        let ah = MetadataSource.getTableAtt(dataTreePath).hamap;
        let ahmap = {};

        for (let i=0;i<ah.length;i++){
            ahmap[ah[i].nameattr] = ah[i];
        }
        for (let i=0;i<fields.length;i++){
            data.aoColumns.push({"sTitle":fields[i]});
        }
        // we only normalize the root table
        if (dataTreePath.table == api.getConnector().connector.service.table && api.getActiveJoints(dataTreePath.table).joints.length>0){
            normalize(data,api,dataTreePath.table);
        }

        return {"data":data,"ahmap":ahmap,"status":true};
    }
    return {"status":false};
}

function normalize(data,api,table){
    let keys = api.getJoinKeys(table);
    if(keys.length>0){
        let indexs=[];
        let keySet = new Set();
        for (let i=0;i<data.aoColumns.length;i++){
            if(keys.includes( data.aoColumns[i].sTitle)){
                indexs.push(i);
            }
        }

        let compKey;
        let j;
        let normData = [];
        for (let i = 0;i<data.aaData.length;i++){
            compKey = "";
            for(j=0;j<indexs.length;j++){
                compKey += data.aaData[i][j];
            }
            if(!keySet.has(compKey)){
                keySet.add(compKey);
                normData.push(data.aaData[i]);
            }
        }
        data.lost = data.aaData.length-normData.length;
        data.aaData = normData;
    }else{
        data.lost = 0;
    }
}

function makeCollapsableDiv(holder,name,collapsed,firstClickHandler,elems,expendOn,parity){
    let holderid = "collapsable-holder-" + name;
    if(parity === undefined){
        parity =0;
    }
    if($("#" + holderid,holder).length>0){
        $("#" + holderid,holder).html("");
    }else{
        holder.append("<div class='collapsable-holder "+ (parity%2==0?"even":"odd") + "' id = '" + holderid + "' ></div>");
    }
    holder = $("#" + holderid,holder);

    let header = "<div class='collapsable-header' id = 'collapsable-header-" + name + "'>";
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
    holder.append(header);
    header = $("#collapsable-header-" + name,holder);

    let getNBLines = function(e,h){
        return Math.round(e.clientHeight/h);
    };
    $("p.monoline",header).each((i,e)=>{
        let h = 1.5*parseFloat(getComputedStyle(e).fontSize);
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
        }
    });

    holder.append("<div class='collapsable-div' id = 'collapsable-div-" + name + "' ></div>");
    
    let div = $("#collapsable-div-" + name );
    if(collapsed){
        div.hide();
    }

    div.data("clicked",false);
    let handler = ()=>{
        if(!div.data("clicked")){
            div.data("clicked",true);
            if(firstClickHandler!==undefined){
                firstClickHandler(div);
            }
        }
        div.toggle();
    };

    if(expendOn !== undefined){
        let elem =  $(".collapsable-"+expendOn,header);
        if(elem.length>0){
            elem.click(handler);
        }else{
            header.click(handler);
        }
    }else{
        header.click(handler);
    }

    return div;
}

// stolen code from tap handle

function showTapResult(dataTreePath, data,tid,handler) {
    var job = ( !dataTreePath.jobid || dataTreePath.jobid == "")? "": dataTreePath.jobid;
    let tableID = "datatable_" + replaceAll(`${job}`/* create a new instance of the string to avoid possible troubles */," ","_");
    var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"1\" width= 100% id=\"" + tableID + "\" class=\"display\"></table>";
    let jsdata = data.data;
    
    if(jsdata.lost>0){
        tid.append("<p>duplacted data has been removed " + jsdata.lost + " duplicated entrie(s) were removed</p>");
    }

    tid.append(table);
    let attributeHandlers = data.ahmap;
    var aoColumns = [];
    var columnMap = {access_format: -1, s_ra: -1, s_dec: -1, s_fov: -1, currentColumn: -1};
    var isloadAlix=false;
    for(var i=0 ; i<jsdata.aoColumns.length ; i++) {
        var title ;
        if( attributeHandlers == undefined ) {
            title = "No descritption available" +
                " - This job has likely been initiated in a previous session" ;
        } else {
            var ah = attributeHandlers[jsdata.aoColumns[i].sTitle];/*
            /*
             * Column name could be published in upper case but returned by the DBMS in lower case.
             */
            if(ah == undefined  ) {
                ah = attributeHandlers[jsdata.aoColumns[i].sTitle.toLowerCase()];
            }
            if(ah == undefined  ) {
                ah = attributeHandlers[jsdata.aoColumns[i].sTitle.toUpperCase()];
            }
            if( ah == undefined ) {
                title = "No description available (joined query?)";
            } else {
                /*
                 * Title must be filtered to be understood by the tooltip plugin
                 */
                title = ah.description.replace(/&[a-z]+;/g, '').replace(/[<>]/g, ' ').replace(/"/g, '') +
                " - Name: " + ah.nameorg +
                " - Unit: " + ah.unit +
                " - UCD: " + ah.ucd +
                " - UType: " + ah.utype +
                " - DataType: " + ah.dataType;
                
                if( ah.nameorg == "access_format" || ah.ucd == "meta.code.mime" ) {
                    columnMap.access_format = i;
                } else if( ah.nameorg == "s_ra" || ah.ucd == "pos.eq.ra;meta.main" || ah.ucd == "pos.eq.ra" || ah.ucd == "POS_EQ_RA_MAIN") {
                    columnMap.s_ra = i ; 
                } else if( ah.nameorg == "s_dec" || ah.ucd == "pos.eq.dec;meta.main" || ah.ucd == "pos.eq.dec" ||ah.ucd == "POS_EQ_DEC_MAIN") {
                    columnMap.s_dec = i;
                }else if( ah.nameorg == "s_fov" || ah.nameorg.match(/.*instr\.fov/) ) {
                    columnMap.s_fov = i;
                } else if( ah.nameorg == "target_name"  ) {
                    columnMap.target_name = i;
                    
                }
            }
        }
    
        aoColumns[i] = {sTitle: '<span title="' + title + '">' + jsdata.aoColumns[i].sTitle + '</span>'};
    }
    
    var dec=0;
    var ra =0;
    var schema = dataTreePath.schema;
    var getCurrentName = function (){
        var tableBase=  dataTreePath.schema+"."+dataTreePath.table;
        return tableBase;
    };

    var options = {
        "aLengthMenu": [5, 10, 25, 50, 100],
        "aoColumns" : aoColumns,
        "aaData" : jsdata.aaData,
        "pagingType" : "simple",
        "aaSorting" : [],
        "bSort" : false,
        "bFilter" : true,
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
            ValueFormator.reset();
            for( var c=0 ; c<aData.length ; c++ ) {
                var copiedcolumnMap = jQuery.extend(true, {}, columnMap);
                var colName = $(this.fnSettings().aoColumns[c].sTitle).text();
                /*
                 * Makes sure the mime type is for the current column 
                 */
                if( colName != "access_url" ) {
                    copiedcolumnMap.access_format = -1;
                }
                copiedcolumnMap.currentColumn = c;

                ValueFormator.formatValue(colName, aData, $('td:eq(' + c + ')', nRow), copiedcolumnMap,dataTreePath);
                    
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
            if(handler){
                handler( nRow, aData, iDisplayIndex);
            }
            return nRow;
        }
            
    };
    // function to return node information 
    var myNodeInfo = function(f){
        var dataInfos = dataTreeView.getNodeInfos( f );
        return dataInfos;
    };
    
            
    
    var positions = [
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
    
    $("#"+tableID+"_wrapper").css("overflow", "hidden");
}

/**This function create and return another function 
 * this other function setup event listener for a selected row of a data table 
 * the event handler create a collapsable div for each table joints to the table which the row contains related data 
 * the collapsable div when first expanded querry data for the correct table and use the main function 
 * to create a function which will bind the event as described above
 * this is a two layer recusive event binding function 
 * what could go wrong ?
 */
let rowEventFactory = function(joints,data,holder,dataTreePath,api,parity){
    if(parity === undefined){
        parity =1;
    }
    let object_map = api.getObjectMap().object_map;
    return function(nRow, aData){
        $(nRow).click(() => {
            let h = $(".rHighlight",$(nRow).parent());
            if(h.get(0)==nRow){
                return;
            }
            h.removeClass("rHighlight");
            $(nRow).addClass("rHighlight");
            let oJoints;

            let open =[];
            $(".collapsable-div:visible",holder).each((i,e)=>{
                open.push($(e).attr('id'));
            });
            for (let joint in joints){
                let fClick = async function(div,allColumns){ // var declaration in loop on purpose
                    await syncIt(async ()=>{
                        let treePath = $.extend({},dataTreePath);
                        let lJoints = api.getJoinedTables(joint).joined_tables;
                        let elems = {};
                        for (let i =0;i<joints[joint].keys.length;i++){
                            elems[joints[joint].keys[i].target] = data.data.aoColumns.filter(elem => elem.sTitle === joints[joint].keys[i].from)[0];
                        }

                        for (let join in elems){
                            elems[join] = quoteIfString(aData[data.data.aoColumns.indexOf(elems[join])]);
                        }

                        treePath.table = joint;
                        treePath.tableorg = joint;
                        treePath.jobid = joint;
                        // remember to always hijack the cache before risquing using it.
                        await MetadataSource.hijackCache(treePath,api);
                        let lData = await buildData(treePath,api,elems,allColumns);
                        if(lData.status){
                            showTapResult(treePath,lData,div,rowEventFactory(lJoints,lData,div,dataTreePath,api,parity+1));
                        }else {
                            div.append("An unexpected error has append, unable to gather data. see logs for more information");
                        }
                        
                    });
                };
                oJoints = api.getJoinedTables(joint).joined_tables;
                makeCollapsableDiv(holder,joint,true,fClick, 
                    [
                        {pos:"center",txt:joint + " " + (Object.keys(oJoints).length>0 ?  Object.keys(oJoints).length + "+":""),type:"title"},
                        object_map.tables[joint] !== undefined ? {pos:"left",txt:object_map.tables[joint].description,type:"desc",weight:2,monoline:true}:{},
                        {
                            toDom:"<div><input type='checkbox' id='"+joint+"_constraint' name='"+joint+
                                "' style='margin:.4em' checked><label for='"+joint+"'>Constraints</label></div>",
                            pos:"right"
                        },
                        {
                            toDom:"<div style='font-size: small; padding-left:0.5em;border-left:0.1em black solid;'><label for='" + joint + 
                                "_limit'>Queryied entries :</label><select id='" +
                                joint + "_limit'> <option value='10'>10</option>" +
                                "<option value='20'>20</option><option value='50'>50</option><option value='100'>100</option>" +
                                "<option value='0'>unlimited</option> </select></div>",
                            pos:"right"
                        },
                        {
                            toDom:"<div style='padding-left:0.5em;border-left:0.1em black solid;'><input type='checkbox' id='" + joint + "_fullTables'" +
                                " style='margin:.4em' checked><label for='" + joint + "_fullTables'>Selected tables only</label></div>",
                            pos:"right"
                        }
                    ],
                    "title",
                    parity
                );
                let check = $("#" + joint+"_constraint",holder);
                let select = $("#" + joint+"_limit",holder);
                let allColumns = $("#" + joint+"_fullTables",holder);

                let div = $("#collapsable-div-" + joint);
                
                let handler = ()=>{
                    syncIt(async ()=>{
                        let val=$("option:selected",select).val();
                        api.setLimit(val);

                        let constraint = {};
                        if(!check.is(":checked")){
                            constraint = api.getAllTablesConstraints().constraints;
                            api.resetAllTableConstraint();
                        }

                        div.html('');
                        div.data("clicked",true);
                        await fClick(div,!allColumns.is(":checked"));
                        for (let table in constraint){
                            api.setTableConstraint(table,constraint[table]);
                        }
                        api.setLimit(10);
                    });
                };

                check.click(handler);
                
                allColumns.click(handler);

                select.on('change',handler);

                // re-opening previously opened div(s)
                if (open.includes("collapsable-div-" + joint)){
                    $("#collapsable-header-" + joint + " .collapsable-title" ,holder).click();
                }
            }
            // auto opening the div(s) when there is less than a defined number of possible divs to open
            if (Object.keys(joints).length<2){
                for (let joint in joints){
                    //avoid openning two times the div 
                    if(!open.includes("collapsable-div-" + joint)){
                        $("#collapsable-header-" + joint + " .collapsable-title" ,holder).click();
                    }
                }
            }
        });
    };
};

function setupEventHandlers(){

    let api = new TapApi();

    bindClickAsyncEvent("btnApiConnect",async () => {
        
        if (isEnable("btnApiConnect")) {
            let params = KnowledgeTank.getDescriptors().descriptors[$("input:radio[name=radio]:checked")[0].value];
            params.shortName = $("input:radio[name=radio]:checked")[0].value;
            
            let connect = api.connect(params);
            let status = false;
            connect.catch((reason)=>console.error(reason));

            let thenFun = async ()=> {};

            connect.then( (value) => {
                status = value.status;
                display(value,"codeOutput");
                thenFun = async () =>{

                    if (status){
                        let object_map = api.getObjectMap();
                        if(object_map.status){
                            object_map=object_map.object_map;
                        }else{
                            object_map.tables = {};
                        }
                        let tables = [params.table];
                        tables = tables.concat(Object.keys(object_map.tables));
                        let t =await api.getTablesAttributeHandlers(tables);
                        if(!t.status){
                            console.log(t.error.logs);
                        }

                        let treepath = {"nodekey":params.shortName, "schema": params.schema};
                        for (let i =0;i<tables.length;i++){
                            // remember to always hijack the cache before risquing using it.
                            await MetadataSource.hijackCache($.extend({ "table": tables[i], "tableorg": tables[i]},treepath),api);
                        }
                        

                        /*/ disable all radio buttons so the user can't change their value /*/
                        $("input:radio[name=radio]").attr("disabled",true);
                        $("label[name=radioLabel]").each((i,btn)=>{
                            disableButton(btn.id);
                        });

                        let adqlQueryView = QueryConstraintEditor.adqlTextEditor({ parentDivId: 'adql_query_div', defaultQuery: ''});
                        let editor = new ComplexQueryEditor(api, $("#query"));

                        let qce = QueryConstraintEditor.complexColumnSelector({parentDivId:'tapColSelector',
                            formName: 'tapFormColSelector',
                            queryView: adqlQueryView,
                            complexEditor: editor
                        });

                        let constraintEditor = QueryConstraintEditor.complexConstraintEditor({parentDivId:'tapColEditor',
                            formName: 'tapFormColName',
                            sesameUrl:"sesame",
                            upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}} ,
                            queryView: adqlQueryView,
                            complexEditor: editor,
                            tables:tables,
                            colSelector:qce,
                        });

                        
                        $("#rButtonPane").append('<button class="btn btn-primary" style="margin-top: 0.5em;width:100%" id="queryRun">Run Query</button>');
                        
                        bindClickAsyncEvent("queryRun",async ()=>{
                            let dataTreePath = $.extend({}, constraintEditor.dataTreePath);
                            dataTreePath.table = params.table;
                            dataTreePath.tableorg = params.table;
                            let data = await buildData(dataTreePath,api);
                            
                            let joints = api.getJoinedTables(params.table).joined_tables;
                            // adding job id before using fireSetTreepath make the editor not showing the columns
                            dataTreePath.jobid="what a job";

                            $("#resultpane").html('');
                            let div = makeCollapsableDiv($("#resultpane"),params.table,false,undefined,
                                [
                                    {txt:params.table,type:"title",pos:"center"},
                                    {pos:"left",txt:object_map.root_table.description,type:"desc",weight:2,monoline:true},
                                    {
                                        toDom:"<div style='font-size: small;'><label for='" + params.table + 
                                            "_limit'>Queryied entries :</label><select id='" +
                                            params.table + "_limit'> <option value='10'>10</option>" +
                                            "<option value='20'>20</option><option value='50'>50</option><option value='100'>100</option>" +
                                            "<option value='0'>unlimited</option> </select></div>",
                                        pos:"right"
                                    },
                                    {
                                        toDom:"<div style='padding-left:0.5em;border-left:0.1em black solid;'><input type='checkbox' id='" + params.table + "_fullTables'" +
                                            " style='margin:.4em' checked><label for='" + params.table + "_fullTables'>Selected tables only</label></div>",
                                        pos:"right"
                                    }
                                ],
                                "title"
                            );

                            if(data.status){
                                let select = $("#" + params.table + "_limit",$("#resultpane"));
                                let allColumns = $("#" + params.table + "_fullTables",$("#resultpane"));

                                let handler = ()=>{
                                    syncIt(async ()=>{
                                        let val=$("option:selected",select).val();
                                        api.setLimit(val);
                                        div.html('');
                                        div.data("clicked",true);
                                        
                                        let data = await buildData(dataTreePath,api,undefined,!allColumns.is(":checked"));
                                        if(data.status){
                                            showTapResult(dataTreePath,data,div,rowEventFactory(joints,data,div,dataTreePath,api));
                                        } else{
                                            div.append("An unexpected error has append, unable to gather data. see logs for more information");
                                        }
                                        api.setLimit(10);
                                    });
                                    
                                };

                                select.on('change',handler);

                                allColumns.click( handler);

                                showTapResult(dataTreePath,data,div,rowEventFactory(joints,data,div,dataTreePath,api));
                            } else {
                                div.append("An unexpected error has append, unable to gather data. see logs for more information");
                            }
                        });
                        $("#rButtonPane").append('<div style="height:11.8em" id="rPaneSpacer"></div>');
                        $("#rButtonPane").append('<button class="btn btn-primary" style="margin-top: 0.5em;margin-bottom: 0.5em; width:100%" id="harold">Toggle control pane</button>');
                        $("#harold").click(()=>{
                            $("#controlPane").toggle();
                            $("#rPaneSpacer").toggle();
                        });

                        //buildTableNameTable($("#tableNameTable"),api,constraintEditor);
                        let dt = {"nodekey":params.shortName, "schema": params.schema, "table": params.table, "tableorg": params.table};
                        await MetadataSource.hijackCache(dt,api);

                        constraintEditor.fireSetTreepath(new DataTreePath(dt));
                        qce.fireSetTreepath(new DataTreePath(dt));

                        let fields = await api.getSelectedFields(params.table);
                        fields=fields.fields;
                        let keys = api.getJoinKeys(params.table).keys;
                        let ah = (await api.getTableAttributeHandlers(params.table)).attribute_handlers;
                        
                        qce.hardSelect(ah.filter(val=>keys.includes(val.nameattr)));
                        qce.select(ah.filter(val=>fields.includes(val.nameattr)));

                        constraintEditor.model.updateQuery();
                        $("#queryRun").click();

                        $("#multiTabDiv").tabs();
                        $("#multiTabDiv").toggle();

                        enableButton("btnApiDisconnect");

                    } else{
                        alert("Connection error please reload the page and try again.\n if the error persist check the logs and either try later or report the bug");
                    }
                };
            });

            await connect;

            await thenFun();

            return status;

        } else {
            display("The service is  already connected ! disconnect the service and try again ...", "getStatus");
        }

    },"no service selected... Choose service first and try again" );

    bindClickEvent("btnApiDisconnect",() => {
        api.disconnect();

        enableButton("btnApiConnect");

        $("input:radio[name=radio]").attr("disabled",false);
        $("label[name=radioLabel]").each((i,btn)=>{
            enableButton(btn.id);
        });

        return false;

    });

    bindClickEvent("btnDebug",() => {
        if (document.getElementById("debugContainer").style.display == "block"){
            document.getElementById("debugContainer").style.display = "none";
        }else {
            document.getElementById("debugContainer").style.display = "block";
        }
    });
}


$(document).ready(function() {
    syncIt(async ()=>{
        resourceLoader.setCss([]);
        resourceLoader.setScripts([]);
        await resourceLoader.loadAll().then((result) => {
            // applying IIFE overrides right after jsResources ended his loading
            overrides();
            extend();
        });
        buildButtonSelector("#mainButtonHolder");
        // ensure no radio button is check by default
        $("input:radio[name=radio]:checked").prop('checked', false);
        setupEventHandlers();
    });
});