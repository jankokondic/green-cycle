import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavigationBar from './navigation';

const Layout = () => {
    const { pathname } = useLocation();
    const hideNav = pathname === '/login' || pathname === '/register';

    return (
        <>
            {!hideNav && <NavigationBar />}
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default Layout;