class ConnectedUsers {
    constructor() {
        this.connectedUsers = []
    }

    add(user) {
        this.connectedUsers.push(user)
    }

    get(socketId) {
        return this.connectedUsers.find(user => user.socketId === socketId)
    }

    remove(id) {
        const user = this.get(id);
        if (user) {
            this.connectedUsers = this.connectedUsers.filter(user => user.id !== id);
        }
        return user;
    }

    // getByRoom(room) {
    //     return this.users.filter(user => user.room === room);
    // }
}

module.exports = function () {
    return new ConnectedUsers();
}