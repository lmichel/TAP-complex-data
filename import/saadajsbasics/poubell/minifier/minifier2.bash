#!/bin/bash
#
# Minifier 
# Laurent Michel 02/2014
#
# Merge all required JS file in one m
# Merge all required in one. 
# Using the minifierd resources speed the application startup and make it indepen,dant from jsresources
# Warning: All resources used by the CSS (image with relative paths or imoprted CSS) must be available in the min directory
# A Part of the resources are local to 3XMM and the others are copied from jsresources
#

##########################
# Script Resources
#########################     
jsresourceDir="/home/michel/workspace/jsresources"
outputDir="../WebContent/xcatweb/min/packed" # directory where both packed JS and CSS are stored 
packedCSS=$outputDir/packedCSS.css    # name of the file containing the packed CSS
packedJS=$outputDir/packedJS.js       # name of the file containing the packed JS
imageDir="../WebContent/xcatweb/images"      # Directory from where the 3XMM images must be copied 
imageOutput="../WebContent/xcatweb/min/images" # Directory where the 3XMM images must be copied 
iconsDir="${jsresourceDir}/WebContent/saadajsbasics/icons"      # Directory from where the icons must be copied 
iconsOutput="../WebContent/xcatweb/min/icons" # Directory where the 3XMM icons must be copied 
fontsDir="${jsresourceDir}/WebContent/saadajsbasics/styleimports/fonts"      # Directory from where the icons must be copied 
fontsOutput="../WebContent/xcatweb/min/fonts" # Directory where the 3XMM icons must be copied 

#
# List of jsresources JS objects
# MVC template for names:
#    Files without a js suffix are related to the MVC pattern.
#    There are actually 3 files *_m/v/c.js 
#
js_array_org=("basics.js"
           "WebSamp"
           "KWConstraint"
           "AttachedData_v.js"
           "VizierKeywords_v.js"
           "OrderBy_v.js"
           "ConeSearch_v.js"
           "ConstList_v.js"
           "FieldList_v.js"
		   "Sorter_v.js"
           "DataLink"  
           "ConstQEditor" 
           "QueryTextEditor" 
           "Segment.js"
           "RegionEditor"
	       "flotmosaic.js"
           "domain.js"
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
 	       "HipsExplorer_v.js"  
          )   
          
          
##########################
# Script Functions
#########################      
#
# Build the real list of jsresources JS files by applying the MVC template for names
#
js_basic_array=() 
for item in ${js_array_org[*]}
do
	if [[ "$item" == *.js ]]
	then
    	js_basic_array[${#js_basic_array[@]}]=$item	
	else
    	js_basic_array[${#js_basic_array[@]}]=$item'_m.js'
    	js_basic_array[${#js_basic_array[@]}]=$item'_v.js'
    	js_basic_array[${#js_basic_array[@]}]=$item'_c.js'
	fi
done

#
# function compileing a set of js files to the packed file
# The compiled files are stored in the global output dir
# USAGE: minifySet jsfiledir file1 file2 ....
# jsfiledir: dir where JS files are
#
js_array=() # list of packed js files
function minifySet(){
	inputDir=$1
	shift
	fileList=("$@")
	for item in "${fileList[@]}"
	do
		echo compiling $inputDir/${item} to $outputDir/${item}
		#
		# Closure compilation is commented whiole the validation phase
    	#java -jar compiler.jar --js $inputDir/${item} --js_output_file $outputDir/${item} || exit 1
    	cp $inputDir/${item}  $outputDir/${item} || exit 1
    	# Store an ordered list of minified files
    	js_array[${#js_array[@]}]=$item
	done
}
#
# merge all minified JS files within the  packed JS file
# Minified files are removed after to be merged
# a log message is appended ato the JS code to follow the loading pporcess in the console
#
function  pack() {
	rm -f $outputFile
	for item in "${js_array[@]}"
	do 
		echo pack $outputDir/$item to $packedJS
		cat $outputDir/$item >> $packedJS || exit 1
		echo "" >> $packedJS
		echo "console.log('=============== > " $item "');" >> $packedJS
		echo "" >> $packedJS
		rm $outputDir/$item
	done
}	
#
# merge a set CSS files within the  packed CSS file
# USAGE: packCSS cssfiledir file1 file2 ....
# cssfiledir: dir where CSS files are
#
function  packCSS() {
	inputDir=$1
	shift
	fileList=("$@")
	for item in "${fileList[@]}"
	do
		echo pack $inputDir/$item to $outputDir/packedCSS.css
 		cat $inputDir/$item >> $outputDir/packedCSS.css|| exit 1
	done
}	

##########################
# Script Job
#########################      

rm -f  > $packedCSS	
echo "=========== Pack CSS files"
packCSS "${jsresourceDir}/WebContent/saadajsbasics/styleimports/themes/base/"\
    "jquery.ui.all.css"
packCSS "${jsresourceDir}/WebContent/saadajsbasics/styleimports" \
    "layout-default-latest.css" \
	"datatable.css" \
	"simplemodal.css"\
	"aladin.min.css"

packCSS "${jsresourceDir}/WebContent/saadajsbasics/styleimports/bootstrap" \
    "bootstrap.css" \
	"bootstrap.css.map"
	
packCSS "${jsresourceDir}/WebContent/saadajsbasics/styleimports/foundationicon" \
    "foundation-icons.css"
		
packCSS "${jsresourceDir}/WebContent/saadajsbasics/styles"\
    "basics.css" \
    "domain.css" 


packCSS "../WebContent/xcatweb/styles/" \
    "global.css" \
    "globalmodule.css"\
    "styleFormulaire.css" \
    "button.css" \
    "table.css"

echo "=========== Minify JS files"
rm -f $packedJS
minifySet "${jsresourceDir}/WebContent/saadajsbasics/javascript"   \
    ${js_basic_array[@]} 

minifySet "${jsresourceDir}/WebContent/saadajsbasics/jsimports/ui"    \
     "jquery-ui.js"
minifySet "${jsresourceDir}/WebContent/saadajsbasics/jsimports"       \
    "jquery.simplemodal.js"\
    "jquery.alerts.js"\
    "jquery.dataTables.js"\
    "FixedHeader.js"\
    "jquery.prints.js"\
	"jquery.tooltip.js"\
	"jquery.form.js"\
	"aladin.unminified.js"\
    "excanvas.js"\
	"jquery.flot.pack.js"\
	"jquery.flot.js"\
	"jquery.flot.navigate.js"\
	"jquery.flot.symbol.js"\
	"jquery.flot.errorbars.js"\
	"jquery.flot.axislabels.js"
	

minifySet "../WebContent/xcatweb/jsimports"   \
     "jquery.bxSlider.js" "jquery.jeditable.js"
minifySet "../WebContent/javascript"   \
     "zipjobModel.js"
minifySet "../WebContent/xcatweb/javascript"      \
     "utils.js"    \
     "resultPaneModel.js"    \
     "resultPaneView.js"     \
     "resultPaneControler.js"\
     "galleryModel.js"       \
     "galleryView.js"        \
     "galleryControler.js"   \
	 "cartView.js"           \
     "cartModel.js"          \
     "cartControler.js"      \
     "aladinView.js"     \
     "ready.js"

echo "=========== Pack JS files"
pack 

echo "=========== Copy images"
cp $imageDir/*    $imageOutput"/" || exit 1

echo "=========== Copy icons"
rsync -av --exclude=".*" $iconsDir/* $iconsOutput"/" || exit 1

echo "=========== Copy Bootstrap fonts"
rsync -av --exclude=".*" $fontsDir/* $fontsOutput"/" || exit 1


echo "=========== Packing is over"
exit

