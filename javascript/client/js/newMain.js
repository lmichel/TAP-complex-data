
document.write("<script type='text/javascript' src= '../../module/js/json2Requete.js'></script>");

const Simbadschema = "public";

   var test = false;
 
function newMain(){

   // initial();

   
   var mainData,newMainData;
   var listJoinTable;
        var queryTable,index;
    $("#btnSimbad").click(function(){ 
        var simbadService = new TapServiceConnector("http://simbad.u-strasbg.fr/simbad/sim-tap/sync",Simbadschema,"Simbad");
        var data = simbadService.loadJson();
        var sj=new jsonRead(data);
        //alert(sj.joinTable('basic'))
        var output = "";
        output += sj.showAll(data);
        $("#loadJson").html(output);
        window.location.hash = "#loadJson"
    });

    $("#btnBasic").click(function(){ 
        var simbadService = new TapServiceConnector("http://simbad.u-strasbg.fr/simbad/sim-tap/sync",Simbadschema,"Simbad");
        var value = $("#selectToJoin").val()
        var adqlQuery = $("#txtArea").val();
        simbadService.setAdqlQuery(adqlQuery);
        var data = simbadService.loadJson();
        $("#loadJson").html(JSON.stringify(data,undefined,2));
        window.location.hash = "#loadJson" 
        var QObject = simbadService.connect();
        var listJoinAndId = simbadService.getListJoinAndId('basic',data);
        var listId = simbadService.getListeId(listJoinAndId);
         var   mainData = simbadService.tapService.createMainJson(simbadService.getAdqlQuery(),data,'basic',listId,listJoinAndId);
       
        getTableJsonQueryValue(mainData,simbadService,'basic');
        var tableContentJoinTable = getJoinTable(mainData);
      
        $("#selectDiv").html(selectTableToJoin_html(tableContentJoinTable))
        window.location.hash = "#selectDiv"
        var  out =simbadService.joinTableByField(mainData,'basic')

    });

////////////////////////////// block service connection /////////////////////////////////////////////////////
function showPage() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("myDiv").style.display = "block";
    var myVar = setTimeout(showPage, 3000);
  }
$("#connectBasic").click(function(){ 
    var adql ="SELECT TOP 1* FROM \"public\".basic"
    const Schemas = "public";
    const Url = "http://simbad.u-strasbg.fr/simbad/sim-tap/sync";
    const ShortName = "Simbad";
    var tableName = 'basic' 
    $(window).load(function() {
        $(".loader").fadeOut("1000"); })
    var simbadServices =connectDatabase(Url,Schemas,ShortName,adql,tableName);

    showPage();
});

$("#connectResource").click(function(){
    var adql ="SELECT TOP 1* FROM rr.resource "
    const Schemas = "rr";
    const Url = "http://dc.zah.uni-heidelberg.de/tap/sync";
    const ShortName = "Gavo"; 
    var tableName ='resource'
    var gavoServices =connectDatabase(Url,Schemas,ShortName,adql,tableName);
})
$("#connectCaomObservation").click(function(){
    var adql ="SELECT  TOP 1 dbo.CaomObservation.* FROM dbo.CaomObservation"
    const Schemas = "dbo";
    const Url = "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync";
    const ShortName = "CAOM"; 
    var tableName ='CaomObservation'        
    var caomServices =connectDatabase(Url,Schemas,ShortName,adql,tableName);
})

$("#connectMETACat").click(function(){
    
    var adql ="SELECT  TOP 100  * FROM metaviz.METAcat"
    const Schemas = "metaviz";
    const Url = "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync";
    const ShortName = "Vizier"; 
    var tableName ='METAcat'        
    var caomServices =connectDatabase(Url,Schemas,ShortName,adql,tableName);
})
$("#connectEPIC_IMAGE").click(function(){
    var adql ="SELECT  TOP 1  * FROM EPIC.EPIC_IMAGE "
    const Schemas = "EPIC";
    const Url = "http://xcatdb.unistra.fr/3xmmdr8/tap/sync";
    const ShortName = "3XMM"; 
    var tableName ='EPIC_IMAGE'        
    var caomServices =connectDatabase(Url,Schemas,ShortName,adql,tableName);
})

function showLoader(){
    var head = document.getElementsByTagName('HEAD')[0];  
  
    // Create new link Element 
    var link = document.createElement('link'); 

    // set the attributes for link element  
    link.rel = 'stylesheet';  
  
    link.type = 'text/css'; 
  
    link.href = 'css/main.css';  

    // Append link element to HTML head 
    head.appendChild(link);
    $("head").append('<script type="text/javascript" src="js/vendor/modernizr-2.6.2.min.js""></script>');
}

/**
 * 
 * @param {*} urlPath   the base urlPath of tapService exemple : http://xcatdb.unistra.fr/3xmmdr8/tap/sync
 * @param {*} schema    the schema of database exemple : for Gavo database, schema = "rr"
 * @param {*} shortname the shortname of database like Gavo for gavo database
 * @param {*} adql      the request you want for choosing table. exemble : SELECT TOP 1* FROM rr.resource for gavo
 * @param {*} tableName the name of table in datable like resource table in gavo database
 */
function connectDatabase(urlPath,schema,shortname,adql,tableName){
    showLoader();
    var databaseServices=new TapServiceConnector(urlPath,schema,shortname);
     var value = $("#selectToJoin").val()
    var adqlQuery = $("#txtArea").val(adql);
    databaseServices.setAdqlQuery(adqlQuery.val());
    //alert(urlPath)
    var data = databaseServices.loadJson();
    if(data[tableName]==undefined){
        data={ tables :{
            "base_table" : tableName,
            "join_table" :{}
        }}
        //alert(JSON.stringify(joinTable,undefined,2))
    }
    $("#loadJson").html(JSON.stringify(data,undefined,2));
    window.location.hash = "#loadJson" 
    var listJoinAndId = databaseServices.getListJoinAndId(tableName,data);
    var listId = databaseServices.getListeId(listJoinAndId);
   // alert(adqlQuery.val());
     var   mainData = databaseServices.tapService.createMainJson(databaseServices.getAdqlQuery(),data,tableName,listId,listJoinAndId);
   
    getTableJsonQueryValue(mainData,databaseServices,tableName);
    var tableContentJoinTable = getJoinTable(mainData);
    if(tableContentJoinTable.length==0){
        tableContentJoinTable.push(tableName);
        mainData = databaseServices.tapService.createMainJson(databaseServices.getAdqlQuery(),data,tableName,listId,listJoinAndId);
   

    }
    $("#selectDiv").html(selectTableToJoin_html(tableContentJoinTable))
    window.location.hash = "#selectDiv"
    var  out =databaseServices.joinTableByField(mainData,tableName,urlPath,schema,shortname);
    
   return databaseServices;
  }


/**
 * 
 * @param {*} tableContentJoinTable  the table tha containing all join table get by calling the method 
 *                                   getJoinTable(mainData) parse insite the main json data create by method 
 *                                   createMainJson(@parameters) 
 * @return {*}   return a html div with select option menu that containt all join table as option  
 */
 

/**
 * 
 * @param {*} json the main json create by the method createMainJson(@params)
 * @returns   return all array containing all join table of the main json
 */
function getJoinTable(json){
    var tableContentJoinTable =[];
    Object.keys(json).forEach(function(key) {
        var value = key;
        tableContentJoinTable.push(value); 
        //console.log(isJSON(mainData));
    });
    return tableContentJoinTable;
}

///////////////////////////////////////////////////////////////////////////////


    $("#refresh").click(function(){
        var value = $("#selectToJoin").val()
       // alert("dfffffffff")
        var adqlQuery = $("#txtArea").val();
      var data = simbadService.loadJson();
      var QObject = simbadService.connect();
      var listJoinAndId = simbadService.getListJoinAndId('basic',data);
      var listId = simbadService.getListeId(listJoinAndId);
          mainData = simbadService.tapService.createMainJson(adqlQuery,data,'basic',listId,listJoinAndId);
          /*listJoinTable = getJoinTable(mainData);
          queryTable = getTableJsonQueryValue(mainData);
          index = listJoinTable.indexOf(value);
           simbadService.setAdqlQuery(queryTable[index]);
           newMainData = mainJsonData(queryTable[index])
          test=true;
      
          listJoinTable = getJoinTable(newMainData);
          queryTable = getTableJsonQueryValue(newMainData);
          index = listJoinTable.indexOf(value);
           simbadService.setAdqlQuery(queryTable[index]);
           newMainData = mainJsonData(queryTable[index])*/
       
      var  out =simbadService.joinTableByField(mainData,'basic')
      })


    $("#btnQuery").click(function(){
        var adqlQuery = $("#txtArea").val();
        simbadService.connectService(adqlQuery);
        var data = simbadService.loadJson();
        simbadService.setAdqlQuery(adqlQuery);
        var QObject = simbadService.connect();
        var sj=new jsonRead(data);
        var listJoinAndId = simbadService.getListJoinAndId('basic',data);
        var listId = simbadService.getListeId(listJoinAndId);
        simbadService.setAdqlQuery(adqlQuery);

         mainData = simbadService.tapService.createMainJson(adqlQuery,data,'basic',listId,listJoinAndId);
        $("#loadJson").html(JSON.stringify(mainData,undefined,2));
        window.location.hash = "#loadJson"

        var  out =simbadService.joinTableByField(mainData,'basic')
        $("#votableJson").html(out);
        window.location.hash = "#votableJson"
       // console.log(out)
        getTableJsonQueryValue(mainData);
        var a = getJoinTable(mainData);
        $("#selectDiv").html(selectTableToJoin_html(a))
        window.location.hash = "#selectDiv"
    });

    
    $("#btnBuild").click(function(){
        var value = $("#selectToJoin").val()
        var data = simbadService.loadJson();
        var QObject = simbadService.connect();
        var listJoinAndId = simbadService.getListJoinAndId('basic',data);
        var listId = simbadService.getListeId(listJoinAndId);
            mainData = simbadService.tapService.createMainJson(simbadService.getAdqlQuery(),data,'basic',listId,listJoinAndId);
            /*listJoinTable = getJoinTable(mainData);
            queryTable = getTableJsonQueryValue(mainData);
            index = listJoinTable.indexOf(value);
             simbadService.setAdqlQuery(queryTable[index]);
             newMainData = mainJsonData(queryTable[index])
            test=true;
        
            listJoinTable = getJoinTable(newMainData);
            queryTable = getTableJsonQueryValue(newMainData);
            index = listJoinTable.indexOf(value);
             simbadService.setAdqlQuery(queryTable[index]);
             newMainData = mainJsonData(queryTable[index])*/
         
        var  out =simbadService.joinTableByField(mainData,'basic')
        //document.getElementById("btnJoin").style["display"] = "block";
   

    })
    $("#btnJoin").click(function(){ //document.getElementById("btnBuild").style["display"] = "none";
    listJoinTable = getJoinTable(newMainData);
    var data = simbadService.loadJson();
  // queryTable = getTableJsonQueryValue(newMainData);
    //index = listJoinTable.indexOf(value);
   // simbadService.setAdqlQuery(queryTable[index]);
   // newMainData = mainJsonData(queryTable[index])
       var QObject = simbadService.connect();
       var  out =simbadService.setRootTable(data,'basic')
       $("#votableJson").html(out);
       window.location.hash = "#votableJson"
      // alert(out)
       
       })
    }


   
      


function mainJsonData(adql) {
    var data = simbadService.loadJson();
    var QObject = simbadService.connect();
    var listJoinAndId = simbadService.getListJoinAndId('basic',data);
    var listId = simbadService.getListeId(listJoinAndId);
     return simbadService.tapService.createMainJson(adql,data,'basic',listId,listJoinAndId);;
    
}



function getTableJsonQueryValue(json,simbadService,tableBase){
    var data = simbadService.loadJson();
   // var QObject = simbadService.connect();
    var listJoinAndId = simbadService.getListJoinAndId(tableBase,data);
   // var listId = simbadService.getListeId(listJoinAndId);
    var tableContentQuery =[];
    //var tableContentInstanceOfMainData=[]
    Object.keys(json).forEach(function(key) {
        var value = json[key];
        Object.keys(value).forEach(function(key) {
            var  valu ;
            if(key!="key"){
                 valu = value[key];
                 tableContentQuery.push(valu);
                 
            }  
        });

        //console.log(isJSON(mainData));
    });
    
   
  //  console.log(tableContentInstanceOfMainData[0])
    return tableContentQuery;
}







var votable2data = function (vObject) {
    var contentText = "";
    contentText = vObject.responseText;
    var method = contentText.indexOf("base64");
    var data
    if (method != -1) {
         data = VOTableTools.content2Rows(contentText);
    };
    
    return data;
};
function createVoTableResultJson(votableQueryResult,s){
   
       var voTableData  = VOTableTools.votable2Rows(votableQueryResult);
       var data =votable2data(votableQueryResult)
       var votableField = VOTableTools.getField (votableQueryResult);
       var jsonData = { 
           data: {
               
           }
        }
        var k=0;
       
          /* jsonData = {votableField:voTableData[i]}
          for (var j = 0; j <votableField.length ; j = j + 1) {
            for(var i=0;i<data.length;i++){
            jsonData.data[votableField[j]] =voTableData[j] ;   
        }*/
        for(var i = 0; i<votableField.length;i++){
            
           jsonData.data[votableField[i]]=voTableData[i] ;    
       }     
        
           
       
     /*  console.log(JSON.stringify(jsonData,undefined,2))
       console.log(votableField)
       console.log(voTableData)*/
       return jsonData;
}
/*
const arr = JSON.parse(json);
arr.forEach( obj => renameKey( obj, '_id', 'id' ) );
const updatedJson = JSON.stringify( arr );*/

function renameKey ( obj, oldKey, newKey ) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }

  function getCorrectOutputJson(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });


  }

function genererDataTable(Field,dataTable){//zone 3 except textarea class = 'white_content' 
  
var out1="<table class='table table-bordered table-striped table-sm' cellspacing='0' width='100%' id='dtBasicExample'>"
out1 +="<thead><tr role='row'>";//head
//out +="<th/>";
var nb = Field.length;
for(var j=0;j<nb;j++){
out1 +="<th rowspan='1' class='th-sm'  colspan='1' style='text-align:center;vertical-align:bottom'>"+Field[j]+"&nbsp&nbsp</th>";
}
out1 +="</tr></thead>";
out1 +="<tbody>";
var column =0;
for(var j=0;j<dataTable.length;j++){//table  content
if(column==0){    
    var judge = (j+nb)/nb;
    if(judge%2==1){
        out1+="<tr>";
        //out+="<td><input type='checkbox'></td>";
    }
    else{
        out1+="<tr>";
        //out+="<td><input type='checkbox'></td>";
    }
    out1 +="<td id = '"+dataTable[j]+"' >"+dataTable[j]+"</td>";
  
}
else{
    out1 +="<td >"+dataTable[j]+"</td>";
}
column =column+1;
if(column==nb){
    out1 +="</tr>";
    column=0;
}
}
out1 +="</tbody>";
out1 += "</table></div></td></tr>";
return out1;
}




function selectTableToJoin_html(tableContentJoinTable){
    var out ='<div class="card" id ="">'+
                    '<div class="card-body">'+
                        '<div class="row">'+
                            '<div class="col-lg-6">'+
                                ' <div class="form-group">'+
                                '<label for="selectToJoin">Select Table To Join &nbsp &nbsp &nbsp'+
                                '</label>'+
                                '<select class="form-control" id="selectToJoin">'+
                                '<option seleted>...</option>'
                                    for(var i=0;i<tableContentJoinTable.length;i++){
                                        
                                        out +="<option id='"+i+"'>"+tableContentJoinTable[i]+"</option>"
                                    }
                                    out +='</select>'+
                                        '</div>'+'</div>'+'</div>'+
                                        '<hr class="btn-primary">'+
                                        '<div> '+
                                        '<textarea class="form-control" id="txtAreaAdql" value=""></textArea><br>'+
                                        '</div>'+
                                        '<button class="btn btn-success" id="executeAdql">Run Adql</button>'
                                        '</div>'+'</div>'
    




          
    return out;                                
}