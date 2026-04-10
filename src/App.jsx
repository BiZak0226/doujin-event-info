import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'

import MainPage         from './pages/MainPage'
import EventListPage    from './pages/EventListPage'
import BoothListPage    from './pages/BoothListPage'
import ArtistListPage   from './pages/ArtistListPage'
import WorkListPage     from './pages/WorkListPage'
import CalendarPage     from './pages/CalendarPage'
import StatsPage        from './pages/StatsPage'
import ContributorsPage from './pages/ContributorsPage'
import NotFoundPage     from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"             element={<MainPage />} />
          <Route path="/events"       element={<EventListPage />} />
          <Route path="/booths"       element={<BoothListPage />} />
          <Route path="/booths/:eventId" element={<BoothListPage />} />
          <Route path="/artists"      element={<ArtistListPage />} />
          <Route path="/works"        element={<WorkListPage />} />
          <Route path="/calendar"     element={<CalendarPage />} />
          <Route path="/stats"        element={<StatsPage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="*"             element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
