import React from 'react';
import {Route} from 'react-router-dom';
const HomeLayout = ({children}) => (
    <div>
        {/*<HeaderContainer/>*/}
        {children}
    </div>
);

const HomeLayoutRoute = ({component: Component, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            <HomeLayout>
                <Component {...props} />
            </HomeLayout>
        )}/>
    )
};

export default HomeLayoutRoute;