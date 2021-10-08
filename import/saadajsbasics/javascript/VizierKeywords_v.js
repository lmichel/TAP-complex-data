/**
 * 
 * @param params
 *  - parentDivId: id of the div where the view is drawn
 *  - queryView:  widget managing the global quey: invoked at each change on the view 
 *  - formName   : Name of the current form
 *  - title : Title of the field set
 *  - getMeta : Url returning an object formated like [{setname, keywords: []}...]: 
 *         - setName: name of the keyword set (mission, waveband...)
 *         - keywords: set of keywords
 * @returns
 */
function VizierKeywords_mVc(params){
	this.queryView   = params.queryView;
	this.parentDivId = params.parentDivId;
	this.title       = params.title;
	this.formName    = params.formName;
	this.getMetaUrl     = params.getMetaUrl;

	this.productListId = this.formName + "_ProductList";
	this.testData = [
	                 {setName: "set1", keywords: ["set1_kw1", "set1_kw2", "set1_kw3"]},
	                 {setName: "set2", keywords: ["set2_kw1", "set2_kw2", "set2_kw3"]},
	                 {setName: "set3", keywords: ["set3_kw1", "set1_kw2", "set3_kw3"]}
	                 ];
};
/**
 * Methods prototypes
 */
VizierKeywords_mVc.prototype = {
		/**
		 * Draw the field container
		 */
		draw : function() {
			var that = this;
			if( this.getMetaUrl != null ) {
				$.getJSON(this.getMetaUrl,function(data) {
					that.drawKeywordsSelectors(data);
				});
			} else {
				this.drawKeywordsSelectors(this.testData);
			}
		},
		drawKeywordsSelectors : function(data) {
			var that = this;
			var html = '<div style="display inline-block; width: 100%;" >\n';
				//+ '  <legend>Vizier Keyword Selector</legend>\n';

			for( var set=0 ; set<data.length ; set++ ) {
				var name = data[set].setName;
				var kws  = data[set].keywords;
				html += '<fieldset  style="float: left;">\n'
					  + '  <legend style="margin-bottom: 0px; border-bottom: 0px;">' + name + '&nbsp;<a name="' + name + '" class=closekw  href="javascript:void(0);" title="Unselect all items"></a></legend>\n';
				
				html += '<select name="' + name + '"  style=\"background-color: white;\" multiple="multiple" size="7" width="100%" class="form-control">';
				for ( var i=0; i<kws.length; i++){
					html += '<option title="' + name + '" value="'+kws[i]+'">'+kws[i]+'</option>';
				}
				html += '</select>\n</fieldset>\n';
			}				
			html += 
				'	   <div style="width: 270px;display: inline; float: left; margin-left: 10px;"class="spanhelp">\n'
			  + '		- The keywords proposed here are the same as those used by Vizier to tag catalogues<br>\n'
			  + '		- Constraint on keywords filter X-ray sources correlated with at least one source of a catalogue \n'
			  + '		matching all the selected keywords<br>\n'
			  + '		- Shift click to achieve multiple selections<br>\n'
			  + '       - The constraint on one keyword can be reversed by a ! set before the keyword in the text of the query'
			  + '	   </div>\n';

			html += '</div>';
			$('#' + this.parentDivId).append(html);
			
			$("#" + this.parentDivId + " select").change(function () {
				that.updateQuery();
			});
			$("#" + this.parentDivId + " a.closekw").click(function () {
				$("#" + that.parentDivId + ' option[title="' + this.name + '"]').removeAttr("selected");
				that.updateQuery();
			});


		},		
		updateQuery: function(){
			var selected = new Array();
			$("#" + this.parentDivId + " option:selected").each(function () {
				var kws = selected[this.title];
				if( kws == null ) kws = selected [this.title] = new Array();
				kws.push(this.value);
			});
			var retour = new Array();
			for( k in selected) {
				retour.push('    "' + k + '=' + selected[k].join(",") + '"');
			}
			this.queryView.fireAddConstraint(this.formName, "kwconst", retour.join("\n"));
		},
		fireClearAllConst: function() {
			$("#" + this.parentDivId + ' option').removeAttr("selected");
			this.updateQuery();			
		}
		
};
