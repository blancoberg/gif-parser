function ImageDescriptor(file,parser,options){


  // position and dimensions
  //console.log("image descriptor")
  //console.log("new image",file.read(20,true))
  //console.log("file", file.type)
  //console.log("new image desc",file,"start",file.pos)
  if(file.type){
    this.file = file;
    this.left = file.readUnsigned(2);
    this.top = file.readUnsigned(2);

    this.width = file.readUnsigned(2);
    this.height = file.readUnsigned(2);
    this.pixelCount = this.width * this.height;

    this.packedBits = file.readByteAsBits();
    this.hasLocalColorTable = this.packedBits[0] == "1" ? true : false;
    this.interlaced = this.packedBits[1] == "1" ? true : false;
    this.sortFlag = this.packedBits[2] == "1" ? true : false;
    this.reserved = this.packedBits.slice(3,4);
    this.colorTableSize = Math.pow(2,FileReader.binToInt(this.packedBits.slice(5,8))+1);

    if(this.hasLocalColorTable){

      this.colorTable = new ColorTable(file,parser,this.colorTableSize);
    }else{
      this.colorTable = parser.globalColorTable;
    }

    this.minimumCodeSize = file.readUnsigned(1);
    var blockSize = file.readUnsigned(1);
    this.blocks = [];
    this.totalSize = blockSize;

    while(blockSize != 0){

      this.blocks.push({blockSize:blockSize,data:file.read(blockSize)});
      blockSize = file.readUnsigned(1);
      this.totalSize +=blockSize;
    }
    //console.log(this);

    this.blockData = new  Uint8Array(this.totalSize);
    var pos = 0;
    for(var i = 0;i<this.blocks.length;i++){

      this.blockData.set(this.blocks[i].data,pos);
      pos+=this.blocks[i].blockSize;

    }
    console.log(this);
    console.log("terminator after image",this.file.read(1,true)[0])
    //console.log("blocks",this.blocks)
    //console.log(this);
    this.decodeImageData();
  }
  else{
    // create empty image
    //console.log("")
    this.parser = parser;
    this.left = options.left;
    this.top = options.top;

    this.width = options.width;
    this.height = options.height;
    this.pixelCount = this.width * this.height;

    this.packedBits = [0,0,0,0,0,0,0,0];
    this.hasLocalColorTable = this.packedBits[0] == "1" ? true : false;
    this.interlaced = this.packedBits[1] == "1" ? true : false;
    this.sortFlag = this.packedBits[2] == "1" ? true : false;
    this.reserved = this.packedBits.slice(3,4);
    this.colorTableSize = Math.pow(2,FileReader.binToInt(this.packedBits.slice(5,8))+1);

    if(this.hasLocalColorTable){

      this.colorTable = new ColorTable(file,parser,this.colorTableSize);
    }else{
      this.colorTable = parser.globalColorTable;
    }

    this.minimumCodeSize = parser.header.GLOBAL_COLOR_TABLE_SIZE;
    //console.log("minimum code size",this.minimumCodeSize)
    //console.log("new img",this.left,this.top,this.width,this.height)


    this.convertCanvasToData(file);




  }



}

ImageDescriptor.prototype.cropImageData = function(x,y,w,h){
	// crop top bottom
  var width = this.width;
  var height = this.height;
  //console.log("crop",x,y,w,h)
  var data = this.data;
  data = data.slice(y*width,y*width + h*width);
  // crop left
  for(var i = data.length-2;i>-1;i--){
  	data.splice(i*width,x)
    data.splice(i*width+w,width-(x+w))
  }
  this.width = w;
  this.height = h;
  this.left = x;
  this.top = y;
  this.data = data;

  //console.log("cropped data",data.length == this.width*this.height,this.left,this.top,this.width,this.height)

}

ImageDescriptor.prototype.compareTo = function(img){

  //console.log("compare to")
  var width = this.width;
  var height = this.height;

  if(width == img.width && height == img.height){

    var data1 = this.data;
    var data2 = img.data;
    var bottom = 0;
    var top = false;
    var left = 0;
    var right = 0;

    // top
  	for(var i = 0;i<data1.length;i++){
    	if(data1[i] != data2[i]){
      	top = Math.floor(i/width);
        break;
      }
    }
    if(top == false)
      return false;
    // bottom
    for(var i = data1.length-1;i>-1;i--){
    	if(data1[i] != data2[i]){
      	bottom = width - Math.floor(i/width);
        break;
      }
    }

    // left
    for(var i = 0;i<data1.length;i++){
      var id = (i%height) * width + Math.floor(i/height)
    	if(data1[id] != data2[id]){
      	left = Math.floor(i/height);
        break;
      }
    }

    // right
    for(var i = data1.length-1;i>-1;i--){
      var id = (i%height) * width + Math.floor(i/height)
    	if(data1[id] != data2[id]){
      	right = height - Math.floor(i/height);
        break;
      }
    }

    //
    return {bottom:bottom,right:right,left:left,top:top,width:width - (left+right),height:height-(top+bottom)}
    //console.log("compare",left,right,top,bottom)
  }


}



ImageDescriptor.prototype.findNearestColor = function(r,g,b,colorTable){
  var dist = 1000000;
  var color = 0;
  //console.log("find nearest",colorTable)
  for(var i = 0;i<colorTable.length;i++){
    var c = colorTable[i];
    var tempDist = Math.pow((c.r-r)*0.30,2) + Math.pow((c.g-g)*0.59,2) + Math.pow((c.b-b)*0.11,2);
    if(tempDist< dist){
      color = i;
      dist = tempDist;
    }

  }

  return color;
}

/*
  convert image data to gif image data
*/

ImageDescriptor.prototype.convertCanvasToData = function(file){
  //console.log("convert canvas to image",this.width,this.height)

  var imgData;
  if(file instanceof ImageData){
    imgData = file;
    //console.log("is imagedata")
  }else{
    //console.log("canvas to imagedata")
    imgData = file.getContext("2d").getImageData(0,0, this.width, this.height);
  }
  var pixels = imgData.data;
  var colors  = this.parser.globalColorTable.colors;

  var indexedColors = [];
  for(var i = 0;i<colors.length;i++){
    var c = colors[i];
    for(var a=0;a<3;a++){
      indexedColors[c.r] = indexedColors[c.r] == null ? [] : indexedColors[c.r];
      indexedColors[c.r][c.g] = indexedColors[c.r][c.g] == null ? [] : indexedColors[c.r][c.g];
      indexedColors[c.r][c.g][c.b] = i;
    }
  }
  //console.log("indexed colors",indexedColors)
  var data = [];
  for(var i = 0;i<pixels.length;i+=4){

    var c = indexedColors;
    // found color //
    if(c[pixels[i]] && c[pixels[i]][pixels[i+1]] && c[pixels[i]][pixels[i+1]][pixels[i+2]]){
      data.push(c[pixels[i]][pixels[i+1]][pixels[i+2]])
    }else{
      // no color found

      var nearestColor = this.findNearestColor(pixels[i],pixels[i+1],pixels[i+2],colors)
      data.push(nearestColor);
    }

  }
  //console.log("image data from canvas",data);
  this.data = data;
}

// encodes entire image block //
ImageDescriptor.prototype.encode = function(){
  var length = 0;
  this.file = new FileReader();
  // reserve bytes for static values
  length += 1 + 2 * 4 + 1; // id , left, top ,width,height,packedBits;

  if(this.hasLocalColorTable){
    var colorTable = this.colorTable.encode();
    length+= colorTable.byteLength;
    //console.log("encode image ",this.hasLocalColorTable)
  }

  length +=1; // minimumCodeSize for image-data //

  if(!this.blockData){
    this.encodeImageData();
  }
  // allocate space for imgdata
  // size of block + blockdata ...
  // compile imagedata
  ;
  //if(!this.blockData){
  /*
    var oldBlockData = this.blockData;
    this.encodeImageData();

    // compare old to new data
    console.log("compare block data",this.blockData,oldBlockData)
    for(var i = 0;i<this.blockData.length;i++){
      if(this.blockData[i] != oldBlockData[i]){
        console.warn("not the same!!",i,this.blockData[i],oldBlockData[i]);
        break;
      }
    }
    */

  //}
  //console.log("block data on encode",this.blockData)

  var imgLength = this.blockData.length;
  //while(imgLength>0){

    //var before = imgLength
    //imgLength=Math.max(0,imgLength-255);
    //length += (before-imgLength) + 1;
    //console.log((before-imgLength))
    //console.log("block size calc",(before-imgLength),Math.random())

  //}
  length+=imgLength;
  //console.log("imgLength",this.blockData.length,imgLength)
  //length+=1 + 1; // add terminator 0 & 59
//  length+=1; // add terminator

  // create bytearray
  var data = new Uint8Array(length);
  var pos = 0;
  data[pos] = 44;pos++; // id
  data.set(this.file.unsignedToBytes(this.left,2),pos);pos+=2;
  data.set(this.file.unsignedToBytes(this.top,2),pos);pos+=2;
  data.set(this.file.unsignedToBytes(this.width,2),pos);pos+=2;
  data.set(this.file.unsignedToBytes(this.height,2),pos);pos+=2;
  //console.log("width",this.file.unsignedToBytes(this.width,2))
  data[pos] = FileReader.binToInt(this.packedBits);pos+=1;
  if(this.hasLocalColorTable){
    data.set(colorTable,pos);pos+=colorTable.byteLength;
  }
  //console.log("saving minimum",this.minimumCodeSize)
  //data.set(this.file.unsignedToBytes(this.minimumCodeSize,1),pos);pos+=1;


  // add image data //
  //console.log("block data",this.blockData);
  /*
  var imgLength = this.blockData.length;
  blockPos = 0;
  while(imgLength>0){
    var before = imgLength
    imgLength=Math.max(0,imgLength-255);
    var blockSize = before-imgLength;
    data[pos] = blockSize;pos+=1;

    var blockData = this.blockData.slice(blockPos,blockPos+blockSize);
    //console.log("block size",blockSize,blockData);
    data.set(this.blockData.slice(blockPos,blockPos+blockSize),pos);
    pos+=blockSize;
    blockPos+=blockSize;
    //data.set()
    //console.log("block",blockSize)
  }
  */
  data.set(this.blockData,pos);
  pos+=this.blockData.length;
  //console.log("encoded dat",data)
  //console.log("last blocksize",blockSize)
  //data[pos] = 0;pos++;
  data[pos] = 33;pos++; // terminator
  //console.log("image data ",this.file.bytes,data)
  return data;


}

ImageDescriptor.prototype.encodeImageData = function(){

  var encoder = new LZWEncoder(this.width,this.height, this.data, this.minimumCodeSize)
  var data = new ByteArray();
  var d = encoder.encode(data);
  //console.log("theirs",data.getRawData());
  this.blockData = data.getRawData();//LZW.encode(this.data,this.minimumCodeSize);
  //console.log("mine",this.blockData)

  var same = true;
  for(var i = 0;i<this.blockData.length;i++){
    if(this.blockData[i] != data.pages[0][i]){
      //console.log("note same");
    }
  }
  //console.log("raw",this.data);
  //this.blockData = new Uint8Array(data.cursor);
  //this.blockData.set(data.pages[0].slice(0,data.cursor),0)
  //this.blockData = new Uint8Array()
  //console.log(this.blockData,data,this.minimumCodeSize);
  //this.decodeImageData();
}


ImageDescriptor.prototype.decodeImageData = function(){

  console.log("decode w h",this.width,this.height,this.width*this.height);
  //var encoder = new LZWEncoder(this.width,this.height, this.blockData, this.minimumCodeSize)
  var data = LZW.decode(this.blockData,this.minimumCodeSize);
  this.data = data;
  //console.log(this.data);

  var canvas = document.createElement("canvas");
  canvas.width = this.width;
  canvas.height = this.height;
  canvas.style.backgroundColor="rgba(255,0,0,1)"
  document.getElementsByTagName("body")[0].appendChild(canvas);


  var width = this.width;
  var colors = this.colorTable.colors;
  // render image to canvas //
  var context = canvas.getContext("2d");

  var imageData = context.createImageData(this.width,this.height);
  console.log("pixels",data.length)
  for(var i = 0 ;i<data.length;i++){

    //var pixel = context.createImageData(1,1);
    //var d = pixel.data;
    var c = colors[data[i]];
    //console.log(c);




    var x = i%width;
    var y = Math.floor(i/width);

    var index = (x + y * width) * 4;

    imageData.data[index+0] = c.r;
    imageData.data[index+1] = c.g;
    imageData.data[index+2] = c.b;
    imageData.data[index+3] = 255;


  }

  context.putImageData( imageData, 0,0);
  //this.encodeImageData();



}
