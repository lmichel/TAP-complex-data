var ComplexPosEditor_Mvc;

function ComplexPosEditor_MvcExtends(){
    ComplexPosEditor_Mvc = function(complexEditor,colSelector){
		tapPosQEditor_Mvc.call(this);
		this.complexEditor = complexEditor;
		this.colSelector = colSelector;
		this.complexEditor.registerConstraintsHolder(this);
	};

    ComplexPosEditor_Mvc.prototype = Object.create(tapPosQEditor_Mvc.prototype,{


        updateQuery : {
			value: function(){
				this.complexEditor.updateQuery("constraint",this);
			}
		}
    });
}