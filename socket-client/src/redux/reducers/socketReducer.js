import {authAPI, historyApi} from "../../api/api";
import historySortByCreatedDate from "../../utils/historySortByCreatedDate";

const SET_SOCKET = 'SET_SOCKET';
const SET_USERS_TO_ROOM = 'SET_USERS_TO_ROOM';
const SET_ROOMS = 'SET_ROOMS';
const SET_IN_ROOM = 'SET_IN_ROOM';
const SET_ID_ROOM = 'SET_ID_ROOM';
const SET_ROOM_HISTORY = 'SET_ROOM_HISTORY';
const UPDATE_MESSAGE = 'UPDATE_MESSAGE';
const RESET_ROOM_HISTORY = 'RESET_ROOM_HISTORY';
const SET_IS_MOUNTED = 'SET_IS_MOUNTED';
const SET_IS_SOCKET = 'SET_IS_SOCKET';
const SET_IS_CONNECTED = 'SET_IS_CONNECTED';
const SET_IS_DISCONNECTED = 'SET_IS_DISCONNECTED';

let initialState = {
  socket: null,
  users: [],
  rooms: [],
  inRoom: null,
  idRoom: null,
  roomHistory: [],
  isMounted: false,
  isOneRendered: false,
  isSocketExist: false,
  isConnected: false,
  isDisconnected: false
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SOCKET:
      // console.log("SOCKET_ID_ACTION", action.socket.id)
      return {
        ...state,
        socket: action.socket
      };
      case SET_IS_SOCKET:
      return {
        ...state,
        isSocketExist: action.isSocketExist
      };
      case SET_IS_DISCONNECTED:
        alert( action.isDisconnected)
      return {
        ...state,
        isDisconnected: action.isDisconnected
      };
      case SET_IS_CONNECTED:
      return {
        ...state,
        isConnected: true
      };
    case SET_IS_MOUNTED:
      return {
        ...state,
        isMounted: true,
        isOneRendered: false
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
     let flag = false;
     console.log("clone", clone)
      clone.forEach(item => {
        let arrText = item.text.split(' ');
        console.log("arrText", arrText)
        if((arrText[0] === action.userName && arrText[1] === 'joined') || (arrText[1] && arrText[1] === action.userName) ) {
          flag = true;
        }
      })
      let lastRecord = clone[clone.length - 1] && clone[clone.length - 1].text.split(' ');

      if(!action.message && ((state.roomHistory.length >= 0) && !flag) || clone.length === 0 || (lastRecord[2] && lastRecord[2] === 'left' && lastRecord[1] === action.userName)) {
        console.log("cloneclone", clone);
        clone.push({name: 'admin', text: `Welcome, ${action.userName}`})
        return {
          ...state,
          roomHistory: clone
        };
      }
      else if(!action.message ){
        return state;
      }
      clone.push(action.message);
      console.log("action.message", action.message)
      console.log("clone", clone)



      // console.log("roomHistory", state.roomHistory);
      // let clone;
      // if (!action.message.text && state.roomHistory.length === 0) {
      //   clone = JSON.parse(JSON.stringify(state.roomHistory));
      //   action.message.text = `Welcome, ${action.userName}`
      //   clone.push(action.message);
      // } else if (!action.message.text && state.roomHistory.length !== 0) {
      //   return state
      // } else {
      //   clone = JSON.parse(JSON.stringify(state.roomHistory));
      //   clone.push(action.message);
      // }
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
      console.log("ACTION, ACTION", action.roomId);
      console.log("ACTION, ACTION", state.idRoom);
      if(state.idRoom && state.idRoom !== action.roomId) return {...state}
      console.log("ACTION, ACTION", action);
      console.log("ACTION_HISTORY", action.history);
      console.log("STATE", state.roomHistory);
      // if(!action.message) {
      //   actio.push({name: 'Admin', text: `Welcome, ${action.userName}`})
      // }
      if(action.history.length === 1) {
return state;
      }

      let wordsLastHistory = action.history[action.history.length-1].text.split(' ');
      if(wordsLastHistory[1] && wordsLastHistory[1] === 'joined' && wordsLastHistory[0] === `${action.userName}`) {
        action.history.pop();
      }
      console.log("[wordsLastHistory]", wordsLastHistory)
      // if (state.roomHistory.length === 0) return state;
      // let roomHistoryClone = JSON.parse(JSON.stringify(state.roomHistory));
      // let wordsUserName = action.history.map(item => item.text.split(' '))
      // console.log("ACTION_HISTORY", action.history);
      // let newHistory = action.history.filter((item, index) => {
      //   return (!(wordsUserName[index][1] && wordsUserName[index][1] === action.userName && wordsUserName[index][2] === 'joined')) && !(wordsUserName[index][0] === 'Welcome,' && wordsUserName[index][1] !== action.userName)
      // })
      // let wordsNewHistory = newHistory.map(item => item.text.split(' '));
      // let modifiedHistory = newHistory.map((item, index) => {
      //   if ((wordsNewHistory[index][0] === 'User' && wordsNewHistory[index][1] === action.userName && wordsNewHistory[index][2] && wordsNewHistory[index][2] === 'left')) {
      //     item.text = 'You are left';
      //   } else if ((wordsNewHistory[index][0] === 'Welcome,' && wordsNewHistory[index][1] === action.userName)) {
      //     item.text = 'You are joined';
      //   }
      //   return item
      // })
      // console.log("modifiedHistory", modifiedHistory);
      // let wordMidified = modifiedHistory.map(item => item.text.split(' '))
      // modifiedHistory.length > 0 && wordMidified[wordMidified.length - 1][0] === 'You' && modifiedHistory.splice(-1, 1);

      historySortByCreatedDate(action.history);
      return {
        ...state,
        roomHistory: action.history,
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

export const setIsSocket = (isSocketExist) => ({
  type: SET_IS_SOCKET,
  isSocketExist
});

export const setUsersToRoom = (users) => ({
  type: SET_USERS_TO_ROOM,
  users
});

export const setIsConnected = () => ({
  type: SET_IS_CONNECTED,
});

export const setIsDisconnected = (isDisconnected) => ({
  type: SET_IS_DISCONNECTED,
  isDisconnected
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

export const setRoomHistory = (history, userName, roomId) => ({
  type: SET_ROOM_HISTORY,
  history, userName, roomId
});

export const updateMessage = (message, userName) => ({
  type: UPDATE_MESSAGE,
  message, userName
});

export const resetRoomHistory = () => ({
  type: RESET_ROOM_HISTORY,
});

export const getRoomHistory = (roomId, userName) => async (dispatch) => {
  try {
    let response = await historyApi.getRoomHistory(roomId);
    let modifiedResponse = response.data.map(item => {
      let obj = {...item.history};
      obj.createdat = item.createdat;
      return obj;
    });
    console.log('[HISTORY]', response)
    dispatch(setRoomHistory(modifiedResponse, userName, response.data[0].roomid))
  } catch (err) {
    console.log(err);
  }

};

export default authReducer;