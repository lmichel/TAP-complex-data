
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

            let api = new jw.Api();
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
                                Modalinfo.error("can't connect to the select service");
                                console.error(connect.error);
                                }
                            });
                        }
                    });
                }
                ologger.hide();
            });
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
        "vox:wcs_coordrefpixel","vox:wcs_coordrefvalue","weight"]
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
    "<div id='favOut' style='' class='sbOut'></div>");

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
    setupSB(logger).then((sb)=>{
        setupApp(logger);
        setupFav(logger);
        let params = new URLSearchParams(window.location.search);
        if( params.has("url")){
            logger.info("Connecting to the service");
            let url = params.get("url");
            if(url.startsWith("http")){
                url = url.substring(url.indexOf(":")+1);
            }
            let process = sb.processUrl("%" + url);
            if( process !== undefined && process.then !== undefined){
                process.then(()=>{
                    clickOnFisrtLi(logger);
                });
            }else{
                clickOnFisrtLi(logger);
            }

        }else{
            logger.hide();
        }
    });
    
});