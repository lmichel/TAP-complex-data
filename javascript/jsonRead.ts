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
   * This function reads the json object and gets all the join table's names
   * @param root the main table.
   * @return all the join table's name.
   */
  joinTable (root:string):string[]{
    let jsonAll:dic = this.json;
    let joinTable:string[] = [];
    for(var key in jsonAll[root].join_tables)
    {
      joinTable.push(key);
    }
    return joinTable;
  }

  /**
   * This is a recursive function. In order to get all the join table of root table
   * @param root the main(root) table
   * @param list_exist store the recorded table name
   * @param flag record the number of recursions and format the output.
   * @return a string containing the html code
   */
  readJsonJoinTable(root:string,list_exist:string[],flag:number):string{
    let jsonAll:dic = this.json;
    let joinTable:string="";
    let flag2:number
    flag2 = flag + 1;
    let space :string =  "    ";
    for(var key in jsonAll[root].join_tables){
      if(list_exist.indexOf(key)==-1){
        for(let i:number = 0; i<=flag2;i++)
        {
          joinTable += space;
        }
        joinTable +="<B>"+ key +"</B>" + ": "+"<font color = \"#545454\">"+ this.getDescription(key)+"</font>"+  "<br/>";
        list_exist.push(key);
        let table :string;
        let tableCut : string; 
        table = this.readJsonJoinTable(key,list_exist,flag2);
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
   * @param root the main(root) table
   * @return a string containing the html code
   */
  readJsonJoin (root:string):string{
    let jsonAll:dic = this.json
    let joinTable:string="";
    let list_exist:string[] = [];
    list_exist.push(root);
    joinTable += "<B>"+ root +"</B>"+ ": "+"<font color = \"#545454\">"+ this.getDescription(root)+"</font>"+ "<br/>";
    for(var key in jsonAll[root].join_tables)
    {
      joinTable += "    " + "<B>"+key + "</B>" + ": "+"<font color = \"#545454\">"+ this.getDescription(key)+"</font>"+  "<br/>";
      if(list_exist.indexOf(key)==-1){//return the table which are joined with the key.
        list_exist.push(key);
        joinTable +=  this.readJsonJoinTable(key,list_exist,0);
      }
    }
    return joinTable;
  }

  /**
   * This function reads the json object and get a string containing the html code.
   * @param root  the main(root) table
   * @return the root table's description
   */
  getDescription(root:string):string{
    let jsonAll:dic = this.json
    let description:string;
    description=jsonAll[root].description;
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

 
}






