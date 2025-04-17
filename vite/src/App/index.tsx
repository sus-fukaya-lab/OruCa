import { WebSocketProvider } from "@contexts/WebSocketContext";
import LoginPage from '@pages/Admin/LoginPage';
import SettingsPage from '@pages/Admin/SettingsPage';
import MainPage from "@pages/MainPage";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
  return (
    <WebSocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<LoginPage />} />
          {/* <Route
            path="/admin/settings"
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
          /> */}
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