function HipsExplorer_mVc(params){
	this.aladinInstance = params.aladinInstance;
	this.parentDivId = params.parentDivId;
	this.title       = params.title;
	this.formName    = params.formName;
	this.handler     = params.handler;
	this.maskId      = this.formName + "_mask";
	this.productType = params.productType;
	this.target      = params.target
	this.baseUrl ="http://alasky.unistra.fr/MocServer/query?RA=" 
		+ this.target.ra + "&DEC=" + this.target.dec + "&SR=" + this.target.fov + "&fmt=json&get=record&logic=or";
	this.imageIdPattern = new RegExp(/.*\/C\/.*/);
	this.imageTilePattern = new RegExp(/.*((jpeg)|(png)).*/);

};


/**
 * Methods prototypes
 */
HipsExplorer_mVc.prototype = {
		/**
		 * Draw the field container
		 */
		draw : function() {
			var that = this;
			var html = '<input type="text" id="' + this.maskId + '" size=10>\n';
			$('#' + this.parentDivId).html(html);

			$('#' + this.maskId).keyup(function(e) {
				if( $(this).val().length >= 2 || e.which == 13) {
					that.searchHisp($(this).val());
				}
			});

		},

		searchHisp: function(mask){
			var that = this;
			if( this.aladinInstance != undefined ) {
				var radec = this.aladinInstance.getRaDec();
				this.baseUrl ="http://alasky.unistra.fr/MocServer/query?RA=" 
					+ radec[0] + "&DEC=" + radec[1] + "&SR=" + this.aladinInstance.getFov()[0] + "&fmt=json&get=record&casesensitive=false";
			}
			var url = this.baseUrl;

			if( mask != "" ){
				url += "&publisher_id,publisher_did,obs_id,obs_title,obs_regime=*"  + mask + "*";
			}
			$.getJSON(url, function(jsondata) {
				Processing.hide();
				if( Processing.jsonError(jsondata,url) ) {
					return;
				} else {
					if( that.productType != undefined ){
						for(var i = jsondata.length - 1; i >= 0; i--) {
							if(jsondata[i].dataproduct_type != that.productType ) {
								jsondata.splice(i, 1);
							}
						}
						/*
						 * Only keep survey supported buy AladinLite
						 */
						if( that.productType == "image" ){
							for(var i = jsondata.length - 1; i >= 0; i--) {
								var keepIt = 0;
								//if( that.imageIdPattern.test(jsondata[i]) ) {
									if(  $.isArray(jsondata[i].hips_tile_format)) {
										for( var j=0 ; j<jsondata[i].hips_tile_format.length ; j++){
											if( that.imageTilePattern.test(jsondata[i].hips_tile_format[j]) ){
												keepIt = 1;
												break;
											}
										}
									} else if(  that.imageTilePattern.test(jsondata[i].hips_tile_format) ){
										keepIt = 1;
									}
								//}
								if( keepIt == 0 ){
									jsondata.splice(i, 1);
								}
							}
						}
					}
					that.handler(jsondata);
				}
			});
		},
		setMaskValue: function(string){
			$('#' + this.maskId).val(string);
		}

}