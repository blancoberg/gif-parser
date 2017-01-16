if(window["Banner"] != null)
  Banner.log(" @import graphics.Sprite ",1,10);
function isElement(obj) {
  try {
    //Using W3 DOM2 (works for FF, Opera and Chrom)
    return obj instanceof HTMLElement;
  }
  catch(e){
    //Browsers not supporting W3 DOM2 don't have HTMLElement and
    //an exception is thrown and we end up here. Testing some
    //properties that all elements have. (works on IE7)
    return (typeof obj==="object") &&
      (obj.nodeType===1) && (typeof obj.style === "object") &&
      (typeof obj.ownerDocument ==="object");
  }
}



var _img_crop = [];

Sprite.started = false;
Sprite.sprites = [];
Container = Sprite;

/**
* Creates a container for domElements to provide a simple api for animating them.
* @constructor
* @param {string} id - id of HTMLElement or HTMLElement instance
* @extends CanvasSprite
*/

function Sprite(id){

  CanvasSprite.call(this);

  //this.id = id;
  this.renderQueue = {};
  this.dirty = 0;

  this.dom = document.getElementById(id) || id;
  this.isImage = this.dom instanceof HTMLImageElement || this.dom instanceof HTMLCanvasElement;

  if(this.dom instanceof HTMLCanvasElement)
  {
    this.canvas = this.dom;
    this.context = this.canvas.getContext("2d");
  }

  if(this.dom){

    var style = getStyle(this.dom,"left");
    //console.log("checking dom style","dom",this.dom,"value",style)
    this._x = Number(getStyle(this.dom,"left").split("px")[0]);
    this._y = Number(getStyle(this.dom,"top").split("px")[0]);
    this._alpha = Number(getStyle(this.dom,"opacity"));
    //console.log("Sprites.sprites",Sprite.sprites)
    Sprite.sprites.push(this);
  }

  this._x = isNaN(this._x) ? 0 : this._x;
  this._y = isNaN(this._y) ? 0 : this._y;

  this._offsetX = 0;
  this._offsetY = 0;

  this._width = this.dom != null ? this.dom.offsetWidth : 0;
  this._height = this.dom != null ? this.dom.offsetHeight : 0;

  this._alpha = isNaN(this._alpha) ? 0 : this._alpha;

  this._origoX = 0;
  this._origoY = 0;

  this._rotationX = 0;
  this._rotationZ = 0;
  this._rotationY = 0;


  this._motionBlur = 0;
  this._motionBlurMax = 20;

  this._scaleX = 1;       // x
  this._scaleY = 1;       // x
  this._skewX = 0;        // x
  this._skewY = 0;        // x
  this._perspective = 0;  //
  this._translateX = 0;   // x
  this._translateY = 0;   // x

  this._flipX = false;
  this._flipY = false;

  this._position = null;
  /*
          filters
 */
 /////////////////////////////////

  this._blur = 0;
  this._brightness = 1;
  this._contrast = 0;
  this._grayscale = 0;
  this._sepia = 0;

  ///////////////////////////////

  // update dimensions to fix bugs for svgs //
  //this.width = this._width;
  //this.height = this._height;



  this.attachements = [];
  if(this.dom){
    //console.log("updateorigin",this.dom)

    this.updateTransform();
    this.updateOrigin();
  }


  this._speed = {};



  if(!Sprite.started)
    Sprite.started=true;
    Anim.on("update",Sprite.render);
}

Sprite.prototype = Object.create(CanvasSprite.prototype);
Sprite.prototype.constructor = Sprite;

Sprite.prototype.on = function(eventName,callback,count){

  EventEmitter.prototype.on.apply(this,arguments);

  if(eventName=="render")
    this.forceRender = true;

}
/**
* Creates a container for domElements to provide a simple api for animating them.
* @property {number} motionBlur sets amount of motionBlur. the value blur will automaticaly change depending on speed.
* @property {number} motionBlurMax sets a max amount of motionBlur
*
* @property {number} blur [filter] Blur in pixels
* @property {number} brightness [filter] Brightness
* @property {number} contrast [filter] Contrast
* @property {number} sepia [filter] Sepia
*
*
*/

Object.defineProperty(Sprite.prototype,"motionBlur",{
  set:function(v){
    this._motionBlur = v;
  },
  get:function(){
    return this._motionBlur;
  }
})

Object.defineProperty(Sprite.prototype,"motionBlurMax",{
  set:function(v){
    this.addToRenderQueue("updateFilters")
    this._motionBlurMax = v;
  },
  get:function(){
    return this._motionBlurMax;
  }
})

Object.defineProperty(Sprite.prototype,"blur",{
  set:function(v){
    this._blur = v;
    this.addToRenderQueue("updateFilters");
  },
  get:function(){
    return this._blur;
  }
})

Object.defineProperty(Sprite.prototype,"brightness",{
  set:function(v){
    this._brightness = v;
    this.addToRenderQueue("updateFilters");
  },
  get:function(){
    return this._brightness;
  }
})

Object.defineProperty(Sprite.prototype,"contrast",{
  set:function(v){
    this._contrast = v;
    this.addToRenderQueue("updateFilters");
  },
  get:function(){
    return this._contrast;
  }
})

Object.defineProperty(Sprite.prototype,"grayscale",{
  set:function(v){
    this._grayscale = v;
    this.addToRenderQueue("updateFilters");
  },
  get:function(){
    return this._grayscale;
  }
})

Object.defineProperty(Sprite.prototype,"sepia",{
  set:function(v){
    this._grayscale = v;
    this.addToRenderQueue("updateFilters");
  },
  get:function(){
    return this._grayscale;
  }
})

Object.defineProperty(Sprite.prototype,"position",{
  set:function(v){
    this._position = v;
    this.addToRenderQueue("updatePositionType");
  },
  get:function(){
    return this._position;
  }
})

Object.defineProperty(Sprite.prototype,"perspective",{
  set:function(v){
    console.log("setting perspective")
    this._perspective = v;
    this.addToRenderQueue("updatePerspective");
  },
  get:function(){
    return this._perspective;
  }
})

Object.defineProperty(Sprite.prototype,"skewX",{
  set:function(v){
    this._skewX = v;
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._skewX;
  }
})

Object.defineProperty(Sprite.prototype,"skewY",{
  set:function(v){
    this._skewY = v;
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._skewY;
  }
})

Object.defineProperty(Sprite.prototype,"translateX",{
  set:function(v){

    this._translateX = v;
    //this._regSpeed("_translateX");
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._translateX;
  }
})

Object.defineProperty(Sprite.prototype,"translateY",{
  set:function(v){

    this._translateY = v;
    //this._regSpeed("_translateY");
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._translateY;
  }
})

Object.defineProperty(Sprite.prototype,"scaleX",{
  set:function(v){
    this._scaleX = v;
    //this.updateTransform();
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._scaleX;
  }
})

Object.defineProperty(Sprite.prototype,"scaleY",{
  set:function(v){
    this._scaleY = v;
    //this.updateTransform();
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._scaleY;
  }
})

Object.defineProperty(Sprite.prototype,"width",{
  set:function(v){
    this._width = v != null ? v : this._width;
    //this.updateWidth();
    if(this.isImage === true){
      this.updateWidth();
    }else{
      this.addToRenderQueue("updateWidth");
    }
  },
  get:function(){
    if(this.isImage===true){
      return this.dom.offsetWidth || this._width; // in case dom element hasnt been added to stage
    }else{
      return this._width;
    }

  }
})

Object.defineProperty(Sprite.prototype,"height",{
  set:function(v){
    this._height = v != null ? v : this._height;
    //this.updateHeight();
    if(this.isImage === true){
      this.updateHeight();
    }else{
      this.addToRenderQueue("updateHeight");
    }


  },
  get:function(){
    if(this.isImage === true){
      return this.dom.offsetHeight || this._height;
    }else{
      return this._height;
    }
  }
})

Object.defineProperty(Sprite.prototype,"flipX",{
  set:function(v){
    this._flipX = v;
    this.updatePosition();
  },
  get:function(){
    return this._flipX;
  }
})

Object.defineProperty(Sprite.prototype,"flipY",{
  set:function(v){
    this._flipY = v;
    this.updatePosition();
  },
  get:function(){
    return this._flipY;
  }
})

Object.defineProperty(Sprite.prototype,"rotation",{
  set:function(v){
    this._rotationZ = v;
    //this._regSpeed("_rotationZ");
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._rotationZ;
  }
})

Object.defineProperty(Sprite.prototype,"rotationX",{
  set:function(v){
    this._rotationX = v;
    //this._regSpeed("_rotationX");
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._rotationX;
  }
})

Object.defineProperty(Sprite.prototype,"rotationY",{
  set:function(v){

    this._rotationY = v;
    //this._regSpeed("_rotationY");
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._rotationY;
  }
})

Object.defineProperty(Sprite.prototype,"rotationZ",{
  set:function(v){
    this._rotationZ = v;

    //this._regSpeed("_rotationZ");
    this.addToRenderQueue("updateTransform");
  },
  get:function(){
    return this._rotationZ;
  }
})

Object.defineProperty(Sprite.prototype,"origoX",{
  set:function(v){
    this._origoX = v;
    this.addToRenderQueue("updateOrigin");
  },
  get:function(){
    return this._origoX;
  }
})

Object.defineProperty(Sprite.prototype,"origoY",{
  set:function(v){
    this._origoY = v;
    this.addToRenderQueue("updateOrigin");
  },
  get:function(){
    return this._origoY;
  }
})

Object.defineProperty(Sprite.prototype,"alpha",{
  set:function(v){
    this._alpha = v;
    //this.updateAlpha();
    this.addToRenderQueue("updateAlpha");
  //  console.log("setting alpha",v)
  },
  get:function(){
    return this._alpha;
  }
})

Object.defineProperty(Sprite.prototype,"x",{
  set:function(v){
    this._x = v;
    //this._regSpeed("_x");
    this.addToRenderQueue("updatePosition");
  },
  get:function(){
    return this._x;
  }
})

Object.defineProperty(Sprite.prototype,"y",{
  set:function(v){
    this._y = v;
    //this._regSpeed("_y");
    this.addToRenderQueue("updatePosition");
  },
  get:function(){
    return this._y;
  }
})

Sprite.prototype.copy = function(sprite){


  this._alpha = sprite._alpha;
  this._origoX = sprite._origoX;
  this._origoY = sprite._origoY;
  this._x = sprite._x;
  this._y = sprite._y;
  this._rotationZ = sprite._rotationZ;
  this._rotationY = sprite._rotationY;

  this._scaleX = sprite._scaleX;
  this._scaleX = sprite._scaleX;

  this._width = sprite._width;
  this._height = sprite._height;
  this.updateAll();
}

Sprite.prototype.crop = function(crop){

  crop = crop == null ? false : crop;
  if(window["BannerHelper"]){

    var dimensions = BannerHelper.getInstance().getDimensions();
    var x = -this.x;
    var y = this.y;
    var width = dimensions.width;
    var height = dimensions.height;

    // top , right , bottom , left //

    //var pos = [y,x+width,y+height,x];
    var pos = {
      top:y,
      right:x+width,
      bottom:y+height,
      left:x,
      width:dimensions.width,
      height:dimensions.height
    };

    var css = "rect("+pos.top+"px,"+pos.right+"px,"+pos.bottom+"px,"+pos.left+"px)";

    if(crop){
      this.dom.style.clip = css;
      this._offsetX = this.x;
      this._offsetY = this.y;
      this.x = 0;
      this.y = 0;
    }



    var cropData =
    {

      src:this.dom.getAttribute("src"),
      resize:{width:this.dom.width,
      height:this.dom.height},
      crop: crop === true ? pos : null
    };
    _img_crop.push(cropData);
    // post
  }else{


    if(crop){
      this.resetDimensions(true);
      this.x = 0;
      this.y = 0;
    }


  }
  this.resetDimensions(false);

}

Sprite.prototype.resetDimensions = function(run){

  if(run){
    this.dom.style.width = "auto";
    this.dom.style.height = "auto";
    this.width = this.width;
    this.height = this.height;
  }

}

Sprite.prototype.clone = function(){
  var sprite;
  if(this.dom){
    sprite = new Sprite(this.dom.cloneNode());
    sprite.copy(this);
  }
  else{
    sprite = new Sprite();
    sprite.copy(this);
  }
  return sprite;

}

Sprite.prototype.appendChild = function(child){
  console.log("append Child",child,child.dom)
  this.dom.appendChild(child.dom || child);
}

Sprite.prototype.appendTo = function(parent){
  //console.log("append to " , parent)
  parent = document.getElementById(parent) || parent;
  parent.appendChild(this.dom);
}

Sprite.prototype._regSpeed = function(prop){
  // set first value //
  this.getSpeed(prop);
  this._speed[prop].speed = Math.abs(this[prop] - this._speed[prop].value);
  this._speed[prop].value = this[prop];

}

Sprite.prototype.getSpeed = function(prop){
  this._speed[prop] = this._speed[prop] == null ? {value:this[prop],speed:0} : this._speed[prop];
  return this._speed[prop].speed;
}

Sprite.prototype.destroy = function(){

  for(var i = 0;i<Sprite.sprites.length;i++){
    if(Sprite.sprites[i] == this){
      Sprite.sprites.splice(i,1);
    }
  }

}

Sprite.prototype.addToRenderQueue = function(id){
  this.dirty=1;
  this.renderQueue[id] = 1;
}

Sprite.prototype.setOrigin = function(x,y){
  this._origoX = x;
  this._origoY = y;
  this.updateOrigin();
}

Sprite.prototype.moveTo = function(x,y){
  this._x = x;
  this._y = y;
  this.updatePosition();
}

Sprite.prototype.resize = function(w,h){

  this.width = w;
  this.height = h;
  //this.updateWidth();
  //this.updateHeight();
}

Sprite.prototype.getOriginalState = function(){

  var obj = this.state == null ? this : this.state;
  //console.log("obj",obj)
  return {
    rotation : obj._rotation,
    x: obj._x,
    y: obj._y,
    alpha : obj._alpha,
    width: obj._width,
    height: obj._height
  }
}

Sprite.prototype.save = function(){
  var params = ["_x","_y","_rotationZ","_rotationY","_alpha","_origoX","_origoY","_width","_height"];
  this.state = {};
  for(var i = 0;i<params.length;i++){
    var param = params[i];
    this.state[param] = this[param];
  }
}

Sprite.prototype.restore = function(){
  if(this.state){
    for(var a in this.state){
      this[a] = this.state[a];
    }
  }
}

Sprite.prototype.debug = function(){
  window.onclick = this.printMousePosition.bind(this);
}

Sprite.prototype.printMousePosition = function(e){
  console.log((e.clientX - this.x)/this.width,(e.clientY-this.y)/this.height)
}

Sprite.prototype.attach = function(vector){

  var globalToLocal = {
    x: vector.x - this.x,
    y: vector.y - this.y
  }

  this.attachements.push({obj:vector,pos:globalToLocal});
  if(!this.attachementUpdateStarted){
    this.attachementUpdateStarted = true;
    //this.updateAttachements();
  }

}

Sprite.prototype.updateAttachements = function(){

  for(var i = 0 ; i<this.attachements.length;i++){
    var a =  this.attachements[i];
    //var newPoint = {x:a.pos.x ,y:a.pos.y};
    var w = this.origoX * this.width;
    var h = this.origoY * this.height;

    var pos = {x:a.pos.x - w,y:a.pos.y-h};
    rotateVector(pos,this._rotationZ);

    a.obj.x = this.x +  pos.x + w;
    a.obj.y = this.y +  pos.y + h;

  }

}

Sprite.prototype.getGlobalBounds = function(){

  var el = this.dom;
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return {x:left,y:top,width:width,height:height};

}

Sprite.prototype.drawImageOnCanvas = function(ctx){

  /*
    If drawing svg on canvas, some older versions of firefox require width & height attributes in the root svg-document ( <svg> )
  */
  var canvas = ctx.canvas;
  var canvasX = Number(getStyle(canvas,"left").split("px")[0]);
  var canvasY = Number(getStyle(canvas,"top").split("px")[0]);
  ctx.save();

  //console.log("draw image",canvasX)
  ctx.translate(this.x-canvasX,this.y-canvasY);
  ctx.rotate(this.rotationZ);
  var pos = {
    x : - this.origoX * this.width ,
    y  : - this.origoY * this.height
  }

  ctx.drawImage(this.dom,pos.x,pos.y,this.width,this.height);

  ctx.restore();
}

Sprite.prototype.fitInsideParent = function(paddingX,paddingY,offsetX,offsetY){

  offsetX = offsetX || 0;
  offsetY = offsetY || 0;
  this.scaleX=1;
  this.scaleY=1;
  this._width = this.dom.offsetWidth;
  this._height = this.dom.offsetHeight;
  var parent = this.dom.parentElement;
  var parentWidth = parent.offsetWidth;
  var parentHeight = parent.clientHeight;
  //var width = this.dom.clientWidth;
  var width = parentWidth * paddingX;
  var scale = Math.min(1,width/this.width);
  var height = this.height*scale;
  //console.log("height",this.width,this.height);
  if(height>paddingY*parentHeight){
    height = paddingY*parentHeight;
    scale = height/this.height;
    width = this.width * scale;
    //console.log("height bigger")
  }
  this.scaleX = scale;
  this.scaleY = scale;
  this.x = parentWidth*0.5 - this.width*this.scaleX*(0.5-offsetX);
  this.y = parentHeight*0.5 - this.height*this.scaleY*(0.5-offsetY);
  //this.x = parentWidth*0.5;


  //console.log("fit inside",this.dom,parentWidth,parentHeight,this.width*this.scaleX,this.height*this.scaleY);


}



Sprite.prototype.updateAll = function(){
  this.updateOrigin();
  this.updateAlpha();
  this.updatePosition();
  this.updateTransform();
  this.updateWidth();
  this.updateHeight();
  this.updateFilters();
}

Sprite.prototype["updateFilters"] = function(){
  var filters = "";

  /*
    calculate blur if motionBlur > 0
  */
  if(this._motionBlur>0){

    var props = ["x","y","translateX","translateY","rotationX","rotationY","rotationZ"];
    var strength = [1,1,1,1,10,10,10];
    var speed = 0;
    for(var i = 0;i<props.length;i++){
      this._regSpeed(props[i]);
      speed+= this.getSpeed(props[i]) * strength[i];
    }
    //console.log("blur",speed)
    this._blur = Math.min(speed * this._motionBlur,this._motionBlurMax);
  }


  if(this._blur!=0)
    filters = "blur(" +  this._blur + "px) ";

  if(this._brightness!=1)
    filters = "brightness(" +  this._brightness + ") ";

  if(this._contrast!=0)
    filters = "contrast(" +  this._contrast + ") ";

  if(this._grayscale!=0)
    filters = "grayscale(" +  this._grayscale + ") ";

  if(this._sepia!=0)
    filters = "grayscale(" +  this._sepia + ") ";


  this.dom.style["-webkit-filter"] = filters;
  this.dom.style["filter"] = filters;
}

Sprite.prototype["updateTransform"] = function(){

  var transform = "";



  // rotation //
  if(this._rotationX!=0)
    transform+= "rotateX(" + this.rotationX * (180/Math.PI)  + "deg) ";
  if(this._rotationY!=0)
    transform+= "rotateY(" + this.rotationY * (180/Math.PI)  + "deg) ";
  if(this._rotationZ!=0)
    transform+= "rotateZ(" + this.rotationZ * (180/Math.PI)  + "deg) ";

  // scale //
  if(this._scaleX != 1)
    transform += "scaleX(" + this._scaleX + ") ";
  if(this._scaleY != 1)
    transform += "scaleY(" + this._scaleY + ") ";

  // skew
  if(this._skewX != 0)
    transform += "skewX(" + this._skewX + ") ";
  if(this._skewY != 0)
    transform += "skewY(" + this._skewY + ") ";

  // translate
  if(this._translateX != 0 || this._translateY != 0)
    transform += "translate(" + this._translateX + "px," + this._translateY +"px) ";



  //console.log("update transform",transform)
  //transform += "translateZ(0px) ";
  this.dom.style["-ms-transform"] = transform;
  this.dom.style["-webkit-transform"] = transform;
  this.dom.style["-moz-transform"] = transform;
  this.dom.style.transform = transform;

  this.updateAttachements()

}

Sprite.prototype.updatePerspective = function(){

  var transform="";
  if(this._perspective != 0)
    transform += this._perspective+"px";

  console.log("update perspective")
  this.dom.style["-webkit-perspective"] = transform;
  this.dom.style["perspective"] = transform;

}

Sprite.prototype.updateOrigin = function(){

  //var origin = this.origoX*100+"% " + this.origoY*100+"%";
  //this.dom.style.visibility="hidden";
  // firefox wont handle relative values until v41, therefor we use pixel values
  var origin = "";
  //if(this.scaleX != 1 || this.scaleX != 1 || this.rotationX != 0 || this.rotationZ != 0 || this.rotationY != 0){
    origin = Math.round(this.origoX * this.width)+"px " + Math.round(this.origoY * this.height) +"px";
  //}

  this.dom.style.transformOrigin = origin;
  this.dom.style["-ms-transform-origin"] = origin;
  this.dom.style["-webkit-transform-origin"] = origin;
  this.dom.style["-moz-transform-origin"] = origin;


  this.updatePosition();
}

Sprite.prototype["updateWidth"] = function(){

  if(this.dom instanceof HTMLImageElement || this.dom instanceof HTMLCanvasElement)
  {
    this.dom.width = this._width;
  }
  else{
    if(this.dom)
    this.dom.style.width = this._width+"px";
  }
//console.log("update width canvas")

}

Sprite.prototype["updateHeight"] = function(){

  if(this.dom instanceof HTMLImageElement || this.dom instanceof HTMLCanvasElement)
  {
    this.dom.height = this._height;
  }
  else{
    if(this.dom)
      this.dom.style.height = this._height+"px";
  }
  //console.log("update height canvas")
}

Sprite.prototype["updateAlpha"] = function(){
  this.dom.style.opacity = this._alpha;
}

Sprite.prototype["updatePositionType"] = function(){
  this.dom.style.position = this._position;
}

Sprite.prototype["updatePosition"] = function(){

  var nameX = this.flipX == false ? "left" : "right";
  var nameY = this.flipY == false ? "top" : "bottom";
  var eraseNameX = this.flipX == true ? "left" : "right";
  var eraseNameY = this.flipY == true ? "top" : "bottom";

  this.updateAttachements();
  //this.dom.style[nameX] = this._x - this.origoX * this.width +  "px";
  //this.dom.style[nameY] = this._y - this.origoY * this.height + "px";
  //this.dom.style.position = this._position != null ? this._position : ;
  if(this.dom){
    this.dom.style[nameX] = this._x + this._offsetX +  "px";
    this.dom.style[nameY] = this._y + this._offsetY + "px";
    this.dom.style[eraseNameX] = null;
    this.dom.style[eraseNameY] = null;
  }

}

Sprite.prototype.render = function(){

  // events
  this.emit("render");

  // add filter updates if motionBlur is activated //
  if(this._motionBlur>0)
    this.addToRenderQueue("updateFilters");

  for(var a in this.renderQueue){
    //console.log("render from queue",a)
    this[a]();
  }
  this.dirty=0;
  this.renderQueue = {};

  // rendere canvas //
  if(this.context){
    this.renderCanvas(this.context);
  }

  //console.log("render",this.dom)




}

// renders all dom sprites //

Sprite.render = function(){

  //requestAnimationFrame(Sprite.render)
  var counter = 0;
  Sprite.started=true;
  for(var i = 0;i<Sprite.sprites.length;i++){
    var sprite = Sprite.sprites[i];
    if(((sprite.dirty==1 || sprite._motionBlur>0) && sprite.dom) || sprite.forceRender){
      sprite.render();
      counter++;
    }

  }

}
