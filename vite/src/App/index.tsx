import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from "@pages/MainPage"
import LoginPage from '@pages/Admin/LoginPage';
import SettingsPage from '@pages/Admin/SettingsPage';
import {WebSocketProvider} from "@contexts/WebSocketContext";
import { ProtectedRoute } from '@components/ProtectedRoute.';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<LoginPage />} />
          <Route
            path="/admin/settings"
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
          />
        </Routes>
      </Router>
    </WebSocketProvider>
  );
}

export default App;