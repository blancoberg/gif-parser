if(window["Banner"] != null)
  Banner.log(" @import animation.Anim ",1,10);


if (typeof Object.create != 'function') {
  Object.create = (function(undefined) {
    var Temp = function() {};
    return function (prototype, propertiesObject) {
      if(prototype !== Object(prototype) && prototype !== null) {
        throw TypeError('Argument must be an object, or null');
      }
      Temp.prototype = prototype || {};
      var result = new Temp();
      Temp.prototype = null;
      if (propertiesObject !== undefined) {
        Object.defineProperties(result, propertiesObject);
      }

      // to imitate the case of Object.create(null)
      if(prototype === null) {
         resulthis.__proto__ = null;
      }
      return result;
    };
  })();
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype) {
      // Function.prototype doesn't have a prototype property
      fNOP.prototype = this.prototype;
    }
    fBound.prototype = new fNOP();

    return fBound;
  };
}

if(!window.requestAnimationFrame){
  //console.log("setting request anim frame")
  window.requestAnimationFrame = function(func){
    window.setTimeout(func,1000/60);
  }
}
_Anim.globalTimeScale = 1;

function _Anim(){

  EventEmitter.call(this);
  this.strength = 1;
  this.time = 0;
  this._currentTime = new Date().getTime();
  this.timeScale = 1;
  this.baseTweens = [];
  this.tweens = [];
  this.update();
}

_Anim.prototype = Object.create(EventEmitter.prototype);
_Anim.prototype.constructor = _Anim;


// equations //
// t: current time, b: begInnIng value, c: change In value, d: duration
var Easing = {
  easeInQuad: function (t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},

	easeInOutBack: function (t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (t, b, c, d) {
		return c - eq.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (t, b, c, d) {
		if (t < d/2) return eq.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return eq.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
}

Easing.cosinus = function (t, b, c, d) {
    var t2 = Easing.eoe(t,0,1,1);
		return b + c- c * Math.cos(Math.PI*4*t)*(d-t2);
}

Easing.ioq= function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
}
Easing.oq = function(t,b,c,d){
	return -c *(t/=d)*(t-2) + b;
}

Easing.l = function(t,b,c,d){
  return b + c * t/d;
}
Easing.eie =function (t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	}
Easing.eoe =function (t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	}

// animate function //
_Anim.prototype.to = function(obj,time,delay,params,events){

  //console.log("events",events)
  events=events||{};
  //console.log("removeOnComplete",events.removeOnComplete)
  events.removeOnComplete = events.removeOnComplete == null ? true : false;
  var tween = {obj:obj,start:{},_delay:delay,_time:time,time:0,startTime:this.time,params:params,events:events};
  this.tweens.push(tween);

  if(time==0 && delay == 0){

    this.startTween(tween);
  }
  this.tweens.sort(function(b, a){return (a._delay+a._time)-(b._delay+b._time)});
  //console.log(this.tweens);
  return tween;
}

_Anim.prototype.startTween = function(tween){

  for(a in tween.params){
      tween.obj[a] = tween.params[a];
      tween.start[a] = tween.start[a] == null ? tween.obj[a] : tween.start[a];
      //console.log("settings directly",a);
  }
  this.removeDouble(tween,tween.params);
  tween.started=true;
  //events.push({id:"start",tween:tween});

}

// updates all current animations //
_Anim.prototype.update = function(doNotLoop){



  if(doNotLoop !== false)
    window.requestAnimationFrame(this.update.bind(this))




  if(this.timeScale>0){

    //console.log("anim.update")
    var events = [];
    var t = this;
    //var deltaTime=1/60;
    var dt = (new Date().getTime() - this._currentTime)/1000;
    this._currentTime = new Date().getTime();
    this.emit("update");

    //if(tween.obj != this && tween.obj != _Anim) // lets you tween the timeScale without slowing down that actual tween
    var deltaTime = dt * this.timeScale * _Anim.globalTimeScale;


    this.time += Math.min(1/30,deltaTime * this.timeScale);

    var i = this.tweens.length;while(i--){


      var tween = this.tweens[i];

      tween.time =this.time-tween.startTime;
      if((tween.time>tween._delay || tween._time==0) && !tween.started){

        for(a in tween.params){
            tween.start[a] = tween.start[a] == null ? tween.obj[a] : tween.start[a];
        }

        this.removeDouble(tween,tween.params);
        tween.started=true;
        events.push({id:"start",tween:tween});
      }
      if(tween.started){

        var proc = (tween.time-tween._delay)/(tween._time || (tween.time-tween._delay));
        //if(tween._time==0)
          //proc = 1;

        //if(tween.params.rotation)
          //console.log("proc",proc)
        //if(tween._time==0)
          //proc = 1;
        if(tween.time-tween._delay>=tween._time){
          proc = 1;
          if(tween.events.removeOnComplete== true){
            events.push({id:"complete",tween:tween});
            this.tweens.splice(i,1);
          }


        }
        proc = Math.max(0,Math.min(proc,1));
        events.push({id:"update",tween:tween});
        var tweenTime = tween.time-tween._delay;




        //if(this.time-tween.startTime-tween._delay<=tween._time){

          //if(tween.paused !==false){
            for(var a in tween.params){
                tween.obj[a]=this.calculateValue(tween,a,proc);
            }
          //}

        //}
      }
    }

    for(var i = 0;i<events.length;i++){
      var e = events[i];
      var func = e.tween.events[e.id];

      if(func)
        func(e.tween.obj);
    }

  }




}

_Anim.prototype.calculateValue = function(tween,a,proc){
    var easing = Easing[tween.events.ease] || Easing.oq;
    return easing(proc,tween.start[a],tween.params[a]-(1)*tween.start[a],1);
}

_Anim.prototype.getGlobalTimeScale = function(){
  return _Anim.globalTimeScale;
}

_Anim.prototype.setGlobalTimeScale = function(timeScale){
  //console.log("setting timescale",timeScale)
  _Anim.globalTimeScale = timeScale;
}

_Anim.prototype.setTimeout = function(callback,time){
  this.to({},time*0.001,0,{},{complete:callback});
}

// add setinterval //

// removes any current animations that interfear with the new one.
_Anim.prototype.removeDouble = function(tween,params){
  var tweens = this.tweens;
  for(var i = tweens.length-1;i>-1;i--){
    var tween2 = tweens[i];
    if(tween2.obj == tween.obj && tween != tween2 &&
    tween._time + tween._delay>= tween2._time + tween2._delay){

      for(var a in tween.params){
        //console.log("remove double param",a)
        delete tween2.params[a];
      }
    }
  }
}
// remove animation that animates object obj.
_Anim.prototype.remove = function(obj){
  for(var i = this.tweens.length-1;i>-1;i--){
    if(this.tweens[i].obj == obj){

      this.tweens.splice(i,1);
    }
  }
}

var Anim = new _Anim();
