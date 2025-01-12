import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from '../services/supabaseClient';

{/* this file contains the login form and the logic to handle the login process */
}
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // Added error state
    let navigate = useNavigate();

    {/* this function is called when the user submits the form to login*/
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Reset error state

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Error logging in:', error);
            setError(error.message); // Set error message in state if there is an error
        } else {
            console.log('User logged in:', data);
            navigate('/'); // Navigate to the home page after successful login
        }
        // Clear the form fields after submission
        setEmail('');
        setPassword('');
    };

    return (
        <div className="flex flex-col items-center justify-center m-10">
            <h1 className="mt-6 text-center text-5xl font-extrabold text-gray-900">Welcome to TODO'S</h1>
            <h2 className="text-xl font-semibold text-center text-gray-500 mt-3">Login to your account and structure
                your Day</h2>

            <div className=" flex-col justify-center max-w-md w-full ">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 mt-20">Sign in to your account</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            {/* input field for the email*/}
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex justify-center px-4 py-2 border-2 border-indigo-1000 rounded-lg focus:border-blue-500  shadow-md w-full"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            {/* input field for the password*/}
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex justify-center px-4 py-2 border-2 border-indigo-1000 rounded-lg focus:outline-none focus:ring focus:border-blue-500 shadow-md mt-2 w-full"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Login
                        </button>
                    </div>
                </form>
                <p className="flex justify-center text-gray-600 mt-5">Don't have an account?</p>
                <button
                    type="button"
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
                    onClick={() => navigate('/signup')}
                >
                    Sign up here
                </button>
            </div>
        </div>

    );
};

export default Login;
