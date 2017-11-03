"use strict";

var gameplayManager = {

    lock : false,

    keyLock : function() {
        return this.lock;
    }

    _players : [],

    initGame : function() {

    },

    playerSetup : function() {

    },

    addPlayer : function() {
        this._players.push(new Player(descr));
    },

    prompt : function() {

    }
}
