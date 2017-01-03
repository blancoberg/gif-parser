function GifParser(url){

  this.blocks = [];
  this.blockIds = {
    "44" : ImageDescriptor
  };


  this.file = new FileReader();
  this.file.open(url,this.parse.bind(this));


}

GifParser.prototype.parse = function(){
  console.log("gifparse!")

  // Header,Logical Screen Descriptor
  this.header = new Header(this.file,this);
  this.globalColorTable = new ColorTable(this.file,this,this.header.GLOBAL_COLOR_TABLE_SIZE);

  // loop until EOF
  var id = this.file.readUnsigned(1);
  
  while (this.blockIds[id] != null){
    this.blocks.push(new this.blockIds[id](this.file,this))
    id = this.file.readUnsigned(1);
    console.log("id",id)
  }
  // end of file
  if(id == 59){

  }


  /*
  if(this.blockIds[id] != null){
    this.blocks.push(new ImageDescriptor(this.file,this))
  }else{
    console.log("could not parse block ",id);
  }
  */
  //this.blocks.control = new GraphicControlExtension(this.file,this);


  // Global Color Table

  // Graphics Control Extension

  // Image Descriptor

  // Local Color Table

  // Image Data


}

GifParser.prototype.save = function(){

}
