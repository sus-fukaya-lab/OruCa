import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from "@pages/MainPage"
import LoginPage from '@pages/Admin/LoginPage';
import SettingsPage from '@pages/Admin/SettingsPage';
import {WebSocketProvider} from "@contexts/WebSocketContext";


function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route
            path="/admin/settings"
            element={<SettingsPage />}
          />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;