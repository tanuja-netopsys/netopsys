import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Eye,
  X,
  Menu,
  UsersRound,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crop,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import AdminSidebar from "./sidebar.tsx";
import { toast } from "../componenets/toast.tsx";
import ImageCropModal from "../componenets/image-crop-modal.tsx";

export interface AdminTeamMember {
  id: string | number;
  name: string;
  role: string;
  image: string;
  bio?: string;
  initials: string;
  is_active?: boolean;
}

export default function TeamsAdminPage() {
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const searchQuery = "";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Modal State (Supports both Add & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminTeamMember | null>(null);
  const [viewingMember, setViewingMember] = useState<AdminTeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [memberToDelete, setMemberToDelete] = useState<AdminTeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formImage, setFormImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Image Cropper State
  const [cropSource, setCropSource] = useState<{
    src: string;
    fileName: string;
    rawFile: File | null;
  } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch real team members from database API
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/teams?all=true");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTeam(data.data);
      } else {
        setTeam([]);
      }
    } catch (err: any) {
      console.error("Failed to load team members:", err);
      setFetchError("Unable to load team members from server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const filteredTeam = useMemo(() => {
    if (!searchQuery.trim()) return team;
    const q = searchQuery.toLowerCase();
    return team.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q))
    );
  }, [team, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormRole("");
    setFormBio("");
    setFormImage("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: AdminTeamMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormBio(member.bio || "");
    setFormImage(member.image || "");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeCropModal = () => {
    setCropSource((prev) => {
      if (prev?.src.startsWith("blob:")) {
        URL.revokeObjectURL(prev.src);
      }
      return null;
    });
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(String(event.target?.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });

  const uploadImageFile = async (file: File) => {
    setErrorMessage("");
    setIsUploadingImage(true);

    // Provide immediate local preview while uploading
    const objectUrl = URL.createObjectURL(file);
    setFormImage(objectUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();
      let data: { url?: string; message?: string } = {};
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = {};
        }
      }

      if (res.ok && data.url) {
        URL.revokeObjectURL(objectUrl);
        setFormImage(data.url);
      } else {
        throw new Error(
          data.message ||
            (res.status >= 500
              ? "Upload server temporarily unavailable."
              : `Upload failed (${res.status})`)
        );
      }
    } catch (err) {
      console.warn("Upload endpoint unavailable, using inline image fallback:", err);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        URL.revokeObjectURL(objectUrl);
        setFormImage(dataUrl);
      } catch (readErr) {
        console.error("Failed to read fallback image:", readErr);
        setErrorMessage("Unable to process image file. Please try again.");
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Image file must be less than 15MB");
      return;
    }

    setErrorMessage("");
    closeCropModal();
    setCropSource({
      src: URL.createObjectURL(file),
      fileName: file.name || "team-member.jpg",
      rawFile: file,
    });
  };

  const handleCropComplete = async (croppedBlob: Blob, croppedFileName: string) => {
    const croppedFile = new File([croppedBlob], croppedFileName, {
      type: croppedBlob.type || "image/jpeg",
    });
    closeCropModal();
    await uploadImageFile(croppedFile);
  };

  const handleUseOriginalCrop = async () => {
    const rawFile = cropSource?.rawFile;
    closeCropModal();
    if (rawFile) {
      await uploadImageFile(rawFile);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Name Validation
    if (!formName.trim()) {
      setErrorMessage("Member name is required");
      return;
    }

    // 2. Mandatory Role Validation
    if (!formRole.trim()) {
      setErrorMessage("Role is required");
      return;
    }

    // 3. Mandatory Image Validation
    if (!formImage.trim()) {
      setErrorMessage("Profile photo is mandatory. Please upload or provide an image URL.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: formName.trim(),
        role: formRole.trim(),
        bio: formBio.trim(),
        image: formImage.trim(),
      };

      if (editingMember) {
        // EDIT existing member
        const res = await fetch(`/api/admin/teams/${editingMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to update team member");
        }

        setTeam((prev) =>
          prev.map((m) => (String(m.id) === String(editingMember.id) ? result.data : m))
        );
        setIsModalOpen(false);
        setEditingMember(null);
        setActionSuccess("Team member updated successfully!");
        toast.success("Team member updated successfully!", { title: "Team Updated" });
        setTimeout(() => setActionSuccess(""), 4000);
      } else {
        // CREATE new member
        const res = await fetch("/api/admin/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to add team member");
        }

        setTeam((prev) => [...prev, result.data]);
        setIsModalOpen(false);
        setActionSuccess("Team member added successfully!");
        toast.success("New team member added successfully!", { title: "Member Added" });
        setTimeout(() => setActionSuccess(""), 4000);
      }
    } catch (err: any) {
      console.error("Error saving team member:", err);
      const msg = err.message || "Failed to save team member to database.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Error Saving Member" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string | number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete team member");
      }

      setTeam((prev) => prev.filter((m) => String(m.id) !== String(id)));
      setMemberToDelete(null);
      setActionSuccess("Team member removed successfully!");
      toast.success("Team member removed successfully!", { title: "Member Removed" });
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      console.error("Error deleting member:", err);
      toast.error(err.message || "Failed to remove member from database.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Reusable Admin Sidebar with Teams Active */}
      <AdminSidebar
        activeTab="Teams"
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
                Teams
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                Manage organization team members and roles
              </p>
            </div>

            {/* Add Team Member Button (Right Aligned) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenAddModal}
                className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2.5 rounded-2xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Team Member</span>
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
                onClick={fetchTeamMembers}
                className="underline text-red-700 hover:text-red-900 cursor-pointer text-xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Team Members Table Container */}
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-xs overflow-hidden mb-8">
            <div className="overflow-x-auto table-responsive-container">
              <table className="w-full min-w-[580px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-[#ECE4F2] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">S.No</th>
                    <th className="py-4 px-6">Team Member</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EBF5] text-xs text-[#141010]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-400">
                        <div className="w-7 h-7 border-2 border-[#5D2381]/30 border-t-[#5D2381] rounded-full animate-spin mx-auto mb-2.5" />
                        <span className="text-xs font-semibold text-[#716A7E]">Loading team members from database...</span>
                      </td>
                    </tr>
                  ) : filteredTeam.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-400">
                        <UsersRound className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                        <span className="font-semibold text-gray-600 block text-sm mb-1">No team members found</span>
                        <span className="text-xs text-gray-400">
                          {searchQuery
                            ? "No team members found matching your search."
                            : "No team members published yet. Click 'Add Team Member' above to add one."}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    filteredTeam.map((member, index) => {
                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-[#FAF6FC]/60 transition-colors group"
                        >
                          {/* S.No */}
                          <td className="py-4 px-6 text-gray-500 font-medium text-xs">
                            {index + 1}
                          </td>

                          {/* Member Photo & Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              {/* Photo or Initials Avatar */}
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#EADBFA] text-[#693092] font-bold text-xs flex items-center justify-center shrink-0 border border-[#ECE4F2] shadow-2xs">
                                {member.image ? (
                                  <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  member.initials || (member.name ? member.name.charAt(0).toUpperCase() : "T")
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#141010] text-[13.5px] truncate">
                                  {member.name}
                                </div>
                                {member.bio && (
                                  <div className="text-[11px] text-gray-400 line-clamp-1 max-w-xs mt-0.5">
                                    {member.bio}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role / Designation */}
                          <td className="py-4 px-6">
                            <span className="font-semibold text-[#5D2381] text-[12.5px]">
                              {member.role}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                type="button"
                                onClick={() => setViewingMember(member)}
                                className="p-2 rounded-xl text-gray-400 hover:text-[#5D2381] hover:bg-[#F6EEFA] transition-colors cursor-pointer"
                                title="View Member Profile"
                                aria-label={`View ${member.name}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(member)}
                                className="p-2 rounded-xl text-gray-400 hover:text-[#5D2381] hover:bg-[#F6EEFA] transition-colors cursor-pointer"
                                title="Edit Member"
                                aria-label={`Edit ${member.name}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setMemberToDelete(member)}
                                className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Member"
                                aria-label={`Delete ${member.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Team Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#ECE4F2] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                  {editingMember ? (
                    <Pencil className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <UsersRound className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#141010]">
                    {editingMember ? "Edit Team Member" : "Add Team Member"}
                  </h3>
                  <p className="text-xs text-[#716A7E]">
                    {editingMember
                      ? `Update profile details for "${editingMember.name}"`
                      : "Add a new member to the organization"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingMember(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. Karthik Reddy"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => {
                    setFormRole(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. AI Engineer"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                />
              </div>

              {/* Profile Photo - Mandatory */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                  Profile Photo <span className="text-red-500">*</span>
                </label>

                {formImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E2DBEA] bg-[#FAF8FC] p-2.5 flex items-center gap-3">
                    <img
                      src={formImage}
                      alt="Member Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-black/5 shrink-0 bg-white shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#141010] truncate">
                        {isUploadingImage ? "Uploading cropped photo..." : "Photo Selected"}
                      </p>
                      <p className="text-[11px] text-[#716A7E]">
                        Crop, change, or remove photo
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pr-1">
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => {
                          setCropSource({
                            src: formImage,
                            fileName: formName.trim() || "team-member.jpg",
                            rawFile: null,
                          });
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#5D2381] bg-[#F1E4F8]/70 hover:bg-[#F1E4F8] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Crop photo"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Crop</span>
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-semibold text-[#5D2381] hover:bg-[#F1E4F8] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => {
                          setFormImage("");
                        }}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove photo"
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
                      Click to upload member photo <span className="text-red-500">*</span>
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
                    setEditingMember(null);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {isSubmitting
                      ? editingMember
                        ? "Saving..."
                        : "Adding..."
                      : editingMember
                      ? "Save Changes"
                      : "Add Member"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Team Member Details Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#ECE4F2] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                  <Eye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#141010]">Team Member Profile</h3>
                  <p className="text-xs text-[#716A7E]">View complete profile and details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Avatar & Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#EADBFA] text-[#693092] font-bold text-lg flex items-center justify-center shrink-0 shadow-2xs border border-[#ECE4F2]">
                  {viewingMember.image ? (
                    <img
                      src={viewingMember.image}
                      alt={viewingMember.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    viewingMember.initials
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-[#141010] leading-snug truncate">
                    {viewingMember.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#5D2381] mt-0.5">
                    {viewingMember.role}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-1">About / Bio</span>
                <p className="text-xs text-[#4A4458] leading-relaxed bg-[#FAF8FC] border border-[#ECE4F2] p-3.5 rounded-2xl whitespace-pre-wrap">
                  {viewingMember.bio || "No biography provided for this member."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#ECE4F2] flex items-center justify-end gap-2.5 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  const m = viewingMember;
                  setViewingMember(null);
                  handleOpenEditModal(m);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D2381] hover:bg-[#F6EEFA] transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1A6E] hover-brand-gradient shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-[#141010] mb-1">Delete Team Member</h3>
            <p className="text-xs text-[#716A7E] mb-6">
              Are you sure you want to remove <strong className="text-[#141010]">{memberToDelete.name}</strong> from the team?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setMemberToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMember(memberToDelete.id)}
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
      {/* Interactive Photo Cropper Modal */}
      <ImageCropModal
        isOpen={Boolean(cropSource)}
        imageSrc={cropSource?.src || ""}
        fileName={cropSource?.fileName}
        canUseOriginal={Boolean(cropSource?.rawFile)}
        onUseOriginal={handleUseOriginalCrop}
        onCropComplete={handleCropComplete}
        onClose={closeCropModal}
      />
    </div>
  );
}
