class ConnectedUsers {
    constructor() {
        this.connectedUsers = []
    }

    add(user) {
        this.connectedUsers.push(user)
    }

    get(socketId) {
        console.log(socketId)
        return this.connectedUsers.find(user => user.socketId === socketId)

    }

    getAll() {
        return this.connectedUsers;
    }

    remove(id) {
        const user = this.get(id);
        if (user) {
            this.connectedUsers = this.connectedUsers.filter(user => user.socketId !== id);
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