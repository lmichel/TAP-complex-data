"use strict;";

var KnowledgeTank = (function(){
    function KnowledgeTank(){
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
                "tapService" : "//xcatdb.unistra.fr/4xmmdr10/tap",
                "schema" : "ivoa",
                "table" : "ObsCore"
            },
            
            "Vizier" : {
                "tapService" : "//tapvizier.u-strasbg.fr/TAPVizieR/tap/sync",
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
    
    return KnowledgeTank;
})();