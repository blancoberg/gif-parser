function FileReader(byteArray){
  this.bytes = byteArray || [];
  this.pos = 0;
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

  console.log("load complete",e)
   this._toBytes(e.target.response);
   this.callback();
  }
}

FileReader.prototype.binToInt = function(bin){
  var value = 0;
  for(var i = 0;i<bin.length;i++){
    var v = bin[i] == 1 || bin[i] == "1" ? 1 : 0;

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

    var bytes = [];
    for(var i = 0;i<byteArray.byteLength;i++){
      //bytes.push(byteArray[i]);
    }

  }
  console.log(byteArray);
  this.bytes = byteArray;

}

// set position
FileReader.prototype.seek = function(offset){
  this.pos = offset;
}

FileReader.prototype.readByteAsBits = function(){

  return this.read(1)[0].toString(2).split("")


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
FileReader.prototype.read = function(bytes){
  var bytesSegment = this.bytes.slice(this.pos,this.pos+bytes);
  this.pos+=bytes;
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
