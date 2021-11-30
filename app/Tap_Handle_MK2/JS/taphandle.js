
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

function setupApp(logger){

    tree = new TapTreeList($("#tree"));

    let control = new ControlPane();
    let tablePane = new TablePane($("#tablePane"),logger);

    $(document).on("new_root_table.tree",(event, args)=>{
        tablePane.setApi(args.api);
        control.setApi(args.api);
    });
    $(document).on("error.application",(...args)=>{
        console.log("error event recieved");
        console.log(args);
    });
}

$(document).ready(()=>{
    let logger = new GlobalLogger();
    logger.info("Setting up everything");

    buildButtonSelector("#mainButtonHolder");
    // ensure no radio button is check by default
    $("input:radio[name=radio]:checked").prop('checked', false);
    setupApp(logger);
    logger.hide();
});