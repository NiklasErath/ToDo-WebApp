import React, {useState, useEffect} from 'react';
import {getCurrentSession, getUserProfile, logOutUser, onAuthStateChange} from '../services/supabaseAuth';
import supabase from '../services/supabaseClient';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {getDevice} from "../services/checkDevice.js";

function Account() {
    const {isDesktopOrLaptop, isTabletOrMobile} = getDevice();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [editingPassword, setEditingPassword] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
    const [showImageSelect, setShowImageSelect] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState(null);
    const navigate = useNavigate();

    {/* this function is called when the user submits the form to change the password*/
    }
    useEffect(() => {
        const fetchUser = async () => {
            const session = await getCurrentSession();
            if (!session || !session.user) {
                navigate('/login'); // Navigate to login page if no user is logged in
                return;
            }

            // Fetch user data including
            const userData = await getUserProfile(session.user.id);
            if (userData) {
                setUser(userData);
            }
        };

        fetchUser();

        {/* this function is to refresh the page when the user switches to another tab */
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUser();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);


        {/* checks if the user logs out*/
        }
        const unsubscribe = onAuthStateChange((session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [navigate]);


    {/* this function is called when the user submits the form to change the password*/
    }
    const handlePasswordChange = async () => {
        if (newPassword.length < 6) {
            alert('Password should be at least 6 characters long');
            return;
        }

        // Update the password in the auth table
        const {error} = await supabase.auth.updateUser({password: newPassword});

        if (error) {
            console.error('Error updating password:', error.message);
            alert(`Error: ${error.message}`);
        } else {
            // pop up information for the user that everything worked
            alert('Password has been updated');
            setNewPassword('');
            setEditingPassword(false);
        }
    };


    {/* this function is called when the user submits the form to change the username*/
    }
    const handleUsernameChange = async () => {
        if (!newUsername) {
            // pop up information for the user that the username cannot be empty when changing the username
            alert('Username cannot be empty');
            return;
        }

        // when the user changes the username it updates the username in the 'profiles' table
        const {data, error} = await supabase
            .from('profiles')
            .update({name: newUsername})
            .eq('id', user.id);

        if (error) {
            console.error('Error updating username:', error.message);
            // pop up information for the user that there was an error with changing the username
            alert(`Error: ${error.message}`);
        } else {
            // pop up information for the user that everything worked and the new username is set
            alert('Username has been updated');
            setUser((prevUser) => ({...prevUser, name: newUsername}));
            setNewUsername('');
            setEditingUsername(false);
            // if the username gets updated the page will reload
            window.location.reload();
        }
    };


    {/* this function is called when the user changes his avatar*/
    }
    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Generate unique file name for the avatar
        const fileName = `${user.id}_${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `avatars/${fileName}`;

        // Delete old avatar if it exists
        if (user.avatar_url) {
            const oldFileName = user.avatar_url.split('/').pop();
            await supabase.storage.from('avatars').remove([`avatars/${oldFileName}`]);
            // i try to delete the old images but it doesn't work right now sadly
        }

        // Upload new avatar to the database
        let {error: uploadError} = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {upsert: true});

        if (uploadError) {
            console.error('Error uploading file:', uploadError.message);
            alert(`Error: ${uploadError.message}`);
            return;
        }

        const {data: publicURLData} = await supabase
            // get the public URL of the image for the profiles table
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        const avatarUrl = publicURLData.publicUrl;

        // Update the avatar URL in the 'profiles' table that its linked to the user
        const {data, error} = await supabase
            .from('profiles')
            .update({avatar_url: avatarUrl})
            .eq('id', user.id);

        if (error) {
            // pop up information for the user that there was an error with updating the avatar
            console.error('Error updating avatar URL:', error.message);
            alert(`Error: ${error.message}`);
        } else {
            // pop up information for the user
            alert('Avatar has been updated');
            setUser((prevUser) => ({...prevUser, avatar_url: avatarUrl}));
            setNewAvatar(null);
        }
        // if the avatar gets updated the popup 'datei einfügen' will close
        setShowImageSelect(false);
    };

    {/* this function is called when the user logs out*/
    }
    const handleLogout = async () => {
        await logOutUser();
        navigate('/login');
    };

    return (
        <div className="flex items-center flex-col w-150 h-150">
            {user && user.avatar_url ? (
                <img className="rounded-full mt-7 w-40 h-40 shadow-md" src={user.avatar_url} alt="User Avatar"
                     onError={() => console.log('Image failed to load:', user.avatar_url)}/>
            ) : (
                <img className="rounded-full mt-7 w-40 h-40 shadow-md"
                     src="https://ohcixuchvhkjkmhhtmgv.supabase.co/storage/v1/object/public/avatars/placeholder_avatar.JPG"
                     alt="User Avatar"/>
            )}


            <h1 className="font-bold text-3xl">Account</h1>
            {user ? (
                <div>
                    <div className="mt-5">
                        <p className="text-xl font-bold">Name: {user && user.name ? user.name : ''}</p>
                        <p>Email: {user.email}</p>
                        <p>Your ID: {user.id}</p>
                    </div>
                    <div className="flex flex-col mt-5">
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-5"
                            onClick={() => setEditingPassword(!editingPassword)}
                        >
                            Change Password
                        </button>
                        {editingPassword && (
                            <div className="flex flex-row justify-between">
                                <input
                                    className="flex justify-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500 md:mb-0 mt-5"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New Password"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handlePasswordChange();
                                        }
                                    }}
                                />
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-5"
                                    onClick={handlePasswordChange}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-5"
                            onClick={() => setEditingUsername(!editingUsername)}
                        >
                            Change Username
                        </button>
                        {editingUsername && (
                            <div className="flex flex-row justify-between">
                                <input
                                    className="flex justify-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500 md:mb-0 mt-5"
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="New Username"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUsernameChange();
                                        }
                                    }}
                                />
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-5"
                                    onClick={handleUsernameChange}
                                >
                                    Submit
                                </button>
                            </div>
                        )}
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-5"
                            onClick={() => setShowImageSelect(!showImageSelect)}
                        >
                            Change Avatar
                        </button>
                        {showImageSelect && (
                            <div className="mt-5">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                        )}


                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-5"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                        {isTabletOrMobile && (
                            <Link to="/">
                                <button
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-10 w-full">
                                    TODO's
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <p>No user is logged in</p>
            )}
        </div>
    );
}

export default Account;
