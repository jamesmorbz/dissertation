import './App.css';
import { LoginForm } from '@/pages/login';
import { Dashboard } from '@/pages/dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
