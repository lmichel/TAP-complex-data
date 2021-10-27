/* return the last node of file pathname
*/
if(!String.prototype.xtractFilename){
   String.prototype.xtractFilename = function(){
       var re = new RegExp(/(\w:)?([\/\\].*)*([\/\\](.*))/);
       var m = this.match(re);
       if( m == null ) {
           return {path: "", filename: this};
       }
       else {
           return {path: m[1], filename: m[m.length-1]};
       }
   } ;
}

/**
* Quotes the element of a data treepath which cannot be understood by SQL
* e.g. 
* test:
* 
 alert(
       'vizls.II/306/sdss8'.quotedTableName() + '\n' +
       'vizls.II/306/sdss8.OBS'.quotedTableName() + '\n' +
       'viz2.J/other/KFNT/15.483/jovsat'.quotedTableName() + '\n' +
       'viz2.J/other/KFNT/15.483/jovsat.OBS'.quotedTableName()+ '\n' +
       'viz2."J/other/KFNT/15.483/jovsat.OBS"'.quotedTableName()+ '\n' +
       '"viz2"."J/other/KFNT/15.483/jovsat.OBS"'.quotedTableName()+ '\n' +
       'J/other/KFNT/15.483/jovsat.OBS'.quotedTableName()+ '\n' +
       'ivoa.obcore.s_ra'.quotedTableName()

);
* Return an object {qualifiedName, tableName}
*/

if (!String.prototype.quotedTableName) {
   String.prototype.quotedTableName = function () {
       /*
        * Node without schema (astrogrid) may have en empty schema name 
        */
       var thisValue;
       if( this.startsWith(".") ) {
           thisValue = this.substring(1);
       } else {
           thisValue = this;
       }
       // list of reserved word in adql
       let reserved = [
            "year",
            "public",
            "position"
       ];

       /*
        * already quoted, nothing to do
        */
       if( thisValue.indexOf("\"") >= 0  ){
           return {qualifiedName: thisValue, tableName: thisValue};
       }
       var results = thisValue.split(".");
       var tbl = [];
       /*
        * One element: take it as as whole
        */
       if( results.length == 1 ) {
           tbl.push(results[0]);
       } 
       /*
        * a.b could be either schema.table or just a table name including a dot.
        */
       else if( results.length == 2 ) {
           /*
            * If the dot is followed by number, it cannot be a separator since a table name cannot start with number
            */
           if (results[1].match(/^[0-9].*/)) {
               tbl.push(thisValue);
           }
           /*
            * Otherwise there is no way to determine the matter, but we can suppose that we are dealing with Vizier
            * So, if both path elements contain a / we are having to do with a simple table name
            */
           else if( !results[0].match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ) {
               tbl.push(thisValue);
           } else {
               tbl.push(results[0]);
               tbl.push(results[1]);				
           }
           /*
            * In this case, we have to know if the first element is a schema or the first part of a table name
            * We suppose that schemas have regular names 
            */
       } else if (results.length > 2 ) {
           /*
            * Gamble on a schema name 
            */
           if(results[0].match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ) {
               tbl.push(results[0]);
               tbl.push(results[1]);
               var last = results[results.length -1];
               /*
                * The last one is certainly a field name
                */
               if( last.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) || last === "*" ) {
                   for (let i = 2; i < (results.length -1); i++) {
                       tbl[tbl.length - 1] += "." +results[i];
                   }	
                   tbl.push(last);
                } else {
                    for (let i = 2; i < results.length; i++) {
                        tbl[tbl.length - 1] += "." +results[i];
                    }
                }
           } else {
               tbl.push(thisValue);
           }
       }
       for (var j = 0; j < tbl.length; j++) {
           if ((!tbl[j].match(/^[a-zA-Z0-9][a-zA-Z0-9_]*$/) || reserved.includes(tbl[j]) ) && tbl[j] !== "*") {
               tbl[j] = '"' + tbl[j] + '"';
           }
       }		
       return {qualifiedName: tbl.join("."), tableName: tbl[tbl.length - 1]};
   };
}
/**
* Quotes the element of a data treepath which cannot be understood by SQL
* e.g. No longer used
* test:
* 
  alert(
       JSON.stringify('vizls.II/306/sdss8'.getTreepath()) + '\n' +
       JSON.stringify('vizls.II/306/sdss8.OBS'.getTreepath()) + '\n' +
       JSON.stringify('viz2.J/other/KFNT/15.483/jovsat'.getTreepath()) + '\n' +
       JSON.stringify('viz2.J/other/KFNT/15.483/jovsat.OBS'.getTreepath())+ '\n' +
       JSON.stringify('viz2."J/other/KFNT/15.483/jovsat.OBS"'.getTreepath())+ '\n' +
       JSON.stringify('"viz2"."J/other/KFNT/15.483/jovsat.OBS"'.getTreepath())+ '\n' +
       JSON.stringify( 'J/other/KFNT/15.483/jovsat.OBS'.getTreepath())+ '\n' +
       JSON.stringify('ivoa.obcore.s_ra'.getTreepath())
       );
);
*/
if (!String.prototype.getTreepath) {
   String.prototype.getTreepath = function () {
       var retour = {
               schema: '',
                tableorg: this.valueOf(),
                table: ''};
       var results = this.split(".");
       /*
        * One element: assumed to a table
        */
       if( results.length == 1 ) {
           retour.table = this.valueOf();			
       }

       /*
        * a.b could be either schema.table or just a table name including a dot.
        */
       else if( results.length == 2 ) {
           /*
            * If the dot is followed by number, it cannot be a separator since a table name cannot start with number
            */
           if (results[1].match(/^[0-9].*/)) {
               retour.table = this.valueOf();
           }
           /*
            * Otherwise there is no way to determine the matter, but we can suppose that we are dealing with Vizier
            * So, if both path elements contain a / we are having to do with a simple table name
            */
           else if( !results[0].match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ) {
               retour.table = this.valueOf();
           } else {
               retour.schema = results[0];
               retour.table = results[1];
           }
           /*
            * In this case, we have to know if the first element is a schema or the first part of a table name
            * We suppose that schemas have regular names 
            */
       } else if (results.length > 2 ) {
           /*
            * Gamble on a schema name 
            */
           if(results[0].match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ) {
               retour.schema = results[0];
               retour.table = results[1];
               var last = results[results.length -1];
               /*
                * The last one is certainly a field name
                */
               if( last.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) ) {
                   for (let i = 2; i < (results.length -1); i++) {
                       retour.table += "." +results[i];
                   }	
               } else {
                   for (let i = 2; i < results.length; i++) {
                       retour.table += "." +results[i];
                   }
               }
           } else {
               retour.table = this.valueOf();
           }
       }
       return retour;
   };

}

function unqualifyName(table,schema){
    if(table.indexOf(schema)!=-1){
        return table.substring(table.indexOf(".",table.indexOf(schema))+1,table.length);
    }
    return table;
}

if(!Array.prototype.remove){
    Array.prototype.remove = function(elem){
        const index = this.indexOf(elem);
        if (index > -1) {
            this.splice(index, 1);
        }
        return this;
    };
}

/**
 * @param{*} str : String the root query
 * @param{*} find : String the short string you search in the root query
 * @param{*} replace : String the replace value of the search element
 **/
 function replaceAll(str, find, replace) {
    let escapedFind = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}