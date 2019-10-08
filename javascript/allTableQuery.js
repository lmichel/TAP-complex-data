var allTableQuery = function (site,checkstatus){//Get the names of all the tables.
    var reTable;
    if(site == "https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/tap/sync")
    {
      reTable = $.ajax({
        url: `${site}`,
        type: "GET",
        //data: {query: 'SELECT DISTINCT TOP 100 T.table_name as table_name FROM tap_schema.tables as T WHERE T.schema_name NOT LIKE \'tap_schema\'', format: 'votable', lang: 'ADQL'},
        data: {query: 'SELECT%20DISTINCT%20TOP%20100%20T.table_name%20as%20table_name%20FROM%20tap_schema.tables%20as%20T%20WHERE%20T.schema_name%20NOT%20LIKE%20\'tap_schema\'', format: 'votable', lang: 'ADQL'},
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
    }
    else{
      var checkvalue = 'SELECT DISTINCT T.table_name as table_name FROM tap_schema.tables as T WHERE T.schema_name = \'public\' OR T.schema_name =\'rr\' OR T.schema_name LIKE \'viz%\'';
      if(checkstatus==true){
        checkvalue = 'SELECT DISTINCT TOP 100 T.table_name as table_name FROM tap_schema.tables as T WHERE T.schema_name = \'public\' OR T.schema_name =\'rr\' OR T.schema_name LIKE \'viz%\'';
      }
      console.log(checkstatus);
      reTable = $.ajax({
        url: `${site}`,
        type: "GET",
        data: {query: `${checkvalue}`, format: 'votable', lang: 'ADQL', request :'doQuery'},
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
    }
    return reTable;
}