import {io} from "socket.io-client";
import React from "react";
import {NavLink, Redirect} from "react-router-dom";
import {connect} from "react-redux";
import {generateUID} from "../../utils/generateUID";
import {setInRoom, setRooms, setSocket, setUsersToRoom} from "../../redux/reducers/socketReducer";


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
        socket.connect();
        socket.emit("getRooms", {}, (data) => {
        })

        socket.on("getAllRooms", (data) => {
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

        socket.on("updateUsers", (data) => {
            console.log("[USERS]", data);
            this.setUsersToRoom(data);
        })



    }

    getRooms = () => {
        this.props.socket.emit("getRooms")
    }

    // getUsers = () => {
    //     this.props.socket.on("updateUsers", (data) => {
    //         console.log("USSSEERS", data);
    //     })
    // }


    render() {
        console.log(this.props.socket)
        console.log("[IN_ROOM]", this.props.inRoom)

        if (!this.props.token) {
            return <Redirect to='/login'/>
        } else return (
            <div>
<div onClick={() => {this.getRooms()}}>
    getRooms
</div>
                <div onClick={() => {this.getUsers()}}>
    getUSERS
</div>
                <div>
                    ROOMS LIST
                    {this.props.rooms.map(item => {
                        return <NavLink onClick={() => {this.props.setInRoom(true)}} to={`/game/${item.id}`}><div>
                            {item.id}
                        </div>
                        </NavLink>
                    })}
                </div>
                <NavLink onClick={() => {this.props.setInRoom(true)}} to={`/game/${generateUID()}`}>
                <div>
                    create room
                </div>
                    {/*<NavLink>*/}
                    {/*    Connect to room*/}
                    {/*</NavLink>*/}
                </NavLink>

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
    inRoom: state.socketPage.inRoom
})

// let AuthRedirectComponent = withAuthRedirect(Home);

export default connect(mapStateToProps, {setSocket, setInRoom, setUsersToRoom, setRooms})(Home);
