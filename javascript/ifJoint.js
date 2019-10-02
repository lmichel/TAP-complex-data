document.write("<script type='text/javascript' src= 'allLink.js'></script>");
var ifJoint = function(list_exist, tableName){
    var alllink = allLink(tableName);
    var arrLink={};
    var arrLinkJoint={};
    var nameTable;
    for(var i = 0; i < alllink.length;i++){
        var tt = alllink[i][0].split(".");
        var ft = alllink[i][1].split(".");
        if(ft[0]==tableName && !(list_exist.includes(tt[0]))){
            arrLinkJoint["keys_joint"]=tt[1];
            arrLinkJoint["keys_root"]=ft[1];
            list_exist.push(tt[0]);
            nameTable=tt[0];
            var a = ifJoint(list_exist, nameTable);
            if (!($.isEmptyObject(a)))
            {
                
                arrLinkJoint["joint_tables"] = a;
            }
            arrLink[tt[0]]=arrLinkJoint;
        }
        if( tt[0] == tableName && !(list_exist.includes(ft[0]))){
            arrLinkJoint["keys_joint"]=ft[1];
            arrLinkJoint["keys_root"]=tt[1];
            list_exist.push(ft[0]);
            nameTable=ft[0];
            var b =ifJoint(list_exist, nameTable)
            if (!($.isEmptyObject(b)))
            {
                
                arrLinkJoint["joint_tables"] = b;
            }
            arrLink[ft[0]]=arrLinkJoint;
        }
    }
    return arrLink;
}
