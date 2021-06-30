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
    setIsMounted,
    updateMessage
} from "../../redux/reducers/socketReducer";


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
        this.props.socket && this.props.socket.emit("users/left", () => {
            console.log("USER LEFT ROOM");
            this.props.setInRoom(false);
            this.props.setIdRoom(null);
            this.props.resetRoomHistory()
        })
    }

    componentDidMount() {
        this.props.resetRoomHistory()
        this.props.getRoomHistory(this.props.match.params.gameId, this.props.userName);

        // setTimeout(() => {
        //     this.setState({
        //         allMsg: this.props.roomHistory
        //     })
        // }, 100)

        // {this.props.socket && !this.props.inRoom && this.onCreateRoom()}

        // this.props.setInRoom(true);

            this.props.socket && this.props.socket.on("messages/new", (data) => {
                console.log("[DATA]", data);
                // this.setMessage(data)
                setTimeout(() => {
                    this.props.updateMessage(data, this.props.userName)
                }, 100)

            })

            // socket.on("newMessage", (data) => {
            //     console.log("[MESSAGE]", data);
            // })
            this.props.socket && this.props.socket.on("allUsersInRoom", (data) => {
                console.log("[USERS]", data);
            })

            this.props.setIsMounted()



    }

    componentWillUnmount() {
        if(this.props.socket) {
            this.props.socket.off('messages/new');
            this.props.socket.off('allUsersInRoom');
        }
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
        this.props.socket && this.props.socket.emit("createMessage", {message: this.state.textInput}, (data) => {
            console.log(['data'], data)
        });
    }

    onCreateRoom = () => {
        this.props.socket && this.props.socket.emit("users/joined", {userName: this.props.userName, id: this.props.token, room: {name: this.state.roomInput, id: this.props.match.params.gameId ? this.props.match.params.gameId : null}}, (data) => {
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
        console.log("[USERSS]", this.props.users)
        console.log("[roomHistory]", this.props.roomHistory)
        console.log('[allMsg]', this.state.allMsg)
        if(this.props.inRoom === false || this.props.inRoom === null) {
            return <Redirect to='/'/>
        }
        if (!this.props.token) {
            return <Redirect to='/login'/>
        } else return (
            <div>
                {/*<div onClick={() => {this.onGetClients()}}>*/}
                {/*    CLIENTS*/}
                {/*</div>*/}
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
{/*<div onClick={() => {this.onGetRooms()}}>*/}
{/*    GET ROOMS*/}
{/*</div>*/}
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
                        console.log(this.props.userName, item.name)
                        return this.props.userName !== item.name ? <div key={index}><div className={`${item.name === 'admin' ? classes.itemLeft : classes.itemLeftUser}`}>[{item.name}] {item.text}</div></div> : <div  key={index}><div className={classes.itemRight}>{item.text} [{item.name}]</div></div>
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
})

// let AuthRedirectComponent = withAuthRedirect(Home);

export default withRouter(connect(mapStateToProps, {setInRoom, setIdRoom, setIsMounted, updateMessage, resetRoomHistory, getRoomHistory})(Home));
