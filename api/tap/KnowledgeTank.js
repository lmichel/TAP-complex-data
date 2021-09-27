"use strict;";

var KnowledgeTank = (function(){
    function KnowledgeTank(){
        this.UcdStorage = {
            "name":["meta.id","meta.main", "meta.id"],
            "longitude": ["pos.eq.ra;meta.main", "pos.gal.lon;meta.main","pos.eq.ra", "pos.gal.lon"],
            "latitude": ["pos.eq.dec;meta.main", "pos.gal.lat;meta.main","pos.eq.dec", "pos.gal.lat"]
        };

        this.ServiceDescriptors = { 
            "Simbad" : {
                "tapService" : "http://simbad.u-strasbg.fr/simbad/sim-tap/sync",
                "schema" : "public",
                "table" : "basic"
            },
            
            "Gavo" : {
                "tapService" : "http://dc.zah.uni-heidelberg.de/tap/sync",
                "schema" : "rr",
                "table" : "resource"
            },
        
            "CAOM" : {
                "tapService" : "http://vao.stsci.edu/CAOMTAP/tapservice.aspx/sync",
                "schema" : "dbo",
                "table" : "CaomObservation"
            },
            
            "3XMM" : {
                "tapService" : "https://xcatdb.unistra.fr/4xmmdr10/tap/sync",
                "schema" : "EPIC",
                "table" : "EPIC_IMAGE"
            },
            
            "Vizier" : {
                "tapService" : "http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync",
                "schema" : "metaviz",
                "table" : "METAcat"
            }
        };

        this.presetValues = {

        };
    }

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
        return {"status":true,"descriptors": this.ServiceDescriptors};
    };

    KnowledgeTank.prototype.selectAH = function(AHList){
        let selected = {};
        let j,i;
        for (let fType in this.UcdStorage){
            i=0;
            while(i<this.UcdStorage[fType].length && selected[fType] === undefined){
                for (j=0;j<AHList.length;j++){
                    if(AHList[j].ucd.includes(this.UcdStorage[fType][i])){
                        selected[fType] = AHList[j];
                    }
                }
                i++;
            }
        }
        let selectedAH = [];
        for (let key in selected){
            selectedAH.push(selected[key]);
        }
        return {"status" : true,"selected":selected};
    };
    
    return KnowledgeTank;
})();