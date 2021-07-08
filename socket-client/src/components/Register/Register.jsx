import React from 'react';
import {Field, reduxForm} from "redux-form";
import {Input} from "../../common/FormsControl/FormsControl";
import {required} from "../../utils/validator";
import classes from "../Login/Login.module.css";
import {connect} from "react-redux";
import {register} from "../../redux/reducers/authReducer";
import {NavLink, Redirect} from "react-router-dom";
import board from '../../assets/image/board.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimes, faHome, faUserCircle} from "@fortawesome/free-solid-svg-icons";

const RegisterForm = (props) => {
    return <div className={classes.container}>
        <div className={classes.wrap}>
            <div>
                <h1 className={classes.title}>
                    Sign up your account
                </h1>
            </div>
            <form onSubmit={props.handleSubmit}>
                <Field placeholder={"User name"} name={"userName"} validate={[required]}
                       component={Input}/>
                <Field placeholder={"Password"} name={"password"} type={"password"}
                       validate={[required]}
                       component={Input}/>
                <Field placeholder={"Repeat password"} name={"repeatPassword"}
                       type={"password"}
                       validate={[required]}
                       component={Input}/>
                {props.error && <div className={classes.formError}>{props.error}</div>}
                <div>
                    <input value="Sign up" type="submit" className={`${classes.padding} ${classes.marginButton}`}/>
                </div>
                <div className={classes.topBorderItem}>
                    <NavLink to={"/login"} className={classes.itemText}>
                    <span>
                        Do you already have an account? Sign in
                    </span>
                    </NavLink>
                </div>
            </form>
        </div>
    </div>
}

const RegisterReduxForm = reduxForm({form: 'register'})(RegisterForm)

const Register = (props) => {
    const onSubmit = async (formData) => {
        props.register(formData.password, formData.userName, formData.repeatPassword);
    }
    if (props.userData.token) {
        return <Redirect to={"/"}/>
    }
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
        <RegisterReduxForm onSubmit={onSubmit}/>
    </div>
}

const mapStateToProps = (state) => ({
    userData: state.auth
})

export default connect(mapStateToProps, {register})(Register);