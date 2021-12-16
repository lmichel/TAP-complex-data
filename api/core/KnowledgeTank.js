"use strict;";

if (typeof jw === "undefined") {
    //James Waiter
    var jw = {};
}

jw.KnowledgeTank = (function(){
    KnowledgeTank = function(){
        /**
         * Support [*] and [[0-9]+] operator at the end of both ucd and field name
         * if applied to field to field name then it describe how many ucds are allowed at most.
         * if applied to ucd it describe how many AH can be selescted at most for this ucd
         * the [*] operator set the maximum to Number.MAX_VALUE
         * if not specifyed it is equivalent to [1]
         * ie : "field[2]" : ["ucd1","ucd2[4]","ucd3"]
         * mean that AH for both ucd2 and ucd3 can be selected if no AH is found for ucd1 or both ucd1 and ucd2 or ucd1 and ucd3
         * at most 4 AH can be selected based on the criteria of ucd2 but if at least one is found it may lock ucd3 from being selected if ucd1 has been selected.
         */
        this.ucdStorage = {
            "name":["meta.id;meta.main","meta.id;src","meta.main"],
            "position" : ["pos;meta.main","pos"],
            "longitude": ["pos.eq.ra;meta.main", "pos.gal.lon;meta.main","pos.eq.ra", "pos.gal.lon"],
            "latitude": ["pos.eq.dec;meta.main", "pos.gal.lat;meta.main","pos.eq.dec", "pos.gal.lat"],
            "brightness" : ["phys.luminosity;meta.main","phot.mag;meta.main","phys.flux;meta.main","phot.count;meta.main"],
            "bibliography[*]" : ["meta.bib.author","meta.record","meta.bib.bibcode","meta.bib.journal","meta.title","meta.bib"],
            "object_class" : ["src.class[*]"],
            "unit":["meta.unit;meta.main","meta.unit"],
            "description": ["meta.note;instr.filter"]
        };

        this.utypeKeyword = ["description","name","coordinates","standardid","referenceurl","accessurl"];

        this.serviceDescriptors = { 
            "Simbad" : {
                "tapService" : "//simbad.u-strasbg.fr/simbad/sim-tap/sync",
                "schema" : "public",
                "table" : "basic"
            },
            
            "Gavo" : {
                "tapService" : "//dc.zah.uni-heidelberg.de/tap/sync",
                "schema" : "rr",
                "table" : "resource"
            },
        
            "CAOM" : {
                "tapService" : "//vao.stsci.edu/CAOMTAP/tapservice.aspx/sync",
                "schema" : "dbo",
                "table" : "CaomObservation"
            },
            
            "4XMM" : {
                "tapService" : "https://xcatdb.unistra.fr/4xmmdr10/tap/sync",
                "schema" : "ivoa",
                "table" : "ObsCore"
            },
            "provtap" : {
                "tapService" : "//saada.unistra.fr/provtap/sync",
                "schema" : "provenance",
                "table" : "entity"
            },
            
            "Vizier" : {
                "tapService" : "//tapvizier.cds.unistra.fr/TAPVizieR/tap/sync",
                "schema" : "metaviz",
                "table" : "METAcat"
            }
        };

        this.presetValues = {

        };

        this.tapSchemaTables = {
            "key_columns": {
                "description": "List all foreign keys but provides just the columns linked by the foreign key. To know the table of these columns, see in TAP_SCHEMA.keys using the key_id.",
                "columns": [],
                "type": "table"
            },
            "schemas": {
                "description": "List of schemas published in this TAP service.",
                "columns": [],
                "type": "table"
            },
            "keys": {
                "description": "List all foreign keys but provides just the tables linked by the foreign key. To know which columns of these tables are linked, see in TAP_SCHEMA.key_columns using the key_id.",
                "columns": [],
                "type": "table"
            },
            "tables": {
                "description": "List of tables published in this TAP service.",
                "columns": [],
                "type": "table"
            },
            "columns": {
                "description": "List of columns of all tables listed in TAP_SCHEMA.TABLES and published in this TAP service.",
                "columns": [],
                "type": "table"
            }
        };

        this.tapSchemaJoins = [
            {
                from: { table: "schemas", column: "schema_name" },
                target: { table: "tables", column: "schema_name" }
            },
            {
                from: { table: "keys", column: "key_id" },
                target: { table: "key_columns", column: "key_id" }
            },
            {
                from: { table: "tables", column: "table_name" },
                target: { table: "keys", column: "from_table" }
            },
            /*{ // this type of double joins aren't supported yet
                from: { table: "tables", column: "table_name" },
                target: { table: "keys", column: "target_table" }
            },*/
        ];

        // list of hopefully all SQL keywords in upper case
        this.sqlKeyWord = [
            "ABS",
            "ABSOLUTE","ACTION","ADD","AFTER","ALL","ALLOCATE","ALTER","AND","ANY","ARE","ARRAY","AS","ASC","ASENSITIVE","ASSERTION","ASYMMETRIC","AT",
            "ATOMIC","AUTHORIZATION","AVG","BEFORE","BEGIN","BETWEEN","BIGINT","BINARY","BIT","BIT_LENGTH","BLOB","BOOLEAN","BOTH","BREADTH","BY","CALL",
            "CALLED","CARDINALITY","CASCADE","CASCADED","CASE","CAST","CATALOG","CEIL","CEILING","CHAR","CHARACTER","CHARACTER_LENGTH","CHAR_LENGTH","CHECK","CLOB",
            "CLOSE","COALESCE","COLLATE","COLLATION","COLLECT","COLUMN","COMMIT","CONDITION","CONNECT","CONNECTION","CONSTRAINT","CONSTRAINTS","CONSTRUCTOR",
            "CONTINUE","CONVERT","CORR","CORRESPONDING","COUNT","COVAR_POP","COVAR_SAMP","CREATE","CROSS","CUBE","CUME_DIST","CURRENT","CURRENT_DATE",
            "CURRENT_DEFAULT_TRANSFORM_GROUP","CURRENT_PATH","CURRENT_ROLE","CURRENT_TIME","CURRENT_TIMESTAMP","CURRENT_TRANSFORM_GROUP_FOR_TYPE","CURRENT_USER",
            "CURSOR","CYCLE","DATA","DATE","DAY","DEALLOCATE","DEC","DECIMAL","DECLARE","DEFAULT","DEFERRABLE","DEFERRED","DELETE","DENSE_RANK","DEPTH",
            "DEREF","DESC","DESCRIBE","DESCRIPTOR","DETERMINISTIC","DIAGNOSTICS","DISCONNECT","DISTINCT","DO","DOMAIN","DOUBLE","DROP","DYNAMIC","EACH",
            "ELEMENT","ELSE","ELSEIF","END","END-EXEC","EQUALS","ESCAPE","EVERY","EXCEPT","EXCEPTION","EXEC","EXECUTE","EXISTS","EXIT","EXP","EXTERNAL",
            "EXTRACT","FALSE","FETCH","FILTER","FIRST","FIRST_VALUE","FLOAT","FLOOR","FOR","FOREIGN","FOUND","FREE","FROM","FULL","FUNCTION","FUSION","GENERAL",
            "GET","GLOBAL","GO","GOTO","GRANT","GROUP","GROUPING","HANDLE","HAVING","HOLD","HOUR","IDENTITY","IF","IGNORE","IMMEDIATE","IN","INDICATOR","INITIALLY",
            "INNER","INOUT","INPUT","INSENSITIVE","INSERT","INT","INTEGER","INTERSECT","INTERSECTION","INTERVAL","INTO","IS","ISOLATION","JOIN","KEY","LAG",
            "LANGUAGE","LARGE","LAST","LAST_VALUE","LATERAL","LEAD","LEADING","LEAVE","LEFT","LEVEL","LIKE","LN","LOCAL","LOCALTIME","LOCALTIMESTAMP","LOCATOR",
            "LOOP","LOWER","MAP","MATCH","MAX","MEMBER","MERGE","METHOD","MIN","MINUTE","MOD","MODIFIES","MODULE","MONTH","MULTISET","NAMES","NATIONAL","NATURAL",
            "NCHAR","NCLOB","NESTING","NEW","NEXT","NO","NONE","NORMALIZE","NOT","NTH_VALUE","NTILE","NULL","NULLIF","NULLS","NUMERIC","OBJECT","OCTET_LENGTH","OF",
            "OFFSET","OLD","ON","ONLY","OPEN","OPTION","OR","ORDER","ORDINALITY","OUT","OUTER","OUTPUT","OVER","OVERLAPS","OVERLAY","PAD","PARAMETER","PARTIAL",
            "PARTITION","PATH","PERCENTILE_CONT","PERCENTILE_DISC","PERCENT_RANK","POSITION","POWER","PRECISION","PREPARE","PRESERVE","PRIMARY","PRIOR","PRIVILEGES",
            "PROCEDURE","PUBLIC","RANGE","RANK","READ","READS","REAL","RECURSIVE","REDO","REF","REFERENCES","REFERENCING","REGR_AVGX","REGR_AVGY","REGR_COUNT",
            "REGR_INTERCEPT","REGR_R2","REGR_SLOPE","REGR_SXX","REGR_SXY","REGR_SYY","RELATIVE","RELEASE","REPEATE","RESIGNAL","RESPECT","RESTRICT","RESULT",
            "RETURN","RETURNS","REVOKE","RIGHT","ROLE","ROLLBACK","ROLLUP","ROUTINE","ROW","ROWS","ROW_NUMBER","SAVEPOINT","SCHEMA","SCOPE","SCROLL","SEARCH",
            "SECOND","SECTION","SELECT","SENSITIVE","SESSION","SESSION_USER","SET","SETS","SIGNAL","SIMILAR","SIZE","SMALLINT","SOME","SPACE","SPECIFIC",
            "SPECIFICTYPE","SQL","SQLCODE","SQLERROR","SQLEXCEPTION","SQLSTATE","SQLWARNING","SQRT","START","STATE","STATIC","STDDEV_POP","STDDEV_SAMP","SUBMULTISET",
            "SUBSTRING","SUM","SYMMETRIC","SYSTEM","SYSTEM_USER","TABLE","TABLESAMPLE","TEMPORARY","THEN","TIME","TIMESTAMP","TIMEZONE_HOUR","TIMEZONE_MINUTE","TO",
            "TRAILING","TRANSACTION","TRANSLATE","TRANSLATION","TREAT","TRIGGER","TRIM","TRIM_ARRAY","TRUE","UESCAPE","UNDER","UNDO","UNION","UNIQUE","UNKNOWN","UNNEST",
            "UNTIL","UPDATE","UPPER","USAGE","USER","USING","VALUE","VALUES","VARCHAR","VARYING","VAR_POP","VAR_SAMP","VIEW","WHEN","WHENEVER","WHERE","WHILE",
            "WIDTH_BUCKET","WINDOW","WITH","WITHIN","WITHOUT","WORK","WRITE","YEAR","ZONE",
        ];
    };

    KnowledgeTank.prototype.setPresetValue = function(AHList){
        let preset;
        for (let i =0;i<AHList.length;i++){
            preset = this.presetValues[AHList[i].db_name + "." + AHList[i].column_name];
            if(preset !== undefined){
                AHList[i].default_value = preset.default_value;
                AHList[i].available_value = preset.available_value;
            }
        }
        return {"status":true,"AHList":AHList};
    };

    KnowledgeTank.prototype.getDescriptors = function(){
        return {"status":true,"descriptors": this.serviceDescriptors};
    };

    /**
     * will select AH based on criteria described in the ucdStorage object.
     * @param {Array} AHList list of Attributes handlers to select from
     */
    KnowledgeTank.prototype.selectAH = function(AHList){
        let selected = {};
        let j,i,maxSelect,curr = 0,ucd,maxField,counter,ucds;

        for (let fType in this.ucdStorage){

            i=0;
            counter = 0;
            ucds =  this.ucdStorage[fType];
            maxField = 1;

            // [*] and [[0-9]+] operator handling for the number of ucds per field
            if(fType.endsWith("[*]")){
                fType = fType.substring(0,fType.length-3);
                maxField = Number.MAX_VALUE;
            }else if(fType.match(/\[[0-9]+\]$/)){
                maxField = +fType.substring(fType.lastIndexOf("[")+1,fType.length-1);
                fType = fType.substring(0,fType.lastIndexOf("["));
            }

            if(selected.position === undefined || (fType != "longitude" && fType != "latitude" )){
                while(i<ucds.length && maxField>0){
                    ucd =ucds[i];
                    curr = 0;
                    maxSelect = 1;
                    // [*] and [[0-9]+] operator handling for the number of AH per ucd
                    if(ucd.endsWith("[*]")){
                        ucd = ucd.substring(0,ucd.length-3);
                        maxSelect = Number.MAX_VALUE;
                    }else if(ucd.match(/\[[0-9]+\]$/)){
                        maxSelect = +ucd.substring(ucd.lastIndexOf("[")+1,ucd.length-1);
                        ucd = ucd.substring(0,ucd.lastIndexOf("["));
                    }

                    for (j=0;j<AHList.length;j++){
                        if(AHList[j].ucd == ucd && curr<maxSelect){
                            selected[fType+(""+counter)] = AHList[j];
                            curr++;
                            counter++;
                        }
                    }
                    if(curr>0){
                        maxField--;
                    }
                    i++;
                }
            }
        }

        let selectedAH = [];
        for (let key in selected){
            selectedAH.push(selected[key]);
        }
        return {"status" : true,"selected":selectedAH};
    };

    /**
     * will select AH based on keywords described in the utypeKeyword object.
     * @param {Array} AHList list of Attributes handlers to select from
     */
    KnowledgeTank.prototype.selectAHByUtypes = function(AHList){
        let selected = [],i,j;
        for (i=0;i<AHList.length;i++){
            for(j=0;j<this.utypeKeyword.length;j++){
                if(AHList[i].utype.toLowerCase().includes(this.utypeKeyword[j])){
                    selected.push(AHList[i]);
                }
            }
        }
        return {"status" : true,"selected":Array.from(new Set(selected))};
    };

    return new KnowledgeTank();
    
})();