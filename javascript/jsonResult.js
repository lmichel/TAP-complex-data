document.write("<script type='text/javascript' src= 'ifJoint.js'></script>");
document.write("<script type='text/javascript' src= 'allLink.js'></script>");
var jsonResult = function (site,rootTable, ...nameTables){
    var alllink=[];
    var arrJoint = {};
    var jsonAll = {};
    alllink = allLink(site, rootTable); 
    var arrLink={};
    for(var k = 0;nameTables[k]!=null;k++){};
    if(k!=0){
      for(var j = 0;nameTables[j]!=null;j++){
        var arrLinkJoint = {};
        var list_exist = [];
        list_exist.push(rootTable);
        for(var i = 0; i < alllink.length;i++){
          var tt = alllink[i][0].split("|");
          var ft = alllink[i][1].split("|");
          if(tt[0]==nameTables[j]){
            arrLinkJoint["keys_joint"]=tt[1];
            arrLinkJoint["keys_root"]=ft[1];
            list_exist.push(nameTables[j]);
            var a = ifJoint(`${site}`,list_exist, nameTables[j])
            if (!($.isEmptyObject(a))){
                arrLinkJoint["joint_tables"] = a;
              }
            arrLink[tt[0]]=arrLinkJoint;
          };
          if( ft[0] == nameTables[j]){
            arrLinkJoint["keys_joint"]=ft[1];
            arrLinkJoint["keys_root"]=tt[1];
            list_exist.push(nameTables[j]);
            var b = ifJoint(`${site}`,list_exist, nameTables[j])
            if (!($.isEmptyObject(b))){
                arrLinkJoint["joint_tables"] = b;
              }
            arrLink[ft[0]]=arrLinkJoint;
          };
        }
      }
      arrJoint["joint_tables"]=arrLink;
      jsonAll[rootTable] = arrJoint;
    }
    if(k==0){
      for(var i = 0; i < alllink.length;i++){
        var arrLinkJoint = {};
        var list_exist = [];
        list_exist.push(rootTable);
        var tt = alllink[i][0].split("|");
        var ft = alllink[i][1].split("|");
        if(tt[0]==rootTable){
          arrLinkJoint["keys_joint"]=ft[1];
          arrLinkJoint["keys_root"]=tt[1];
          list_exist.push(ft[0]);
          var a = ifJoint(`${site}`,list_exist, ft[0])
          if (!($.isEmptyObject(a))){
              arrLinkJoint["joint_tables"] = a;
            }
          arrLink[ft[0]]=arrLinkJoint;
        };
        if( ft[0] == rootTable){
          arrLinkJoint["keys_joint"]=tt[1];
          arrLinkJoint["keys_root"]=ft[1];
          list_exist.push(tt[0]);
          var b = ifJoint(`${site}`,list_exist, tt[0])
          if (!($.isEmptyObject(b))){
              arrLinkJoint["joint_tables"] = b;
            }
          arrLink[ft[0]]=arrLinkJoint;
        };
      }
      arrJoint["joint_tables"]=arrLink;
      jsonAll[rootTable] = arrJoint;
    }
    return jsonAll;
}