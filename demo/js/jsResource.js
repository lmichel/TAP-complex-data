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
async function buildTableNameTable(holder,api,qce){
    let map = await api.getObjectMap();
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
            syncIt(async ()=>{
                let treepath = $.extend({ "table": cell.target.dataset.table, "tableorg": cell.target.dataset.table},dataTreePath);
                
                // remember to always hijack the cache before risquing using it.
                let hijack = await MetadataSource.hijackCache(treepath,api);
                if(hijack){
                    qce.fireUpdateTreepath(new DataTreePath(treepath));
                }
            });
        });
    }
}

function quoteIfString(str){

    if(isNaN(str) || isNaN(parseInt(str)) || isNaN(+str) ){
        return "'" + str+ "'";
    }

    return  str ;
}

async function buildData(dataTreePath,api,constraint){
    let fieldsData = await api.getTableSelectedField(dataTreePath.table,constraint);
    let fields = await api.getSelectedFields(dataTreePath.table);

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
        if (dataTreePath.table == api.getConnector().connector.service.table){
            normalize(data,api,dataTreePath.table);
        }

        return {"data":data,"ahmap":ahmap,"status":true};
    }
    return {"status":false};
}

function normalize(data,api,table){
    let keys = api.getJoinKeys(table);
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
    
}

function makeCollapsableDiv(holder,name,title,collapsed,firstClickHandler,leftTitle){
    let holderid = "collapsable-holder-" + name;
    if($("#" + holderid,holder).length>0){
        $("#" + holderid,holder).html("");
    }else{
        holder.append("<div class='collapsable-holder' id = '" + holderid + "' ></div>");
    }
    holder = $("#" + holderid,holder);

    let header = "<div class='collapsable-header' id = 'collapsable-header-" + name + "'> <p class='collapsable-title'>" + title + "</p>";
    if(leftTitle !== undefined){
        header += "<p class = 'txt-right' >" + leftTitle + "</p>";
    }
    header += "</div>";
    holder.append(header);
    holder.append("<div class='collapsable-div' id = 'collapsable-div-" + name + "' ></div>");
    let div = $("#collapsable-div-" + name );
    if(collapsed){
        div.hide();
    }
    div.data("clicked",false);
    $("#collapsable-header-" + name).click(()=>{
        if(!div.data("clicked")){
            div.data("clicked",true);
            if(firstClickHandler!==undefined){
                firstClickHandler(div);
            }
        }
        div.toggle();
    });
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

                /*
                 * Not formatting for the relational registry
                 */
                if( schema != "rr")
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

function setupEventHandlers(){

    let api = new TapApi();

    bindClickAsyncEvent("btnApiConnect",async () => {
        
        if (isEnable("btnApiConnect")) {
            let KT = new KnowledgeTank();
            let params = KT.getDescriptors().descriptors[$("input:radio[name=radio]:checked")[0].value];
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

                        /*/ disable all radio buttons so the user can't change their value /*/
                        $("input:radio[name=radio]").attr("disabled",true);
                        $("label[name=radioLabel]").each((i,btn)=>{
                            disableButton(btn.id);
                        });

                        let adqlQueryView = QueryConstraintEditor.adqlTextEditor({ parentDivId: 'adql_query_div', defaultQuery: ''});
                        let editor = new ComplexQueryEditor(api, $("#query"));

                        let constraintEditor = QueryConstraintEditor.complexConstraintEditor({parentDivId:'tapColEditor',
                                formName: 'tapFormColName',
                                sesameUrl:"sesame",
                                upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}} ,
                                queryView: adqlQueryView,
                                complexEditor: editor});

                        let qce = QueryConstraintEditor.complexColumnSelector({parentDivId:'tapColSelector',
                                formName: 'tapFormColSelector',
                                queryView: adqlQueryView,
                                complexEditor: editor});

                        $("#controlPane").append('<div><button class="btn btn-primary" style="margin-top: 0.5em;" id="queryRun">Run Query</button></div>');
                        
                        bindClickAsyncEvent("queryRun",async ()=>{
                            constraintEditor.model.updateQuery();
                            let dataTreePath = $.extend({}, constraintEditor.dataTreePath);
                            dataTreePath.table = params.table;
                            dataTreePath.tableorg = params.table;
                            let data = await buildData(dataTreePath,api);
                            
                            let joints = api.getJoinedTables(params.table).joined_tables;
                            // adding job id before using fireSetTreepath make the editor not showing the columns
                            dataTreePath.jobid="what a job";
                            if(data.status){

                                /**This function create and return another function 
                                 * this other function setup event listener for a selected row of a data table 
                                 * the event handler create a collapsable div for each table joints to the table which the row contains related data 
                                 * the collapsable div when first expanded querry data for the correct table and use the main function 
                                 * to create a function which will bind the event as described above
                                 * this is a two layer recusive event binding function 
                                 * what could go wrong ?
                                 */
                                let rowEventFactory = function(joints,data,holder){
                                    return function(nRow, aData){
                                        $(nRow).click(() => {
                                            let h = $(".rHighlight",$(nRow).parent());
                                            if(h.get(0)==nRow){
                                                return;
                                            }
                                            h.removeClass("rHighlight");
                                            $(nRow).addClass("rHighlight");
                                            let index;
                                            let treePath = $.extend({},dataTreePath);
                                            let lData;
                                            let fClick;
                                            let lJoints;
                                            let elem;
                                            let oJoints;

                                            for (let joint in joints){
                                                fClick = function(div){
                                                    syncIt(async ()=>{
                                                        api.resetAllTableConstraint();
                                                        lJoints = api.getJoinedTables(joint).joined_tables;
                                                        elem = data.data.aoColumns.filter(elem => elem.sTitle === joints[joint].target);
                                                        index = data.data.aoColumns.indexOf(elem[0]);
                                                        treePath.table = joint;
                                                        treePath.tableorg = joint;
                                                        treePath.jobid = joint;
                                                        // remember to always hijack the cache before risquing using it.
                                                        await MetadataSource.hijackCache(treePath,api);
                                                        lData = await buildData(treePath,api,quoteIfString(aData[index]));
                                                        if(lData.status){
                                                            showTapResult(treePath,lData,div,rowEventFactory(lJoints,lData,div));
                                                        }else {
                                                            div.append("An unexpected error has append, unable to gather data. see logs for more information");
                                                        }
                                                        
                                                    });
                                                };
                                                oJoints = api.getJoinedTables(joint).joined_tables;
                                                makeCollapsableDiv(holder,joint,joint,true,fClick, Object.keys(oJoints).length>0 ?  Object.keys(oJoints).length + "+":"");
                                                
                                            }
                                        });
                                    };
                                };
                                
                                $("#resultpane").html('');
                                let div = makeCollapsableDiv($("#resultpane"),params.table,params.table,false);
                                showTapResult(dataTreePath,data,div,rowEventFactory(joints,data,div));
                            }
                        });

                        await buildTableNameTable($("#tableNameTable"),api,constraintEditor);
                        let dt = {"nodekey":params.shortName, "schema": params.schema, "table": params.table, "tableorg": params.table};
                        await MetadataSource.hijackCache(dt,api);

                        constraintEditor.fireSetTreepath(new DataTreePath(dt));
                        qce.fireSetTreepath(new DataTreePath(dt));

                        let fields = await api.getSelectedFields(params.table);
                        let keys = api.getJoinKeys(params.table);
                        let ah = (await api.getTableAttributeHandlers(params.table)).attribute_handlers;
                        
                        qce.hardSelect(ah.filter(val=>keys.includes(val.nameattr)));
                        qce.select(ah.filter(val=>fields.includes(val.nameattr)));

                        constraintEditor.model.updateQuery();
                        $("#queryRun").click();

                        $("#multiTabDiv").tabs();
                        $("#multiTabDiv").toggle();

                        enableButton("btnApiDisconnect");

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
    buildButtonSelector("#mainButtonHolder");
    // ensure no radio button is check by default
    $("input:radio[name=radio]:checked").prop('checked', false);
    setupEventHandlers();
});