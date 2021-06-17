import {authAPI} from "../../api/api";
import {reset} from "redux-form";

const SET_AUTH_USER_DATA = 'SET_AUTH_USER_DATA';

let initialState = {
    userId: null,
    userName: null,
    token: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_AUTH_USER_DATA:
            return {
                ...state,
                ...action.data
            };
        default:
            return state;
    }
};

export const setAuthUserData = (userId, userName, token) => ({
    type: SET_AUTH_USER_DATA,
    data: {userId, userName, token}
});


export const login = (password, userName) => async (dispatch) => {
    try {
        let response = await authAPI.login(password, userName);
        console.log(response);
        if (response.statusText === 'OK') {
            dispatch(reset('register'))
            let {userId, userName, token} = response.data;
            dispatch(setAuthUserData(userId, userName, token));
            let user = {
                userId,
                userName,
                token,
                timestamp: Date.now()
            }
            window.localStorage.setItem("user", JSON.stringify(user))
        }
        else {
            let message = response.data.messages.length > 0 ? response.data.messages[0] : "Some error";
            // alert(message)
        }
    }
    catch (err) {
        alert(err.response.data.message)
        console.log("err", err.response.data.message);
    }

};

export const register = (password, userName, repeatPassword) => async (dispatch) => {
    try {
        if(password === repeatPassword) {
            let response = await authAPI.register(password, userName);
            if (response.statusText === 'OK') {
                dispatch(reset('register'))
                alert('you have registered')
            } else {
                let message = response.data.messages.length > 0 ? response.data.messages[0] : "Some error";
                alert(message);
            }
        }
        else {
            alert("Password mismatch")
        }

    } catch (err) {
        alert(err.response.data.message);
    }

};

export default authReducer;