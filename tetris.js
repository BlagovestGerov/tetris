let canvas = document.getElementById('board');
let ctx = canvas.getContext("2d");
let linecount = document.getElementById('lines');
let clear = window.getComputedStyle(canvas).getPropertyValue('background-color');
let width = 10;
let height = 20;
let tilesz = 24;

canvas.width = width * tilesz;
canvas.height = height * tilesz;

let board = [];
for ( let r = 0; r < height; r++){
    board[r] = [];
    for (let c = 0; c < width; c++){
        board[r][c] = "";
    }
}

function newPiece(){
    let p = pieces[parseInt(Math.random() * pieces.length, 10)];
    return new Piece(p[0], p[1]);
}

function drawSquare(x, y){
    ctx.fillRect(x * tilesz, y * tilesz, tilesz, tilesz);
    let ss = ctx.strokeStyle;
    ctx.strokeStyle = "#555";
    ctx.strokeRect(x * tilesz, y * tilesz, tilesz, tilesz);
    ctx.strokeStyle = "#888";
    ctx.strokeRect(x * tilesz + 3 * tilesz/8, y * tilesz + 3 * tilesz/8, tilesz/4, tilesz/4);
    ctx.strokeStyle = ss;
}

function Piece(patterns, color){
    this.pattern = patterns[0];
    this.patterns = patterns;
    this.patterni = 0;

    this.color = color;

    this.x = width/2 - parseInt(Math.ceil(this.pattern.length/2), 10);
    this.y = -2;
}

Piece.prototype.rotate = function(){
    let nudge = 0;
    let nextpat = this.patterns[(this.patterni + 1) % this.patterns.length];

    if(this._collides(0, 0, nextpat)){
        //check kickback
        nudge = this.x > width / 2 ? -1 : 1;
    }

    if(!this._collides(nudge, 0, nextpat)){
        this.undraw();
        this.x += nudge;
        this.patterni = (this.patterni + 1) % this.patterns.length;
        this.pattern = this.patterns[this.patterni];
        this.draw();
    }

};

    let WALL = 1;
    let BLOCK = 2;
    Piece.prototype._collides = function(dx, dy, pat){
        for(let ix=0; ix < pat.length; ix++){
            for ( let iy = 0; iy < pat.length; iy++){
                if(!pat[ix][iy]){
                    continue;
                }

                let x = this.x + ix + dx;
                let y = this.y + iy + dy;
                if(y >= height || x < 0 || x >= width){
                    return WALL;
                }
                if(y < 0){
                    //Ignore negative space rows
                    continue;
                }
                if(board[y][x] !== ""){
                    return BLOCK;
                }
            }
        }
        return 0;
    };
    
    Piece.prototype.down = function(){
        if(this._collides(0, 1, this.pattern)){
            this.lock();
            piece = newPiece();
        }else{
            this.undraw();
            this.y++;
            this.draw();
        }
    };

    Piece.prototype.moveRight = function(){
        if(!this._collides(1, 0, this.pattern)){
            this.undraw();
            this.x++;
            this.draw();
        }
    };

    Piece.prototype.moveLeft = function(){
        if(!this._collides(-1, 0, this.pattern)){
            this.undraw();
            this.x--;
            this.draw();
        }
    };

    let lines = 0;
    let score = 0;
    let done = false;
      
    Piece.prototype.lock = function(){
          for(let ix = 0; ix < this.pattern.length; ix++){
              for(let iy = 0; iy < this.pattern.length; iy++){
                  if(!this.pattern[ix][iy]){
                      continue;
                  }

                  if(this.y + iy < 0){
                      //Game end!
                      alert("You're done!");
                      done = true;
                      return;
                  }
                  board[this.y + iy][this.x + ix] = this.color;
              }
          }
          let nlines = 0;
          for(let y = 0; y < height; y++){
            let line = true; 
            for (let x = 0; x < width; x++){
                  line = line && board[y][x] !== "";
              }
              if(line){
                  for(let y2 = y; y2 > 1; y2--){
                      for(let x = 0; x < width; x++){
                      board[y2][x] = board[y2 - 1][x];
                  }
              }
              for(let x = 0; x < width; x++){
                  board[0][x] = "";
              }
              nlines++;
          }
      }
      if(nlines > 0){
          lines += nlines;
          score += nlines * 100
          drawBoard();
        //   linecount.textContent = "Lines: " + lines;
          linecount.textContent = "Score: " + score;          
      }

};

Piece.prototype._fill = function(color){
    let fs = ctx.fillStyle;
    ctx.fillStyle = color;
    let x = this.x;
    let y = this.y;
    for(let ix = 0; ix < this.pattern.length; ix++){
        for(let iy = 0; iy < this.pattern.length; iy++){
            if(this.pattern[ix][iy]){
                drawSquare(x + ix, y + iy);
            }
        }
    }
    ctx.fillStyle = fs;
};

Piece.prototype.undraw = function(ctx){
    this._fill(clear);
};

Piece.prototype.draw = function(ctx){
    this._fill(this.color);
};

let pieces = [
    [I, "cyan"],
    [J, "blue"],
    [L, "orange"],
    [O, "yellow"],
    [S, "green"],
    [T, "purple"],
    [Z, "red"]
];

let piece = null;

let dropStart = Date.now();
let downI = {};

document.body.addEventListener("keydown", function(e){
    if(downI[e.keyCode] !== null){
        clearInterval(downI[e.keyCode]);
    }
    key(e.keyCode);
    downI[e.keyCode] = setInterval(key.bind(this, e.keyCode), 200);
    }, false);
    document.body.addEventListener("keyup", function(e){
        if(downI[e.keyCode] !== null){
            clearInterval(downI[e.keyCode]);
        }
        downI[e.keyCode] = null;
    }, false);

    function key(k){
        if(done){
            return;
        }
        if( k == 38 ){ //Player pressed up
            piece.rotate();
            dropStart = Date.now();
        }
        if( k == 40 ){
            //Player holding down
            piece.down();
        }
        if(k == 37 ){
            //Player holding left
            piece.moveLeft();
            dropStart = Date.now();
        }
        if( k == 39){
            //Player holding right
            piece.moveRight();
            dropStart = Date.now();
        }
    }

    function drawBoard(){
        let fs = ctx.fillStyle;
        for( let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                ctx.fillStyle = board[y][x] || clear;
                drawSquare(x, y, tilesz, tilesz);
            }
        }
        ctx.fillStyle = fs;
    }

    let speed = 1000

    
   function main() {
	let now = Date.now();
    let delta = now - dropStart;
    let score = -1;


    if (lines > 10 ){

        lines = lines % 10
        speed = speed - 100;
        
    }

	if (delta > speed) {
		piece.down();
		dropStart = now;
	}

	if (!done) {
		requestAnimationFrame(main);
	}
}


    piece = newPiece();
    drawBoard();
    linecount.textContent = "Score: 0";
    main();















