import React from 'react';
import {Route} from 'react-router-dom';

const LoginLayout = ({children}) => (
    <div>
        {children}
    </div>
);

const LoginLayoutRoute = ({component: Component, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            <LoginLayout>
                <Component {...props} />
            </LoginLayout>
        )}/>
    )
};

export default LoginLayoutRoute;