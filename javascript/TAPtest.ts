"use strict"
type dic={
  [key:string]:string|string[]|dic;
}

function changeString (allstr:string,start:number,end:number,str:string,changeStr:string){ //allstr:原始字符串，start,开始位置,end：结束位  置,str：要改变的字，changeStr:改变后的字
  if(allstr.substring(start,end) == str){
       return allstr.substring(0,start)+changeStr+allstr.substring(end+1,allstr.length+2); 
  }else{
       allstr; 
    }
 }


function allTableQuery (site:string,checkstatus:boolean){//Get the names of all the tables.
  var reTable;
  if(site == "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync")//CAOM.For CAOM, it has no restrictions in WHERE. So I judged it and rewritten the sql.
  {
    reTable = $.ajax({
      url: `${site}`,
      type: "GET",
      data: {query: 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T ', format: 'votable', lang: 'ADQL'},
      async:false
      })
    .done(function(result){
          var serialized;
          try{
            let serializer:any;
            serializer = new XMLSerializer();
            serialized=serializer.serializeToString(result);
            return serialized;
          }
          catch(e){
            serialized=result.xml;
          }
    })
  }
  else{//It's for Simbad(schema_name = 'public'), GAVO(schema_name = 'rr') and VizieR(schema_name = 'metaviz').
    //By default, all are displayed.
    var checkvalue = 'SELECT DISTINCT T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'public\' OR T.schema_name =\'rr\' OR T.schema_name LIKE \'metaviz\'';
    if(checkstatus==true){//Select TOP 100 on the page.
      checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'public\' OR T.schema_name =\'rr\' OR T.schema_name LIKE \'metaviz\'';
    }
    reTable = $.ajax({
      url: `${site}`,
      type: "GET",
      data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
      async:false
      })
    .done(function(result:any){
          var serialized;
          try{
            let serializer:any;
            serializer = new XMLSerializer();
            serialized=serializer.serializeToString(result);
            return serialized;
          }
          catch(e){
            serialized=result.xml;
          }
    })
  }
  return reTable;
}

function allLinkQuery(site:string, checkStatus:boolean):object{//Get the from_table, target_table, from_column, target_column
  let reLink:any;
  let checkvalue:string = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
  if(checkStatus==true){
    checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
  }
  reLink = $.ajax({
    url: `${site}`,
    type: "GET",
    data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
    async:false
    })
  .done(function(result:any){
        let serialized:any;
        
        try{
            let serializer:any;
            serializer = new XMLSerializer();
            serialized=serializer.serializeToString(result);
            return serialized;
          }
          catch(e){
            serialized=result.xml;
        }
  })
  return reLink;
}

function allLinkLimitQuery (site:string, rootTable:string,checkstatus:boolean){//Get the from_table, target_table, from_column, target_column related to rootTable.
  let reLink:any;
  let checkvalue:string = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id WHERE target_table = \''+rootTable+'\' OR from_table = \''+rootTable+'\'';
  if(checkstatus==true){
      checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id WHERE target_table = \''+rootTable+'\' OR from_table = \''+rootTable+'\'';
  }
  reLink = $.ajax({
      url: `${site}`,
      type: "GET",
      data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
      async:false
      })
  .done(function(result){
          var serialized;
          try{
              let serializer:any;
              serializer = new XMLSerializer();
              serialized=serializer.serializeToString(result);
              return serialized;
          }
          catch(e){
              serialized=result.xml;
          }
  })
  return reLink;
}

function allLink(site:string, checkStatus:boolean){
  let allLinkObject:any = allLinkQuery(site, checkStatus);
  let reTableRe:string;
  let everyLink:string[]=['a','b'];
  let allLink:string[][]=[[]];
  reTableRe = allLinkObject.responseText;
  var method = reTableRe.indexOf("base64");
  if(method!=-1){//The coding mode is "base64". //For Simbad and GAVO.
    reTableRe = reTableRe.replace(/<STREAM encoding="base64">/g, "haha");
    reTableRe = reTableRe.replace(/<STREAM encoding='base64'>\n/g, "haha");
    reTableRe = reTableRe.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
    reTableRe = reTableRe.match(/haha(\S*)xixi/)[1];
    let donnee:string;
    let donnee2:string[];
    donnee = atob(reTableRe).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
    donnee2=donnee.split("||||");
    for(let i:number=1;i<donnee2.length;i=i+5)
    {
      let tt:string= donnee2[i+1];
      if(tt.indexOf("rr")!=-1){
        tt=tt.replace(/rr./g,"");
      }
      let tc:string= donnee2[i+4];
      let ft:string= donnee2[i];
      if(ft.indexOf("rr")!=-1){
        ft=ft.replace(/rr./g,"");
      }
      let fc:string= donnee2[i+3];
      let k:number=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
  }
  if(method==-1){//The coding mode is normal. //For VizieR and CAOM.
    reTableRe=reTableRe.replace(/\s+/g,"");
    reTableRe= reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
    let donnee:string;
    let donnee2:string[];
    let donnee3:string[]=[];
    donnee = reTableRe.replace(/<TR><TD>/g, "@");
    donnee = donnee.replace(/<\/TD><\/TR>/g, "");
    donnee = donnee.replace(/<\/TD><TD>/g, "|")
    donnee2 = donnee.split('@')
    let h:number=0;
    for(let k:number=1;k<donnee2.length;k++){

      donnee3[h]=donnee2[k].split('|')[0];
      donnee3[h+1]=donnee2[k].split('|')[1];
      donnee3[h+2]=donnee2[k].split('|')[3];
      donnee3[h+3]=donnee2[k].split('|')[4];
      h=h+4;
    }
    for(let i:number=0;i<donnee3.length;i=i+4)
    {
      let tt:string= donnee3[i+1];
      let tc:string= donnee3[i+3];
      let ft:string= donnee3[i];
      let fc:string= donnee3[i+2];
      let k:number=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
  }
  let allLinkRe:string[][]=[[]];
  let k:number=0;
  for(let h:number=1;h<allLink.length;h++)
  {
    allLinkRe[k]=allLink[h];
    k = k+1;
  }
  return allLinkRe;
}

function allLinkLimit (site:string, rootTable:string,checkstatus:boolean){
  let allLinkObject:any = allLinkLimitQuery(site, rootTable,checkstatus);
  let reTableRe:string;
  let everyLink:string[]=['a','b'];
  let allLink:string[][]=[[]];
  reTableRe = allLinkObject.responseText;
  var method = reTableRe.indexOf("base64");
  if(method!=-1){//The coding mode is "base64".
    reTableRe = reTableRe.replace(/<STREAM encoding="base64">/g, "haha");
    reTableRe = reTableRe.replace(/<STREAM encoding='base64'>\n/g, "haha");
    reTableRe = reTableRe.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
    reTableRe = reTableRe.match(/haha(\S*)xixi/)[1];
    let donnee:string;
    let donnee2:string[];
    donnee = atob(reTableRe).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
    donnee2=donnee.split("||||");
    for(let i:number=1;i<donnee2.length;i=i+5)
    {
      let tt:string= donnee2[i+1];
      if(tt.indexOf("rr")!=-1){
        tt=tt.replace(/rr./g,"");
      }
      let tc:string= donnee2[i+4];
      let ft:string= donnee2[i];
      if(ft.indexOf("rr")!=-1){
        ft=ft.replace(/rr./g,"");
      }
      let fc:string= donnee2[i+3];
      let k:number=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
  }
  if(method==-1){//The coding mode is normal.
    reTableRe=reTableRe.replace(/\s+/g,"");
    reTableRe= reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
    let donnee:string;
    let donnee2:string[];
    donnee = reTableRe.replace(/<TR><TD>/g, "@");
    donnee = donnee.replace(/<\/TD><\/TR>/g, "");
    donnee = donnee.replace(/<\/TD><TD>/g, "|")
    donnee2 = donnee.split('@')
  }
  let allLinkRe:string[][]=[[]];
  let k:number=0;
  for(let h:number=1;h<allLink.length;h++)
  {
    allLinkRe[k]=allLink[h];
    k = k+1;
  }
  return allLinkRe;
}

function allTable(site:string,checkstatus:boolean){
  var allTableObject = allTableQuery(site,checkstatus); //Get all the tables
  var reTable;
  let allTable:string[]=[];
  reTable = allTableObject.responseText;
  var method = reTable.indexOf("base64");
  if(method!=-1){//The coding mode is "base64".
      reTable = reTable.replace(/<STREAM encoding="base64">/g, "haha");
      reTable = reTable.replace(/<STREAM encoding='base64'>\n/g, "haha");
      reTable = reTable.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
      reTable = reTable.match(/haha(\S*)xixi/)[1];
      let donnee:string;
      let donnee2:string[];
      donnee = atob(reTable).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");//|\u0023|\u0027|\u0025|\u002F|\u0037|\u0032|\u0034|\u002E|\u002A|\u0029|\u003B|\u0030|\u0020|\u003A|\u0031|\u004C
      donnee=donnee.replace(/\|\|\|\|/g,"&");
      for(;;){
        let start:number = donnee.indexOf("|||");
        donnee = changeString(donnee,start,start+3,"|||","||||");
        donnee=donnee.replace(/\|\|\|\|/g,"&");
        if(donnee.indexOf("|||")==-1){
          break;
        }
      }
      donnee2=donnee.split("&");
      for(var i=1;i<donnee2.length;i=i+1)//Store the name of the table in an array
      {
          allTable.push(donnee2[i]);
      }
  }
  if(method==-1){//The coding mode is normal.
    reTable=reTable.replace(/\s+/g,"");
    reTable= reTable.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
    let donnee:string;
    let donnee2:string[];
    donnee = reTable.replace(/<TR><TD>/g, "@");
    donnee = donnee.replace(/<\/TD><\/TR>/g, "");
    donnee = donnee.replace(/<\/TD><TD>/g, "|")
    donnee2 = donnee.split('@')
    for(var k = 1;k<donnee2.length;k++)
    {
      allTable.push(donnee2[k]);
    }
  }
  return allTable; //Return an array containing the names of the tables
}

function jsonResultAll (site:string,checkstatus:boolean){
  let allTtable:string[]=[];
  var jsonAll:dic = {};
  let columns:string[] = [];
  let constraints:string = "";
  if(site == "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync")
  {
    let allTheLink:string[][]=allLink(site,checkstatus);
    let list_exist:string[] = [];
    for(var i = 0; i < allTheLink.length;i++){
        let tt:string[] = allTheLink[i][0].split("|");
        let ft:string[] = allTheLink[i][1].split("|");
        if(list_exist.indexOf(tt[0])==-1){
          jsonAll[tt[0]] = VizieRJoin(allTheLink,tt[0]);
          list_exist.push(tt[0]);
        }
        if(list_exist.indexOf(ft[0])==-1){
          jsonAll[ft[0]] = VizieRJoin(allTheLink,ft[0]);
          list_exist.push(tt[0]);
        }
    }
  }
  else{
      allTtable = allTable(site,checkstatus);//Get the array containing the names of the tables.//Even number is the table name.
      for(let k:number=0;k<allTtable.length;k=k+2){
          let arrLink:dic={};
          let arrLinkJoint:dic = {};
          let alllink:string[][]=[[]];
          let arrJoint:dic = {};
          alllink = allLinkLimit(site, allTtable[k],checkstatus); 
          if(alllink[0][0] == undefined){//exclude the situation of no join table
            continue
          }
          else{
            let nowTable:string = allTtable[k].replace(/rr./g,"");
            for(var i = 0; i < alllink.length;i++){
                var tt = alllink[i][0].split("|");
                var ft = alllink[i][1].split("|");
                if(tt[0]== nowTable){
                  arrLinkJoint["columns"]=columns;
                  arrLinkJoint["constraints"] =constraints;
                  arrLinkJoint["from"]=ft[1];
                  arrLinkJoint["target"]=tt[1];
                  arrLink[ft[0]]=arrLinkJoint;
                };
                if(ft[0] == nowTable){
                  arrLinkJoint["columns"]=columns;
                  arrLinkJoint["constraints"] =constraints;
                  arrLinkJoint["from"]=tt[1];
                  arrLinkJoint["target"]=ft[1];
                  arrLink[tt[0]]=arrLinkJoint;
                };
            }
            arrJoint["description"]=allTtable[k+1];
            arrJoint["join_tables"]=arrLink;
            jsonAll[nowTable] = arrJoint;
          }
        }
  }
  return jsonAll;
}

function VizieRJoin (allTheLink:string[][],rootTable:string){
  let arrLink:dic={};
  let arrLinkJoint:dic = {};
  let columns:string[] = [];
  let constraints:string = "";
  let arrJoint:dic = {};
  for(var i:number=0;i<allTheLink.length;i++){
    let tt:string[] = allTheLink[i][0].split("|");
    let ft:string[] = allTheLink[i][1].split("|");
    if(tt[0]==rootTable){
      arrLinkJoint["columns"]=columns;
      arrLinkJoint["constraints"] =constraints;
      arrLinkJoint["from"]=ft[1];
      arrLinkJoint["target"]=tt[1];
      arrLink[ft[0]]=arrLinkJoint;
    }
    if(ft[0]==rootTable){
      arrLinkJoint["columns"]=columns;
      arrLinkJoint["constraints"] =constraints;
      arrLinkJoint["from"]=tt[1];
      arrLinkJoint["target"]=ft[1];
      arrLink[tt[0]]=arrLinkJoint;
    }
  }
  arrJoint["join_tables"]=arrLink;
  return arrJoint;
}

function readJson (jsonAll:dic){
  let rootTable:string[] = [];
  for(let key:string in jsonAll)
  {
      rootTable.push(key);
  }
  return rootTable
}

var readJsonJoinAll = function (jsonAll:dic,root:string){
  var joinTable = [];
  for(var key in jsonAll[root].join_tables)
  {
      joinTable.push(key);
  }
  return joinTable;
}

function readJsonJoin (jsonAll:dic,root:string){
  let joinTable:string="";
  let list_exist:string[] = [];
  list_exist.push(root);
  for(var key in jsonAll[root].join_tables)
  {
    joinTable += root + "<br/>";
    joinTable += "    " + key + "<br/>";
    if(list_exist.indexOf(key)==-1){
      list_exist.push(key);
      joinTable += "  "+readJsonJoinTable(jsonAll,key,list_exist)+"<br/>";
    }
  }
  return joinTable;
}

function readJsonJoinTable(jsonAll:dic,root:string,list_exist:string[]){
  let joinTable:string="";
  for(var key in jsonAll[root].join_tables){
    if(list_exist.indexOf(key)==-1){
      joinTable += "      3" + key + "<br/>";
      list_exist.push(key);
      let table :string;
      let tableCut : string;
      table = readJsonJoinTable(jsonAll,key,list_exist);
      console.log(table)
      tableCut = table.replace(/ /g,"");
      if(tableCut.length != 0)
      {
        joinTable += "    4" + table + "<br/>";
      }
    }
  }
  return joinTable;
}

function getDescription(jsonAll:dic,root:string){
  let description:string;
  description=jsonAll[root].description;
  return description
}