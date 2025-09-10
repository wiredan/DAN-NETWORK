import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications"; // change backend URL

const Notifications = ({ user }) => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(`${API_URL}/${user._id}`);
        setNotes(res.data);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };
    fetchNotes();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await axios.post(`${API_URL}/${id}/read`);
      setNotes(notes.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("Error updating notification", err);
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white">
      <h2 className="text-lg font-bold mb-3">Notifications</h2>
      {notes.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notes.map((n) => (
            <li
              key={n._id}
              className={`p-2 mb-2 rounded ${
                n.read ? "bg-gray-200" : "bg-yellow-100"
              }`}
            >
              {n.message}
              {!n.read && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="ml-3 text-sm text-blue-600"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;