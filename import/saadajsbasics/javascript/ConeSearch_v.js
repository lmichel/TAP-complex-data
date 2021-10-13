/**
 * COne Search form View
 * 
 * @param params:
 *            JS object with the following fields parentDivId: ID of the parent
 *            div formName : Name of the current form frames : Arrays of the
 *            supported frames urls : JS object containing handlers processing
 *            events: sesameURL : name resolver uploadURL : Handle the upload of
 *            position lists
 */
function ConeSearch_mVc(params) {
	this.editor = params.editor;
	this.parentDivId = params.parentDivId;
	this.formName = params.formName;
	this.frames = params.frames, this.sesameURL = params.urls.sesameURL;
	this.uploadURL = params.urls.uploadURL;
	this.preloadedGetter = params.preloadedGetter; //function returning a list of position files already uploaded
	this.cooFieldId = this.formName + "_CScoofield";
	this.radiusFieldId = this.formName + "_CSradiusfield";
	this.frameSelectId = this.formName + "_CSframeselect";
	this.uploadId = this.formName + "_CSupload";
	this.sesameId = this.formName + "_CSsesame";
	this.stackId = this.formName + "_CSstack";
	this.regionId = this.formName + "_CSregion";
	parentId = this.parentDivId;
};
/**
 * Methods prototypes
 */
ConeSearch_mVc.prototype = {
		/**
		 * Draw the field container
		 */
		draw : function() {
			if (this.frames == null || this.frames.length == 0) {
				this.frames = [ 'ICRS' ];
			}
			var html = '<fieldset class="fieldiv col-sm-6" style="width:320px;">'
				+ '  <legend> Cone Search Setup </legend>'
				+ '     <form style="background: transparent;" class="form-horizontal">'
				+ '		  <div class="form-group">'
				+ '         <label class="col-sm-4 control-label">Coord/Name</label>'
				+ '         <div class="col-sm-6" style="padding-right: 5px;">'
				+ '           <input type=text id="'
				+ this.cooFieldId
				+ '" class="inputvalue form-control input-sm"/>'
				+ '		    </div>'
				+ '		    <div class="col-sm-2" style="padding-left: 1px;">'
				+ '           <a href="javascript:void(0);" id="'
				+ this.sesameId
				+ '" title="Invoke the CDS name resolver" class="sesame-small"></a>'
				+ '       </div>'
				+ '		  <div class="form-group" style="margin-bottom: 0px;">'
				+ '         <label class="col-sm-12 control-label" style="padding-top: 0px;"><span class="help">12.5 +45.8 - 14:03:01.01+54:23:41.6 - M33 </span></label>'
				+ '       </div>'
				+ '    </div>'
				+ '		  <div class="form-group">'
				+ '         <label class="col-sm-4 control-label">Radius(arcmin)</label>'
				+ '         <div class="col-sm-8">'
				+ '           <input type=text id="'
				+ this.radiusFieldId
				+ '" class="inputvalue form-control input-sm" value="1" />'
				+ '       </div></div>'
				+ '		  <div class="form-group" style="margin-bottom: 5px;">'
				+ '         <label class="col-sm-4 control-label">System</label>'
				+ ' 	    <div class="col-sm-8">'
				+ '        	  <select id="'
				+ this.frameSelectId
				+ '" class="form-control input-sm">'
				+ '      	  </select>'
				+ '       </div></div>'
				+ '       <div><span id='
				+ this.regionId
				+ ' class="action activehover" style="margin-right: 10px; float:none;">Draw a Search Region</span>'
				+ '       <span id="'
				+ this.uploadId
				+ '" class="action activehover" style="float:none;">Upload Position List</span></div>'
				+ '       <div style="display: inline; float: right;"><span class=help id="uploadresult"></span></div>'
				+ '       </div>' + '</fieldset>';
			$('#' + this.parentDivId).append(html);
			var s = $('#' + this.frameSelectId);
			for (var i = 0; i < this.frames.length; i++) {
				s.append('<option value=' + this.frames[i] + '>' + this.frames[i]
				+ '</option>');
			}

			this.setUploadForm();
			this.setSesameForm();
		},
		setRegionForm : function(handler) {
			var that = this;
			$('#' + this.regionId).click(function() {
				var dv = null;
				if (that.editor) {
					dv = that.editor.getDefaultValue();
				}
				if( dv == null ) {
					Modalinfo.info("Please, define first a search position before to edit a region", "No Target Defined")
				} else {
					Modalinfo.region(handler, dv
						// , [84.24901652054093, -5.640882748140112,83.34451837951998,
						// -6.103216341255678,83.60897420186223, -4.553808802262613]
					);
				}
			});
		},
		setUploadForm : function() {
			var that = this;
			var handler = (this.uploadURL != null) ? function() {
				Modalinfo.uploadForm("Upload a list of position", that.uploadURL,
						"Upload a CSV position list<br>Search radius (optional) are in arcmin",
						function(returnedPath) {
					var msg;
					if (returnedPath.retour.name != undefined
							&& returnedPath.retour.size != undefined) {
						msg = " File " + returnedPath.retour.name
						+ ' uploaded<br>'
						+ returnedPath.retour.positions
						+ ' positions';
					} else {
						msg = JSON.stringify(returnedPath.retour);
					}
					$('span#uploadresult').html(msg);
					that.editor.firePoslistUpload(returnedPath.path.filename, $('#' + that.radiusFieldId).val());
					Modalinfo.close();
				}, function() {
					$('span#uploadresult').text('');
				});
			} : function() {
				Modalinfo.info("Upload not implemented yet");
			};
			$('#' + this.uploadId).click(handler);

		},
		setSesameForm : function() {
			var that = this;
			var inputfield = $('#' + this.cooFieldId);
			var handler = (this.sesameURL != null) ? function() {
				Processing.show("Waiting on SESAME response");
				$.getJSON("sesame", {
					object : inputfield.val()
				}, function(data) {
					Processing.hide();
					if (Processing.jsonError(data, "Sesame failure", "Name "+inputfield.val()+" cannot be resolved")) {
						return;
					} else {
						inputfield.val(data.alpha + ' ' + data.delta);
						if (that.editor != undefined) {
							that.editor.listener.controlAttributeEvent(that.editor.fieldListView.getSearchParameters(), that.editor.constListId);
							$("#" + that.editor.constListId + " span.help").attr("style","display:none;");
							that.editor.fieldListView.resetPosition();
						}
					}
				});
			} : function() {
				Modalinfo.info("name resolver not implemented yet");
			};
			$('#' + this.sesameId).click(handler);

		},
		hasSearchParameters : function() {
			var coo = $('#' + this.cooFieldId).val();
			var radius = $('#' + this.radiusFieldId).val();
			if (coo.trim() == "" || isNaN(radius)) {
				return false;
			} else {
				return true;
			}
		},
		getSearchParameters : function() {
			var coo = $('#' + this.cooFieldId).val();
			var radius = $('#' + this.radiusFieldId).val();
			var frame = $('#' + this.frameSelectId + '  option:selected').text();
			if (coo.trim() == "") {
				Modalinfo.error("No coordinates given");
				return null;
			} else if (isNaN(radius)) {
				Modalinfo.error("Radius field requires a numerical value");
				return null;
			} else {
				return {
					type : "cone",
					position : coo,
					radius : radius,
					frame : frame
				};
			}
		},
		resetPosition : function() {
			$('#' + this.cooFieldId).val("");
		},
		fireClearAllConst : function() {
			var that = this;
			$('#' + this.cooFieldId).val('');
		}

};

/**
 * Used for merged catalogues 3XMM
 * 
 * @param params
 * @returns {SimplePos_mVc}
 */
function SimplePos_mVc(params) {
	ConeSearch_mVc.call(this, params);
	this.queryView = params.queryView;
};

/**
 * Method overloading
 */
SimplePos_mVc.prototype = Object
.create(
		ConeSearch_mVc.prototype,
		{
			/**
			 * Draw the field container
			 */
			draw : {
				value : function() {
					var that = this;
					if (this.frames == null || this.frames.length == 0) {
						this.frames = [ 'ICRS' ];
					}
					var html = '<div style="background: transparent;"  class="form-inline">'
						+ '		  <div class="form-group">'
						+ '         <label style="margin-left:7px;">Coord/Name</span>'
						+ '         <input type=text id="'
						+ this.cooFieldId
						+ '" class="inputvalue form-control input-sm"/>'
						+ '       	<a href="javascript:void(0);" id="'
						+ this.sesameId
						+ '" title="Invoke the CDS name resolver" class="sesame-small"></a><br><span class="help">12.5 +45.8 - 14:03:01.01+54:23:41.6 - M33 </span>'
						+ '       </div>'
						+ '		  <div class="form-group">'
						+ '         <label style="margin-right: 7px;">Radius(arcmin)</label>'
						+ '         <input type=text id="'
						+ this.radiusFieldId
						+ '" class="inputvalue form-control input-sm" style="width: 40px;" value="1" />'
						+ '       </div>'
						+ '		  <div class="form-group">'
						+ '         <label style="margin-right: 7px;">System</label>'
						+ ((this.frames != null) ? '      <select class="form-control input-sm" id="'
								+ this.frameSelectId + '" >'
								: '')
								+ '         </select>'
								+ '       </div>'
								+ '       <div class="form-group" style="margin-top: 6px;">'
								+ '			<span id='
								+ this.regionId
								+ ' class="datafield activehover" style="float: none;margin-left: 10px;">Draw a Search Region</span>'
								+ '         <span class="datafield activehover help-block" id="'
								+ this.uploadId
								+ '" style="float: none;margin-left: 10px;">Upload Position List</span>'
								+ '       </div></div>'
								+ '      <div style="overflow: hidden; float:right;">'
								+ '         <span class=help id="uploadresult"></span>'
								+ '      </div>';
					$('#' + this.parentDivId).append(html);
					var s = $('#' + this.frameSelectId);
					for (var i = 0; i < this.frames.length; i++) {
						s.append('<option value=' + this.frames[i]
						+ '>' + this.frames[i] + '</option>');
					}
					this.setUploadForm();
					this.setSesameForm();

					that.setRegionForm(
							function(data){
								if( data.userAction ){
									if( data.region.size.x > 5 || data.region.size.y > 5) {
										Modalinfo.error("The region size can't exceeded 5 deg. \nIts actual size is " + JSON.stringify(data.region.size));
									} else { 
										if( data && data.userAction && data.isReady ) {
											var rq = '';
											if( data.region.format == "array2dim") {
												rq = '';
												for( var i=0 ; i<(data.region.points.length - 1) ; i++ ) {
													if( i > 0 ) rq += " ";
													rq += data.region.points[i][0] + " " + data.region.points[i][1];
												}

											} else if( data.region.format == "array") {
												rq = '';
												for( var i=0 ; i<data.region.points.length  ; i++ ) {
													if( i > 0 ) rq += " ";
													rq += data.region.points[i];
												}

											} else {
												Modalinfo.error(data.region.format + " not supported region format");
											}

											if( rq != '' ) {
												var radius = $('#' + that.radiusFieldId).val();
												var frame = $(
														'#' + that.frameSelectId
														+ '  option:selected').text();
												that.updateQueryRegion(rq, radius, frame);
												Modalinfo.closeRegion();
											}
										}
									}
								}
							});

					$('#' + this.cooFieldId).keyup(function(event) {
						if (event.which == 13) {
							event.preventDefault();
						} else {
							that.readAndUpdate();
						}
					});
					$('#' + this.cooFieldId).click(function(event) {
						that.readAndUpdate();
					});
					/*
					 * Invoked when  value is pasted with the mouse
					 */
					$('#' + this.cooFieldId).bind('input propertychange', function (e) {
						that.readAndUpdate();
					});
					
					$('#' + this.radiusFieldId).keyup(function(event) {
						if (event.which == 13) {
							event.preventDefault();
						} else {
							that.readAndUpdate();
						}
					});
					$('#' + this.radiusFieldId).click(function(event) {
						that.readAndUpdate();
					});
					/*
					 * Invoked when  value is pasted with the mouse
					 */
					$('#' + this.radiusFieldId).bind('input propertychange', function (e) {
						that.readAndUpdate();
					});

					$('#' + this.frameSelectId).change(function(event) {
						that.readAndUpdate();
					});
				}
			},
			readAndUpdate : {
				value : function() {
					var coo = $('#' + this.cooFieldId).val();
					var radius = $('#' + this.radiusFieldId).val();
					var frame = $(
							'#' + this.frameSelectId
							+ '  option:selected').text();
					this.updateQuery(coo, radius, frame);
				}
			},
			setUploadForm : {
				value : function() {
					var that = this;
					var handler = (this.uploadURL != null) ? function() {
						Modalinfo
						.uploadForm(
								"Upload a list of position",
								that.uploadURL,
								"Upload a CSV position list<br>Search radius (optional) are in arcmin",
								function(returnedPath) {
									var msg;
									if (returnedPath.retour.name != undefined
											&& returnedPath.retour.size != undefined) {
										msg = returnedPath.retour.name
										+ ' uploaded, '
										+ returnedPath.retour.positions
										+ ' positions';
									} else {
										msg = JSON
										.stringify(returnedPath.retour);
									}
									$(
											'#'
											+ that.parentDivId
											+ ' span#uploadresult')
											.html(msg);
									$('#' + that.cooFieldId)
									.val(
											"poslist:"
											+ returnedPath.retour.name);
									/*
									 * This value is taken by default, must not be set to null
									 */
//									$('#' + that.radiusFieldId)
//									.val("0");
									that.readAndUpdate();
								}, 
								function() {
									$('span#uploadresult')
									.text('');
								}
								);
					}
					: function() {
						Modalinfo
						.info("Upload not implemented yet");
					};
					$('#' + this.uploadId).click(handler);

				}
			},
			setSesameForm : {
				value : function() {
					var that = this;
					var inputfield = $('#' + this.cooFieldId);
					var handler = (this.sesameURL != null) ? function() {
						Processing.show("Waiting on SESAME response");
						$.getJSON("sesame", {
							object : inputfield.val()
						}, function(data) {
							Processing.hide();
							if (Processing.jsonError(data,
									"Sesame failure")) {
								that.updateQuery('', '', null);
								return;
							} else {
								inputfield.val(data.alpha + ' '
										+ data.delta);
								that.readAndUpdate();
							}
						});
					}
					: function() {
						Modalinfo
						.info("name resolver not implemented yet");
					};

					$('#' + this.sesameId).click(handler);
				}
			},
			updateQuery : {
				value : function(coord, radius, frame) {
					if (this.queryView != null) {
						this.queryView.fireDelConstraint(this.formName,
								"position");
						if (coord != '' && radius != '') {
							this.queryView
							.fireAddConstraint(
									this.formName,
									"position",
									'    isInCircle("'
									+ coord
									+ '", '
									+ radius
									+ ', '
									+ ((frame == "FK5") ? "J2000"
											: (frame == "FK4") ? "J1950"
													: '-')
													+ ', ' + frame
													+ ')');
						}
					} else {
						Out.info("No query view");
					}
				}
			},
			updateQueryRegion : {
				value : function(coord, radius, frame) {
					if (this.queryView != null) {
						this.queryView.fireDelConstraint(this.formName,
								"position");
						if (coord != '' && radius != '') {
							this.queryView
							.fireAddConstraint(
									this.formName,
									"position",
									'    isInRegion("'
									+ coord
									+ '", '
									+ radius
									+ ', '
									+ ((frame == "FK5") ? "J2000"
											: (frame == "FK4") ? "J1950"
													: '-')
													+ ', ' + frame
													+ ')');
						}
					} else {
						Out.info("No query view");
					}
				}
			},
			fireClearAllConst : {
				value : function() {

					var that = this;
					$('#' + this.cooFieldId).val('');
					that.readAndUpdate();
				}
			}
		});

/**
 * Used for Taphandle params.postUploadHandler is invoked after the upload
 * succeed It recieved the an object as parameter {name: filename, size:
 * filesize, positions: num of valid positions}
 * 
 * @param params
 * @returns {SimplePos_mVc}
 */
function TapSimplePos_mVc(params) {
	SimplePos_mVc.call(this, params);
	this.handler = this.editor.fireInputCoordEvent;
	this.postUploadHandler = params.postUploadHandler;
	this.uploadedFile = "";
};

/**
 * Method overloading
 */
TapSimplePos_mVc.prototype = Object.create(
		SimplePos_mVc.prototype,
		{
			/**
			 * Draw the field container
			 */
			draw : {
				value : function() {
					var that = this;
					if (this.frames == null || this.frames.length == 0) {
						this.frames = [ 'ICRS' ];
					}
					var html = '<div>'
						+ ' <div class="tapPos">'
						+ '       <span class=help style="display: inline-block; width: 7em; margin-right: 0px;">Coord/Name</span>'
						+ '       <input type=text id="'
						+ this.cooFieldId
						+ '" class=inputvalue  size=18 />'
						+ '       <a href="javascript:void(0);" id="'
						+ this.sesameId
						+ '" title="Invoke the CDS name resolver" class="sesame-small"></a><br><span class="help">12.5 +45.8 - 14:03:01.01+54:23:41.6 - M33 </span>'
						+ '       <span class=help >System</span>'
						+ ((this.frames != null) ? '      <select id="'
								+ this.frameSelectId + '" >'
								: '')
								+ '      </select>'
								+ ' </div>'
								+ ' <div class="tapPos">'
								+ '       <span class=help style="margin-right:3px;">Radius(arcmin)</span>'
								+ '       <input type=text id="'
								+ this.radiusFieldId
								+ '" class=inputvalue style="width: 40px;" value="1" />'
								+ '       <input class=stackconstbutton id="'
								+ this.stackId
								+ '" type="button"/>'
								+ '       <input type=button id="'
								+ this.uploadId
								+ '" value="Upload Position List" title="Active for services supporting uploads" disabled=true />'
								+ '</div>'
								+ '       <div>'
								+ '            <span class=help id="uploadresult"></span>'
								+ '       </div>' + ' </div>';
					$('#' + this.parentDivId).append(html);
					var s = $('#' + this.frameSelectId);
					for (var i = 0; i < this.frames.length; i++) {
						s.append('<option value=' + this.frames[i]
						+ '>' + this.frames[i] + '</option>');
					}
					this.setUploadForm();
					this.setSesameForm();
					$('#' + this.stackId).click(function() {
						that.readAndUpdate();
					});
					$('#' + this.cooFieldId).keyup(function(event) {
						if (event.which == 13) {
							that.readAndUpdate();
						}
					});
					// $('#' + this.cooFieldId
					// ).click(function(eventObject) {
					// that.readAndUpdate();
					// });
					$('#' + this.radiusFieldId).keyup(function(event) {
						if (event.which == 13) {
							that.readAndUpdate();
						}
					});
					// $('#' + this.radiusFieldId
					// ).click(function(eventObject) {
					// that.readAndUpdate();
					// });
					$('#' + this.frameSelectId).change(function(event) {
						that.readAndUpdate();
					});
				}
			},
			readAndUpdate : {
				value : function() {
					this.uploadedFile = "";
					var coo = $('#' + this.cooFieldId).val();
					var radius = $('#' + this.radiusFieldId).val();
					var frame = $(
							'#' + this.frameSelectId
							+ '  option:selected').text();
					if (coo.length == 0) {
						Modalinfo.error("No coordinates given",
						"input error");
					} else if (radius.length == 0) {
						Modalinfo.error("No radius given",
						"input error");
					} else if (!$.isNumeric(radius)) {
						Modalinfo.error("Radius must be numeric",
						"input error");
					} else {
						var rd = coo.split(/\s+/);
						if (coo.startsWith('poslist:') ) {
							this.uploadedFile = coo.replace('poslist:',
							'');
							this.editor.fireInputCoordEvent(coo, null,
									radius, frame);
						} else if (rd.length != 2) {
							Modalinfo
							.error("Coordinates must be separated with a blank",
							"input error");
						} else if (!$.isNumeric(rd[0])
								|| !$.isNumeric(rd[1])) {
							Modalinfo.error("Radius must be numeric",
							"input error");
						} else {
							this.editor.fireInputCoordEvent(rd[0],
									rd[1], radius, frame);
						}
					}
				}
			},
			supportUpload: {
				value : function(supportUpload) {
					var inp = $('#' + this.uploadId);
		
					inp.prop('disabled', !supportUpload);
					if( supportUpload ){
						inp.prop('title', 'Upload supported by the current node');
					} else  {
						inp.prop('title', 'Upload not supported by the current node');
					}
				}
			},
			setUploadForm : {
				value : function() {
					var that = this;
					var handler = (this.uploadURL != null) ? function() {
						var radius = $('#' + that.radiusFieldId).val();
						if (radius == "") {
							Modalinfo.error("Radius must be set");
						} else if (that.editor.isReadyToUpload()) {
							var preloadedFiles = ( that.preloadedGetter != null )? that.preloadedGetter():[];
							Modalinfo.uploadForm(
									"Upload a list of position",
									that.uploadURL,
									"Upload a CSV position list (ra dec or object name)",
									function(returnedPath) {
										var msg;
										if (returnedPath.retour.nameVot != undefined
												&& returnedPath.retour.positions != undefined) {
											$('#' + parentId.split("_")[0] +'_delconstlist').click();
											msg = returnedPath.retour.nameVot
											+ ' uploaded, '
											+ returnedPath.retour.positions
											+ ' positions';
											$('#' + that.cooFieldId).val(
															"poslist:"
															+ returnedPath.retour.nameVot);
											$('#' + that.parentDivId + ' span#uploadresult').html(msg);
											that.readAndUpdate();
											if (that.postUploadHandler != null) {
												that.postUploadHandler(returnedPath.retour);
											}
											Modalinfo.close();
										} else {
											Modalinfo.error(
													returnedPath,
													"Upload Failure");
										}
									}, function() {
										$('span#uploadresult').text('');
									}, [ {
										name : 'radius',
										value : radius
										},{
										name : 'jsessionid',
										value : sessionID
									} ]
									,preloadedFiles);
						}
					}
					: function() {
						Modalinfo
						.info("Upload not implemented yet");
					};
					$('#' + this.uploadId).click(handler);

				}
			},
			setSesameForm : {
				value : function() {
					var that = this;
					var inputfield = $('#' + this.cooFieldId);
					var handler = (this.sesameURL != null) ? function() {
						Processing.show("Waiting on SESAME response");
						$.getJSON("sesame", {
							object : inputfield.val()
						}, function(data) {
							Processing.hide();
							if (Processing.jsonError(data,
									"Sesame failure")) {
								that.updateQuery('', '', null);
								return;
							} else {
								inputfield.val(data.alpha + ' '
										+ data.delta);
								that.readAndUpdate();
							}
						});
					}
					: function() {
						Modalinfo
						.info("name resolver not implemented yet");
					};

					$('#' + this.sesameId).click(handler);
				}
			},
			updateQuery : {
				value : function(coord, radius, frame) {
					if (this.queryView != null) {
						this.queryView.fireDelConstraint(this.formName,
								"position");
						if (coord != '' && radius != '') {
							this.queryView
							.fireAddConstraint(
									this.formName,
									"position",
									'    isInCircle("'
									+ coord
									+ '", '
									+ radius
									+ ', '
									+ ((frame == "FK5") ? "J2000"
											: (frame == "FK4") ? "J1950"
													: '-')
													+ ', ' + frame
													+ ')');
						}
					} else {
						Out.info("No query view");
					}
				}
			},
			fireClearAllConst : {
				value : function() {
					$('#' + this.cooFieldId).val('');
					this.readAndUpdate();
				}
			}
		});
