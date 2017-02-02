function GIFDrawer(width,height,bgColor,lineColor){
  this.width = width;
  this.height = height;
  this.dom = document.createElement("canvas");
  this.dom.width = width;
  this.dom.height = height;
  this.context = this.dom.getContext("2d");
  this.pen = {x:0,y:0};
  this.penLast = {x:this.pen.x,y:this.pen.y}
  this.penIcon = new Sprite("pencil");
  this.penIcon.dom.style.position="absolute";
  this.penIcon.width = 45;
  this.penIcon.height = 45;
  this.penIcon.setOrigin(0,1)
  this.penPos = {x:0,y:0}
  window.onmousemove = this.mouseMove.bind(this);
  window.onmousedown = this.mouseDown.bind(this);
  window.onmouseup = this.mouseUp.bind(this);

  this.canvasHolder = document.getElementById("canvasHolder");
  this.loop = true;

  this.colors = [FileReader.unsignedToBytes(bgColor,3),FileReader.unsignedToBytes(lineColor,3)];
  this.context.fillStyle = "rgba(" + this.colors[0][2] + "," + this.colors[0][1] + "," + this.colors[0][0] + ",1)";


  //console.log("#" + this.colors[0]);
  this.context.fillRect(0,0,width,height);
  this.context.lineWidth = 3;
  this.context.lineCap = "round"
  this.context.strokeStyle = "rgba(" + this.colors[1][2] + "," + this.colors[1][1] + "," + this.colors[1][0] + ",1)";


  this.parser = new GifParser(width,height);
  this.parser.setGlobalColorTable([bgColor,lineColor]);
  //this.frames = 250;
  this.counter = 0;
  this.parser.addFrame(this.dom);

  this.updatePen();
}

GIFDrawer.prototype.updatePen = function(){
  window.requestAnimationFrame(this.updatePen.bind(this))

  var speed = {
    x: this.penPos.x - this.penLast.x,
    y : this.penPos.y - this.penLast.y
  }
  //console.log("speed",speed)
  var targetRot = 1.5-Math.max(-0.2,Math.min(speed.y/40 - speed.x/40,0.2));
  this.penIcon.rotation+=(targetRot-this.penIcon.rotation)/3;
  this.penLast = {x:this.penPos.x,y:this.penPos.y}
}

GIFDrawer.prototype.save = function(){
  if(!this.encoded){

    var blob = this.parser.encode({loop:this.loop});
    console.log("save")
    var img = new Image();
    var url = URL.createObjectURL(blob);
    console.log("url",url)


    img.src = url;

    document.getElementById("canvasHolder").appendChild(img);

    //document.getElementById("test").setAttribute("src",url);
    this.dom.style.display="none";
    this.encoded = img;


    var a = document.createElement("a");
    var url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "drawing.gif";
    a.click();
    //window.URL.revokeObjectURL(url);


  }

}

GIFDrawer.prototype.toggleLoop = function(dom){

  this.loop = this.loop == false;
  console.log("toggle loop",dom,this.loop)
  dom.innerHTML = "Loop : " + (this.loop ? "Yes" : "No")
}

GIFDrawer.prototype.clear = function(){

  if(this.encoded){
    document.getElementById("canvasHolder").removeChild(this.encoded);
    this.dom.style.display="inline-block";
    this.encoded = null;
  }
  this.parser.clear();
  this.context.beginPath();
  this.context.filleStyle = "rgba(" + this.colors[0][2] + "," + this.colors[0][1] + "," + this.colors[0][0] + ",1)"
  this.context.fillRect(0,0,this.width,this.height);
  this.context.closePath();
  this.parser.addFrame(this.dom);
}

GIFDrawer.prototype.getMousePosition = function(e){
  return {
    x: e.clientX - this.canvasHolder.offsetLeft ,
    y: e.clientY - this.canvasHolder.offsetTop + window.pageYOffset
  }
}

GIFDrawer.prototype.mouseMove = function(e){

//  console.log(window.pageYOffset)
  var m = this.getMousePosition(e);
  if(this.active && this.complete != true){

    //console.log("move")

    this.redrawArea.x1 = m.x < this.redrawArea.x1 ? m.x : this.redrawArea.x1;
    this.redrawArea.y1 = m.y < this.redrawArea.y1 ? m.y : this.redrawArea.y1;

    this.redrawArea.x2 = m.x > this.redrawArea.x2 ? m.x : this.redrawArea.x2;
    this.redrawArea.y2 = m.y > this.redrawArea.y2 ? m.y : this.redrawArea.y2;

    this.context.lineTo(m.x,m.y)
    this.context.stroke();

    var distance = Math.sqrt(Math.pow(m.x - this.pen.x,2) + Math.pow(m.y - this.pen.y,2));
    if(distance > 30){

      var padding = 2;
      this.redrawArea.x1-=padding;this.redrawArea.x2+=padding;
      this.redrawArea.y1-=padding;this.redrawArea.y2+=padding;
      //console.log("dist",distance)
      var oldX = this.pen.x;
      var oldY = this.pen.y
      this.pen.x = m.x;
      this.pen.y = m.y;



      //this.context.fillStyle="#ff0000";
      var r = this.redrawArea;
      //this.context.fillRect(r.x1,r.y1,r.x2 - r.x1,r.y2- r.y1)
      //console.log("draw",r.x1,r.y1,r.x2 - r.x1,r.y2- r.y1);

      var x = Math.min(oldX,this.pen.x) -2;
      var y = Math.min(oldY,this.pen.y)-2;
      var width = Math.abs(oldX-this.pen.x)+4;
      var height = Math.abs(oldY-this.pen.y)+4;
      //console.log(x,y,width,height);
      //var img = this.context.getImageData(x,y,width,height);
      var img = this.context.getImageData(r.x1,r.y1,r.x2-r.x1,r.y2-r.y1);
      //document.getElementsByTagName("body")[0].appendChild(img.toDataURL())

      // reset redraw

      //this.context.putImageData(img,0,0);
      //parser.addFrame(img,{left:x,top:y,width:width,height:height})
      //this.parser.addFrame(img,{left:x,top:y,width:width,height:height})
      this.parser.addFrame(img,{left:r.x1,top:r.y1,width:r.x2-r.x1,height:r.y2-r.y1})
      //console.log("draw",r.x1,r.y1,r.x2-r.x1,r.y2-r.y1)
      this.redrawArea = {x1:m.x,y1:m.y,x2:m.x,y2:m.y};
      this.counter++;


    }

  }


  var canvasHolder = document.getElementById("canvasHolder");
  var x = m.x
  var y = m.y;
  if(!this.encoded){
    if(x>0 && x < this.width &&
       y >0 && y < this.height){
         this.penIcon.dom.style.display="block";
         this.dom.style.cursor="none";
         this.penPos.x = x;
         this.penPos.y = y;
         this.penIcon.x=x;
         this.penIcon.y = y - 40;
       }
       else{
         this.penIcon.dom.style.display="none ";
         this.dom.style.cursor="pointer";
       }
  }else{
    this.encoded.style.cursor="not-allowed";
  }

}

GIFDrawer.prototype.mouseDown = function(e){

  var m = this.getMousePosition(e);
  var x = m.x;
  var y = m.y;

  if(x>0 && y>0 && x<this.width && y < this.height){
    console.log("mouse down")
    this.pen.x = x;
    this.pen.y = y;

    this.context.moveTo(this.pen.x,this.pen.y)


    this.redrawArea = {x1:x,y1:y,x2:x,y2:y};

    this.active = true;
  }

}

GIFDrawer.prototype.mouseUp = function(e){




  this.active = false;
}
