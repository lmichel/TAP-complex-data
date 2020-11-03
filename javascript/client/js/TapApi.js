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

    if (this.getJsonStatu(this.votableQueryResult).success.status==="OK"){
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
        return this.correctService;
    }else {
        this.testConnection = false

        this.connector.status='Failled';
        this.connector.message = "No active TAP connection"
        console.log(JSON.stringify(this.getJsonStatu(this.votableQueryResult).faillure,undefined,3));

        return 'failled connecton'
    }
}



TapApi.prototype.disconnect = function (){
    this.tapService = null;
    this.correctService = null;
    this.votableQueryResult = null;
    if(this.correctService == null  && this.tapService==null && this.votableQueryResult==null){
        this.disconnectJsonStatu.success["DisconnectStatus"] = "OK";
        this.testDeconnection = true
    }else {
        this.disconnectJsonStatu.faillure["faillure"] = "failled";
        this.disconnectJsonStatu.faillure["message"] = "disconnecting failled";
        this.testDeconnection = false;
    }
    console.log(JSON.stringify(this.disconnectJsonStatu,undefined,2))

    return this.disconnectJsonStatu;
}

TapApi.prototype.getConnector = function (){
        return  this.connector;
}

TapApi.prototype.getObjectMap = function (){
   var objectMap = {
       succes: {status:"", object_map: {}},
       failure: {status:"", message: ""}
   }
    if(this.testConnection === true){
        objectMap.succes.status = "OK"
        objectMap.succes.object_map = this.correctService.loadJson();
    }else {
        objectMap.failure.status = "Failed"
        objectMap.failure.message = "No active TAP connection";
    }

    return objectMap;
}
/**
 * @param baseTable (string): Table from which joint table are searched
 * */
TapApi.prototype.getJoinedTables = function (baseTable){

  var jsonContaintJoinTable = {
      Succes: {
          status: "" ,
          base_table: "",
          joined_tables: []
      },
      Failure:{
          NotConnected : {status:"", message: "No active TAP connection"},
          WrongTable: {status:"", message: ""}
    }
    }
    if(this.testConnection ===true){
        var arrayContentJoinTables = this.correctService.getJoinTables(baseTable);
        jsonContaintJoinTable.Succes.status = "OK";
        jsonContaintJoinTable.Succes.base_table = baseTable;
        jsonContaintJoinTable.Succes.joined_tables = arrayContentJoinTables;
    }else {
        jsonContaintJoinTable.Failure.NotConnected.status = "Failed";
        jsonContaintJoinTable.Failure.NotConnected.message = "No active TAP connection";
        jsonContaintJoinTable.Failure.WrongTable.status = "Failed";
        jsonContaintJoinTable.Failure.WrongTable.message = "table "+baseTable+" is not part of the object map"
    }

    return jsonContaintJoinTable;
}
