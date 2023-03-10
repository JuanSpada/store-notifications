import { useState, useEffect } from 'react';

export function Notification({ messages, settings }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) =>
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [messages]);

  return (
    <div className="notification" style={{background: `#${settings.backgroundColor}`, fontFamily: settings.font}}>
        <button className="notification__close-btn">&times;</button>
        <div className="notification__icon">
          <img src="../public/icons8-bell-24.png" alt="" />
        </div>
        <div className="notification__message">
        <h2 style={{color: `#${settings.textColor}`}}>{messages[messageIndex].value}</h2>
        </div>
    </div>
  );
}
