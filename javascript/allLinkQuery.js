var allLinkQuery = function (site, rootTable){
    var reLink;
    reLink = $.ajax({
        url: `${site}`,
        type: "GET",
        data: {query: 'SELECT  TOP 100  tap_schema.keys.from_table as from_table, tap_schema.keys.target_table as target_table,tap_schema.keys.key_id , tap_schema.key_columns.from_column, tap_schema.key_columns.target_column FROM tap_schema.keys JOIN tap_schema.key_columns ON tap_schema.keys.key_id = tap_schema.key_columns.key_id WHERE target_table = \''+rootTable+'\' OR from_table = \''+rootTable+'\'', format: 'votable', lang: 'ADQL', request :'doQuery'},
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
    return reLink;
}