function ApplicationExtension(file,parser){

  this.blockSize = file.readUnsigned(1);
  this.appIdentifier = file.readString(8);
  this.appAuthCode = file.readString(3);
  this.blocks = [];
  var blockSize = file.readUnsigned(1);
  while(blockSize != 0){

    this.blocks.push(file.read(blockSize));
    blockSize = file.readUnsigned(1);
  }

  console.log(this);
}
