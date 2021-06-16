class Rooms {
    constructor() {
        this.rooms = []
    }

    add(room) {
        this.rooms.push(room)
    }

    get(id) {
        return this.rooms.find(room => room.id === id)
    }

    getAllRooms() {
        return this.rooms;
    }

    remove(id) {
        const room = this.get(id);
        if (room) {
            this.rooms = this.rooms.filter(room => room.id !== id);
        }
        return room;
    }

    // getByRoom(room) {
    //     return this.users.filter(user => user.room === room);
    // }
}

module.exports = function () {
    return new Rooms();
}