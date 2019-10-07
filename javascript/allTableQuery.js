var allTableQuery = function (site){//Get the names of all the tables.
    var reTable;
    reTable = $.ajax({
        url: `${site}`,
        type: "GET",
        data: {query: 'SELECT DISTINCT TOP 100  T.table_name as table_name FROM tap_schema.tables as T WHERE T.schema_name = \'public\'', format: 'votable', lang: 'ADQL', request :'doQuery'},
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
            }
      })
    return reTable;
}