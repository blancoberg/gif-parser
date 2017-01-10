function ApplicationExtension(file,parser){

  if(file){
    this.file = file;
    this.blockSize = file.readUnsigned(1);
    this.appIdentifier = file.readString(8);
    this.appAuthCode = file.readString(3);
    this.blocks = [];
    var blockSize = file.readUnsigned(1);
    //this.blockSize = blockSize;
    while(blockSize != 0){

      this.blocks.push(file.read(blockSize));
      blockSize = file.readUnsigned(1);
    }
  }else{
    this.blockSize = 11;
    this.appIdentifier = "NETSCAPE";
    this.appAuthCode = "2.0";
    this.blocks = [];
    this.blocks.push(new Uint8Array([1,0,0]));
  }


  console.log("app",this);
}

ApplicationExtension.prototype.encode = function(){

  this.file = this.file != null ? this.file : new FileReader();
  var length = 1 + (this.appIdentifier.length + this.appAuthCode.length)  + 1 + 1 // appid + authcode + ID(255) + blockSize;
  for(var i = 0;i<this.blocks.length;i++){
    length += 1 + this.blocks[i].length
  }
  length+=1; // end of file 00000000

  var data = new Uint8Array(length);
  var pos = 0;
  data[0] = 255;pos++;
  data.set([this.blockSize],pos); pos++;
  data.set(this.file.stringToBytes(this.appIdentifier),pos); pos+=8;
  data.set(this.file.stringToBytes(this.appAuthCode),pos); pos+=3;

  for(var i = 0;i<this.blocks.length;i++){
    data[pos] = this.blocks[i].byteLength; pos++;
    data.set(this.blocks[i],pos);pos+=this.blocks[i].byteLength;
  }
  pos+=1;
  data[pos] = 33;
  return data;
  //console.log("app encode",data)
}
