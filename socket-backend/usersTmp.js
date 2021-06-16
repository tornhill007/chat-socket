class UsersTmp {
    constructor() {
        this.usersTmp = []
    }

    add(user) {
        this.usersTmp.push(user)
    }

    get(id, socketId) {
        return this.usersTmp.find(user => user.id === id && user.socketId === socketId)
    }

    remove(id, socketId) {
        const user = this.get(id, socketId);
        if (user) {
            // this.usersTmp = this.usersTmp.findIndex(user => user.id )
            let index = this.usersTmp.findIndex(item => item.id === user.id && item.socketId === user.socketId)
            this.usersTmp.splice(index, 1);

            console.log(this.usersTmp)
            // filter(user => user.id !== id);
        }
        return user;
    }

    getByRoom(room) {
        console.log(room)
        return this.usersTmp.filter(user => user.room === room);
    }
}

module.exports = function () {
    return new UsersTmp();
}