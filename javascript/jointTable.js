document.write("<script type='text/javascript' src= 'ifJoint.js'></script>");
var jointTable = function (rootTable, ...nameTables){
    var reTable; 
    var reTableRe; 
    var everyLink=[];
    var allLink=[];
    var arrJoint = {};
    var jsonAll = {};
    reTable  = $.ajax({
        url: "http://simbad.u-strasbg.fr/simbad/sim-tap/sync",
        type: "GET",
        data: {query: 'SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id WHERE target_table = \''+rootTable+'\' OR from_table = \''+rootTable+'\'', format: 'votable', lang: 'adql', request :'doQuery'},
        async:false
        })
      .done(function(result){ 
            var serialized;
            try{
                serializer = new XMLSerializer();
                serialized=serializer.serializeToString(result);
                return serialized;
            }
            catch(e){
                serialized=result.xml;
                return serialized;
            }
      })
      reTableRe= reTable.responseText;
      reTableRe = reTableRe.replace(/<STREAM encoding='base64'>\n/g, "haha");
      reTableRe = reTableRe.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
      reTableRe = reTableRe.match(/haha(\S*)xixi/)[1];
      var donnee = atob(reTableRe).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
      donnee=donnee.split("||||")
      for(i=1;i<donnee.length;i=i+5)
      {
        var tt= donnee[i+1];
        var tc= donnee[i+4];
        var ft= donnee[i];
        var fc= donnee[i+3];
        var k=0;
        everyLink[k]=tt+'.'+tc;
        k=1;
        everyLink[k]=ft+'.'+fc;
        allLink.push(everyLink);
        everyLink=[];
      }
      var arrLink={};
      for(var j = 0;nameTables[j]!=null;j++)
      {
        var arrLinkJoint = {};
        
        var list_exist = [];
        list_exist.push(rootTable);
        for(var i = 0; i < allLink.length;i++){
          var tt = allLink[i][0].split(".");
          var ft = allLink[i][1].split(".");
          if(tt[0]==nameTables[j]){
            arrLinkJoint["keys_joint"]=tt[1];
            arrLinkJoint["keys_root"]=ft[1];
            list_exist.push(nameTables[j]);
            var a = ifJoint(list_exist, nameTables[j])
            if (!($.isEmptyObject(a)))
              {
                arrLinkJoint["joint_tables"] = a;
              }
            arrLink[tt[0]]=arrLinkJoint;
          };
          if( ft[0] == nameTables[j]){
            arrLinkJoint["keys_joint"]=ft[1];
            arrLinkJoint["keys_root"]=tt[1];
            list_exist.push(nameTables[j]);
            var b = ifJoint(list_exist, nameTables[j])
            if (!($.isEmptyObject(b)))
              {
                arrLinkJoint["joint_tables"] = b;
              }
            arrLink[ft[0]]=arrLinkJoint;
            
          };
        }
        
      }
      arrJoint["joint_tables"]=arrLink;
      jsonAll[rootTable] = arrJoint;
      console.log(jsonAll);
}