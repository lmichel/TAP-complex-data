"use strict"
type dic={//No dictionary in typescript
  [key:string]:string|string[]|dic|number;
}

class jsonRead{

  json:dic;
  
  constructor(json:dic){
    this.json = json;
  }

  /**
  * This function reads the json object and get the most used table's name.
  * @param data :json object
  * RETURN: an array containing table's name.
  */
  mostUsed():string[]{
    let data:dic = this.json
    let mostUsedDic:dic={};
    let rootTable:string[] = this.rootTable();
    let mostUsedTable:string[]=[];//the higher the front, the larger the number of jointable.
    for(var i = 0;i<rootTable.length;i++){
      let count:number = 0;
      for(var key in data[rootTable[i]].join_tables)
      {
        count +=1;
      }
      mostUsedDic[rootTable[i]]=count;
    }
    if(mostUsedDic[rootTable[0]]<mostUsedDic[rootTable[1]])
    {
      mostUsedTable[0]=rootTable[1];
      mostUsedTable[1]=rootTable[0];
    }
    else{
      mostUsedTable[0]=rootTable[0];
      mostUsedTable[1]=rootTable[1];
    }
    for(let h:number=2;h<rootTable.length;h++){
      mostUsedTable[h]=rootTable[h];
        for(let j:number=h-1;j>=0;j--){
          let tempi:number = mostUsedDic[mostUsedTable[j+1]];
          let tempj:number = mostUsedDic[mostUsedTable[j]];
          if(tempj>=tempi){
            break;
          }
          else{
            let temp:string = mostUsedTable[j+1]
            mostUsedTable[j+1]=mostUsedTable[j];
            mostUsedTable[j]=temp;
          }
        }
    }
    return mostUsedTable;
  }

  /**
  * This function reads the json object and gets all the table names
  * @return all the root table's name.
  */
  rootTable ():string[]{
    let jsonAll:dic = this.json;

    let rootTable:string[] = [];
    for(var key in jsonAll)
    {
      rootTable.push(key);
    }
    return rootTable
  }

  /**
   * Returns the join_table element of table "table"
   * @param table the main table.
   * @return all the join table's name.
   */
  joinTable (table:string):string[]{
    let jsonAll:dic = this.json;
    let joinTable:string[] = [];
    for(var key in jsonAll[table].join_tables)
    {
      if(key.indexOf("2")!=-1){
        continue;//same rootTable and join_table, I made the second name of the repeat followed by a number 2//@TODO 
      }
      else{
        joinTable.push(key);
      }
      
    }
    return joinTable;
  }

  /**
   * This is a recursive function. In order to get all the join table of table "table"
   * @param table the main(root) table
   * @param list_exist store the recorded table name
   * @param flag record the number of recursions and format the output.
   * @return a string containing the html code
   */
  json2HtmlJoin(table:string,list_exist:string[],flag:number):string{
    let jsonAll:dic = this.json;
    let htmlbuffer:string=""
    let joinTable:string[]=[];
    let flag2:number
    flag2 = flag + 1;
    let niveau:number = flag2+2;
    let space1 :string[]=[]
    var space:string=  "    ";
    for(let i:number = 0; i<=flag2;i++)
        {
          space1.push(space);
        }
        space = space1.join('');
    for(var key in jsonAll[table].join_tables){
      if(list_exist.indexOf(key)==-1){
        joinTable.push(space+"<B>"+ key +"</B>" + ": "+"<font color = \"#545454\">"+ this.getDescription(key)+"</font>"+  "<br/>");
        joinTable.push(space+"<button type=\"button\" id = "+"\"b"+ niveau +key + "\" name = \"Cbutton\" class=\"btn btn-primary\" >Aide</button>"+"<input id=\""+niveau+key+"\" type=\"text\" name = \"Cinput\" style = \"width: 500px\" placeholder=\"contraints\">"+ "<br/>");
        list_exist.push(key);
        let table :string;
        let tableCut : string; 
        table = this.json2HtmlJoin(key,list_exist,flag2);
        tableCut = table.replace(/ /g,"");
        if(tableCut.length != 0)
        {
          joinTable.push(table);
        }
      }
    }
    htmlbuffer=joinTable.join('')
    return htmlbuffer;
  }

  /**
   * This function reads the json object and get a string containing the html code.
   * The same logic of TapService.ts-"createNewJson()"
   * @param table the main(table) table
   * @return a string containing the html code
   */
  json2Html (table:string):string{
    let jsonAll:dic = this.json
    let joinTable:string[]=[];
    let htmlbuffer:string=""
    let list_exist:string[] = [];
    list_exist.push(table);
    joinTable.push("<B>"+ table +"</B>"+ ": "+"<font color = \"#545454\">"+ this.getDescription(table)+"</font>"+ "<br/>");
    joinTable.push("<button type=\"button\" id = "+"\"b1"+ table + "\" name = \"Cbutton\" class=\"btn btn-primary\">Aide</button>"+"<input id="+"\"1"+table+"\" type=\"text\" name = \"Cinput\" style = \"width: 500px\" placeholder=\"contraints\">"+ "<br/>");
    for(var key in jsonAll[table].join_tables)
    {
      joinTable.push("    " + "<B>"+key + "</B>" + ": "+"<font color = \"#545454\">"+ this.getDescription(key)+"</font>"+  "<br/>");
      joinTable.push("    " +"<button type=\"button\" id = "+"\"b2"+ key + "\" name = \"Cbutton\" class=\"btn btn-primary\">Aide</button>"+"<input id=\"2"+key+"\" type=\"text\" name = \"Cinput\" style = \"width: 500px\" placeholder=\"contraints\">"+ "<br/>");
      if(list_exist.indexOf(key)==-1){//return the table which are joined with the key.
        list_exist.push(key);
        joinTable.push(this.json2HtmlJoin(key,list_exist,0));
      }
    }
    htmlbuffer=joinTable.join('');
    return htmlbuffer;
  }

  /**
   * This function reads the json object and get a string containing the html code.
   * @param table  the main(table) table
   * @return the table table's description
   */
  getDescription(table:string):string{
    let jsonAll:dic = this.json
    let description:string;
    description=jsonAll[table].description;
    return description;
  }

  /**
   * This function reads the json object and get a string containing the html code.
   * @return a string containing the html code
   */
  showAll():string{
    let rootTable:string[] = this.rootTable();
    let joinTable:string[]=[];
    let output:string="";
    for(var i = 0;i<rootTable.length;i++){
      joinTable = this.joinTable(rootTable[i]);
      output +="<B>"+rootTable[i] + "</B>" +" : "+ "<font color = \"#545454\">"+ this.getDescription(rootTable[i])+"</font>"+ "<br/>";
      for(var j = 0;j<joinTable.length;j++)
      {
        output+= "    " +"<B>"+ joinTable[j] +"</B>"+" : "+ "<font color = \"#545454\">"+ this.getDescription(joinTable[j])+"</font>"+ "<br/>";
      }
      output += "<br/>";
    }
    return output;  
  }

  /**
   * Generate json with contraints
   * @param list : Recorded all table names from the table to the child table
   * @param constraint :the constraint
   * @param flag: control the number of recursions
   * @param jsonJoin: original json
   * @return :json with contraints
   */
  CreateJsonAndContraint(list:string[],constraints:string[],column:string[],flag:number,jsonJoin:dic){//By default, flag=0
    let jsonAll:dic={};
    let json:dic ={};
    let list_rest:string[]=JSON.parse(JSON.stringify(list))
    var key = list[0]
    var schema = jsonJoin[key].schema;
    var flagC=0,flagColumn=0;
    if(schema == "public"){
      schema = "\""+"public"+"\"";
    }
    if(0==list.length-1 && flag==0){//only the first table has not join tables
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=jsonJoin[key].description;
      var temp=[]
      for(var i = 0;i<column.length;i=i+2){
        if(column[i]==key){
          flagColumn=1;
          temp.push(column[i+1]);
        }
      }
      jsonAll["columns"]=temp;
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagColumn==0){jsonAll["columns"]=[];};
      if(flagC==0){jsonAll["constraints"]="";};
      json[key]=jsonAll
      flagC=0;
      flagColumn=0;
    }
    else if( 0!=list.length-1 &&flag ==0){//the first table has join tables
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=jsonJoin[key].description;
      var temp=[]
      for(var i = 0;i<column.length;i=i+2){
        if(column[i]==key){
          flagColumn=1;
          temp.push(column[i+1])
        }
      }
      jsonAll["columns"]=temp;
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1;
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagColumn==0){jsonAll["columns"]=[];};
      if(flagC==0){jsonAll["constraints"]="";};
      list_rest.shift();
      flag = flag +1
      jsonAll["join_tables"]=this.CreateJsonAndContraint(list_rest,constraints,column,flag,this.json[key].join_tables);
      json[key]=jsonAll
      flagC=0;
      flagColumn=0;
    }
    else if(0!=list.length-1 && flag !=0){//not the last/first one
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=this.json[key].description;
      var temp=[];
      for(var i = 0;i<column.length;i=i+2){
        if(column[i]==key){
          flagColumn=1;
          temp.push(column[i+1]);
        }
      }
      jsonAll["columns"]=temp;
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagColumn==0){jsonAll["columns"]=[];};
      if(flagC==0){jsonAll["constraints"]="";};
      jsonAll["from"]=jsonJoin[key].from;
      jsonAll["target"]=jsonJoin[key].target;
      list_rest.shift();
      flag = flag +1;
      jsonAll["join_tables"]=this.CreateJsonAndContraint(list_rest,constraints,column,flag,this.json[key].join_tables);
      json[key]=jsonAll
      flagC=0;
      flagColumn=0;
    }
    else if(key==list[0] && 0==list.length-1 && flag !=0){//the last one 
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=this.json[key].description;
      var temp=[]
      for(var i = 0;i<column.length;i=i+2){
        if(column[i]==key){
          flagColumn=1;
          temp.push(column[i+1])
        }
      }
      jsonAll["columns"]=temp;
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1;
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagColumn==0){jsonAll["columns"]=[];};
      if(flagC==0){jsonAll["constraints"]="";};
      var from = jsonJoin[key].from
      jsonAll["from"]=from;
      jsonAll["target"]=jsonJoin[key].target;
      json[key]=jsonAll;
      flagC=0;
      flagColumn=0;
    }

    return json
  }

  CreateJsonWithoutColumns(list:string[],constraints:string[],flag:number,jsonJoin:dic){
    let jsonAll:dic={};
    let json:dic ={};
    let list_rest:string[]=JSON.parse(JSON.stringify(list))
    var key = list[0]
    var schema = jsonJoin[key].schema;
    var flagC=0;
    if(schema == "public"){
      schema = "\""+"public"+"\"";
    }
    if(0==list.length-1 && flag==0){//only the first table has not join tables
      var c = schema +"."+ key +"."+"*";
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=jsonJoin[key].description;
      jsonAll["columns"]=[c];
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagC==0){jsonAll["constraints"]="";};
      json[key]=jsonAll
      flagC=0;
    }
    else if( 0!=list.length-1 &&flag ==0){//the first table has join tables
      var c = schema +"."+ key +"."+"*";
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=jsonJoin[key].description;
      jsonAll["columns"]=[c];
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1;
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagC==0){jsonAll["constraints"]="";};
      list_rest.shift();
      flag = flag +1
      jsonAll["join_tables"]=this.CreateJsonWithoutColumns(list_rest,constraints,flag,this.json[key].join_tables);
      json[key]=jsonAll
      flagC=0;
    }
    else if(0!=list.length-1 && flag !=0){//not the last/first one
      var c = schema +"."+ key +"."+"*";
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=this.json[key].description;
      jsonAll["columns"]=[];
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagC==0){jsonAll["constraints"]="";};
      jsonAll["from"]=jsonJoin[key].from;
      jsonAll["target"]=jsonJoin[key].target;
      list_rest.shift();
      flag = flag +1;
      jsonAll["join_tables"]=this.CreateJsonWithoutColumns(list_rest,constraints,flag,this.json[key].join_tables);
      json[key]=jsonAll
      flagC=0;
    }
    else if(key==list[0] && 0==list.length-1 && flag !=0){//the last one 
      var c = schema +"."+ key +"."+"*";
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=this.json[key].description;
      jsonAll["columns"]=[];
      for(var i = 0;i<constraints.length;i=i+2){
        if(constraints[i]==key){
          flagC=1;
          jsonAll["constraints"]=constraints[i+1];
        }
      }
      if(flagC==0){jsonAll["constraints"]="";};
      var from = jsonJoin[key].from
      jsonAll["from"]=from;
      jsonAll["target"]=jsonJoin[key].target;
      json[key]=jsonAll;
      flagC=0;
    }
    return json
  }

  AdqlAllColumn(name:string,schema:string){
    let adql:string = "";
    adql = "SELECT "
    +"TAP_SCHEMA.columns.column_name"
    +",TAP_SCHEMA.columns.unit"
    +",TAP_SCHEMA.columns.ucd"
    +",TAP_SCHEMA.columns.utype"
    +",TAP_SCHEMA.columns.dataType"
    +",TAP_SCHEMA.columns.description"
    +" FROM TAP_SCHEMA.columns"
    if(schema=='public' || schema=='metaviz'){
      adql += " WHERE TAP_SCHEMA.columns.table_name = "+"'"+name+"'";
    }
    else{
      adql += " WHERE TAP_SCHEMA.columns.table_name = "+"'"+schema+"."+name+"'";
    }
    return adql
  }
  

}






