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
function allLinkQuery(site, checkStatus) {
    var reLink;
    var checkvalue = 'SELECT tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
    if (checkStatus == true) {
        checkvalue = 'SELECT TOP 100 tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id';
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
function allLink(site, checkStatus) {
    var allLinkObject = allLinkQuery(site, checkStatus);
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
        reTableRe = reTableRe.replace(/\s+/g, "");
        reTableRe = reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
        var donnee = void 0;
        var donnee2 = void 0;
        var donnee3 = [];
        donnee = reTableRe.replace(/<TR><TD>/g, "@");
        donnee = donnee.replace(/<\/TD><\/TR>/g, "");
        donnee = donnee.replace(/<\/TD><TD>/g, "|");
        donnee2 = donnee.split('@');
        var h = 0;
        for (var k_2 = 1; k_2 < donnee2.length; k_2++) {
            donnee3[h] = donnee2[k_2].split('|')[0];
            donnee3[h + 1] = donnee2[k_2].split('|')[1];
            donnee3[h + 2] = donnee2[k_2].split('|')[3];
            donnee3[h + 3] = donnee2[k_2].split('|')[4];
            h = h + 4;
        }
        for (var i = 0; i < donnee3.length; i = i + 4) {
            var tt = donnee3[i + 1];
            var tc = donnee3[i + 3];
            var ft = donnee3[i];
            var fc = donnee3[i + 2];
            var k_3 = 0;
            everyLink[k_3] = tt + '|' + tc;
            k_3 = 1;
            everyLink[k_3] = ft + '|' + fc;
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
function allLinkLimit(site, rootTable, checkstatus) {
    var allLinkObject = allLinkLimitQuery(site, rootTable, checkstatus);
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
            var k_4 = 0;
            everyLink[k_4] = tt + '|' + tc;
            k_4 = 1;
            everyLink[k_4] = ft + '|' + fc;
            allLink.push(everyLink);
            everyLink = [];
        }
    }
    if (method == -1) {
        reTableRe = reTableRe.replace(/\s+/g, "");
        reTableRe = reTableRe.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
        var donnee = void 0;
        var donnee2 = void 0;
        donnee = reTableRe.replace(/<TR><TD>/g, "@");
        donnee = donnee.replace(/<\/TD><\/TR>/g, "");
        donnee = donnee.replace(/<\/TD><TD>/g, "|");
        donnee2 = donnee.split('@');
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
        reTable = reTable.replace(/\s+/g, "");
        reTable = reTable.match(/<TABLEDATA>(\S*)<\/TABLEDATA>/)[1];
        var donnee = void 0;
        var donnee2 = void 0;
        donnee = reTable.replace(/<TR><TD>/g, "@");
        donnee = donnee.replace(/<\/TD><\/TR>/g, "");
        donnee = donnee.replace(/<\/TD><TD>/g, "|");
        donnee2 = donnee.split('@');
        for (var k = 1; k < donnee2.length; k++) {
            allTable.push(donnee2[k]);
        }
    }
    return allTable; //Return an array containing the names of the tables
}
function jsonResultAll(site, checkstatus) {
    var allTtable = [];
    var jsonAll = {};
    var columns = [];
    var constraints = "";
    if (site == "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync") {
        var allTheLink = allLink(site, checkstatus);
        var list_exist = [];
        for (var i = 0; i < allTheLink.length; i++) {
            var tt_1 = allTheLink[i][0].split("|");
            var ft_1 = allTheLink[i][1].split("|");
            if (list_exist.indexOf(tt_1[0]) == -1) {
                jsonAll[tt_1[0]] = VizieRJoin(allTheLink, tt_1[0]);
                list_exist.push(tt_1[0]);
            }
            if (list_exist.indexOf(ft_1[0]) == -1) {
                jsonAll[ft_1[0]] = VizieRJoin(allTheLink, ft_1[0]);
                list_exist.push(tt_1[0]);
            }
        }
    }
    else {
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
                var nowTable = allTtable[k].replace(/rr./g, "");
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
    }
    return jsonAll;
}
function VizieRJoin(allTheLink, rootTable) {
    var arrLink = {};
    var arrLinkJoint = {};
    var columns = [];
    var constraints = "";
    var arrJoint = {};
    for (var i = 0; i < allTheLink.length; i++) {
        var tt = allTheLink[i][0].split("|");
        var ft = allTheLink[i][1].split("|");
        if (tt[0] == rootTable) {
            arrLinkJoint["columns"] = columns;
            arrLinkJoint["constraints"] = constraints;
            arrLinkJoint["from"] = ft[1];
            arrLinkJoint["target"] = tt[1];
            arrLink[ft[0]] = arrLinkJoint;
        }
        if (ft[0] == rootTable) {
            arrLinkJoint["columns"] = columns;
            arrLinkJoint["constraints"] = constraints;
            arrLinkJoint["from"] = tt[1];
            arrLinkJoint["target"] = ft[1];
            arrLink[tt[0]] = arrLinkJoint;
        }
    }
    arrJoint["join_tables"] = arrLink;
    return arrJoint;
}
function readJson(jsonAll) {
    var rootTable = [];
    for (var key in jsonAll) {
        rootTable.push(key);
    }
    return rootTable;
}
var readJsonJoinAll = function (jsonAll, root) {
    var joinTable = [];
    for (var key in jsonAll[root].join_tables) {
        joinTable.push(key);
    }
    return joinTable;
};
function readJsonJoin(jsonAll, root) {
    var joinTable = "";
    var list_exist = [];
    list_exist.push(root);
    for (var key in jsonAll[root].join_tables) {
        joinTable += root + "<br/>";
        joinTable += "    " + key + "<br/>";
        if (list_exist.indexOf(key) == -1) {
            list_exist.push(key);
            joinTable += "  " + readJsonJoinTable(jsonAll, key, list_exist) + "<br/>";
        }
    }
    return joinTable;
}
function readJsonJoinTable(jsonAll, root, list_exist) {
    var joinTable = "";
    for (var key in jsonAll[root].join_tables) {
        if (list_exist.indexOf(key) == -1) {
            joinTable += "      3" + key + "<br/>";
            list_exist.push(key);
            var table = void 0;
            var tableCut = void 0;
            table = readJsonJoinTable(jsonAll, key, list_exist);
            console.log(table);
            tableCut = table.replace(/ /g, "");
            if (tableCut.length != 0) {
                joinTable += "    4" + table + "<br/>";
            }
        }
    }
    return joinTable;
}
function getDescription(jsonAll, root) {
    var description;
    description = jsonAll[root].description;
    return description;
}
