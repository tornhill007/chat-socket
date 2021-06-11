import {Redirect} from "react-router-dom";
import React from "react";
import {connect} from "react-redux";

let mapStateToPropsForRedirect = (state) => ({
    token: state.auth.token
});

export const withAuthRedirect = (Component) => {
    class RedirectComponent extends React.Component {
        render() {
            if (!JSON.parse(localStorage.getItem('user'))) return <Redirect to='/login'/>
            return <Component {...this.props}/>
        }
    }

    let AuthRedirectComponent = connect(mapStateToPropsForRedirect)(RedirectComponent);

    return AuthRedirectComponent;
};