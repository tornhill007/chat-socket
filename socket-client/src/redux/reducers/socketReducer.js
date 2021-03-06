import {authAPI, historyApi} from "../../api/api";
import {reset} from "redux-form";

const SET_SOCKET = 'SET_SOCKET';
const SET_USERS_TO_ROOM = 'SET_USERS_TO_ROOM';
const SET_ROOMS = 'SET_ROOMS';
const SET_IN_ROOM = 'SET_IN_ROOM';
const SET_ID_ROOM = 'SET_ID_ROOM';
const SET_ROOM_HISTORY = 'SET_ROOM_HISTORY';
const UPDATE_MESSAGE = 'UPDATE_MESSAGE';
const RESET_ROOM_HISTORY = 'RESET_ROOM_HISTORY';
const SET_IS_MOUNTED = 'SET_IS_MOUNTED';

let initialState = {
    socket: null,
    users: [],
    rooms: [],
    inRoom: null,
    idRoom: null,
    roomHistory: [],
    isMounted: false,
    isOneRendered: false
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SOCKET:
            return {
                ...state,
                socket: action.socket
            };
        case SET_IS_MOUNTED:
            return {
                ...state,
                isMounted: true
            };
        case SET_ID_ROOM:
            return {
                ...state,
                idRoom: action.idRoom
            };
        case RESET_ROOM_HISTORY:
            return {
                ...state,
                roomHistory: []
            };
        case UPDATE_MESSAGE:
            let clone = JSON.parse(JSON.stringify(state.roomHistory));
            clone.push(action.message);
            return {
                ...state,
                roomHistory: clone
            };
        case SET_ROOMS:
            return {
                ...state,
                rooms: action.rooms
            };

        case SET_ROOM_HISTORY:
            let roomHistoryClone = JSON.parse(JSON.stringify(state.roomHistory));
            let wordsUserName = action.history.map(item => item.text.split(' '))
            let newHistory = action.history.filter((item, index) => {
                return (!(wordsUserName[index][1] && wordsUserName[index][1] === action.userName && wordsUserName[index][2] === 'joined')) && !(wordsUserName[index][0] === 'Welcome,' && wordsUserName[index][1] !== action.userName)
            })
            let wordsNewHistory = newHistory.map(item => item.text.split(' '));
            let modifiedHistory = newHistory.map((item, index) => {
                if ((wordsNewHistory[index][0] === 'User' && wordsNewHistory[index][1] === action.userName && wordsNewHistory[index][2] && wordsNewHistory[index][2] === 'left')) {
                    item.text = 'You are left';
                } else if ((wordsNewHistory[index][0] === 'Welcome,' && wordsNewHistory[index][1] === action.userName )) {
                    item.text = 'You are joined';
                }
                return item
            })
            console.log("[modifiedHistory]", modifiedHistory)
            modifiedHistory.length > 0 && modifiedHistory.splice(-1,1);
            // let roomHistory = (modifiedHistory.length === 1 && !state.isOneRendered) ? [] : modifiedHistory
            // console.log("modifiedHistory", modifiedHistory)
            return {
                ...state,
                roomHistory: modifiedHistory,
                isOneRendered: true
            };
        case SET_IN_ROOM:
            return {
                ...state,
                inRoom: action.inRoom
            };
        case SET_USERS_TO_ROOM:
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
export const setIsMounted = () => ({
    type: SET_IS_MOUNTED,
});

export const setRooms = (rooms) => ({
    type: SET_ROOMS,
    rooms
})

export const setInRoom = (inRoom) => ({
    type: SET_IN_ROOM,
    inRoom
})

export const setIdRoom = (idRoom) => ({
    type: SET_ID_ROOM,
    idRoom
});

export const setRoomHistory = (history, userName) => ({
    type: SET_ROOM_HISTORY,
    history, userName
});

export const updateMessage = (message) => ({
    type: UPDATE_MESSAGE,
    message
});

export const resetRoomHistory = () => ({
    type: RESET_ROOM_HISTORY,
});


export const getRoomHistory = (roomId, userName) => async (dispatch) => {
    try {
        let response = await historyApi.getRoomHistory(roomId);
        console.log('[HISTORY]', response)
        dispatch(setRoomHistory(response.data.history, userName))
    } catch (err) {
        console.log(err);
    }

};
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