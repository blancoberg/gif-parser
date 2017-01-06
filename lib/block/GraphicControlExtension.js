function GraphicControlExtension(file,parser){


  this.byteSize = file.readUnsigned(1);
  this.packedBits = file.readByteAsBits();
  this.delayTime = file.readUnsigned(2);
  this.transparentColorIndex = file.readUnsigned(1);
  
  console.log(this);

}
