"use strict;";

var TapService = /** @class */ (function () {
    function TapService(url) {
        this.url = url;
    }

    /***
     * Receive adql, return votable objects
     * @params String :receive adql statements and perform queries
     * @returns :votable object, result of adql query
     */
    TapService.prototype.query = async function (adql) {
        try {
        
            var site = this.url;
            var correctFormat = "votable";
            var reTable;
            if (this.url == "http://simbad.u-strasbg.fr/simbad/sim-tap/sync" || this.url == "http://dc.zah.uni-heidelberg.de/tap/sync") {
                correctFormat = "votable";
            } else {
                correctFormat = "votable";
            }
            console.log("Async AJAXurl: " + site + " query: " + adql);

            reTable = $.ajax({
                    url: "" + site,
                    type: "GET",
                    data: {query: "" + adql, format: correctFormat, lang: 'ADQL', request: 'doQuery'},
                });
            
            let output = {};
            reTable.then((value)=>{
                try {
                    output.status = 200;
                    output.statusText = "OK";
                    output.responseText = new XMLSerializer().serializeToString(value);
                    output.responseXML = value;
                } catch (error) {
                    output.status = 0;
                    output.statusText = error.toString();
                }
                
            });

            try {
                await reTable;
            } catch (error) {
                output = error;
            }
            // just because some services always send a status of 200 even if the request failed
            let status = $("INFO[name=\"QUERY_STATUS\"]",output.responseXML)[0];
            if(status !== undefined){
                if(status.attributes.value.value == "ERROR"){
                    output.status = 400;
                    output.statusText = $("INFO[name=\"QUERY_STATUS\"]",output.responseXML)[0].textContent;
                }
            }

            if (output.status === 200){
                dataTable = VOTableTools.votable2Rows(output);
                let fields = VOTableTools.genererField(output,output.responseText);
                let nbCols = fields.length;
                let singleArrayValue = [];
                let doubleArrayValue = [];
                let col;
                if(nbCols <1 && dataTable.length > 0){
                    return {"status" : false , "error":{"logs" :"Error in columns parsing" } };
                }
                for (let rowNb = 0; rowNb < dataTable.length; rowNb += nbCols) {
                    for (col = 0; col < nbCols; col++) {
                        singleArrayValue.push(dataTable[rowNb+col]);
                    }
                    doubleArrayValue.push(singleArrayValue);

                    singleArrayValue = [];
                }

                return {"status" : true , "field_values" :doubleArrayValue,"field_names":fields,"answer":output};

            } else {
                console.error(output);
                return {"status":false,"error":{
                    "logs":output.statusText,
                    "params" : {"adql":adql}
                }};
            }
        } catch (error) {
            console.error(error);
            return {"status":false,"error":{
                "logs":error.toString(),
                "params":{"adql":adql}
            }};
        }
    };

    return TapService;
}());