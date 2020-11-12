class HandlerAttributs {
    constructor() {


    }





}
HandlerAttributs.prototype.addAllColumn = function (table,schema){
    //alert(schema)
    var adql = "SELECT "
        + "TAP_SCHEMA.columns.column_name"
        + ",TAP_SCHEMA.columns.unit"
        + ",TAP_SCHEMA.columns.ucd"
        + ",TAP_SCHEMA.columns.utype"
        + ",TAP_SCHEMA.columns.dataType"
        + ",TAP_SCHEMA.columns.description"
        + " FROM TAP_SCHEMA.columns";
    if (schema == 'public' || schema == 'metaviz') {
         adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + table + "'";

    }
    else {
         adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + schema + "." + table + "'";

    }
    return  adql;

}
