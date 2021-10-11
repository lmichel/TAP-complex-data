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
async function buildTableNameTable(api,shortName,qce){
    let map = await api.getObjectMap();
    if(map.status){

        /*/ Table building /*/
        let tables = Object.keys(map.object_map.tables);
        tables.unshift(map.object_map.root_table.name);

        let header = "<table class=\"table table-hover table-bordered table-sm text-center \">";
        let body = "<thead><tr><th scope=\"col\"> Tables of " + shortName + "</th></tr></thead><tbody>";
        let footer = "</table>";

        for (let i=0;i<tables.length;i++){
            body += "<tr><td data-table-id=\"tableName\" data-table = \""+ tables[i] +"\">" + tables[i] + "</td></tr>";
        }

        body+="</tbody>";

        $("#tableNameTable").html(header+body+footer);

        /*/ Binding events of the cells /*/
        $("[data-table-id='tableName']").click((cell)=>{
            syncIt(async ()=>{
                //we gather the selected service
                let KT = new KnowledgeTank();
                let params = $.extend(true,{}, KT.getDescriptors().descriptors[$("input:radio[name=radio]:checked")[0].value] );
                params.shortName = $("input:radio[name=radio]:checked")[0].value;
                // override the root table using the table selected by the user
                params.table = cell.target.dataset.table;

                let dataTreePath = {"nodekey":params.shortName, "schema": params.schema, "table": params.table, "tableorg": params.table};

                // remember to always hijack the cache before risquing using it.
                let hijack = await MetadataSource.hijackCache(dataTreePath,api);
                if(hijack){
                    qce.fireSetTreepath(new DataTreePath(dataTreePath));
                }
                let data = await buildData(params.table,dataTreePath,api);
                
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
                            
                                let index;
                                let treePath = $.extend({},dataTreePath);
                                let lData;
                                let fClick;
                                let lJoints;
                                let elem;

                                for (let joint in joints){
                                    fClick = function(div){
                                        syncIt(async ()=>{
                                            lJoints = api.getJoinedTables(joint).joined_tables;
                                            elem = data.data.aoColumns.filter(elem => elem.sTitle === joints[joint].target); //TODO add condition
                                            index = data.data.aoColumns.indexOf(elem[0]);
                                            treePath.table = joint;
                                            treePath.tableorg = joint;
                                            treePath.jobid = joint;
                                            lData = await buildData(joint,treePath,api,aData[index]);
                                            showTapResult(treePath,lData.data,lData.ahmap,div,rowEventFactory(lJoints,lData,div));
                                        });
                                    };
                                    makeCollapsableDiv(holder,joint,joint,true,fClick);
                                    
                                }
                            });
                        };
                    };
                    
                    $("#resultpane").html('');
                    let div = makeCollapsableDiv($("#resultpane"),params.table,params.table,false);
                    showTapResult(dataTreePath,data.data,data.ahmap,div,rowEventFactory(joints,data,div));
                }
            });
        });
    }
}

async function buildData(table,dataTreePath,api,constraint){
    let fieldsData = await api.getTableSelectedField(table,constraint);
    let fields = await api.getAllSelectedFields(table);
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
        return {"data":data,"ahmap":ahmap,"status":true};
    }
    return {"status":false};
}

function makeCollapsableDiv(holder,name,title,collapsed,firstClickHandler){
    let holderid = "collapsable-holder-" + name;
    if($("#" + holderid,holder).length>0){
        $("#" + holderid,holder).html("");
    }else{
        holder.append("<div class='collapsable-holder' id = '" + holderid + "' ></div>");
    }
    holder = $("#" + holderid,holder)[0];

    $("#" + holderid).append("<div class='collapsable-header' id = 'collapsable-header-" + name + "'> <p id='collapsable-title'>" + title + "</p> </div>");
    $("#" + holderid).append("<div class='collapsable-div' id = 'collapsable-div-" + name + "' ></div>");
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

showTapResult = function(dataTreePath, jsdata, attributeHandlers,tid,handler) {
    var job = ( !dataTreePath.jobid || dataTreePath.jobid == "")? "": dataTreePath.jobid;
    let tableID = "datatable_" + replaceAll(`${job}`," ","_");
    var table = "<table cellpadding=\"0\" cellspacing=\"0\" border=\"1\" width= 100% id=\"" + tableID + "\" class=\"display\"></table>";
    
    tid.prepend('<p id="title-table" class="pagetitlepath"></p>');
    if (dataTreePath.schema != undefined && dataTreePath.table != undefined) {
        $("#title-table").html('&nbsp;' + dataTreePath.nodekey + '&gt;' + dataTreePath.schema + '&gt;'+ dataTreePath.table + '&gt;'+ job);
    }
    
    tid.append(table);
    
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
        { "name": "pagination",
            "pos": "bottom-left"
        },
        { "name": "length",
            "pos": "top-left"
        },
        { "name": 'filter',
            "pos" : "top-right"
        },
        { "name": "information",
            "pos" : "top-center"
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
    
    // Shows query panel
    if (!$("#queryformpane").is(":visible")) {
        $("#toggle-query").trigger( "click" );
        $("#queryformpane").show();	
        $("#toggle-query").show();
    }
};

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
                        let editor = new ComplexQueryEditor(api, $("#controlPane"));

                        qce = QueryConstraintEditor.complexConstraintEditor({parentDivId:'tapColEditor',
                                formName: 'tapFormColName',
                                sesameUrl:"sesame",
                                upload: {url: "uploadposlist", postHandler: function(retour){alert("postHandler " + retour);}} ,
                                queryView: adqlQueryView,
                                complexEditor: editor});

                        await buildTableNameTable(api,params.shortName,qce);

                        $("#controlPane").append('<div><button class="btn btn-primary" style="margin-top: 0.5em;" id="queryRun">Run Query</button></div>');
                        

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