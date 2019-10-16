"use strict";
function changeString(allstr, start, end, str, changeStr) {
    if (allstr.substring(start, end) == str) {
        return allstr.substring(0, start) + changeStr + allstr.substring(end + 1, allstr.length + 2);
    }
    else {
        allstr;
    }
}
function allTableQuery(site, checkstatus) {
    var reTable;
    if (site == "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync") {
        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: { query: 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T ', format: 'votable', lang: 'ADQL' },
            async: false
        })
            .done(function (result) {
            var serialized;
            try {
                var serializer = void 0;
                serializer = new XMLSerializer();
                serialized = serializer.serializeToString(result);
                return serialized;
            }
            catch (e) {
                serialized = result.xml;
            }
        });
    }
    else {
        //By default, all are displayed.
        var checkvalue = 'SELECT DISTINCT T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'public\' OR T.schema_name =\'rr\' OR T.schema_name LIKE \'metaviz\'';
        if (checkstatus == true) {
            checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name, T.description FROM tap_schema.tables as T WHERE T.schema_name = \'public\' OR T.schema_name =\'rr\' OR T.schema_name LIKE \'metaviz\'';
        }
        reTable = $.ajax({
            url: "" + site,
            type: "GET",
            data: { query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery' },
            async: false
        })
            .done(function (result) {
            var serialized;
            try {
                var serializer = void 0;
                serializer = new XMLSerializer();
                serialized = serializer.serializeToString(result);
                return serialized;
            }
            catch (e) {
                serialized = result.xml;
            }
        });
    }
    return reTable;
}
/*
function allLinkQuery(site:string, checkStatus:boolean):object{//Get the from_table, target_table, from_column, target_column
  let reLink:any;
  let checkvalue:string = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
  if(checkStatus==true){
    checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
  }
  reLink = $.ajax({
    url: `${site}`,
    type: "GET",
    data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
    async:false
    })
  .done(function(result:any){
        let serialized:any;
        
        try{
            let serializer:any;
            serializer = new XMLSerializer();
            serialized=serializer.serializeToString(result);
            return serialized;
          }
          catch(e){
            serialized=result.xml;
        }
  })
  return reLink;
}*/
function allLinkLimitQuery(site, rootTable, checkstatus) {
    var reLink;
    var checkvalue = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id WHERE target_table = \'' + rootTable + '\' OR from_table = \'' + rootTable + '\'';
    if (checkstatus == true) {
        checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id WHERE target_table = \'' + rootTable + '\' OR from_table = \'' + rootTable + '\'';
    }
    reLink = $.ajax({
        url: "" + site,
        type: "GET",
        data: { query: "" + checkvalue, format: 'votable', lang: 'ADQL', request: 'doQuery' },
        async: false
    })
        .done(function (result) {
        var serialized;
        try {
            var serializer = void 0;
            serializer = new XMLSerializer();
            serialized = serializer.serializeToString(result);
            return serialized;
        }
        catch (e) {
            serialized = result.xml;
        }
    });
    return reLink;
}
/*
function allLink(site:string, checkStatus:boolean){
  let allLinkObject:any = allLinkQuery(site, checkStatus);
  let reTableRe:string;
  let everyLink:string[]=['a','b'];
  let allLink:string[][]=[[]];
  reTableRe = allLinkObject.responseText;
  var method = reTableRe.indexOf("base64");
  if(method!=-1){//The coding mode is "base64". //For Simbad and GAVO.
    reTableRe = reTableRe.replace(/<STREAM encoding="base64">/g, "haha");
    reTableRe = reTableRe.replace(/<STREAM encoding='base64'>\n/g, "haha");
    reTableRe = reTableRe.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g,"");
    reTableRe = reTableRe.match(/haha(\S*)xixi/)[1];
    let donnee:string;
    let donnee2:string[];
    donnee = atob(reTableRe).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
    donnee2=donnee.split("||||");
    for(let i:number=1;i<donnee2.length;i=i+5)
    {
      let tt:string= donnee2[i+1];
      if(tt.indexOf("rr")!=-1){
        tt=tt.replace(/rr./g,"");
      }
      let tc:string= donnee2[i+4];
      let ft:string= donnee2[i];
      if(ft.indexOf("rr")!=-1){
        ft=ft.replace(/rr./g,"");
      }
      let fc:string= donnee2[i+3];
      let k:number=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
  }
  if(method==-1){//The coding mode is normal. //For VizieR and CAOM.
    reTableRe=reTableRe.replace(/\s+/g,"");
    reTableRe= reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
    let donnee:string;
    let donnee2:string[];
    let donnee3:string[]=[];
    donnee = reTableRe.replace(/<TR><TD>/g, "@");
    donnee = donnee.replace(/<\/TD><\/TR>/g, "");
    donnee = donnee.replace(/<\/TD><TD>/g, "|")
    donnee2 = donnee.split('@')
    let h:number=0;
    for(let k:number=1;k<donnee2.length;k++){

      donnee3[h]=donnee2[k].split('|')[0];
      donnee3[h+1]=donnee2[k].split('|')[1];
      donnee3[h+2]=donnee2[k].split('|')[3];
      donnee3[h+3]=donnee2[k].split('|')[4];
      h=h+4;
    }
    for(let i:number=0;i<donnee3.length;i=i+4)
    {
      let tt:string= donnee3[i+1];
      if(tt.indexOf("metaviz")!=-1){
        tt=tt.replace(/metaviz./g,"");
      }
      console.log("#")
      console.log(tt)
      let tc:string= donnee3[i+3];
      let ft:string= donnee3[i];
      if(ft.indexOf("metaviz")!=-1){
        ft=ft.replace(/metaviz./g,"");
      }
      let fc:string= donnee3[i+2];
      let k:number=0;
      everyLink[k]=tt+'|'+tc;
      k=1;
      everyLink[k]=ft+'|'+fc;
      allLink.push(everyLink);
      everyLink=[];
    }
  }
  let allLinkRe:string[][]=[[]];
  let k:number=0;
  for(let h:number=1;h<allLink.length;h++)
  {
    allLinkRe[k]=allLink[h];
    k = k+1;
  }
  return allLinkRe;
}
*/
function allLinkLimit(site, rootTable, checkstatus) {
    //PARAMETER: site: website as astring; checkstatus: true(TOP 100), false(all)
    //RETURN: A 2-dimensional array. The array returns all the information related to the rootTable.
    var allLinkObject;
    if (site == "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync") {
        allLinkObject = allLinkLimitQuery(site, 'metaviz.' + rootTable, checkstatus);
    }
    else {
        allLinkObject = allLinkLimitQuery(site, rootTable, checkstatus);
    }
    var reTableRe;
    var everyLink = ['a', 'b'];
    var allLink = [[]];
    reTableRe = allLinkObject.responseText;
    var method = reTableRe.indexOf("base64");
    if (method != -1) {
        reTableRe = reTableRe.replace(/<STREAM encoding="base64">/g, "haha");
        reTableRe = reTableRe.replace(/<STREAM encoding='base64'>\n/g, "haha");
        reTableRe = reTableRe.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g, "");
        reTableRe = reTableRe.match(/haha(\S*)xixi/)[1];
        var donnee = void 0;
        var donnee2 = void 0;
        donnee = atob(reTableRe).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|");
        donnee2 = donnee.split("||||");
        for (var i = 1; i < donnee2.length; i = i + 5) {
            var tt = donnee2[i + 1];
            if (tt.indexOf("rr") != -1) {
                tt = tt.replace(/rr./g, "");
            }
            var tc = donnee2[i + 4];
            var ft = donnee2[i];
            if (ft.indexOf("rr") != -1) {
                ft = ft.replace(/rr./g, "");
            }
            var fc = donnee2[i + 3];
            var k_1 = 0;
            everyLink[k_1] = tt + '|' + tc;
            k_1 = 1;
            everyLink[k_1] = ft + '|' + fc;
            allLink.push(everyLink);
            everyLink = [];
        }
    }
    if (method == -1) {
        reTableRe = reTableRe.replace(/\s+/g, "#");
        reTableRe = reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
        var donnee = void 0;
        var donnee2 = void 0;
        var donnee3 = [];
        donnee = reTableRe.replace(/<TR><TD>/g, "|");
        donnee = donnee.replace(/<\/TD><\/TR>/g, "");
        donnee = donnee.replace(/<\/TD><TD>/g, "|");
        donnee = donnee.replace(/#/g, "");
        donnee2 = donnee.split('|');
        for (var j = 0; j < donnee2.length; j++) {
            donnee3[j] = donnee2[j + 1];
        }
        for (var h = 0; h < donnee3.length - 1; h = h + 5) {
            var tt = donnee3[h + 1];
            if (tt.indexOf("metaviz") != -1) {
                tt = tt.replace(/metaviz./g, "");
            }
            var tc = donnee3[h + 4];
            var ft = donnee3[h];
            if (ft.indexOf("metaviz") != -1) {
                ft = ft.replace(/metaviz./g, "");
            }
            var fc = donnee3[h + 3];
            var k_2 = 0;
            everyLink[k_2] = tt + '|' + tc;
            k_2 = 1;
            everyLink[k_2] = ft + '|' + fc;
            allLink.push(everyLink);
            everyLink = [];
        }
    }
    var allLinkRe = [[]];
    var k = 0;
    for (var h = 1; h < allLink.length; h++) {
        allLinkRe[k] = allLink[h];
        k = k + 1;
    }
    return allLinkRe;
}
function allTable(site, checkstatus) {
    //PARAMETER: site: website as astring; checkstatus: true(TOP 100), false(all)
    //RETURN: all the table's name.
    var allTableObject = allTableQuery(site, checkstatus); //Get all the tables
    var reTable;
    var allTable = [];
    reTable = allTableObject.responseText;
    var method = reTable.indexOf("base64");
    if (method != -1) {
        reTable = reTable.replace(/<STREAM encoding="base64">/g, "haha");
        reTable = reTable.replace(/<STREAM encoding='base64'>\n/g, "haha");
        reTable = reTable.replace(/\n<\/STREAM>/g, "xixi").replace(/\s+/g, "");
        reTable = reTable.match(/haha(\S*)xixi/)[1];
        var donnee = void 0;
        var donnee2 = void 0;
        donnee = atob(reTable).replace(/\u0000|\u0001|\u0002|\u0003|\u0004|\u0005|\u0006|\u0007|\u0008|\u0009|\u000a|\u000b|\u000c|\u000d|\u000e|\u000f|\u0010|\u0011|\u0012|\u0013|\u0014|\u0015|\u0016|\u0017|\u0018|\u0019|\u001a|\u001b|\u001c|\u001d|\u001e|\u001f|\u007F/g, "|"); //|\u0023|\u0027|\u0025|\u002F|\u0037|\u0032|\u0034|\u002E|\u002A|\u0029|\u003B|\u0030|\u0020|\u003A|\u0031|\u004C
        donnee = donnee.replace(/\|\|\|\|/g, "&");
        for (;;) {
            var start = donnee.indexOf("|||");
            donnee = changeString(donnee, start, start + 3, "|||", "||||");
            donnee = donnee.replace(/\|\|\|\|/g, "&");
            if (donnee.indexOf("|||") == -1) {
                break;
            }
        }
        donnee2 = donnee.split("&");
        for (var i = 1; i < donnee2.length; i = i + 1) {
            allTable.push(donnee2[i]);
        }
    }
    if (method == -1) {
        reTable = reTable.replace(/\s+/g, "#");
        reTable = reTable.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
        reTable = reTable.replace(/#/g, " ");
        var donnee = void 0;
        var donnee2 = void 0;
        donnee = reTable.replace(/<TR><TD>/g, "@");
        donnee = donnee.replace(/<\/TD><\/TR>/g, "");
        donnee = donnee.replace(/<\/TD><TD>/g, "@");
        donnee2 = donnee.split('@');
        for (var k = 1; k < donnee2.length; k++) {
            allTable.push(donnee2[k]);
        }
    }
    return allTable; //Return an array containing the names of the tables
}
function jsonResultAll(site, checkstatus) {
    //PARAMETER: site: website as astring; checkstatus: true(TOP 100), false(all)
    //RETURN: json object.
    var allTtable = [];
    var jsonAll = {};
    var columns = [];
    var constraints = "";
    /*if(site == "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync")
    {
      let allTheLink:string[][]=allLink(site,checkstatus);
      let list_exist:string[] = [];
      for(var i = 0; i < allTheLink.length;i++){
          let tt:string[] = allTheLink[i][0].split("|");
          let ft:string[] = allTheLink[i][1].split("|");
          if(list_exist.indexOf(tt[0])==-1){
            jsonAll[tt[0]] = VizieRJoin(allTheLink,tt[0]);
            list_exist.push(tt[0]);
          }
          if(list_exist.indexOf(ft[0])==-1){
            jsonAll[ft[0]] = VizieRJoin(allTheLink,ft[0]);
            list_exist.push(tt[0]);
          }
      }
    }
    else{*/
    allTtable = allTable(site, checkstatus); //Get the array containing the names of the tables.//Even number is the table name.
    for (var k = 0; k < allTtable.length; k = k + 2) {
        var arrLink = {};
        var arrLinkJoint = {};
        var alllink = [[]];
        var arrJoint = {};
        alllink = allLinkLimit(site, allTtable[k], checkstatus);
        if (alllink[0][0] == undefined) {
            continue;
        }
        else {
            var nowTable = allTtable[k].replace(/rr./g, ""); //delete the schema name of GAVO
            for (var i = 0; i < alllink.length; i++) {
                var tt = alllink[i][0].split("|");
                var ft = alllink[i][1].split("|");
                if (tt[0] == nowTable) {
                    arrLinkJoint["columns"] = columns;
                    arrLinkJoint["constraints"] = constraints;
                    arrLinkJoint["from"] = ft[1];
                    arrLinkJoint["target"] = tt[1];
                    arrLink[ft[0]] = arrLinkJoint;
                }
                ;
                if (ft[0] == nowTable) {
                    arrLinkJoint["columns"] = columns;
                    arrLinkJoint["constraints"] = constraints;
                    arrLinkJoint["from"] = tt[1];
                    arrLinkJoint["target"] = ft[1];
                    arrLink[tt[0]] = arrLinkJoint;
                }
                ;
            }
            arrJoint["description"] = allTtable[k + 1];
            arrJoint["join_tables"] = arrLink;
            jsonAll[nowTable] = arrJoint;
        }
    }
    return jsonAll;
}
/*
function VizieRJoin (allTheLink:string[][],rootTable:string){
  let arrLink:dic={};
  let arrLinkJoint:dic = {};
  let columns:string[] = [];
  let constraints:string = "";
  let arrJoint:dic = {};
  for(var i:number=0;i<allTheLink.length;i++){
    let tt:string[] = allTheLink[i][0].split("|");
    let ft:string[] = allTheLink[i][1].split("|");
    if(tt[0]==rootTable){
      arrLinkJoint["columns"]=columns;
      arrLinkJoint["constraints"] =constraints;
      arrLinkJoint["from"]=ft[1];
      arrLinkJoint["target"]=tt[1];
      arrLink[ft[0]]=arrLinkJoint;
    }
    if(ft[0]==rootTable){
      arrLinkJoint["columns"]=columns;
      arrLinkJoint["constraints"] =constraints;
      arrLinkJoint["from"]=tt[1];
      arrLinkJoint["target"]=ft[1];
      arrLink[tt[0]]=arrLinkJoint;
    }
  }
  arrJoint["join_tables"]=arrLink;
  return arrJoint;
}
*/
function readJson(jsonAll) {
    //PARAMETER: jsonAll: json object
    //RETURN: all the table's name.
    var rootTable = [];
    for (var key in jsonAll) {
        rootTable.push(key);
    }
    return rootTable;
}
function readJsonJoinAll(jsonAll, root) {
    //PARAMETER: jsonAll: json object; root: the main table.
    //RETURN: all the join table's name.
    var joinTable = [];
    for (var key in jsonAll[root].join_tables) {
        joinTable.push(key);
    }
    return joinTable;
}
function readJsonJoin(jsonAll, root) {
    //PARAMETER: jsonAll: json object, root: the main(root) table
    //RETURN: a string containing the html code
    var joinTable = "";
    var list_exist = [];
    list_exist.push(root);
    joinTable += "<B>" + root + "</B>" + "<br/>";
    for (var key in jsonAll[root].join_tables) {
        //joinTable += "<B>"+ root +"</B>"+ "<br/>";
        joinTable += "    " + key + "<br/>";
        if (list_exist.indexOf(key) == -1) {
            list_exist.push(key);
            joinTable += "<font color = \"#545454\">" + readJsonJoinTable(jsonAll, key, list_exist, 0) + "</font>";
        }
        //joinTable += "<br/>";
    }
    return joinTable;
}
function readJsonJoinTable(jsonAll, root, list_exist, flag) {
    //PARAMETER: jsonAll: json object; root: the main(root) table; list_exist: store the recorded table name; flag: record the number of recursions and format the output.
    //RETURN: a string containing the html code
    var joinTable = "";
    var flag2;
    flag2 = flag + 1;
    var space = "    ";
    for (var key in jsonAll[root].join_tables) {
        if (list_exist.indexOf(key) == -1) {
            for (var i = 0; i <= flag2; i++) {
                joinTable += space;
            }
            joinTable += key + "<br/>";
            list_exist.push(key);
            var table = void 0;
            var tableCut = void 0;
            table = readJsonJoinTable(jsonAll, key, list_exist, flag2); //question!!!
            tableCut = table.replace(/ /g, "");
            if (tableCut.length != 0) {
                joinTable += table;
            }
        }
    }
    return joinTable;
}
function getDescription(jsonAll, root) {
    //PARAMETER: jsonAll: json object, root: the main(root) table
    //RETURN: return the root table's description
    var description;
    description = jsonAll[root].description;
    return description;
}
function showAll(data) {
    //PARAMETER: data: json object
    //RETURN: a string containing the html code
    var rootTable = readJson(data);
    var joinTable = [];
    var output = "";
    for (var i = 0; i < rootTable.length; i++) {
        joinTable = readJsonJoinAll(data, rootTable[i]);
        output += "<B>" + rootTable[i] + "</B>" + " : " + "<font color = \"#545454\">" + getDescription(data, rootTable[i]) + "</font>" + "<br/>";
        for (var j = 0; j < joinTable.length; j++) {
            output += "    " + "<B>" + joinTable[j] + "</B>" + " : " + "<font color = \"#545454\">" + getDescription(data, joinTable[j]) + "</font>" + "<br/>";
        }
        output += "<br/>";
    }
    return output;
}
function mostUsed(data) {
    //PARAMETER: jsonAll: json object
    //RETURN: an array containing table's name.
    var mostUsedDic = {};
    var rootTable = readJson(data);
    var mostUsedTable = []; //the higher the front, the larger the number of jointable.
    for (var i = 0; i < rootTable.length; i++) {
        var count = 0;
        for (var key in data[rootTable[i]].join_tables) {
            count += 1;
        }
        mostUsedDic[rootTable[i]] = count;
    }
    if (mostUsedDic[rootTable[0]] < mostUsedDic[rootTable[1]]) {
        mostUsedTable[0] = rootTable[1];
        mostUsedTable[1] = rootTable[0];
    }
    else {
        mostUsedTable[0] = rootTable[0];
        mostUsedTable[1] = rootTable[1];
    }
    for (var h = 2; h < rootTable.length; h++) {
        mostUsedTable[h] = rootTable[h];
        for (var j = h - 1; j >= 0; j--) {
            var tempi = mostUsedDic[mostUsedTable[j + 1]];
            var tempj = mostUsedDic[mostUsedTable[j]];
            if (tempj >= tempi) {
                break;
            }
            else {
                var temp = mostUsedTable[j + 1];
                mostUsedTable[j + 1] = mostUsedTable[j];
                mostUsedTable[j] = temp;
            }
        }
    }
    return mostUsedTable;
}
