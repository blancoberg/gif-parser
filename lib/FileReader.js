function FileReader(byteArray){
  this.bytes = byteArray || [];
  this.pos = 0;
  this.type="FileReader";
}

// load file //
FileReader.prototype.open = function(src,callback){
  this.callback = callback;
  var xhttp = new XMLHttpRequest();
  xhttp.responseType = "arraybuffer";
  xhttp.onreadystatechange = this._loadComplete.bind(this);

  xhttp.open("GET", src, true);
  xhttp.send();
}

FileReader.prototype._loadComplete = function(e){

  if (e.target.readyState == 4 && e.target.status == 200) {

  //console.log("load complete",e)
   this._toBytes(e.target.response);
   this.callback();
  }
}

FileReader.bytesToBits = function(bytes){

  //console.log("bytes to bits ", bytes.byteLength)
  var a = [];
  for (var i = 0;i<bytes.byteLength;i++) {
    //console.log("loop")
      a = a.concat(FileReader.byteToBits(bytes[i]));
  }
  //console.log("complete")
  return a;

}

FileReader.prototype.stringToBytes = function(str){

  var letters = str.split("");
  var array = new Uint8Array(letters.length)
  for(var a in letters){
    array[a] = letters[a].charCodeAt(0);
  }

  return array;
}

FileReader.byteToBits = function(byte,swap){

  var a = [];
  for (var i = 7; i >= 0; i--) {
      a.push( !! (byte & (1 << i)) == true ?  1 : 0);
  }

  //console.log("byte to bit",byte,a)
  return a;


}

FileReader.binToInt = function(bin){
  var value = 0;
  for(var i = 0;i<bin.length;i++){
    var v = bin[i] == 1 || bin[i] == "1" || bin[i] == true ? 1 : 0;

    value+= Math.pow(2,bin.length-i-1)* v
  }
  return value;
}

// convert loaded string to byte array
FileReader.prototype._toBytes = function(str){


  var arrayBuffer = str; // Note: not oReq.responseText
  if (arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    //console.log("new array bufffer",byteArray,byteArray.byteLength)

  }
  //console.log(byteArray);
  this.bytes = byteArray;

}

// set position
FileReader.prototype.seek = function(offset){
  this.pos = offset;
}

FileReader.prototype.readByteAsBits = function(){

  var binary = this.read(1)[0].toString(2);
  // add zeros
  binary = binary.length<8 ? Array(9-binary.length).join("0") + binary : binary;
  return binary.split("");


}

FileReader.prototype.unsignedToBytes = FileReader.unsignedToBytes = function(number,bytes){

  var byteArray = new Uint8Array(bytes);
  for(var i = 0;i<bytes*8;i++){
    var b = (i>>3);
    byteArray[b]+=((number & (1<<(i))) / Math.pow(256,(b)));
  }
  return byteArray;
}

FileReader.prototype.readUnsigned = function(bytes){
  var bytes = this.read(bytes);
  var r = 0;
  for(var i = 0;i<bytes.byteLength;i++){
    r+= bytes[i] << ( i * 8);
  }
  return r;
}

// returns section of bytes //
FileReader.prototype.read = function(bytes,static){
  var bytesSegment = this.bytes.slice(this.pos,this.pos+bytes);
  this.pos+= static != true ? bytes : 0;
  return bytesSegment;

}

FileReader.prototype.readString = function(bytes){
  var bytes = this.read(bytes);
  var str = "";
  for(var a in bytes){
    str+=String.fromCharCode(bytes[a]);
  }
  return str;
}

// returns current position
FileReader.prototype.tell = function(){

}
