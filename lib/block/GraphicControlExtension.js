function GraphicControlExtension(file,parser){

  if(file){
    this.file = file;
    this.byteSize = file.readUnsigned(1);
    this.packedBits = file.readByteAsBits();

    this.delayTime = file.readUnsigned(2)*10;
    this.transparentColorIndex = file.readUnsigned(1);

  }else{
    this.byteSize = 4;
    this.packedBits = [0,0,0,0,0,0,0,0];
    this.delayTime = 32;
    this.transparentColorIndex = 0;
  }
  this.reserved = this.packedBits.slice(0,3);
  this.disposal = this.packedBits.slice(3,6);
  this.userInput = this.packedBits.slice(6,7);
  this.transparentColorFlag = this.packedBits.slice(7,8);



  console.log(this,"term",this.file.read(1,true)[0]);

}

GraphicControlExtension.prototype.encode = function(){
  // terminator //
  this.file = new FileReader();
  var data = new Uint8Array(7);
  //data[0] = 33; // terminator
  data[0] = 249 // graphic control extension id
  data[1] = this.file.unsignedToBytes(this.byteSize,1);  // bytesize


  data[2] = FileReader.binToInt(this.packedBits);         // packed bits

  var delay = this.file.unsignedToBytes(this.delayTime/10,2);
  data[3] = delay[0];
  data[4] = delay[1];
  data[5] = this.file.unsignedToBytes(this.transparentColorIndex,1);     // transparent color index
  data[6] = 0         // terminator
  //console.log("encode - decode graphics", new GraphicControlExtension(new FileReader(data.slice(2,data.byteLength))) )

  return data;
}
