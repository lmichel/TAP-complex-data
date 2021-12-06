
function QueryConstraintEditorOverride(){

    QueryConstraintEditor.complexConstraintEditor = function (params /*parentDivId, formName, sesameUrl*/) {
        var parentdiv = $('#' + params.parentDivId);
        if( !parentdiv.length) {
            Modalinfo.error("Div #" + params.parentDivId + " not found");
            return ;
        }
        var view  = new ComplexQEditor_mVc(params /*parentDivId, formName, sesameUrl*/);
        view.model = new ComplexQEditor_Mvc(params.complexEditor,params.colSelector);
        new ConstQEditor_mvC(view,view.model );
        view.draw();
        return view;
    };

    QueryConstraintEditor.complexColumnSelector = function (params /*{parentDivId, formName, queryView, currentNode}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" +params. parentDivId + " not found");
			return ;
		}
		var view  = new ComplexColSelector_mVc(params);
        view.model =new ComplexColSelector_Mvc(params.complexEditor);
		new ConstQEditor_mvC(view,view.model );
		view.draw();
		return view;
	};
    QueryConstraintEditor.ComplexPosConstraintEditor = function (params /*{parentDivId, formName, queryView, frames, urls}*/) {
		var parentdiv = $('#' + params.parentDivId);
		if( !parentdiv.length) {
			Modalinfo.error("Div #" + params.parentDivId + " not found");
			return ;
		}
		var view  = new ComplexPosEditor_mVc(params);
		view.model = new ComplexPosEditor_Mvc(params.complexEditor,params.colSelector);
		new ConstQEditor_mvC(view, view.model);
		view.draw();
		return view;
	};
}
