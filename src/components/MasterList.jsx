import React, {useState, useEffect} from "react";
import {Link, useLocation, useNavigate} from 'react-router-dom';
import supabase from '../services/supabaseClient';
import {onAuthStateChange, getCurrentSession, logOutUser, getUserProfile} from '../services/supabaseAuth';
import {getDevice} from '../services/checkDevice';

function MasterList() {
    const {isDesktopOrLaptop, isTabletOrMobile} = getDevice();
    const [lists, setLists] = useState([]);
    const [newList, setNewList] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [showListInput, setShowListInput] = useState(false);


    {/* this function will fetch the user data and the lists when the component mounts */
    }
    useEffect(() => {
        const fetchUser = async () => {
            // get the current session of the user
            const session = await getCurrentSession();
            if (!session || !session.user) {
                navigate('/login'); // Navigate to login page if no user is logged in
                return;
            }

            // get the user data from the database
            const userData = await getUserProfile(session.user.id);
            // If user data is available, set the user state
            if (userData) {
                setUser(userData);
            }

            console.log('User data:', userData);

            {/* this function will fetch the lists from the database */
            }
            setUser(userData); // Update user with fetched user data
            fetchLists(session.user.id);
        }

        // Fetch the user data and lists when the component mounts
        fetchUser();


        {/* this function will handle the visibility change that if a user switches to another tab and come back it will refresh */
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUser();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);


        {/* this function will listen to the auth state change */
        }
        const unsubscribe = onAuthStateChange((session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchLists(session.user.id);
            }
        });

        // Cleanup function that will run when the component unmounts
        return () => {
            unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);


    {/* this function will fetch the lists from the database to get the right lists to render for the logged in user */
    }

    async function fetchLists(userId) {
        // fetch the lists from the database with the user id
        const {data, error} = await supabase
            .from('lists')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.log('Error fetching lists:', error);
        } else {
            {/* this function will set the lists in the state */
            }
            setLists(data);
        }
    }

    {/* this function will handle the add list button click to add the new list to our supabase database*/
    }

    async function addList() {
        const session = await getCurrentSession();
        if (!session || !session.user) {
            navigate('/login');
            return;
        }

        {/* this function will add the new list to the database */
        }
        if (newList.trim() !== "" && user) {
            const {data, error} = await supabase
                .from('lists')
                .insert([{name: newList.trim(), user_id: user.id}])
                .select();

            {/* trim means that it will remove the white spaces from the start and the end of the string */
            }

            if (error) {
                console.log('Error adding list:', error);
            } else {
                setLists(oldLists => [...oldLists, ...data]);
                setNewList("");
            }
        }
        setShowListInput(false);
    }


    {/* this function will handle the click outside the input field, addButton etc. to close the input field */
        const handleClickOutside = (event) => {
            if (!event.target.closest(".ListItem") && !event.target.closest("#addButton") && !event.target.closest("#listInput") && !event.target.closest("#addNewButton")) {
                setShowListInput(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        {/* this function will delete the list from the database */
        }

        {/* this function will delete the list from the database */
        }

        async function deleteList(list_id) {
            const session = await getCurrentSession();
            // check the session and navigate to the login page if no user is logged in
            if (!session || !session.user) {
                navigate('/login');
                return;
            }

            // Delete tasks associated with the list in the tasks table
            const {error: deleteTasksError} = await supabase
                .from('tasks')
                .delete()
                .eq('list_id', list_id);

            if (deleteTasksError) {
                console.log('Error deleting tasks:', deleteTasksError);
                return;
            }

            // Delete the list with the correct list id in the lists table
            const {error: deleteListError} = await supabase
                .from('lists')
                .delete()
                .eq('list_id', list_id);

            if (deleteListError) {
                console.log('Error deleting list:', deleteListError);
            } else {
                // Manually update the state to remove the deleted list without fetching all lists again
                setLists(oldLists => oldLists.filter(list => list.list_id !== list_id));

                navigate('/'); // Navigate to the home page after deleting the list
            }
        }

        {/* this function will complete the list and update the completion status in the database */
        }

        async function completeList(index) {
            const session = await getCurrentSession();
            if (!session || !session.user) {
                navigate('/login');
                return;
            }

            const updatedLists = [...lists];
            const updatedList = {...updatedLists[index]};

            // Toggle the completion status
            updatedList.completed = !updatedList.completed;
            // Update the list in the state
            updatedLists[index] = updatedList;
            setLists(updatedLists);

            // Update the completion status in the database
            const {error} = await supabase
                .from('lists')
                .update({completed: updatedList.completed})
                .eq('list_id', updatedList.list_id)
                .single();

            if (error) {
                console.log('Error updating list completion status:', error);
            }
        }


        {/* this function will move the list up in the list and is for a future update */
        }

        function moveListUp(index) {
            if (index > 0) {
                const updatedLists = [...lists];
                [updatedLists[index], updatedLists[index - 1]] = [updatedLists[index - 1], updatedLists[index]];
                setLists(updatedLists);
            }
        }

        {/* this function will move the list down in the list and is for a future update */
        }

        function moveListDown(index) {
            if (index < lists.length - 1) {
                const updatedLists = [...lists];
                [updatedLists[index], updatedLists[index + 1]] = [updatedLists[index + 1], updatedLists[index]];
                setLists(updatedLists);
            }
        }


        return (
            <div className="bg-orange-50 rounded-2xl shadow-md">
                <div className="flex items-center flex-col">
                    <div className="flex justify-between w-full">
                        <div className="ml-10">
                            {user ? (
                                <>
                                    <h1 className="font-bold text-4xl text-zinc-800 mt-5">Hello {user.name}!</h1>
                                    <p className="font-bold text-base text-gray-600 mt-1">Your TODO's</p>
                                </>
                            ) : (
                                <p className="text-red-500 mt-2">No user is logged in</p>
                            )}
                        </div>
                        {/* check if its a mobile device because then the style will be different to the desktop version */}
                        {isTabletOrMobile && (


                            <Link to="/account">
                                <button className="mr-10">

                                    {user && user.avatar_url ? (
                                        <img className="rounded-full mt-7 w-16 h-16 shadow-md" src={user.avatar_url}
                                             alt="User Avatar"
                                             onError={() => console.log('Image failed to load:', user.avatar_url)}/>
                                    ) : (
                                        <img className="rounded-full mt-7 w-16 h-16 shadow-md"
                                             src="https://ohcixuchvhkjkmhhtmgv.supabase.co/storage/v1/object/public/avatars/placeholder_avatar.JPG"
                                             alt="User Avatar"/>
                                    )}
                                </button>
                            </Link>
                        )}
                    </div>

                    <ol className="w-full mt-5">
                        {lists.map((list, index) => (
                            <Link to={`/tasks/${list.name}`} key={list.list_id}>
                                <li className="flex items-center justify-between border-rounded border-2 border-indigo-1000 rounded-md shadow-md mb-2 ml-10 mr-10 bg-white">
                                    <div className="flex flex-row items-center ml-4">
                                        <input
                                            type="checkbox"
                                            checked={list.completed}
                                            onChange={() => completeList(index)}
                                            className={`mr-4 form-checkbox h-5 w-5 accent-green-500 ${list.completed ? 'text-green-500' : 'text-gray-500'}`}
                                        />
                                        <span ds="true">
                        {list.completed ? (
                            <del>{list.name}</del>
                        ) : (
                            list.name
                        )}
                    </span>
                                    </div>
                                    <div className="flex justify-end mt-2 mb-2 w-5px h-5px">
                                        <button
                                            className="bg-gray-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                deleteList(list.list_id);
                                            }}>
                                            X
                                        </button>
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ol>
                    <div className="flex justify-center mb-5">
                        {!showListInput ? (
                            <button
                                id={"addNewButton"}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center mt-5"
                                onClick={() => setShowListInput(true)}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        ) : (
                            <div className="flex flex-col justify-center mt-6 ">
                                <input id={"listInput"}
                                       className="flex justify-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500 mt-1"
                                       type="text"
                                       placeholder="Task Name"
                                       value={newList}
                                       onChange={(e) => setNewList(e.target.value)}
                                       onKeyDown={(e) => {
                                           if (e.key === "Enter") {
                                               addList();
                                           }
                                       }}
                                />
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
                                    onClick={addList}
                                    id={"addButton"}>
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-400 mb-5">press the + to add new TODO lists</p>
                </div>
            </div>
        );
    }
}

export default MasterList;
