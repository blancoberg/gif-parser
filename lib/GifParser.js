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

GifParser.prototype.save = function(){

  var blocks = [];
  //blocks.push(this.header.save());
  //blocks.push(this.globalColorTable.save());

}

GifParser.prototype.parse = function(){

  var time = new Date().getTime();

  //console.log("gifparse!")
  // Header,Logical Screen Descriptor
  this.header = new Header(this.file,this);
  if(this.header.GLOBAL_COLOR_TABLE_FLAG){
    this.globalColorTable = new ColorTable(this.file,this,this.header.GLOBAL_COLOR_TABLE_SIZE);
  }



  this.file.read(1); // terminator (33)

  // begin parsing of blocks

  var id = this.file.readUnsigned(1);
  while (this.blockIds[id] != null){

    this.blocks.push(new this.blockIds[id](this.file,this))

    var terminator = this.file.readUnsigned(1);
    if(terminator == 0 || terminator == 33){
      id = this.file.readUnsigned(1);
    }else{
      break;
    }

  }

  if(terminator == 0x3b){
    // parsing complete
  }

    console.log("parsing time:",new Date().getTime()-time)

}

GifParser.prototype.save = function(){

}
