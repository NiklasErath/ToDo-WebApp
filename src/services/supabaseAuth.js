import supabase from '../services/supabaseClient'; // Adjust the import path as necessary

// with thi function we get the current session of the user and all his data
export const getCurrentSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Error fetching session:', error);
            return null;
        }
        return session;
    } catch (error) {
        console.error('Error in getCurrentSession:', error);

        return null;
    }
};

// when the user logs in or out the state changes
export const onAuthStateChange = (callback) => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });

    // Return the unsubscribe method to stop listening to the auth state changes
    // the unsubscribe method is called when the component is unmounted and stops the listener
    return () => {
        authListener.subscription.unsubscribe();
    };
};

// with this function we get the user profile  with all its data from the 'profiles' table
export const getUserProfile = async (userId) => {
    try {
        const { data: userData, error } = await supabase
            .from('profiles')
            .select('id, email, name, avatar_url')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error.message);
            return null;
        }
        return userData;
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return null;
    }
};


// this function is used to log out the user and is called mostly by a button
export const logOutUser = async (navigate) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            console.log('User logged out successfully');
            navigate('/login');
        }
    } catch (error) {
        console.error('Error logging out:', error.message);
    }
};
