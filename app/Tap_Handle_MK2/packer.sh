#!/bin/bash

SAADA=(
    "basics.js"
    "WebSamp_v.js"
    "WebSamp_c.js"
    "WebSamp_m.js"
    "KWConstraint_v.js"
    "KWConstraint_c.js"
    "KWConstraint_m.js"
    "AttachedData_v.js"
    "VizierKeywords_v.js"
    "OrderBy_v.js"
    "ConeSearch_v.js"
    "ConstList_v.js"
    "FieldList_v.js"
    "Sorter_v.js"
    "Pattern_v.js"
    "DataLink_v.js"
    "DataLink_c.js"
    "DataLink_m.js"
    "ConstQEditor_v.js"
    "ConstQEditor_c.js"
    "ConstQEditor_m.js"
    "QueryTextEditor_v.js"
    "QueryTextEditor_c.js"
    "QueryTextEditor_m.js"
    "domain.js"
    "AstroCoo.js"
    "Segment.js"
    "RegionEditor_v.js"
    "RegionEditor_c.js"
    "RegionEditor_m.js"
    "flotmosaic.js"
    "NodeFilter_v.js"
    "FitFieldList_mVc.js"
    "FitQEditor_m.js"
    "FitQEditor_v.js"
    "FitPatternQEditor_v.js"
    "FitPatternQEditor_m.js"
    "FitKWConstraint_m.js"
    "FitKWConstraint_v.js"
    "FitAttachedPatterns_v.js"
    "FitBestModelAttachedPattern_v.js"
    "FitBetterModelAttachedPattern_v.js"
    "FitOrderModelAttachedPattern_v.js"
)
SAADA_IMP=(
    "jquery.alerts.js"
    "FixedHeader.js"
    "jquery.prints.js"
    "jquery.form.js"
    "aladin.unminified.js"
)

function build_saada {
    >saada.js
    for f in ${SAADA[@]}
    do
        cat "../../import/saadajsbasics/javascript/$f" >> saada.js
    done

    for f in ${SAADA_IMP[@]}
    do
        cat "../../import/saadajsbasics/jsimports/$f" >> saada.js
    done

}

function build_app {

    >app.js

    cat "../../shared/JS/shared.js" >> app.js

    for f in ./JS/*.js
    do
        cat "$f" >> app.js
    done

}


function import_external {
    
    IMP=(
        "jquery-3.6.0.min.js"
        "jquery.dataTables.js"
        "jquery-ui.js"
        "jstree.min.js"
        "popper.js"
        "bootstrap.min.js"
        "highlight.min.js"
        "showdown.min.js"
    )

    >external.html;
    for f in ${IMP[@]}
    do
        echo "        <script type='text/javascript' src='./JS/Import/$f' ></script>" >> external.html;
    done
}

function import_app {

    >app.html

    echo "        <script type='text/javascript' src='../../shared/JS/shared.js' ></script>" >> app.html;

    for f in ./JS/*.js
    do
        echo "        <script type='text/javascript' src='$f' ></script>" >> app.html;
    done

}

function import_saada {
    >saada.html
    for f in ${SAADA[@]}
    do
        echo "        <script type='text/javascript' src='../../import/saadajsbasics/javascript/$f' ></script>" >> saada.html
    done

    for f in ${SAADA_IMP[@]}
    do
        echo "        <script type='text/javascript' src='../../import/saadajsbasics/jsimports/$f' ></script>" >> saada.html
    done
}

function import_api {
    >api.html

    echo "        <script type='text/javascript' src='../../utils/util.js' ></script>" >> api.html

    find ../../api/ -name "*_*.js" | xargs -I{0} echo "        <script type='text/javascript' src='{0}' ></script>" >> api.html
    find ../../api/ -name "*.js" ! -name "*_*" | xargs -I{0} echo "        <script type='text/javascript' src='{0}' ></script>" >> api.html
}

function import_overrides {
    >overrides.html
    
    for f in ./JS/overrides/*.js
    do
        echo "        <script type='text/javascript' src='$f' ></script>" >> overrides.html;
    done

}

function deploy_dev {
    >dev.html

    import_external
    import_api
    import_app
    import_saada
    import_overrides

    cat "external.html" >>dev.html
    cat "api.html" >>dev.html
    cat "app.html" >>dev.html
    cat "saada.html" >>dev.html
    cat "overrides.html" >>dev.html

    rm api.html app.html external.html saada.html overrides.html

    sed -e '/<\!--- Script --->/{r dev.html' -e  'd}' taphandle_base.html >taphandev.html

    rm dev.html
}

function deploy_min {
    #TODO CSS minification
    
    # Building the app
    rm -rf build
    npm install
    npm run build
    
    # mooving app ressources
    cp -r icons build/ 
    cp -r images build/ 
    cp -r CSS build/ 
    cp -r doc build/ 
    cp -r JS/Import build/JS/

    SAADA_CSS=(
        "themes/base/jquery.ui.base.css"
        "themes/base/jquery.ui.theme.css"
        "layout-default-latest.css"
        "datatable.css"
        "simplemodal.css"
        "aladin.min.css"
        "foundationicon/foundation-icons.css"
    )

    mkdir -p build/CSS/saada
    for f in ${SAADA_CSS[@]}
    do 
        cp ../../import/saadajsbasics/styleimports/$f build/CSS/saada/
    done

    cd build
    >import.html
    for f in ./CSS/saada/*
    do
        echo "        <link rel='stylesheet' href='$f' />" >>import.html
    done
    cd ../

    # building Tap_complex API
    cd ../../
    rm -rf build
    chmod +x packer.sh
    npm install
    npm run build 

    cd app/Tap_Handle_MK2/

    cp ../../build/*.js ./build/JS/tap_complex.min.js

    cd build

    import_external

    cat "external.html" >>import.html

    rm external.html

    JS=(
        "tap_complex.min.js"
        "app.min.js"
        "saada.min.js"
        "overrides.min.js"
    )

    for f in ${JS[@]}
    do
        echo "        <script type='text/javascript' src='./JS/$f' ></script>" >> import.html
    done



    sed -e '/<\!--- Script --->/{r import.html' -e  'd}' ../taphandle_base.html >taphandle.html

    rm import.html
}

"$@"