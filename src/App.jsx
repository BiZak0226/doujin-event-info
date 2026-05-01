import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import { AdminRoute, AuthRoute } from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'

import MainPage         from './pages/MainPage'
import EventListPage    from './pages/EventListPage'
import EventDetailPage  from './pages/EventDetailPage'
import BoothListPage    from './pages/BoothListPage'
import ArtistListPage   from './pages/ArtistListPage'
import WorkListPage     from './pages/WorkListPage'
import CalendarPage     from './pages/CalendarPage'
import StatsPage        from './pages/StatsPage'
import ContributorsPage from './pages/ContributorsPage'
import DataImportPage   from './pages/DataImportPage'
import EventAdminPage   from './pages/EventAdminPage'
import MyPage           from './pages/MyPage'
import NotFoundPage     from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/"                    element={<MainPage />} />
            <Route path="/events"              element={<EventListPage />} />
            <Route path="/events/:eventId"     element={<EventDetailPage />} />
            <Route path="/booths"              element={<BoothListPage />} />
            <Route path="/booths/:eventId"     element={<BoothListPage />} />
            <Route path="/artists"             element={<ArtistListPage />} />
            <Route path="/works"               element={<WorkListPage />} />
            <Route path="/calendar"            element={<CalendarPage />} />
            <Route path="/stats"               element={<StatsPage />} />
            <Route path="/contributors"        element={<ContributorsPage />} />

            {/* 로그인 사용자 라우트 */}
            <Route path="/my" element={
              <AuthRoute><MyPage /></AuthRoute>
            } />

            {/* 관리자 전용 라우트 */}
            <Route path="/admin/events" element={
              <AdminRoute><EventAdminPage /></AdminRoute>
            } />
            <Route path="/data-import" element={
              <AdminRoute><DataImportPage /></AdminRoute>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}
