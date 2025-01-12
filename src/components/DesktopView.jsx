import React from 'react';
import MasterList from './MasterList';
import Account from './Account';
import ToDoList from "./ToDoList.jsx";

function DesktopView() {
    return (
        // this file just contains the layout of the desktop view
        <div className="flex h-screen">
            <div className="flex-1 pt-4 pr-4 pl-4">
                <div className="h-full bg-white rounded-t-2xl shadow-md">
                    <MasterList/>
                </div>
            </div>
            <div className="flex-1 pt-4 pr-4 pl-4">
                <div className="h-full rounded-2xl shadow-md">
                    <ToDoList/>
                </div>
            </div>
            <div className="flex-1 p-4">
                <div className="h-full bg-blue-50 rounded-2xl shadow-md">
                    <Account/>
                </div>
            </div>
        </div>
    );
}

export default DesktopView;
