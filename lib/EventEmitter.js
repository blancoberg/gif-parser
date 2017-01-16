/**
* Get style value from e domElement
* @function
* @param {DomElement} DomElement
* @param {string} styleProp property name. e.g. "left","top","width"
*/

function getStyle(el, styleProp) {

  var value, defaultView = (el.ownerDocument || document).defaultView;

  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {


    // sanitize property name to css notation
    // (hypen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
      return (function(value) {
        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
    return value;
  }
}

/**
* rotates a vector
* @function
* @param {object} vector object containing x & y params.
* @param {function} angle rotate in radians.
*/

function rotateVector(vec,angle){
  var x = vec.x * Math.cos(angle) - vec.y * Math.sin(angle);
  var y = vec.x * Math.sin(angle) + vec.y * Math.cos(angle);
  vec.x = x;
  vec.y = y;
  return vec;
}

/**
* Emits events to its listeners.
* @class
*/

function EventEmitter(){
  this.listeners = [];
}

/**
 * Adds an eventlistener
 * @function
 * @param {string} event name
 * @param {function} callback function
 */

EventEmitter.prototype.on = function(eventName,callback,count){

  count = count == null ? -1 : count;
  this.off(eventName,callback);
  this.listeners.push({eventName:eventName,callback:callback,counter:count});

}

/**
* Adds an eventlistener and calls it only on time.
* @function
* @param {string} event name
* @param {function} callback function
*/

EventEmitter.prototype.once = function(eventName,callback){
  this.on(eventName,callback,1);
}

/**
* Removes an eventlistener. If no callback function is given, all listeners with eventName will be erased.
* @function
* @param {string} event name
* @param {function} callback function
*/

EventEmitter.prototype.off = function(eventName,callback){

  for(var i = this.listeners.length-1;i>-1;i--){
    var listener = this.listeners[i];
    if(listener.eventName == eventName){
      if(listener.callback == callback || listener.callback == null){
        this.listeners.splice(i,1);
      }
    }
  }

}

/**
* Removes all event listeners that is called with "once"
* @function
* @private
*/

EventEmitter.prototype.removeUsedListeners = function(){
  for(var i = this.listeners.length-1;i>-1;i--){
    var listener = this.listeners[i];
    if(listener.counter==0){
      this.listeners.splice(i,1);
    }
  }
}

/**
* Emit an event with id eventName
* @function
* @param {string} eventName Event name
* @param {object} data Data so send with the event. Can be anything.
*/

EventEmitter.prototype.emit = function(eventName,data){
  for(var i = this.listeners.length-1;i>-1;i--){
    var listener = this.listeners[i];

    if(listener.eventName == eventName){
      listener.callback({target:this,data:data});
      listener.counter--;
    }
  }
  this.removeUsedListeners();
}
