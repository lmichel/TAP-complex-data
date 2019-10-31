
function getAdql(json,schema){
    var jsonAll = JSON.parse(json);
    var adql = "";
    var column=[];
    var constraint="";
    for(var key in jsonAll)
    {
      if(jsonAll[key].columns!=[]){
        for(var columnkey in jsonAll[key].columns){
          if( jsonAll[key].columns[columnkey].indexOf("*")!=-1){//jsonAll[key].columns[columnkey].indexOf("TOP")!=-1 ||
            column.push(jsonAll[key].columns[columnkey]);
          }
          else{
            column.push("\""+schema+"\""+"."+key+"."+jsonAll[key].columns[columnkey]);
          }
          
        }
      }
      if(jsonAll[key].join_tables!=undefined){
        var columnJoin =getColumn(jsonAll[key].join_tables,schema);
        column.push(...columnJoin);
        constraint = getConstraint(jsonAll[key].join_tables,0);
      }
    }
    adql +="SELECT "+"\n"+"TOP 100"+"\n";
    for(var i = 0;i<column.length;i++){
      if(column[i].indexOf("*")!=-1){
        adql +=column[i]+ " "+"\n";
      }else if(i==column.length-1){
        adql += column[i] +"\n";
      }
      else{
        adql += column[i] + ", "+"\n";
      }
      
    }
    adql += "FROM ";
    for(var key in jsonAll)
    {
      adql += "\""+schema+"\""+"."+key + " "+"\n";
      adql += getJoin(jsonAll[key].join_tables,key,schema);
    }
    if(constraint!=""){
      adql += "WHERE "+"\n" + constraint ;
    }
    return adql;
}

function getColumn(json,schema){
  var column=[];
  for(var key in json)
    {
      console.log(key)
      for(var columnkey in json[key].columns){
        
        if( json[key].columns[columnkey].indexOf("*")!=-1){//json[key].columns[columnkey].indexOf("TOP")!=-1 ||
          column.push(json[key].columns[columnkey]);
      }
      else{
        column.push("\""+schema+"\""+"."+key+"."+json[key].columns[columnkey]);
      }
      
    }
    if(json[key].join_tables!=undefined){
      column.push(...getColumn(json[key].join_tables,schema));
    }
  }
    return column;
}

function getConstraint(json,flag){
  var constraint="";
  for(var key in json)
    {
      if(json[key].constraints!="" && flag!=0){
        constraint += "\n"+"AND"+"\n";
        constraint += json[key].constraints;
        flag++;
      }
      else if(json[key].constraints!="" && flag == 0){
        constraint += json[key].constraints;
        flag++;
      }
      if(json[key].join_tables!=undefined){
        constraint += getConstraint(json[key].join_tables,flag);
      }
    }
    return constraint;
}

function getJoin(json,table,schema){
  var retour="";
  for(var key in json)
  {
    retour += "JOIN "+"\""+schema+"\""+"."+key+" "+"\n";
    retour += "ON " + "\""+schema+"\""+"."+table + "." + json[key].target + "=" + "\""+schema+"\""+"."+key + "." + json[key].from + " "+"\n";
    if(getJoin(json[key].join_tables)!=""){
      retour += getJoin(json[key].join_tables,key,schema);
    }
  }
  return retour;
}


