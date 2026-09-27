import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { handleGoogleRedirect } from './lib/googleAuth';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider, useStore } from './contexts/StoreContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import ProductEditor from './pages/admin/ProductEditor';
import AIGeneratorPage from './pages/admin/AIGeneratorPage';
import AdminOrders from './pages/admin/AdminOrders';
import AdminWilayas from './pages/admin/AdminWilayas';
import AdminDelivery from './pages/admin/AdminDelivery';
import AdminStaff from './pages/admin/AdminStaff';
import AdminSettings from './pages/admin/AdminSettings';
import { FONT_OPTIONS } from './lib/utils';

handleGoogleRedirect();

function FontApplier() {
  const { get } = useStore();
  useEffect(() => {
    const v = get('site_font', 'Tajawal');
    const stack = FONT_OPTIONS.find((f) => f.value === v)?.stack || "'Tajawal', sans-serif";
    document.documentElement.style.setProperty('--site-font', stack);
    document.body.style.fontFamily = stack;
    const fav = get('favicon_url', '');
    if (fav) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = fav;
    }
  }, [get]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <FontApplier />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/p/:slug" element={<ProductPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<ProtectedRoute perm="dashboard"><AdminDashboard /></ProtectedRoute>} />
              <Route path="products" element={<ProtectedRoute perm="products"><AdminProducts /></ProtectedRoute>} />
              <Route path="products/new" element={<ProtectedRoute perm="products"><ProductEditor /></ProtectedRoute>} />
              <Route path="products/ai-new" element={<ProtectedRoute perm="products"><AIGeneratorPage /></ProtectedRoute>} />
              <Route path="products/edit/:id" element={<ProtectedRoute perm="products"><ProductEditor /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute perm="orders"><AdminOrders /></ProtectedRoute>} />
              <Route path="wilayas" element={<ProtectedRoute perm="wilayas"><AdminWilayas /></ProtectedRoute>} />
              <Route path="delivery" element={<ProtectedRoute perm="delivery"><AdminDelivery /></ProtectedRoute>} />
              <Route path="staff" element={<ProtectedRoute perm="staff"><AdminStaff /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute perm="settings"><AdminSettings /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
