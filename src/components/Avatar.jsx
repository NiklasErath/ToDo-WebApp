// this file is connected to the chatbot and is in work in progress state
import React, {useState, useRef, useEffect} from 'react';


function Avatar() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const popupRef = useRef(null);
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const handleSendMessage = (message) => {
        // Here you can handle sending the message to the Chat component or any other logic
        console.log("Message sent:", message);
        togglePopup(); // Close the popup after sending the message
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            console.log("Clicked element: ", event.target);
            console.log("Popup element: ", popupRef.current);
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                console.log("Click was outside the popup");
                setIsPopupOpen(false);
            } else {
                console.log("Click was inside the popup");
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center absolute bottom-0 right-0 mb-4 mr-4">
            <img className="flex justify-items-center mt-5 w-15 h-15" src="./Avatar_Aang.png" alt="Avatar"
                 onClick={togglePopup}/>
            {isPopupOpen && (
                <div ref={popupRef} className="popup">
                    <input type="text" placeholder="Type your message..." autoFocus
                           onKeyDown={(e) => {
                               if (e.key === "Enter") {
                                   handleSendMessage()
                               }
                           }}/>
                    <button className="ml-4 mt-4" onClick={() => handleSendMessage("Hello!")}>Send</button>
                </div>
            )}
        </div>
    );
}

export default Avatar;