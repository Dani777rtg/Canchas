import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { AdminRoute } from './components/AdminRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layout/AdminLayout'
import { AppLayout } from './layout/AppLayout'
import { PanelLayout } from './layout/PanelLayout'
import { AdminCourtsPage } from './pages/AdminCourtsPage'
import { AdminHomePage } from './pages/AdminHomePage'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MisReservasPage } from './pages/MisReservasPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'
import { ReservarPage } from './pages/ReservarPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="iniciar-sesion" element={<LoginPage />} />
            <Route path="registro" element={<RegisterPage />} />
            <Route
              path="panel"
              element={
                <ProtectedRoute>
                  <PanelLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="reservar" element={<ReservarPage />} />
              <Route path="reservas" element={<MisReservasPage />} />
            </Route>
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminHomePage />} />
              <Route path="canchas" element={<AdminCourtsPage />} />
              <Route path="usuarios" element={<AdminUsersPage />} />
              <Route path="informes" element={<AdminReportsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/login" element={<Navigate to="/iniciar-sesion" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
