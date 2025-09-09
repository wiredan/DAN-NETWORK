import React from "react";

export default function ThemeSelector({ theme, setTheme }) {
  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
      className="border px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
    >
      <option value="light">🌞 Light</option>
      <option value="dark">🌙 Dark</option>
    </select>
  );
}