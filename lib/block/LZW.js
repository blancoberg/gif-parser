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
    //console.log("read ",codeSize);

    var bits = []//this.stream.splice(0,codeSize);

    //currentByte = this.pos
    while(bits.length<codeSize){

      var bitPos = this.pos - (this.pos >> 3)*8;
      var currentByte = this.stream[this.pos >> 3];
      //console.log("currentbyte",currentByte,this.pos,bitPos);
      bits.unshift(!! (currentByte & (1 << bitPos)) == true ?  1 : 0)
      this.pos++;
    }
    //console.log("read",bits)
    var int = FileReader.binToInt(bits);
    return int;
  }


  this.encode = function(bitStream,minimumCodeSize){



  }

  this.decode = function(byteArray,minimumCodeSize){


    this.stream = byteArray;
    //this.read(8);
    //console.log("decode",byteArray)
    this.minimumCodeSize = minimumCodeSize;
    this.codeSize = this.minimumCodeSize + 1;
    this.codeTable = [];
    this.clearCode = 1 << minimumCodeSize;
    this.EOICode = this.clearCode + 1;
    this.currentCode;
    this.output = [];

    //console.log("clear code",this.clearCode)
    var i = 0;
    while(true){
      //console.log("loop")
      this.lastCode = this.currentCode;
      this.currentCode = this.read(this.codeSize);

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
                if (this.currentCode !== this.codeTable.length) throw new Error('Invalid LZW code.');
                this.codeTable.push(this.codeTable[this.lastCode].concat(this.codeTable[this.lastCode][0]));
            }
            this.output.push.apply(this.output, this.codeTable[this.currentCode]);

            if (this.codeTable.length === (1 << this.codeSize) && this.codeSize < 12) {
                // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
                //console.log("increase codesize",this.codeSize)
                this.codeSize++;
            }


    }
      return this.output;

  }

}()
