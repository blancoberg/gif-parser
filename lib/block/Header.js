function Header(file,parser){

  this.format = file.readString(3);
  this.version = file.readString(3);

  this.width = file.readUnsigned(2);
  this.height = file.readUnsigned(2);

  // packed bits //
  this.packedBits = file.readByteAsBits();
  this.GLOBAL_COLOR_TABLE_FLAG = this.packedBits[0] == "1" ? true : false;
  this.COLOR_RESOLUTION = this.packedBits.slice(1,4);
  this.SORT_FLAG = this.packedBits[4] == "1" ? true : false; // decreasing if true
  this.GLOBAL_COLOR_TABLE_SIZE = Math.pow(2,file.binToInt(this.packedBits.slice(5,7))+1);

  this.BACKGROUND_COLOR_INDEX = file.readUnsigned(1);
  this.PIXEL_ASPECT_RATIO = file.readUnsigned(1);
  console.log(this);
}
