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
  var tableSize = (colorTable.length >>> 0).toString(2).length;
  console.log("table size",tableSize)
  this.globalColorTable = new ColorTable();
  this.header.GLOBAL_COLOR_TABLE_SIZE = Math.max(2,tableSize);
  console.log("resolution",this.header.COLOR_RESOLUTION)
  for(var i = 0;i<colorTable.length;i++){
    this.globalColorTable.addColor(colorTable[i] || 0);
  }

}

GifParser.prototype.open = function(url,complete){
  this.complete = complete;
  this.file = new FileReader();
  this.file.open(url,this.parse.bind(this));
}

// clear all images //
GifParser.prototype.clear = function(){

}
// add image
// canvas drawable element ( img or canvas)
GifParser.prototype.addFrame = function(img){

  if(this.blocks.length==0){
    var app = new ApplicationExtension();
    this.blocks.push(app);
  }
  // new graphicControlExtension //

  var control = new GraphicControlExtension();
  var img = new ImageDescriptor(img,this,{left:0,top:0,width:this.header.width,height:this.header.height});

  this.blocks.push(control);
  this.blocks.push(img);
  // new image //
}

GifParser.prototype.encode = function(){

  var blocks = [];
  blocks.push(this.header.encode());
  //console.log(blocks)
  if(this.globalColorTable){
    blocks.push(this.globalColorTable.encode());
    blocks.push(new Uint8Array([33]));
  }


  for(var i = 0;i<this.blocks.length;i++){
    //console.log("encoding 2",this.blocks[i])
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


  console.log("encoded data",data)

  var blob = new Blob([data],{type:"image/gif"})
  var url = URL.createObjectURL(blob);
  //console.log(url);
  var img = new Image();
  img.src = url;

  document.getElementsByTagName("body")[0].appendChild(img);


  this.file = new FileReader(data);
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
    //console.log("terminator",terminator)

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
