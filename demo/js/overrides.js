function override(){
    MetadataSource = function() {
        var getMetaTableUrl = null;
        var getJoinedTablesUrl = null;
        var isAjaxing = false;
        /*
         * buffer = {  dataTreePath
         *   hamap <== map of ah
         *   targets:[{target_datatreepath, source columns, target column}...]
         *
         * cache = map<DataTreePath.key, buffer>
         */
        var cache = new Object;
        /**
         * private methods
         */
        /*
         * setAttMap: Normalize AHs and store them in the buffer
         */
        var buildAttMap = function (data){
            var hamap  = new Array();
            if( data.attributes ) {
                for( var i=0 ; i<data.attributes.length ; i++ ){
                    var ah = data.attributes[i];
                    /*
                     * Make sure that all naming fields are populated
                     * if possible:
                     */
                    if( !ah.nameattr && ah.column_name  ) {
                        ah.nameattr = ah.column_name;
                    } else if( ah.nameattr && !ah.column_name ) {
                        ah.column_name = ah.nameattr ;
                    }
                    if( !ah.nameattr  && ah.nameorg ){
                        ah.nameattr = ah.nameorg ;
                        ah.column_name = ah.nameorg ;
                    } else if (!ah.nameorg ) {
                        ah.nameorg = ah.nameattr ;
                    }
                    hamap.push(ah);
                }
            } 
            return hamap;
        };
        /**
         * public methods
         */
        /**
         * init(): params : {getMetaTable, getJoinedTables, getUserGoodie}
         */
        var init = function (params) {
            if( 'getMetaTable' in params ){
                getMetaTableUrl = params.getMetaTable;
            }
            if( 'getJoinedTables' in params ){
                getJoinedTablesUrl = params. getJoinedTables;
            }
            if( 'getUserGoodie' in params ){
                getUserGoodieUrl = params.getUserGoodie;
            }
        };
        /**
         * dataTreePath: instance of the classe DataTreePath
         * handler(data) called when requested datra are retreived. 
         * These data are passed as parameter {ahmap
         */
        var getTableAtt =  function(dataTreePath /* instance of DataTreePath */, handler){
            /*
             * Query a new node
             */
            //key = JSON.stringify(dataTreePath) ;
            key = dataTreePath.key;
            if(  cache[key] == undefined ) {
                var buffer = {};
                buffer.dataTreePath = dataTreePath;		
                buffer.hamap        = new Array();
                buffer.relations    = new Array(); // utilisees par Saada
                buffer.classes      = new Array(); // utilisees par Saada
                buffer.targets      = new Array();
                if( getMetaTableUrl != null ) {
                    isAjaxing = true;
                    Out.info("Connect new node  " + key);
    
                    var params = {jsessionid: this.sessionID, nodekey: buffer.dataTreePath.nodekey, schema:buffer.dataTreePath.schema, table:buffer.dataTreePath.table};
                    Processing.show("Get column description of table " +JSON.stringify(dataTreePath) );
                    $.ajax({
                        url: getMetaTableUrl,
                        dataType: 'json',
                        async: false,
                        data: params,
                        success:  function(data)  {
                            Processing.hide();
                            if( !Processing.jsonError(data)) {
                                buffer.hamap = buildAttMap(data);
                                if( data.relations!= undefined ){
                                    buffer.relations = data.relations;
                                } else{
                                    buffer.relations = [];
                                }
                                if( data.classes!= undefined ){
                                    buffer.classes = data.classes;
                                } else{
                                    buffer.classes = [];
                                }
                                isAjaxing = false;
                                cache[key] = buffer;
                            }
                        }
                    });
    
                    if( getJoinedTablesUrl != null) {
                        Processing.show("Waiting on join keys " + getJoinedTablesUrl);
                        $.ajax({
                            url: getJoinedTablesUrl,
                            dataType: 'json',
                            async: false,
                            data: params,
                            success:  function(jdata)  {
                                Processing.hide();
                                if( jdata && !jdata.errormsg )  {
                                    var dt = jdata.targets;			
                                    for( var i=0 ; i<dt.length ; i++ ) {
                                        var t = dt[i];
                                        var st = t.target_table.split('.');
                                        var schema, table;
                                        if( st.length > 1) {
                                            schema =  st[0]; table = st[1];
                                        } else {										
                                            schema =  dataTreePath.schema; table = st[0];
                                        }
                                        var tdtp = new DataTreePath({nodekey: dataTreePath.nodekey, schema: schema, table: table});
                                        buffer.targets.push({target_datatreepath: tdtp, target_column: t.target_column, source_column: t.source_column});
                                    }
                                } else {
                                    Out.info((jdata == null)? 'Empty data' : jdata.errormsg);
                                }
                                isAjaxing = false;
                                cache[key] = buffer;
                                if( handler != null ) handler(cache[key]);
                            }
                        });
                    }  else {
                        if( handler != null ) handler(cache[key]);
                    }
                }
                console.log(JSON.stringify(cache[key]));
                return cache[key];
                /*
                 * Meta data are in the cache
                 */
            } else  {
                Out.info("get stored node  " + JSON.stringify(dataTreePath) + " length = " + cache[key].hamap.length);
                if( handler!= null ) handler(cache[key]); else Out.info("No handler");
                return cache[key];
            }
        };
        var getRelations =  function(dataTreePath /* instance of DataTreePath */){
            if( cache[dataTreePath.key] == undefined )
                this.getTableAtt(dataTreePath);
            return cache[dataTreePath.key].relations;
        };
        var getClasses =  function(dataTreePath /* instance of DataTreePath */){
            if( cache[dataTreePath.key] == undefined )
                this.getTableAtt(dataTreePath);
            return cache[dataTreePath.key].classes;
        };
        
        var test =  function(){
            MetadataSource.init({getMetaTable: "gettableatt", getJoinedTables: "gettablejoin", getUserGoodie: null});
            var dataTreePath = new DataTreePath({nodekey:'node', schema: 'schema', table: 'table', tableorg: 'schema.table'});
            MetadataSource.getTableAtt(
                    dataTreePath
                    , function() {
                        console.log("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
                        console.log("joinedTables " + JSON.stringify(MetadataSource.joinedTables(dataTreePath)));	
                        //	alert("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
                    });
            MetadataSource.getTableAtt(
                    dataTreePath
                    , function() {
                        console.log("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
                        console.log("joinedTables " + JSON.stringify(MetadataSource.joinedTables(dataTreePath)));	
                        //	alert("ahMap "        + JSON.stringify(MetadataSource.ahMap(dataTreePath)));
                    });
        };
    
        var getJoinedTables =  function(){};
        var getUserGoodie =  function(){};
        var setJobColumns =  function(){};
    
        /*
         * exports
         */
        var pblc = {};
        pblc.ahMap        = function(dataTreePath){return(!cache)?null: cache[dataTreePath.key].hamap;};
        pblc.relations        = function(dataTreePath){return(!cache)?null: cache[dataTreePath.key].relation;};
        pblc.joinedTables = function(dataTreePath){return(!cache)?null: cache[dataTreePath.key].targets;};
        pblc.init = init;
        pblc.getTableAtt = getTableAtt;
        pblc.getRelations = getRelations;
        pblc.getClasses = getClasses;
        pblc.getJoinedTables = getJoinedTables;
        pblc.getUserGoodie = getUserGoodie;
        pblc.setJobColumns = setJobColumns;
        pblc.test = test;
        pblc.vars = {"cache":cache};
        return pblc;	
    }();
}