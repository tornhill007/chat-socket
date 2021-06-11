import React from 'react';
import {Route} from 'react-router-dom';

const DashboardLayout = ({children}) => (
    <div >
        {/*<HeaderContainer/>*/}
        {children}
    </div>
);

const DashboardLayoutRoute = ({component: Component, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            <DashboardLayout>
                <Component {...props} />
            </DashboardLayout>
        )}/>
    )
};

export default DashboardLayoutRoute;