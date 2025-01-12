// this file is in work in progress state and is not yet completed - it will be updated soon so that chatgpt is implemented
import React, {useState} from 'react';
import axios from 'axios';

function Chat() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = async () => {
        if (input.trim() === '') return;
        const newMessages = [...messages, {text: input, sender: 'user'}];
        setMessages(newMessages);
        setInput('');

        try {
            const response = await axios.post('/api/chat', {message: input});
            setMessages([...newMessages, {text: response.data.message, sender: 'bot'}]);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                }}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
