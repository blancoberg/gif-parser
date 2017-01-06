function GifParser(url){

  this.blocks = [];
  this.blockIds = {
    "44" : ImageDescriptor,
    "249" : GraphicControlExtension,
    "255" : ApplicationExtension
  };


  this.file = new FileReader();
  this.file.open(url,this.parse.bind(this));


}

GifParser.prototype.parse = function(){
  console.log("gifparse!")

  // Header,Logical Screen Descriptor
  this.header = new Header(this.file,this);
  this.globalColorTable = new ColorTable(this.file,this,this.header.GLOBAL_COLOR_TABLE_SIZE);

  // skip
  console.log(this.file.read(1));
  // loop until EOF
  var id = this.file.readUnsigned(1);
  console.log("id",id)
  while (this.blockIds[id] != null){
    this.blocks.push(new this.blockIds[id](this.file,this))
    // skip
    console.log("skip",this.file.read(1))
    id = this.file.readUnsigned(1);
    console.log("id",id)
  }
  // end of file
  console.log("end",this.file.read(-2))
  if(id == 59){

  }


  // Global Color Table

  // Graphics Control Extension

  // Image Descriptor

  // Local Color Table

  // Image Data


}

GifParser.prototype.save = function(){

}
