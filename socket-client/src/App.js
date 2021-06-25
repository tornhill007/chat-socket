import './App.css';
import {io} from "socket.io-client";
import {useEffect, useState} from "react";
import React from "react";
import {BrowserRouter, Switch} from "react-router-dom";
import LoginLayoutRoute from "./layouts/loginLayout";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import DashboardLayoutRoute from "./layouts/DashboardLayout";
import {connect, Provider} from "react-redux";
import {compose} from "redux";
import {setAuthUserData} from "./redux/reducers/authReducer";
import store from "./redux/store";
import Game from "./components/Games/Game";
import {generateUID} from "./utils/generateUID";

class App extends React.Component {

    componentDidMount() {


        if(!JSON.parse(sessionStorage.getItem('tabId'))) {
            let tabId = generateUID();
            window.sessionStorage.setItem("tabId", JSON.stringify(tabId))
        }


        if (JSON.parse(localStorage.getItem('user'))) {
            let user = JSON.parse(localStorage.getItem('user'));
            if (user.timestamp > Date.now() - 3600000) {
                this.props.setAuthUserData(user.userId, user.userName, user.token)
            } else {
                window.localStorage.removeItem('user');
                this.props.setAuthUserData(null, null, null)
            }
        }
    }


    render() {

        return <div className="App">
            <div className='app-wrapper-content'>
                <Switch>
                    <DashboardLayoutRoute exact path='/' component={Home}/>
                    <DashboardLayoutRoute path='/game/:gameId' component={Game}/>
                    <LoginLayoutRoute path='/register' component={Register}/>
                    <LoginLayoutRoute path='/login' component={Login}/>
                </Switch>
            </div>
        </div>



    }

}

const mapStateToProps = (state) => ({});

let AppContainer = compose(
    connect(mapStateToProps, {setAuthUserData}))
(App);

const mainApp = () => {
    console.log()
    return (
        <BrowserRouter>
            <Provider store={store}>
                <AppContainer/>
            </Provider>
        </BrowserRouter>
    );
}


export default mainApp;
