
function getAdql(json){
    var jsonAll = JSON.parse(json);
    var adql = "";
    var column=[];
    var constraint="";
    for(var key in jsonAll)
    {
      if(jsonAll[key].columns!=[]){
        for(var columnkey in jsonAll[key].columns){
          column.push(key+"."+jsonAll[key].columns[columnkey]);
        }
      }
      if(jsonAll[key].join_tables!=undefined){
        var columnJoin =getColumn(jsonAll[key].join_tables);
        column.push(...columnJoin);
        constraint = getConstraint(jsonAll[key].join_tables);
      }
    }
    adql +="SELECT "
    for(var i = 0;i<column.length-1;i++){
      adql += column[i] + ", ";
    }
    adql += column[i]+" ";
    adql += "FROM ";
    for(var key in jsonAll)
    {
      adql += key + " ";
      adql += getJoin(jsonAll[key].join_tables,key);
    }
    if(constraint!=""){
      adql += "WHERE " + constraint + ";"
    }
    return adql;
}

function getColumn(json){
  var column=[];
  for(var key in json)
    {
      for(var columnkey in json[key].columns){
        column.push(key+"."+json[key].columns[columnkey]);
      }
      if(json[key].join_tables!=undefined){
        column.concat(getColumn(json[key].join_tables));
      }
    }
    return column;
}

function getConstraint(json){
  var constraint="";
  for(var key in json)
    {
      if(json[key].constraints!=""){
        constraint = json[key].constraints;
      }
      if(json[key].join_tables!=undefined){
        constraint += getConstraint(json[key].join_tables);
      }
    }
    return constraint;
}

function getJoin(json,table){
  var retour="";
  for(var key in json)
  {
    retour += "JOIN "+key+" ";
    retour += "ON " + table + "." + json[key].target + "=" + key + "." + json[key].from + " ";
    if(getJoin(json[key].join_tables)!=""){
      retour += getJoin(json[key].join_tables,key)
    }
  }
  return retour;
}


