/**
 * Copyright 2014 - UDS/CNRS
 * The votables.js and its additional files (examples, etc.) are distributed
 * under the terms of the GNU General Public License version 3.
 *
 * This file is part of votables.js package.
 *
 * votables.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * votables.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * The GNU General Public License is available in COPYING file
 * along with votables.js
 *
 * votables.js - Javascript library for the VOTable format (IVOA
 * standard) parsing
 *
 * @author Thomas Rolling
 * @author Jérôme Desroziers
 */
function VOTableParser() {
  'use strict';

  var thisParser = this,
      xmlData = {},
      prefix = '',
      vot = {
        name: '',
        loadingState: 'null',
        nbTables: 0,
        nbResources: 0
      },
      selected = {
        resource: {
          i: 0,
          xml: null,
          tables: null
        },
        table: {
          i: 0,
          xml: null
        }
      },
      votableMetadata = '',
      currentResourceMetadata = '',
      currentTableMetadata = '',
      currentTableFields = '',
      tablesData = '',
      callbackFunction,
      errCallbackFunction,
      debugMode = false,
      // Following parameters are used for B64 parsing
      dataB64 = '',
      bufferBitArray = '',
      ptrStream = 0,
      endParsingB64 = false;
  
  this.xhr = null; //stock the request so we can kill it

  //--------------------------------------------------------------------------------
  // Functions related to the loading of VOTable files

  /**
   * Set callback functions that will be executed after the file's loading.
   *
   * @param {function} callback
   * @param {function} errCallback
   */
  this.setCallbackFunctions = function (callback, errCallback) {
    callbackFunction = callback;
    errCallbackFunction = errCallback;
  };

  /**
   * Load XML file.
   *
   * @param {string} url - can be either an url or a local path
   */
  this.loadFile = function (content) {
    /*
    var processError = function() {
      debug('Unable to load VOTable file. Check the path of VOTable file');
      vot.loadingState = 'fail';
      if (errCallbackFunction !== undefined) {
        errCallbackFunction(thisParser);
      }
    };*/
    thisParser.cleanMemory();
    //var start = new Date().getTime(),
    //    data;
    //thisParser.xhr = new XMLHttpRequest();

    //thisParser.xhr.open('GET', url, false);
    //thisParser.xhr.onreadystatechange = function () {
    //  if (thisParser.xhr.readyState === XMLHttpRequest.DONE && thisParser.xhr.status==200) {
    //thisParser.xhr = content
    //    data = thisParser.xhr.responseText;
    thisParser.loadBufferedFile(content, false);//@modifier delete the  third parameter url
    //    thisParser.loadingTime = new Date().getTime() - start;
    //    debug('loading time : ' + thisParser.loadingTime + ' ms.');
    //  }
    //  else {
    //    processError();
    //  }
    //};
    //try {
    //  this.xhr.send();
    //} catch (e) {
    //  processError();
    //}
    var a = parseB64CurrentTableData();
    return a;
  };
  
  /**
   * Load XML file.
   *
   * @param {string} url - can be either an url or a local path
   */
  this.loadFileAsynchronous = function (url) {
    var processError = function() {
      debug('Unable to load VOTable file. Check the path of VOTable file');
      vot.loadingState = 'fail';
      if (errCallbackFunction !== undefined) {
        errCallbackFunction(thisParser);
      }
    };

    thisParser.cleanMemory();
    var start = new Date().getTime(),
        data;
    thisParser.xhr = new XMLHttpRequest();

    thisParser.xhr.open('GET', url, true);
    thisParser.xhr.onload = function (e) {
        if (thisParser.xhr.readyState === 4) {
          if (thisParser.xhr.status === 200) {
              data = thisParser.xhr.responseText;
              thisParser.loadBufferedFile(data, false, url);
              thisParser.loadingTime = new Date().getTime() - start;
              debug('loading time : ' + thisParser.loadingTime + ' ms.');
          } else {
              processError();
          }
        }
    };
    thisParser.xhr.onerror = function (e) {
        processError();
    };

    try {
      thisParser.xhr.send();
    } catch (e) {
      processError();
    }
  };
  
  /****abort the query****/
  this.abort = function(){
      debug("query aborted");
      thisParser.xhr.abort();
      
  };

  /**
   * Load buffered XML file.
   *
   * @param {string|xmlTree} buffer
   * @param {boolean} isXml - true if buffer is an xmlTree
   */
  this.loadBufferedFile = function (buffer, isXml) {//@modifier delete the third parameter name
    
    thisParser.cleanMemory();
    var start = new Date().getTime(),
        data;
    if (isXml === undefined || isXml === false) {
      // conversion String => XML
      var parseXml;
      if (window.DOMParser) {
        parseXml = function (xmlStr) {
          return (new window.DOMParser()).parseFromString(xmlStr, 'text/xml');
        };
      } else if (typeof window.ActiveXObject !== 'undefined'
                 && new window.ActiveXObject('Microsoft.XMLDOM')) {
        parseXml = function (xmlStr) {
          var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
          xmlDoc.async = 'false';
          xmlDoc.loadXML(xmlStr);
          return xmlDoc;
        };
      }
      data = parseXml(buffer);
    } else {
      data = buffer;
    }

    initialize(data);//@modifier delete the second parameter name

    thisParser.loadingTime = new Date().getTime() - start;
    debug('loading time : ' + thisParser.loadingTime + ' ms.');
  };

  /**
   * Initialize the parser's attributes
   *
   * @param {xmlTree} data
   * @param {string} name
   */
  function initialize(data) {//@modifier delete the second parameter name
    // error

    if (!data|| data.getElementsByTagName("parsererror").length || !data.documentElement ) {
      debug('Error: loaded file does not contains VOTable information, or is not in xml format');
      vot.loadingState = 'fail';
      if (errCallbackFunction !== undefined)
        errCallbackFunction(thisParser);
    }
    else {
      xmlData = data;
      selected.resource.i = 0;
      selected.resource.xml = null;
      selected.resource.tables = null;
      selected.table.i = 0;
      selected.table.xml = xmlData;

      vot.nbTables = 0;

      // checks if document is VOTable
      var firstTag = xmlData.documentElement.tagName;
      if ( firstTag==='VOTABLE' ) {
        prefix = '';
      }
      else if ( firstTag.indexOf(':VOTABLE')===firstTag.length-8 ) {
        prefix = firstTag.substring(0, firstTag.length-7); // prefix includes ':' as first character
      }
      else {
        debug('Error: loaded file is not a VOTable');
        vot.loadingState = 'fail';
        if (errCallbackFunction !== undefined) {
          errCallbackFunction(thisParser);
        }
        return;
      }


      vot.loadingState = 'success';
      vot.name = "";//@modifier =name
      vot.resource = xmlData.getElementsByTagName(prefix + 'RESOURCE');
      vot.nbResources = vot.resource.length;
      tablesData = [];
      for (var i = 0; i < vot.nbResources; i++)
        tablesData[i] = [];

      votableMetadata = parseXmlMetadata('votable');
      setVOTableGroups();

      if (callbackFunction !== undefined)
        callbackFunction(thisParser);
    }
  };

  /**
   * Reset all data stored by the parser
   */
  this.cleanMemory = function () {
    xmlData = {};
    prefix = '';
    vot = {
      name: '',
      loadingState: 'null',
      nbTables: 0,
      nbResources: 0
    };
    selected = {
      resource: {
        i: 0,
        xml: null,
        tables: null
      },
      table: {
        i: 0,
        xml: null
      }
    };
    votableMetadata = '';
    currentResourceMetadata = '';
    currentTableMetadata = '';
    currentTableFields = '';
    tablesData = '';
  };

  /***
   * Get xml table 
   *
   * Output  : xml
   * 
   *
   * @return : xml object;
   ***/

  this.getXMLTable = function() {
     return xmlData;
  };
  
  
  /**
   * Return the prefix of the document.
   *
   * @return {string}
   */
  function getPrefix() {
    if (xmlData.getElementsByTagName('VOTABLE').length)
      return '';
    else {
      prefix = xmlData.getElementsByTagName('*')[0];
      return prefix.tagName.replace('VOTABLE', '');
    }
  };

  /**
   * Return the type of encodage of the currently selected table.
   *
   * @return {string}
   */
  this.getCurrentTableEncoding = function () {
    if (selected.table.xml.getElementsByTagName(prefix + 'BINARY').length)
      return 'BASE-64';
    return 'UTF-8';
  };

  /**
   * Return the total number of tables in the VOTable file.
   *
   * @return {integer}
   */
  this.getNbTablesInFile = function () {
    if (!vot.nbTables)
      vot.nbTables = xmlData.getElementsByTagName(prefix + 'TABLE').length;
    return vot.nbTables;
  };

  /**
   * Return the loading state of the current VOTable file
   *
   * @return {boolean}
   */
  this.getFileLoadingState = function () {
    if (vot.loadingState === 'success')
      return true;
    return false;
  };

  //--------------------------------------------------------------------------------
  // Functions related to the selection of the VOTable file's elements

  /**
   * Select a resource within the currently loaded VOTable file.
   *
   * @param {integer|string} number
   *
   * @return {boolean}
   */
  this.selectResource = function (number) {
    var nbResources;

    if (typeof (number) === 'string')
      number = parseInt(number);

    nbResources = this.getNbResourcesInFile();
    if (typeof (number) === 'number') {
      if (number >= 0 && number < nbResources) {
        selected.resource.i = number;
        selected.resource.xml = vot.resource[selected.resource.i];
        selected.resource.tables = selected.resource.xml.getElementsByTagName(prefix + 'TABLE');
        currentResourceMetadata = parseXmlMetadata('resource');
        setCurrentResourceGroups();
        return true;
      } else {
        debug('Unable to select resource. '
              + 'You specified the resource number "' + number + '", '
              + 'but the ressource number should be between 0 and ' + (nbResources - 1));
      }
    } else
      debug('Unable to select resource. Your argument must be an integer.');
    return false;
  };

  /**
   * Select a table within the currently selected resource.
   *
   * @param {integer|string} number
   *
   * @return {boolean}
   */
  this.selectTable = function (number) {
    var nbTables;

    if (typeof (number) === 'string')
      number = parseInt(number);

    nbTables = selected.resource.tables.length;

    if (typeof (number) === 'number') {
      if (number >= 0 && number < nbTables) {
        selected.table.i = number;
        if (selected.resource.xml !== undefined)
          selected.table.xml = selected.resource.tables[selected.table.i];
        currentTableMetadata = parseXmlMetadata('table');
        currentTableFields = parseCurrentTableFields();
        setCurrentTableGroups();
        return true;
      } else {
        debug('Unable to select table.'
              + 'You specified the table number "' + number + '", '
              + 'but the table number should be between 0 and ' + (nbTables - 1));
      }
    } else {
      debug('Unable to select table.'
            + 'Your argument must be an integer (or an integer contain in a string).');
    }
    return false;
  };

  /**
   * Parse the fields of the currently selected table.
   *
   * @return {Array}
   */
  function parseCurrentTableFields() {
    var fields = [],
        currentField = {},
        i = 0, j, childrens, child, tag, nullValue;

    Array.prototype.slice.call(
      selected.table.xml.getElementsByTagName(prefix + 'FIELD')).forEach(function (element) {
        //get the attribute
        Array.prototype.slice.call(element.attributes).forEach(function (element) {
          currentField[element.name] = element.value;
        });
        
        //childrens = element.children; // --> does not work on IE
        childrens = getChildren(element);
        for (j = 0; j < childrens.length; j++) {
            child = childrens[j];  
            tag = child.tagName.toLowerCase();
            currentField[tag] = {};
            //get the attribute of the child
            Array.prototype.slice.call(child.attributes).forEach(function (element) {
                currentField[tag][element.name] = element.value;
            });
            //get child text content
            if(!!child.textContent){
                currentField[tag]["text"] = child.textContent;
            }
          /*if (childrens[j].tagName === 'VALUES') {
            nullValue = childrens[j].getAttribute('null');
            break;
          }*/
        }
        /*if (nullValue !== undefined) {
          currentField['null'] = nullValue;
          nullValue = undefined;
        }*/
        fields[i] = currentField;
        currentField = {};
        i += 1;
      });
    return fields;
  };

  /**
   * Return the fields of the currently selected table.
   *
   * @return {Array}
   */
  this.getCurrentTableFields = function () {
    currentTableFields=parseCurrentTableFields();//@modifier: call the fonction parseCurrentTableFields();
    return currentTableFields;
  };

  /**
   * Return the data of the currently selected table.
   *
   * @return {Array}
   */
  this.getCurrentTableData = function () {
    if (!tablesData[selected.resource.i][selected.table.i]) {
      if (this.isCurrentTableEncodedInB64())
        parseB64CurrentTableData();
      else
        parseXmlCurrentTableData();
    }
    return tablesData[selected.resource.i][selected.table.i];
  };

  /**
   * Return the number of resources present in the VOTable file.
   *
   * @return {integer}
   */
  this.getNbResourcesInFile = function () {
    return vot.nbResources;
  };

  /**
   * Return the number of tables present in the currently selected resource.
   *
   * @return {integer}.
   */
  this.getCurrentResourceNbTables = function () {
    if (selected.resource.tables !== null)
      return selected.resource.tables.length;
    if (selected.resource.xml !== null)
      return selected.resource.xml.getElementsByTagName(prefix + 'TABLE').length;
    return 0;
  };

  /**
   * Check if the encodage of current table's data is in base 64.
   *
   * @return {boolean}
   */
  this.isCurrentTableEncodedInB64 = function () {
    if (this.getCurrentTableEncoding() === 'BASE-64')
      return true;
    return false;
  };

  /**
   * Return a specific value of the current table.
   *
   * @param {integer} x
   * @param {integer} y
   *
   * @return {number|string|null}
   */
  this.getCurrentTableSpecificData = function (x, y) {
    var currentTableData = '';

    if (typeof (x) !== 'number') {
      if (typeof (x) === 'string')
        x = parseInt(x);
      else {
        debug('Unable to get this data. '
              + 'Your argument must be an integer (or an integer contained in a string).');
        return null;
      }
    }
    if (typeof (y) !== 'number') {
      if (typeof (y) === 'string')
        y = parseInt(y);
      else {
        debug('Unable to get this data. '
              + 'Your argument must be an integer (or an integer contained in a string).');
        return null;
      }
    }
    currentTableData = this.getCurrentTableData();

    if (x < 0 || x >= currentTableData.length) {
      debug('Unable to get this data. '
            + 'You specified the first argument "' + x + '" '
            + 'but it should be between 0 and ' + tablesData.length);
      return null;
    }
    if (y < 0 || y >= currentTableData[x].length) {
      debug('Unable to get this data. '
            + 'You specified the second argument "' + y + '" '
            + 'but it should be between 0 and ' + tablesData[x].length);
      return null;
    }

    return currentTableData[x][y];
  };

  /**
   * Return basic informations about the currently loaded file.
   *
   * @return {Array}
   */
  this.whoAmI = function () {
    var array = {};

    array['xml'] = vot.name;
    array['resource'] = selected.resource.i;
    array['table'] = selected.table.i;
    return array;
  };

  /**
   * Util. function returning children nodes of node given as parameter
   * Excludes all child nodes which are not of type ELEMENT_NODE
   *
   * @return {Array}
   */
  function getChildren(node) {
    var children = [];
    for (var i = 0 ; i<node.childNodes.length; i++) {
      var child = node.childNodes[i];
      // keep only node of type Node.ELEMENT_NODE (==1)
      if (child.nodeType !== 1) {
        continue;
      }
      
      children.push(child);
    }

    return children;
  };

  //-----------------------------------------------------------------------------
  // Functions related to TABLEDATA parsing.

  /**
   * Parse data of currently selected table.
   *
   * @return {Array}
   */
  function parseXmlCurrentTableData() {
    var fields = thisParser.getCurrentTableFields(),
        rows = [],
        columns = [],
        i = 0, j = 0, k = 0,
        value,
        isComplex,
        // If the current column's value is an array, we need to store
        // its structure.
        arrayStructBuffer = [],
        arrayStruct = [],
        arrayStructLength = 0,
        // When array's last dimension is variable
        arrayStructLastDim,
        start = new Date().getTime();

    Array.prototype.slice.call(
      selected.table.xml.getElementsByTagName(prefix + 'TR')).forEach(function (element) {
        Array.prototype.slice.call(
          element.getElementsByTagName(prefix + 'TD')).forEach(function (element) {
            // For each column's value, we distinguish two cases: array of simple value
            // complex numbers are considered as array, strings are not
            isComplex = (fields[j].datatype.indexOf('Complex') > -1);
            if ((fields[j].arraysize !== undefined
                 && fields[j].datatype !== 'char'
                 && fields[j].datatype !== 'unicodeChar')
                || isComplex) {
              if (element.childNodes[0] !== undefined)
                arrayStructBuffer = element.childNodes[0].nodeValue.split(/\s* /);
              else
                arrayStructBuffer = [];

              if (arrayStructBuffer[0] === '')
                arrayStructBuffer.splice(0, 1);
              if (arrayStructBuffer[arrayStructBuffer.length - 1] === '')
                arrayStructBuffer.splice(arrayStructBuffer.length - 1, 1);

              arrayStruct = [];
              if (fields[j].arraysize !== undefined) {
                arrayStruct = fields[j].arraysize.split('x');
                arrayStructLength = arrayStruct.length;

                // According to VOTable standard, only the last dimension is variable
                if (/\*/.test(arrayStruct[arrayStructLength - 1])) {
                  arrayStructLastDim = arrayStructBuffer.length;
                  if (isComplex)
                    arrayStructLastDim /= 2;
                  for (k = 0; k < arrayStructLength - 1; k++)
                    arrayStructLastDim /= arrayStruct[k];
                  arrayStruct[arrayStructLength - 1] = arrayStructLastDim;
                }
                if (isComplex)
                  arrayStruct.unshift(2);
              }

              arrayStructBuffer.forEach(function (element, index, array) {
                array[index] = convertStringToValue(
                  element, fields[j].datatype, fields[j].precision);
              });

              columns[j] = createMultidimensionalArray(arrayStruct, arrayStructBuffer);
            } else {
              if (element.childNodes[0] !== undefined) {
                value = element.childNodes[0].nodeValue;
                if ((fields[j].null !== undefined && value === fields[j].null) || value === '')
                  value = null;
                else
                  value = convertStringToValue(value, fields[j].datatype, fields[j].precision);
              } else if (fields[j].datatype !== 'char' && fields[j].datatype !== 'unicodeChar')
                value = null;
              else
                value = '';

              columns[j] = value;
            }
            j++;
          });
        rows[i] = columns;
        columns = [];
        j = 0;
        i++;
      });

    thisParser.parsingTime = new Date().getTime() - start;
    debug('Performance Parsing : ' + thisParser.parsingTime + ' ms.');
    tablesData[selected.resource.i][selected.table.i] = rows;
  };

  /**
   * Convert string value into typed value.
   *
   * @param {string} val
   * @param {string} type
   * @precision {string} precision
   *
   * @return {type}
   */
  function convertStringToValue(val, type, precision) {
    switch (type) {
    case 'boolean':
      if (val.toLowerCase() === 'true')
        return true;
      if (val.toLowerCase() === 'false')
        return false;
      break;
    case 'bit':
    case 'unsignedByte':
    case 'short':
    case 'int':
    case 'long':
      return parseInt(val);
    case 'char':
    case 'unicodeChar':
      return val;
    case 'float':
    case 'double':
    case 'floatComplex':
    case 'doubleComplex':
      if (val.indexOf('Inf') > -1) {
        if (val.substring(0, 1) === '-')
          return Number.NEGATIVE_INFINITY;
        return Number.POSITIVE_INFINITY;
      }
      if (precision !== undefined)
        return (parseFloat(val).toFixed(precision) / 1);
      return (parseFloat(val)) / 1;
    default:
      return val;
    }
  };

  /**
   * Return a multidimensional array.
   * There exists no standard in the VOTable format for defining the null
   * value of an ARRAY's element.
   * I.e. there is no way to represent [intA, intB, intC] with intA/B/C as a 'magic number'.
   * " The VOTable specification notes that the content of each TD
   *   element must be consistent with the defined field type.
   *   So if we have an array column, say the CDMatrix for an image
   *   returned in a SIA, then the null must be a valid 2x2 matrix.
   *   I.e., <TD/> or <TD></TD> are not acceptable only <TD>NaN NaN NaN NaN</TD>
   *   (after specifying <VALUES null=’NaN NaN NaN NaN’ />)
   *   Currently we don’t worry much about array values in our databases
   *   (though some support arrays). "
   *
   * @param {Array} arrayStruct - result's number of elements for each of its dimensions
   * @param {Array} tempArray - one dimensional array we want to
   *                            transform into a multidimensional one
   *
   * @return {Array}
   */
  function createMultidimensionalArray(arrayStruct, tempArray) {
    var arrayStructLength = arrayStruct.length,
        res, i;

    // If the result has more than one dimension
    if (arrayStructLength > 1) {
      var arrayLength = arrayStruct[arrayStructLength - 1],
          arrayStructRec = arrayStruct.slice(0, arrayStructLength - 1),
          tempArrayRec,
          // length of each array who will be passed to the recursive call
          tempArrayRecLength = tempArray.length / arrayLength;
      res = new Array(arrayLength);
      for (i = 0; i < arrayLength; i++) {
        tempArrayRec = tempArray.slice(tempArrayRecLength * i, tempArrayRecLength * (i + 1));
        res[i] = createMultidimensionalArray(arrayStructRec, tempArrayRec);
      }
    } else
      res = tempArray;

    return res;
  };

  //-----------------------------------------------------------------------------
  // Functions related to B64 parsing

  /**
   * Parse data of currently selected table.
   * The algorithm of this function can be separated in three steps:
   * 1) We extract from the B64 stream the value of the current column,
   *    by reading a number of B64 characters equivalent to the current
   *    column's datasize value (rounded up), in the form of a binary array
   * 2) That binary array is converted into the current column's datatype
   * 3) The obtained value is stored into the result array
   * Note: if the current field's arraysize is defined, theses steps are
   * repeated for each element in the array
   *
   * @return {Array}
   */
  function parseB64CurrentTableData() {
    var fields = [],
        rows = [],
        columns = [],
        ptrCurrentField = 0,
        bitArray = [],
        dataB64Length,
        nbFields,
        // Note: here floatComplex and doubleComplex have only half the size
        // they posseses in the VOTable documentation.
        // This is because we mutiply their arraysize value by two,
        // as they count as a couple of float/complex
        dataTypeSize = {
          short: 16,
          int: 32,
          long: 64,
          float: 32,
          double: 64,
          floatComplex: 32,
          doubleComplex: 64,
          boolean: 8,
          char: 8,
          unicodeChar: 16,
          bit: 8,
          unsignedByte: 8
        },
        arrayStruct,
        arraySize,
        // In the case of a bit array, arraySize is equal to the number of bytes
        // (rounded up) required to store the bits;
        // so we need another variable to store their exact number
        bitArraySize,
        tempArray = [],
        dataSize,
        dataType,
        value = '',
        i = 0, k,
        start;

    endParsingB64 = false;

    dataB64 = selected.table.xml.getElementsByTagName(prefix + 'STREAM')[0].childNodes[0].nodeValue;
    
    // We must clean the B64 data from all the spaces and tabs it could contains
    dataB64 = dataB64.replace(/[ \t\r\n]+/g, '');
    dataB64Length = dataB64.length;
  
    fields = thisParser.getCurrentTableFields();
    nbFields = fields.length;

    start = new Date().getTime();

    do {

      dataType = fields[ptrCurrentField].datatype;
      dataSize = dataTypeSize[dataType];
      if(dataType=='unicodeChar'){
        dataType = 'char'
      }
      arraySize = 1;
      arrayStruct = [];

      // tempArray is reintialized here and not after we determined if
      // the current value was an array or not because of the non-array
      // complex values, who will be later in the algorithm considered as ones
      tempArray = [];

      if (fields[ptrCurrentField].arraysize !== undefined) {
        arrayStruct = fields[ptrCurrentField].arraysize.split('x');

        if (/\*/.test(arrayStruct[arrayStruct.length - 1])) {
          // If the last dimension of the array is variable (i.e. equals to '*'),
          // its value is coded on the 4 first bytes, before the values themselves
          bitArray = streamB64(32);
          if (bitArray === null){
            break;
          }
          value = bin2uint32(bitArray);
          for (k = 0; k < arrayStruct.length - 1; k++)
            value /= arrayStruct[k];
          arrayStruct[arrayStruct.length - 1] = value;
          // we reinitialize bitArray in the case where '*' was equal to 0,
          // i.e. the array contains no elements
          bitArray = [];
        }

        arraySize = arrayStruct[0];
        for (k = 1; k < arrayStruct.length; k++)
          arraySize *= arrayStruct[k];
      }

      switch (dataType) {
      case 'floatComplex':
      case 'doubleComplex':
        arraySize *= 2;
        arrayStruct.unshift(2);
        break;
      case 'bit':
        // arraySize represents the array's length in bytes;
        // so when manipulating bit array we need to keep their exact number
        // stored inside another value
        bitArraySize = arraySize;
        arraySize = Math.ceil(arraySize / 8);
        break;
      }

      for (k = 0; k < arraySize; k++) {
        bitArray = streamB64(dataSize);

        // If the returned value is null, it means that all the B64 data has been deciphered;
        // and that we are reading the padding characters '='
        if (bitArray === null) {
          dataType = 'noData';
          break;
        }
        switch (dataType) {
        case 'short':
          value = bin2short16(bitArray);
          break;
        case 'int':
          value = bin2int32(bitArray);
          break;
        case 'long':
          value = bin2long64(bitArray);
          break;
        case 'float':
        case 'floatComplex':
          value = bin2float32(bitArray);
          break;
        case 'double':
        case 'doubleComplex':
          value = bin2double64(bitArray);
          break;
        case 'boolean':
          value = bin2boolean(bitArray);
          break;
        case 'char':
          value = String.fromCharCode(bin2ubyte8(bitArray));
          break;
        case 'unicodeChar':
          value = String.fromCharCode(bin2ubyte16(bitArray));
          break;
          // Precisions about the bit array serialization en B64:
          // (as it is not clearely described in the VOTable documentation)
          // A bit array is stored on the minimal number of bytes possible
          // AND the padding bits are added at the END of the array
          // (so we use the arraysize to distinguish them from the others)
          // For example:
          // 11110 will be serialized on 1 byte, 11110000 (3 bits of padding)
          // 100010011 will be serialized on 2 bytes, 10001001 100000000 (7 bits of padding)
        case 'bit':
          value = bitArray;
          break;
        case 'unsignedByte':
          value = bin2ubyte8(bitArray);
          break;
        }

        if (fields[ptrCurrentField].precision !== undefined && isFinite(value))
          value = (value.toFixed(fields[ptrCurrentField].precision)) / 1;

        // In the case of a bit array, each value is already an array, so we concatenate them
        if (dataType === 'bit')
          tempArray = tempArray.concat(value);
        else if (arraySize !== 1)
          tempArray.push(value);
      }

      if (dataType === 'noData')
        break;

      if (dataType === 'bit') {
        // We suppress the padding bits
        tempArray.length = bitArraySize;
        tempArray.forEach(function (element, index, array) {
          array[index] = parseInt(element);
        });
        if (tempArray.length !== 1)
          value = tempArray;
        else
          value = tempArray[0];
      } else if (arraySize !== 1) {
        if (dataType !== 'char' && dataType !== 'unicodeChar')
          value = createMultidimensionalArray(arrayStruct, tempArray);
          
        else
          value = tempArray.join('');
      } else {
        if (fields[ptrCurrentField].null !== undefined
            && value === parseInt(fields[ptrCurrentField].null))
          value = null;
      }

      columns[ptrCurrentField] = value;
      
      if (ptrCurrentField === (nbFields - 1)) {
        ptrCurrentField = 0;
        rows[i] = columns;
        columns = [];
        i += 1;
      } else
        ptrCurrentField += 1;
    } while (ptrStream < dataB64Length);

    dataB64 = '';
    bufferBitArray = '';
    // After each B64 parsing, we must reset ptrStream to 0
    // (or we will not be able to parse another B64 datas)
    ptrStream = 0;
    tablesData[selected.resource.i][selected.table.i] = rows;
    thisParser.parsingTime = new Date().getTime() - start;
    debug('Performance parsing B64: ' + thisParser.parsingTime + ' ms.');
    return rows;//tableData also store the data
  };

  /**
   * Convert binary array to int 32 bits (unsigned).
   * Used for determining the size of a variable-length array
   *
   * @param {Array} bitArray
   *
   * @return {integer}
   */
  function bin2uint32(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(4);
    dataview = new DataView(arrayStructBuffer);
    binary = bitArray.join('');
    dataview.setUint32(0, parseInt(binary, 2));

    return dataview.getUint32(0);
  };

  /**
   * Read a value serialized in base 64 data, and return it as binary array.
   * Explanation: AAAABgAq/////g== is the B64 chain that represents 6 (int), 42 (short), -2 (int)
   * FIRST EXAMPLE: reading of the first column's value (int, i.e. dataSize==32):
   * needBit= 6, i.e. the value we want to read is located on the characters AAAABg
   * bufferBitArray is empty
   * ptrStream= 0 (character A)
   * nb= 0 (c.f. A's B64 value converted in decimal on 6 bits)
   * we push [0,0,0,0,0,0] in bitArray, bitArray.length= 6 < 32 (dataSize)
   * bitArray === [0,0,0,0,0,0]
   * ptrStream= 1 (character A)
   * nb= 0 (c.f. A's B64 value converted in decimal on 6 bits)
   * we push [0,0,0,0,0,0] in bitArray, bitArray.length= 12 < 32 (dataSize)
   * bitArray === [0,0,0,0,0,0,0,0,0,0,0,0]
   * ptrStream= 2 (character A)
   * nb= 0 (c.f. A's B64 value converted in decimal on 6 bits)
   * on push [0,0,0,0,0,0] in bitArray, bitArray.length= 18 < 32 (dataSize)
   * bitArray === [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   * ptrStream= 3 (character A)
   * nb= 0 (c.f. A's B64 value converted in decimal on 6 bits)
   * we push [0,0,0,0,0,0] in bitArray, bitArray.length= 24 < 32 (dataSize)
   * bitArray === [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   * ptrStream= 4 (character B)
   * nb= 1 (c.f. B's B64 value converted in decimal on 6 bits)
   * we push [0,0,0,0,0,1] in bitArray, bitArray.length= 30 < 32 (dataSize)
   * bitArray === [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
   * ptrStream= 5 (character g)
   * nb= 103 (c.f. g's B64 value converted in decimal on 6 bits), equal to 100000 in base 2
   * we push [1,0] in bitArray, bitArray.length= 32 === 32 (dataSize),
   * the rest is [0,0,0,0]
   * bitArray === [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0]
   * And 110 is equal to 6
   * As we have attained the size corresponding to the value's datasize,
   * we store the rest (that are the 4 first bits of the next column's value) in bufferBitArray
   * SECOND EXAMPLE: reading of the second column's value (short, i.e. dataSize==16):
   * needBit= 2, i.e. the value we want to read is located on the characters Aq
   * bufferBitArray is equal to [0,0,0,0],
   * we so initialize bitArray to [0,0,0,0] and reset bufferBitArray
   * ptrStream= 6 (character A)
   * nb= 0 (c.f. A's B64 value converted in decimal on 6 bits)
   * we push [0,0,0,0,0,0] in bitArray, bitArray.length= 10 < 16 (dataSize)
   * bitArray === [0,0,0,0,0,0,0,0,0,0]
   * ptrStream= 7 (character q)
   * nb= 113 (c.f. B's B64 value converted in decimal on 6 bits) equal to 101010 in base 2
   * we push [1,0,1,0,1,0] in bitArray, bitArray.length= 16 === 16 (dataSize)
   * bitArray === [0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0]
   * And 101010 is equal to 42
   * etc...
   *
   * @param {integer} dataSize
   *
   * @return {Array} - Binary array corresponding to the current value we are reading
   */
  function streamB64(dataSize) {
    var bufferLenght, needBit, bitArray = [],
        i, nb, z,byteDelta;

    // If we have not yet attained the end of the B64 stream, but we
    // know that all the next characters are padding characters '='
    if (endParsingB64)
      return null;
    else {
      bufferLenght = bufferBitArray.length;

      // We define the number of B64 characters we need to read;
      // and take in account the rest we obtained at previous value's streaming
      needBit = Math.ceil((dataSize - bufferLenght) / 6);

      byteDelta = dataB64.substring(ptrStream).length - needBit
      // byteDelta <0 represent a lack of available data compared to the data size
      // it's checking if don't need more bits than we have available
      // this avoid sending additional errored data.
      // problems of phantom data append with single column tables
      // fix author : cyril
      if (byteDelta < 0){
        return null;
      }

      for (i = 0; i < bufferLenght; i++)
        bitArray.push(bufferBitArray[i]);

      bufferBitArray = [];

      for (i = 0; i < needBit; i++) {
        // When we encounter the character '=', we must realize the
        // chain's parsing in 2 steps: (i.e. first set endParsingB64
        // to true, and then return null at the next call of the
        // function).
        // That's because the left bits of the character '=' are part
        // of the last value we are parsing.
        // Example: we have table with 1 unique field
        // (datatype==='short') and 2 lines, the 1st containing 42,
        // the 2nd 24 i.e. in B64 this data is equal to ACoAG===, or
        // in base 2:
        // 000000 000010 101000 000000 000110 00XXXX XXXXXX XXXXXX
        // 24 has then its value spread on the 2 left bits of the first '='; so we must read them
        // (and let know the parser that we have encountered an '='),
        // and then at the reading of the next character, end the parsing
        if (dataB64[ptrStream] === '=') {
          // In a very specific case, the '=' we are reading, combined
          // to the bits we possesses in bitArray is equal to a bit
          // number equal to dataSize, and so we must immediately
          // return null, without using the endParsingB64 flag.
          // If we do not, the function will return 0, who will be
          // considered as a value, and added to the parsed data.
          // Example: we have a line with 2 columns, the first containing 1 unsignedByte,
          // and the second an array of unsignedBytes with a VARIABLE length;
          // The B64 chain we stream is DQAAAAA= (i.e. 13 et []), égal en base 2 à:
          // 000011 010000 000000 000000 000000 000000 000000 ******, i.e.
          // 00001101 (13),
          // 00000000 00000000 00000000 00000000 (empty array with its length on 4 bytes, 0)
          // 00****** (rest)
          // Explanation about the rest's treatment:
          // When we finish to read the last 'A' of the chain, we store [0,0] in bufferBitArray
          // When we read '=', we set endParsingB64 on true
          // (i.e. on know that after reading it, the parsing will be over)
          // Two cases are then -generally- encountered:
          // i) The value we are reading exists, and is composed of
          // bufferBitArray+(nb of 0 needed to attain dataSize);
          // (explained in the previous ACoAG=== example)
          // ii) The value we are reading doesn't exists, and what we have stored in bufferBitArray
          // are just padding bits
          // EXCEPT there exists a third case - an exception of i) -,
          // where tabBuffer+'=' is equal to a bit number that match dataSize
          // i.e. bitArray= [0,0] followed by '=' with a dataSize of 8 (unsignedByte)
          // give [0,0,0,0,0,0,0,0], interpreted by the parser as the value 0
          // (and this is false, 0 will have been encoded with bitArray followed by 'A' and not '=')
          // We must so immediately return null in that specific case
          if (bitArray.length === dataSize%6)
            return null;
          else
            endParsingB64 = true;
        }
        // 10 is the ASCII character of the carriage return
        if (dataB64.charCodeAt(ptrStream) === 10)
          i -= 1;
        else {
          nb = b642uint6(dataB64.charCodeAt(ptrStream));

          // >>: Right Shift Binary operator
          // Example: 110 >>= 1 === 11
          for (z = 32; z > 0; z >>= 1) {
            if (bitArray.length !== dataSize) {
              // nb & z => binary &&, i.e. :
              // return 1 when each bit of the two values are equals to 1.
              bitArray.push(((nb & z) === z) ? '1' : '0');
            } else {
              bufferBitArray.push(((nb & z) === z) ? '1' : '0');
            }
          }
        }
        // We read the next character of the B64 string
        ptrStream += 1;
      }
      return bitArray;
    }
  };

  /**
   * Convert Ascii code to base 64 value.
   * Return the base 10 value of a B64 character, by using its ASCII value
   * For example, g in B64 is equal to 100000, who is equal to 32 in base 10
   *
   * @param {integer} character
   *
   * @return {integer}
   */
  function b642uint6(character) {
    var byte;

    if (character > 64 && character < 91) { // char A-Z
      byte = character - 65;
    } else if (character > 96 && character < 123) { // char a-z
      byte = character - 71;
    } else if (character > 47 && character < 58) { // number 0-9
      byte = character + 4;
    } else if (character === 43) { // char +
      byte = 62;
    } else if (character === 47) { // char /
      byte = 63;
    }
    return byte;
  };

  /**
   * Convert binary array to short 16 bits (signed).
   *
   * @param {Array} bitArray
   *
   * @return {integer} - (16 bits)
   */
  function bin2short16(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(2);
    dataview = new DataView(arrayStructBuffer);
    binary = bitArray.join('');
    dataview.setUint16(0, parseInt(binary, 2));

    return dataview.getInt16(0);
  };

  /**
   * Convert binary array to int 32 bits (signed).
   *
   * @param {Array} bitArray
   *
   * @return {integer} - (32 bits)
   */
  function bin2int32(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(4);
    dataview = new DataView(arrayStructBuffer);
    binary = bitArray.join('');
    dataview.setUint32(0, parseInt(binary, 2));

    return dataview.getInt32(0);
  };

  /**
   * Convert binary array to long 64 bits (signed).
   * As JavaScript does not possesses any method that can directly
   * return an integer coded on 64 bits, we must process by using
   * setUint32 and getUint32
   * Two cases exists:
   * i) The integer is positive, and we simply have to obtain
   *    separately the two 4 bytes of right and left, and then add
   *    them by multiplying the number obtained with the 4 left bytes
   *    by 2^32
   * ii) The integer is negative, and we must obtain its opposite bit reversing all its bits and
   *    do the ones' complement
   *     We then repeat the same steps described in i)
   * As with this method we always work with positive integers coded
   * on 4 bytes while using dataView, we get the values with the
   * getUint method (and NOT with getInt), because as the integer is
   * coded on 8 bytes, the 4 right bytes can have their most
   * significant bit equal to 1 (i.e. getInt will return a negative
   * result)
   *
   * @param {Array} bitArray
   *
   * @return {integer} - (64 bit)
   */
  function bin2long64(bitArray) {
    var arrayStructBuffer, dataview, binary,
        tempBitArray,
        i, j,
        bufferLeftBytes,
        sign = 1;

    if (bitArray[0] === '1') {
      sign = -1;
      tempBitArray = bitArray.slice(0);
      for (i = 0; i < bitArray.length; i++) {
        bitArray[i] = tempBitArray[i] === '0' ? 1 : 0;
      }
      j = bitArray.length - 1;
      while (bitArray[j] === 1) {
        bitArray[j] = 0;
        j--;
      }
      bitArray[j] = 1;
    }

    arrayStructBuffer = new ArrayBuffer(4);
    dataview = new DataView(arrayStructBuffer);

    binary = bitArray.slice(0, 32).join('');
    dataview.setUint32(0, parseInt(binary, 2));
    bufferLeftBytes = dataview.getUint32(0);

    binary = bitArray.slice(32, 64).join('');
    dataview.setUint32(0, parseInt(binary, 2));
    // (4294967296) base 10 === (2^32) base 10
    return sign * (bufferLeftBytes * 4294967296 + dataview.getUint32(0));
  };

  /**
   * Convert binary array to float 32 bits.
   *
   * @param {Array} - bitArray
   *
   * @return {double} (32 bits)
   */
  function bin2float32(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(4);
    dataview = new DataView(arrayStructBuffer);
    binary = bitArray.join('');
    dataview.setUint32(0, parseInt(binary, 2));

    return dataview.getFloat32(0);
  };

  /**
   * Convert binary array to double 64 bits.
   *
   * @param {Array} - bitArray
   *
   * @return {double} (64 bits)
   */
  function bin2double64(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(8);
    dataview = new DataView(arrayStructBuffer);

    // We have to use the setUint32 method twice,
    // because a method such as setFloat64 doesn't exists in JavaScript
    binary = bitArray.slice(0, 32).join('');
    dataview.setUint32(0, parseInt(binary, 2));

    binary = bitArray.slice(32, 64).join('');
    dataview.setUint32(4, parseInt(binary, 2));

    return dataview.getFloat64(0);
  };

  /**
   * Convert binary array to boolean
   *
   * @param {Array} - bitArray

   * @return {boolean}
   */
  function bin2boolean(bitArray) {
    var bool = String.fromCharCode(bin2ubyte8(bitArray));

    switch (bool) {
    case 'T':
    case 't':
    case '1':
      return true;
    case 'F':
    case 'f':
    case '0':
      return false;
    case ' ':
    case '?':
      return null;
    }
    return null;
  };

  /**
   * Convert binary array to int 8 bits (unsigned : 0 - 255).
   *
   * @param {Array} - bitArray
   *
   * @return {integer} - (8 bit)
   */
  function bin2ubyte8(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(1);
    dataview = new DataView(arrayStructBuffer);
    binary = bitArray.join('');
    dataview.setUint8(0, parseInt(binary, 2));

    return dataview.getUint8(0);
  };

  /**
   * Convert binary array to int 16 bits (signed)
   *
   * @param {Array} - bitArray
   *
   * @return {integer} - (16 bit)
   */
  function bin2ubyte16(bitArray) {
    var arrayStructBuffer, dataview, binary;

    arrayStructBuffer = new ArrayBuffer(2);
    dataview = new DataView(arrayStructBuffer);
    binary = bitArray.join('');
    dataview.setUint8(0, parseInt(binary, 2));

    return dataview.getUint16(0);
  };

  //--------------------------------------------------------------------------------
  // Functions related to Metadata parsing

  /**
   * Parse Xml Metadata for three case : votable, resource and table.
   *
   * @param {string} metaType - ('votable' OR 'resource' OR 'table'
   *
   * @return {Object}
   */
  function parseXmlMetadata(metaType) {
    var output = {},
        selectedNode;

    switch (metaType) {
    case 'votable':
      selectedNode = xmlData.getElementsByTagName(prefix + 'VOTABLE')[0];
      break;
    case 'resource':
      selectedNode = selected.resource.xml;
      break;
    case 'table':
      selectedNode = selected.table.xml;
      break;
    }
    output = getNodeComponents(selectedNode);
    if (output.groups === undefined)
      output.groups = [];
    if (output.params === undefined)
      output.params = [];
    if (output.infos === undefined)
      output.infos = [];
    switch (metaType) {
    case 'votable':
      // COOSYS: deprecated in VOTable documentation
      if (output.coosyss === undefined)
        output.coosyss = [];
      break;
    case 'resource':
      // COOSYS: deprecated in VOTable documentation
      if (output.coosyss === undefined)
        output.coosyss = [];
      if (output.links === undefined)
        output.links = [];
      break;
    case 'table':
      if (output.fields === undefined)
        output.fields = [];
      if (output.links === undefined)
        output.links = [];
      break;
    }
    return output;
  };

  /**
   * Return the different components of an xml node
   *
   * @param {Object} node
   *
   * @return {Object}
   */
  function getNodeComponents(node) {
    var data = {},
        output = {},
        childrens, i, attributeName;

    output = getNodeAttributes(node);
    //childrens = node.children; // --> does not work on IE
    childrens = getChildren(node);


    for (i = 0; i < childrens.length; i++) {
      attributeName = childrens[i].tagName.substr(prefix.length);
      // We do not take the resource, table, field, and data nodes as they are parsed by
      // other specific methods
      if (attributeName !== 'RESOURCE'
          && attributeName !== 'TABLE'
          && attributeName !== 'FIELD'
          && attributeName !== 'DATA') {
        switch (attributeName) {
        case 'GROUP':
          data = getNodeComponents(childrens[i]);
          break;
        case 'DESCRIPTION':
          data = childrens[i].childNodes[0].nodeValue;
          break;
        default:
          data = getNodeAttributes(childrens[i]);
        }
        attributeName = attributeName.toLowerCase() + 's';
        if (!output[attributeName]) {
          if (attributeName !== 'descriptions') {
            output[attributeName] = new Array(data);
          } else {
            output['description'] = data;
          }
        } else {
          output[attributeName].push(data);
        }
      }
      data = {};
    }
    return output;
  };

  /**
   * Return the different attributes of an xml node
   *
   * @param {Object} node
   *
   * @return {Array}
   */
  function getNodeAttributes(node) {
    if (node===undefined) {
      return [];
    }

    var data = {},
        j;
    for (j = 0; j < node.attributes.length; j += 1) {
      data[node.attributes[j].name] = node.attributes[j].value;
    }
    return data;
  };

  /**
   * Return Metadata of the VOTable file.
   *
   * @return {Object}
   */
  this.getVOTableMetadata = function () {
    return votableMetadata;
  };

  /**
   * Return Metadata of the current resource.
   *
   * @return {Object}
   */
  this.getCurrentResourceMetadata = function () {
    return currentResourceMetadata;
  };

  /**
   * Return Metadata of the current table.
   *
   * @return {Object}
   */
  this.getCurrentTableMetadata = function () {
    return currentTableMetadata;
  };

  /**
   * Update the groups Metadata by setting their FIELDrefs and PARAMrefs values to the related ones
   * We must distinguish each case:
   * i) The FIELDrefs are easy to link with their fields of reference, because according to the
   *      VOTable documentation, a FIELDref can only be related to a field defined in the same table
   *      (and only in a table)
   * ii) The PARAMrefs are more complicated, because they can references PARAM defined not only in
   *      the current node, but also in the resource/VOTable nodes located above the current node
   * Note: As the PARAMrefs and the FIELDrefs can possess their own
   * ucd and such attributes, we keep them when we do the link to the
   * referenced element by adding 'Ref' to the attribute name
   *
   * @param {Object[]} groups
   * @param {Object[]} params - List of the parameters related to the groups
   *
   * @return {Object[]}
   */
  function setGroupsRefs(groups, params) {
    var i, j, k, nbElts, key;
    for (k = 0; k < groups.length; k++) {
      if (groups[k].groups === undefined)
        groups[k].groups = [];
      if (groups[k].params === undefined)
        groups[k].params = [];
      if (groups[k]['fieldrefs'] !== undefined) {
        for (i = 0; i < groups[k]['fieldrefs'].length; i++) {
          for (j = 0; j < currentTableFields.length; j++) {
            if (currentTableFields[j].ID === groups[k]['fieldrefs'][i].ref) {
              if (groups[k]['fields'] === undefined)
                groups[k]['fields'] = [];
              groups[k]['fields'].push(currentTableFields[j]);
              nbElts = groups[k]['fields'].length - 1;
              for (key in groups[k]['fieldrefs'][i]) {
                if (key !== 'ref') {
                  groups[k]['fields'][nbElts][key + 'Ref'] = groups[k]['fieldrefs'][i][key];
                }
              }
            }
          }
        }
        delete groups[k]['fieldrefs'];
      }
      if (groups[k]['paramrefs'] !== undefined) {
        for (i = 0; i < groups[k]['paramrefs'].length; i++) {
          for (j = 0; j < params.length; j++) {
            if (params[j].ID === groups[k]['paramrefs'][i].ref) {
              if (groups[k]['params'] === undefined)
                groups[k]['params'] = [];
              groups[k]['params'].push(params[j]);
              nbElts = groups[k]['params'].length - 1;
              for (key in groups[k]['paramrefs'][i]) {
                if (key !== 'ref') {
                  groups[k]['params'][nbElts][key + 'Ref'] = groups[k]['paramrefs'][i][key];
                }
              }
            }
          }
        }
        delete groups[k]['paramrefs'];
      }
      if (groups[k]['groups'] !== undefined)
        groups[k]['groups'] = setGroupsRefs(groups[k]['groups'], params);
    }
    return groups;
  };

  /**
   * Set the values of ref attributes in the VOTable's groups
   */
  function setVOTableGroups() {
    if (votableMetadata['groups'] !== undefined)
      setGroupsRefs(votableMetadata['groups'], getRelatedMetadataParams(1));
  };

  /**
   * Set the values of ref attributes in the current resource's groups
   */
  function setCurrentResourceGroups() {
    if (currentResourceMetadata['groups'] !== undefined)
      setGroupsRefs(currentResourceMetadata['groups'], getRelatedMetadataParams(2));
  };

  /**
   * Set the values of ref attributes in the current table's groups
   */
  function setCurrentTableGroups() {
    if (currentTableMetadata['groups'] !== undefined)
      setGroupsRefs(currentTableMetadata['groups'], getRelatedMetadataParams(3));
  };

  /**
   * Return the array of parameters related to the relative position of the PARAMrefs
   * we want to links them to in the VOTable xml tree
   *
   * @param {integer} deepness (1 if VOTable, 2 if resource, 3 if table)
   *
   * @return {Object[]}
   */
  function getRelatedMetadataParams(deepness) {
    var param = [];
    if (deepness >= 1 && votableMetadata['params'] !== undefined)
      param = param.concat(votableMetadata['params']);
    if (deepness >= 2 && currentResourceMetadata['params'] !== undefined)
      param = param.concat(currentResourceMetadata['params']);
    if (deepness >= 3 && currentTableMetadata['params'] !== undefined)
      param = param.concat(currentTableMetadata['params']);
    return param;
  };

  /**
   * Return VOTable's groups
   *
   * @return {Object[]}
   */
  this.getVOTableGroups = function () {
    if (votableMetadata === undefined) {
      debug('Warning: no Meta from VOTable file; it seems no file has been loadFileed');
      return undefined;
    }
    return votableMetadata['groups'] !== undefined ? votableMetadata['groups'] : [];
  };

  /**
   * Return current resource's groups
   *
   * @return {Object[]}
   */
  this.getCurrentResourceGroups = function () {
    if (currentResourceMetadata === undefined) {
      debug('Warning: no Meta from Resource');
      return undefined;
    }
    return currentResourceMetadata['groups'] !== undefined
      ? currentResourceMetadata['groups'] : [];
  };

  /**
   * Return current table's groups
   *
   * @return {Object[]}
   */
  this.getCurrentTableGroups = function () {
    if (currentTableMetadata === undefined) {
      debug('Warning: no Meta from Table');
      return undefined;
    }
    return currentTableMetadata['groups'] !== undefined
      ? currentTableMetadata['groups'] : [];
  };

  //----------------------------------------------------------------------------
  // Functions related to the results's rendering (in HTML format)

  /**
   * Get fields of table (HTML)
   *
   * @return {string}
   */
  this.getHtmlCurrentTableFields = function () {
    var i, fields, nbFields, output = '';

    fields = this.getCurrentTableFields();
    nbFields = fields.length;
    output += '<tr>';
    for (i = 0; i < nbFields; i++) {
      output += '<th>' + fields[i].name + '</th>';
    }
    output += '</tr>';

    return output;
  };

  /**
   * Get tablesData of table (HTML)
   *
   * @param {integer} min - (optional)
   * @param {integer} max - (optional)
   *
   * @return {string}
   */
  this.getHtmlCurrentTableData = function (min, max) {
    var i, j, data, nbRows, nbColumns, output = '';

    if (typeof (min) === 'string') {
      min = parseInt(min);
    }
    if (typeof (max) === 'string') {
      max = parseInt(max);
    }
    min = min || 0;

    data = this.getCurrentTableData();

    if (max && max < data.TR.length) {
      nbRows = max;
    } else {
      if (!max) {
        debug('Warning. You specified the maximum at "' + max
              + '" but the maximum possible is ' + data.length);
      }
      nbRows = data.length;
    }

    for (i = min; i < nbRows; i++) {
      nbColumns = data[i].length;
      output += '<tr>';

      for (j = 0; j < nbColumns; j++) {
        output += '<td>' + data[i][j] + '</td>';
      }

      output += '</tr>';
    }

    return output;
  };

  //----------------------------------------------------------------------------
  // Debug functions

  /**
   * Display error in browser console.
   *
   * @param {boolean} display
   */
  this.displayErrors = function (display) {
    if (display) {
      debugMode = true;
    } else {
      debugMode = false;
    }
  };

  /**
   * Print error in console if debug mode is active.
   *
   * @param {string} error
   */
  function debug(message) {
    if (debugMode)
      console.warn('DEBUG => ' + message);
  };
};

// Export parser in CommonJS format if possible.
if (typeof module === 'object') module.exports = new VOTableParser();
