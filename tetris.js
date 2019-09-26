const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");

const ROW = 20;
const COL = 10;
const SQ  = 20; //squareSize
const EMPTY = "white"; // color of an empty square
let score = 0;
let topScore = 0;
let z = 0;

if (localStorage.topScr) {    
    topScore = Number(localStorage.topScr);
    document.getElementById("tops").innerHTML = "Top Score : " + topScore;
} else {
    document.getElementById("tops").style.visibility = "hidden";
}

// draw a new square
function drawSquare(x, y, sqColour) {
    ctx.fillStyle = sqColour;
    ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ); 
}

// create and draw the game board
let board = [];

for (r=0;r<ROW;r++) {
    board[r]=[]
    for (c=0;c<COL;c++) {
        board[r][c]=EMPTY;
    }
}

function drawBoard() {
    for (r=0; r<ROW; r++) { 
        for (c=0; c<COL; c++) {
            drawSquare(c, r, board[r][c])
        }
    }
}

drawBoard();

// the pieces and their colors

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];


// Piece object

function Piece(tetromino,color) {
    this.tetromino = tetromino;
    this.color = color;
    this.pieceLocked = false;
    
    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // first coordinates
    this.x = 3;  //3
    this.y = -2;  //-2
}

// generating a random new piece

function randomPiece() {
    let rand = Math.floor(Math.random() * 7);
    return new Piece(PIECES[rand][0],PIECES[rand][1]);
}
var p = randomPiece();


// draw the piece to the board

Piece.prototype.drawPiece = function() {
    for( r = 0; r < p.activeTetromino.length; r++){
        for(c = 0; c < p.activeTetromino.length; c++){
            // we draw only occupied squares
            if( p.activeTetromino[r][c]){
                drawSquare(p.x + c,p.y + r, p.color);
            }
        }
    }
}

p.drawPiece();

// delete the piece
Piece.prototype.deletePiece = function() {
    for( r = 0; r < p.activeTetromino.length; r++){
        for(c = 0; c < p.activeTetromino.length; c++){
            // we draw only occupied squares
            if( p.activeTetromino[r][c]){
                drawSquare(p.x + c,p.y + r, EMPTY);
            }
        }
    }
}

//moving the piece

document.addEventListener("keydown",CONTROL);

function CONTROL(event) {
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

Piece.prototype.lock = function() {

    for( r = 0; r < p.activeTetromino.length; r++){
        for( c = 0; c < p.activeTetromino.length; c++){        
        
            if (p.activeTetromino[r][c]){
               if (this.y + r <= 0) {
                    gameOver = true;
                    document.getElementById("status").innerHTML = "Game Over";
                    document.getElementById("butt").style.visibility="visible";
                    if (score > topScore){
                        localStorage.topScr = score;
                        document.getElementById("tops").innerHTML = "Top Score : " + score;
                    }
                } else {
                   board[this.y + r][this.x + c] = this.color;
                }
            }     
        }
    }

    p.pieceLocked = true;
    
}

// move down

Piece.prototype.moveDown = function() {

    for( r = p.activeTetromino.length - 1; r >= 0; r--) {
        for( c = 0; c < p.activeTetromino.length; c++) {        
        
            if (p.activeTetromino[r][c]) {
               if (this.y + r + 1 == ROW){
                   p.lock();
                   break;
               } 
            } 
        }
        if(p.pieceLocked) {
            break;
        }
    }

    if (!p.pieceLocked) {
        for( r = p.activeTetromino.length - 1; r >= 0; r--){
            for( c = 0; c < p.activeTetromino.length; c++){        
            
                if (p.activeTetromino[r][c] && this.y + r + 1 >= 0) {
                    if (board[this.y + r + 1][this.x + c] != EMPTY) {
                        p.lock();
                        break;
                    }   
                } 
            }
            if(p.pieceLocked){
                break;
            }
        }
    }
    
    if (!p.pieceLocked) {
        p.deletePiece();
        this.y++;
        p.drawPiece();
    } else if(!gameOver) {
        p.delLines();
        p = randomPiece();
    }

}

Piece.prototype.delLines = function() {
    
    function checkColor(rColor){
        return rColor != EMPTY;
    }

    for (r=ROW - 1; r>=0; r--) { 
          if (board[r].every(checkColor)) {
            for (r2=r; r2>=1; r2--) {
                board[r2]=board[r2-1];
                r = ROW;
            }
            score += 10;
            if (score % 50 == 0) {
                sec = (sec>200) ? sec-100:200;
            }
            document.getElementById("score").innerHTML = score;
          }
    }
    
    drawBoard();
    
}
// move left

Piece.prototype.moveLeft = function() {

    let skip = false;
    if (this.y<0) {
        skip=true;
    } else{
        for( c = 0; c < p.activeTetromino.length; c++){        
            for( r = 0; r < p.activeTetromino.length; r++){
        
                if (p.activeTetromino[r][c]){
                    
                    if (board[this.y + r][this.x + c - 1] != EMPTY) {
                        skip = true;
                        break;
                    }   
                } 
            }
            if(skip){
                break;
            }
        }
    }

    if (!skip) {
        p.deletePiece();
        this.x--;
        p.drawPiece();
    }

}

// move right

Piece.prototype.moveRight = function() {

    let skip = false;

    if (this.y<0) {
        skip=true;
    } else{
        for( c = p.activeTetromino.length - 1; c >=0; c--){        
            for( r = 0; r < p.activeTetromino.length; r++){
        
                if (p.activeTetromino[r][c]){
                    
                    if (board[this.y + r][this.x + c + 1] != EMPTY) {
                        skip = true;
                        break;
                    }   
                } 
            }
            if(skip){
                break;
            }
        }
    }

    if (!skip) {
        p.deletePiece();
        this.x++;
        p.drawPiece();

    }    
}

// rotate the piece

Piece.prototype.rotate = function() {

    p.deletePiece();
    p.tetrominoN++; // next pattern
    if(p.tetrominoN==p.tetromino.length){
        p.tetrominoN=0;
    }
    p.activeTetromino = p.tetromino[p.tetrominoN];
    p.drawPiece();

    if (this.x < 0) {       
        p.deletePiece();
        this.x = cancelLeft(this.x);
        p.drawPiece();
    }
    
    function cancelLeft(k){
        
        if (k == -1) {
            c = 0;
            cor = 0;
        } else {
            c = 1;
            cor = 1;
        }

        for( r = 0; r < p.activeTetromino.length; r++){
            
            if( p.activeTetromino[r][c]){
                cor++;                    
                break;
            } 
        }
        
        k += cor;
        return k;
    } 


    if (this.x + p.activeTetromino.length - 1 == COL || this.x + p.activeTetromino.length - 2 == COL) {       
        p.deletePiece();
        this.x = cancelRight(this.x);
        p.drawPiece();
    }
    
    function cancelRight(k){
        
        if(k + p.activeTetromino.length - 1 == COL){
            cor = 0;
            c = p.activeTetromino.length-1;
        } else if (k + p.activeTetromino.length - 2 == COL){
            cor = 1;
            c = p.activeTetromino.length - 2;
        }

        for( r = 0; r < p.activeTetromino.length; r++){
            
            if ( p.activeTetromino[r][c]) {
                cor++;                    
                break;
            } 
        }
        
        k -= cor;
        return k;
    } 

}

let dropStart = Date.now();
let gameOver = false;
let sec = 800;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > sec){
        p.moveDown();
        dropStart = Date.now();
    }
     if( !gameOver){
        requestAnimationFrame(drop);
    } 
}

drop();
