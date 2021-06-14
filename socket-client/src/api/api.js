import * as axios from "axios";
import {baseUrl} from '../common/config/config';

const instance = axios.create({
    baseURL: baseUrl,
})

// const headers = {"Content-Type": "multipart/form-data"}

instance.interceptors.request.use(
    config => {
        const token = JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user')).token : '';

        if (token) {
            config.headers.Authorization = token;
        } else {
            delete instance.defaults.headers.common.Authorization;
        }
        return config;
    },

    error => Promise.reject(error)
);

export const historyApi = {
    getRoomHistory(roomId) {
        return instance.get(`history/${roomId}`,)
    },
};


export const authAPI = {
    login(password, userName) {
        return axios.post(`${baseUrl}login`, {
            password,
            userName
        })
    },

    register(password, userName) {
        console.log(password, userName)
        return axios.post(`${baseUrl}users`, {
            password,
            userName
        })
    },
};