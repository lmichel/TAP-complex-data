NodeFilter = function () {
	var cache = new Object;

	this.applyFilter = function(key, filter) {
		var re = new RegExp(filter, 'i');
		var fl = $("#nodeFilterList");
		var lis = '<ul class=attlist>';
		fl.html('<ul class=attlist>');
		var state = cache[key];
		for(var n=0 ; n<state.length ; n++){
			if( re.test(state[n].name)) {
				var selected = (state[n].selected)? "checked": "";
				lis += "<li class=tableSelected >" 
					+ "<input  type='checkbox' " + selected + " onclick='NodeFilter.synchroniseCache(&quot;" + key + "&quot;);'>"
					+ "<span style='font-color: black;'>" + state[n].name + "</span>"
					+ " <i></i>"
					+ "</li>\n";

			}
		}
		fl.html(lis + '</ul>');

	}

	this.unSelectAll  = function(key){
		$('#nodeFilterList input').removeAttr('checked');
		this.synchroniseCache(key);
	}
	this.selectAll  = function(key){
		$('#nodeFilterList input').attr('checked', true);
		this.synchroniseCache(key);
	}

	this.synchroniseCache  = function(key){
		var state = cache[key];
		var lstate = new Object();
		$('#nodeFilterList li').each(function(){
			var  moi = $(this);
			lstate[moi.children("span").html()] = moi.children("input").is(":checked");
		});
		for(var n=0 ; n<state.length ; n++){
			var ls = lstate[state[n].name];
			if( ls != undefined ){
				state[n].selected = ls
			}
		}
	}

	this.create  = function(key, metadata, handler){
		if(cache[key] == undefined ){
			var state = new Array();
			for(var n=0 ; n<metadata.length ; n++){
				state.push({name: metadata[n].name, selected: true});
			}
			cache[key] = state;
		}

		var table = "<div class='detaildata'>"
			+ "    <div class='detaildata' style='width: 60%; display: inline; overflow: hidden;'>"
			+ "        <span class=help>Give a filter on catalogue name or description:"
			+ "        <br> - The filter is a RegExp case unsensitive."
			+ "        <br> - Type [RETURN] to apply"
			+ "        <br> The number of selected tables returned by the server is limited to 100 in any case."
			+ "        </span>"
			+  "    </div>"
			+ "    <div class='detaildata' style='height: 45px;display: inline;float:right; padding-top:15px; margin-right: 15px;'>"
			+ "        <input id=nodeFilter type=texte width=24 class='form-control input-sm'>"
			+ "    </div>"
			+ "    <div id=nodeFilterList class='detaildata' style='border: 1px black solid; background-color: whitesmoke; width: 100%; height: 380px; overflow: auto; position:relative'>"
			+ "    </div>"
			+ "    <p class=help>"
			+ "    <a href='#' onclick='NodeFilter.selectAll(&quot;" + key + "&quot;);'>select</a>/"
			+ "    <a href='#' onclick='NodeFilter.unSelectAll(&quot;" + key + "&quot;)'>unselect</a> all<br>"
//			+ "     <a href='#' onclick=\"$('#nodeFilterList input').removeAttr('checked');$('#nodeFilterList li').attr('class', 'tableNotSelected');\">unselect</a> all)<br>"
			+ "    <input id=nodeFilterApply type=button value='Accept' style='font-weight: bold;'>"
			+ "    <span class=help>(Type [ESC] to close the window)</span>"
			+ "    </div>"
			+ "</div>";

		Modalinfo.dataPanel('Table Selector for node  <i> + ' + key + ' + </i>', table, null, "white");

		var that = this;
		$("#nodeFilter").keyup(function(event) {
			that.applyFilter(key, $(this).val());
		});
		this.applyFilter(key, "");
		$("#nodeFilterApply").click(function(event) {
			handler(cache[key]);
			Modalinfo.close();
		});
		Modalinfo.center();
	}

	this.createColumnFilter  = function(key, columns, visibles, handler){
		if(cache[key] == undefined ){
			state = this.getStates(columns, visibles);
			cache[key] = state;
		}

		var table = "<div class='detaildata'>"
			+ "    <div class='detaildata' style='width: 60%; display: inline; overflow: hidden;'>"
			+ "        <span class=help>Select the columns to be display:"
			+ "        <br> - Type [RETURN] to apply"
			+ "        </span>"
			+ "    </div>"
			+ "    <div class='detaildata' style='height: 45px;display: inline;float:right; padding-top:15px; margin-right: 15px;'>"
			+ "        <input id=nodeFilter type=texte width=24 class='form-control input-sm'>"
			+ "    </div>"
			+ "    <div id=nodeFilterList class='detaildata' style='border: 1px black solid; background-color: whitesmoke; width: 100%; height: 380px; overflow: auto; position:relative'>"
			+ "    </div>"
			+ "    <p class=help>"
			+ "    <a href='#' onclick='NodeFilter.selectAll(&quot;" + key + "&quot;);'>select</a>/"
			+ "    <a href='#' onclick='NodeFilter.unSelectAll(&quot;" + key + "&quot;)'>unselect</a> all<br>"
//			+ "     <a href='#' onclick=\"$('#nodeFilterList input').removeAttr('checked');$('#nodeFilterList li').attr('class', 'tableNotSelected');\">unselect</a> all)<br>"
			+ "    <input id=nodeFilterApply type=button value='Accept' style='font-weight: bold;'>"
			+ "    <span class=help>(Type [ESC] to close the window)</span>"
			+ "    </div>"
			+ "</div>";

		Modalinfo.dataPanel('Column Selector for node  <i> + ' + key + ' + </i>', table, null, "white");

		var that = this;
		$("#nodeFilter").keyup(function(event) {
			that.applyFilter(key, $(this).val());
		});
		this.applyFilter(key, "");
		$("#nodeFilterApply").click(function(event) {
			handler(cache[key]);
			Modalinfo.close();
		});
		Modalinfo.center();
	}
	/**
	 * Returns the filter referenced by key 
	 */
	var getFilter = function (key){
		return cache[key];
	}
	/**
	 * Create and store a new filter for the column set "columns". *
	 * Only the columns "visibles" 	are made visible  
	 * The filter is referenced by key and the former one is overridden
	 * returns the new filter
	 */
	var createFilter = function (key, columns, visibles) {
		var state = new Array();
		for(var d=0 ; d<columns.length ; d++){
			var column = columns[d].name;
			var found = false;
			for(var n=0 ; n<visibles.length ; n++){
				if( visibles[n].name == column) {
					found = true;
					break;
				}
			}
			state.push({name: column, selected: found});
		}
		cache[key] = state;
		return state;

	}
	/**
	 * Update the filter referenced by key with the column names given by constrained.
	 * All visible column are kept visible and constrained are made visible
	 * return the current filter
	 */
	var updatesFilter = function (key, constrained) {
		states = cache[key];
		if( states != null ){
			for(var d=0 ; d<states.length ; d++){
				if(states[d].selected == false ){
					var column = states[d].name;
					for(var n=0 ; n<constrained.length ; n++){
						if( constrained[n].name == column) {
							states[d].selected = true
						}
					}
				}
			}
		}
		return states;
	}
	/**
	 * Debug function printing out visible column 
	 */
	var logStates = function(key){
		states = cache[key];
		var retour = "";
		if( states != null ){
			for(var d=0 ; d<states.length ; d++){
				if(states[d].selected == true ){
					retour += JSON.stringify(states[d]) + " " ;
				}
			}
		} else {
			retour = "No filter found";
		}
	}

	/**
	 * 
	 */
	var pblc = {};
	pblc.create = create;
	pblc.createColumnFilter = createColumnFilter;
	pblc.applyFilter = applyFilter;
	pblc.selectAll = selectAll;
	pblc.unSelectAll = unSelectAll;
	pblc.synchroniseCache = synchroniseCache;
	pblc.createFilter = createFilter;
	pblc.getFilter = getFilter;
	pblc.updatesFilter = updatesFilter;
	pblc.logStates = logStates;
	return pblc;
}();
