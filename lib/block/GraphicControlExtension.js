function GraphicControlExtension(file,parser){

  this.label = file.readUnsigned(1);
  this.blockSize = file.readUnsigned(1);
  this.packedBits = file.readByteAsBits();
  this.delayTime = file.readUnsigned(1);
  this.transparentColorIndex = file.readUnsigned(1);

  //


  //this.packedBits = file.readByteAsBits();
  console.log(this);
  //console.log(2C)
}
