
let tree; // temporary export

async function OnRadioChange(radio){
    if(isEnable("label_" + radio.value)){
        disableButton("label_" + radio.value);
        let api = new jw.Api();
        let params = jw.KnowledgeTank.getDescriptors().descriptors[radio.value];
        let connect = await api.connectService(params.tapService,radio.value);
        if(connect.status){
            tree.append(api,params);

            successButton("label_" + radio.value);
            return;
        }
        console.error(connect);
        errorButton("label_" + radio.value);
    }
}

function specSB(...args){
    jw.widget.SearchBar.call(this,...args);
}

specSB.prototype = Object.create(jw.widget.SearchBar.prototype,{
    processEvent : {
        value:function(){
            let val = this.input.val().trim();
            let url = false;
            if(val.startsWith("http")){
                url = true;
                val = val.substring(val.indexOf(":")+1);
            }else if(val.startsWith("//")){
                url = true;
            }
            if(url){
                this.processUrl("%" + val);
            }else{
                jw.widget.SearchBar.prototype.processEvent.call(this);
            }
        }
    },
    processUrl : {
        value: function(url){
            
            let parsed = {url:[url]};

            this.logger.info("processing url");
            let processed = this.processor.processConditions(parsed);

            let data;
            this.logger.info("Gathering data");
            if (this.promList.length > 0) {
                data = this.promList[this.promList.length - 1].then(() => {
                    return this.querier.queryData(processed, this.logger);
                });
            } else {
                data = this.querier.queryData(processed, this.logger);
            }

            if (data.then !== undefined) {
                this.promList.push(
                    data.then((val) => {
                        if(val.length<1){
                            url = url.substring(url.indexOf("//"));
                            let name = url.substring(url.indexOf("//")+2);
                            name = name.substring(0,name.indexOf("/"));
                            name = name.substring(0,name.lastIndexOf("."));
                            
                            name = name.replace(/[\.\_]/g," ");

                            this.output.push([{url:url,name:name,ivoid:"",title:"Unknown Tap Service"}]);
                        }else{
                            this.output.push(val);
                        }
                        this.promList.remove(data);
                    })
                );
                return this.promList[this.promList.length - 1];
            } else {
                this.output.push(data);
                return;
            }
        }
    },
});

function outBuilder(holder,ologger){
    let clickHandlerBuilder=function(dataList){
        return (event)=>{
            ologger.info("connecting to the slected service");
            let dat = dataList[+(event.currentTarget.id.substring(event.currentTarget.id.lastIndexOf("_")+1))];
            dat = $.extend({},dat);
            if(dat.url.startsWith("http")){
                dat.url = dat.url.substring(dat.url.indexOf(":")+1);
            }

            if(dat.url.match(/\/\/[a-zA-Z\.\-\_]+\:80\//)){ // ex : //simbad.u-strasbg.fr:80/
                dat.url = dat.url.replace(":80","");
            }

            if(window.location.href.includes("?")){
                dat["full bookmark"] = window.location.href + (window.location.href.includes(dat.url)?"" : "&url=" + dat.url);
                dat.bookmark = window.location.href.substring(0,window.location.href.indexOf("?")) + "?url=" + dat.url;
            }else{
                dat["full bookmark"] = window.location.href + "?url=" + dat.url;
            }
            

            let api = new jw.Api();
            let connect = ()=>{
                api.connectService(dat.url,dat.name).then((connect)=>{
                    if(connect.status){
                        tree.append(api,dat);
                    }else{
                        //proxy for cors errors
                        api.connectService("//taphandle.astro.unistra.fr/tapxy" + dat.url.substring(1),dat.name).then((connect)=>{
                            if(connect.status){
                                tree.append(api,dat);
                            }else{
                                api.connectService("https://taphandle.astro.unistra.fr/tapsxy" + dat.url.substring(1),dat.name).then((connect)=>{
                                    if(connect.status){
                                        tree.append(api,dat);
                                    }else{
                                        event.currentTarget.style.background = 'red';
                                    Modalinfo.error("can't connect to the select service: " + connect.error.logs + ".The full error has been dumped into the console");
                                    console.error(connect.error);
                                    }
                                });
                            }
                        });
                    }
                    ologger.hide();
                });
            };

            $.ajax({
                url: dat.url,
                type: "GET"
            }).then(connect,
                error => {
                    if(error.status == 404){
                        Modalinfo.error("can't connect to the select service : 404 not found"); 
                        ologger.hide();
                    }else{
                        connect();
                    }
                }
            );

            
        };
    };

    return {
        push: function (dataList){
            let dat;
            let li;
            let list = "<ul class = '' role='listbox' style='text-align: center;padding:0;margin: 0'>";
            for(let i=0;i<dataList.length;i++){
                dat = $.extend({},dataList[i]);
                li= "<li tabindex='-1' class='clickable' id='list_elem_" + i + "' style='border-radius: 4px; margin: 0.5em;" +
                    "border: 1px solid #aaaaaa;background: #ffffff 50% 50%;color: #222222;'>" + 
                    "[" + dat.name +"]" +dat.title + "<br><small>" + dat.url + "<br>" + dat.ivoid;
                delete dat.name;
                delete dat.title;
                delete dat.url;
                delete dat.ivoid;
                for (let field in dat){
                    if(field[0] == "_")
                        continue;
                    if(field == "noField")
                        continue;
                    li += "<br>" + field + " : " + dat[field]; 
                }
                li += "</small></li>";
                list += li;
            }
            holder.html(list + "</ul>");
            $("li",holder).click(clickHandlerBuilder(dataList));
        }
    };
}

async function setupSB(ologger){
    $("#mainButtonHolder").html("<div id='fieldNameBar' style='display:flex;justify-content: space-between;'></div>"+
        "<div style='display:flex;width:100%'><input placeholder='Search services' id='mainSB' style='width:calc(100% - 2em) '></input>"+
        "<img href='javascript:void(0)' src='./icons/trash.svg' alt='trash can icon' title='empty the search bar' style='width:2em;height:2em;'></div>"+
        "<div id='mainSB_out' style='' class='sbOut'></div>");
    
    let api = new jw.Api();
    
    await api.connectService("//dc.zah.uni-heidelberg.de/tap/sync","Gavo");

    await api.selectSchema("rr");

    await api.setRootTable("resource");

    let logger = new MyLogger($("#mainSB_out"));

    /**
     * Default conditions and fields
     */
    let defaults = {
        "_capa":{
            table:"capability",
            column:"standard_id",
            condition: new jw.widget.SearchBar.ConstraintsHolder(["ivo://ivoa.net/std/tap"],"rr.capability.standard_id='ivo://ivoa.net/std/tap'")
        },
        "_int":{
            table:"interface",
            column:"url_use",
            condition: new jw.widget.SearchBar.ConstraintsHolder(["vs:paramhttp"],"(rr.interface.intf_type = 'vs:paramhttp')")
        },
        "name":{
            table:"resource",
            column:"short_name",
        },
        "ivoid":{
            table:"resource",
            column:"ivoid",
        },
        "url":{
            table:"interface",
            column:"access_url",
        },
        "title":{
            table:"resource",
            column:"res_title",
        },
    };

    api.selectField("short_name","resource",false);

    let querier = new jw.widget.SearchBar.Querier(api,defaults,data=>data.url,logger);

    let constraintMap = {
        "_default": {
            table : "resource",
            schema : "rr",
            merger : jw.widget.SearchBar.mergers.likeMerger(),
            formator : jw.widget.SearchBar.formators.simpleStringFormator
        },
        "name":{column:"short_name"},
        "roleIvoid":{table:"res_role",column:"role_ivoid"},
        "ivoid":{column:"ivoid"},
        "desc":{column:"res_description"},
        "title":{column:"res_title"},
        "subject":{table:"res_subject",column:"res_subject"},
        "subjectUat":{table:"subject_uat",column:"uat_concept"},
        "tableName":{table:"res_table",column:"table_name"},
        "tableDesc":{table:"res_table",column:"table_description"},
        "utype":{table:"res_table",column:"table_utype"},
        "url":{table:"interface",column:"access_url"},
        "ucd":{table:"table_column",column:"ucd"},
        "noField":{
            aliases : ["name","ivoid","title"],
            column : "short_name",
            formator:jw.widget.SearchBar.formators.fuzzyStringFormator,
            merger : jw.widget.SearchBar.mergers.likeMerger("UPPER"),
        },
    };

    let processor = new jw.widget.SearchBar.ConstraintProcessor(constraintMap,logger);

    let parser = new jw.widget.SearchBar.StringParser(Object.keys(constraintMap).filter(v=>v[0]!=="_"),":");

    let sb = new specSB(
        $("#mainSB"),
        outBuilder($("#mainSB_out"),ologger),
        parser,
        processor,
        querier,
        undefined,
        logger
    );

    $("#mainButtonHolder img").click(()=>{
        $("#mainSB").val("");
    });

    let autoComp = {
        utype : [
            "ivo.//vopdc.obspm/std/epncore#schema-2.0","ivo://ivoa.net/std/epntap#table-2.0",
            "ivo://ivoa.net/std/obsloctap#table-1.0","ivo://ivoa.net/std/regtap#1.1",
            "ivo://vopdc.obspm/std/epncore#schema-2.0","ivo://vopdc.obspm/std/epncore/schema-2.0",
            "stc:astrocoordarea.region","stc:astrocoordarea.spectralinterval",
            "stc:astrocoordarea.timeinterval","xpath:/","xpath:/(capability/|)validationlevel",
            "xpath:/(capability|)","xpath:/(curation/creator/|)altidentifier",
            "xpath:/(tableset/schema/|)/table/column/","xpath:/(tableset/schema/|)table/",
            "xpath:/capability/","xpath:/capability/interface/","xpath:/capability/interface/param/",
            "xpath:/content/","xpath:/content/relationship/",
            "xpath:/coverage/spatial", "xpath:/coverage/spectral","xpath:/coverage/temporal",
            "xpath:/curation/","xpath:/tableset/schema/"
        ],
        ucd : ["arith","arith.diff","arith.factor","arith.grad","arith.rate","arith.ratio","arith.ratiometa.code","arith.ratiometa.ref",
        "arith.ratiometa.ref.url","arith.ratiophot.flux.density","arith.ratiophot.flux.sb","arith.ratiophys.absorption.opticaldepth",
        "arith.ratiophys.angsize.smajaxis","arith.ratiospect.line.intensity","arith.ratiostat.error","arith.ratiostat.likelihood","arith.sum","arith.zp","class",
        "class_code","class_misc","class_object","class_object_error","class_star_galaxy",
        "class_star/galaxy","code_htm","code_mem","code_misc","code_mult_flag","code_mult_index","code_quality","code_qualiy","code_variab","colourucd",
        "data","data_link","datalink.preview","date","dist","em","em.bin","em.energy","em.freq","em.freq.step","em.gamma","em.gamma.hard",
        "em.gamma.soft","em.ir","em.ir.1500-3000ghz","em.ir.15-30um","em.ir.15-30umstat.error","em.ir.30-60um","em.ir.3-4um",
        "em.ir.3-4umphot.flux.density","em.ir.400-750ghz","em.ir.4-8um","em.ir.4-8umphot.flux.density","em.ir.4-8umspect.line.eqwidth","em.ir.60-100um",
        "em.ir.60-100ummeta.code.error","em.ir.60-100umphot.flux.sb","em.ir.750-1500ghz","em.ir.8-15um","em.ir.8-15ummeta.code.qual","em.ir.8-15umspect.line.eqwidth",
        "em.ir.fir","em.ir.h","em.ir.j","em.ir.k","em.ir.mir","em.ir.nir","em.ir.nirphys.magabs","em.line","em.line.brgamma","em.line.co",
        "em.line.halpha","em.line.halphameta.code.error","em.line.halphastat.error","em.line.hbeta","em.line.hbetastat.error","em.line.hdelta",
        "em.line.hdeltastat.error","em.line.hgamma","em.line.hgammastat.error","em.line.hi","em.line.histat.error","em.line.histat.fit.chi2","em.line.lyalpha",
        "em.line.lyalphastat.error","em.line.oiii","em.line.oiiimeta.code.error","em.mm","em.mm.100-200ghz","em.mm.100-200ghzstat.error","em.mm.1500-3000ghz",
        "em.mm.1500-3000ghzmeta.code.qual","em.mm.1500-3000ghzphot.flux.density","em.mm.200-400ghz","em.mm.30-50ghz","em.mm.30-50ghzstat.correlation","em.mm.400-750ghz",
        "em.mm.50-100ghz","em.mm.750-1500ghz","em.mmstat.error","em.opt","em.opt.b","em.opt.bt","em.opt.i","em.opt.iphot.flux.density",
        "em.opt.iphys.luminosity","em.opt.ir.8-15um","em.opt.i.z","em.opt.r","em.opt.rmeta.code","em.opt.rphot.flux","em.opt.rspect.line.intensity","em.opt.u",
        "em.opt.v","em.opt.vmeta.code.multip","em.opt.vstat.fit","em.opt.vt","em.radio","em.radio.100-200mhz","em.radio.12-30ghz",
        "em.radio.12-30ghzmeta.code","em.radio.12-30ghzspect.index","em.radio.1500-3000mhz","em.radio.1500-3000mhzstat.correlation","em.radio.1500-3000mhzstat.error",
        "em.radio.200-400mhz","em.radio.200-400mhzinstr.det.psf","em.radio.200-400mhzspect.index","em.radio.20-100mhz","em.radio.3-6ghz",
        "em.radio.3-6ghzmeta.code","em.radio.3-6ghzmeta.code.error","em.radio.3-6ghzphot.flux.density","em.radio.3-6ghzspect.dopplerveloc.radio",
        "em.radio.3-6ghzstat.error","em.radio.400-750mhz","em.radio.6-12ghz","em.radio.6-12ghzmeta.code","em.radio.6-12ghzphys.polarization.linear",
        "em.radio.6-12ghzpos.posang","em.radio.6-12ghzspect.index","em.radio.6-12ghzstat.error","em.radio.6-12ghzstat.error.sys","em.radio.750-1500mhz",
        "em.radio.750-1500mhzmeta.code","em.radio.750-1500mhzmeta.code.error","em.radio.750-1500mhzphot.flux","em.radio.750-1500mhzphot.flux.density",
        "em.radio.750-1500mhzpos.angdistance","em.radio.750-1500mhzspect.index","em.radio.750-1500mhzstat.error.sys","em.radio.750-1500mhzstat.fit.chi2",
        "em.radioinstr.det.psf","em.radiopos.angdistance","em.radiostat.error","em.uv","em.uv.100-200nm","em.uv.10-50nm","em.uv.200-300nm",
        "em.uv.200-300nmphys.luminosity","em.uv.50-100nm","em.uv.fuv","em.wavenumber","em.wl","em.wl.central","em.wl.effective","em.x-ray","em.x-ray.hard",
        "em.x-ray.medium","em.x-ray.mediumphot.count","em.x-ray.mediumphot.flux","em.x-ray.mediumstat.error","em.x-ray.soft","em.x-ray.softphot.count",
        "em.x-ray.softphot.flux","em.x-ray.softstat.error","em.x-ray.softstat.likelihood","em.x-raystat.error","eq.pos.dec","eq.pos.ra","error","error_fit_mag",
        "error_phot_counts_x","error_phot_flux_optical","error_phot_trans_param","error_phot_zp","extension","extension_area","extension_area_inst_psf",
        "extension_diam","extension_fwhm_maj","extension_fwhm_min","extension_rad","extension_rad_error","extension_rad_fit_param","extension_smin",
        "extension_smin_error","fit_chi2","fit_error","fit_goodness","fit_param","fit_param_error","fit_param_pos_ang_general",
        "fit_param_pos_ang_general_error","fit_param_value","fit_residual","fit_stdev","foot_flag","id","id_alternative","id_area","id_associated","id_catalog","id_cross",
        "id_crossid","id_data","id_database","id_dataset","id_fiber","id_field","id_file","id_frame","id_group","id_human","id_idenitifier",
        "id_identifier","id_image","id_main_-","id_main","id_number","id_parent","id_plate","id_region","id_survey","id_table","id_target","id_tracer",
        "id_version","id_volume","image","inst_apert","inst_background","inst_band_pass","inst_corr-factor","inst_det_limit","inst_det_size",
        "inst_dispersion","inst_filter","inst_filter_code","inst.filter.id","inst_id","inst_noise","inst_param","inst_pixsize","inst_plate_dist",
        "inst_plate_emulsion","inst_pos","instr","instr.background","instr.backgroundstat.error","instr.bandpass","instr.bandwidth","instr.baseline",
        "instr.beam","instr.calib","instr.det","instr.det.noise","instr.det.psf","instr.det.qe","instr.dispersion","instr.filter","instr.fov",
        "instr.obsty","instr.obstye","instr.obsty.seeing","instr.offset","instr.order","instr.param","instr.pixel","instr.plate",
        "instr.plate.emulsion","instr.precision","instr.saturation","instr.scale","instr.sensitivity","instr.setup","instr.skylevel","instr.skytemp",
        "instr.spect","instr.tel","instr.tel.focallength","inst_samp-time","inst_scale","inst_seeing","inst_sensitivity","inst_setup","inst_sky_level",
        "inst_sky_level_error","inst_sky_sigma","inst_wavelength_effective","inst_wavelength_value","max_velocity","meta","meta.abstract","meta.bib",
        "meta.bib.author","meta.bib.bibcode","meta.bib.fig","meta.bib.journal","meta.bib.page","meta.bib.volume","meta.caliblevel","meta.checksum",
        "meta.code","meta.code.class","meta.code.error","meta.code.member","meta.code.mime","meta.code.multip","meta.code.qual","meta.code.status",
        "meta.cryptic","meta.curation","metadata_comment","meta.data.datalink","metadata_description","metadata_id","meta.datalink","metadata_name",
        "meta.dataset","metadata_unit","meta.feature","meta.file","meta.filemeta.number","meta.fits","meta.fitsphys.mol.dipole","meta.flag","meta.gous",
        "meta_id","meta.id","meta.id.assoc","meta.id.cross","meta.id.instr.part",
        "meta_id_--n/_-99999999","meta.id.parent","meta.id.part","meta.id.pi","meta.image","meta.latpole","meta.lonpole","meta_main","meta.main",
        "meta.mainstat.error","meta.model","meta.modelled","meta.modelledarith.factor","meta.modelledphys.angsize.smajaxis","meta.modelledphys.columndensity",
        "meta.modelledphys.magabs","meta.modelledphys.temperature","meta.modelledspect.index","meta.modelledstat.error","meta.modelledstat.fit.residual",
        "meta.mous","meta.name","meta.note","meta.number","meta.preview","meta.pubcode","meta.pubcountry","meta.pubid","meta.publat","meta.publon",
        "meta.pubname","meta.record","meta.ref","meta.ref.doi","meta.ref.ivoid","meta.ref.uri","meta.ref.url","meta.software","meta.table","meta.title",
        "meta.ucd","meta.unit","meta.version","mime","mjd","model_correction","model_mag_value","model_param","morph_param","multip","name","note",
        "number","obj_id","obj_run","obs","obs.airmass","obs.atmos","obs.atmos.extinction","obs.atmos.refractangle","obs_band","obs.calib",
        "obs.calib.flat","obs_code","obs_conditions","obs_diff","obs.exposure","obs.field","obs_id","obs.image","obs.imagemeta.code.multip","obs_method",
        "obs.observer","obs_param","obs.param","obs.proposal","obs.proposal.cycle","obs_run","obs.sequence","obs.sequencepos.distance","obsspect.index",
        "obsty_altitude","obs__type","obs_type","os.galactic.lon","phot","phot_abs-mag_phot_sdss_g","phot_abs-mag_phot_sdss_i","phot_abs-mag_phot_sdss_r",
        "phot_abs-mag_phot_sdss_u","phot_abs-mag_phot_sdss_z","phot.antennatemp","phot_atm_airmass","phot_atm_ext","phot.calib","phot_ci","phot_color","phot.color",
        "phot.color.excess","phot.color.reddfree","phot.count","phot_count-rate","phot_count-rate_x","phot_counts_misc","phot_counts_x","phot_dist-mod",
        "phot_extinction","phot_extinction_gal","phot.fluence","phot_flux","phot.flux","phot.flux.beam","phot.flux.bol","phot.flux.density",
        "phot.flux.densitymeta.code","phot.flux.densityphys.polarization.linear","phot.flux.density.sb","phot.flux.density.sbmeta.code.error","phot_flux_ir_100",
        "phot_flux_ir_12","phot_flux_ir_25","phot_flux_ir_60","phot_flux_optical","phot_flux_optical_stat_median","phot_flux_optical_stat_stdev",
        "phot_flux_radio","phot_flux_radio_1.4g","phot_flux_radio_error","phot_flux_ratio","phot.flux.sb","phot_intensity_adu","phot_intensity_misc",
        "phot_int-mag","phot_k-correction","phot.limbdark","phot_lum-dist","phot_mag","phot.mag","phot_mag_b","phot.mag.bc","phot.mag.bol",
        "phot_mag_corr","phot_mag_corr_error","phot.mag.distmod","phot_mag_g","phot_mag_i","phot_mag_limit","phot_mag_r","phot.mag.reddfree",
        "phot.mag.sb","phot_mag_sdss_g_stat_median","phot_mag_sdss_i_stat_median","phot_mag_sdss_r_stat_median","phot_mag_sdss_u_stat_median",
        "phot_mag_sdss_z_stat_median","phot_phg_bj","phot_phg_i","phot_phg_mag","phot_phg_r","phot_profile","phot_profile_par","phot.sb","phot_sb_general",
        "phot_sb_ir-100","phot_sb_sky","phot_sdss_g","phot_sdss_g_error","phot_sdss_g_error_fit_param","phot_sdss_g_fit_param","phot_sdss_gri",
        "phot_sdss_i","phot_sdss_i_error","phot_sdss_i_error_fit_param","phot_sdss_i_fit_param","phot_sdss_r","phot_sdss_r_error",
        "phot_sdss_r_error_fit_param","phot_sdss_r_fit_param","phot_sdss_riz","phot_sdss_u","phot_sdss_u_error","phot_sdss_u_error_fit_param","phot_sdss_u_fit_param",
        "phot_sdss_z","phot_sdss_z_error","phot_sdss_z_error_fit_param","phot_sdss_z_fit_param","phot_synth-mag_phot_sdss_g",
        "phot_synth-mag_phot_sdss_i","phot_synth-mag_phot_sdss_r","phot_synth-mag_phot_sdss_u","phot_synth-mag_phot_sdss_z","phot_trans_param","phot_zp","phot_zpt",
        "phys","phys.absorption","phys.absorption.coeff","phys.absorption.gal","phys.absorption.opticaldepth","phys.abund","phys.abund.fe",
        "phys.abund.x","phys.abund.y","phys.abund.z","phys.acceleration","phys.albedo","phys.angarea","phys.angmomentum","phys.angsize",
        "phys.angsize.smajaxis","phys.angsize.sminaxis","phys.area","phys.atmol","phys.atmol.branchingratio","phys.atmol.collisional","phys.atmol.collstrength",
        "phys.atmol.configuration","phys.atmol.crosssection","phys.atmol.crosssectionmeta.id.cross","phys.atmol.damping","phys.atmol.element",
        "phys.atmol.excitation","phys.atmol.final","phys.atmol.initial","phys.atmol.ionization","phys.atmol.ionizationphys.atmol.element","phys.atmol.ionstage",
        "phys.atmol.lande","phys.atmol.level","phys.atmol.levelmeta.note","phys.atmol.levelstat.weight","phys.atmol.lifetime","phys.atmol.lineshift",
        "phys.atmol.number","phys.atmol.oscstrength","phys.atmol.oscstrengthstat.weight","phys.atmol.parity","phys.atmol.qn","phys.atmol.radiationtype",
        "phys.atmol.sweight","phys.atmol.sweight.nuclear","phys.atmol.sweight.nuclearmeta.number","phys.atmol.symmetry","phys.atmol.term",
        "phys.atmol.transition","phys.atmol.transitionarith.rate","phys.atmol.transitionmeta.code","phys.atmol.transitionmeta.id.cross",
        "phys.atmol.transitionmeta.note","phys.atmol.transitionphot.antennatemp","phys.atmol.transitionphys.atmol.element","phys.atmol.transitionphys.atmol.transprob",
        "phys.atmol.transitionphys.mol.dipole.magnetic","phys.atmol.transitionphys.veloc","phys.atmol.transitionspect.line.eqwidth","phys.atmol.transprob",
        "phys.atmol.transprobarith.factor","phys.atmol.transprobarith.rate","phys.atmol.transprobphys.veloc","phys.atmol.weight","phys.atmol.woscstrength",
        "phys_axis-ratio","phys.columndensity","phys.composition","phys.composition.masslightratio","phys.composition.yield","phys_concent_index",
        "phys.cosmology","phys.damping","phys.density","phys_density_number","phys_density_surface","phys.dielectric","phys.dispmeasure","phys.distance",
        "phys.dust","phys.electfield","phys.electron","phys.electron.degen","phys_ellipticity","phys.emissivity","phys.emissmeasure","phys.energy",
        "phys.energy.density","phys.entropy","phys.eos","phys.excitparam","phys.flux.energy","phys.gauntfactor","phys.gravity","phys.ionizparam",
        "phys.ionizparam.coll","phys.ionizparam.rad","phys.luminosity","phys.luminosity.fun","phys.magab","phys.magabs","phys.magabs.bol","phys.magfield",
        "phys.mass","phys.mass.loss","phys.massmeta.note","phys.mol","phys.mol.dipole","phys.mol.dipole.electric","phys.mol.dipole.magnetic",
        "phys.mol.dissociation","phys.mol.formationheat","phys.mol.qn","phys.mol.quadrupole.electric","phys.mol.rotation","phys.mol.vibration",
        "phys_optical-depth","phys.outline","phys.particle.neutrino","phys.polarization","phys.polarizationarith.factor","phys.polarization.circular",
        "phys.polarization.circularmeta.code","phys.polarization.linear","phys.polarizationpos.posang","phys.polarization.rotmeasure","phys.polarizationstat.error",
        "phys.polarization.stokes","phys_press_gas","phys.pressure","phys.recombination.coeff","phys.refractindex","phys.sfr","phys.size","phys.size.axisratio",
        "phys.size.diameter","phys.size.radius","phys.size.smajaxis","phys.size.smajaxismeta.ref","phys.size.smajaxismeta.ref.url",
        "phys.size.smajaxisstat.error","phys.size.sminaxis","phys.temp","phys.temperature","phys.temperature.effective","phys.temperature.electron",
        "phys.temperature.meta.modelled","phys_temp_misc","phys.transmission","phys.veloc","phys.veloc.ang","phys.veloc.dispersion","phys.veloc.escape",
        "phys.veloc.expansion","phys.veloc.microturb","phys.veloc.orbital","phys.veloc.pulsat","phys.veloc.rotat","phys.veloc.transverse","phys.virial",
        "phys.volume","pos","pos_ang_dist","pos.angdistance","pos_ang_dist_general","pos_ang_dist_rel","pos_ang_error","pos.angresolution",
        "pos_ang_vel","pos_ang_vel_error","pos.az.alt","pos.az.azi","pos.azimuthang","pos.az.zd","pos.barycenter","pos.bodyrc","pos.bodyrc.alt",
        "pos.bodyrc.lat","pos.bodyrc.lon","pos.bodyrc.long","pos.cartesian","pos.cartesian.x","pos.cartesian.y","pos.cartesian.z","pos_ccd_x",
        "pos_ccd_x_error","pos_ccd_y","pos_ccd_y_error","pos.cmb","pos_detector","pos.dircos","pos.distance","pos.earth","pos.earth.alitude",
        "pos.earth.altitude","pos.earth.lat","pos_earth_lat_main","pos.earth.lon","pos.earth.long","pos_earth_lon_main","pos_ec_lat","pos.ecliptic.lat",
        "pos.ecliptic.lon","pos_ec_lon","pos.emergenceang","pos.eop","pos.eop.nutation","pos.ephem","pos.eq","pos_eq_cart_x","pos_eq_cart_y",
        "pos_eq_cart_z","pos.eq.de","pos_eq_dec","pos.eq.dec","pos_eq_dec_err","pos_eq_dec_main","pos_eq_dec_off","pos_eq_dec_other",
        "pos.eq.decstat.correlation","pos.eq.ha","pos_eq_pmdec","pos_eq_pmra","pos_eq_ra","pos.eq.ra","pos.eq.radesys","pos_eq_ra_err","pos_eq_ra_main",
        "pos_eq_ra_off","pos_eq_ra_other","pos.eq.rastat.correlation","pos.eq.restfrq","pos.eq.spd","pos.eq.specsys","pos_eq_x","pos_eq_y","pos_eq_z",
        "pos.errorellipse","pos.frame","pos.framemeta.bib.author","pos.galactic","pos.galacticarith.factor","pos.galactic.lat","pos.galactic.lon",
        "pos.galactocentric","pos.galactocentricpos.distance","pos_gal_lat","pos_gal_lon","pos_general","pos.geocentric","pos.geodetic","pos.healpix",
        "pos.heliocentric","pos.heliocentricmeta.bib.author","pos.heliocentricmeta.number","pos.heliocentricspect.dopplerveloc.radio",
        "pos.heliocentricstat.error","pos.htm","pos.incidenceang","pos_inclin","pos.lambert","pos.lg","pos_limit","pos.lsr","pos.lunar","pos.lunar.occult","pos_map",
        "pos_offset","pos.outline","pos.parallax","pos.parallax.dyn","pos.parallax.phot","pos.parallax.spect","pos.parallax.trig","pos.phaseang",
        "pos_plate_x","pos_plate_y","pos_pm","pos.pm","pos_pm_dec","pos_pm_dec_err","pos_pm_pa","pos_pm_ra","pos_pm_ra_err","pos_pos-ang","pos.posang",
        "pos.precess","pos.proj","pos.projection","pos_reference-system","pos.resolution","pos_sdss_eta","pos_sdss_lambda","pos_sdss_lambda_pos_limit",
        "pos_sdss_mu","pos_sdss_nu","pos_sdss_pos_limit","pos_solar","pos.supergalactic","pos.supergalactic.lat","pos.supergalactic.lon",
        "pos_transf_param","pos_trans_param","pos_trans_param_error","pos.wcs","pos.wcs.cdmatrix","pos.wcs.crpix","pos.wcs.crval","pos.wcs.ctype",
        "pos.wcs.naxes","pos.wcs.naxis","pos.wcs.naxisn","pos.wcs.scale","pos_zd_res","ps_sdss_gri","ps_sdss_riz","record","redshift","redshift_error",
        "redshift_phot","redshift_phot_error","redshift_stat_probability","reduct_extr-rad","reduct_method","reduct_param","refer_code","remarks",
        "spect","spect.binsize","spect_continuum","spect.continuum","spect.continuumphot.flux.density",
        "spect.continuumphys.absorption.opticaldepth","spect.continuumspect.line.intensity","spect.dopplerparam","spect.dopplerveloc","spect.dopplervelocmeta.number",
        "spect.dopplerveloc.opt","spect.dopplerveloc.radio","spect_eq-width","spect_eq-width_error","spect_flux_value","spect_hardness-ratio",
        "spect_hardness-ratio_error","spect_index","spect.index","spect_index_error","spect_index_misc","spect_line","spect.line","spect.line.asymmetry",
        "spect.line.broad","spect.line.broad.stark","spect.line.broad.zeeman","spect_line_cent","spect_line_cent_error","spect.line.eqwidth",
        "spect.line.eqwidthstat.error","spect_line_id","spect_line_intensity","spect.line.intensity","spect_line_intensity_error","spect.linephys.atmol.transprob",
        "spect.line.profile","spect.line.strength","spect_line_width","spect.line.width","spect_line_width_error","spect_resolution","spect.resolution",
        "spect_type_general","spect_wavelength","spect_wavelength_misc","spec_wavelength","spec_wavelength_central","src","src.calib","src.class",
        "src.class.color","src.class.distance","src.class.luminosity","src.class.richness","src.class.stargalaxy","src.class.struct","src.density",
        "src.ellipticity","src.impactparam","src.morph","src.morph.param","src.morph.sclength","src.morph.type","src.net","src.orbital",
        "src.orbital.eccentricity","src.orbital.inclination","src.orbital.inclinationstat.fit","src.orbital.meananomaly","src.orbital.meanmotion",
        "src.orbital.node","src.orbital.periastron","src.redsfhit","src.redshift","src.redshift.phot","src.sample","src.sptype","src.var",
        "src.var.amplitude","src.var.amplitudestat.error","src.var.index","src.var.pulse","star.error","stat","stat.correlation","stat_covariance",
        "stat.covariance","stat.err","stat.error","stat.error.sys","stat.error.sysphys.luminosity","stat.filling","stat.fit","stat.fit.chi2",
        "stat.fit.dof","stat.fit.goodness","stat.fit.omc","stat.fit.param","stat.fit.paramstat.error","stat.fit.residual","stat.fourier",
        "stat.fourier.amplitude","stat_likelihood","stat.likelihood","stat.max","stat.maxphot.antennatemp","stat.maxspect.line.intensity","stat.maxstat.error",
        "stat.mean","stat.meanmeta.number","stat.meanstat.error","stat.median","stat.medianstat.fit.residual","stat.min","stat.minphys.luminosity",
        "stat.minstat.error","stat_misc","stat_n-dof","stat.param","stat.probability","stat_prop","stat_significance","stat.snr","stat.stdev","stat.uncalib",
        "stat.value","stat.variance","stat.weight","sys.vel","tel_focal-length","tel_id","tel_size","text_quality","time","time.age","time.creation",
        "time.crossing","time_date","time.duration","time.end","time_epoch","time.epoch","time_equinox","time.equinox","time.expo","time_exptime",
        "time_interval","time.interval","time.lifetime","time_misc","time.obs","time_period","time.period","time.period.revolution","time.phasd",
        "time.phase","time.processing","time.publiyear","time.relax","time.release","time.resolution","time.scale","time.start","time.update",
        "var_mean","veloc_corr_veloc_hc","veloc_disp","veloc_disp_error","veloc_wind","versnum","vox:bandpass_hilimit","vox:bandpass_id",
        "vox:bandpass_lolimit","vox:bandpass_refvalue","vox:bandpass_unit","vox:image_filesize","vox:image_mjdateobs","vox:image_naxes","vox:image_naxis",
        "vox:image_pixflags","vox:image_scale","vox:image_title","vox:stc_coordequinox","vox:stc_coordrefframe","vox:wcs_cdmatrix","vox:wcs_coordprojection",
        "vox:wcs_coordrefpixel","vox:wcs_coordrefvalue","weight"],
        subjectUat:["venus","spectroscopic-binary-stars","multiple-stars","ob-stars","x-ray-binary-stars","small-solar-system-bodies","astrobiology",
        "brown-dwarfs","hubble-space-telescope ","sky-surveys","mass-spectrometry","interstellar-abundances","cosmic-rays",
        "proper-motions","galaxy-masses","mars","survey","photographic-magnitude","galaxy-classification-systems","stellar-evolution",
        "emission-nebulae","direct-imaging","relativity","medium-band-photometry","astrometry","artificial-satellites",
        "magnetohydrodynamics","catalogs","interstellar-medium","observatories","stellar-properties","virtual-observatories",
        "stellar-atmosphers","megamasers","galaxies","trigonometric-parallax","population-iii-stars","jupiter-trojans","andromeda-galaxy",
        "the-sun","infrared-astronomical-satellite","post-asymptotic-giant-branch-stars","solar-flares","time-domain-astronomy",
        "solar-particle-emission","effective-temperature","radiative-transfer","interacting-galaxies","observational-cosmology",
        "variable-stars","planetary-magnetosphere","kapteyn-selected-areas","radio-sources","astrometric-binary-stars","plasma-physics",
        "asymptotic-giant-branch-stars","chemical-abundances","atmospheric-composition","astronomy-web-services","stellar-spectral-types",
        "circumstellar-dust","dwarf-novae","ultraviolet-astronomy ","solar-system-planet","star-clusters","magellanic-clouds",
        "milky-way-galaxy","solar-system-planets","neutrino-astronomy","molecular-spectroscopy","spectral-line-identification",
        "spectrophotometry","exoplanet-surface-characteristics","space-observatories","virgo-cluster","circumstellar-disks",
        "radio-bursts","carbon-stars","extragalactic-astronomy","disk-galaxies","atomic-spectroscopy","astrophysical-magnetism","nebulae",
        "astronomical-seeing","thermosphere","galaxy-groups","globular-star-clusters","exoplanet-systems","jets","saturnian-satellites",
        "magnitude","celestial-sphere","finding-charts","weak-gravitational-lensing","supernovae","radio-interferometry",
        "asteroseismology","galaxy-evolution","stellar-distance","galaxy-structure","optical-interferometry","early-type-galaxies",
        "surface-photometry","magnetic-fields","history-of-astronomy","near-infrared-astronomy","extrinsic-variable-stars",
        "strong-gravitational-lensing","infrared-excess-galaxies","astronomy-software","x-ray-sources","solar-neighborhood",
        "standard-stars","planetary-science","solar-physics","gravitation","planetary-climates","infrared-astronomy",
        "search-for-extraterrestrial-intelligence","space-weather","exobiology","astrometric-microlensing-effect",
        "ground-based-astronomy","radio-continuum-emission","perseus-cluster","astronomical-site-protection","h-alpha-photometry",
        "galaxy-ages","time-series-analysis","theoretical-models","elemental-abundance","photographic-photometry","near-earth-objects",
        "molecular-clouds","cepheid-variable-stars","hubble-space-telescope","uranus","astrophysical-masers","stellar-astronomy",
        "astrophotography","interstellar-line-emission","astrospheres","luminous-arcs","active-galaxies",
        "large-scale-structure-of-the-universe","water-masers","infrared-sources","pre-biotic-astrochemistry","pulsars",
        "space-vehicle-instruments","ephemerides","orbits","radio-galaxies","classification","interstellar-extinction","radial-velocity",
        "the-moon","submillimeter-astronomy","outer-planets","x-ray-observatories","stellar-mass-functions","be-stars",
        "kinematic-parallax","solar-neutrons","stellar-rotation","astronomy-databases","light-curves","asteroids","heliosphere",
        "forbush-effect","true-position","shocks","supernova-remnants","particle-astrophysics","astronomical-simulations ","novae",
        "black-holes","solar-system-astronomy","space-plasmas","solar-prominences","white-dwarf-stars","astronomy-education",
        "galactic-archaeology","minor-planets","virtual-observatories ","cataclysmic-variable-stars","n-body-simulations",
        "software-tutorials","optical-identification ","stellar-atmospheres","exoplanet-astronomy","constellations","h-ii-regions",
        "ephemeral-active-regions","astronomical-coordinate-systems","star-formation","planetary-nebulae",
        "cosmic-microwave-background-radiation","orbital-elements","carbon-dioxide","galaxy-colors","redshift-surveys",
        "stellar-kinematics","water-vapor","jupiter","herbig-ae-be-stars","seyfert-galaxies","galaxy-photometry","galaxy-mergers",
        "saturn","extinction","neutral-hydrogen-clouds","gamma-ray-astronomy","astrostatistics-techniques","polarimetry",
        "night-sky-brightness","ultraviolet-astronomy","absolute-magnitude","galactic-and-extragalactic-astronomy","photometry","blazars",
        "redshifted","wide-field-telescopes","active-galactic-nuclei","broad-band-photometry","ccd-photometry","transient-sources",
        "ionosphere","space-debris","gamma-rays","stellar-magnetic-fields","dark-matter","spectropolarimetry","h-beta-photometry",
        "trans-neptunian-objects","galaxy-planes","trojan-asteroids","planetary-atmospheres","surveys","x-ray-astronomy",
        "interstellar-molecules","active-galactic-nuclei ","binary-stars","astrochemistry","uv-ceti-stars","optical-observation",
        "galaxy-distances","stellar-parallax","galaxy-formation","flare-stars","quasars","earth-planet-","atmospheric-variability",
        "exoplanet-surface-variability","exoplanet-surfaces","small-magellanic-cloud","gravitational-microlensing",
        "hertzsprung-russell-diagram","high-energy-astrophysics","lyman-alpha-forest","astrl","large-magellanic-cloud","exoplanets",
        "osculating-orbit","star-star-clusters","geodesics","mercury-planet","galaxy-clusters","milky-way-disk",
        "extragalactic-radio-sources","open-star-clusters","parallax","cosmological-neutrinos","comets","radio-astronomy",
        "interstellar-dust","solar-system","atomic-physics","spectral-energy-distribution","visible-astronomy","gamma-ray-sources",
        "earth-atmosphere","galaxy-luminosities","astronomical-object-identification","spectroscopy","infrared-photometry",
        "infrared-galaxies","solar-corona","ionization","gamma-ray-bursts ","osculatory-elements","solar-activity",
        "measurement-error-model","astronomy-data-analysis","aurorae","luminosity-function","orbit-determination",
        "galaxy-stellar-content","observational-astronomy","astronomical-simulations","high-redshift-galaxies","neptune",
        "reflection-nebulae","ultraviolet-sources","dwarf-galaxies","non-thermal-radiation-sources","solar-wind","stellar-abundances",
        "bl-lacertae-objects","star-forming-regions","late-type-stars","cosmology","gravitational-lensing","dwarf-elliptical-galaxies"],
        subject:["???","1M-WideField","21cm HI emission","2XMM Catalogue","3XMM Catalogue","3XMM DR4 Catalogue","3XMM-DR7 Catalogue",
        "3XMM Enhanced Catalogue","4XMM Catalogue","67P","6dF Data Release 3 Spectra",
        "6dF survey galaxy galaxies redshift redshifts 2MASS","Abell 1763","absolute","absolute-magnitude","Absolute magnitude",
        "Abundances","Access to a catalog of blank regions","Accretion","active-galactic-nuclei","Active galactic nuclei",
        "Active Galactic Nuclei","ACTIVE GALACTIC NUCLEI","active galaxies","active-galaxies","Active gal. nuclei","active region","ADQL",
        "agn","AGN","ALFA","ALFALFA","ALHAMBRA F814W SIAP","All-Sky","all sky survey","ALMA","ambient measurements","AMDA","AMR",
        "Am stars","and Infrared Astronomy","andromeda-galaxy","Apparent magnitude","Ap stars","Arches Data","ARCHES SEDs","archive",
        "Archive","archives","Arecibo","Armenian Virtual Observatory services","Armenian Virtual Observatory SIAP API service","ASDC-VO",
        "A stars","asteroids","Asteroids","Asteroseismology","astrobiology","Astrobiology","Astrochemistry","Astrographic catalogs",
        "Astrogrid catalogs","astrogrid community service","astrogrid VOspace Public service","astrometric-binary-stars",
        "ASTROMETRIC BINARY STARS","astrometric catalogue","astrometric catalogues","Astrometric data","astrometric-microlensing-effect",
        "astrometry","Astrometry","ASTROMETRY","astronomical-coordinate-systems","Astronomical Data Archives","Astronomical literature",
        "Astronomical models","astronomical-object-identification","Astronomical object identification",
        "Astronomical reference materials","astronomical-simulations","astronomical-site-protection","astronomy",
        "astronomy-data-analysis","astronomy-databases","astronomy-software","astronomy-web-services","astrophotography",
        "Astrophysical data archives","Astrophysical Jets","astrophysical-masers","Astrophysical masers","astrophysics",
        "Astro Services at NCI-NF","Astro Services at Swinburne","astrostatistics-techniques","asymptotic-giant-branch-stars","ATLAS DR1",
        "Atlases","Atmospheres","atmospheric-composition","atmospheric-variability","ATNF ASKAP Observations","ATNF Observations",
        "ATNF Pulsar Observations Parkes","atomic-physics","Atomic physics","Atomic spectroscopy","aurora","Aurora","Auroras","authority",
        "Authority","Automatic Unsupervised Classification of all SDSS/DR7 Galaxy Spectra","AXIS optical spectra","Barium stars",
        "Be stars","Be Stars","Binaries","Binary and multiple stars","Binary and Multiple Stars","binary-stars","Binary stars","biology",
        "Black holes","BLACK HOLES","Blazar","blazars","BL Lac","BL Lacertae","BL Lacertae objects","blue","Blue objects","body",
        "Bok globules","Bp stars","bright stars","broad-band-photometry","brown dwarfs","brown-dwarfs","Brown dwarfs","B stars","bulge",
        "CADC image/cube HiPS service","Calar Alto Observatory","carbon-dioxide","carbon-stars","Carbon stars","CARMENES_Reiners2018",
        "Cataclysmic variable stars","catalog","Catalog","Catalog of echelle spectra","catalogs","Catalogs","Catalogue","Catalogues",
        "CCD","CCD observation","CCD photometry","CDS image/cube HiPS service","CEA","CEA Applications","celestial-sphere",
        "cepheid-variable-stars","Chemical abundances","Chemically peculiar stars","Chianti Atomic Data","circumstellar disks",
        "circumstellar dust","classification","Classification","classifier","cluster","Cluster of Galaxies","Clusters","CME",
        "CO line emission","COLOR","comet","Comet","Comets","Community Web Application","Community WFAU","Compilation of 1D spectra",
        "Compilation Source","cone search","constellations","Constellations","Cool stars","coordinate system","coordinate transformation",
        "coronal hole","Coronal radio emission","Coronographs","CoRoT","COROT N2","CoRoT N2 Public Archive - Bright stars",
        "CoRoT N2 Public Archive - Confirmed Planet","CoRoT N2 Public Archive - Red Giants",
        "CoRoT N2 Public Archive - Stars with rotation periods from Affer and al.",
        "CoRoT N2 Public Archive - Stars with rotation periods from de Medeiros et al","CORRELATION",
        "cosmic-microwave-background-radiation","cosmic-rays","Cosmic Rays","cosmological-neutrinos","cosmology","Cosmology",
        "Cosmology and Astrophysics Simulations","crater","craters","CRISM","Cross-calibration of past FUV experiments",
        "Cross identifications","CRTS DR3 Image Service","CTS","CV","CXS","DAL","dark energy","dark matter","dark-matter","Dark Matter",
        "data access layer","Database","Data center","Data Collection","data model","data provider access","data repositories",
        "Data retrieval","DDO photometry","deep archive","deep field survey","DES","DESAlert","diameters","Diffuse molecular clouds",
        "Digital Images","Digitised photographic optical all-sky photometric astrometric survey",
        "Digitised photographic Schmidt field test photometry astrometry","direct-imaging","disk-galaxies","DISTANCE","DK154","DOI",
        "double and multiple","DPAS","DR1","DR2","dwarf-elliptical-galaxies","dwarf galaxies","dwarf-galaxies","Dwarf Galaxies",
        "Dwarf Nova","Dwarf stars","early-type-galaxies","Early-type stars","Earth","EARTH ATMOSPHERE","Earth (planet)","eclipsing",
        "Eclipsing binary stars","EDR3","Education","educational galaxies stars planets","Effective temperature","Effective temperatures",
        "eHST","Emission line stars","Emission Nebula","energy spectra","Enzo","Ephemeral Active Regions","ephemerides","Ephemerides",
        "EPHEMERIDES","EPIC Image of 3XMM observations","EPIC Image of 4XMM observations","EPIC spectra of 3XMM-DR7 sources","EPO","ESA",
        "ESAC","ESASky","ESDC","ESDC ESASky HiPS service","esdc_leads@sciops.esac.esa.int","EuroVO Registry","Event","event detection",
        "Event lists","evolution","Excitation rates","Exobiology","exoplanet-astronomy","Exoplanet astronomy","Exoplanet Astronomy",
        "Exoplanet data and data services.","exoplanets","Exoplanets","exoplanet-surface-characteristics","exoplanet-surfaces",
        "exoplanet-surface-variability","Experiment","Extinction","extragalactic","extragalactic astrophysics","extragalactic objects",
        "Extragalactic Objects","EXTRAGALACTIC OBJECTS","EXTRAGALACTIC RADIO SOURCES","Extragalactic Source","Extra-galactic stars",
        "extragalactic survey","Extragalactic Variable Star","Extrasolar Planets","EXTRASOLAR PLANETS","faint","faint blue",
        "Faint blue stars","Faint Images of the Radio Sky at Twenty-cm FIRST","far-ultraviolet spectra","Feature lists","[Fe/H]",
        "field 287","filament","Filter","finding charts","Finding lists","FITS","flare","flare locations","flare-stars","Flare Time",
        "fluxes","forbush-effect","F stars","fundamental","FUV","Gaia","Gaia DR1","Gaia DR2","Gaia EDR3",
        "Galactic and extragalactic astronomy","galactic-archaeology","galactic center","Galactic center","galactic evolution",
        "Galactic Legacy Infrared Mid-Plane Survey GLIMPSE","GALACTIC PLANE","galactic plane survey","galatic evolution","galaxies",
        "Galaxies","GALAXIES","galaxies: evolution","galaxies: formation","galaxies: high-redshift","galaxies local density catalog",
        "galaxies: luminosity function","galaxies morphology catalog","galaxies redshift catalog",
        "galaxies SFR metallicity extinction mass catalog","galaxies: stellar content","galaxy","Galaxy","galaxy-ages","Galaxy: bulge",
        "Galaxy catalogs","galaxy classification","Galaxy classification systems","galaxy cluster","Galaxy Cluster","galaxy clusters",
        "galaxy-clusters","Galaxy clusters","galaxy-colors","Galaxy: disk","galaxy-distances","galaxy-evolution","Galaxy: evolution",
        "Galaxy Evolution","Galaxy Evolution and Structure","galaxy-formation","Galaxy:general","Galaxy Group","Galaxy: halo",
        "galaxy kinematics","Galaxy kinematics","Galaxy: kinematics and dynamics","galaxy-luminosities","galaxy-masses",
        "galaxy-photometry","galaxy-planes","Galaxy planes","Galaxy rotation","galaxy-stellar-content","Galaxy: stellar content",
        "galaxy-structure","Galaxy: structure","galaxy survey","gamma-ray-astronomy","Gamma-ray astronomy","Gamma-ray bursts",
        "Gamma-ray emission","Gamma rays","Gamma Rays","gamma-ray sources","gamma-ray-sources","Gamma-ray sources","gas exchange",
        "Gas Exchange","gas giants planet","GAUDI SSAP","G BAND","gbt","General","general - star clusters: general","Geneva","geodesics",
        "geology","Geology","geoscience","giant","Giant stars","GINCO","GLE","globular","Globular Cluster","globular clusters",
        "globular-star-clusters","Globular star clusters","GOODS Image Cutout Service","gravitation","Gravitational lensing",
        "gravitational-microlensing","Gravitational waves","GRB","green bank","Green Bank","Ground Based Astronomy","G stars","GTC",
        "G-type","Halo stars","H-alpha","H-alpha Network","h-alpha-photometry","H alpha photometry","h-beta-photometry",
        "H beta photometry","HEASARC/SkyView Hierarchical Progressive Surveys","HEAVENS INTEGRAL images (ISDC)",
        "HEAVENS light curves (ISDC - Data Centre for Astrophysics)","HEC","hec r3 service details","helio","HELIO","heliophysics",
        "heliospheric","Herbig AeBe","Herschel","HerSchel IdOc Database","Herschel Space Observatory","hertzsprung-russell-diagram",
        "Hertzsprung Russell diagram","HESIOD","H.E.S.S.","HFC","Hierarchical Progressive Surveys","high energy",
        "high energy and microwave astronomy","high-energy-astrophysics","High energy astrophysics","High Energy Astrophysics",
        "high redshift galaxies","high redshift survey","high redshift surveys","High-velocity stars","h-ii-regions","H II regions",
        "HI line","H I line emission","hinode solar dsa","HIPASS Project Data","HiPS","history-of-astronomy","HLA Images",
        "horizontal branch","Horizontal branch stars","Hot stars","HPS","HSC","HSS","HST","HST Archive","HST photometry","Hubble",
        "Hubble Space Telescope","Hubble Space Telescope 1-D Spectra","Hubble Space Telescope Images",
        "Hubble Space Telescope Observations","I","IAC Virtual Observatory","ICS","ILS","Image","images","Images","imaging",
        "imaging survey optical","individual (M31) - galaxies: star clusters - globular clusters:","INES","infrared","Infrared",
        "Infrared all-sky survey","infrared astronomy","infrared-astronomy","Infrared astronomy","Infrared Astronomy",
        "INFRARED ASTRONOMY","Infrared Counterpart","infrared galaxies","infrared: galaxies","Infrared:galaxies","infrared-photometry",
        "Infrared photometry","Infrared point-source survey","Infrared Satellite Astronomy","Infrared Sky Survey","Infrared sources",
        "infrared spectra","infrared survey","in-situ","instrument","instrument capabilities","instrument location","INTEGRAL",
        "Integral obsloctap","Interacting Galaxies","Interferometry","Intergalactic medium","interstellar-abundances",
        "interstellar cloud","Interstellar clouds","interstellar-dust","interstellar-extinction","interstellar-line-emission",
        "Interstellar masers","interstellar medium","interstellar-medium","Interstellar medium","Interstellar Medium",
        "Interstellar Molecules","Interstellar reddening","Intra-day Variablility","ion composition","Ionosphere","ions","IR",
        "ISM:general","ISO","ISO Infrared Astronomical Spectroscopic Database (IASD) Slap Service","ISON Survey","IUE","jupiter",
        "Jupiter","jupiter-trojans","JVO HiPS service","K-12","kapteyn-selected-areas","KIDS","kinematic-parallax",
        "Kron-Cousins photometry","K stars","KUG","labeled release","Labeled Release","large-magellanic-cloud","Large Magellanic Cloud",
        "LARGE MAGELLANIC CLOUD","large-scale structure of universe","largest non-radio surveys","late-type-stars","Late-type stars",
        "L dwarfs","Legacy","Lightcurve","light curves","light-curves","Light curves","Light Curves","Line intensities","LMC and SMC",
        "Local star-forming galaxies catalog","low mass stars","luminosity-function","luminous-arcs","Lyman Alpha","M3","MACHO",
        "magellanic-clouds","Magellanic clouds","Magellanic Clouds","MAGIC Public Data","magnetic field","magnetic fields",
        "magnetic-fields","Magnetic fields","magnetodisc","Magnetohydrodynamics","magnetophysics","magnetosphere","Magnetosphere",
        "magnetospheric physics","Magnitudes","MAGNITUDES","Marellanic Cloud","Markarian galaxies","mars","Mars","Mass","masses",
        "mass function","mass spectra","MAST","measurement-error-model","Medium band photometry","megamasers","Mercury","mercury-planet",
        "Merging Galaxies","Meridian circles","Metadata modeling","METAL ABUNDANCE","Metallicity","metal poor stars","Meteorites",
        "MGC B-band Galaxy Survey","Milky Way","Milky Way disk","milky-way-galaxy","Milky Way Galaxy","MILKY WAY GALAXY",
        "Millimeter astronomy","Millimetric/submm sources","Millimiter/submillimiter Astronomy","Minor planet","Minor planets",
        "Minor Planets","MINOR PLANETS","molecular cloud","Molecular clouds","Molecular Line","Molecular physics",
        "Morgan-Keenan classification","M stars","multibeam","multiple-stars","Multiple stars","MyExperiment Search",
        "Narrow band photometry","Narrow band photometry Atomic spectroscopy","n-body-simulations","nearby","nearby galaxies",
        "NEAR EARTH ASTEROIDS","near-infrared photometric galaxies catalog","Nebula","nebulae","Nebulae","Neptune","neutral hydrogen",
        "Neutral Hydrogen","neutrino","neutrino-astronomy","Neutron stars","night-sky-brightness","NIR small telescope imaging",
        "NIST's Atomic Spectroscopy DB","non-thermal radiation","Northern Galactic Planetary Nebulae images","North galactic pole",
        "NOT PROVIDED","Nova","Novae","nrao","OAI-PMH","obcp","Object","objective prism","Observation","Observational astronomy",
        "Observational Astronomy","observational-cosmology","Observational cosmology","observations","Observatoire de la C?te d'Azur",
        "observatories","observatory location","Observatory log","Observing catalogues","ObsTAP","ob-stars","OB stars","Occultation",
        "OMC","on-the-fly plotting","open","Open Clusters","Open skyNode","OpenSkyNode","Open Star Cluster","open-star-clusters",
        "Open star clusters","optical","Optical","OPTICAL","Optical Astronomical Images","optical astronomy","Optical astronomy",
        "Optical Astronomy","Optical  Astronomy","OPTICAL ASTRONOMY","Optical Counterpart","Optical Images Archive",
        "optical interferometry","optical lines equivalent width catalog","Optical observation","optical observations",
        "optical photometric galaxies catalog","Optical spectroscopy","Optical Spectroscopy","ORBITAL ELEMENTS","orbit-determination",
        "ORBIT DETERMINATION","Orbits","ORBITS","Organisation","Organization","OSCULATING ORBITS","OSCULATORY ELEMENTS","OSIRIS",
        "O stars","outer galaxy","OV-GSO IVOA-compliant Services","PACS","Parallax","PARALLAXES","Parker model","particle-astrophysics",
        "PDR","Peculiar variable stars","Period","permanent archive","perseus-cluster","P/Halley","Photographic catalog",
        "photographic images","Photographic magnitude","photographic-photometry","Photographic photometry","Photometric standard stars",
        "Photometric systems","photometry","Photometry","Photometry Survey data","Photometry: wide-band","Photometry:wide-band",
        "Photovisual magnitude","planet","Planet","planetary","planetary astronomy","planetary-atmospheres","planetary-climates",
        "planetary-magnetosphere","Planetary Nebula","Planetary nebulae","Planetary Nebulae","planetary observations","planetary-science",
        "Planetary Systems","Planets","Planets+Asteroids","Plasma Physics","Plasmas","pointed solar instruments","point source",
        "polarimetry","Polarimetry","population II","Population II stars","Positional data","Positional Data","Positions","POSITIONS",
        "POSSI-e","POSSII Bj","post-asymptotic-giant-branch-stars","pre-main sequence","Pre-main sequence stars",
        "processing capability access","profile","prominence","proper-motions","Proper motions","PROPER MOTIONS","Proposal",
        "Proposed Target","proton","Protostars","PSA","Publication",
        "Publisher of astronomy and virtual observatory services and data archives hosted or maintained at NCI.","Pulsar","Pulsars",
        "pyrolytic","Pyrolytic","QSOs","Quasar","quasars","Quasars","QUASARS","R","Radial velocities","radial-velocity","Radial velocity",
        "RadialVelocity","RADIAL VELOCITY","radiative-transfer","radio","Radio","RADIO ABSORPTION","RADIO ANTENNAS","RADIO ASTROMETRY",
        "radio astronomy","Radio astronomy","Radio Astronomy","RADIO ASTRONOMY","Radio burst","Radio Bursts","Radio continuum",
        "radio-continuum-emission","Radio continuum emission","radio continuum: general","Radio Counterpart","Radio emission",
        "Radio galaxies","Radio Galaxies","RADIO INTERFEROMETERS","radio interferometry","radio-interferometry","RADIO INTERFEROMETRY",
        "RADIO OBSERVATORIES","Radio sources","RADIO SOURCES","RADIO SPECTRA","RADIO SPECTROGRAPHS","RADIO SPECTROMETERS",
        "Radio spectroscopy","RADIO SPECTROSCOPY","RADIO TELESCOPES","Radius","R and I","raw data archive","red giants","redshift",
        "Redshift","Redshifted","Redshifted / Redshift","Redshifts","redshift-surveys","reduced data archive","Reference frames",
        "References","Reference systems","Reflection Nebula","registry","Registry","Relativity","remote","research","Research",
        "Ring galaxies","ROSAT xray x-ray sources faint bright","ROTATION","satellite","SATELLITE BORNE INSTRUMENTS","Saturn",
        "saturnian-satellites","scans of UKST Bj","SDSS","sed","SEEING MONITORS","Semantic Mapping Service SMS","Semantics","service",
        "SETI","seyfert-galaxies","Seyfert galaxies","ShaSS i-band Catalogue","Shocks","short-red","SIA","SIAP","Simbad Database","SimDM",
        "simulation","Simulation","Simulations","Sky","Skylab","SkyMapper","SkyMapper Project Data","sky survey","Sky surveys",
        "Sloan Digital Sky Survey","Sloan photometry","Small bodies","small-magellanic-cloud","Small Magellanic Cloud",
        "SMALL MAGELLANIC CLOUD","SNR","software standard","software-tutorials","solar","Solar Activity","solar astronomy","solar cea",
        "solar corona","Solar data on events","Solar data SOHO EIT CDS Yohkoh","solar disc","Solar Flare","solar-neighborhood",
        "solar-neutrons","solar-particle-emission","solar physics","solar prominences","Solar system","Solar System",
        "solar-system-astronomy","Solar system astronomy","solar-system-planets","Solar system planets","Solar Sytem","solar wind",
        "Solar Wind","Source","source catalog","Source Event","South galactic pole","SPACE ASTRONOMY","Spacecraft Pointing",
        "Space Debris","Space observatories","SPACE OBSERVATORIES","Space Observatory","space physics","space plasma","space plasmas",
        "space plasmas physics data repository","SPACE TELESCOPES","Space Weather","Species","spectra","Spectra","spectral",
        "Spectral energy distribution","spectral-line-identification","spectrophotometry","Spectrophotometry","Spectropolarimetry",
        "Spectroscopic binary stars","SPECTROSCOPIC BINARY STARS","spectroscopic observations","spectroscopy","Spectroscopy",
        "SPECTROSCOPY","Spectrum","SPIRE","Spire Sources","Spitzer","Spitzer Taurus","SSA","SSDC VO resources","S stars",
        "standard language identifiers","standards","Standards","Standards and Technology","standard-stars","Standard stars","star",
        "Star","Star atlases","Star Cluster","StarDB: variability analysis of the Northern Sky Variability Survey","star formation",
        "Star Formation","Star forming regions","STAR-FORMING REGIONS","stars","Stars","STARS","Stars: Abundances","stars: evolution",
        "Stars:evolution","Stars: evolution","Stars: Magnetic fields","Stars: Proper Motions","Stars,Survey,Galaxy","stellar-abundances",
        "Stellar ages","Stellar associations","stellar-astronomy","Stellar astronomy","stellar astrophysics","Stellar atmosphere",
        "stellar atmospheres","stellar-atmospheres","Stellar atmospheres","Stellar atmospheric opacity","stellar catalog",
        "stellar-distance","Stellar distance","stellar evolution","Stellar evolutionary models","Stellar evolutionary tracks",
        "Stellar flares","stellar-kinematics","Stellar masses","stellar-mass-functions","Stellar mass loss","stellar-parallax",
        "Stellar populations","stellar-properties","Stellar radii","stellar spectra","stellar-spectral-types","Stellar spectral types",
        "storage capability access","strong-gravitational-lensing","Strong gravitational lensing","stucture","Subdwarf stars","subject",
        "submillimeter astronomy","Submillimeter astronomy","submillimeter survey","Sun","sunspot","SuperCOSMOS Sky Surveys SSS",
        "Supergiant stars","Supernova","supernovae","Supernovae","supernova-remnants","Supernova remnants","surface",
        "surface brightness galaxies catalog","surface-photometry","Surface photometry","survey","Survey",
        "survey catalogue galaxies quasar","surveys","Surveys","SURVEYS","Survey Source","Survey with Schmidt telescope",
        "Synthetic Stellar Spectra","SZCLUSTER-DB","tap","TAP","Taverna Server","T dwarfs","techniques: image processing",
        "TELESCOPE ARRAYS","TEMPERATURE","terminator","TGAS","The Galaxy","the-moon","The multi-frequency radio catalogs",
        "theoretical-models","Thermosphere","The Sun","time-domain-astronomy","time-series","Time Series","time-series data","Timing",
        "TNO","topography","Transient","trigonometric-parallax","Trigonometric parallax","trojan-asteroids","TRUE POSITIONS","TURBULENCE",
        "Two-color diagrams","Twomass","Type III","UBV","UBVRI","ugriz","UKIDSS","UKIDSS DR10","UKIDSS DR11","UKIDSS DR2","UKIDSS DR3",
        "UKIDSS DR4","UKIDSS DR5","UKIDSS DR6","UKIDSS DR7","UKIDSS DR8","UKIDSS DR9","Ultra High Energy","Ultraviolet",
        "ultraviolet astronomy","Ultraviolet astronomy","Ultraviolet Astronomy","Ultraviolet-excess galaxies","Ultraviolet Images",
        "Ultraviolet photometry","Ultraviolet sources","ultraviolet stellar spectra","University","UOC","Uranus","URI","USGS WMS","UV",
        "UV Astronomy","uv-ceti-stars","variability","variable","Variable","variable-stars","Variable stars","velocity moments","venus",
        "Venus","Venus Magnetosphere","VERY LARGE ARRAY","VERY LONG BASELINE INTERFEROMETERS","Very long baseline interferometry",
        "VERY LONG BASELINE INTERFEROMETRY","VHE sources","VHS","VHS DR1","VIDEO","VIKING","Vilnius photometry","virgo-cluster",
        "virtual astronomy","virtual-observatories","virtual observatory","Virtual observatory","Virtual Observatory",
        "virtual observtory","VISTA","vla","vlbi","VMC","VOSpace","vospace myspace","VVV","water maser","water-vapor",
        "weak-gravitational-lensing","web service","white dwarf","White Dwarf","White dwarfs","White Dwarfs","White dwarf stars",
        "wide area survey","Wide-band photometry","wide-field-telescopes","WiggleZ final data release","WiggleZ Project Data","WISE",
        "WISE all-sky infrared","Wolf-Rayet stars","World Data Center for Astronomy","XID Result Database","Xmatched Arches Catalogue",
        "XMM-Newton","XMM SUSS","X-ray","x-ray-astronomy","X-ray astronomy","X RAY ASTRONOMY","X-ray binary stars","X RAY OBSERVATORIES",
        "X-rays","X Rays","X-Ray Satellite Astronomy","x-ray-sources","X-ray sources","XRB","Young stellar objects","Zeus"],

    };

    let autoCompFuzzy = {
        ucd : true,
    };

    for (let field in constraintMap){
        if(field[0] == "_"){
            continue;
        }

        $("#fieldNameBar").append("<p class='clickable' tabindex='-1' id='searchable_" + field + 
            "' title='Apply to "+(constraintMap[field].table === undefined ? constraintMap._default.table: constraintMap[field].table)+ "."+
            constraintMap[field].column + "' style='padding-left:.5em;margin:0; "+
            (autoComp[field] !== undefined ? "font-style:italic;font-weight: bolder;" : "" ) +"'>" + field + "</p>"
        );

        if(autoComp[field] === undefined){
            $("#searchable_" + field).click(()=>{
                $("#mainSB").val($("#mainSB").val() + " " + field + ": " );
            });
        }else{
            $("#searchable_" + field).focus(()=>{
                // creating dropdown with element
                $("body").append("<div id='dropdown_" + field + "' class = 'dropdown_holder'><ul></ul></div>");
                
                let fillList = (elems) =>{
                    for(let i=0;i<elems.length;i++){
                        $("#dropdown_" + field + " ul").append("<li class = 'clickable' data-fuzz='"+ (autoCompFuzzy[field] === undefined ? "false": autoCompFuzzy[field]) +
                            "'>" + elems[i] + "</li>");
                    }
                };
                
                let getScore = (val,toSearch)=>{
                    if(val.length<toSearch.length){
                        return 0;
                    }
                    let a=0, c = toSearch.length;
                    let b = c;
                    while (b - a > 1 && c !=0){
                        if(val.includes(toSearch.substring(0,c))){
                            a=c;
                        }else{
                            b=c;
                        }
                        c = Math.floor((a+b)/2);
                    }
                    return a;
                };

                if(autoComp[field].length > 20){
                    $("#dropdown_" + field).prepend("<input style='width:100%'></input>").children("input").on("input",()=>{
                        let val = $("#dropdown_" + field + " input").val().trim();
                        $("#dropdown_" + field + " ul").html("");
                        if(val.length ==0){
                            fillList(autoComp[field]);
                        }else{
                            let vals = autoComp[field].map(v=>{
                                return {val:v,score:getScore(v,val)};
                            });
                            vals = vals.filter(v=>v.score>0).sort((a,b)=> {
                                if(b.score-a.score !=0){
                                    return b.score-a.score;
                                }else{
                                    return a.val.length - b.val.length;
                                }
                            });
                            fillList(vals.map(v=>v.val));
                        }
                        
                    });
                }
                fillList(autoComp[field]);

                // placing the dropdown
                let bound = document.getElementById("searchable_" + field).getBoundingClientRect();
                let drop = document.getElementById("dropdown_" + field);
                drop.style.top = bound.height;
                drop.style.minWidth = bound.width;
                drop.style.left = bound.left - (drop.clientWidth - bound.width)/2;

                // binding the events
                $("#dropdown_" + field + " li").click((e)=>{
                    let fuzz = e.target.dataset.fuzz == "true" ? "%":"";
                    $("#mainSB").val($("#mainSB").val() + " " + field + ": " + fuzz + e.target.textContent +fuzz);
                    $("#mainSB").focus();
                    $("#dropdown_" + field).remove();
                    $("#mainSB").change();
                });
            });
            $("#dropdown_" + field + " input").blur(()=>{
                setTimeout(()=>{
                    $("#dropdown_" + field).remove();
                },200);
            });
            $("#searchable_" + field).blur(()=>{
                setTimeout(()=>{
                    if(document.activeElement !== $("#dropdown_" + field + " input")[0]){ // we don't want to close the list while searching in it
                        $("#dropdown_" + field).remove();
                    }
                },200);
            });
        }
        
    }

    let bound = document.getElementById('mainSB').getBoundingClientRect();
    document.getElementById('mainSB_out').style.top = bound.bottom;

    let list = $("#mainSB_out");
    list.toggle();

    document.getElementById('mainSB').addEventListener('focus', () => {
        setTimeout(()=>{
            list.toggle();
        },200);
    });
    
    document.getElementById('mainSB').addEventListener('blur', () => {
        setTimeout(()=>{
            list.toggle();
        },200);
    });

    return sb;
}

function setupApp(logger){

    tree = new TapTreeList($("#tree"));

    let control ;
    let tablePane = new TablePane($("#tablePane"),logger);

    $(document).on("new_root_table.tree",(event, args)=>{
        if(control === undefined){
            control = new ControlPane();
            setTimeout(()=>{
                control.box.reduce();
            },1000);
        }
        tablePane.setApi(args.api);
        control.setApi(args.api);
    });
    $(document).on("error.application",(...args)=>{
        console.log("error event recieved");
        console.log(args);
    });
    $(document).on("run_query.control",()=>{
        tablePane.refresh();
    });
}

function clickOnFisrtLi(logger){
    let li = $("#mainSB_out li:first-child");
    if(li.length>0){
        li.click();
        return;
    }else{
        logger.hide();
        ModalInfo.error("The provided tap service hasn't been found");
    }
}

function setupFav(logger){
    let favDict = [
        {
            "name":"Simbad",
            "url" : "//simbad.u-strasbg.fr/simbad/sim-tap/sync",
            "description" : "Nants ingonyama bagithi baba Sithi uhhmm ingonyama",
            "title":"SIMBAD TAP query engine",
            "ivoid":"ivo://cds.simbad/tap",
        },
        {
            "name":"Chandra",
            "url" : "//cda.cfa.harvard.edu/csc2tap",
            "description" : "'It just works'",
            "title":"Chandra Source Catalog Release 2",
            "ivoid":"ivo://cxc.harvard.edu/cscr2",
        },/*
        {
            "name":"4XMM",
            "url" : "https://xcatdb.unistra.fr/4xmmdr10/tap/sync",
            "description" : "Does not work",
            "title":"TAP interface of the 4XMM XMM-Newton Catalogue",
            "ivoid":"ivo://xcatdb/4xmm/tap",
        },*/
        {
            "name":"Vizier",
            "url" : "//tapvizier.cds.unistra.fr/TAPVizieR/tap/sync",
            "description" : "Vizier aka stress test: 48k tables of astronimical data (the app may take more time when working with this service)",
            "title":"TAP VizieR query engine",
            "ivoid":"ivo://cds.vizier/tap",
        },
        {
            "name":"provtap",
            "url" : "//saada.unistra.fr/provtap/sync",
            "description" : "tap provenance demo",
            "title":"Provenance Tap model",
            "ivoid":"",
        },
        {
            "name":"Gavo",
            "url" : "//dc.zah.uni-heidelberg.de/tap/sync",
            "description" : "Where the registry is also the most reliable service so far",
            "title":"GAVO Data Center TAP service",
            "ivoid":"ivo://org.gavo.dc/tap",
        },
        {
            "name":"STSCI CAOM",
            "url" : "//vao.stsci.edu/CAOMTAP/tapservice.aspx/sync",
            "description" : "STSCI's implementation of the COAM model",
            "title":"MAST STScI CAOM and ObsCore TAP service",
            "ivoid":"ivo://archive.stsci.edu/caomtap",
        },
    ];

    $("#favbutton").html("<button id='welp' style='width:100%' class='btn btn-simple'>some popular tap services</button>"+
    "<div id='favOut' style='' class='sbOut favDropdown'></div>");

    outBuilder($("#favOut"),logger).push(favDict);

    let bound = document.getElementById('welp').getBoundingClientRect();
    document.getElementById('favOut').style.top = bound.height;
    $("#favOut ul").css("text-align","left");
    $("#favOut ul").css("list-style-type","none");
    $("#favOut li").css("padding-left",".5em");
    let list = $("#favOut");
    list.toggle();

    document.getElementById('welp').addEventListener('focus', () => {
        setTimeout(()=>{
            list.toggle();
        },200);
    });
    
    document.getElementById('welp').addEventListener('blur', () => {
        setTimeout(()=>{
            list.toggle();
        },200);
    });
}

$(document).ready(async ()=>{
    let logger = new GlobalLogger();
    logger.info("Setting up everything");
    resourceLoader.setCss([]);
    resourceLoader.setScripts([]);
    await resourceLoader.loadAll().then((result) => {
        // applying IIFE overrides right after jsResources ended his loading
        overrides();
        extend();
    });
    //buildButtonSelector("#mainButtonHolder");
    // ensure no radio button is check by default
    //$("input:radio[name=radio]:checked").prop('checked', false);
    setupSB(logger).then( async (sb)=>{
        setupApp(logger);
        setupFav(logger);
        let params = new URLSearchParams(window.location.search);
        if( params.has("url")){
            logger.info("Connecting to the service");
            let urls = params.getAll("url");
            let url, process;
            for (let i =0;i<urls.length;i++){
                url = urls[i];
                if(url.startsWith("http")){
                    url = url.substring(url.indexOf(":")+1);
                }
                process = sb.processUrl("%" + url);
                if( process !== undefined && process.then !== undefined){
                    await process;
                }

                clickOnFisrtLi(logger);
            }

        }else{
            logger.hide();
        }
    });
    
});