function EncodingTable(minimumCodeSize){

  this.table = [];

  this.currentTable = this.table;
  this.currentDepth = 0;
  this.currentTable = this.table;
  this.clearCode = 1 << minimumCodeSize;
  this.nextCode = this.clearCode+2;
  this.depths = [];

  for (var i = 0; i < this.clearCode; i++) {
      this.table[i] = [];
      this.table[i][256] = i; // id of table

  }
}

EncodingTable.prototype.hasCode = function(array,exist = true){


  var exist = true;
  var code = false;
  for(var i = this.currentDepth;i<array.length;i++){
    if(this.currentTable[array[i]]){
      code = this.currentTable[array[i]][256];
      this.depths.push(this.currentTable);
      this.currentTable = this.currentTable[array[i]];

      this.currentDepth++;
    }else{
      exist = false;
    }
  }
  //console.log("has code",array,exist)
  if(exist){
    return code;
  }else{
    return false;
  }


}

EncodingTable.prototype.getPreviousCode = function(){

  var table = this.depths[this.depths.length-1]
  //console.log("get previous",table)
  return table[256];
}

EncodingTable.prototype.resetDepth = function(d){
  this.currentDepth = 0;
  this.currentTable = this.table;
}

EncodingTable.prototype.addCode = function(array){


  var code = this.nextCode;this.nextCode++;
  for(var i = this.currentDepth;i<array.length;i++){
    this.depths.push(this.currentTable);
    this.currentTable[array[i]] = [];
    this.currentTable[array[i]][256] = code;
    this.currentTable = this.currentTable[array[i]];
  }
  this.table[code] = array
  return code;
}


LZW = new function(){

  this.codeTable = [];
  this.pos = 0;
  this.clearCodeTable = function(minimumCodeSize){

    this.codeTable = [];
    this.codeSize = this.minimumCodeSize + 1;

    for (var i = 0; i < this.clearCode; i++) {
        this.codeTable[i] = [i];
    }
    this.codeTable[this.clearCode] = [];
    this.codeTable[this.EOICode] = null;

  }

  this.read = function(codeSize){

    var bits = []
    bits = "";
    //bits = 0;
    var int = 0;

    while(bits.length<codeSize){

      var bitPos = this.pos - (this.pos >> 3)*8;
      var currentByte = this.stream[this.pos >> 3];
      int+=(currentByte & (1 << bitPos));
      //bits.unshift(!! (currentByte & (1 << bitPos)) == true ?  1 : 0)
      bits=(!! (currentByte & (1 << bitPos)) == true ?  1 : 0) + bits;

      this.pos++;
    }

    var int = parseInt(bits,2);//toString(FileReader.binToInt(bits);
  //  var int = bits;



    return int;
  }

  this.readByte = function(){
    var byte = this.stream[this.pos];
    this.pos++;
    return byte;
  }

  this.encode = function(array,minimumCodeSize){

    console.log("encode",array,new EncodingTable(minimumCodeSize).table)
  //  console.log("encode!" , array.length)
    /*
    STRING = get input character
    WHILE there are still input characters DO
      CHARACTER = get input character
      IF STRING+CHARACTER is in the string table then
          STRING = STRING+character
      ELSE
          output the code for STRING
          add STRING+CHARACTER to the string table
          STRING = CHARACTER
      END of IF
    END of WHILE
    output the code for STRING
    */

    //this.pos = 0;
    this.stream = array;
    this.pos = 0;
    this.clearCode = 1 << minimumCodeSize;
    //this.currentCode = array[0]
    this.buffer = []

    this.encodingTable = new EncodingTable(minimumCodeSize)

    this.clearCodeTable(minimumCodeSize)
    this.minimumCodeSize = minimumCodeSize;
    this.EOICode = this.clearCode + 1;

    this.output = [this.clearCode];
    this.currentCode = this.readByte();
    this.buffer.push(this.currentCode);
    var lastCode = this.currentCode;


    for(var i = 0;i<array.length;i++){

      this.currentCode = this.readByte();
      //var hasCodeBefore = this.encodingTable.hasCode(this.buffer)
      this.buffer.push(this.currentCode);
      var bufferId = "c"+this.buffer.join("")
      //console.log("bufferId",bufferId)


      var hasCode = this.encodingTable.hasCode(this.buffer)
      if(hasCode !== false){
        //console.log("is in table",this.buffer)
        lastCode=hasCode;
        console.log("lastCode",hasCode)
      }else{
      //  console.log("is not in table" , this.buffer,this.codeTable.length)

      //  this.codeTable[bufferId] = this.buffer;

        var code = this.encodingTable.addCode(this.buffer);
        var previousCode = this.encodingTable.getPreviousCode()
        console.log("previous code",previousCode)
        this.encodingTable.resetDepth();

        //console.log("new code",code,lastCode)
        this.output = this.output.concat([previousCode])
        lastCode = code;
        this.buffer = [this.currentCode];
      }

      //console.log("output",this.output)
    }
    this.output.push(this.EOICode);
    console.log("encode output",this.output,this.buffer)
    var newStream = [];
    var bit = 0;
    var codeSize = this.minimumCodeSize+1;
    var currentByte = 0;
    for(var i = 0;i<this.output.length;i++){


      if(this.output[i] == (Math.pow(codeSize,2)-1))
      {
        console.log("increase code size at ",this.output[i],codeSize)
        codeSize++;

      }


      var byteId = currentByte >> 3;
      if(!newStream[byteId])
        newStream[byteId] = 0;

      var a = 0;
      while(a<codeSize){

        var byteId = currentByte >> 3;
        //console.log("byteid ",currentByte,byteId)

        var value = (!!this.output[i]  & (1 >> (codeSize-1)-a)) ;
        //console.log("      loop", this.output[i],!!this.output[i]  & (1 >> (codeSize-1)-a),byteId )
        console.log("value ",this.output[i], !!(this.output[i] & (1 << a)) <<currentByte%8)
        newStream[byteId]+=!!(this.output[i] & (1 << a)) <<currentByte%8;
        a++;
        currentByte++;
      }



      //console.log("codesize",codeSize)

    }

    console.log(newStream);
  //  this.decode(newStream);
    // pack it in bitstream //


    //console.log("encode",stream)

  }

  this.decode = function(byteArray,minimumCodeSize){


    this.stream = byteArray;
    this.pos = 0;
    this.minimumCodeSize = minimumCodeSize;
    this.codeSize = this.minimumCodeSize + 1;
    this.codeTable = [];
    this.clearCode = 1 << (minimumCodeSize);
    this.EOICode = this.clearCode + 1;
    this.currentCode;
    this.output = [];


    var i = 0;
    while(true){
      //console.log("loop")
      this.lastCode = this.currentCode;
      this.currentCode = this.read(this.codeSize);
      //console.log("currentCord",this.currentCode)
      if (this.currentCode === this.clearCode) {
          this.clearCodeTable();
          continue;
      }
      if (this.currentCode === this.EOICode) break;

      //console.log("current code",this.currentCode)
      if (this.currentCode < this.codeTable.length) {

        if (this.lastCode !== this.clearCode) {
            this.codeTable.push(this.codeTable[this.lastCode].concat(this.codeTable[this.currentCode][0]));
        }
      }
      else {
          if (this.currentCode !== this.codeTable.length) throw new Error('Invalid LZW code.' + this.currentCode);
          this.codeTable.push(this.codeTable[this.lastCode].concat(this.codeTable[this.lastCode][0]));
      }
      this.output.push.apply(this.output, this.codeTable[this.currentCode]);

      if (this.codeTable.length === (1 << this.codeSize) && this.codeSize < 12) {
          // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
          this.codeSize++;
      }


    }
    return this.output;

  }

}()
