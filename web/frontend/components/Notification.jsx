import { useState, useEffect } from 'react';

export function Notification({ messages }) {
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
    <div className="notification">
        <div className="notification__icon"></div>
        <div className="notification__message">
        <h2>{messages[messageIndex].value}</h2>
        </div>
    </div>
  );
}
