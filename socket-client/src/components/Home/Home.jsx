import {io} from "socket.io-client";
import React from "react";
import {NavLink, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {generateUID} from "../../utils/generateUID";
import {setIdRoom, setInRoom, setRooms, setSocket, setUsersToRoom} from "../../redux/reducers/socketReducer";
import {withRouter} from 'react-router-dom';


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


        const socket = io('http://192.168.1.229:8080/', {query:`loggeduser=${this.props.token}`});
        // socket.connect();
        socket.emit("rooms/get", {}, (data) => {
        })

        socket.on("rooms/getAll", (data) => {
            console.log("[ROOMS]", data);
            this.setRooms(data);

        })

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

        socket.on("users/update", (data) => {
            console.log("[USERS]", data);
            this.setUsersToRoom(data);
        })

        socket.on('rooms/generateId', (data) => {
            console.log("ID_ROOM", data)
            this.props.setIdRoom(data);
        })



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
        this.props.socket && this.props.socket.emit("users/joined", {userName: this.props.userName, id: this.props.token, room: {name: this.state.roomInput, id: roomId ? roomId : null}}, (data) => {
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


    render() {
        console.log(this.props.socket)
        console.log("[IN_ROOM]", this.props.inRoom)
        if(this.props.idRoom && this.props.inRoom) {
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
                        return <NavLink key={index} onClick={() => {this.props.setInRoom(true); this.onCreateRoom(item.id)}} to={`/game/${item.id}`}><div>
                            {item.name}
                        </div>
                        </NavLink>
                    })}
                </div>
                <div>
                    <input onChange={this.onChangeRoomInput} value={this.state.roomInput} type="text"/>
                </div>
                <div onClick={() => {this.props.setInRoom(true); this.onCreateRoom()}}>
                    {/*to={`/game/${generateUID()}`*/}
                <div>
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
    idRoom: state.socketPage.idRoom
})

// let AuthRedirectComponent = withAuthRedirect(Home);

export default withRouter(connect(mapStateToProps, {setSocket, setIdRoom, setInRoom, setUsersToRoom, setRooms})(Home));
