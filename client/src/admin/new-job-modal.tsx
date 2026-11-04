import React, { useState } from "react";
import { X, Save, ChevronDown } from "lucide-react";

export interface NewJobFormData {
  jobId: string;
  title: string;
  category: string;
  location: string;
  employmentType: string;
  experience: string;
  summary: string;
  description: string;
  requirements: string;
  isActive: boolean;
}

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewJobFormData) => void;
  initialData?: Partial<NewJobFormData> | null;
  title?: string;
}

const DEFAULT_CATEGORIES = [
  "AI & ML",
  "Design",
  "Leadership",
  "Marketing",
  "Engineering",
  "Product",
  "Operations",
];

const EMPLOYMENT_TYPES = [
  "Full Time",
  "Part Time",
  "Contract",
  "Internship",
  "Freelance",
];

function NewJobModalDialog({
  onClose,
  onSave,
  initialData,
  title = "New Job Posting",
}: Omit<NewJobModalProps, "isOpen">) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [jobId, setJobId] = useState(initialData?.jobId || "");
  const [jobTitle, setJobTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [employmentType, setEmploymentType] = useState(initialData?.employmentType || "");
  const [experience, setExperience] = useState(initialData?.experience || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [requirements, setRequirements] = useState(initialData?.requirements || "");
  const [isActive, setIsActive] = useState(
    initialData?.isActive !== undefined ? initialData.isActive : true
  );

  const handleAddCategorySubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    if (!categories.includes(trimmed)) {
      setCategories((prev) => [trimmed, ...prev]);
    }
    setCategory(trimmed);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      jobId: jobId.trim() || `NET-JB-${Math.floor(100 + Math.random() * 900)}`,
      title: jobTitle.trim(),
      category: category || "Engineering",
      location: location.trim() || "Hyderabad / Remote",
      employmentType: employmentType || "Full Time",
      experience: experience.trim() || "Entry Level",
      summary: summary.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-4xl lg:max-w-[960px] p-6 sm:p-8 md:p-10 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-left font-['Onest',sans-serif]">
        {/* Header: Title and Close button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] sm:text-[24px] font-bold text-[#141010] tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Row 1: Job ID and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
                Job ID
              </label>
              <input
                type="text"
                placeholder="e.g. NET-ENG-001"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
              />
            </div>

            <div>
              <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
              />
            </div>
          </div>

          {/* Row 2: Category and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-bold text-[#141010]">
                  Category *
                </label>
              </div>

              {isAddingCategory ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="New category..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-[#E2DBEA] text-[13px] focus:outline-none focus:border-[#5D2381]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategorySubmit}
                    className="px-3 py-2 bg-[#5D2381] text-white text-xs font-semibold rounded-xl hover:bg-[#4E1A6E]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-2 py-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] appearance-none pr-10 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8C8498] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            <div>
              <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Hyderabad / Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
              />
            </div>
          </div>

          {/* Row 3: Employment Type and Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
                Employment Type
              </label>
              <div className="relative">
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] appearance-none pr-10 cursor-pointer"
                >
                  <option value="" disabled>
                    Select employment type
                  </option>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8C8498] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
                Experience
              </label>
              <input
                type="text"
                placeholder="e.g. 3+ years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
              />
            </div>
          </div>

          {/* Row 4: Summary */}
          <div>
            <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
              Summary
            </label>
            <input
              type="text"
              placeholder="Brief job summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
            />
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Full job description. Use bullet points with '- ' or '• ' at the start of each line."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
            />
            <p className="text-[11.5px] text-[#787085] mt-1 font-normal">
              Tip: Start lines with &quot;- &quot; or &quot;• &quot; for bullet points
            </p>
          </div>

          {/* Row 6: Requirements */}
          <div>
            <label className="text-[13px] font-bold text-[#141010] mb-1.5 block">
              Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Job requirements. Use bullet points with '- ' or '• ' at the start of each line."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-[#E2DBEA] text-[13.5px] text-[#141010] placeholder-[#A49BAE] focus:outline-none focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381]"
            />
            <p className="text-[11.5px] text-[#787085] mt-1 font-normal">
              Tip: Start lines with &quot;- &quot; or &quot;• &quot; for bullet points
            </p>
          </div>

          {/* Row 7: Active Toggle Switch */}
          <div className="flex items-center pt-1">
            <button
              type="button"
              onClick={() => setIsActive((prev) => !prev)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                isActive ? "bg-[#5D2381]" : "bg-gray-300"
              }`}
              aria-label="Toggle active status"
            >
              <span
                className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-[13px] font-semibold text-[#141010] ml-3 select-none">
              Active
            </span>
          </div>

          {/* Row 8: Action Buttons (Save Job, Cancel on Left) */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="hover-brand-gradient bg-[#5D2381] hover:bg-[#4E1A6E] text-white px-5 py-2.5 rounded-xl font-semibold text-[13.5px] flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Save className="w-4 h-4 stroke-[2]" />
              <span>Save Job</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-[#4A4358] px-5 py-2.5 rounded-xl font-semibold text-[13.5px] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2]" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewJobModal(props: NewJobModalProps) {
  if (!props.isOpen) return null;
  return (
    <NewJobModalDialog
      key={props.initialData?.jobId || "new-job-modal"}
      {...props}
    />
  );
}
