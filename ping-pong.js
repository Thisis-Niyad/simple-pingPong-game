//const canvas = document.getElementById("table");
//const ctx =canvas.getContext('2d');
//ctx.fillstyle='black';
//ctx.fillRect(0, 0,canvas.clientWidth,canvas.clientHeight);
//global declaration
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var rounds = [3, 3, 2, 1];
var colors = ['#labc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];

//the ball object (the cube that bounces back and forth)
var ball = {
    new: function (incrementedspeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedspeed || 7

        };
    }
};



//the ai object(the 2 lines that move up down)

var AI = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 8
        };
    }
};


var game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1400;

        this.canvas.height = 925;

        this.canvas.style.width = (this.canvas.with / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';

        this.player = AI.new.call(this, 'left');
        this.ai = AI.new.call(this, 'right');
        this.ball = ball.new.call(this);

        this.ai.speed = 5;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#8c52ff';

        Pong.menu();
        Pong.listen();
    },
    endGameMenu: function (text) {
        // change the canvas font selse{ize and color
        Pong.context.font = '45px courier New';
        Pong.context.fillStyle = this.color;
        //draw the rectangle behind the press any key to begin 
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );

        //change the color canvas
        Pong.context.fillStyle = '#ffffff';
        //draw the end game menu text (game over and winner)
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );

        setTimeout(function () {
            Pong = Object.assign({}, game);
            Pong.initialize();

        }, 3000);

    },
    menu: function () {
        //draw all the pong obejects in their current state
        Pong.draw();
        // change the canvs font size and color
        this.context.font = '50px courier New';
        this.context.fillStyle = this.color;
        //draw the rectangle behind the press any key to begin text
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
        //change the canvas color
        this.context.fillStyle = '#ffffff';

        //draw the press any key to begin text
        this.context.fillText('press any key to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15);

    },
    update: function () {
        if (!this.over) {
            //if the ball collides with the bound limits - correct the x and y coords
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            //MOVE PLAYER if they player move value was updated by a keyboard event 
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

            // on new serve start of each turn move the ball to the correct side
            //and randomie the directon to add some challenge .
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;

            }

            // if the player collides with the bound limits , update the x and y coords
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

            //move ball in intended direction based on movey and movex values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

            //handle ai up and down movement
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }

            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
            //handle ai wall collision
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;

            else if (this.ai.y <= 0) this.ai.y = 0;

            //handle player-ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                }
            }
            //handle ai ball collision
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                }
            }

        }
        //handle the end of round transition
        //check to see if the playe rwon the round 
        if (this.player.score === rounds[this.round]) {

            //check to see if there are more rounds left and display the victory scree if there are not
            if (!rounds[this.round + 1]) {
                this.over = true;
                setTimeout(function () { Pong.endGameMenu('winner!'); }, 1000);
            } else {
                //if there is anothere round ,reset all the values and icreament the rouds number
                this.color = this._generateRoundColor();
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
            }
        }
        // check to see if the ai has won the round
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('game over!'); }, 1000);
        }
    },
    //draw the objects to the canvas element
    draw: function () {
        //clear the canvas
        this.context.clearRect(
            0, 0,
            this.canvas.width,
            this.canvas.height
        );
        //set the fill dtyle to black
        this.context.fillStyle = this.color;
        //draw the back ground                                      
        this.context.fillRect(
            0,
            0,

            this.canvas.width,
            this.canvas.height
        );
        //set the fill style to white for the paddles and the ball
        this.context.fillStyle = '#ffffff';

        //draw the player  
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );

        //draw the ai
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height
        );
        // draw the ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
        //draw the net line unt middle 
        this.context.beginPath();
        this.context.setLineDash([40, 20]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 5;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        //set hte default canvas font and align it to the center
        this.context.font = '100px courier New';
        this.context.textAlign = 'center';

        //draw the player score left
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200

        );
        //draw the paddles score right
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
        //change the font size for the center score text
        this.context.font = '30px courier New';
        //draw the winng score center
        this.context.fillText(
            'round' + (Pong.round + 1),
            (this.canvas.width / 2),
            35
        );
        //change the font size for the center score value
        this.context.font = '40px courier';

        //draw the current round number
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );

    },
    loop: function () {
        Pong.update();
        Pong.draw();

        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function () {
        document.addEventListener('keydown', function (key) {
            //handle
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
            //handle up arrow
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

            //handle down 
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;

        });

        //stop the plyer from move
        document.addEventListener('keyup', function (key) {
            Pong.player.move = DIRECTION.IDLE;
        });
    },

    //reset the location ,the player turns
    _resetTurn: function (victor, loser) {
        this.ball = ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();

        victor.score++;
    },


    //wait for a delay to have passed after each turn
    _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);

    },

    //select a random
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }

};
var Pong = Object.assign({}, game);
Pong.initialize();
