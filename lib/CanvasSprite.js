/**
* Simple canvas sprite that can be rotated,scaled and positioned.
* @class
* @extends EventEmitter
*
  * @property {number} x position sprite horizontal
  * @property {number} y position sprite vertical
  * @property {number} scaleX scales sprite horizontal
  * @property {number} scaleY scales sprite vertical
  * @property {number} rotation sets sprite rotation
  * @property {Array} children children list of sprite

*/

function CanvasSprite(){

  EventEmitter.call(this);
  this.renderQueue = [];
  this.x = 0;
  this.y = 0;
  this.scaleX = 1;
  this.scaleY = 1;
  this.rotation = 0;
  this.children = [];
  this._drawQueue = [];
  this.origoX = 0;
  this.origoY = 0;
  this._cacheAsBitmap = false;
  this.useTransformations = true;
}

CanvasSprite.prototype = Object.create(EventEmitter.prototype);
CanvasSprite.prototype.constructor = CanvasSprite;

/**
* @property {boolean} cacheAsBitmap Caches all its drawings as a bitmap, for faster rendering
*/

Object.defineProperty(CanvasSprite.prototype,"cacheAsBitmap",{
  set:function(v){
    this._cacheAsBitmap = v;
    this._updateCache();
  },
  get:function(){
    return this._cacheAsBitmap;
  }
})

/**
* Simple collision detection
* @function cacheAsBitmap
* @return {object} Collision data object
*/

CanvasSprite.prototype.collide = function(sprite){
  //console.log("collide")
  if(this.x + this.width * this.scaleX> sprite.x && this.x< sprite.x+sprite.width * sprite.scaleX &&
    this.y + this.height * this.scaleY > sprite.y && this.y< sprite.y + sprite.height * sprite.scaleY){
      //console.log(this.width,sprite.width)
      return {collided:true}

  }else{
    return {collided:false}
  }
}

/**
* Add a drawing function to the drawing queue. Will be executed on each frame.
* @function
*/

CanvasSprite.prototype.draw = function(func){
  this.dirty = 1;
  this._drawQueue.push(func);
}

/**
* Clear all drawing calls from drawing queue.
* @function
*/

CanvasSprite.prototype.clear = function(func){
  this.dirty=1;
  delete this._drawQueue;
  this._drawQueue = [];
}

/**
* Calls all drawing functions.
* @function
*/

CanvasSprite.prototype.drawQueueList = function(context){
  for(var i = 0;i<this._drawQueue.length;i++){
    this._drawQueue[i](context,this);
  }

}

/**
* Render canvas
* @function
*/

CanvasSprite.prototype.renderCanvas = function(context){


    //console.log("context is null",context)

  var ctx = context;
  //console.log("render canvas" ,this.context == context)

  if(ctx == this.context){
    // if this is the stage //
    //console.log("clearrect",this.width,this.height)
    this.canvas.height = ctx.height = this.height;
    this.canvas.width = ctx.width = this.width;
    //context.clearRect(0,0,this._width,this._height);
    //context.setTransform(1,0,0,1,0,0);
  }

  if(this.useTransformations){


    //console.log("transform")
    ctx.save();
    ctx.translate(~~this.x,~~this.y);
    ctx.scale(this.scaleX,this.scaleY);
    ctx.rotate(this.rotation);
    ctx.translate(~~(-this.width * this.origoX), ~~(-this.height*this.origoY));
  }

    this.drawQueueList(ctx);

    var children = this.children;

    for(var i in this.children){

      var child = children[i];
      child.renderCanvas.call(child,context);

    }

    if(this.useTransformations){
      ctx.restore();
    }

}

/**
* Add child to canvas sprite
* @function
*/

CanvasSprite.prototype.addChild = function(sprite){


  if(!sprite.dom){

    //this.removeChild(sprite);
    this.children.push(sprite);
    sprite.parent = this;

  }else{

    if(this.dom){
      this.dom.appendChild(sprite.dom);
      this.parent = this;
    }

  }

}

/**
* Remove child to canvas sprite
* @function
*/

CanvasSprite.prototype.removeChild = function(sprite){
  //console.log("try remove child",sprite)
  var i = this.children.length-1;
  while(i>-1){
  //for(var i = this.children.length-1;i>-1;i--){
    if(this.children[i] == sprite){
      //console.log("remove child")
      sprite.parent = null;
      delete sprite.parent;
      this.children.splice(i,1);
    }
    i--;
  }

  if(this.dom && sprite.dom){

    if(this.dom.parentElement = this.dom){
      //console.log("removing child")
      this.dom.removeChild(sprite.dom);
      //this.dom.removeChild(sprite.dom);
    }

  }

}
