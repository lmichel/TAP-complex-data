function DataTreeView() {
	/**
	 * default node list
	 * The nodes given here must be initialized in Nodebase.java
	 */
	this.nodeList = new Array();
	this.reports = {};
	/**
	 * Metadata of the data files referenced in the Goodies node
	 */
	this.goodies = new Array();
	this.dataTreePath = null;
	this.capabilities = null;
	this.info = null;
}
DataTreeView.prototype = {
		initNodeBase : function(){
			var that = this;
			syncIt( () =>{
				$(".logo").attr("class", "logourbana");
				$.ajax({
					async: false,
					type: 'GET',
					dataType: 'json',
					url: "availablenodes",
					error: function() {
						Modalinfo.error("availablenodes failure") ;
					},
					success: function(data) {
						$("title").text("TapHandle " + data.version)
						sessionID = data.sessionID;
						for( var i=0 ; i<data.nodes.length ; i++) {
							that.nodeList[that.nodeList.length] = {
									id   :  data.nodes[i].key
									, text : data.nodes[i].key+ ' [' + data.nodes[i].description + ']'
									, ivoid: data.nodes[i].ivoid 
									, url: data.nodes[i].url
									, description: data.nodes[i].description
									, extra: "<br>" +data.nodes[i].url + "<br>" +data.nodes[i].ivoid + "<br>"};
						}
						$('input#node_selector').jsonSuggest(
								{data: that.nodeList
									, minCharacters: 0
									, onSelect: function(data){
										var key = $('#node_selector').val().split(' ')[0];
										that.fireNewNodeEvent(key);
										$('#node_selector').val(key);
									}
								});
						setTimeout('$(".logourbana").attr("class", "logo")', 2000);
					}
				});
			});
		},

		fireNewNodeEvent: function(nodekey) {
			var that = this;
			Processing.show("Waiting on " + nodekey + " node description");

			$.getJSON("getnode", {jsessionid: sessionID, node: nodekey }, function(jsdata) {
				Processing.hide();
				if( Processing.jsonError(jsdata, "Cannot make data tree") ) {
					return;
				} else {
					Processing.show("Building node");
					that.fireBuildTree(jsdata);
					Processing.hide();
				}
			});

			$("body").removeClass("with-bg");
			$(".home-panel").hide();
			$(".content-panel").show();

			// Hide the query panel to permits the result panel to be bigger
			if ($("#queryformpane").is(":visible") && $("#resultpane").find("table").length == 0) {
				$("#toggle-query").trigger( "click" );
			}

			// Hide the query panel if the user didnt open a table
			if ($("#resultpane").find("table").length == 0) {
				$("#queryformpane").hide();	
				$("#toggle-query").hide();
			}
		},

		fireBuildTree: function(jsdata) {
			/*
			 * Prevent to close the page with data
			 */
			PageLocation.confirmBeforeUnlaod();		
			$("div#treedisp").jstree("close_all", -1);

			Processing.show("Waiting for the constrution of the tree");
			this.capabilities = {supportSyncQueries: true
					        , supportAsyncQueries: (jsdata.asyncsupport == "true")?true: false
							, supportJoin: true
							, supportUpload:(jsdata.uploadsupport == "true")?true: false};
			this.info = {url: jsdata.nodeurl , ivoid: null, description: "Not available"};
			this.reports[jsdata.nodekey] = {"info": this.info, "capabilities": this.capabilities};

			$("div#treedisp").jstree("remove","#" + jsdata.nodekey);
			/*
			 * Create the root of the subtree of this node
			 */
			var description="No description available";
			for( var i=0 ; i<this.nodeList.length ; i++ ) {
				var n = this.nodeList[i];
				if( n.id ==  jsdata.nodekey) {
					this.info.ivoid = n.ivoid;
					this.info.description = n.description;
					description = jsdata.nodeurl + "\n" + n.ivoid + "\n" + n.description + "\n" ;
					break;
				}
			}
			description += "\n- Asynchronous mode  " + ((!this.capabilities.supportAsyncQueries)?" not ": "") + "supported\n";
			description += "- Table upload " + ((!this.capabilities.supportUpload)?" not ": "") + "supported\n";
			$("div#treedisp").jstree("create_node"
					, $("div#treedisp")
					, false
					, {"data" : {"icon": "images/Database2.png", "attr":{"id": jsdata.nodekey, "title": /*description*/ "Double click to filter the visible tables"}, "title" : jsdata.nodekey},
						"state": "closed"}
					,false
					,true);  

			/*
			 * Create first the first level tree (schemas)
			 */
			var nb_schemas = 0;
			var MAX_SCHEMA=20;
			var MAX_TABLE_PER_SCHEMA=40;
			var trunc = new Array();

			for( var i=0 ; i<jsdata.schemas.length ; i++ ) {					

				var id_schema = jsdata.nodekey + "X" + jsdata.schemas[i].name;
				var description = jsdata.schemas[i].description;

				var schemaName = jsdata.schemas[i].name;		
				if( i > MAX_SCHEMA && jsdata.schemas[i].name != "ivoa"   && jsdata.schemas[i].name != "tap_schema") {
					trunc[trunc.length] = schemaName;
				} else {
					if(schemaName.match(/TAP_SCHEMA/i) ) {
						icon = "images/Redcube2.png";
						description = "Schema containing the description of the published tables";
					} else if(schemaName.match(/ivoa/i) ) {
						icon =  "images/Greencube2.png";
						description = "Tables matching IVOA data models (e.g. ObsCore)";
					} else {
						icon =  "images/Bluecube2.png";
						if( description == "") {
							description = "No Description Available";
						}
					}
					description += "\n\n[CLICK] on the branch node to display the tables";
					description += "\n[DOUBLE CLICK] to filter the table list";
					$("div#treedisp").jstree("create_node"
							, $("#" + jsdata.nodekey)
							, false
							, {"data" : {"icon": icon, "attr":{"id": id_schema, "title": description}, "title" : jsdata.schemas[i].name},
								"state": "closed",
								"attr" :{"id": id_schema}}
							,false
							,true);   
				}
			}
			/*
			 * add leaves (tables) the the schemas
			 */
			var nb_tables = 0;

			for( var i=0 ; i<jsdata.schemas.length ; i++ ) {

				var schema = jsdata.schemas[i];
				var id_schema = jsdata.nodekey + "X" + schema.name;
				if( i > MAX_SCHEMA && schema.name != "ivoa"   && schema.name != "tap_schema") {
					//trunc[trunc.length] = schema.name;
				} else {
					var root = $("#" + id_schema);
					nb_tables = 0;
					/*
					 * We scan from the end to preserve the natural ordering because JSTREE stacks new nodes
					 */
					for( var j=(schema.tables.length-1) ; j>=0 ; j-- ) {
						var table = schema.tables[j];
						var id_table = jsdata.nodekey + ";" + schema.name + ";" + table.name;
						var description = table.description;
						if( description == "") {
							description = "No Description Available";
						}
						description += "\n Double click or drag and drop to display it"

						$("div#treedisp").jstree("create_node"
								, root
								, false
								, {"data"  : {"icon": "images/SQLTable2.png",
									          "attr":{"id": id_table, "title": description, "class":"icon-table"}, 
									          "title" : table.dataTreePath.table},
									"state": "closed",
									"attr" : {"id": id_table, "dataTreePath": JSON.stringify(table.dataTreePath)}
								}
								,false
								,true);   
						if( (nb_tables++) > MAX_TABLE_PER_SCHEMA ) {
							break;
						}

					}
				}
			}
			$( "div#treedisp").jstree('close_all', -1);	
			var msg = "";
			if(jsdata.truncated != null  ) {
				msg = "TRUNCATED TABLE LIST: The table list has been truncated by the server (< 20 tables/schema)";
			} 
			if( trunc.length > 0 ) {
				msg += "\nTRUNCATED SCHEMA: The list of schemas has been truncated. \nThe following schemas are not displayed [" + trunc.join("\n") + "]";
			}
			if( msg != "" ) {
				Modalinfo.info(msg + "\n\nDouble click on the '" + jsdata.nodekey + "' node to make you own selection");
			}
			/*
			 * Activate leaves
			 */
			$("div#treedisp").find("li").each(function() {
				if ($(this).attr("id") != undefined && $(this).find(".metadata").length == 0) {
					var splited = $(this).attr("id").split(';');

					if( $(this).attr("dataTreePath") != undefined){
						var dataTreePath = jQuery.parseJSON($(this).attr("dataTreePath"));
						$(this).find("ins:first").after("<img class='metadata' src='images/metadata.png' title='Show metadata (Does not work with Vizier)'/>");
						$(this).find("ins:first").next("img").click(function() {
							/*
							 * Add the node key to the datadataTreePath provided by the server and attached to the node
							 */
							dataTreePath.nodekey = splited[0];
							resultPaneView.fireShowMetaNode(dataTreePath);
						});

						$(this).find("ins:first").click(function() {
							$(this).next().next().dblclick();
						});
					}
				}
			});
			$("div#treedisp").jstree("open_node", $('li.jstree-closed').first() );

			$("#"+jsdata.nodekey).before("<img class='metadata' src='images/metadata.png' title='Click to get more info' onclick='dataTreeView.showNodeInfos(&quot;" + jsdata.nodekey + "&quot;);'/>");
			this.setTitlePath({nodekey: jsdata.nodekey});
			Processing.hide();
		},

		fireTreeNodeEvent:function(datadataTreePath, andsubmit) {
			ViewState.fireDoubleClickOK(datadataTreePath);
			tapView.fireTreeNodeEvent(datadataTreePath, andsubmit);	
		},
		/**
		 * jsdata: {nodekey: ... , table: ..., date : ..., posNb: ... }
		 */
		addGoodies: function(jsdata){
			var id_schema = "GoodiesX" + jsdata.nodekey;
			
			var desc ="Creation : " + jsdata.date + "\nPositions: " + jsdata.posNb;
			
			if( $("#" + id_schema).length == 0 ){
				$("div#treedisp").jstree("create"
						, $("#goodies")
						, false
						, {"data" : {"attr":{"id": id_schema, "title": "Uploaded source lists"}, "title" : jsdata.nodekey},
							"state": "closed",
							"attr" :{"id": id_schema},

						}
						, false
						, true); 
			} else 	if( $("#" + id_schema + " #" + jsdata.table).length != 0 ){
				Modalinfo.error( "Node " + jsdata.nodekey + "." + jsdata.table + " already exist" );
				return;
			}
			if( $("#" + id_schema + " #" + jsdata.table).length == 0 ){
				var noneName = jsdata.table.replace(new RegExp('_xml$'), '');
				$("div#treedisp").jstree("create"
						, $("#" + id_schema)
						, false // position
						, {"data"  : {"icon": "images/SQLTable2.png", "attr":{"id": noneName, "title": desc}, "title" : noneName},
							"state": "closed"
						}
						,false// callback
						,true //skip rename
				);   
			}
			dataTreeView.getLists();
			return;
		},
		
		/**
		 *  return the list of uploaded source lists. Data are taken out from the tree, not from the server
		 */
		getLists: function() {
			var retour = [];
			$("li#GoodiesXmyList").find('li').find('a').each(function(){retour.push($(this).attr('id'));});
			return retour;
		},
		/**
		 * jsdata: {nodekey: ... , table: ...}
		 */
		delGoodies: function(jsdata){
			var id_schema = "GoodiesX" + jsdata.nodekey;

			if( $("#" + id_schema).length != 0 ){
				$("div#treedisp").jstree("remove", $("#" + id_schema + " #" + jsdata.table.replace("_xml", "")));
				if($("#" + id_schema).find("> ul > li:eq(0)").length == 0) {
					$("div#treedisp").jstree("remove", $("#" + id_schema));
				}
			}
			return;
		},
		pushJobToGoodies: function(jid, node, gn){
			var that = this;
			Processing.show("Pushing job to goodies");
			$.getJSON("pushjobtogoodies"
					, {jsessionid: sessionID, node: node, jobid: jid , goodiesname: gn }, function(jsondata) {
						Processing.hide();
						if( Processing.jsonError(jsondata, "Cannot get meta data") ) {
							return;
						}
						that.addGoodies(jsondata);
					});
		},
		uploadFile: function() {
			Modalinfo.dataPanel(title			
					, '<form id="uploadPanel" target="_sblank" action="uploaduserposlist" method="post"'
					+  'enctype="multipart/form-data">'
					+  ' <input class=stdinput  id="uploadPanel_filename" type="file" name="file" /><br>'
					+ '  <p class=help></p><br>'
					+  ' <input  type="submit" value="Upload" />'
					+  ' </form>'
					, null);
			$('#uploadPanel p').html("description");
			$('form#uploadPanel').ajaxForm({
				beforeSubmit: function() {
					if(beforeHandler != null ) {
						beforeHandler();
					}
				},
				success: function(e) {
					Modalinfo.close();
					if( Processing.jsonError(e, "Upload Position List Failure") ) {
						return;
					} else {
						/*
						 * Must add a goodies node here
						 */
						Out.debug("Upload success: " + JSON.stringify(e));
						if( handler != null) {
							var retour = {retour: e, path : $('#uploadPanel_filename').val().xtractFilename()};
							handler(retour);
						}
					}
				}
			});
		},
		setTitlePath: function (dataTreePath) {
			this.dataTreePath = dataTreePath;
			var tp = $('#titlepath');
			var span = '<span style="font-style: normal; font-size: x-small ; background-color:';
			tp.html('');
			if( dataTreePath) {
				if ($("#info-"+dataTreePath.nodekey).length == 0) {
					$("#"+dataTreePath.nodekey).after('<span id="info-'+dataTreePath.nodekey+'"></span>');

					if (nodeFilterView.getFilter(dataTreePath.nodekey) != null && nodeFilterView.getFilter(dataTreePath.nodekey) != undefined) {
						$("#info-"+dataTreePath.nodekey).after('<span class="node-filter">'+nodeFilterView.getFilter(dataTreePath.nodekey)+'</span>');
					}
				}
				else {
					$("#info-"+dataTreePath.nodekey).html("");
				}
				var span_info = $("#info-"+dataTreePath.nodekey);

				span_info.append(span
						+ ((this.capabilities.supportSyncQueries== true)?'lightgreen': 'salmon') 
						+ ';" title="' + ((this.capabilities.supportSyncQueries== true)?'S': 'Does not s') + 'upport synchronous queries">S</span>');
				span_info.append(span
						+ ((this.capabilities.supportJoin== true)?'lightgreen': 'salmon')
						+ ';" title="' + ((this.capabilities.supportJoin== true)?'S': 'Does not s')+ 'upport ADQL joins">J</span>');
				span_info.append(span
						+ ((this.capabilities.supportAsyncQueries == true)?'lightgreen': 'salmon') 
						+ ';" title="' + ((this.capabilities.supportAsyncQueries == true)?'S': 'Does not s')+ 'upport asynchronous queries">A</span>');
				span_info.append(span
						+ ((this.capabilities.supportUpload == true)?'lightgreen': 'salmon') 
						+ ';" title="' + ((this.capabilities.supportUpload == true)?'S': 'Does not s')+ 'upport table upload">U</span>');

			}
		},
		getNodeInfos : function(nodekey){
			return this.reports[nodekey];
		},
		showNodeInfos: function (nodekey) {
//			var report = {"info": this.info, "capabilities": this.capabilities};
//			Modalinfo.infoObject(report, "Node " + this.dataTreePath.nodekey);
//			
			Modalinfo.infoObject(this.reports[nodekey], "Node " + nodekey);
		//alert(nodekey);
		},
		getBookmark: function() {
			var info = this.reports[this.dataTreePath.nodekey].info;
			if( info != undefined ){
				var np = window.location.href.split('?')[0].replace(/\/$/, "");
				return (info != null)?np + "?url=" + escape(info.url): np;
			} else {
				"No active data node"
			}
//			var np = window.location.href.split('?')[0].replace(/\/$/, "");
//			return (this.info != null)?np + "?url=" + escape(this.info.url): np;
		}
};

