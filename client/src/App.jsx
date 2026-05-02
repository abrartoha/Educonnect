import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useStore from './store/useStore'

// Layout
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'))

// Pages
const Login = lazy(() => import('./pages/auth/Login'))
const Signup = lazy(() => import('./pages/auth/Signup'))

// Feed
const Feed = lazy(() => import('./pages/Feed'))
const PostDetail = lazy(() => import('./pages/PostDetail'))

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ManageUniversities = lazy(() => import('./pages/admin/ManageUniversities'))
const ManageAgents = lazy(() => import('./pages/admin/ManageAgents'))
const ManageConsultants = lazy(() => import('./pages/admin/ManageConsultants'))
const ManagePosts = lazy(() => import('./pages/admin/ManagePosts'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

// University
const UniDashboard = lazy(() => import('./pages/university/UniDashboard'))
const UniProfile = lazy(() => import('./pages/university/UniProfile'))
const UniAnalytics = lazy(() => import('./pages/university/UniAnalytics'))
const UniCampaigns = lazy(() => import('./pages/university/UniCampaigns'))
const UniBookings = lazy(() => import('./pages/university/UniBookings'))

// Agent
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'))
const AgentProfile = lazy(() => import('./pages/agent/AgentProfile'))
const AgentBookings = lazy(() => import('./pages/agent/AgentBookings'))
const AgentAnalytics = lazy(() => import('./pages/agent/AgentAnalytics'))

// Consultant
const ConsultantDashboard = lazy(() => import('./pages/consultant/ConsultantDashboard'))
const ConsultantProfile = lazy(() => import('./pages/consultant/ConsultantProfile'))
const ConsultantBookings = lazy(() => import('./pages/consultant/ConsultantBookings'))
const ConsultantAnalytics = lazy(() => import('./pages/consultant/ConsultantAnalytics'))

// Student
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'))
const StudentBookings = lazy(() => import('./pages/student/StudentBookings'))

// Shared dashboard
const MyPosts = lazy(() => import('./pages/dashboard/MyPosts'))

// Meeting (LiveKit)
const MeetingRoom = lazy(() => import('./pages/meeting/MeetingRoom'))

// Messaging
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'))

// Cross-page realtime notifications (mounted at app root)
const GlobalNotifications = lazy(() => import('./components/notifications/GlobalNotifications'))

// Marketplace
const Universities = lazy(() => import('./pages/marketplace/Universities'))
const Agents = lazy(() => import('./pages/marketplace/Agents'))
const Consultants = lazy(() => import('./pages/marketplace/Consultants'))
const UniversityDetail = lazy(() => import('./pages/marketplace/UniversityDetail'))
const AgentDetail = lazy(() => import('./pages/marketplace/AgentDetail'))

// Static pages
const About = lazy(() => import('./pages/static/About'))
const Contact = lazy(() => import('./pages/static/Contact'))
const FAQ = lazy(() => import('./pages/static/FAQ'))
const Blog = lazy(() => import('./pages/static/Blog'))
const Support = lazy(() => import('./pages/static/Support'))
const Careers = lazy(() => import('./pages/static/Careers'))
const Partners = lazy(() => import('./pages/static/Partners'))
const Press = lazy(() => import('./pages/static/Press'))
const Privacy = lazy(() => import('./pages/static/Privacy'))
const Terms = lazy(() => import('./pages/static/Terms'))
const Cookies = lazy(() => import('./pages/static/Cookies'))
const Accessibility = lazy(() => import('./pages/static/Accessibility'))
const Compare = lazy(() => import('./pages/static/Compare'))
const Scholarships = lazy(() => import('./pages/static/Scholarships'))
const StudyGuide = lazy(() => import('./pages/static/StudyGuide'))
const VisaInfo = lazy(() => import('./pages/static/VisaInfo'))

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800">EduConnect</span>
        </div>
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser, authReady } = useStore()

  if (!authReady) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />
  }
  return children
}

function RequireAuth({ children }) {
  const { isAuthenticated, authReady } = useStore()
  if (!authReady) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function RedirectIfAuthed({ children }) {
  const { isAuthenticated, authReady } = useStore()
  if (!authReady) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  const hydrate = useStore((s) => s.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ScrollToTop />
      <GlobalNotifications />
      <Routes>
        {/* Auth routes (only for unauthenticated users) */}
        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />

        {/* Feed is the landing page */}
        <Route path="/" element={<RequireAuth><Feed /></RequireAuth>} />
        <Route path="/feed" element={<Navigate to="/" replace />} />
        <Route path="/feed/:postId" element={<RequireAuth><PostDetail /></RequireAuth>} />

        {/* Marketplace routes */}
        <Route path="/universities" element={<RequireAuth><Universities /></RequireAuth>} />
        <Route path="/universities/:id" element={<RequireAuth><UniversityDetail /></RequireAuth>} />
        <Route path="/agents" element={<RequireAuth><Agents /></RequireAuth>} />
        <Route path="/consultants" element={<RequireAuth><Consultants /></RequireAuth>} />
        <Route path="/agents/:id" element={<RequireAuth><AgentDetail /></RequireAuth>} />
        <Route path="/consultants/:id" element={<RequireAuth><AgentDetail /></RequireAuth>} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="universities" element={<ManageUniversities />} />
          <Route path="agents" element={<ManageAgents />} />
          <Route path="consultants" element={<ManageConsultants />} />
          <Route path="posts" element={<ManagePosts />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* University routes */}
        <Route path="/university" element={
          <ProtectedRoute allowedRoles={['university']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<UniDashboard />} />
          <Route path="profile" element={<UniProfile />} />
          <Route path="analytics" element={<UniAnalytics />} />
          <Route path="campaigns" element={<UniCampaigns />} />
          <Route path="bookings" element={<UniBookings />} />
          <Route path="posts" element={<MyPosts />} />
        </Route>

        {/* Agent routes */}
        <Route path="/agent" element={
          <ProtectedRoute allowedRoles={['agent']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AgentDashboard />} />
          <Route path="profile" element={<AgentProfile />} />
          <Route path="posts" element={<MyPosts />} />
          <Route path="bookings" element={<AgentBookings />} />
          <Route path="analytics" element={<AgentAnalytics />} />
        </Route>

        {/* Consultant routes */}
        <Route path="/consultant" element={
          <ProtectedRoute allowedRoles={['consultant']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ConsultantDashboard />} />
          <Route path="profile" element={<ConsultantProfile />} />
          <Route path="posts" element={<MyPosts />} />
          <Route path="bookings" element={<ConsultantBookings />} />
          <Route path="analytics" element={<ConsultantAnalytics />} />
        </Route>

        {/* Student routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="bookings" element={<StudentBookings />} />
          <Route path="posts" element={<MyPosts />} />
        </Route>

        {/* Meeting (LiveKit video) — bare layout, no dashboard chrome */}
        <Route
          path="/meeting/:bookingId"
          element={<RequireAuth><MeetingRoom /></RequireAuth>}
        />

        {/* Messaging — available to all authenticated users */}
        <Route path="/messages" element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }>
          <Route index element={<MessagesPage />} />
          <Route path=":conversationId" element={<MessagesPage />} />
        </Route>

        {/* Static pages */}
        <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
        <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
        <Route path="/faq" element={<RequireAuth><FAQ /></RequireAuth>} />
        <Route path="/blog" element={<RequireAuth><Blog /></RequireAuth>} />
        <Route path="/support" element={<RequireAuth><Support /></RequireAuth>} />
        <Route path="/careers" element={<RequireAuth><Careers /></RequireAuth>} />
        <Route path="/partners" element={<RequireAuth><Partners /></RequireAuth>} />
        <Route path="/press" element={<RequireAuth><Press /></RequireAuth>} />
        <Route path="/privacy" element={<RequireAuth><Privacy /></RequireAuth>} />
        <Route path="/terms" element={<RequireAuth><Terms /></RequireAuth>} />
        <Route path="/cookies" element={<RequireAuth><Cookies /></RequireAuth>} />
        <Route path="/accessibility" element={<RequireAuth><Accessibility /></RequireAuth>} />
        <Route path="/compare" element={<RequireAuth><Compare /></RequireAuth>} />
        <Route path="/scholarships" element={<RequireAuth><Scholarships /></RequireAuth>} />
        <Route path="/resources/study-guide" element={<RequireAuth><StudyGuide /></RequireAuth>} />
        <Route path="/resources/visa-info" element={<RequireAuth><VisaInfo /></RequireAuth>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
