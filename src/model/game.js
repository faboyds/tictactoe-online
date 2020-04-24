class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.turn = player1;
        this.board = ['','','','','','','','',''];
        this.player1PlayAgain = false;
        this.player2PlayAgain = false;
        this.player1Wins = 0;
        this.player2Wins = 0;
    }

    // return 1 if win, 0 if no win, -1 if invalid
    play(cell, player) {
        if(this.isTurnOf(player) && this.board[cell] === '') {
            this.board[cell] = player;
            this.toggleTurn();

            if(this.checkWin(player)) {
                player === this.player1 ? this.player1Wins++ : this.player2Wins++;
                return 1;
            }

            return 0;
        }
        return -1;
    }

    isTurnOf(player) {
        return this.turn === player;
    }

    toggleTurn() {
        this.turn = this.turn === this.player1 ? this.player2 : this.player1;
    }

    checkWin(cellValue) {
        if (this.board[0] == cellValue && this.board[1] == cellValue && this.board[2] == cellValue) return true;
        if (this.board[3] == cellValue && this.board[4] == cellValue && this.board[5] == cellValue) return true;
        if (this.board[6] == cellValue && this.board[7] == cellValue && this.board[8] == cellValue) return true;

        if (this.board[0] == cellValue && this.board[3] == cellValue && this.board[6] == cellValue) return true;
        if (this.board[1] == cellValue && this.board[4] == cellValue && this.board[7] == cellValue) return true;
        if (this.board[2] == cellValue && this.board[5] == cellValue && this.board[8] == cellValue) return true;

        if (this.board[0] == cellValue && this.board[4] == cellValue && this.board[8] == cellValue) return true;
        if (this.board[2] == cellValue && this.board[4] == cellValue && this.board[6] == cellValue) return true;
        return false;
    }

    reset() {
        this.board = ['','','','','','','','',''];
        this.player1PlayAgain = false;
        this.player2PlayAgain = false;
    }
}

module.exports = Game;
