
let tree; // temporary export

async function OnRadioChange(radio){
    if(isEnable("label_" + radio.value)){
        disableButton("label_" + radio.value);
        let api = new jw.Api();
        let params = jw.KnowledgeTank.getDescriptors().descriptors[radio.value];
        let connect = await api.connectService(params.tapService,radio.value);
        if(connect.status){
            tree.append(api,params);

            successButton("label_" + radio.value);
            return;
        }
        console.error(connect);
        errorButton("label_" + radio.value);
    }
}

function setupApp(){

    tree = new TapTreeList($("#tree"));

    let tablePane = new TablePane($("#tablePane"));

    $(document).on("new_root_table.tree",(event, args)=>{
        tablePane.setApi(args.api);
    });
    $(document).on("error.application",(...args)=>{
        console.log("error event recieved");
        console.log(args);
    });
}

$(document).ready(()=>{
    buildButtonSelector("#mainButtonHolder");
    // ensure no radio button is check by default
    $("input:radio[name=radio]:checked").prop('checked', false);
    setupApp();
});