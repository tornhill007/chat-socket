import React from 'react';
import {Field, reduxForm} from "redux-form";
import {Input} from "../../common/FormsControl/FormsControl";
import {required} from "../../utils/validator";
import classes from "./Login.module.css";
import {connect} from "react-redux";
import {NavLink, Redirect} from "react-router-dom";
import {login} from "../../redux/reducers/authReducer";
import board from "../../assets/image/board.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {setIdRoom, setInRoom} from "../../redux/reducers/socketReducer";

const LoginForm = (props) => {
    return <div className={classes.container}>

        <div className={classes.wrap}>
            <div>
                <h1 className={classes.title}>
                    Enter
                </h1>
            </div>
            <form onSubmit={props.handleSubmit}>
                <Field placeholder={"Email"} name={"userName"} validate={[required]}
                       component={Input}/>
                <Field placeholder={"Password"} name={"password"}
                       type={"password"}
                       validate={[required]}
                       component={Input}/>
                <div>
                    <input value="Sign in" type="submit" className={`${classes.padding} ${classes.marginButton}`}/>

                </div>
                <div className={classes.topBorderItem}>
                    <NavLink to={"/register"} className={classes.itemText}>
                    <span>
                        Sign up your account
                    </span>
                    </NavLink>
                </div>
            </form>
        </div>
    </div>
}

const LoginReduxForm = reduxForm({form: 'login'})(LoginForm)

class Login extends React.Component {

    // props.setIdRoom(null);

    onSubmit = async (formData) => {
        this.props.setIdRoom(null)
        this.props.setInRoom(null)
        this.props.login(formData.password, formData.userName)
    }

    componentWillUnmount() {

    }

    render() {

    console.log("LOOOGIIIIIIIIIIIIIIN");

    return <div className={classes.wrapMain}>
        <div title={'Home'} className={classes.exit}><NavLink to={'/'}><FontAwesomeIcon className={`${classes.marginHome} fa-lg`} icon={faHome}/></NavLink></div>
        <div className={classes.wrapper}>
            <div className={classes.wrapImg}>
                <img className={classes.img}
                     src={board}
                     alt=""/>
            </div>
            <div className={classes.wrapTitle}><h1>Messenger</h1></div>
        </div>
        <LoginReduxForm onSubmit={this.onSubmit}/>
    </div>
}
}

const mapStateToProps = (state) => ({
    userData: state.auth
})

export default connect(mapStateToProps, {login, setInRoom, setIdRoom})(Login);