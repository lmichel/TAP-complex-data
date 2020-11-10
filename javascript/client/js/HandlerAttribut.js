class HandlerAttributs {
    constructor() {

        this.adql = "SELECT "
            + "TAP_SCHEMA.columns.column_name"
            + ",TAP_SCHEMA.columns.unit"
            + ",TAP_SCHEMA.columns.ucd"
            + ",TAP_SCHEMA.columns.utype"
            + ",TAP_SCHEMA.columns.dataType"
            + ",TAP_SCHEMA.columns.description"
            + " FROM TAP_SCHEMA.columns";
    }





}
HandlerAttributs.prototype.addAllColumn = function (table,schema){
    //alert(schema)

    if (schema == 'public' || schema == 'metaviz') {
        this.adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + table + "'";
        alert("ssss")
    }
    else {
        this.adql += " WHERE TAP_SCHEMA.columns.table_name = " + "'" + schema + "." + table + "'";
        alert("nnnnnnnnnn")
    }
    return this.adql;

}
