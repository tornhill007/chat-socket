class Users {
  constructor() {
    this.users = []
  }

  add(user) {
    this.users.push(user)
  }

  get(id, socketId) {
    return this.users.find(user => user.id === id && user.socketId === socketId )
  }

  getAllById(id) {
    return this.users.filter(user => user.id === id)
  }

  remove(id, socketId) {
    const user = this.get(id, socketId);
    if (user) {
      let index = this.users.findIndex(item => item.id === user.id && item.socketId === user.socketId)
      this.users.splice(index, 1);
      // this.users = this.users.filter(user => user.id !== id && user.socketId !== socketId);
    }
    return user;
  }

  removeByIndexAndSocketId(id, socketId) {
    let user = this.get(id, socketId);
    if (user) {
      let index = this.users.findIndex(item => item.id === id && item.socketId === socketId)
      // if(index === -1) {
      //   index = this.users.findIndex(item => item.id === id)
      // }
      let result = this.users.splice(index, 1);
      // this.users = this.users.filter(user => user.id !== id && user.socketId !== socketId);
      return result;
    }
    else {
      user = this.getById(id);
      let index = this.users.findIndex(item => item.id === id)
      let result = this.users.splice(index, 1);
      return result;
    }

  }

  getById(id) {
    return this.users.find(user => user.id === id)
  }

  removeById(id) {
    const user = this.getById(id);
    let result;
    if (user) {
      // this.users = this.users.filter(user => user.id !== id);
      let index = this.users.findIndex(item => item.id === user.id)
      result = this.users.splice(index, 1);
      console.log(result)
      // this.users = this.users.filter(user => user.id !== id && user.socketId !== socketId);
    }
    return result;
  }

  getByRoom(room) {
    console.log(room)
    return this.users.filter(user => user.room === room);
  }
}

module.exports = function () {
  return new Users();
}