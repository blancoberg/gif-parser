function EncodingTable(minimumCodeSize){

  this.clearCode = 1 << minimumCodeSize;

  this.clear();
}

EncodingTable.prototype.hasCode = function(array){


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

EncodingTable.prototype.clear = function(){


  this.table = [];

  this.currentTable = this.table;
  this.currentDepth = 0;
  this.currentTable = this.table;

  this.nextCode = this.clearCode+2;
  this.depths = [];
  this.codeLength = [];
  this.length = this.clearCode;
  for (var i = 0; i < this.clearCode; i++) {
      this.table[i] = [];
      this.table[i][256] = i; // id of table

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

EncodingTable.prototype.addCode = function(array,p){


  var code = this.nextCode;this.nextCode++;
  //console.log("add code",code)
  for(var i = this.currentDepth;i<array.length;i++){
    this.depths.push(this.currentTable);
    this.currentTable[array[i]] = [];
    this.currentTable[array[i]][256] = code;
    this.currentTable = this.currentTable[array[i]];
  }
  //this.table[code] = array
  this.length++;
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

    //console.log("encode lzw",array,minimumCodeSize)
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


    //this.currentCode = this.readByte();
    //this.buffer.push(this.currentCode);
    var lastCode = this.currentCode;
    var codeSize = minimumCodeSize+1;
    var sizes = [];
    //sizes[0] = codeSize;

    for(var i = 0;i<array.length;i++){

      this.currentCode = this.readByte();
      //var hasCodeBefore = this.encodingTable.hasCode(this.buffer)
      this.buffer.push(this.currentCode);
      //var bufferId = "c"+this.buffer.join("")
      //console.log("bufferId",bufferId)


      var hasCode = this.encodingTable.hasCode(this.buffer)

      if(i == array.length-1){
        //console.log("last has code",hasCode);

      }
      if(hasCode !== false){
        //console.log("is in table",this.buffer)
        lastCode=hasCode;
        var code = false;
        //console.log("lastCode",hasCode)

      }else{

      //  console.log("is not in table" , this.buffer,this.codeTable.length)

      //  this.codeTable[bufferId] = this.buffer;

        var code = this.encodingTable.addCode(this.buffer);

        var previousCode = this.encodingTable.getPreviousCode()
        //console.log("add",code,previousCode)
        this.encodingTable.resetDepth();



        if (this.encodingTable.length === (1 << codeSize) && codeSize < 12) {
            // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
            //console.log("increase codesize at",this.currentCode)
            codeSize++;
            sizes[this.output.length-1] = codeSize;
        }

        this.output = this.output.concat([previousCode])

        // reset encodingTable //
        if(codeSize==13){
          console.log("clear code" , code,this.buffer)
          this.encodingTable.clear();
          codeSize = minimumCodeSize+1;

          this.output.push(code);

          this.output.push(this.clearCode)
          sizes[this.output.length-1] = codeSize;
          this.buffer = [];

        }


        lastCode = code;
        this.buffer = [this.currentCode];



      }


    }

    // Important!
    // if the last code is not added to the stream, the image will be corrupt and missing a byte.
    // this took me some time to find out :)
    //this.encodingTable.resetDepth();
    //var lastBufferCode = this.encodingTable.hasCode(this.buffer);

    //if(hasCode!=false)

      //console.log("previous",lastCode,this.EOICode,this.output.slice(this.output.length-10,this.output.length));
      //this.output.push(lastCode);
      //console.log("has code",hasCode)
      if(hasCode){
        //this.output.push(lastBufferCode)
      }else{
        //this.output.push(this.encodingTable.length-1)
      }

    //}
    this.encodingTable.resetDepth();
    //console.log("current depth",this.encodingTable.currentDepth)
    //this.buffer.push(this.EOICode)
    var lastCode = this.encodingTable.hasCode(this.buffer);
    console.log("has code?",lastCode,this.encodingTable.length)
    //console.log("last code",this.buffer,this.output.slice(this.output.length-15,this.output.length),lastCode,"codesize",codeSize)
    this.output.push(hasCode)
    //this.output.push(1);
    //if(lastBufferCode == false){
      //this.encodingTable.resetDepth();
      //lastBufferCode = this.encodingTable.addCode(this.buffer);
      //this.output.push(lastBufferCode);
    //}


    //if(lastBufferCode !== false)


    if(hasCode!=false){
      //this.output.push(lastCode);

    }else{
      //this.output.push(code);

    }


    this.output.push(this.EOICode);

    //console.log("encode ","currentCode",this.currentCode,"previous",previousCode,"hasCode",hasCode ,lastCode,code,this.buffer,"lastBufferCode",lastBufferCode)
    //console.log("encode output!",this.currentCode,this.minimumCodeSize,this.output,"sizes",sizes)
    var newStream = [];
    var bit = 0;
    var codeSize = this.minimumCodeSize+1;
    var currentByte = 0;
    var counter = 0;
    for(var i = 0;i<this.output.length;i++){

      //var byteId = currentByte >> 3;

      var a = 0;

      /*
      while((this.output[i]).toString(2).length> codeSize)
      {
        console.log("increase code size at ",this.output[i],byteId,currentByte%8,codeSize)

        codeSize++;

      }*/


      while(a<codeSize){

        var byteId = (currentByte) >> 3;
        //if(this.output[i] == (Math.pow(codeSize,2)-1))

        if(newStream[byteId] == null)
          newStream[byteId] = 0;

        //console.log("byteid",byteId,currentByte)
        //var value = (!!this.output[i]  & (1 >> (codeSize-1)-a)) ;

        newStream[byteId]+=(!!(this.output[i] & (1 << a)) <<(currentByte%8));

        a++;
        currentByte++;


      }

      if(sizes[i]){
        //console.log("size up at",i,"to size",sizes[i],"at code",this.output[i])
        codeSize = sizes[i];
      }



    }
    //console.log("new code lenght",this.encodingTable.length,sizes);
    //console.log("encode complete",currentByte>> 3)
  //  console.log("byte",(currentByte-1)%8);
    return new Uint8Array(newStream);

  //  this.decode(newStream);
    // pack it in bitstream //




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
    this.clearCodeTable();
    var code = [];
    var i = 0;
    while(true){
      //console.log("loop")
      this.lastCode = this.currentCode;
      this.currentCode = this.read(this.codeSize);
      //this.lastCode = this.lastCode == null ? this.currentCode : this.lastCode;
      //console.log("currentCord",this.currentCode)
      if (this.currentCode === this.clearCode) {

          console.log("clear code",this.pos)
          this.clearCodeTable();

          code.push(this.clearCode);
          continue;
      }
      if (this.currentCode === this.EOICode){
        console.log("end of code",this.lastCode)
        break;
      }

      //console.log("current code",this.currentCode)
      if (this.currentCode < this.codeTable.length) {

        if (this.lastCode !== this.clearCode) {
            this.codeTable.push(this.codeTable[this.lastCode].concat(this.codeTable[this.currentCode][0]));

        }
      }
      else {
          //console.log("last code",this.lastCode
          if (this.currentCode !== this.codeTable.length){
            //console.log(this.output);
            //console.log("next:",this.read(this.codeSize))
            console.log("this.output",this.output,this.lastCode)
            throw new Error('Invalid LZW code. at ' + this.currentCode + " " + this.lastCode + " " + this.output.length + " " + this.codeTable.length);
          }
          this.codeTable.push(this.codeTable[this.lastCode].concat(this.codeTable[this.lastCode][0]));
      }
      this.output.push.apply(this.output, this.codeTable[this.currentCode]);
      code.push(this.currentCode)
      if (this.codeTable.length === (1 << this.codeSize) && this.codeSize < 12) {
          // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
          //console.log("increase codesize at",this.currentCode)
          this.codeSize++;
      }


    }
    console.log("lzw.decode",this.output.length,this.codeTable.length,this.currentCode,this.lastCode)
    return this.output;

  }

}()


function ByteArray() {
  this.page = -1;
  this.pages = [];
  this.newPage();
}

ByteArray.pageSize = 4096;
ByteArray.charMap = {};

for (var i = 0; i < 256; i++)
  ByteArray.charMap[i] = String.fromCharCode(i);

ByteArray.prototype.newPage = function() {
  this.pages[++this.page] = new Uint8Array(ByteArray.pageSize);
  this.cursor = 0;
};

ByteArray.prototype.getData = function() {
  var rv = '';
  for (var p = 0; p < this.pages.length; p++) {
    for (var i = 0; i < ByteArray.pageSize; i++) {
      rv += ByteArray.charMap[this.pages[p][i]];
    }
  }
  return rv;
};

ByteArray.prototype.getRawData = function(){
  var totalLength = 0;
  for (var p = 0; p < this.pages.length; p++) {
    totalLength+= p != this.pages.length -1 ? this.pages[p].length : this.cursor;
  }

  var raw = new Uint8Array(totalLength);
  var pos = 0;
  for (p = 0; p < this.pages.length; p++) {

    raw.set(this.pages[p].slice(0,p != this.pages.length -1 ? this.pages[p].length : this.cursor),pos);
    pos+= p != this.pages.length -1 ? this.pages[p].length : this.cursor;

  }
  return raw;

}

ByteArray.prototype.writeByte = function(val) {
  if (this.cursor >= ByteArray.pageSize) this.newPage();
  this.pages[this.page][this.cursor++] = val;
};

ByteArray.prototype.writeUTFBytes = function(string) {
  for (var l = string.length, i = 0; i < l; i++)
    this.writeByte(string.charCodeAt(i));
};

ByteArray.prototype.writeBytes = function(array, offset, length) {
  for (var l = length || array.length, i = offset || 0; i < l; i++)
    this.writeByte(array[i]);
};

/*
  LZWEncoder.js
  Authors
  Kevin Weiner (original Java version - kweiner@fmsware.com)
  Thibault Imbert (AS3 version - bytearray.org)
  Johan Nordberg (JS version - code@johan-nordberg.com)
  Acknowledgements
  GIFCOMPR.C - GIF Image compression routines
  Lempel-Ziv compression based on 'compress'. GIF modifications by
  David Rowley (mgardi@watdcsu.waterloo.edu)
  GIF Image compression - modified 'compress'
  Based on: compress.c - File compression ala IEEE Computer, June 1984.
  By Authors: Spencer W. Thomas (decvax!harpo!utah-cs!utah-gr!thomas)
  Jim McKie (decvax!mcvax!jim)
  Steve Davies (decvax!vax135!petsd!peora!srd)
  Ken Turkowski (decvax!decwrl!turtlevax!ken)
  James A. Woods (decvax!ihnp4!ames!jaw)
  Joe Orost (decvax!vax135!petsd!joe)
*/

var EOF = -1;
var BITS = 12;
var HSIZE = 5003; // 80% occupancy
var masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
             0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
             0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];

function LZWEncoder(width, height, pixels, colorDepth) {
  var initCodeSize = Math.max(2, colorDepth);
  console.log("encode",colorDepth)
  var accum = new Uint8Array(256);
  var htab = new Int32Array(HSIZE);
  var codetab = new Int32Array(HSIZE);

  var cur_accum, cur_bits = 0;
  var a_count;
  var free_ent = 0; // first unused entry
  var maxcode;

  // block compression parameters -- after all codes are used up,
  // and compression rate changes, start over.
  var clear_flg = false;

  // Algorithm: use open addressing double hashing (no chaining) on the
  // prefix code / next character combination. We do a variant of Knuth's
  // algorithm D (vol. 3, sec. 6.4) along with G. Knott's relatively-prime
  // secondary probe. Here, the modular division first probe is gives way
  // to a faster exclusive-or manipulation. Also do block compression with
  // an adaptive reset, whereby the code table is cleared when the compression
  // ratio decreases, but after the table fills. The variable-length output
  // codes are re-sized at this point, and a special CLEAR code is generated
  // for the decompressor. Late addition: construct the table according to
  // file size for noticeable speed improvement on small files. Please direct
  // questions about this implementation to ames!jaw.
  var g_init_bits, ClearCode, EOFCode;

  // Add a character to the end of the current packet, and if it is 254
  // characters, flush the packet to disk.
  function char_out(c, outs) {
    accum[a_count++] = c;
    if (a_count >= 254) flush_char(outs);
  }

  // Clear out the hash table
  // table clear for block compress
  function cl_block(outs) {
    cl_hash(HSIZE);
    free_ent = ClearCode + 2;
    clear_flg = true;
    output(ClearCode, outs);
  }

  // Reset code table
  function cl_hash(hsize) {
    for (var i = 0; i < hsize; ++i) htab[i] = -1;
  }

  function compress(init_bits, outs) {
    var fcode, c, i, ent, disp, hsize_reg, hshift;

    // Set up the globals: g_init_bits - initial number of bits
    g_init_bits = init_bits;

    // Set up the necessary values
    clear_flg = false;
    n_bits = g_init_bits;
    maxcode = MAXCODE(n_bits);

    ClearCode = 1 << (init_bits - 1);
    EOFCode = ClearCode + 1;
    free_ent = ClearCode + 2;

    a_count = 0; // clear packet

    ent = nextPixel();

    hshift = 0;
    for (fcode = HSIZE; fcode < 65536; fcode *= 2) ++hshift;
    hshift = 8 - hshift; // set hash code range bound
    hsize_reg = HSIZE;
    cl_hash(hsize_reg); // clear hash table

    output(ClearCode, outs);

    outer_loop: while ((c = nextPixel()) != EOF) {
      fcode = (c << BITS) + ent;
      i = (c << hshift) ^ ent; // xor hashing
      if (htab[i] === fcode) {
        ent = codetab[i];
        continue;
      } else if (htab[i] >= 0) { // non-empty slot
        disp = hsize_reg - i; // secondary hash (after G. Knott)
        if (i === 0) disp = 1;
        do {
          if ((i -= disp) < 0) i += hsize_reg;
          if (htab[i] === fcode) {
            ent = codetab[i];
            continue outer_loop;
          }
        } while (htab[i] >= 0);
      }
      output(ent, outs);
      ent = c;
      if (free_ent < 1 << BITS) {
        codetab[i] = free_ent++; // code -> hashtable
        htab[i] = fcode;
      } else {
        cl_block(outs);
      }
    }

    // Put out the final code.
    output(ent, outs);
    output(EOFCode, outs);
  }

  function encode(outs) {
    outs.writeByte(initCodeSize); // write "initial code size" byte
    remaining = width * height; // reset navigation variables
    curPixel = 0;
    compress(initCodeSize + 1, outs); // compress and write the pixel data
    outs.writeByte(0); // write block terminator
  }

  // Flush the packet to disk, and reset the accumulator
  function flush_char(outs) {
    if (a_count > 0) {
      outs.writeByte(a_count);
      outs.writeBytes(accum, 0, a_count);
      a_count = 0;
    }
  }

  function MAXCODE(n_bits) {
    return (1 << n_bits) - 1;
  }

  // Return the next pixel from the image
  function nextPixel() {
    if (remaining === 0) return EOF;
    --remaining;
    var pix = pixels[curPixel++];
    return pix & 0xff;
  }

  function output(code, outs) {
    cur_accum &= masks[cur_bits];

    if (cur_bits > 0) cur_accum |= (code << cur_bits);
    else cur_accum = code;

    cur_bits += n_bits;

    while (cur_bits >= 8) {
      char_out((cur_accum & 0xff), outs);
      cur_accum >>= 8;
      cur_bits -= 8;
    }

    // If the next entry is going to be too big for the code size,
    // then increase it, if possible.
    if (free_ent > maxcode || clear_flg) {
      if (clear_flg) {
        maxcode = MAXCODE(n_bits = g_init_bits);
        clear_flg = false;
      } else {
        ++n_bits;
        if (n_bits == BITS) maxcode = 1 << BITS;
        else maxcode = MAXCODE(n_bits);
      }
    }

    if (code == EOFCode) {
      // At EOF, write the rest of the buffer.
      while (cur_bits > 0) {
        char_out((cur_accum & 0xff), outs);
        cur_accum >>= 8;
        cur_bits -= 8;
      }
      flush_char(outs);
    }
  }

  this.encode = encode;
}
