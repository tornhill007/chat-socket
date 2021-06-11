import {io} from "socket.io-client";
import React from "react";
import {Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import classes from './Game.module.css';
import {setInRoom} from "../../redux/reducers/socketReducer";


class Home extends React.Component {

    constructor(props) {
        super(props);

        // this.props.setInRoom(true);

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
        // setMsg(newMsg)
        // alert(5)
        // console.log(allMsg)
    }

    onExitFromRoom = (userId) => {
        this.props.socket.emit("leftUser", userId, () => {
            console.log("USER LEFT ROOM");
            this.props.setInRoom(false);
        })
    }

    componentDidMount() {

        this.onCreateRoom();

        // this.props.setInRoom(true);

        this.props.socket.on("newMessage", (data) => {
            console.log("[DATA]", data);
            this.setMessage(data)
            // setMsg(newMsg);
            // let newMsg = [...allMsg];
            // newMsg.push(data.msg)
            // setMsg(newMsg)

        })

        // socket.on("newMessage", (data) => {
        //     console.log("[MESSAGE]", data);
        // })

        this.props.socket.on("allUsersInRoom", (data) => {
            console.log("[USERS]", data);
        })
    }
    //
    // onEmit = () => {
    //     this.state.socket.emit("send message", "TEST");
    // }

    onChangeTextInput = (e) => {
        this.setState({
            textInput: e.target.value
        })
    }

    onChangeRoomInput = (e) => {
        this.setState({
            roomInput: e.target.value
        })
    }
    onChangeRoomId = (e) => {
        this.setState({
            roomId: e.target.value
        })
    }

    onAddMessage = () => {
        this.props.socket.emit("createMessage", {message: this.state.textInput, id: this.props.token}, (data) => {
            console.log(['data'], data)
        });
    }

    onCreateRoom = () => {
        this.props.socket.emit("userJoined", {userName: this.props.userName, id: this.props.token, room: {name: this.state.roomInput, id: this.props.match.params.gameId}}, (data) => {
            if(typeof data === 'string') {
                console.error(data);
            }
            else {
                let user = Object.assign({}, this.state.user)
                user.user.userId = data.userId;
                this.setState({
                    user
                })
            }
        })
    }

    onGetRooms = () => {

    }

    render() {
        console.log(this.state.user)
        console.log("123", this.props.users)
        console.log(this.props)
        if(this.props.inRoom === false) {

            return <Redirect to='/'/>
        }
        if (!this.props.token) {
            return <Redirect to='/login'/>
        } else return (
            <div>
                <div onClick={() => {this.onGetClients()}}>
                    CLIENTS
                </div>
                <div onClick={() => {
                    this.onAddMessage()
                }}>Add message
                </div>
                <div>
                    <input onChange={this.onChangeTextInput} value={this.state.textInput} type="text"/>
                </div>
                <div>
                    <button onClick={() => {this.onExitFromRoom(this.props.token)}}>EXIT</button>
                </div>
                {/*<div onClick={() => {this.onCreateRoom()}}>*/}
                {/*    create room*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*    <input onChange={this.onChangeRoomInput} value={this.state.roomInput} type="text"/>*/}
                {/*</div>*/}

                {/*<div>*/}
                {/*    <input placeholder={"id"} onChange={this.onChangeRoomId} value={this.state.roomId} type="text"/>*/}
                {/*</div>*/}
<div onClick={() => {this.onGetRooms()}}>
    GET ROOMS
</div>
                <div className={classes.wrapUsers}>
                    <div>
                        USERS IN ROOM
                    </div>
                    <div>
                    {this.props.users.map(item => {
                        return <div>{item.name}</div>
                    })}
                    </div>
                </div>
                <div className="App">
                    {this.state.allMsg.map((item, index) => {
                        return <div key={index}>{item.name} {item.text}</div>
                    })}
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
})

// let AuthRedirectComponent = withAuthRedirect(Home);

export default withRouter(connect(mapStateToProps, {setInRoom})(Home));
