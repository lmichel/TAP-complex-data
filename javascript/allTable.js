document.write("<script type='text/javascript' src= 'allTableQuery.js'></script>");
var allTable = function (site){
    var allTableObject = allTableQuery(site); //Get all the tables
    var reTable;
    var allTable=[];
    reTable = allTableObject.responseText;
    var method = reTable.indexOf("base64");
    if(method!=-1){//The coding mode is "base64".
        reTable = reTable.replace(/<STREAM encoding="base64">/g, "haha");
        reTable = reTable.replace(/<STREAM encoding='base64'>\n/g, "haha");
        reTable = reTable.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
        reTable = reTable.match(/haha(\S*)xixi/)[1];
        var donnee = atob(reTable).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
        donnee=donnee.split("||||");
        for(var i=1;i<donnee.length;i=i+1)//Store the name of the table in an array
        {
            allTable.push(donnee[i]);
        }
    }
    /*
    if(method==-1){//The coding mode is normal.
      console.log(reTable)
      reTable=reTable.replace(/\s+/g,"");
      reTable= reTable.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
      var donnee = reTable.replace(/<TR><TD>/g, "@");
      donnee = donnee.replace(/<\/TD><\/TR>/g, "");
      donnee = donnee.replace(/<\/TD><TD>/g, "|")
      donnee = donnee.split('@')
      var a = [];
      var b =[];
      for(var k = 1;k<donnee.length;k++)
      {
        a = donnee[k].split('|');
        b.push(a);
      }
      for(var i=0;i<b.length;i=i+1)
    {
      var tt= b[i][1];
      var tc= b[i][4];
      var ft= b[i][0];
      var fc= b[i][3];
      var k=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
    }*/
    return allTable; //Return an array containing the names of the tables
}