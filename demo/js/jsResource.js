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

/*/ Builds buttons to select between all known TAP services /*/
function buildButtonSelctor(){
    let desc = (new KnowledgeTank()).getDescriptors().descriptors;
    for (let shortName in desc){
        $("#mainButtonHolder").append("<input style=\"display: none;\" type=\"radio\" name=\"radio\" id=\"radio_"+ shortName +
            "\" value=\"" + shortName + 
            "\" onclick=\"OnRadioChange(this)\" />");

        $("#mainButtonHolder").append("<label style=\"margin: 0.5em;width: 100%;\" for=\"radio_"+ shortName +
            "\" class=\"btn btn-primary\" id=\"label_"+ shortName +
            "\" name=\"radioLabel\">"+ shortName +
            "</label>");
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
            });
        });
    }
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
                        
                        // applying all the needed override of jsResource before using it
                        override();

                        let adqlQueryView = QueryConstraintEditor.queryTextEditor({ parentDivId: 'adql_query_div', defaultQuery: ''});

                        qce = QueryConstraintEditor.nativeConstraintEditor({parentDivId:'tapColEditor',
                                formName: 'tapFormColName',
                                queryView: adqlQueryView});

                        await buildTableNameTable(api,params.shortName,qce);

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
    buildButtonSelctor();
    // ensure no radio button is check by default
    $("input:radio[name=radio]:checked").prop('checked', false);
    setupEventHandlers();
});