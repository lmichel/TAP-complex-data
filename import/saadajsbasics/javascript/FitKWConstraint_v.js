/**
 * 
 */

function FitConstraint_mVc(params){
	KWConstraint_mVc.call(this, params);
	new KWConstraint_mvC(new FitConstraint_Mvc(params), this);	
};


FitConstraint_mVc.prototype = Object.create(KWConstraint_mVc.prototype, {
	initForm : { 
		value: function(ah, operators ,andors,range,default_value){
			if( ah == null ) {
				Modalinfo.error("Attempt to init a FitConstraint with a attribute handler null");
				return;
			}
			var that = this;
			$('#' + this.constListId).append("<div class='kwConstraint' id='" + this.rootId + "' style='float: none;'>");
			var baseSelector  = '#' + this.constListId + ' div[id="' + this.rootId + '"]';
			var valSelector   = '#' + this.constListId + ' input[id="' + this.rootId + '_val"]';
			var rootDiv = $(baseSelector);
			rootDiv.append('&nbsp;<a id="' + this.rootId + '_close" href="javascript:void(0);" class=closekw title="Remove this Constraint"></a>&nbsp;');
			rootDiv.append('<span id=' + this.rootId + '_name>' + ah.fitparam + '</span><br>');
			/*
			 * Logical operators
			 */
			var select='<select id="' + this.rootId + '_op" style="font-size: small;font-family: courier;">';
			for( var i=0 ; i<operators.length; i++ ) {
				var op = operators[i];
				var selected = '';
				if( op == '>' ) {
					op = '&gt;';
				} else if( op == '<' ) {
					op = '&lt;';
				}
				select += '<option value="' + op + '" ' + selected + '>' +op + '</option>';
			}	
			
			select += '</select>';
			rootDiv.append(select);

			rootDiv.append('<input type=text id="' + this.rootId 
					+ '_val" class="inputvalue form-control input-sm" style="width:140px; display: inline-block; height: 21px; font-size: small;font-family: courier;" value="' 
					+ default_value + '">');
			
			if( range != undefined && range.values.length>0 ){
				this.loadRange(valSelector,range);
			}
			
			var opSelected = '#' + this.constListId + ' select[id="' + this.rootId + '_op"] option:selected';
			var opInput    = $('#' + this.constListId + ' select[id="' + this.rootId + '_op"]');
			var closeInput = $('#' + this.constListId + ' a[id="' + this.rootId + '_close"]');
			var valInput   = $(valSelector);

			

			

			$('#' + this.constListId).append("</div>");	

			closeInput.click(function() {
				$(baseSelector).remove();
				that.fireRemoveFirstAndOr(this.rootId);
				that.fireEnterEvent();
				that.fireTypoMsg(false, '');

			});

			opInput.change(function() {
				var v = this.value;
				var regex = /=\s+(.+)/;
				var results = regex.exec(v);
				if( results ) {	
					$('#' + that.constListId + ' select[id="' + that.rootId + '_op"] option[value="="]').prop('selected', true);
					valInput.val(results[1]);
				}
				that.fireEnterEvent('AND'
						, this.value
						, valInput.val()
						);				
			});
			valInput.keyup(function(event) {
				/*
				 * Run the query is CR is typed in a KW editor
				 */
				if (event.which == '13') {
					if( that.isConstraintOK() ) {
						that.fireRunQuery();
					} else {
						Modalinfo.error("Current contraint is not valid: can not run the query");
					}
				} else {
					that.fireEnterEvent('AND'
							, $(opSelected).text()
							, this.value
							);
				}
			});
			valInput.click(function(event) {
				that.fireEnterEvent('AND'
						, $(opSelected).text()
						, this.value
						
				);
			});
			valInput.on('input', function(event) {
				that.fireEnterEvent('AND'
						, $(opSelected).text()
						, this.value
						
				);
			});
			
			this.fireEnterEvent('AND'
					, $(opSelected).text()
					,valInput.val()
					);
		}
	}
});