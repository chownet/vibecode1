import { useState, useEffect } from 'react';

function ChatList({ chats, currentUser, onSelectChat, onClose }) {
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    // Load unread counts from localStorage
    const unread = JSON.parse(localStorage.getItem('chatUnread') || '{}');
    setUnreadCounts(unread);
  }, []);

  const sortedChats = [...chats].sort((a, b) => {
    const aTime = a.lastMessageTime || a.createdAt || 0;
    const bTime = b.lastMessageTime || b.createdAt || 0;
    return bTime - aTime;
  });

  if (chats.length === 0) {
    return (
      <div className="chat-list-container">
        <div className="chat-list-header">
          <h2>Messages</h2>
          <button onClick={onClose} className="chat-close-btn">✕</button>
        </div>
        <div className="chat-list-empty">
          <p>No active chats yet.</p>
          <p className="chat-hint">Chats will appear here when auctions close.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Messages ({chats.length})</h2>
        <button onClick={onClose} className="chat-close-btn">✕</button>
      </div>
      <div className="chat-list">
        {sortedChats.map(chat => {
          const otherUser = chat.sellerAddress === currentUser?.walletAddress
            ? { username: chat.buyerUsername, address: chat.buyerAddress }
            : { username: chat.sellerUsername, address: chat.sellerAddress };
          
          const unread = unreadCounts[chat.id] || 0;
          const lastMessage = chat.lastMessage || 'No messages yet';
          const lastTime = chat.lastMessageTime 
            ? new Date(chat.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : '';

          return (
            <div 
              key={chat.id} 
              className="chat-list-item"
              onClick={() => {
                // Mark as read
                const unread = JSON.parse(localStorage.getItem('chatUnread') || '{}');
                delete unread[chat.id];
                localStorage.setItem('chatUnread', JSON.stringify(unread));
                setUnreadCounts(unread);
                onSelectChat(chat);
              }}
            >
              <div className="chat-list-item-content">
                <div className="chat-list-item-header">
                  <span className="chat-list-username">@{otherUser.username}</span>
                  {unread > 0 && <span className="chat-unread-badge">{unread}</span>}
                </div>
                <div className="chat-list-item-title">{chat.auctionTitle}</div>
                <div className="chat-list-item-footer">
                  <span className="chat-list-preview">{lastMessage}</span>
                  {lastTime && <span className="chat-list-time">{lastTime}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatList;

