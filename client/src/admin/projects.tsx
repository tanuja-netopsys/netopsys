import { useState, useMemo, useRef, useEffect } from "react";
import {
  // Search,
  Plus,
  Trash2,
  Pencil,
  Eye,
  X,
  Menu,
  Layers,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  // RefreshCw,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import AdminSidebar from "./sidebar.tsx";
import { toast } from "../componenets/toast.tsx";

export interface AdminProject {
  id: string | number;
  title: string;
  status: "Deployed" | "In Development" | "Review";
  technologies: string[];
  description: string;
  image: string;
  completionDate?: string;
  is_active?: boolean;
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const searchQuery = "";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modal State (Used for both Create and Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [viewingProject, setViewingProject] = useState<AdminProject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formStatus, setFormStatus] = useState<"Deployed" | "In Development" | "Review">("Deployed");
  const [formTech, setFormTech] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch real projects from database API
  const fetchProjects = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/projects?all=true");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProjects(data.data);
      } else {
        setProjects([]);
      }
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      setFetchError("Unable to load projects from server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (Array.isArray(p.technologies) && p.technologies.some((t) => t && t.toLowerCase().includes(q)))
    );
  }, [projects, searchQuery]);

  // Open modal in Create mode
  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormTitle("");
    setFormStatus("Deployed");
    setFormTech("");
    setFormDescription("");
    setFormImage("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  // Open modal in Edit mode pre-filled with existing card data
  const handleOpenEditModal = (project: AdminProject) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormStatus(project.status || "Deployed");
    setFormTech(Array.isArray(project.technologies) ? project.technologies.join(", ") : "");
    setFormDescription(project.description || "");
    setFormImage(project.image || "");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage("Image file must be less than 15MB");
        return;
      }
      setErrorMessage("");

      // Provide immediate local preview while uploading
      const objectUrl = URL.createObjectURL(file);
      setFormImage(objectUrl);

      // Upload to multer /api/upload endpoint
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setFormImage(data.url);
        } else {
          throw new Error(data.message || "Upload failed");
        }
      } catch (err) {
        console.warn("Upload failed, falling back to base64 encoding:", err);
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Title Validation
    if (!formTitle.trim()) {
      setErrorMessage("Project title is required");
      return;
    }

    // 2. Mandatory Image Validation
    if (!formImage.trim()) {
      setErrorMessage("Project image is mandatory. Please upload or provide an image URL.");
      return;
    }

    // 3. Mandatory Description Validation
    if (!formDescription.trim()) {
      setErrorMessage("Project description is mandatory. Please enter a description.");
      return;
    }

    const techArray = formTech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        title: formTitle.trim(),
        status: formStatus,
        technologies: techArray.length > 0 ? techArray : ["React", "TypeScript", "AI"],
        description: formDescription.trim(),
        image: formImage.trim(),
      };

      if (editingProject) {
        // EDIT existing project
        const res = await fetch(`/api/admin/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to update project");
        }

        setProjects((prev) =>
          prev.map((p) => (String(p.id) === String(editingProject.id) ? result.data : p))
        );
        setIsModalOpen(false);
        setEditingProject(null);
        setActionSuccess("Project updated successfully!");
        toast.success("Project updated successfully!", { title: "Project Updated" });
        setTimeout(() => setActionSuccess(""), 4000);
      } else {
        // CREATE new project
        const res = await fetch("/api/admin/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            completionDate: "Recent",
          }),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to create project");
        }

        setProjects((prev) => [result.data, ...prev]);
        setIsModalOpen(false);
        setActionSuccess("Project published successfully!");
        toast.success("New project published successfully!", { title: "Project Published" });
        setTimeout(() => setActionSuccess(""), 4000);
      }
    } catch (err: any) {
      console.error("Error saving project:", err);
      const msg = err.message || "Failed to save project to database.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Error Saving Project" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string | number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => String(p.id) !== String(id)));
      setProjectToDelete(null);
      setActionSuccess("Project deleted successfully!");
      toast.success("Project deleted successfully!", { title: "Project Deleted" });
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      console.error("Error deleting project:", err);
      toast.error(err.message || "Failed to delete project from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderStatusBadge = (status: AdminProject["status"]) => {
    switch (status) {
      case "Deployed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Deployed
          </span>
        );
      case "In Development":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            In Development
          </span>
        );
      case "Review":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#693092] border border-[#693092]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#693092]" />
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Reusable Admin Sidebar with Projects Active */}
      <AdminSidebar
        activeTab="Projects"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#ECE4F2] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                Projects
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                Manage and publish projects to the frontend portfolio showcase
              </p>
            </div>

            {/* Post a Project Button (Right Aligned) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenAddModal}
                className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2.5 rounded-2xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Post a Project</span>
              </button>
            </div>
          </div>

          {/* Action Success Toast */}
          {actionSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Fetch Error Banner */}
          {fetchError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{fetchError}</span>
              </div>
              <button
                onClick={fetchProjects}
                className="underline text-red-700 hover:text-red-900 cursor-pointer text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-[22px] border border-[#ECE4F2]">
              <Loader2 className="w-8 h-8 text-[#5D2381] animate-spin" />
              <p className="text-sm font-medium text-[#716A7E]">Loading projects from database...</p>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8 items-stretch">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-[22px] p-6 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(93,35,129,0.05)] transition-all flex flex-col justify-between h-auto min-w-0 break-words"
                >
                  <div>
                    {/* Project Image Banner */}
                    {project.image && (
                      <div className="w-full aspect-[16/9] max-h-48 rounded-xl overflow-hidden mb-4 bg-gray-100 border border-black/5 relative group/img">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Badge Row with Edit and Delete Action Icons */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(project.status)}
                      </div>

                      {/* Action Icons: View, Edit & Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setViewingProject(project)}
                          className="text-gray-400 hover:text-[#5D2381] p-1.5 rounded-lg hover:bg-[#F6EEFA] transition-colors cursor-pointer"
                          title="View Project Details"
                          aria-label={`View ${project.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(project)}
                          className="text-gray-400 hover:text-[#5D2381] p-1.5 rounded-lg hover:bg-[#F6EEFA] transition-colors cursor-pointer"
                          title="Edit Project"
                          aria-label={`Edit ${project.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectToDelete(project)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Project"
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#141010] mb-2 leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#554E62] leading-relaxed mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-[#F5EFF8] flex items-center justify-between text-xs text-[#8E869B]">
                    <span>Completion</span>
                    <span className="font-medium text-[#141010]">{project.completionDate || "Active"}</span>
                  </div>
                </div>
              ))}

              {filteredProjects.length === 0 && (
                <div className="col-span-full py-16 text-center text-sm text-gray-500 bg-white rounded-[22px] border border-[#ECE4F2]">
                  {searchQuery ? "No projects found matching your search." : "No projects published yet. Click 'Post a Project' above to add one."}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#ECE4F2] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                  {editingProject ? (
                    <Pencil className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <Layers className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#141010]">
                    {editingProject ? "Edit Project" : "Post a Project"}
                  </h3>
                  <p className="text-xs text-[#716A7E]">
                    {editingProject
                      ? `Update details for "${editingProject.title}"`
                      : "Add a new case study to the portfolio"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProject(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Project Title */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. BizOne (Intelligent ERP Solutions)"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                />
              </div>

              {/* Project Image - Mandatory */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                  Project Image <span className="text-red-500">*</span>
                </label>

                {formImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E2DBEA] bg-[#FAF8FC] p-2.5 flex items-center gap-3">
                    <img
                      src={formImage}
                      alt="Project Preview"
                      className="w-20 h-14 rounded-xl object-cover border border-black/5 shrink-0 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#141010] truncate">Image Selected</p>
                      <p className="text-[11px] text-[#716A7E]">Click change or remove to replace</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pr-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#5D2381] hover:bg-[#F1E4F8] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormImage("");
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D5CBE0] hover:border-[#5D2381] bg-[#FAF8FC] hover:bg-[#F9F5FB] rounded-2xl p-5 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F1E4F8] text-[#5D2381] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 stroke-[2]" />
                    </div>
                    <p className="text-xs font-semibold text-[#141010] mb-0.5">
                      Click to upload project image <span className="text-red-500">*</span>
                    </p>
                    <p className="text-[11px] text-[#716A7E]">
                      PNG, JPG, WebP up to 5MB, or paste image URL below
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

              </div>

              {/* Description - Mandatory */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Short project overview and business impact..."
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl p-3 text-xs sm:text-sm text-[#141010] outline-none resize-none"
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE4F2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSubmitting
                      ? editingProject
                        ? "Saving..."
                        : "Creating..."
                      : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Project Details Modal */}
      {viewingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#ECE4F2] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#141010]">Project Details</h3>
                  <p className="text-xs text-[#716A7E]">Viewing case study information</p>
                </div>
              </div>
              <button
                onClick={() => setViewingProject(null)}
                className="w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {viewingProject.image && (
                <div className="w-full h-52 rounded-2xl overflow-hidden bg-gray-100 border border-[#ECE4F2]">
                  <img
                    src={viewingProject.image}
                    alt={viewingProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                {renderStatusBadge(viewingProject.status)}
              </div>

              <h2 className="text-xl font-bold text-[#141010]">{viewingProject.title}</h2>

              <p className="text-xs sm:text-sm text-[#554E62] leading-relaxed whitespace-pre-wrap">
                {viewingProject.description}
              </p>

              {/* Technologies */}
              {Array.isArray(viewingProject.technologies) && viewingProject.technologies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#141010] uppercase tracking-wider mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingProject.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#FAF7FC] text-[#693092] border border-[#EADBFA]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-3 border-t border-[#F5EFF8] text-xs">
                <span className="text-gray-400 block mb-0.5">Completion Date</span>
                <strong className="text-[#141010] font-semibold">{viewingProject.completionDate || "Active"}</strong>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#ECE4F2] flex items-center justify-end gap-2.5 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  const proj = viewingProject;
                  setViewingProject(null);
                  handleOpenEditModal(proj);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D2381] hover:bg-[#F6EEFA] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingProject(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1A6E] hover-brand-gradient shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-[#141010] mb-1">Delete Project</h3>
            <p className="text-xs text-[#716A7E] mb-6">
              Are you sure you want to delete <strong className="text-[#141010]">{projectToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(projectToDelete.id)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 hover-brand-gradient shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
