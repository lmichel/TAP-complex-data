
function QueryConstraintEditorOverride(){
    QueryConstraintEditor.complexConstraintEditor = function (params /*parentDivId, formName, sesameUrl*/) {
        var parentdiv = $('#' + params.parentDivId);
        if( !parentdiv.length) {
            Modalinfo.error("Div #" + params.parentDivId + " not found");
            return ;
        }
        var view  = new tapQEditor_mVc(params /*parentDivId, formName, sesameUrl*/);
        new ConstQEditor_mvC(view, new ComplexQEditor_Mvc(params.complexEditor));
        view.draw();
        return view;
    };
}
