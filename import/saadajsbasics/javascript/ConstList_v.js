/**
 * 
 * @param parentDivId: ID of the div containing thge filed list. It must exist before.
 * @param formName    : Name of the form. Although internal use must be 
 *                      set from outside to avoi conflict by JQuery selectors  
 * @param  constContainerId  : Id of the div containing all the list: must existe before             
 * @param  removeAllHandler   : Handler processing the click on the remove all button          
 */
ConstList_mVc = function(parentDivId, formName, constContainerId, removeAllHandler){
	/**
	 * keep a reference to ourselves
	 */
	var that = this;

	var constListId   = parentDivId + "_constlist";
	var delConstListId   = parentDivId + "_delconstlist";
	var typoMsgId     = parentDivId + "_typoMsgId";
	/**
	 *  parentDiv: JQuery DOM node of the container
	 */
	this.draw = function(isPos, isADQL) {
//		$("#" + constContainerId).append('<div class=constdiv ><fieldset class="constraintlist" id="' + constListId	+  '">'
//				+ '<legend class=help>List of Active Constraints <a href="javascript:void(0);" id=' + delConstListId + ' class=closekw title="Remove all constraints"></a></legend>'
//				+ '<span class=help>Click on a <input class="stackconstbutton" type="button"> button to append,<br>the constraint to the list</span>'
//				+ '</fieldset>'
//				+ '<span style="font-style: italic;color: lightgray;">QL stmt </span><span style="height: 18;" class=typomsg_ok id=' + typoMsgId + '></span>'
//				+ '</div>');

		if (isPos != undefined && isPos != null) {
			var h = isPos["fieldset"];
			var h2 = isPos["div"];
		} else {
			var h = "185px";
			var h2 = "150px"
		}
		
		if (isADQL != undefined && isADQL) {
			var w = "100%"
		} else {
			var w = "450px"
		}
		
		$("#" + constContainerId).append(			
				  '<div class=constdiv style="width: '+w+'">'
				+ '    <fieldset style=" height:'+h+';">'
				+ '        <legend style="border-bottom: 0px; " class=help>List of Active Constraints <a href="javascript:void(0);" id=' + delConstListId + ' class=closekw style="float: none;" title="Remove all constraints"></a></legend>'
				+ '        <div  style="overflow: auto; height:'+h2+'; background-color: #f2f2f2; width: 100%" id="' + constListId	+  '"><span class=help>Click on a <input class="stackconstbutton" type="button"> button to append,<br>the constraint to the list</span></div>'
				+ '    </fieldset>'
				+ '    <div>'
				+ '      <span class="ql">QL stmt </span><span style="height: 18;" class=typomsg_ok id=' + typoMsgId + '></span>'
				+ '    </div>'
				+ '</div>');
		
		if (isPos) {
			$("#div-"+parentDivId).appendTo($("#"+typoMsgId).parent());
		}
		
		$('#' + delConstListId).click(function() {
			removeAllHandler();
		});	
		
		return constListId;
	};
	
	this.printTypoMsg= function(fault, msg){
		$("#"+ typoMsgId).each(function() {
			if(fault) {
				$(this).attr('class', 'typomsg_ko');
				$(this).text(msg);
			} else {
				$(this).attr('class', 'typomsg_ok');	
				$(this).text(msg);
			}
		});
	};
	this.isTypoGreen= function(){
		return ( $("#"+ typoMsgId).first().attr('class') ==  'typomsg_ok');					
	};
	this.fireClearAllConst= function() {
		if($("#" + parentDivId + "_constposcont input:text").length != 0){
		$("#" + $("#" + parentDivId + "_constposcont input:text")[0].id).val("");
		}
		$("span#uploadresult").text("");
		$("#" + constListId + " div.kwConstraint").each(function() {
			$(this).remove();
		});
	};
	this.fireClearConst= function(filter) {
		$("#" + constListId + " div.kwConstraint").each(function() {
			if( $(this).attr("id").match(filter) ) $(this).remove();
		});
	};
	this.fireRemoveAllHandler= function() {
		removeAllHandler();
	};
};
