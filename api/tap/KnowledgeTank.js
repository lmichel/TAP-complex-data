"use strict;";

var KnowledgeTank = (function(){
    function KnowledgeTank(){
        this.ucdStorage = {
            "name":["meta.id","meta.main"],
            "position" : ["pos;meta.main","pos"],
            "longitude": ["pos.eq.ra;meta.main", "pos.gal.lon;meta.main","pos.eq.ra", "pos.gal.lon"],
            "latitude": ["pos.eq.dec;meta.main", "pos.gal.lat;meta.main","pos.eq.dec", "pos.gal.lat"],
            "brightness" : ["phys.luminosity;meta.main","phot.mag;meta.main","phys.flux;meta.main","phot.count;meta.main"]
        };

        this.utypeKeyword = ["description","name","coordinates"];

        this.serviceDescriptors = { 
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
        return {"status":true,"descriptors": this.serviceDescriptors};
    };

    KnowledgeTank.prototype.selectAH = function(AHList){
        let selected = {};
        let j,i;

        for (let fType in this.ucdStorage){
            i=0;
            if(selected.position === undefined || (fType != "longitude" && fType != "latitude" )){
                while(i<this.ucdStorage[fType].length && selected[fType] === undefined){
                    for (j=0;j<AHList.length;j++){
                        if(AHList[j].ucd == this.ucdStorage[fType][i]){
                            selected[fType] = AHList[j];
                        }
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

    KnowledgeTank.prototype.selectAHByUtypes = function(AHList){
        let selected = [],i,j;
        for (i=0;i<AHList.length;i++){
            for(j=0;j<this.utypeKeyword.length;j++){
                if(AHList[i].utype.toLowerCase().includes(this.utypeKeyword[j])){
                    selected.push(AHList[i]);
                }
            }
        }
        console.log(selected.length);
        return {"status" : true,"selected":Array.from(new Set(selected))};
    };
    
    return KnowledgeTank;
})();