function ImageDescriptor(file,parser){

  // position and dimensions
  //console.log("image descriptor")
  this.file = file;
  this.left = file.readUnsigned(2);
  this.top = file.readUnsigned(2);

  this.width = file.readUnsigned(2);
  this.height = file.readUnsigned(2);
  this.pixelCount = this.width * this.height;

  this.packedBits = file.readByteAsBits();
  this.hasLocalColorTable = this.packedBits[0] == "1" ? true : false;
  this.interlaced = this.packedBits[1] == "1" ? true : false;
  this.sortFlag = this.packedBits[2] == "1" ? true : false;
  this.reserved = this.packedBits.slice(3,4);
  this.colorTableSize = Math.pow(2,FileReader.binToInt(this.packedBits.slice(5,8))+1);

  if(this.hasLocalColorTable){

    this.colorTable = new ColorTable(file,parser,this.colorTableSize);
  }else{
    this.colorTable = parser.globalColorTable;
  }

  this.minimumCodeSize = file.readUnsigned(1);
  var blockSize = file.readUnsigned(1);
  this.blocks = [];
  this.totalSize = blockSize;

  while(blockSize != 0){

    this.blocks.push({blockSize:blockSize,data:file.read(blockSize)});
    blockSize = file.readUnsigned(1);
    this.totalSize +=blockSize;
  }
  //console.log(this);

  this.blockData = new  Uint8Array(this.totalSize);
  var pos = 0;
  for(var i = 0;i<this.blocks.length;i++){

    this.blockData.set(this.blocks[i].data,pos);
    pos+=this.blocks[i].blockSize;

  }
  //console.log("blocks",this.blocks)
  this.decodeImageData();


}

ImageDescriptor.prototype.encodeImageData = function(){
  console.log("encode",LZW.encode(this.data,this.minimumCodeSize))
}

ImageDescriptor.prototype.decodeImageData = function(){

  console.log(this.blockData);
  var data = LZW.decode(this.blockData,this.minimumCodeSize);
  this.data = data;
  console.log(this.data);

  var canvas = document.createElement("canvas");
  canvas.width = this.width;
  canvas.height = this.height;
  canvas.style.backgroundColor="rgba(255,0,0,1)"
  document.getElementsByTagName("body")[0].appendChild(canvas);

  var width = this.width;
  var colors = this.colorTable.colors;
  // render image to canvas //
  var context = canvas.getContext("2d");

  var imageData = context.createImageData(this.width,this.height);

  for(var i = 0 ;i<data.length;i++){

    //var pixel = context.createImageData(1,1);
    //var d = pixel.data;
    var c = colors[data[i]];
    //console.log(c);




    var x = i%width;
    var y = Math.floor(i/width);

    var index = (x + y * width) * 4;

    imageData.data[index+0] = c.r;
    imageData.data[index+1] = c.g;
    imageData.data[index+2] = c.b;
    imageData.data[index+3] = 255;


  }

  context.putImageData( imageData, 0,0);
  this.encodeImageData();


}
