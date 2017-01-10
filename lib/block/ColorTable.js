function ColorTable(file,parser,amountOfColors){

  // parse if global color table exists in header //
  //if(parser.header.GLOBAL_COLOR_TABLE_FLAG){

    //console.log("colors ",amountOfColors)
    //var amountOfColors = parser.header.GLOBAL_COLOR_TABLE_SIZE;
    this.colors = [];

    for(var i = 0;i<amountOfColors;i++){
        var color = {
          r: file.readUnsigned(1),
          g: file.readUnsigned(1),
          b: file.readUnsigned(1)
        }
        this.colors.push(color);
    }
    //console.log(file.read(30,true))
    console.log(this);


  //}

}

ColorTable.prototype.encode = function(){

  var data = new Uint8Array(this.colors.length * 3);
  for(var i = 0;i<this.colors.length;i++){
    data[i*3] = this.colors[i].r;
    data[i*3+1] = this.colors[i].g;
    data[i*3+2] = this.colors[i].b;
  }
  return data;

}

ColorTable.prototype.clear = function(){
  this.colors = [];
}

// add color object {r:0-255,g:0-255,b:0-255}
ColorTable.prototype.addColor = function(color){
  //console.log("add color",)
  var c = FileReader.unsignedToBytes(color,3);
  this.colors.push({b:c[0],g:c[1],r:c[2]})
}
