"use strict"
class TapService{

  url:string; // website as astring
  schema:string;
  label:string;
  checkstatus:boolean // true(TOP 100), false(all)

  constructor(url:string,schema:string,label:string,checkstatus:boolean){
    this.url=url;
    this.schema=schema;
    this.label=label;
    this.checkstatus=checkstatus;
  }

  Query(adql:string){
    let site:string = this.url;
    var reTable;
    reTable = $.ajax({
      url: `${site}`,
      type: "GET",
      data: {query: `${adql}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
      async:false
      })
    .done(function(result:any){
        return result;
    })
  return reTable;
  }
  

  /**
   * Get the names of all the tables.
   * It's for Simbad(schema_name = 'public'), GAVO(schema_name = 'rr'), VizieR(schema_name = 'metaviz'), CAOM(schema_name = 'dbo').
   * @param site : website as as tring
   * @param checkstatus : true(TOP 100), false(all)
   */
  allTableQuery (){
    let site:string = this.url;
    let checkstatus:boolean = this.checkstatus;
    let schema_name:string = this.schema;
    var reTable;
    //By default, all are displayed.
    var checkvalue = 'SELECT DISTINCT T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \''+schema_name+'\'';
    if(checkstatus==true){//Select TOP 100 on the page.
      checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \''+schema_name+'\'';
    }
    reTable = $.ajax({
      url: `${site}`,
      type: "GET",
      data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
      async:false
      })
    .done(function(result:any){
        return result;
    })
    console.log(reTable)
  return reTable;
  }

  /**
   * Get the from_table, target_table, from_column, target_column
   * @param site : website as as tring
   * @param checkstatus : true(TOP 100), false(all)
   */
  allLinkQuery (){
    let site:string = this.url;
    let checkstatus:boolean = this.checkstatus;
    let reLink:any;
    let checkvalue:string = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
    if(checkstatus==true){
        checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
    }
    reLink = $.ajax({
        url: `${site}`,
        type: "GET",
        data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
        async:false
        })
    .done(function(result){
      return result;
    })
    return reLink;
  }

  /**
   * Add the schema name
   * @param table 
   */
  getQualifiedName(table:string){
    if(table.indexOf(this.schema)!=-1){
      return table;
    }
    else{
      return this.schema+"."+table;
    }
  }

  /**
   * Delete the schema name
   * @param table 
   */
  getRightName(table:string){
    if(table.indexOf(this.schema)==-1){
      return table;
    }
    else{
      return table.replace(new RegExp(this.schema+'.','g'),"");
    }
  }

  /**
   * Get 2-dimensional array. The array returns all the information related to the rootTable.
   * RETURN: A 2-dimensional array. The array returns all the information related to the rootTable.
   */
  allLink ():string[][]{                                                              
    let allLinkLimitObject:any;
    allLinkLimitObject= this.allLinkQuery();
    let reTableRe:string[];
    let everyLink:string[]=[];
    let allLink:string[][]=[[]];
    reTableRe = VOTableTools.votable2Rows(allLinkLimitObject);
    for(let i:number=0;i<reTableRe.length;i=i+5)
    {
      let tt:string= reTableRe[i+1];
      tt=this.getRightName(tt);
      let tc:string= reTableRe[i+4];
      let ft:string= reTableRe[i];
      ft=this.getRightName(ft);
      let fc:string= reTableRe[i+3];
      let k:number=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
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

  /**
   * Get all the table's name.
   * @return all the table's name.
   */
  allTable():string[]{
  var allTableObject = this.allTableQuery(); //Get all the tables
  let allTable:string[]=[];
  allTable = VOTableTools.votable2Rows(allTableObject);
  return allTable; //Return an array containing the names of the tables
  }

  /**
   * return all tables with the name of the join table.
   * @param site 
   * @param checkstatus 
   * @return json object
   */
  createJson():dic{
    let allTtable:string[]=[];
    var jsonAll:dic = {};
    let columns:string[] = [];
    let constraints:string = "";
    let alllink:string[][]=[[]];
    alllink = this.allLink(); 
    allTtable = this.allTable();//Get the array containing the names of the tables.//Even number is the table name.
    for(let k:number=0;k<allTtable.length;k=k+2){
      let arrLink:dic={};
      let arrJoint:dic = {};
      let flag:number = 0;
      let ifSame:number = 0;
      let nowTable:string = allTtable[k]
      nowTable = this.getRightName(nowTable);
      for(var i = 0; i < alllink.length;i++){
        let arrLinkJoint:dic = {};
        var tt = alllink[i][0].split("|");
        var ft = alllink[i][1].split("|");
        if(tt[0]== nowTable){
          loop:
          for(var key in arrLink){
            if(ft[0]==key){
              ifSame=1;
              arrLinkJoint["schema"]=this.schema;
              arrLinkJoint["columns"]=columns;
              arrLinkJoint["constraints"] =constraints;
              var temp1 = [];
              temp1.push(arrLink[ft[0]].from);
              temp1.push(ft[1]);
              arrLinkJoint["from"]=temp1;
              temp1= [];
              temp1.push(arrLink[ft[0]].target);
              temp1.push(tt[1]);
              arrLinkJoint["target"]=temp1;
              arrLink[ft[0]]=arrLinkJoint;
              break loop;
            }
            else{
              ifSame=0
            }
          }
          if(ifSame==0){
            flag = flag +1;
            arrLinkJoint["schema"]=this.schema;
            arrLinkJoint["columns"]=columns;
            arrLinkJoint["constraints"] =constraints;
            arrLinkJoint["from"]=ft[1];
            arrLinkJoint["target"]=tt[1];
            arrLink[ft[0]]=arrLinkJoint;
          }
        };
        if(ft[0] == nowTable){
          loop:
          for(var key in arrLink){
            if(tt[0]==key){
              ifSame=1;
              arrLinkJoint["schema"]=this.schema;
              arrLinkJoint["columns"]=columns;
              arrLinkJoint["constraints"] =constraints;
              var temp1 = [];
              temp1.push(arrLink[tt[0]].from);
              temp1.push(tt[1]);
              arrLinkJoint["from"]=temp1;
              temp1= [];
              temp1.push(arrLink[tt[0]].target);
              temp1.push(ft[1]);
              arrLinkJoint["target"]=temp1;
              arrLink[tt[0]]=arrLinkJoint;
              break loop;
            }
            else{
              ifSame=0
            }
        };
        if(ifSame==0){
          flag = flag +1;
          arrLinkJoint["schema"]=this.schema;
          arrLinkJoint["columns"]=columns;
          arrLinkJoint["constraints"] =constraints;
          arrLinkJoint["from"]=tt[1];
          arrLinkJoint["target"]=ft[1];
          arrLink[tt[0]]=arrLinkJoint;
        }
      }
    }
      if(flag == 0){
        continue;
      }
      else{
        arrJoint["schema"]=this.schema;
        arrJoint["description"]=allTtable[k+1];
        arrJoint["join_tables"]=arrLink;
        jsonAll[nowTable] = arrJoint;
      }
    }
    return jsonAll;
  }


  /**
 * In order to create the json with all join table
 * @param data :json
 * @param root :the main table
 */
  createNewJson(data:dic,root:string):dic{
    let reJson : dic = {}
    for(var key in data)
    {
      let list_exist:string[] = [];
      list_exist.push(key);
      let joinJson:dic = {};
      if(root == key){
        joinJson["schema"]=data[key].schema;
        joinJson["description"]=data[key].description;
        joinJson["columns"]=[];
        joinJson["constraints"]="";
        let joinJsonJoin:dic={};
        for(var join in data[key].join_tables)
        {
            let joinJsonJoin1:dic={};
            list_exist.push(join);
            joinJsonJoin1["schema"]=data[join].schema;
            joinJsonJoin1["description"]=data[join].description;
            joinJsonJoin1["columns"]=data[key].join_tables[join].columns;
            joinJsonJoin1["constraints"]=data[key].join_tables[join].constraints;
            joinJsonJoin1["from"]=data[key].join_tables[join].from;
            joinJsonJoin1["target"]=data[key].join_tables[join].target;
            let a:dic = this.ifJoin(data,list_exist,join)
              if(JSON.stringify(a)!='{}'){
                joinJsonJoin1["join_tables"]=a;
              }
            joinJsonJoin[join]=joinJsonJoin1;
            joinJson["join_tables"]=joinJsonJoin;
        }
        reJson[key]=joinJson;
        break;
      }
    }
    return reJson;
  }

  ifJoin(data:dic,list_exist:string[],root:string):dic{
    let joinJsonJoin:dic={};
    for(var key in data){
      if(key==root ){
        for(var join in data[key].join_tables){
            if(list_exist.indexOf(join) == -1){
              list_exist.push(join);
              let joinJsonJoin1:dic={};
              joinJsonJoin1["schema"]=data[join].schema;
              joinJsonJoin1["description"]=data[join].description;
              joinJsonJoin1["columns"]=data[key].join_tables[join].columns;
              joinJsonJoin1["constraints"]=data[key].join_tables[join].constraints;
              joinJsonJoin1["from"]=data[key].join_tables[join].from;
              joinJsonJoin1["target"]=data[key].join_tables[join].target;
              let a:dic = this.ifJoin(data,list_exist,join)
              if(JSON.stringify(a)!='{}'){
                joinJsonJoin1["join_tables"]=a;
              }
              joinJsonJoin[join]=joinJsonJoin1;
            }
        }
        break;
      }
    }
  return joinJsonJoin
  }


}




