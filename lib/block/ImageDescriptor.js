function ImageDescriptor(file,parser){

  // position and dimensions

  this.left = file.readUnsigned(2);
  this.top = file.readUnsigned(2);

  this.width = file.readUnsigned(2);
  this.height = file.readUnsigned(2);

  this.packedBits = file.readByteAsBits();
  this.hasLocalColorTable = this.packedBits[0] == "1" ? true : false;
  this.interlaced = this.packedBits[1] == "1" ? true : false;
  this.sortFlag = this.packedBits[2] == "1" ? true : false;
  this.reserved = this.packedBits.slice(3,4);
  this.colorTableSize = Math.pow(2,file.binToInt(this.packedBits.slice(5,8))+1);

  if(this.hasLocalColorTable){
    this.colorTable = new ColorTable(file,parser,this.colorTableSize);
  }

  this.minimumCodeSize = file.readUnsigned(1);
  var blockSize = file.readUnsigned(1);

  this.blocks = [];
  while(blockSize != 0){
    
    this.blocks.push(file.read(blockSize))
    blockSize = file.readUnsigned(1);

  }
  console.log(this);
}
