import {io} from "socket.io-client";
import React from "react";
import {NavLink, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {generateUID} from "../../utils/generateUID";
import {
  setIdRoom,
  setInRoom,
  setIsMounted,
  setRooms,
  setSocket,
  setUsersToRoom
} from "../../redux/reducers/socketReducer";
import {withRouter} from 'react-router-dom';
import classes from './Home.module.css';
import socket from '../../api/socket'


class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      socket: null,
      allMsg: [],
      textInput: '',
      roomInput: '',
      roomId: '',
      user: {
        user: {
          userName: "Andrew",
          id: 555
        },
        room: {
          id: 123,
          roomName: "New Game"
        }
      }
    }
  }


  setMessage = (data) => {
    console.log(this.state.allMsg)
    let newMsg = [...this.state.allMsg];
    newMsg.push(data);
    // newMsg.push(5);
    this.setState({
      allMsg: newMsg
    })

  }

  setRooms = (rooms) => {
    this.props.setRooms(rooms);
  }

  setUsersToRoom = (users) => {
    this.props.setUsersToRoom(users);
  }


  componentDidMount() {

    let socket;
    // console.log("KEKEKE", this.props.isMounted)
    // if(!this.props.isMounted) {
    console.log("OLAOLALOLAOAL")
    // let token = JSON.parse(localStorage.getItem('user')).token;
    socket = io('http://192.168.1.229:8080/', {
      query: {
        tabId: JSON.parse(sessionStorage.getItem('tabId')),
        loggeduser: this.props.token
      }
    });
    // socket.connect();
    socket.emit("rooms/get", {}, (data) => {
    })

    socket.on("rooms/getAll", (data) => {
      console.log("[ROOMS]", data);
      this.setRooms(data);

    })

    socket.on("users/update", (data) => {
      console.log("[USERS]", data);
      this.setUsersToRoom(data);
    })

    socket.on('rooms/generateId', (data) => {
      console.log("ID_ROOM", data)

      this.props.setIdRoom(data);
    })
    // }
    //     this.props.setIsMounted();
    // }


    // let rooms = io.sockets.adapter.rooms;
    // console.log("ROOMS", rooms)
    this.setState({
      socket: socket
    })

    // socket.emit("allRooms", )

    this.props.setSocket(socket);

    // socket.on("newMessage", (data) => {
    //     console.log("[DATA]", data);
    //     this.setMessage(data)
    // })


  }

  getRooms = () => {
    this.props.socket.emit("rooms/get")
  }

  // getUsers = () => {
  //     this.props.socket.on("updateUsers", (data) => {
  //         console.log("USSSEERS", data);
  //     })
  // }

  onChangeRoomInput = (e) => {
    this.setState({
      roomInput: e.target.value
    })
  }

  onCreateRoom = (roomId) => {
    console.log("ROOM_ID", roomId)
    this.props.socket && this.props.socket.emit("users/joined", {
      room: {
        name: this.state.roomInput,
        id: roomId ? roomId : null
      }
    }, (data) => {
      if (typeof data === 'string') {
        console.error(data);
      } else {
        let user = Object.assign({}, this.state.user)
        user.user.userId = data.userId;
        this.setState({
          user
        })
      }
    })
  }


  render() {
    console.log(this.props.socket)
    console.log("[IN_ROOM]", this.props.inRoom)
    if (this.props.idRoom && this.props.inRoom) {
      return <Redirect to={`/game/${this.props.idRoom}`}/>
    }
    if (!this.props.token) {
      return <Redirect to='/login'/>
    } else return (
      <div>
        {/*<div onClick={() => {this.getRooms()}}>*/}
        {/*    getRooms*/}
        {/*</div>*/}
        {/*                <div onClick={() => {this.getUsers()}}>*/}
        {/*    getUSERS*/}
        {/*</div>*/}
        <div>
          ROOMS LIST
          {this.props.rooms.map((item, index) => {
            return <NavLink key={index} onClick={() => {
              this.props.setInRoom(true);
              this.onCreateRoom(item.roomid)
            }} to={`/game/${item.roomid}`}>
              <div>
                {item.roomname}
              </div>
            </NavLink>
          })}
        </div>
        <div>
          <input onChange={this.onChangeRoomInput} value={this.state.roomInput} type="text"/>
        </div>
        <div onClick={() => {
          this.props.setInRoom(true);
          this.onCreateRoom()
        }}>
          {/*to={`/game/${generateUID()}`*/}
          <div className={classes.itemCreate}>
            create room
          </div>
          {/*<NavLink>*/}
          {/*    Connect to room*/}
          {/*</NavLink>*/}
        </div>

      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  userName: state.auth.userName,
  token: state.auth.token,
  socket: state.socketPage.socket,
  users: state.socketPage.users,
  rooms: state.socketPage.rooms,
  inRoom: state.socketPage.inRoom,
  idRoom: state.socketPage.idRoom,
  isMounted: state.socketPage.isMounted,
})

// let AuthRedirectComponent = withAuthRedirect(Home);

export default withRouter(connect(mapStateToProps, {
  setSocket,
  setIsMounted,
  setIdRoom,
  setInRoom,
  setUsersToRoom,
  setRooms
})(Home));
