import {authAPI} from "../../api/api";
import {reset} from "redux-form";

const SET_SOCKET = 'SET_SOCKET';
const SET_USERS_TO_ROOM = 'SET_USERS_TO_ROOM';
const SET_ROOMS = 'SET_ROOMS';
const SET_IN_ROOM = 'SET_IN_ROOM';

let initialState = {
    socket: null,
    users: [],
    rooms: [],
    inRoom: null
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SOCKET:
            return {
                ...state,
                socket: action.socket
            };
        case SET_ROOMS:
            return {
                ...state,
                rooms: action.rooms
            };
            case SET_IN_ROOM:
            return {
                ...state,
                inRoom: action.inRoom
            };
        case SET_USERS_TO_ROOM:
            console.log(action.users);
            return {
                ...state,
                ...state.users,
                users: action.users
            };
        default:
            return state;
    }
};

export const setSocket = (socket) => ({
    type: SET_SOCKET,
    socket
});

export const setUsersToRoom = (users) => ({
    type: SET_USERS_TO_ROOM,
    users
});

export const setRooms = (rooms) => ({
    type: SET_ROOMS,
    rooms
})

;export const setInRoom = (inRoom) => ({
    type: SET_IN_ROOM,
    inRoom
});


// export const login = (password, userName) => async (dispatch) => {
//     try {
//         let response = await authAPI.login(password, userName);
//         if (response.statusText === 'OK') {
//             dispatch(reset('register'))
//             let {userId, userName, token} = response.data;
//             dispatch(setAuthUserData(userId, userName, token));
//             let user = {
//                 userId,
//                 userName,
//                 token,
//                 timestamp: Date.now()
//             }
//             window.localStorage.setItem("user", JSON.stringify(user))
//         }
//         else {
//             let message = response.data.messages.length > 0 ? response.data.messages[0] : "Some error";
//         }
//     }
//     catch (err) {
//         console.log(err);
//     }
//
// };
//
// export const register = (password, userName, repeatPassword) => async (dispatch) => {
//     try {
//         if(password === repeatPassword) {
//             let response = await authAPI.register(password, userName);
//             if (response.statusText === 'OK') {
//                 dispatch(reset('register'))
//                 alert('you have registered')
//             } else {
//                 let message = response.data.messages.length > 0 ? response.data.messages[0] : "Some error";
//                 alert(message);
//             }
//         }
//         else {
//             alert("Password mismatch")
//         }
//
//     } catch (err) {
//         alert(err);
//     }
//
// };

export default authReducer;