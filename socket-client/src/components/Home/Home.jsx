import {io} from "socket.io-client";
import React from "react";
import {NavLink, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {generateUID} from "../../utils/generateUID";
import {
  setIdRoom,
  setInRoom, setIsDisconnected,
  setIsMounted, setIsSocket,
  setRooms,
  setSocket,
  setUsersToRoom, updateMessage
} from "../../redux/reducers/socketReducer";
import {withRouter} from 'react-router-dom';
import classes from './Home.module.css';
import socket from '../../api/socket'
import {setAuthUserData} from "../../redux/reducers/authReducer";


class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      socket: null,
      roomInput: '',
    }
  }

  componentDidMount() {
    this.setState({
      socket: socket
    })
  }

  onChangeRoomInput = (e) => {
    this.setState({
      roomInput: e.target.value
    })
  }

  onCreateRoom = (roomId) => {
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

  logout = () => {
    window.localStorage.removeItem('user');
    // this.props.setAuthUserData(null, null, null);
    // this.props.setInRoom(null);
    // this.props.setIdRoom(null);
    this.props.history.push('/login')
  }

  render() {
    if (this.props.idRoom && this.props.inRoom) {
      return <Redirect to={{
        pathname: `/game/${this.props.idRoom}`,
        aboutProps: {
          socket: this.state.socket
        }
      }}/>
    } else return (
      <div>
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
          <div className={classes.itemCreate}>
            create room
          </div>

        </div>
        <div onClick={() => {
          this.logout()
        }}>LOG OUT
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
  isSocketExist: state.socketPage.isSocketExist,
  isDisconnected: state.socketPage.isDisconnected,
})

export default withRouter(connect(mapStateToProps, {
  setSocket,
  setIsMounted,
  setIdRoom,
  setInRoom,
  setUsersToRoom,
  setRooms,
  setIsSocket,
  updateMessage,
  setAuthUserData,
  setIsDisconnected,
})(Home));
