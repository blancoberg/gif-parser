function ColorTable(file,parser,amountOfColors){

  // parse if global color table exists in header //
  if(parser.header.GLOBAL_COLOR_TABLE_FLAG){

    //var amountOfColors = parser.header.GLOBAL_COLOR_TABLE_SIZE;
    this.table = [];

    for(var i = 0;i<amountOfColors;i++){
        var color = {
          r: file.readUnsigned(1),
          g: file.readUnsigned(1),
          b: file.readUnsigned(1)
        }
        this.table.push(color);
    }

    console.log(this);


  }

}
