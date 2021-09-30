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

                        let data = await api.getTableAttributeHandlers(params.table);
                        if(data.status){
                            override();
                            data = {"attributes":data.attribute_handlers};
                            let cache = {};
                            let dataTreePath = {nodekey:'node', schema: 'schema', table: 'table', tableorg: 'table'};
                            cache.ahmap = MetadataSource.buildAttMap(cache);
                            cache.dataTreePath = dataTreePath;
                            cache.dataTreePath.key = dataTreePath.nodekey + dataTreePath.schema + dataTreePath.tableorg;
                            MetadataSource.vars.cache[cache.dataTreePath.key] = cache;

                            let adqlQueryView = QueryConstraintEditor.adqlTextEditor({ parentDivId: 'adql_query_div', defaultQuery: ''});

                            qce = QueryConstraintEditor.tapColumnSelector({parentDivId:'tapColEditor',
                                    formName: 'tapFormColName',
                                    queryView: adqlQueryView});
                            display(MetadataSource.getTableAtt({"key":"node.schema.table"}),"codeOutput");
                            qce.fireSetTreepath(new DataTreePath(dataTreePath));
                        }


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