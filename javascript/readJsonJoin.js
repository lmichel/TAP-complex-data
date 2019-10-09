var readJsonJoin = function (jsonAll,root){
    var joinTable = [];
    for(var key in jsonAll[root].join_tables)
    {
        joinTable.push(key);
    }
    return joinTable;
}