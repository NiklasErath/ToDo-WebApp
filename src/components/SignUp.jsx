import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from '../services/supabaseClient';
import {logOutUser} from '../services/supabaseAuth';

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    {/* this function is called when the user submits the form to sign up*/
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submit action
        try { // try means that the code inside the block will be executed and if there is an error, it will throw the error
            const {data, error} = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                throw error; // Throw the error to be caught by the outer catch block
            }

            // If the user is successfully signed up, the data object will contain the user object
            const user = data.user;

            if (!user) {
                throw new Error('Signup successful, but no user data returned.');
            }

            // Upsert into profiles table
            const {error: profileError} = await supabase
                .from('profiles')
                .upsert([{id: user.id, name}], {onConflict: 'id'});

            if (profileError) {
                throw profileError; // Throw the error to be caught by the outer catch block
            }

            // If there are no errors, navigate to the login page so the user can login tho his new account
            navigate('/login');
        } catch (error) {
            console.error('Error during signup:', error);
            setErrorMessage(`Error: ${error.message}`);
        }
        // Clear the form fields after submission
        setName('');
        setEmail('');
        setPassword('');
    };


    return (
        <div className="m-10">
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Welcome to TODO'S</h1>
            <h2 className="text-xl font-semibold text-center text-gray-500"> Sign Up here and structure your Day</h2>
            <form className="max-w-md mx-auto mt-8 " onSubmit={handleSubmit}>
                {errorMessage && (
                    <div className="mb-4 text-red-500">
                        {errorMessage}
                    </div>
                )}
                <label className="block mb-4">
                    <span className="text-gray-700">Name:</span>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex justify-center px-4 py-2 border-2 border-indigo-1000 rounded-lg focus:outline-none focus:ring focus:border-blue-500 shadow-md mt-2 w-full"
                        required
                        placeholder={'Enter your name'}
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Email:</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex justify-center px-4 py-2 border-2 border-indigo-1000 rounded-lg focus:outline-none focus:ring focus:border-blue-500 shadow-md mt-2 w-full"
                        required
                        placeholder={'Enter your email'}
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Password:</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex justify-center px-4 py-2 border-2 border-indigo-1000 rounded-lg focus:outline-none focus:ring focus:border-blue-500 shadow-md mt-2 w-full"
                        required
                        placeholder={'Enter your password'}
                    />
                </label>
                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
                >
                    Sign Up
                </button>
                <p className="flex justify-center mt-5">Already have an account?</p>
                <button
                    type="button"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gray-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
                    onClick={() => navigate('/login')}
                >
                    Login here
                </button>
            </form>
        </div>
    );
};

export default SignUp;
