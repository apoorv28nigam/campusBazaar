import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ScrollProgressBar from './components/animations/ScrollProgressBar';
import Landing from './pages/Landing';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Buy from './pages/Buy';
import ItemDetail from './pages/ItemDetail';
import Sell from './pages/Sell';
import EditListing from './pages/EditListing';
import Borrow from './pages/Borrow';
import BorrowDetail from './pages/BorrowDetail';
import CreateBorrow from './pages/CreateBorrow';
import EditBorrow from './pages/EditBorrow';
import Messages from './pages/Messages';
import ChatWindow from './pages/ChatWindow';
import Profile from './pages/Profile';
import MyProfile from './pages/MyProfile';
import Notifications from './pages/Notifications';
import PaymentSuccess from './pages/PaymentSuccess';
import Checkout from './pages/Checkout';
import Requests from './pages/Requests';

const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="gradient-bg min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return !isAuth ? children : <Navigate to="/buy" replace />;
};

function AppContent() {
  const { isAuth } = useAuth();
  return (
    <div className="gradient-bg min-h-screen">
      <ScrollProgressBar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
        <Route path="/buy/:id" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
        <Route path="/borrow" element={<ProtectedRoute><Borrow /></ProtectedRoute>} />
        <Route path="/borrow/:id" element={<ProtectedRoute><BorrowDetail /></ProtectedRoute>} />
        <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
        <Route path="/sell/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/borrow/create" element={<ProtectedRoute><CreateBorrow /></ProtectedRoute>} />
        <Route path="/borrow/:id/edit" element={<ProtectedRoute><EditBorrow /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/messages/:id" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/checkout/:id" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isAuth && <MobileNav />}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a2e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontFamily: 'Inter, sans-serif' },
          success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
