function Header(file,parser){

  if(file){

    this.file = file;
    this.parser = parser;
    this.format = file.readString(3);
    this.version = file.readString(3);

    // Logical Screen Descriptor

    this.width = file.readUnsigned(2);
    this.height = file.readUnsigned(2);

    // packed bits //

    this.packedBits = file.readByteAsBits();
    this.GLOBAL_COLOR_TABLE_FLAG = this.packedBits[0] == "1" ? true : false;
    this.COLOR_RESOLUTION = FileReader.binToInt(this.packedBits.slice(1,4))+1;
    this.SORT_FLAG = this.packedBits[4] == "1" ? true : false; // decreasing if true
    this.GLOBAL_COLOR_TABLE_SIZE = Math.pow(2,FileReader.binToInt(this.packedBits.slice(5,8))+1);

    //this.COLOR_RESOLUTION = 2;
    this.BACKGROUND_COLOR_INDEX = file.readUnsigned(1);
    this.PIXEL_ASPECT_RATIO = file.readUnsigned(1);

  }else{
    this.format = "GIF";
    this.version = "89a";
    this.GLOBAL_COLOR_TABLE_FLAG = true;
  }
}

Header.prototype.encode = function(){

  // header
  if (!this.file){
    this.file = new FileReader();
  }
  var d = new Uint8Array(6+7 + + (this.GLOBAL_COLOR_TABLE_FLAG == false ? 1: 0) );
  d.set(this.file.stringToBytes(this.format),0)
  d.set(this.file.stringToBytes(this.version),3)

  // logical screen descriptor
  var data = new Uint8Array(7 + (this.GLOBAL_COLOR_TABLE_FLAG == false ? 1: 0));
  data.set(this.file.unsignedToBytes(this.width,2),0) // width
  data.set(this.file.unsignedToBytes(this.height,2),2) // height

  // packed bits //
  var bits = [];

  bits[0] = this.GLOBAL_COLOR_TABLE_FLAG == true ? 1 : 0;
  console.log("header global color",this.GLOBAL_COLOR_TABLE_FLAG)
  var colorRes = FileReader.byteToBits(this.COLOR_RESOLUTION-1)
  bits[1] = colorRes[5];
  bits[2] = colorRes[6];
  bits[3] = colorRes[7];

  bits[4] = this.SORT_FLAG == true ? 1 : 0;

  var colorTableSize = FileReader.byteToBits(Math.log10(this.GLOBAL_COLOR_TABLE_SIZE)/Math.log10(2) - 1);
  bits[5] = colorTableSize[5];
  bits[6] = colorTableSize[6];
  bits[7] = colorTableSize[7];

  //console.log("encode header",)
  data[4] = FileReader.binToInt(bits);
  // --------------------------------

  data[5] = FileReader.byteToBits(this.BACKGROUND_COLOR_INDEX);
  data[6] = FileReader.byteToBits(this.PIXEL_ASPECT_RATIO);
  data[7] = 33;

  console.log("encoding header color size",colorTableSize)
  d.set(data,6)

  return d;
}
