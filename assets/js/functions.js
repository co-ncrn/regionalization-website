
/**
 *	These functions are in the public domain
 *	Owen Mundy owenmundy.com
 */
 
 

/**
 *	Make sure a property or method is:
 *	1. declared
 *	2. is !== null, undefined, NaN, empty string (""), 0, false
 *	* like PHP isset()
 */
function prop(val){
	if (typeof val !== 'undefined' && val){ 
		return true; 
	} else { 
		return false; 
	}
}

 
/**
 *	Wrapper function(s) for console.log() for non-chrome browsers
 */
var debug = true;
function log(text) {
	if (prop(debug) && window.console) 
		window.console.log(text);
} 
if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };