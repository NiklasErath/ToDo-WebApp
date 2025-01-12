import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link, useLocation} from 'react-router-dom';
import supabase from "../services/supabaseClient";
import {getCurrentSession, logOutUser, onAuthStateChange, getUserProfile} from "../services/supabaseAuth";
import {getDevice} from "../services/checkDevice.js";

function ToDoList() {
    const {isDesktopOrLaptop, isTabletOrMobile} = getDevice();
    const {listName} = useParams();
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [showTaskInput, setShowTaskInput] = useState(false);
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [listId, setListId] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // this function will run when the component mounts and fetch the user and list ID
        const fetchUserAndListId = async () => {
            try {
                // get the current session and try means that if the session is not available, the error will be caught
                const session = await getCurrentSession();
                if (!session || !session.user) {
                    navigate('/login');
                    return;
                }

                const userData = await getUserProfile(session.user.id);
                if (userData) {
                    setUser(userData);
                }

                // fetch the list ID when the user is logged in
                fetchListId(listName);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        // Close the task input when clicking outside of it - anywhere on the screen
        const handleClickOutside = (event) => {
            if (!event.target.closest(".taskItem") && !event.target.closest("#addButton") && !event.target.closest("#addTaskButton") && !event.target.closest("#taskNameInput") && !event.target.closest("#taskDescriptionInput")) {
                setShowTaskInput(false);
                setSelectedTask(null);
            }
        };

        // Add the event listener to the document
        document.addEventListener("mousedown", handleClickOutside);


        // Fetch the user and list ID when the component logs in
        const unsubscribe = onAuthStateChange((session) => {
            if (session?.user) {
                fetchUserAndListId();
            } else {
                setUser(null);
                setListId(null);
                setTasks([]);
            }
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchUserAndListId();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (listName) {
            fetchUserAndListId();
        } else {
            console.error('Invalid listName:', listName);
        }

        // Cleanup that runs when the component is unmounted and before the useEffect runs again
        return () => {
            unsubscribe();
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [listName]);


    async function fetchListId(listName) {
        if (!listName || !user || !user.id) {
            console.error('No list chosen');
            setListId(null);
            setTasks([]);
            return;
        }

        const {data, error} = await supabase
            .from('lists')
            .select('list_id')
            .eq('name', listName)
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching list ID:', error);
        } else {
            if (data && data.length > 0) {
                setListId(data[0].list_id);
                fetchTasks(data[0].list_id);
            } else {
                console.warn('List not found:', listName);
                setListId(null);
                setTasks([]);
            }
        }
    }

    async function fetchTasks(listId) {
        if (!listId) {
            setTasks([]);
            return;
        }

        const {data, error} = await supabase
            .from('tasks')
            .select('*')
            .eq('list_id', listId)
            .order('priority', {ascending: true});

        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            setTasks(data);
        }
    }

    function handleInputChange(event) {
        setNewTask(event.target.value);
        setNewTaskDescription(event.target.value);
    }

    async function addTask() {
        const session = await getCurrentSession();
        if (!session || !session.user) {
            navigate('/login');
            return;
        }

        if (newTask.trim() !== "" && listId) {
            const {data: listData} = await supabase
                .from('lists')
                .select('user_id')
                .eq('list_id', listId);

            if (listData && listData.length > 0) {
                const {user_id} = listData[0];
                const newTaskData = {
                    task_name: newTask.trim(),
                    description: newTaskDescription.trim(),
                    list_id: listId,
                    user_id
                };

                const {error} = await supabase
                    .from('tasks')
                    .insert([newTaskData]);

                if (error) {
                    console.log('Error adding task:', error);
                } else {
                    fetchTasks(listId);
                    handleInputChange({target: {value: ""}});
                }
            }
        }
        setShowTaskInput(false);
    }

    async function completeTask(index) {
        const updatedTasks = [...tasks];
        const updatedTask = {...updatedTasks[index]};

        // Toggle the completion status
        updatedTask.completed = !updatedTask.completed;

        updatedTasks[index] = updatedTask;
        setTasks(updatedTasks);

        // Update the completion status in the database
        const {error} = await supabase
            .from('tasks')
            .update({completed: updatedTask.completed})
            .eq('task_id', updatedTask.task_id)
            .single();

        if (error) {
            console.log('Error updating task completion status:', error);
        }
    }

    async function deleteTask(taskId) {
        const session = await getCurrentSession();
        if (!session || !session.user) {
            navigate('/login');
            return;
        }

        const {error} = await supabase
            .from('tasks')
            .delete()
            .match({task_id: taskId});

        if (error) {
            console.error('Error deleting task:', error);
        } else {
            setTasks(oldTasks => oldTasks.filter(task => task.task_id !== taskId));
        }
    }

    return (
        <div className="bg-orange-50 rounded-2xl shadow-md mb-5">

            <div className="flex items-center flex-col">
                <div className="flex justify-between w-full">
                    <div className="ml-10">
                        {user ? (
                            <>
                                <h1 className="font-bold text-4xl text-zinc-800 mt-5">
                                    {listId ? `List ${listName}` : 'Choose a list'}
                                </h1>
                                <p className="font-bold text-base text-gray-600 mt-1 mb-5">Your Tasks</p>
                            </>
                        ) : (
                            <p className="text-gray-400 mt-2">get List</p>
                        )}
                    </div>
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

                {listId && (
                    <ol className="w-full">
                        {tasks.map((task, index) => (
                            task && (
                                <li
                                    key={task.task_id}
                                    className="flex flex-col border-rounded border-2 border-indigo-1000 rounded-md shadow-md mb-2 ml-10 mr-10 bg-white taskItem">
                                    <div className="flex flex-row items-center ml-4">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => completeTask(index)}
                                            className={`mr-4 form-checkbox h-5 w-5 accent-green-500 ${task.completed ? 'text-green-500' : 'text-gray-500'}`}
                                        />
                                        <button
                                            className={`flex items-center w-full ${task.completed ? 'line-through opacity-50' : ''}`}
                                            onClick={() => setSelectedTask(task.task_id === selectedTask ? null : task.task_id)}>
                                            {task.task_name}
                                        </button>
                                        <div className="flex justify-end mt-1.5 mb-1 w-5px h-5px">
                                            <button
                                                className="bg-gray-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                                                onClick={() => deleteTask(task.task_id)}>
                                                X
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ml-12 mb-1">
                                        {selectedTask === task.task_id &&
                                            <p className="taskDescription text-zinc-700 italic">{task.description}</p>}
                                    </div>
                                </li>
                            )
                        ))}
                    </ol>

                )}

                <div className="flex justify-center mb-5">
                    {!showTaskInput ? (
                        <button
                            id={"addTaskButton"}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center mt-5"
                            onClick={() => setShowTaskInput(true)}
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    ) : (
                        <div className="flex flex-col justify-center mt-5">
                            <input id={"taskNameInput"}
                                   className="flex justify-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                                   type="text"
                                   placeholder="Task Name"
                                   value={newTask}
                                   onChange={(e) => setNewTask(e.target.value)}
                                   onKeyDown={(e) => {
                                       if (e.key === "Enter") {
                                           addTask();
                                       }
                                   }}
                            />
                            <input
                                id={"taskDescriptionInput"}
                                className="flex justify-center px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-500 mt-1"
                                type="text"
                                placeholder="Task Description"
                                value={newTaskDescription}
                                onChange={(e) => setNewTaskDescription(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        addTask();
                                    }
                                }}
                            />
                            <button
                                id={"addButton"}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2"
                                onClick={addTask}>
                                Add
                            </button>
                        </div>
                    )}
                </div>
                <p className="text-gray-400 mb-5">press the + to add new tasks to the list</p>
                {isTabletOrMobile && (
                    <Link to="/">
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-2 mb-5">
                            Lists
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}

export default ToDoList;
