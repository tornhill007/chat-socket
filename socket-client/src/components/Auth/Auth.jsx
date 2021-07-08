import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {generateUID} from "../../utils/generateUID";
import {setAuthUserData, setIsConnected} from "../../redux/reducers/authReducer";
import {io} from "socket.io-client";
import {
  setIdRoom,
  setInRoom, setIsSocket,
  setRooms,
  setSocket,
  setUsersToRoom,
  updateMessage
} from "../../redux/reducers/socketReducer";


class Auth extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isSocketExist: false,
    }
  }


  render() {

    if (!JSON.parse(sessionStorage.getItem('tabId'))) {
      let tabId = generateUID();
      window.sessionStorage.setItem("tabId", JSON.stringify(tabId))
    }

    if (this.props.token) {

      let socket;
      socket = io('http://192.168.1.229:8080/', {
        query: {
          tabId: JSON.parse(sessionStorage.getItem('tabId')),
          loggeduser: this.props.token
        }
      });

      socket.on("connect", () => {
        console.log("sockett_ID", socket.id)

        this.props.setSocket(socket);

      });

      socket.emit("rooms/get", {}, (data) => {
      })

      socket.on("rooms/getAll", (data) => {
        console.log("[ROOMS]", data);
        this.props.setRooms(data);
      })

      socket.on("disconnect/sendUserInfo", (data) => {
        console.log("ROOOOM_IDDDD", data);
        if (data) {
          this.props.setIdRoom(data);
          this.props.setInRoom(true);
        }
      })

      socket.on("users/update", (data) => {
        console.log("[USERS]", data);
        this.props.setUsersToRoom(data);
      })

      socket.on('rooms/generateId', (data) => {
        console.log("ID_ROOM", data)
        this.props.setIdRoom(data);
      })

    }

    if (!this.props.token) return <Redirect to={'/login'}/>

    if (this.props.token) {
      return <Redirect to={'/'}/>
    }
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
  isSocketExist: state.socketPage.isSocketExist,
})

export default connect(mapStateToProps, {
  setAuthUserData,
  setIsSocket,
  updateMessage,
  setUsersToRoom,
  setRooms,
  setInRoom,
  setIdRoom,
  setIsConnected,
  setSocket,
})(Auth);