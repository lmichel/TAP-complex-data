
function QueryConstraintEditorOverride(){
    QueryConstraintEditor.complexConstraintEditor = function (params /*parentDivId, formName, sesameUrl*/) {
        var parentdiv = $('#' + params.parentDivId);
        if( !parentdiv.length) {
            Modalinfo.error("Div #" + params.parentDivId + " not found");
            return ;
        }
        var view  = new ComplexQEditor_mVc(params /*parentDivId, formName, sesameUrl*/);
        view.model = new ComplexQEditor_Mvc(params.complexEditor);
        new ConstQEditor_mvC(view,view.model );
        view.draw();
        return view;
    };
}
