import { useState, useMemo, useEffect } from "react";
import {
  // Search,
  Plus,
  Trash2,
  X,
  Menu,
  AlertTriangle,
  Save,
  Tag,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import { api } from "../services/api.ts";
import type { CategoryItem } from "./admin-dashboard.tsx";
import AdminSidebar from "./sidebar.tsx";
import { toast } from "../componenets/toast.tsx";

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "cat-1",
    name: "AI & ML",
    description: "No description",
  },
  {
    id: "cat-2",
    name: "ML",
    description: "No description",
  },
  {
    id: "cat-3",
    name: "IT Infrastructure",
    description: "No description",
  },
];

export default function CategoryPage() {

  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add Category Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Delete Confirmation Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Fetch categories from API on mount with fallback
  useEffect(() => {
    let isMounted = true;
    api.categories
      .getAll()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Fallback to INITIAL_CATEGORIES if backend is not reachable
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter categories by search term
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (cat) =>
        (cat.name && cat.name.toLowerCase().includes(q)) ||
        (cat.description && cat.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const handleOpenAddModal = () => {
    setNewCategoryName("");
    setNewCategoryDescription("");
    setErrorMessage("");
    setIsAddModalOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setErrorMessage("Category name is required");
      return;
    }

    const descriptionText = newCategoryDescription.trim() || "No description";
    const newCategory: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: trimmedName,
      description: descriptionText,
    };

    // Optimistically update UI
    setCategories((prev) => [...prev, newCategory]);
    setIsAddModalOpen(false);
    toast.success(`Category "${trimmedName}" created successfully!`, { title: "Category Created" });

    // Call API in background
    try {
      await api.categories.save(newCategory);
    } catch {
      // Keep optimistic item in UI
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    const targetId = categoryToDelete.id;
    const catName = categoryToDelete.name;

    // Optimistically remove from state
    setCategories((prev) => prev.filter((c) => c.id !== targetId));
    setCategoryToDelete(null);
    toast.success(`Category "${catName}" deleted successfully!`, { title: "Category Deleted" });

    // Call API in background
    try {
      await api.categories.delete(targetId);
    } catch {
      // Ignored
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar
        activeTab="Categories"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                Categories
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                Create and manage the job categories
              </p>
            </div>

            {/* Add Category Button (Right Aligned) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenAddModal}
                className="hover-brand-gradient bg-[#5D2381] hover:bg-[#4E1C6D] text-white px-5 py-2.5 rounded-2xl text-[13px] sm:text-[13.5px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Categories Grid (matching Image: 3 columns, cards with title, description, and delete button) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-[20px] p-6 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all flex items-start justify-between gap-4"
              >
                {/* Left content: Category title & description */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] sm:text-[18px] font-bold text-[#141010] tracking-tight truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-1 truncate">
                    {cat.description || "No description"}
                  </p>
                </div>

                {/* Right content: Delete icon button */}
                <button
                  onClick={() => setCategoryToDelete(cat)}
                  title={`Delete ${cat.name}`}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#FCA5A5]/60 bg-white hover:bg-red-50 flex items-center justify-center text-[#EF4444] hover:text-[#DC2626] transition-colors shrink-0 cursor-pointer shadow-2xs group"
                >
                  <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.8] group-hover:scale-105 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="bg-white rounded-[20px] p-12 text-center border border-[#ECE4F2] mt-4">
              <Tag className="w-10 h-10 text-[#A69FB1] mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-[#141010]">No categories found</h3>
              <p className="text-sm text-[#716A7E] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No categories matching "${searchQuery}". Try a different keyword.`
                  : "Get started by adding your first job category."}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs font-semibold text-[#5D2381] hover:underline"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={handleOpenAddModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#5D2381] text-white rounded-xl text-xs font-semibold hover:bg-[#4E1C6D] hover-brand-gradient transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: NEW CATEGORY (Matches reference image)
      ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[22px] sm:rounded-[24px] p-6 sm:p-8 max-w-2xl w-full border border-[#ECE4F2] shadow-2xl max-h-[88dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header: Title on left, Close X on right */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#141010] tracking-tight">
                New Category
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#524A60] hover:bg-gray-100 hover:text-[#141010] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-5">
              {/* Field 1: Job Title */}
              <div>
                <label className="block text-[13.5px] sm:text-[14px] font-bold text-[#141010] mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Enter the job title"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  autoFocus
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-[#ECE4F2] text-[13.5px] sm:text-[14px] text-[#141010] placeholder-[#A39BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] transition-colors"
                />
                {errorMessage && (
                  <p className="text-xs text-red-500 mt-1.5">{errorMessage}</p>
                )}
              </div>

              {/* Field 2: Description */}
              <div>
                <label className="block text-[13.5px] sm:text-[14px] font-bold text-[#141010] mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the job description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-[#ECE4F2] text-[13.5px] sm:text-[14px] text-[#141010] placeholder-[#A39BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] transition-colors resize-none"
                />
              </div>

              {/* Action Buttons: Left aligned exactly as shown in screenshot */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient text-white text-[13.5px] sm:text-[14px] font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <Save className="w-4.5 h-4.5 stroke-[2]" />
                  <span>Save Category</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E2DBEA] bg-white text-[#4A4458] hover:bg-gray-50 text-[13.5px] sm:text-[14px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRM DELETE CATEGORY
      ========================================================================= */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-[#ECE4F2] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-[17px] font-bold text-[#141010] text-center">
              Delete Category?
            </h3>
            <p className="text-[13px] text-[#716A7E] text-center mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-[#141010]">"{categoryToDelete.name}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#D5CBE0] text-xs font-semibold text-[#4A4458] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] hover-brand-gradient text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
