var ComplexQEditor_Mvc;

function ComplexQEditor_MvcExtends(){
	ComplexQEditor_Mvc = function(complexEditor){
		tapQEditor_Mvc.call(this);
		this.complexEditor = complexEditor;
	};
	/**
	 * Tap Complex custom model extends the tapQEditor_Mvc class
	 */
	ComplexQEditor_Mvc.prototype = Object.create(tapQEditor_Mvc.prototype, {
		processAttributeHandlerEvent : {
			value: function(ah, constListId){
				let first = Object.entries(this.editors).length === 0;
				let currentTreePath = this.listener.controlCurrentTreePath();

				var divKey = this.constEditorRootId + ah.nameattr + this.const_key;

				Out.debug("mv constraint " + ah.nameattr + " to #" + constListId);

				var v = new ComplexKWConstraint_mVc({divId: divKey,
					constListId: constListId ,
					isFirst: first ,
					attributeHandler: ah ,
					editorModel: this ,
					defValue: '' ,
					treePath: jQuery.extend({}, currentTreePath)});

				this.editors[divKey] = v;
				v.fireInit();
				this.const_key++;
			}
		},
		
		updateQuery : {
			value: function(){
				this.complexEditor.updateQuery("constraint",this);
			}
		}
	});

	
}

