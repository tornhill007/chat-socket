import {io} from "socket.io-client";
import React from "react";
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import classes from './Game.module.css';
import {
  getRoomHistory,
  resetRoomHistory, setIdRoom,
  setInRoom,
  setIsMounted, setIsSocket, setSocket,
  updateMessage
} from "../../redux/reducers/socketReducer";


class Home extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      textInput: '',
    }
  }

  onExitFromRoom = (userId) => {
    this.props.socket && this.props.socket.emit("users/left", () => {
      // this.props.setIsSocket(false)
      this.props.setInRoom(null);
      this.props.setIdRoom(null);
      // this.props.setIsSocket(true);
      // this.props.resetRoomHistory()
      // this.props.setIsMounted(false)
      // this.props.setSocket(null)
      // window.location.reload();
    })
  }


  componentDidUpdate(prevProps, prevState, snapshot) {

    prevProps.socket && prevProps.socket.off('messages/new');
    this.props.socket && this.props.socket.off("messages/new")
      this.props.socket && this.props.socket.on("messages/new", (data) => {
        console.log("[DATA1]", data);
        setTimeout(() => {
          this.props.updateMessage(data, this.props.userName)
        }, 100)
      })


    // this.props.setIsSocket(true)

  }




  componentDidMount() {



    this.props.resetRoomHistory()
    this.props.getRoomHistory(this.props.match.params.gameId, this.props.userName);

    this.props.socket && this.props.socket.on("allUsersInRoom", (data) => {
      console.log("[USERS]", data);
    })

    this.props.socket && this.props.socket.on("connecting/redirectFromRoom", (data) => {
      console.log("[REDIRECT_DATA]", data);
     alert(data);
      this.props.setInRoom(false);
      this.props.setIdRoom(null);
    })
    this.props.setIsMounted()
  }

  componentWillUnmount() {
    // this.props.setIsSocket(false)
    if (this.props.socket) {
      this.props.socket.off('messages/new');
      this.props.socket.off('allUsersInRoom');
    }
  }

  onChangeTextInput = (e) => {
    this.setState({
      textInput: e.target.value
    })
  }


  onAddMessage = () => {
    this.props.socket && this.props.socket.emit("createMessage", {message: this.state.textInput}, (data) => {
      console.log(['data'], data)
      console.log(['data'], this.props.socket.id)
    });
  }

  render() {
    if (this.props.inRoom === false || this.props.inRoom === null) {
      return <Redirect to='/'/>
    }
      return (
      <div>
        <div onClick={() => {
          this.onAddMessage()
        }}>Add message
        </div>
        <div>
          <input onChange={this.onChangeTextInput} value={this.state.textInput} type="text"/>
        </div>
        <div>
          <button onClick={() => {
            this.onExitFromRoom(this.props.token)
          }}>EXIT
          </button>
        </div>
        <div className={classes.wrapUsers}>
          <div>
            USERS IN ROOM
          </div>
          <div>
            {this.props.users.map((item, index) => {
              return <div key={index}>{item.username}</div>
            })}
          </div>
        </div>
        <div className={classes.wrapWrapper}>
          <div className={classes.wrapMessages}>
            {this.props.roomHistory.map((item, index) => {
              return this.props.userName !== item.name ? <div key={index}>
                <div
                  className={`${item.name === 'admin' ? classes.itemLeft : classes.itemLeftUser}`}>[{item.name}] {item.text}</div>
              </div> : <div key={index}>
                <div className={classes.itemRight}>{item.text} [{item.name}]</div>
              </div>
            })}
          </div>
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
  inRoom: state.socketPage.inRoom,
  roomHistory: state.socketPage.roomHistory,
  isMounted: state.socketPage.isMounted,
  isSocketExist: state.socketPage.isSocketExist,
})

// let AuthRedirectComponent = withAuthRedirect(Home);

export default withRouter(connect(mapStateToProps, {
  setInRoom,
  setIdRoom,
  setIsMounted,
  updateMessage,
  resetRoomHistory,
  getRoomHistory,
  setIsSocket,
  setSocket
})(Home));
