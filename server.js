// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var Game = require('./src/model/game');

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function() {
    console.log('Starting server on port 5000');
});

setInterval(function() {
    //io.sockets.emit('message', 'hi!');
}, 1000);

var players = {};
var games = {};

// Add the WebSocket handlers
io.on('connection', function(socket) {
    socket.on('new-player', function(username, fn) {
        players[socket.id] = { username: username, inGame: false};

        console.log(socket.id, players[socket.id]);

        fn(true);
    });

    socket.on('connect-to', function(opponentId) {

        console.log(socket.id + ' wants to play vs ' + opponentId);

        if(players[opponentId] != null && !players[opponentId].inGame && opponentId !== socket.id) {
            players[opponentId].inGame = true;
            players[socket.id].inGame = true;

            var gameId = opponentId.concat(socket.id);
            var newGame = new Game(opponentId, socket.id);
            games[gameId] = newGame;

            console.log(games[gameId]);


            //TODO maybe join socket room. for now ill just send individual messages, i think it will work

            io.to(opponentId).emit('game-on', gameId, newGame.isTurnOf(opponentId));
            io.to(socket.id).emit('game-on', gameId, newGame.isTurnOf(socket.id));

            console.log(socket.id + ' playing vs ' + opponentId);
        }
    });


    socket.on('played', function(gameId, cell) {

        var game = games[gameId];

        if (game) {
            var resultOfPlay = game.play(cell, socket.id);

            if (resultOfPlay >= 0) {
                console.log(socket.id + ' select cell ' + cell + ' in game ' + gameId);

                io.to(game.player1).emit('turn', game.board, cell, game.isTurnOf(game.player1));
                io.to(game.player2).emit('turn', game.board, cell, game.isTurnOf(game.player2));

                if (resultOfPlay === 1) {
                    console.log(socket.id + ' won!');
                    io.to(game.player1).emit('game-over', socket.id, game.player1Wins, game.player2Wins);
                    io.to(game.player2).emit('game-over', socket.id, game.player2Wins, game.player1Wins);
                }
            }
        }

    });


    socket.on('leave-game', function(gameId, playerId) {

        var game = games[gameId];

        if (game) {
            game.turn = socket.id;

            players[game.player1].inGame = false;
            players[game.player2].inGame = false;

            var otherPlayer = playerId === game.player1 ? game.player2 : game.player1;
            io.to(otherPlayer).emit('opponent-leave');
        }
    });

    socket.on('play-again', function(gameId, playerId) {
        var game = games[gameId];

        if (game) {

            if (game.player1 === playerId)
            {
                game.player1PlayAgain = true;
                io.to(game.player2).emit('opponent-play-again');
            }
            if (game.player2 === playerId) {
                game.player2PlayAgain = true;
                io.to(game.player1).emit('opponent-play-again');
            }
            console.log(playerId + " wants to play again");

            if (game.player1PlayAgain && game.player2PlayAgain) {
                players[game.player1].inGame = true;
                players[game.player2].inGame = true;

                game.reset();

                io.to(game.player1).emit('game-on', gameId, game.isTurnOf(game.player1));
                io.to(game.player2).emit('game-on', gameId, game.isTurnOf(game.player2));

                console.log(game.player1 + ' playing vs ' + game.player2);
            }
        }
    });
});
