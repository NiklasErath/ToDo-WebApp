import React from 'react';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import DesktopView from './components/DesktopView';
import MasterList from './components/MasterList';
import ToDoList from './components/ToDoList';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Account from './components/Account';
import {getDevice} from './services/checkDevice';
import NotFoundPage from "./components/errorPage.jsx";

const App = () => {
    const {isDesktopOrLaptop, isTabletOrMobile} = getDevice();


    // this function will render the routes based on the device
    const renderRoutes = () => (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            {isDesktopOrLaptop ? (
                <>
                    <Route path="/" element={<DesktopView/>}/>
                    <Route path="/account" element={<DesktopView/>}/>
                    <Route path="/tasks" element={<DesktopView/>}/>
                    <Route path="/tasks/:listName" element={<DesktopView/>}/>
                </>
            ) : (
                <>
                    <Route path="/" element={<MasterList/>}/>
                    <Route path="/account" element={<Account/>}/>
                    <Route path="/tasks" element={<ToDoList/>}/>
                    <Route path="/tasks/:listName" element={<ToDoList/>}/>
                </>
            )}
            {/* when the route not exist 'error' page */}
            <Route path="*" element={<NotFoundPage/>}/>

        </Routes>
    );

    return (
        <div>
            {renderRoutes()}
        </div>
    );
};

// wrap the App component with BrowserRouter to enable routing in the app
const AppWrapper = () => (
    <BrowserRouter>
        <App/>
    </BrowserRouter>
);

export default AppWrapper;
