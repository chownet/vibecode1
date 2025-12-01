import { useState, useEffect, useRef } from 'react';

function Chat({ chat, currentUser, onClose }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chat.messages || []);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from localStorage
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('chats') || '{}');
    if (savedChats[chat.id]) {
      setMessages(savedChats[chat.id].messages || []);
    }
  }, [chat.id]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: currentUser?.username || currentUser?.walletAddress || 'You',
      senderAddress: currentUser?.walletAddress || '',
      text: message.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage('');

    // Save to localStorage
    const savedChats = JSON.parse(localStorage.getItem('chats') || '{}');
    savedChats[chat.id] = {
      ...chat,
      messages: updatedMessages,
      lastMessage: newMessage.text,
      lastMessageTime: newMessage.timestamp
    };
    localStorage.setItem('chats', JSON.stringify(savedChats));
  };

  const otherUser = chat.sellerAddress === currentUser?.walletAddress 
    ? { username: chat.buyerUsername, address: chat.buyerAddress }
    : { username: chat.sellerUsername, address: chat.sellerAddress };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-user-info">
          <h3>Chat with @{otherUser.username}</h3>
          <span className="chat-user-address">{otherUser.address?.slice(0, 6)}...{otherUser.address?.slice(-4)}</span>
        </div>
        <button onClick={onClose} className="chat-close-btn">✕</button>
      </div>

      <div className="chat-auction-info">
        <div className="auction-title-small">{chat.auctionTitle}</div>
        <div className="auction-price-small">Winning Bid: {chat.winningBid} USDC</div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>No messages yet. Start the conversation!</p>
            <p className="chat-hint">Discuss shipping details, meeting location, or payment confirmation.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isCurrentUser = msg.senderAddress === currentUser?.walletAddress || 
                                 msg.sender === (currentUser?.username || 'You');
            return (
              <div key={msg.id} className={`chat-message ${isCurrentUser ? 'sent' : 'received'}`}>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          autoFocus
        />
        <button type="submit" className="chat-send-btn" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;

