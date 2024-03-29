function GifParser(w,h){

  this.blocks = [];

  this.blockIds = {

    "44" : ImageDescriptor,
    "249" : GraphicControlExtension,
    "255" : ApplicationExtension

  };

  // create empty header //
  this.header = new Header();
  this.header.width = w;
  this.header.height = h;


  if(this.header.GLOBAL_COLOR_TABLE_FLAG){
    this.globalColorTable = new ColorTable();


  }


}



GifParser.prototype.setGlobalColorTable = function(colorTable){

  //console.log("color size",(8 >>> 0).toString(2).length)

  var tableSize = 8;//(colorTable.length >>> 0).toString(2).length;

  this.globalColorTable = new ColorTable();
  this.header.GLOBAL_COLOR_TABLE_SIZE = tableSize
  console.log("table size",this.header.GLOBAL_COLOR_TABLE_SIZE, 1 << this.header.GLOBAL_COLOR_TABLE_SIZE)
  console.log("resolution",this.header.COLOR_RESOLUTION)
  for(var i = 0;i<((this.header.GLOBAL_COLOR_TABLE_SIZE));i++){
    this.globalColorTable.addColor(colorTable[i] || 0);
    console.log("add color",i,colorTable[i])
  }
  console.log("global colors",this.globalColorTable)
}

GifParser.prototype.open = function(url,complete){
  this.complete = complete;
  this.file = new FileReader();
  this.file.open(url,this.parse.bind(this));
}

// clear all images //
GifParser.prototype.clear = function(){
  this.blocks = [];
}
// add image
// canvas drawable element ( img or canvas)
GifParser.prototype.addFrame = function(img,options){

  options = options || {};

  if(this.blocks.length==0){
    var app = new ApplicationExtension();
    this.blocks.push(app);
  }
  // new graphicControlExtension //

  var control = new GraphicControlExtension();
  var img = new ImageDescriptor(img,this,{left:options.left || 0 ,top:options.top || 0 ,width: options.width || this.header.width,height:options.height || this.header.height,localColorTable:options.localColorTable});

  this.blocks.push(control);
  this.blocks.push(img);
  // new image //
}

GifParser.prototype.removeBlock = function(block){
  for(var i = this.blocks.length;i>-1;i--){
    var block = this.blocks[i];

    // remove both image and graphicControlExtension
    if(block instanceof ImageDescriptor){
      //console.log("remove image & controller",block,this.blocks[i-1])
      this.blocks.splice(i-1,2);
      return;
    }
  }
}

GifParser.prototype.encode = function(options){

  options = options || {};

  if(options.loop != null){


      if(options.loop == false){
        if(this.blocks[0] instanceof ApplicationExtension ){
          this.blocks.splice(0,1);
        }
      }else{
        if(this.blocks[0] instanceof ApplicationExtension == false ){
          var app = new ApplicationExtension();
          this.blocks.unshift(app);
        }
      }


  }


  if(options.crop){

    var imgs = [];
    for(var i = 0;i<this.blocks.length;i++){
      if(this.blocks[i] instanceof ImageDescriptor){
        imgs.unshift(this.blocks[i])
      }
    }

    for(i = 0;i<imgs.length-1;i++){
      var block1 = imgs[i];
      var block2 = imgs[i+1];
      if(block1 && block2){
        var t = new Date().getTime();
        var area = block1.compareTo(block2);
      //  console.log("compare ",area.left,area.top,area.width,area.height)
        //console.log("crop data",area.left,area.top,area.width,area.height)
        //console.log("crop area",area);
        console.log("area",area,area.width,area.height,area.width==0 || area.height==0)

        if(area == false || area.width==0 || area.height == 0){
          this.removeBlock(block1);
        }
        else{
          block1.cropImageData(area.left,area.top,area.width,area.height);
        }
      }
    }

  }

  var blocks = [];
  blocks.push(this.header.encode());
  //console.log(blocks)
  if(this.globalColorTable){
    blocks.push(this.globalColorTable.encode());
    blocks.push(new Uint8Array([33]));
  }


  for(var i = 0;i<this.blocks.length;i++){
    //console.log("encoding 2",this.blocks[i])
    if(blocks[i])
    blocks.push(this.blocks[i].encode());
  }

  // create a single bytearray //
  var length = 0;
  for(var i = 0;i<blocks.length;i++){
    length+=blocks[i].byteLength;
  }
  var data = new Uint8Array(length);
  var pos = 0;
  //console.log("encoded before-after",this.file.bytes);
  for(var i = 0;i<blocks.length;i++){
    //console.log("block",blocks[i])
    data.set(blocks[i],pos);pos+=blocks[i].byteLength;
  }

  //console.log("encoded",this.file.bytes,data)
  data[data.byteLength-1] = 59; // replace last with EOF

  // compare original data to encoded data //
  /*
  console.log("compare data",this.file.bytes.byteLength,data.byteLength)
  for(var i = 0;i<data.byteLength;i++){
    if(data[i] != this.file.bytes[i]){
      console.log("mismatch at ",i,data[i],this.file.bytes[i]);
      break;
    }
  }
  console.log("encoded data",data,"original data",this.file.bytes)
  */

  var blob = new Blob([data],{type:"image/gif"})
  //var url = URL.createObjectURL(blob);
  return blob;
  //console.log(url);









  //return img;


  //this.file = new FileReader(data);
  //this.parse();
}

GifParser.prototype.parse = function(){

  console.log("parse",this.file.bytes)
  var time = new Date().getTime();
  this.blocks = [];
  //console.log("parse")
  this.globalColorTable=null;
  /*
  console.log("byte length",this.file.bytes.byteLength)
  var blob = new Blob([this.file.bytes],{type:"application/octet-binary"})
  var url = URL.createObjectURL(blob);
  console.log(url);
  var img = new Image();
  img.src = url;
  document.getElementsByTagName("body")[0].appendChild(img);
  console.log("blob",blob)
  */
  //console.log("gifparse!")
  // Header,Logical Screen Descriptor
  this.header = new Header(this.file,this);
  if(this.header.GLOBAL_COLOR_TABLE_FLAG){
    this.globalColorTable = new ColorTable(this.file,this,this.header.GLOBAL_COLOR_TABLE_SIZE);
  }



  var terminator = this.file.read(1)[0]; // terminator (33)
  //console.log("terminator",terminator)
  // begin parsing of blocks

  var id = this.file.readUnsigned(1);
  while (this.blockIds[id] != null){

    this.blocks.push(new this.blockIds[id](this.file,this))

    var terminator = this.file.readUnsigned(1);


    if(terminator == 0 || terminator == 33){
      id = this.file.readUnsigned(1);
    }else{
      break;
    }

  }

  if(terminator == 0x3b){
    // parsing complete
  }

  console.log("parsing time:",new Date().getTime()-time)
  //this.encode();
  if(this.complete)
    this.complete();
}

GifParser.prototype.save = function(){

}
