class Store {
  constructor() {
    this.data = []
  }

  add(user) {
    this.data.push(user)
  }

  getByRoomId(id) {
    return this.data.find(room => room.id === id)
  }

  get(id, socketId) {
    return this.data.find(user => user.id === id && user.socketId === socketId)
  }

  getBySocketId(socketId) {
    return this.data.find(user => user.socketId === socketId)
  }

  getAll() {
    return this.data;
  }

  getAllById(id) {
    return this.data.filter(user => user.id === id);
  }

  remove(id, socketId) {
    const user = this.get(id, socketId);
    if (user) {
      let index = this.data.findIndex(item => item.id === user.id && item.socketId === user.socketId)
      this.data.splice(index, 1);
    }
    return user;
  }


  getById(id) {
    return this.data.find(user => user.id === id)
  }

  removeById(id) {
    const user = this.getById(id);
    let result;
    if (user) {
      let index = this.data.findIndex(item => item.id === user.id)
      result = this.data.splice(index, 1);
    }
    return result;
  }

  removeConnectedUserById(id) {
    const user = this.getBySocketId(id);
    if (user) {
      this.data = this.data.filter(user => user.socketId !== id);
    }
    return user;
  }

  removeByRoomId(id) {
    const room = this.getById(id);
    if (room) {
      this.data = this.data.filter(room => room.id !== id);
    }
    return room;
  }

  getByRoom(room) {
    return this.data.filter(user => user.room === room);
  }
}

module.exports = function () {
  return new Store();
}