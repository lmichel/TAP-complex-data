"use strict;";

var KnowledgeTank = (function(){
    function KnowledgeTank(){
        this.ucdStorage = {
            "name":["meta.id;meta.main","meta.main"],
            "position" : ["pos;meta.main","pos"],
            "longitude": ["pos.eq.ra;meta.main", "pos.gal.lon;meta.main","pos.eq.ra", "pos.gal.lon"],
            "latitude": ["pos.eq.dec;meta.main", "pos.gal.lat;meta.main","pos.eq.dec", "pos.gal.lat"],
            "brightness" : ["phys.luminosity;meta.main","phot.mag;meta.main","phys.flux;meta.main","phot.count;meta.main"],
            "bibliography[*]" : ["meta.bib.author","meta.record","meta.bib.bibcode","meta.bib.journal","meta.title","meta.bib"],
            "object_class" : ["src.class[*]"],
            "unit":["meta.unit;meta.main","meta.unit"],
            "description": ["meta.note;instr.filter"]
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
        let j,i,maxSelect,curr = 0,ucd,maxField,counter,ucds;

        for (let fType in this.ucdStorage){
            i=0;
            counter = 0;
            ucds =  this.ucdStorage[fType];
            maxField = 1;
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
    
    return KnowledgeTank;
})();