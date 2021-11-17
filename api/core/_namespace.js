if (typeof utils === "undefined") {
    throw "JW requires utils to be loaded";
}

var jw = {
    Api : undefined,
    KnowledgeTank : undefined,
    core:{
        AttributeHolder : undefined,
        JsonAdqlBuilder : undefined,
        ServiceConnector : undefined,
        ServiceRequest : undefined,
        VOTableTools : undefined,
    },
    widget:{}
};
