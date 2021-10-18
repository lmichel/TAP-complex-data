var ComplexColSelector_Mvc;

function ComplexColSelector_MvcExtends(){
	ComplexColSelector_Mvc = function(complexEditor){
		tapColSelector_Mvc.call(this);
		this.complexEditor = complexEditor;
	};
	/**
	 * Tap Complex custom model extends the tapQEditor_Mvc class
	 */
     ComplexColSelector_Mvc.prototype = Object.create(tapColSelector_Mvc.prototype, {
		processAttributeHandlerEvent : {
			value: function(ah, constListId,cantTouchThis){
				let first = Object.entries(this.editors).length === 0;
				let currentTreePath = this.listener.controlCurrentTreePath();

				let divKey = this.constEditorRootId + ah.nameattr;
				if(this.editors[divKey] === undefined){
					Out.debug("mv constraint " + ah.nameattr + " to #" + constListId);

					let v = new ComplexKWSimpleConstraint_mVc({divId: divKey,
						constListId: constListId,
						isFirst: first,
						attributeHandler: ah,
						editorModel: this,
						defValue: '',
						cantTouchThis:cantTouchThis,
						treePath: jQuery.extend({}, currentTreePath)});

					this.editors[divKey] = v;
					v.fireInit();
				}
				
			}
		},
		
		updateQuery : {
			value: function(){
				this.complexEditor.updateQuery("columns",this);
			}
		}
	});

	
}