import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./componenets/navbar.tsx";
import Hero from "./sections/hero.tsx";
import About from "./sections/about.tsx";
import Services from "./sections/services.tsx";
import Portfolio from "./sections/portfolio.tsx";
import Teams from "./sections/teams.tsx";
import Careers from "./sections/careers.tsx";
import Contact from "./sections/contact.tsx";
import Footer from "./componenets/footer.tsx";
import BackToHeroButton from "./componenets/back-to-hero.tsx";
import { ToastContainer } from "./componenets/toast.tsx";
import ServicesPage from "./pages/services.tsx";
import ServiceDetailPage from "./pages/service-detail.tsx";
import AboutPage from "./pages/about.tsx";
import PortfolioPage from "./pages/portfolio.tsx";
import PortfolioDetailPage from "./pages/portfolio-detail.tsx";
import CareersPage from "./pages/careers.tsx";
import JobDescriptionPage from "./pages/jobdescription.tsx";
import ApplyPage from "./pages/apply.tsx";
import AdminDashboard from "./admin/admin-dashboard.tsx";
import JobPostings from "./admin/job-postings.tsx";
import CategoryPage from "./admin/category.tsx";
import UsersPage from "./admin/users.tsx";
import AdminBlogsPage from "./admin/blogs.tsx";
import PublicBlogsPage from "./pages/blogs.tsx";
import BlogsDetailPage from "./pages/blogs-detail.tsx";
import ApplicationsPage from "./admin/applications.tsx";
import InterviewSlotsPage from "./admin/interview-slots.tsx";
import ProjectsAdminPage from "./admin/projects.tsx";
import TeamsAdminPage from "./admin/teams.tsx";
import SubscribersAdminPage from "./admin/subscribers.tsx";
import PermissionsPage from "./admin/permissions.tsx";
import SuperAdminLoginPage from "./pages/superadmin-login.tsx";
import LoginPage from "./pages/login.tsx";
import ProfilePage from "./pages/profile.tsx";
import ContactPage from "./pages/contact.tsx";
import TermsAndConditionsPage from "./pages/terms&conditions.tsx";
import PrivacyPolicyPage from "./pages/privacypolicy.tsx";
import ProtectedRoute from "./componenets/ProtectedRoute.tsx";


function RouteThemeSync() {
  const location = useLocation();

  useEffect(() => {
    try {
      const p = location.pathname.toLowerCase();
      const isDark = p === "/" || p === "" || p.startsWith("/services");
      const bg = isDark ? "#08050E" : "#F5EEF8";
      document.documentElement.style.backgroundColor = bg;
      document.body.style.backgroundColor = bg;
    } catch {}
  }, [location.pathname]);

  return null;
}

function ScrollToHashElement() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else if (prevPathRef.current !== location.pathname) {
      // Only scroll to top on actual page route changes, preventing scroll jumping on refresh
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, location.hash]);

  return null;
}

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-[#08050E] text-white flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white">
      <Navbar activeTab="Home" />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Teams />
      <Contact />
      <Careers />
      <Footer />
      <BackToHeroButton />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteThemeSync />
      <ScrollToHashElement />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/portfolio-detail" element={<PortfolioDetailPage />} />
        <Route path="/portfolio/:projectId" element={<PortfolioDetailPage />} />
        <Route path="/portfolio-detail/:projectId" element={<PortfolioDetailPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/service-detail" element={<ServiceDetailPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/apply/:id" element={<ApplyPage />} />
        <Route path="/careers/apply" element={<ApplyPage />} />
        <Route path="/careers/apply/:id" element={<ApplyPage />} />
        <Route path="/jobdescription" element={<JobDescriptionPage />} />
        <Route path="/jobdescription/:id" element={<JobDescriptionPage />} />
        <Route path="/job-description" element={<JobDescriptionPage />} />
        <Route path="/job-description/:id" element={<JobDescriptionPage />} />
        <Route path="/careers/jobdescription" element={<JobDescriptionPage />} />
        <Route path="/careers/jobdescription/:id" element={<JobDescriptionPage />} />
        <Route path="/careers/job-description" element={<JobDescriptionPage />} />
        <Route path="/careers/job-description/:id" element={<JobDescriptionPage />} />
        <Route path="/blogs" element={<PublicBlogsPage />} />
        <Route path="/blog" element={<PublicBlogsPage />} />
        <Route path="/blogs-detail" element={<BlogsDetailPage />} />
        <Route path="/blogs-detail/:idOrSlug" element={<BlogsDetailPage />} />
        <Route path="/blog-detail" element={<BlogsDetailPage />} />
        <Route path="/blog-detail/:idOrSlug" element={<BlogsDetailPage />} />
        <Route path="/blog/:idOrSlug" element={<BlogsDetailPage />} />
        <Route path="/terms&conditions" element={<TermsAndConditionsPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/terms-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacypolicy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/careers/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/careers/profile" element={<ProfilePage />} />
        <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
        <Route path="/superadmin" element={<SuperAdminLoginPage />} />
        <Route path="/admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/admin" element={<SuperAdminLoginPage />} />
        {/* Admin Portal Routes (Protected: Admin or Super Admin) */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-panel" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/jobs" element={<ProtectedRoute moduleId="job-postings"><JobPostings /></ProtectedRoute>} />
        <Route path="/admin/job-postings" element={<ProtectedRoute moduleId="job-postings"><JobPostings /></ProtectedRoute>} />
        <Route path="/admin/category" element={<ProtectedRoute moduleId="categories"><CategoryPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute moduleId="categories"><CategoryPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute moduleId="users"><UsersPage /></ProtectedRoute>} />
        <Route path="/admin/user" element={<ProtectedRoute moduleId="users"><UsersPage /></ProtectedRoute>} />
        <Route path="/admin/applications" element={<ProtectedRoute moduleId="applications"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/admin/application" element={<ProtectedRoute moduleId="applications"><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/admin/blogs" element={<ProtectedRoute moduleId="blogs"><AdminBlogsPage /></ProtectedRoute>} />
        <Route path="/admin/blog" element={<ProtectedRoute moduleId="blogs"><AdminBlogsPage /></ProtectedRoute>} />
        <Route path="/admin/interview-slots" element={<ProtectedRoute moduleId="interview-slots"><InterviewSlotsPage /></ProtectedRoute>} />
        <Route path="/admin/interview-slot" element={<ProtectedRoute moduleId="interview-slots"><InterviewSlotsPage /></ProtectedRoute>} />
        <Route path="/admin/slots" element={<ProtectedRoute moduleId="interview-slots"><InterviewSlotsPage /></ProtectedRoute>} />
        <Route path="/admin/projects" element={<ProtectedRoute moduleId="projects"><ProjectsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/project" element={<ProtectedRoute moduleId="projects"><ProjectsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/teams" element={<ProtectedRoute moduleId="teams"><TeamsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/team" element={<ProtectedRoute moduleId="teams"><TeamsAdminPage /></ProtectedRoute>} />
        <Route path="/admin/subscribers" element={<ProtectedRoute moduleId="subscribers"><SubscribersAdminPage /></ProtectedRoute>} />
        <Route path="/admin/subscriber" element={<ProtectedRoute moduleId="subscribers"><SubscribersAdminPage /></ProtectedRoute>} />
        <Route path="/admin/permissions" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/permission" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Super Admin Portal Routes (Protected: Super Admin ONLY) */}
        <Route path="/superadmin/dashboard" element={<ProtectedRoute requireSuperAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/superadmin/jobs" element={<ProtectedRoute requireSuperAdmin><JobPostings /></ProtectedRoute>} />
        <Route path="/superadmin/job-postings" element={<ProtectedRoute requireSuperAdmin><JobPostings /></ProtectedRoute>} />
        <Route path="/superadmin/category" element={<ProtectedRoute requireSuperAdmin><CategoryPage /></ProtectedRoute>} />
        <Route path="/superadmin/categories" element={<ProtectedRoute requireSuperAdmin><CategoryPage /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute requireSuperAdmin><UsersPage /></ProtectedRoute>} />
        <Route path="/superadmin/user" element={<ProtectedRoute requireSuperAdmin><UsersPage /></ProtectedRoute>} />
        <Route path="/superadmin/applications" element={<ProtectedRoute requireSuperAdmin><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/superadmin/application" element={<ProtectedRoute requireSuperAdmin><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/superadmin/blogs" element={<ProtectedRoute requireSuperAdmin><AdminBlogsPage /></ProtectedRoute>} />
        <Route path="/superadmin/blog" element={<ProtectedRoute requireSuperAdmin><AdminBlogsPage /></ProtectedRoute>} />
        <Route path="/superadmin/interview-slots" element={<ProtectedRoute requireSuperAdmin><InterviewSlotsPage /></ProtectedRoute>} />
        <Route path="/superadmin/interview-slot" element={<ProtectedRoute requireSuperAdmin><InterviewSlotsPage /></ProtectedRoute>} />
        <Route path="/superadmin/slots" element={<ProtectedRoute requireSuperAdmin><InterviewSlotsPage /></ProtectedRoute>} />
        <Route path="/superadmin/projects" element={<ProtectedRoute requireSuperAdmin><ProjectsAdminPage /></ProtectedRoute>} />
        <Route path="/superadmin/project" element={<ProtectedRoute requireSuperAdmin><ProjectsAdminPage /></ProtectedRoute>} />
        <Route path="/superadmin/teams" element={<ProtectedRoute requireSuperAdmin><TeamsAdminPage /></ProtectedRoute>} />
        <Route path="/superadmin/team" element={<ProtectedRoute requireSuperAdmin><TeamsAdminPage /></ProtectedRoute>} />
        <Route path="/superadmin/subscribers" element={<ProtectedRoute requireSuperAdmin><SubscribersAdminPage /></ProtectedRoute>} />
        <Route path="/superadmin/subscriber" element={<ProtectedRoute requireSuperAdmin><SubscribersAdminPage /></ProtectedRoute>} />
        <Route path="/superadmin/permissions" element={<ProtectedRoute requireSuperAdmin><PermissionsPage /></ProtectedRoute>} />
        <Route path="/superadmin/permission" element={<ProtectedRoute requireSuperAdmin><PermissionsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
