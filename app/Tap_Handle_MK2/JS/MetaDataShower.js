var MetaDataShower = async function(api,table,select=true,schema = undefined){
    function buildHeader(api,table){
        let conn = api.getConnector().connector.service;
        return '<div class="modal-header"><div><h5 class="modal-title">' + conn.shortName + ': Columns of ' + conn.schema + '.' + table +'</h5>'+
        '<h6> User\'s selected fields are not kept when changing schema<br>Field selection is only available for tables of the current schema </h6></div>' +
        '<button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="modal"></button></div>';
    }
    function buildBody(id){
        return '<div class="modal-body"> <table id="table_' + id + '"></table><button id="dewit" type="button">Apply</button></div>';
    }

    let id = ModalInfo.getNextID();
    let modalHtml = ModalInfo.buildModal(
        id,
        buildHeader(api,table),
        buildBody(id)
    );
    $("body").append(modalHtml);

    let selected_set = new Set();
    let unselected_set = new Set();

    let ahs = (await api.getTableAttributeHandlers(table,schema)).attribute_handlers;

    let columns= ["column_name","unit","ucd","utype","type","description"];
    let selected = select ? (await api.getSelectedFields(table)).fields:undefined;
    if(selected === undefined){
        selected = [];
    }
    ahs = ahs.map((val=>{
        return Object.entries(val).filter( entry=>columns.includes(entry[0]) ).reduce(
            (n,o)=>{
                n[o[0]]=o[1];
                return n;
            },
            (select ? {select:selected.includes(val.column_name)}:{})
        );
    }));

    let options = {
        "aaData":ahs.map(t=>Object.values(t)),
        "aoColumns":Object.keys(ahs[0]).map(t=>{return {sTitle:t};}),
        "pagingType" : "simple",
        "aaSorting" : [],
        "bSort" : false,
        "bFilter" : true,
        "aLengthMenu": [],
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
            if(!select){
                return nRow;
            }
            $("td:eq(0)",nRow).html("<input type='checkbox' id='" + id + "_"+ vizierToID(table)/* you never know when a [Fe/H] will come */ + 
                "' style='margin:.4em' "+ (aData[0] ? "checked" : "") + ">").click((e)=>{
                    if($(e.target).is(":checked")){
                        api.selectField(aData[1],table,false);
                        if(unselected_set.has(aData[1])){
                            unselected_set.delete(aData[1]);
                        }else{
                            selected_set.add(aData[1]);
                        }
                    }else{
                        api.unselectField(aData[1],table);
                        if(selected_set.has(aData[1])){
                            selected_set.delete(aData[1]);
                        }else{
                            unselected_set.add(aData[1]);
                        }
                    }
                });
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
        { "name": 'filter',
            "pos" : "top-right"
        }
    ];

    CustomDataTable.create("table_" + id, options, positions);

    let modal = new bootstrap.Modal($("#" + id)[0]);
    $("#" + id +" button#dewit").click(()=>{
        $(document).trigger("column_selection_changed.meta",{
            table:table,
            api:api,
            selected:selected_set,
            unselected:unselected_set,
        });
    });
    modal.show();//.replace(/\n/g,"<br>")
    return modal;
};