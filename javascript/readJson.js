var readJson = function (jsonAll){
    var rootTable = [];
    for(var key in jsonAll)
    {
        rootTable.push(key)
    }
    return rootTable
}