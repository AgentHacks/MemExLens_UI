import React, { useState, useEffect } from "react";
import { logout } from "../services/authServices";

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    maxHistoryItems: 100,
    enableAutoCapture: true,
    useServerStorage: true,
    serverUrl: "",
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.local.get(["settings"]);
        if (result.settings) {
          setSettings(result.settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    try {
      await chrome.runtime.sendMessage({
        action: "updateSettings",
        settings,
      });
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-group">
        <label>
          <input
            type="checkbox"
            name="enableAutoCapture"
            checked={settings.enableAutoCapture}
            onChange={handleChange}
          />
          Automatically capture page content
        </label>
      </div>

      <div className="settings-group">
        <label>
          <input
            type="checkbox"
            name="useServerStorage"
            checked={settings.useServerStorage}
            onChange={handleChange}
          />
          Use server storage for enhanced search
        </label>
      </div>

      <div className="settings-group">
        <label>Maximum history items to store locally:</label>
        <input
          type="number"
          name="maxHistoryItems"
          value={settings.maxHistoryItems}
          onChange={handleChange}
          min="10"
          max="1000"
        />
      </div>

      <div className="button-group">
        <button onClick={handleSave}>Save Settings</button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default Settings;
