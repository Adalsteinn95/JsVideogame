function Player(descr) {
    for (var property in descr) {
        this[property] = descr[property];
    }
}
