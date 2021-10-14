/**
 * 
 * @param parentDivId: ID of the div containing thge filed list. It must exist before.
 * @param formName    : Name of the form. Although internal use must be 
 *                      set from outside to avoi conflict by JQuery selectors  
 * @param  constContainerId  : Id of the div containing all the list: must existe before             
 * @param  orderByHandler   : Handler reset commans         
 */
OrderBy_mVc = function(parentDivId, formName, constContainerId, orderByHandler){
	var orderByDesId  = parentDivId + "_orderdesc";
	var orderByAscId  = parentDivId + "_orderasc";
	var orderByDrop   = parentDivId + "_orderdrop";
	var orderById     = parentDivId + "_orderby";
	/**
	 *  parentDiv: JQuery DOM node of the container
	 */
	this.draw = function() {
		$('#' + constContainerId).append('<div class=orderby>'
				+ '<input id=' + orderById 
				+ ' class="orderby form-control" style="display: inline-block;" type="text" value="Order By" disabled="disabled">'
				+ '<label> desc <input id=' + orderByDesId + ' type="radio" name="OrderBy" value="desc" checked> </label>'
				+ '<label>asc <input id=' + orderByAscId + ' type="radio" name="OrderBy" value="asc" > </label>'	
				+ '<a href="javascript:void(0);" id=' + orderByDrop + ' class=closekw title="Reset OrderBy"></a>'			
				+ '</div>');
		
		$('#' + orderByDrop).click(function() {
			$('.orderby') .val('Order By');
			$('.orderby') .css('font-style' , 'italic');
			$('.orderby') .css('color' , 'darkgray');
			orderByHandler('OrderBy');
		});
		$('#' + orderByAscId).click(function() {
			orderByHandler($('#' + orderById).val());
		});
		$('#' + orderByDesId).click(function() {
			orderByHandler($('#' + orderById).val());
		});
	};
	this.setOrderBy = function(attname) {
		$('.orderby') .css('font-style' , '');
		$('.orderby') .css('color' , 'black');
		$('.orderby').val(attname);
	};
	this.getOrderBy = function (){
		return $('#' + orderById).val();
	};
	this.isDesc = function() {
		return ($('#' + orderByDesId).attr("checked"))?true: false;
	};
	this.setDesc = function() {
		$('#' + orderByDesId).attr("checked", "true");
	};
	this.setAsc = function() {
		$('#' + orderByAscId).attr("checked", "true");
	};
	this.isAsc = function() {
		return ($('#' + orderByAscId).attr("checked"))?true: false;
	};
	this.fireClearAllConst= function (){
		$('.orderby').val('');
		$('#' + orderByDesId).attr("checked", "true");
	};	
	
};

