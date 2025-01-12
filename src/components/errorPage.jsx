import React from 'react';
import {Link} from 'react-router-dom';

// this component will be rendered when the route does not exist and is our 404 page
const NotFoundPage = () => {
    return (
        <div className="flex justify-center items-center flex-col">
            <h1 className="flex text-3xl">404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <Link to="/">
                {/* this button will redirect the user to the TODO page */}
                <button className="bg-gray-500 hover:bg-green-600 text-white font-bold py-2 px-4 mt-5">
                    Go back to your TODO's
                </button>
            </Link>
        </div>
    );
};

export default NotFoundPage;
