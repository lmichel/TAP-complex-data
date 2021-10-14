#!/bin/bash
#
# Minifier jsbasics

# 25/01/2019

# Merge all required JS file in one 
# Merge all required JS import file in one. 
# Using the minifierd resources speed the application startup and make it independent from jsbasics
# Warning: CSS is not packed here
#

script_dir=`dirname "$0"`
##########################
# Script Resources
#########################     
jsbasicsDir="${script_dir}/../.."
outputDir="${script_dir}/../jsbasics_packed" # directory where both packed JS and CSS are stored 
packedJS=$outputDir/packedJS_jsbasics.js       # name of the file containing the packed JS
packedJSmin=$outputDir/packedJSmin_jsbasics.js 
packedJSimport=$outputDir/packedJSimport_jsbasics.js       # name of the file containing the packed JS
#
# List of jsbasics JS objects
# MVC template for names:
#    Files without a js suffix are related to the MVC pattern.
#    There are actually 3 files *_m/v/c.js 
#
js_array_org=( 
		"basics.js"
		"domain.js"
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
        "flotmosaic.js"
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
          
jsimport_array_org=( 
	   	 
          )  
          
          
##########################
# Script Functions
#########################      
#
# Build the real list of jsbasics JS files by applying the MVC template for names
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

js_import_array=() 
for item in ${jsimport_array_org[*]}
do
	if [[ "$item" == *.js ]]
	then
    	js_import_array[${#js_import_array[@]}]=$item	
	else
    	js_import_array[${#js_import_array[@]}]=$item'_m.js'
    	js_import_array[${#js_import_array[@]}]=$item'_v.js'
    	js_import_array[${#js_import_array[@]}]=$item'_c.js'
	fi
done

#
# function compiling a set of js files to the packed file
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
		# Closure compilation is commented whole the validation phase
    	#java -jar compiler.jar --js $inputDir/${item} --js_output_file $outputDir/${item} || exit 1
    	cp $inputDir/${item}  $outputDir/${item} || exit 1
    	# Store an ordered list of minified files
    	js_array[${#js_array[@]}]=$item
	done
}

js_array2=() # list of packed js files
function minifySet2(){
	inputDir=$1
	shift
	fileList=("$@")
	for item in "${fileList[@]}"
	do
		echo compiling $inputDir/${item} to $outputDir/${item}
		#
		# Closure compilation is commented whole the validation phase
    	#java -jar compiler.jar --js $inputDir/${item} --js_output_file $outputDir/${item} || exit 1
    	cp $inputDir/${item}  $outputDir/${item} || exit 1
    	# Store an ordered list of minified files
    	js_array2[${#js_array2[@]}]=$item
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

function  packimport() {
	rm -f $outputFile
	for item in "${js_array2[@]}"
	do 
		echo packimport $outputDir/$item to $packedJSimport
		cat $outputDir/$item >> $packedJSimport || exit 1
		echo "" >> $packedJSimport
		echo "console.log('=============== > " $item "');" >> $packedJSimport
		echo "" >> $packedJSimport
		rm $outputDir/$item
	done
}
#

##########################
# Script Job
#########################      
pwd
echo "=========== copy JS files"
rm -f $packedJS
minifySet "${jsbasicsDir}/javascript"   \
    ${js_basic_array[@]} 

echo "=========== Pack JS  files"
pack 

echo "=========== copy JSimport files"
rm -f $packedJSimport
minifySet2 "${jsbasicsDir}/jsimports"   \
    ${js_import_array[@]} 
    
echo "=========== Pack JS import files"
packimport 

echo "=========== Packing is over"

echo "=========== Compress JS"
java -jar ${script_dir}/compiler.jar --js=$packedJS --js_output_file=$packedJSmin
echo "=========== Compress is over"

exit