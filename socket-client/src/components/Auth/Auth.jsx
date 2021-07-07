import React from "react";
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {generateUID} from "../../utils/generateUID";
import {setAuthUserData} from "../../redux/reducers/authReducer";


class Auth extends React.Component {

  componentDidMount() {
alert(5)
    if (!JSON.parse(sessionStorage.getItem('tabId'))) {
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
    if(this.props.token) {
      return <Redirect to={'/'}/>
    }
    return <Redirect to={'/login'}/>
  }
}

const mapStateToProps = (state) => ({
  token: state.auth.token
})

export default connect(mapStateToProps, {setAuthUserData})(Auth);