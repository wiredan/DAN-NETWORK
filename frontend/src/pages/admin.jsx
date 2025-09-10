import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api("/admin/users", "GET", null, token);
        setUsers(res.users);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [token]);

  const handleAction = async (userId, action) => {
    try {
      await api(`/admin/${action}`, "POST", { userId }, token);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, kyc_verified: action === "verifyKYC" ? 1 : u.kyc_verified }
            : u
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Panel</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Role</th>
                <th className="border px-2 py-1">KYC</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-2 py-1">{u.id}</td>
                  <td className="border px-2 py-1">{u.email || "-"}</td>
                  <td className="border px-2 py-1">{u.phone || "-"}</td>
                  <td className="border px-2 py-1">{u.role}</td>
                  <td className="border px-2 py-1">
                    {u.kyc_verified ? "✅ Verified" : "❌ Pending"}
                  </td>
                  <td className="border px-2 py-1 flex gap-2">
                    {!u.kyc_verified && (
                      <button
                        onClick={() => handleAction(u.id, "verifyKYC")}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Verify KYC
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(u.id, "makeAdmin")}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Make Admin
                    </button>
                    <button
                      onClick={() => handleAction(u.id, "removeUser")}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}