document.write("<script type='text/javascript' src= 'allLink.js'></script>");
document.write("<script type='text/javascript' src= 'allTable.js'></script>");
var jsonResultAll = function (site,checkstatus){
    var allTtable=[];
    var jsonAll = {};
    columns = [];
    constraints = "";
    allTtable = allTable(site,checkstatus);//Get the array containing the names of the tables
    for(var k=0;k<allTtable.length;k++){
        var arrLink={};
        var arrLinkJoint = {};
        var alllink=[];
        var arrJoint = {};
        alllink = allLink(site, allTtable[k],checkstatus); 
        for(var i = 0; i < alllink.length;i++){
            var tt = alllink[i][0].split("|");
            var ft = alllink[i][1].split("|");
            if(tt[0]==allTtable[k]){
            arrLinkJoint["columns"]=columns;
            arrLinkJoint["constraints"] =constraints;
            arrLinkJoint["from"]=ft[1];
            arrLinkJoint["target"]=tt[1];
            arrLink[ft[0]]=arrLinkJoint;
            };
            if(ft[0] == allTtable[k]){
            arrLinkJoint["columns"]=columns;
            arrLinkJoint["constraints"] =constraints;
            arrLinkJoint["from"]=tt[1];
            arrLinkJoint["target"]=ft[1];
            arrLink[tt[0]]=arrLinkJoint;
            };
        }
        arrJoint["join_tables"]=arrLink;
        jsonAll[allTtable[k]] = arrJoint;
    }
    return jsonAll;
}