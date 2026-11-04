import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Menu,
  Loader2,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import NewJobModal, { type NewJobFormData } from "./new-job-modal.tsx";
import AdminSidebar from "./sidebar.tsx";
import { toast } from "../componenets/toast.tsx";

export interface JobItem {
  id: string;
  dbId?: number;
  code: string;
  jobId?: string;
  category: string;
  categoryId?: number;
  status: "Active" | "Inactive";
  title: string;
  meta: string;
  description: string;
  summary?: string;
  requirements?: string;
  location?: string;
  employmentType?: string;
  experience?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function JobPostings() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const searchQuery = "";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);

  // Fetch real job postings from database
  const fetchJobs = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/jobs?all=true");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        throw new Error(data.message || "Failed to load jobs");
      }
    } catch (err: unknown) {
      console.error("Error loading jobs from database:", err);
      setFetchError("Unable to load jobs from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(
      (j) =>
        (j.title && j.title.toLowerCase().includes(query)) ||
        (j.code && j.code.toLowerCase().includes(query)) ||
        (j.jobId && j.jobId.toLowerCase().includes(query)) ||
        (j.category && j.category.toLowerCase().includes(query)) ||
        (j.description && j.description.toLowerCase().includes(query)) ||
        (j.meta && j.meta.toLowerCase().includes(query))
    );
  }, [jobs, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: JobItem) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (job: JobItem) => {
    if (!window.confirm(`Are you sure you want to delete the job posting "${job.title}"?`)) {
      return;
    }

    try {
      const targetId = job.dbId || job.id;
      const res = await fetch(`/api/admin/jobs/${targetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setJobs((prev) => prev.filter((j) => j.id !== job.id && j.dbId !== job.dbId));
        toast.success(`Job "${job.title}" deleted successfully.`, { title: "Job Deleted" });
      } else {
        toast.error(data.message || "Failed to delete job.");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job posting.");
    }
  };

  const handleSaveJob = async (jobData: NewJobFormData) => {
    try {
      if (editingJob) {
        const targetId = editingJob.dbId || editingJob.id;
        const res = await fetch(`/api/admin/jobs/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
        const data = await res.json();
        if (res.ok && data.success && data.job) {
          setJobs((prev) =>
            prev.map((j) => (j.id === editingJob.id || j.dbId === editingJob.dbId ? data.job : j))
          );
          toast.success("Job posting updated successfully!", { title: "Job Updated" });
        } else {
          toast.error(data.message || "Failed to update job.");
        }
      } else {
        const res = await fetch("/api/admin/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        });
        const data = await res.json();
        if (res.ok && data.success && data.job) {
          setJobs((prev) => [data.job, ...prev]);
          toast.success("New job posting published successfully!", { title: "Job Published" });
        } else {
          toast.error(data.message || "Failed to create job.");
        }
      }
    } catch (err) {
      console.error("Error saving job:", err);
      toast.error("An error occurred while saving job posting to database.");
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar
        activeTab="Job Postings"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* =========================================================================
          MAIN CONTENT AREA
      ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#ECE4F2] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={netopsysLogo} alt="Netopsys AI" className="h-8 w-auto object-contain" />
          <div className="w-7 h-7 rounded-full bg-[#E6D4EF] text-[#5D2381] font-bold text-xs flex items-center justify-center">
            AD
          </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-8">
          {/* Header Title & Actions Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                Job Postings
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                Create and manage the job postings
              </p>
            </div>

            <div className="flex items-center gap-3"> 

              {/* Post a Job Button */}
              <button
                onClick={handleOpenCreateModal}
                className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2.5 rounded-2xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Post a Job</span>
              </button>
            </div>
          </div>

          {/* Section Heading: Job Postings (Count) */}
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[16px] sm:text-[17px] font-bold text-[#141010] tracking-tight">
              Job Postings ({filteredJobs.length})
            </h2>
            {isLoading && <Loader2 className="w-4 h-4 text-[#5D2381] animate-spin" />}
          </div>

          {/* List of Job Posting Cards */}
          <div className="space-y-4">
            {fetchError && (
              <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-xs font-semibold border border-red-200">
                {fetchError}
              </div>
            )}
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              >
                {/* Top Row: Badges on left, Action Buttons on right */}
                <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Job Code Badge */}
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F1EBF7] text-[#693092]">
                      {job.code}
                    </span>

                    {/* Category Badge */}
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E]">
                      {job.category}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                      job.status === "Active" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#DC2626]"
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(job)}
                      className="px-4 py-1.5 rounded-xl border border-gray-200 bg-white text-[12.5px] font-semibold text-[#4A4358] hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 stroke-[2] text-[#4A4358]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job)}
                      className="px-4 py-1.5 rounded-xl border border-red-200 bg-white text-[12.5px] font-semibold text-[#DC2626] hover:bg-red-50/50 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2] text-[#DC2626]" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Job Title */}
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#141010] mt-2 mb-1 tracking-tight">
                  {job.title}
                </h3>

                {/* Metadata Line */}
                <div className="text-[12.5px] sm:text-[13px] text-[#716A7E] font-normal mb-1.5">
                  {job.meta}
                </div>

                {/* Description */}
                <p className="text-[12px] sm:text-[12.5px] text-[#867E93] leading-relaxed line-clamp-1">
                  {job.summary || job.description}
                </p>
              </div>
            ))}

            {!isLoading && filteredJobs.length === 0 && (
              <div className="bg-white rounded-[22px] p-10 text-center border border-[#ECE4F2]">
                <p className="text-sm text-gray-400">No matching job postings found in database.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =========================================================================
          NEW / EDIT JOB POSTING MODAL (Exact match to screenshot)
      ========================================================================= */}
      <NewJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveJob}
        title={editingJob ? "Edit Job Posting" : "New Job Posting"}
        initialData={
          editingJob
            ? {
                jobId: editingJob.code,
                title: editingJob.title,
                category: editingJob.category,
                location: editingJob.location || "Hyderabad / Remote",
                employmentType: editingJob.employmentType || "Full Time",
                experience: editingJob.experience || "1-3 years",
                summary: editingJob.summary || "",
                description: editingJob.description || "",
                requirements: editingJob.requirements || "",
                isActive: editingJob.status === "Active",
              }
            : null
        }
      />
    </div>
  );
}
