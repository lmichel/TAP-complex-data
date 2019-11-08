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
    let joinTable:string="";
    let flag2:number
    flag2 = flag + 1;
    let niveau:number = flag2+2;
    let space :string =  "    ";
    for(let i:number = 1; i<=flag2;i++)
        {
          space += space;
        }
    for(var key in jsonAll[table].join_tables){
      if(list_exist.indexOf(key)==-1){
        joinTable +=space+"<B>"+ key +"</B>" + ": "+"<font color = \"#545454\">"+ this.getDescription(key)+"</font>"+  "<br/>";
        joinTable += space+"<input id=\""+niveau+key+"\" type=\"text\" name = \"Cinput\" style = \"width: 200px\" placeholder=\"contraints\">"+"<button type=\"button\" id = "+"\"b"+ niveau +key + "\" name = \"Cbutton\" class=\"btn btn-primary\">Add</button>"+ "<br/>";
        list_exist.push(key);
        let table :string;
        let tableCut : string; 
        table = this.json2HtmlJoin(key,list_exist,flag2);
        tableCut = table.replace(/ /g,"");
        if(tableCut.length != 0)
        {
          joinTable += table;
        }
      }
    }
    return joinTable;
  }

  /**
   * This function reads the json object and get a string containing the html code.
   * The same logic of TapService.ts-"createNewJson()"
   * @param table the main(table) table
   * @return a string containing the html code
   */
  json2Html (table:string):string{
    let jsonAll:dic = this.json
    let joinTable:string="";
    let list_exist:string[] = [];
    list_exist.push(table);
    joinTable += "<B>"+ table +"</B>"+ ": "+"<font color = \"#545454\">"+ this.getDescription(table)+"</font>"+ "<br/>";
    joinTable += "<input id="+"\"1"+table+"\" type=\"text\" name = \"Cinput\" style = \"width: 200px\" placeholder=\"contraints\">"+"<button type=\"button\" id = "+"\"b1"+ table + "\" name = \"Cbutton\" class=\"btn btn-primary\">Add</button>"+ "<br/>";
    for(var key in jsonAll[table].join_tables)
    {
      joinTable += "    " + "<B>"+key + "</B>" + ": "+"<font color = \"#545454\">"+ this.getDescription(key)+"</font>"+  "<br/>";
      joinTable += "    " +"<input id=\"2"+key+"\" type=\"text\" name = \"Cinput\" style = \"width: 200px\" placeholder=\"contraints\">"+"<button type=\"button\" id = "+"\"b2"+ key + "\" name = \"Cbutton\" class=\"btn btn-primary\">Add</button>"+ "<br/>";
      if(list_exist.indexOf(key)==-1){//return the table which are joined with the key.
        list_exist.push(key);
        joinTable +=  this.json2HtmlJoin(key,list_exist,0);
      }
    }
    return joinTable;
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

  CreateJsonAndContraint(list:string[],constraint:string,flag:number,jsonJoin:dic){//By default, flag=0
    let jsonAll:dic={};
    let json:dic ={};
    let list_rest:string[]=list
    var key = list[0]
    if(0==list.length-1 && flag==0){//only the first table has not join tables
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=jsonJoin[key].description;
      jsonAll["columns"]=[];
      jsonAll["constraints"]=constraint;
      json[key]=jsonAll
    }
    else if( 0!=list.length-1 &&flag ==0){//the first table has join tables
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=jsonJoin[key].description;
      jsonAll["columns"]=[];
      jsonAll["constraints"]="";
      list_rest.shift();
      flag = flag +1
      jsonAll["join_tables"]=this.CreateJsonAndContraint(list_rest,constraint,flag,this.json[key].join_tables);
      json[key]=jsonAll
    }
    else if(0!=list.length-1 && flag !=0){//not the last/first one
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=this.json[key].description;
      jsonAll["columns"]=[jsonJoin[key].from];
      jsonAll["constraints"]="";
      jsonAll["from"]=jsonJoin[key].from;
      jsonAll["target"]=jsonJoin[key].target;
      list_rest.shift();
      flag = flag +1;
      jsonAll["join_tables"]=this.CreateJsonAndContraint(list_rest,constraint,flag,this.json[key].join_tables);
      json[key]=jsonAll
    }
    else if(key==list[0] && 0==list.length-1 && flag !=0){//the last one 
      jsonAll["schema"]=jsonJoin[key].schema;
      jsonAll["description"]=this.json[key].description;
      jsonAll["columns"]=[jsonJoin[key].from];
      jsonAll["constraints"]=constraint;
      jsonAll["from"]=jsonJoin[key].from;
      jsonAll["target"]=jsonJoin[key].target;
      json[key]=jsonAll;
    }
    return json
  }

}





