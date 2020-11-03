class TapApi{

    constructor() {
        this.tapService='';
        let jsonStatu = {success:{},faillure:{}};
        this.disconnectJsonStatu = {success:{},faillure:{}}
        this.testConnection=false;
        this.testDeconnection=false;
        this.correctService;
        this.votableQueryResult;
        this.connector = {status:"",message:"", service:{}}
        this.jsonContaintJoinTable = {
            Succes: {
                status: "" ,
                base_table: "",
                joined_tables: []
            },
            Failure:{
                NotConnected : {status:"", message: ""},
                WrongTable: {status:"", message: ""}
            }
        }

        /**
         * @param votableQueryResult (Object) The return value of tabService.Query(query)
         * @return jsonStatu (Json Object) Return Json containning the status of adql query
         * */
           let isCorrectJsonStatu=function (votableQueryResult){
            if (votableQueryResult.statusText=="OK"){
                jsonStatu.success["status"]="OK";
            }else {
                jsonStatu.faillure["status"]="failled";
                jsonStatu.faillure["message"]="Bad Request";
            }
            return jsonStatu;
        }

        /**
         * @param votableQueryResult : (Object) The return value of tabService.Query(query)
         * @return jsonStatu : (String) The statuText of votableQueryResult
         * */
        this.getJsonStatu = function (votableQueryResult){
               var jsonStatu = isCorrectJsonStatu(votableQueryResult)
            return jsonStatu;
        }

    }


}
/**
 * @param params (Json) with parameters (tapService,schema,table,shortName)
 * @param tapService (String) The URL of the Tap Servie
 * @param schema (String) Schema containing the complex object
 * @param table (String) Root table of the complex object
 * @param shortName (String) The Shortname of database
 * */
TapApi.prototype.connect = function ({tapService,schema,table,shortName}){
    var formatTableName =schema+"."+table;
    alert(formatTableName);
    var correctTableNameFormat = formatTableName.quotedTableName().qualifiedName;
    var query = "SELECT TOP 1* FROM "+correctTableNameFormat;
    this.tapService = new TapService(tapService,schema,shortName,true)
    this.correctService = new TapServiceConnector(tapService,schema,shortName);
    this.votableQueryResult = this.tapService.Query(query);

    if (this.getJsonStatu(this.votableQueryResult).success.status=="OK"){
        this.testConnection =true;
        this.connector.status='OK';
        this.connector.service["tapService"] = tapService;
        this.connector.service["schema"] = schema;
        this.connector.service["table"] = table;
        this.connector.service["shortName"] = shortName;
        this.connector.message = "Active TAP : "+shortName
        // console.log(JSON.stringify(this.getJsonStatu(this.votableQueryResult),undefined,2))

        //retirer dans l'api
        //var data = this.correctService.loadJson();
        //$("#loadJson").html(JSON.stringify(data,undefined,2));
        //window.location.hash = "#loadJson"

        //var jsonData = correctService.createVoTableResultJson(votableQueryResult,table)
        // $("#votableJson").html(JSON.stringify(jsonData,undefined,2));
        // window.location.hash = "#votableJson"

    }else {
        this.testConnection = false

        this.connector.status='Failled';
        this.connector.message = "No active TAP connection"
        console.log(JSON.stringify(this.getJsonStatu(this.votableQueryResult).faillure,undefined,3));


    }
    return this.correctService;
}



TapApi.prototype.disconnect = function (){
    this.tapService = null;
    this.correctService = null;
    this.votableQueryResult = null;
    if(this.correctService == null  && this.tapService==null && this.votableQueryResult==null){
        this.disconnectJsonStatu.success["DisconnectStatus"] = "OK";
        this.testDeconnection = true
        return this.disconnectJsonStatu.success;
    }else {
        this.disconnectJsonStatu.faillure["faillure"] = "failled";
        this.disconnectJsonStatu.faillure["message"] = "disconnecting failled";
        this.testDeconnection = false;
        return this.disconnectJsonStatu.faillure;
    }
    //console.log(JSON.stringify(this.disconnectJsonStatu,undefined,2))


}

TapApi.prototype.getConnector = function (){
        return  this.connector;
}

TapApi.prototype.getObjectMap = function (){
   var objectMap = {
       succes: {status:"", object_map: {}},
       failure: {status:"", message: ""}
   }
    if(this.testConnection == true){
        objectMap.succes.status = "OK"
        objectMap.succes.object_map = this.correctService.loadJson();
       // return objectMap.succes;
    }else {
        objectMap.failure.status = "Failed"
        objectMap.failure.message = "No active TAP connection";
        //return objectMap.failure
    }

   return objectMap;
}
/**
 * @param baseTable (string): Table from which joint table are searched
 * */
TapApi.prototype.getJoinedTables = function (baseTable){


    if(this.testConnection ==true){
        this.jsonContaintJoinTable.Succes.status = "OK";
        this.jsonContaintJoinTable.Succes.base_table = baseTable;
        this.jsonContaintJoinTable.Succes.joined_tables = this.correctService.getJoinTables(baseTable);;
    }else {
        this.jsonContaintJoinTable.Failure.NotConnected.status = "Failed";
        this.jsonContaintJoinTable.Failure.NotConnected.message = "No active TAP connection";
        this.jsonContaintJoinTable.Failure.WrongTable.status = "Failed";
        this.jsonContaintJoinTable.Failure.WrongTable.message = "table "+baseTable+" is not part of the object map"
    }

    return this.jsonContaintJoinTable;
}


/**
 *
 * @param {*} mainJsonData  the main json create by the method createMainJson of Tapservice
 * @returns return all the field of each join table of the mainJson
 */
TapApi.prototype.getCorrectFieldOfJoinTable=function(mainJsonData){
    var tableContentQueryField=[]
    Object.keys(mainJsonData).forEach(function(key) {
        tableContentQueryField.push(key);
    });
    return tableContentQueryField;
}

/**
 *
 * @param {*} mainJsonData the main json create by the method createMainJson of Tapservice
 * @returns return all join request of each join table of the mainJson
 */
TapApi.prototype.getRootFields=function(){

    let jsonContaintRootFields = {
        succes: {status: "", field_values: []},
        failure:{
                notConnected: {status:"", message: ""},
                otherError: {status:"", message: ""}
               }
    }

    let rootFields = [];
    if(this.testConnection===true){
        let contentText = this.votableQueryResult.responseText;
        if(this.getConnector().service.tapService === "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.getConnector().service.tapService === "http://dc.zah.uni-heidelberg.de/tap/sync"){
            rootFields = VOTableTools.getField (this.votableQueryResult);
        }else{
            rootFields =VOTableTools.genererField(this.votableQueryResult,contentText);
        }
        jsonContaintRootFields.succes.status = "OK"
        jsonContaintRootFields.succes.field_values = rootFields;
        return jsonContaintRootFields.succes;
    }else {

        jsonContaintRootFields.failure.notConnected.status="Failed";
        jsonContaintRootFields.failure.notConnected.message="No active TAP connection"
        jsonContaintRootFields.failure.otherError.status = "failed"
        jsonContaintRootFields.failure.otherError.message = "error_message"

        return jsonContaintRootFields.failure
       // alert('you are not connected');
    }



}




TapApi.prototype.getRootQuery = function () {
    var rootTable = this.jsonContaintJoinTable.Succes.base_table;
    var jsonAll = this.getObjectMap();
    var schema; var  contentAdql = "";
   // console.log(this.getJoinedTables())
   // console.log(rootTable)
    for (var keyRoot in jsonAll.succes.object_map) {
       // console.log(keyRoot);

        if (keyRoot == rootTable) {
            schema = jsonAll.succes.object_map[keyRoot].schema;
            if (schema == 'public') {
                schema = "\"" + "public" + "\"";
            }
            //var m = 0;
            for (var key in jsonAll.succes.object_map[keyRoot].join_tables) {




                    /* if(this.url ==VizierUrl || this.url== XmmUrl){
                         jsonQuerySchema.
                     }*/
                    var schemaPrefix = "";
                    // if( jsonQuerySchema.withSchema==true){
                    schemaPrefix = schema + ".";
                    // }else{
                    // schemaPrefix = "" ;
                    // }
                    contentAdql = "SELECT TOP 100 " + schemaPrefix + key + "." + jsonAll.succes.object_map[keyRoot].join_tables[key].from + " ";
                    contentAdql += " FROM " + schema + "." + keyRoot + " ";
                    contentAdql += "JOIN " + schema + "." + key + " ";


            }

            return contentAdql;
        }
    }


}
