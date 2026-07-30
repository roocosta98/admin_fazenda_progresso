import type { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Login } from '../pages/auth/Login';
import { MinhasSolicitacoes } from '../pages/solicitante/MinhasSolicitacoes';
import { Dashboard } from '../pages/logistica/Dashboard';
import { FilaPendentes } from '../pages/logistica/FilaPendentes';
import { GestaoFrota } from '../pages/logistica/GestaoFrota';
import { MapaMonitoramento } from '../pages/logistica/MapaMonitoramento';

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) => {
  const { usuario } = useAuth();
  
  if (!usuario) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(usuario.perfil)) {
    return <Navigate to={usuario.perfil === 'solicitante' ? '/solicitante/minhas' : '/logistica/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const HomeRedirect = () => {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to={usuario.perfil === 'solicitante' ? '/solicitante/minhas' : '/logistica/dashboard'} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        {/* Solicitante Routes */}

        <Route 
          path="/solicitante/minhas" 
          element={<ProtectedRoute allowedRoles={['solicitante']}><MinhasSolicitacoes /></ProtectedRoute>} 
        />
        
        {/* Logistica Routes */}
        <Route 
          path="/logistica/dashboard" 
          element={<ProtectedRoute allowedRoles={['logistica']}><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/logistica/pendentes" 
          element={<ProtectedRoute allowedRoles={['logistica']}><FilaPendentes /></ProtectedRoute>} 
        />
        <Route 
          path="/logistica/frota" 
          element={<ProtectedRoute allowedRoles={['logistica']}><GestaoFrota /></ProtectedRoute>} 
        />
        <Route 
          path="/logistica/monitoramento" 
          element={<ProtectedRoute allowedRoles={['logistica']}><MapaMonitoramento /></ProtectedRoute>} 
        />
        
        {/* Default redirect based on role */}
        <Route path="/" element={<HomeRedirect />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
