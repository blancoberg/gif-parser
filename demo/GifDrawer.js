function GIFDrawer(width,height,bgColor,lineColor){
  this.dom = document.createElement("canvas");
  this.dom.width = width;
  this.dom.height = height;
  this.context = this.dom.getContext("2d");
  this.pen = {x:0,y:0}
  window.onmousemove = this.mouseMove.bind(this);
  window.onmousedown = this.mouseDown.bind(this);
  window.onmouseup = this.mouseUp.bind(this);

  this.colors = [FileReader.unsignedToBytes(bgColor,3),FileReader.unsignedToBytes(lineColor,3)];
  this.context.fillStyle = "rgba(" + this.colors[0][2] + "," + this.colors[0][1] + "," + this.colors[0][0] + ",1)";


  //console.log("#" + this.colors[0]);
  this.context.fillRect(0,0,width,height);
  this.context.lineWidth = 4;
  this.context.strokeStyle = "rgba(" + this.colors[1][2] + "," + this.colors[1][1] + "," + this.colors[1][0] + ",1)";


  this.parser = new GifParser(width,height);
  this.parser.setGlobalColorTable([bgColor,lineColor]);
  this.frames = 250;
  this.counter = 0;
}

GIFDrawer.prototype.mouseMove = function(e){
  if(this.active && this.counter<this.frames){
    this.pen.x = e.clientX - this.dom.offsetLeft;
    this.pen.y = e.clientY - this.dom.offsetTop;
    this.context.lineTo(this.pen.x,this.pen.y)
    this.context.stroke();
    console.log("draw",this.pen.x,this.pen.y)
    this.parser.addFrame(this.dom);
    this.counter++;
  }
}

GIFDrawer.prototype.mouseDown = function(e){

  this.pen.x = e.clientX - this.dom.offsetLeft;
  this.pen.y = e.clientY - this.dom.offsetTop;

  this.context.moveTo(this.pen.x,this.pen.y)

  this.active = true;
}

GIFDrawer.prototype.mouseUp = function(e){

  if(this.counter==this.frames){
    this.parser.encode({crop:true});
    this.counter++;
  }


  this.active = false;
}
