import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../apiConfigure';
import { motion } from 'framer-motion';
import '../../../styles/Chat.css'; // Import the CSS

interface ChatProps {
  groupId: string;
  userType: string;
  isMember: boolean;
  // Add currentUserId if sender_name is not directly available or to compare sender
  currentUserId?: string | number; // Or however you identify the current user
}

interface Message {
  id: string;
  sender: string | number; // Assuming sender is an ID
  sender_name: string; // Keep if available, otherwise fetch/map
  content: string;
  timestamp: string;
}

const Chat: React.FC<ChatProps> = ({ groupId, userType, isMember, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!groupId) return;
      setIsLoadingMessages(true);
      try {
        const response = await axios.get<Message[]>(`${API_BASE_URL}/groups/${groupId}/messages/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        // Optionally set an error state to display to the user
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post<Message>(
        `${API_BASE_URL}/groups/${groupId}/messages/`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setMessages(prevMessages => [...prevMessages, response.data]);
      setNewMessage('');
    } catch (error) {
      alert('Failed to send message. Are you a member and a student?');
      console.error("Send message error:", error);
    }
  };

  if (userType !== 'student') {
    return <div className="chat-info-message">Only students can participate in group chats.</div>;
  }

  if (!isMember) {
    return <div className="chat-info-message">Join this group to view and send messages.</div>;
  }

  return (
    <div className="chat-component-container">
      <div className="chat-header">
        <h1>Group Chat</h1>
      </div>
      <div className="chat-messages-area">
        {isLoadingMessages && <div className="loading-spinner-container"><div className="loading-spinner" /></div>}
        {!isLoadingMessages && messages.length === 0 && (
            <p className="chat-info-message">No messages yet. Be the first to say hi!</p>
        )}
        {messages.map((message) => {
          // Determine if the message is from the current user.
          // This assumes your message object has a `sender` (ID) field and you pass `currentUserId`.
          // If `sender_name` is unique and reliable, you could use that, but ID is safer.
          const isMe = message.sender === currentUserId; // Adjust if sender ID is stored differently
          return (
            <motion.div
              key={message.id}
              className={`chat-message ${isMe ? 'chat-message-me' : 'chat-message-other'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {!isMe && <div className="message-sender">{message.sender_name || 'User'}</div>}
              <div className="message-content">{message.content}</div>
              <div className="message-timestamp">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-text-input"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
        />
        <button onClick={handleSendMessage} className="btn-primary chat-send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;