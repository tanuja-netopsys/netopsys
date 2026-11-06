import { useState, useRef, useEffect, type ChangeEvent } from "react";
import {
  Save,
  Send,
  Pen,
  Undo2,
  Redo2,
  ChevronDown,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  Link2,
  Unlink,
  Image as ImageIcon,
  Film,
  Smile,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Outdent,
  Indent,
  List,
  ListOrdered,
  Quote,
  Minus,
  MoreHorizontal,
  Menu,
  CheckCircle,
  X,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  RemoveFormatting,
  Table as TableIcon,
  Upload,
  ExternalLink,
  Eye,
  ArrowLeft,
  Sparkles,
  Trash2,
  Pencil,
  Plus,
  Loader2,
} from "lucide-react";
import AdminSidebar from "./sidebar.tsx";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import { toast } from "../componenets/toast.tsx";

// Preset palettes
const TEXT_COLORS = [
  { name: "Default (Charcoal)", value: "#141010" },
  { name: "Muted Gray", value: "#6B7280" },
  { name: "Brand Purple", value: "#5D2381" },
  { name: "Deep Violet", value: "#7C3AED" },
  { name: "Corporate Blue", value: "#2563EB" },
  { name: "Teal Green", value: "#0D9488" },
  { name: "Forest Green", value: "#16A34A" },
  { name: "Crimson Red", value: "#DC2626" },
  { name: "Amber Orange", value: "#EA580C" },
  { name: "Hot Pink", value: "#DB2777" },
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FEF08A" },
  { name: "Soft Purple", value: "#F3E8FF" },
  { name: "Mint Green", value: "#DCFCE7" },
  { name: "Sky Blue", value: "#E0F2FE" },
  { name: "Blush Pink", value: "#FCE7F3" },
  { name: "Warm Peach", value: "#FFEDD5" },
  { name: "None", value: "transparent" },
];

const FONT_FAMILIES = [
  { name: "Default (System)", value: "'Onest', -apple-system, BlinkMacSystemFont, sans-serif" },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
];

const FONT_SIZES = [
  { label: "10px", value: "10px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px (Normal)", value: "16px" },
  { label: "18px (Medium)", value: "18px" },
  { label: "20px (Large)", value: "20px" },
  { label: "24px (X-Large)", value: "24px" },
  { label: "32px (Huge)", value: "32px" },
];

const BLOCK_FORMATS = [
  { label: "Paragraph", tag: "<p>" },
  { label: "Heading 1", tag: "<h1>" },
  { label: "Heading 2", tag: "<h2>" },
  { label: "Heading 3", tag: "<h3>" },
  { label: "Heading 4", tag: "<h4>" },
  { label: "Code Block", tag: "<pre>" },
];

const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "😍", "🥰", "😘", "😋", "😜", "🤓", "😎", "🥳", "🤩", "🤔",
  "👍", "👎", "👏", "🙌", "🤝", "✌️", "🤞", "👊", "❤️", "🔥",
  "🚀", "⭐", "✨", "⚡", "💡", "🎯", "📝", "📌", "💼", "💻",
  "📊", "🎉", "💯", "✅", "⚠️", "❓", "❗", "🏆", "🌐", "🔗",
];

const INITIAL_CONTENT = "";

export default function BlogsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isHtmlView] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Editor toolbar active states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isBlockquote, setIsBlockquote] = useState(false);
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");
  const [formatType, setFormatType] = useState("Paragraph");
  const [currentFont, setCurrentFont] = useState("Default (System)");
  const [currentSize, setCurrentSize] = useState("16px (Normal)");
  const [currentColor, setCurrentColor] = useState("#5D2381");

  // Dropdowns visibility
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab view: "write" | "manage" (Default to All Blogs page)
  const [activeAdminTab, setActiveAdminTab] = useState<"write" | "manage">("manage");
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Metadata state
  const [customTag, setCustomTag] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [graphicVariant, setGraphicVariant] = useState<"featured" | "ml" | "nlp" | "erp">("featured");
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState("");

  // Blog Management State
  const [blogList, setBlogList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const searchFilter = "";
  const [blogToDelete, setBlogToDelete] = useState<any | null>(null);
  const [viewingBlog, setViewingBlog] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    toast.success(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchAdminBlogs = async () => {
    try {
      setIsLoadingList(true);
      const res = await fetch("/api/admin/blogs?all=true");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setBlogList(json.data);
      }
    } catch (err) {
      console.error("Error fetching admin blogs:", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAdminBlogs();
  }, []);

  const resetEditor = () => {
    setEditingBlogId(null);
    setTitle("");
    setCustomTag("");
    setExcerpt("");
    setAuthorName("");
    setAuthorRole("");
    setGraphicVariant("featured");
    setIsFeatured(false);
    setCoverImage("");
    setHtmlContent("");
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setWordCount(0);
    setCharCount(0);
  };

  const stripHtmlText = (html: string) => {
    return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  };

  const handleSaveOrPublish = async (status: "Published" | "Draft") => {
    if (!title.trim()) {
      showToast("Please enter a blog title before proceeding.");
      return;
    }

    const currentHtml = isHtmlView
      ? htmlContent
      : editorRef.current
      ? editorRef.current.innerHTML
      : "";

    if (!stripHtmlText(currentHtml).trim()) {
      showToast("Please enter some content for the blog post.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: currentHtml,
        tag: customTag.trim() || "",
        excerpt: excerpt.trim() || (stripHtmlText(currentHtml).slice(0, 160) + "..."),
        authorName: authorName.trim() || "",
        authorRole: authorRole.trim() || "",
        graphicVariant,
        image: coverImage || null,
        isFeatured,
        status,
      };

      const url = editingBlogId
        ? `/api/admin/blogs/${editingBlogId}`
        : `/api/admin/blogs`;
      const method = editingBlogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save blog post");
      }

      showToast(
        editingBlogId
          ? "Blog post updated successfully!"
          : status === "Draft"
          ? "Draft saved successfully!"
          : "Blog post published successfully!"
      );

      await fetchAdminBlogs();

      if (status === "Published") {
        resetEditor();
        setActiveAdminTab("manage");
      }
    } catch (err: any) {
      console.error("Save blog error:", err);
      showToast(err.message || "Error saving blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBlog = (blog: any) => {
    const content = blog.content || "";
    setEditingBlogId(blog.id);
    setTitle(blog.title || "");
    setCustomTag(blog.tag || "");
    setExcerpt(blog.excerpt || "");
    setAuthorName(blog.author?.name || blog.authorName || "");
    setAuthorRole(blog.author?.role || blog.authorRole || "");
    setGraphicVariant(blog.graphicVariant || "featured");
    setIsFeatured(Boolean(blog.isFeatured));
    setCoverImage(blog.image || "");
    setHtmlContent(content);

    if (editorRef.current) {
      editorRef.current.innerHTML = content;
      const text = editorRef.current.innerText || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
    }
    setActiveAdminTab("write");

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        const text = editorRef.current.innerText || "";
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
        setCharCount(text.length);
      }
    }, 20);

    showToast(`Loaded "${(blog.title || "").slice(0, 24)}..." for editing`);
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${blogToDelete.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete blog post");
      }
      showToast("Blog post deleted successfully");
      setBlogList((prev) => prev.filter((b) => b.id !== blogToDelete.id));
      setBlogToDelete(null);
    } catch (err: any) {
      console.error("Delete blog error:", err);
      showToast(err.message || "Failed to delete blog");
    } finally {
      setIsDeleting(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-toolbar-dropdown]")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update counts whenever editor content changes
  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  // Synchronize editor content on initial mount or when editing a blog
  useEffect(() => {
    if (editorRef.current) {
      if (editingBlogId !== null && htmlContent) {
        editorRef.current.innerHTML = htmlContent;
        updateCounts();
      } else if (!editorRef.current.innerHTML) {
        editorRef.current.innerHTML = INITIAL_CONTENT;
        updateCounts();
      }
    }
  }, [editingBlogId, activeAdminTab]);

  // Save current selection range before opening modal dialogs
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore saved selection
  const restoreSelection = () => {
    if (savedRangeRef.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  // Check and sync active formats with current cursor selection
  const updateActiveFormats = () => {
    if (typeof document === "undefined") return;
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsStrikethrough(document.queryCommandState("strikeThrough"));
      setIsBulletList(document.queryCommandState("insertUnorderedList"));
      setIsOrderedList(document.queryCommandState("insertOrderedList"));

      if (document.queryCommandState("justifyCenter")) setAlignment("center");
      else if (document.queryCommandState("justifyRight")) setAlignment("right");
      else if (document.queryCommandState("justifyFull")) setAlignment("justify");
      else setAlignment("left");

      // Format block (heading / paragraph)
      const block = (document.queryCommandValue("formatBlock") || "").toLowerCase();
      if (block.includes("h1")) setFormatType("Heading 1");
      else if (block.includes("h2")) setFormatType("Heading 2");
      else if (block.includes("h3")) setFormatType("Heading 3");
      else if (block.includes("h4")) setFormatType("Heading 4");
      else if (block.includes("pre")) setFormatType("Code Block");
      else setFormatType("Paragraph");

      // Font Family
      const font = document.queryCommandValue("fontName");
      if (font) {
        const cleanFont = font.replace(/['"]/g, "");
        const matched = FONT_FAMILIES.find((f) => f.name.toLowerCase().includes(cleanFont.toLowerCase()) || cleanFont.toLowerCase().includes(f.name.toLowerCase()));
        if (matched) setCurrentFont(matched.name);
      }

      // Check for blockquote ancestor
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        let parent: Node | null = sel.anchorNode;
        let isQuote = false;
        while (parent && parent !== editorRef.current) {
          if (parent.nodeName === "BLOCKQUOTE") {
            isQuote = true;
            break;
          }
          parent = parent.parentNode;
        }
        setIsBlockquote(isQuote);
      }
    } catch {
      // Ignored if queryCommandState is unsupported in edge cases
    }
    updateCounts();
  };

  // Execute standard editor command
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(cmd, false, val);
    updateActiveFormats();
  };

  // Insert arbitrary HTML fragment at current selection
  const insertHTML = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
    }
    document.execCommand("insertHTML", false, html);
    updateCounts();
    updateActiveFormats();
  };

  // Toggle dropdown helper
  const toggleDropdown = (name: string) => {
    saveSelection();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  // Font Size Applier
  const handleApplyFontSize = (sizePx: string, label: string) => {
    setCurrentSize(label);
    setActiveDropdown(null);
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      // If nothing selected, format using font size command
      execCmd("fontSize", "4");
      return;
    }
    const range = sel.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = sizePx;
    span.appendChild(range.extractContents());
    range.insertNode(span);
    updateActiveFormats();
  };

  // Pen Styles
  const handleSelectPenStyle = (styleType: "normal" | "marker" | "blue" | "red" | "callout") => {
    setActiveDropdown(null);
    restoreSelection();
    if (styleType === "normal") {
      execCmd("foreColor", "#141010");
      execCmd("hiliteColor", "transparent");
      showToast("Pen set to Normal Text");
    } else if (styleType === "marker") {
      execCmd("hiliteColor", "#FEF08A");
      showToast("Marker Pen (Yellow Highlight) enabled");
    } else if (styleType === "blue") {
      execCmd("foreColor", "#1E40AF");
      showToast("Blue Ink Pen enabled");
    } else if (styleType === "red") {
      execCmd("foreColor", "#DC2626");
      showToast("Red Pen enabled");
    } else if (styleType === "callout") {
      insertHTML(
        `<div class="my-4 p-4 rounded-xl border border-[#D8B4FE] bg-[#FAF5FF] flex items-start gap-3 shadow-xs"><span class="text-xl leading-none">✍️</span><div class="flex-1 text-[#4A4458] text-[14.5px] leading-relaxed"><strong>Note:</strong> Enter important callout note or key point here...</div></div><p><br></p>`
      );
      showToast("Callout Note Card inserted!");
    }
  };

  // Link Dialog Handlers
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    setLinkText(selectedText);
    setLinkUrl("");
    setLinkModalOpen(true);
  };

  const handleApplyLink = () => {
    setLinkModalOpen(false);
    restoreSelection();
    if (!linkUrl.trim()) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    const sel = window.getSelection();
    if (sel && sel.isCollapsed && linkText.trim()) {
      insertHTML(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#5D2381] underline font-medium hover:text-[#431660]">${linkText}</a>`);
    } else {
      execCmd("createLink", url);
    }
    showToast("Link added successfully!");
  };

  const handleRemoveLink = () => {
    setLinkModalOpen(false);
    restoreSelection();
    execCmd("unlink");
    showToast("Link removed");
  };

  // Image Upload Handlers
  const handleOpenImageUpload = () => {
    setActiveDropdown(null);
    saveSelection();
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        insertHTML(
          `<div class="my-5 text-center"><img src="${data.url}" alt="${file.name}" class="max-w-full rounded-2xl mx-auto shadow-sm inline-block border border-[#ECE4F2]" /><p class="text-xs text-[#716A7E] mt-1.5 italic">${file.name}</p></div><p><br></p>`
        );
        showToast("Image uploaded and inserted!");
        e.target.value = "";
        return;
      }
    } catch (err) {
      console.warn("Direct upload failed, falling back to data URL:", err);
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const src = loadEvent.target?.result as string;
      insertHTML(
        `<div class="my-5 text-center"><img src="${src}" alt="${file.name}" class="max-w-full rounded-2xl mx-auto shadow-sm inline-block border border-[#ECE4F2]" /><p class="text-xs text-[#716A7E] mt-1.5 italic">${file.name}</p></div><p><br></p>`
      );
      showToast("Image uploaded and inserted!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInsertImageUrl = () => {
    setImageModalOpen(false);
    if (!imageUrl.trim()) return;
    restoreSelection();
    insertHTML(
      `<div class="my-5 text-center"><img src="${imageUrl}" alt="${imageAlt || "Blog Image"}" class="max-w-full rounded-2xl mx-auto shadow-sm inline-block border border-[#ECE4F2]" />${imageAlt ? `<p class="text-xs text-[#716A7E] mt-1.5 italic">${imageAlt}</p>` : ""}</div><p><br></p>`
    );
    setImageUrl("");
    setImageAlt("");
    showToast("Image inserted!");
  };

  // Video Insert Handler
  const handleInsertVideo = () => {
    setVideoModalOpen(false);
    if (!videoUrl.trim()) return;
    restoreSelection();

    // YouTube regex detection
    const ytMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      insertHTML(
        `<div class="my-6 aspect-video w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-md border border-[#ECE4F2]"><iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`
      );
      showToast("YouTube video embedded!");
    } else {
      insertHTML(
        `<div class="my-6 max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-md"><video controls class="w-full rounded-2xl"><source src="${videoUrl}" type="video/mp4" />Your browser does not support the video tag.</video></div><p><br></p>`
      );
      showToast("Video inserted!");
    }
    setVideoUrl("");
  };

  // Emoji Insert Handler
  const handleInsertEmoji = (emoji: string) => {
    setActiveDropdown(null);
    restoreSelection();
    insertHTML(`<span>${emoji}</span>&nbsp;`);
  };

  // Code Block Insert Handler
  const handleInsertCodeBlock = () => {
    setActiveDropdown(null);
    restoreSelection();
    insertHTML(
      `<pre class="bg-[#1E1B2E] text-[#E0E7FF] p-4 rounded-xl font-mono text-[13.5px] leading-relaxed my-4 overflow-x-auto border border-[#3B3355]"><code>// Write or paste your code snippet here\nfunction calculateNetopsysMetrics() {\n  return { status: "Active", latency: "12ms" };\n}</code></pre><p><br></p>`
    );
    showToast("Code block added!");
  };

  const handleInsertInlineCode = () => {
    setActiveDropdown(null);
    restoreSelection();
    const sel = window.getSelection();
    const text = sel ? sel.toString() : "code";
    insertHTML(`<code class="bg-[#F3E8FF] text-[#5D2381] font-mono text-[13px] px-1.5 py-0.5 rounded border border-[#E9D5FF] font-semibold">${text || "code"}</code>&nbsp;`);
  };

  // Table Insert Handler
  const handleInsertTable = () => {
    setTableModalOpen(false);
    restoreSelection();
    const rows = Math.max(1, Math.min(tableRows, 10));
    const cols = Math.max(1, Math.min(tableCols, 8));

    let tableHtml = `<div class="my-5 overflow-x-auto"><table class="w-full border-collapse border border-[#D5CBE0] rounded-xl overflow-hidden text-sm"><thead><tr class="bg-[#F8F3FA]">`;
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th class="border border-[#D5CBE0] p-2.5 text-left font-bold text-[#4A4458]">Header ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      tableHtml += `<tr>`;
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td class="border border-[#D5CBE0] p-2.5 text-[#141010]">Row ${r}, Col ${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table></div><p><br></p>`;
    insertHTML(tableHtml);
    showToast(`Table (${rows}x${cols}) inserted!`);
  };

  // Format block changer
  const handleSelectFormatBlock = (tag: string, label: string) => {
    setFormatType(label);
    setActiveDropdown(null);
    restoreSelection();
    execCmd("formatBlock", tag);
  };

  // Font family changer
  const handleSelectFont = (fontFamily: string, label: string) => {
    setCurrentFont(label);
    setActiveDropdown(null);
    restoreSelection();
    execCmd("fontName", fontFamily);
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        execCmd("outdent");
      } else {
        execCmd("indent");
      }
    }
  };

  const handleSaveDraft = () => {
    handleSaveOrPublish("Draft");
  };

  const handlePublish = () => {
    handleSaveOrPublish("Published");
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Hidden file input for uploading images */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Embedded CSS for Rich Word Document typography */}
      <style>{`
        .word-doc-sheet h1 { font-size: 1.85rem; font-weight: 700; color: #141010; margin-top: 1.25rem; margin-bottom: 0.6rem; line-height: 1.3; }
        .word-doc-sheet h2 { font-size: 1.45rem; font-weight: 700; color: #141010; margin-top: 1.1rem; margin-bottom: 0.5rem; line-height: 1.35; }
        .word-doc-sheet h3 { font-size: 1.2rem; font-weight: 600; color: #2D253A; margin-top: 0.9rem; margin-bottom: 0.4rem; }
        .word-doc-sheet h4 { font-size: 1.05rem; font-weight: 600; color: #3E344F; margin-top: 0.75rem; margin-bottom: 0.35rem; }
        .word-doc-sheet p { margin-bottom: 0.85rem; line-height: 1.7; color: #141010; font-size: 15px; }
        .word-doc-sheet ul { list-style-type: disc; margin-left: 1.75rem; margin-bottom: 0.9rem; }
        .word-doc-sheet ol { list-style-type: decimal; margin-left: 1.75rem; margin-bottom: 0.9rem; }
        .word-doc-sheet li { margin-bottom: 0.35rem; line-height: 1.6; }
        .word-doc-sheet blockquote { border-left: 4px solid #5D2381; padding: 0.75rem 1.25rem; background: #FAF5FF; font-style: italic; color: #4A4458; margin: 1rem 0; border-radius: 0 0.75rem 0.75rem 0; font-size: 15.5px; }
        .word-doc-sheet pre { background: #1E1B2E; color: #E0E7FF; padding: 1rem 1.25rem; border-radius: 0.875rem; font-family: monospace; font-size: 13.5px; overflow-x: auto; margin: 1rem 0; }
        .word-doc-sheet code { background: #F3E8FF; color: #5D2381; padding: 0.15rem 0.4rem; border-radius: 0.35rem; font-size: 0.9em; font-family: monospace; font-weight: 600; }
        .word-doc-sheet a { color: #5D2381; text-decoration: underline; font-weight: 500; cursor: pointer; }
        .word-doc-sheet a:hover { color: #431660; }
        .word-doc-sheet table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .word-doc-sheet th, .word-doc-sheet td { border: 1px solid #D5CBE0; padding: 0.6rem 0.8rem; }
        .word-doc-sheet hr { border: none; border-top: 2px solid #E3DAEC; margin: 1.5rem 0; }
        .word-doc-sheet:empty:before { content: "Start writing your blog or document here..."; color: #A49BAF; pointer-events: none; }
      `}</style>

      {/* Admin Sidebar with 'Blog' active */}
      <AdminSidebar
        activeTab="Blog"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#ECE4F2] px-4 py-3 flex items-center justify-between shrink-0">
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
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-7">
          {/* ===================================================================
              WRITE A BLOG VIEW (Always kept in DOM so editorRef and content are preserved)
          =================================================================== */}
          <div className={activeAdminTab === "write" ? "block" : "hidden"}>
            {/* Top Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editingBlogId) resetEditor();
                        setActiveAdminTab("manage");
                      }}
                      className="p-1.5 -ml-1.5 rounded-xl hover:bg-[#F6EEFA] text-gray-500 hover:text-[#5D2381] transition-colors cursor-pointer"
                      title="Back to All Blogs"
                      aria-label="Back to All Blogs"
                    >
                      <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                    </button>
                    <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                      {editingBlogId ? "Edit Blog Post" : "Write a Blog"}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EADBFA] text-[#5D2381]">
                      <Sparkles className="w-3 h-3" />
                      {editingBlogId ? `Post #${editingBlogId}` : "Word Document Mode"}
                    </span>
                  </div>
                  <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                    Create and publish a formatted rich blog post with interactive icons
                  </p>
                </div>

                {/* Action Buttons: Save Draft & Publish */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingBlogId) resetEditor();
                      setActiveAdminTab("manage");
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl border border-[#E2DBEA] bg-white text-[13px] font-semibold text-[#554E62] hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  {/* Save Draft Button */}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2DBEA] bg-white text-[13px] font-semibold text-[#141010] hover:bg-gray-50 hover:border-[#D5CBE0] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-[#4A4458] stroke-[2]" />
                    <span>Save Draft</span>
                  </button>

                  {/* Publish Button */}
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient text-white text-[13px] font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-white stroke-[2]" />
                    )}
                    <span>{editingBlogId ? "Update Blog" : "Publish"}</span>
                  </button>
                </div>
              </div>

              {/* Sticky Toolbar Card: Title Input + Full Rich Editor Toolbar matching screenshot */}
              <div className="bg-white rounded-2xl sm:rounded-[22px] border border-[#ECE4F2] shadow-[0_4px_16px_rgba(0,0,0,0.03)] p-5 sm:p-6 mb-6">
                {/* Title Input */}
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-[22px] sm:text-[26px] font-semibold text-[#141010] placeholder-[#A49BAF] focus:outline-none bg-transparent"
                  />
                </div>

                {/* Horizontal subtle purple/gray line matching screenshot */}
                <div className="w-full h-[1.5px] bg-[#E3DAEC] my-3.5" />

            {/* Rich Editor Toolbar matching screenshot icons & layout */}
            <div className="flex items-center flex-wrap gap-1 sm:gap-1.5 text-[#544862] select-none">
              {/* 1. Pen tool with dropdown */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("pen")}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer ${
                    activeDropdown === "pen" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title="Pen & Marker Styles"
                >
                  <Pen className="w-4.5 h-4.5 stroke-[1.9]" />
                  <ChevronDown className="w-3 h-3 text-[#716A7E]" />
                </button>
                {activeDropdown === "pen" && (
                  <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-1.5 z-30">
                    <div className="text-[11px] font-bold text-[#8E869B] px-2.5 py-1 uppercase tracking-wider">
                      Pen Styles
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPenStyle("normal")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#141010]" />
                      <span>Normal Text Pen</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPenStyle("marker")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FEF08A] border border-yellow-400" />
                      <span>Fluorescent Marker</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPenStyle("blue")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]" />
                      <span>Blue Ballpoint Pen</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPenStyle("red")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                      <span>Red Correction Pen</span>
                    </button>
                    <div className="h-px bg-[#ECE4F2] my-1" />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPenStyle("callout")}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#FAF5FF] text-[#5D2381] font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <span>✍️ Insert Callout Note</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 2. Undo & Redo */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("undo")}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors cursor-pointer text-[#544862]"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("redo")}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors cursor-pointer text-[#544862]"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 3. Font Family Dropdown [A] */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("fontFamily")}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    activeDropdown === "fontFamily" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title={`Font Family: ${currentFont}`}
                >
                  <span className="w-5 h-5 rounded-md border border-[#C5BACF] text-[12px] font-bold flex items-center justify-center text-[#544862] leading-none">
                    A
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#716A7E]" />
                </button>
                {activeDropdown === "fontFamily" && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#ECE4F2] py-1.5 z-30 max-h-60 overflow-y-auto">
                    <div className="text-[11px] font-bold text-[#8E869B] px-3 py-1 uppercase tracking-wider">
                      Font Family
                    </div>
                    {FONT_FAMILIES.map((f) => (
                      <button
                        key={f.name}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectFont(f.value, f.name)}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          currentFont === f.name ? "bg-[#F1E4F8] text-[#5D2381] font-bold" : "text-[#4A4458] hover:bg-gray-50"
                        }`}
                        style={{ fontFamily: f.value }}
                      >
                        <span>{f.name}</span>
                        {currentFont === f.name && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Font Size Dropdown [Tt] */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("fontSize")}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer ${
                    activeDropdown === "fontSize" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title={`Font Size: ${currentSize}`}
                >
                  <span className="text-[14px] font-bold tracking-tighter text-[#544862] px-0.5 flex items-baseline leading-none">
                    T<span className="text-[10px]">t</span>
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#716A7E]" />
                </button>
                {activeDropdown === "fontSize" && (
                  <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-[#ECE4F2] py-1.5 z-30">
                    <div className="text-[11px] font-bold text-[#8E869B] px-3 py-1 uppercase tracking-wider">
                      Font Size
                    </div>
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleApplyFontSize(size.value, size.label)}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          currentSize === size.label ? "bg-[#F1E4F8] text-[#5D2381] font-bold" : "text-[#4A4458] hover:bg-gray-50"
                        }`}
                      >
                        <span>{size.label}</span>
                        {currentSize === size.label && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Heading / Paragraph Dropdown */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("formatBlock")}
                  className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer text-[13.5px] font-normal ${
                    activeDropdown === "formatBlock" ? "bg-[#F1E4F8] text-[#5D2381] font-semibold" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                >
                  <span>{formatType}</span>
                  <ChevronDown className="w-3 h-3 text-[#716A7E]" />
                </button>
                {activeDropdown === "formatBlock" && (
                  <div className="absolute left-0 top-full mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-[#ECE4F2] py-1.5 z-30">
                    {BLOCK_FORMATS.map((fmt) => (
                      <button
                        key={fmt.label}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectFormatBlock(fmt.tag, fmt.label)}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          formatType === fmt.label ? "bg-[#F1E4F8] text-[#5D2381] font-bold" : "text-[#4A4458] hover:bg-gray-50"
                        }`}
                      >
                        <span>{fmt.label}</span>
                        {formatType === fmt.label && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 6. Inline Format Toggles */}
              <div className="flex items-center gap-1">
                {/* Bold */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCmd("bold")}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-[13.5px] font-bold ${
                    isBold
                      ? "bg-[#F1E4F8] text-[#5D2381]"
                      : "text-[#544862] hover:bg-[#F9F5FC]"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  B
                </button>

                {/* Italic */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCmd("italic")}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer text-[13.5px] font-bold italic font-serif ${
                    isItalic
                      ? "bg-[#F1E4F8] text-[#5D2381]"
                      : "text-[#544862] hover:bg-[#F9F5FC]"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  I
                </button>

                {/* Underline */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCmd("underline")}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isUnderline
                      ? "bg-[#F1E4F8] text-[#5D2381]"
                      : "text-[#544862] hover:bg-[#F9F5FC]"
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <UnderlineIcon className="w-4.5 h-4.5 stroke-[1.9]" />
                </button>

                {/* Strikethrough */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => execCmd("strikeThrough")}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    isStrikethrough
                      ? "bg-[#F1E4F8] text-[#5D2381]"
                      : "text-[#544862] hover:bg-[#F9F5FC]"
                  }`}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-4.5 h-4.5 stroke-[1.9]" />
                </button>

                {/* Text Color A with purple line */}
                <div className="relative" data-toolbar-dropdown>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleDropdown("textColor")}
                    className={`w-7 h-7 rounded-lg transition-colors flex flex-col items-center justify-center cursor-pointer ${
                      activeDropdown === "textColor" ? "bg-[#F1E4F8]" : "hover:bg-[#F9F5FC]"
                    }`}
                    title="Text Color"
                  >
                    <span className="text-[13px] font-bold text-[#141010] leading-none">A</span>
                    <span
                      className="w-4 h-[2.5px] rounded-full mt-0.5 transition-colors"
                      style={{ backgroundColor: currentColor }}
                    />
                  </button>
                  {activeDropdown === "textColor" && (
                    <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-2 z-30">
                      <div className="text-[11px] font-bold text-[#8E869B] px-1 py-0.5 mb-1.5 uppercase tracking-wider">
                        Text Color
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 mb-2">
                        {TEXT_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setCurrentColor(c.value);
                              setActiveDropdown(null);
                              restoreSelection();
                              execCmd("foreColor", c.value);
                            }}
                            className="w-6 h-6 rounded-md border border-gray-200 transition-transform hover:scale-110 cursor-pointer shadow-2xs"
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      {/* Native Color Picker */}
                      <div className="pt-1 border-t border-[#ECE4F2] flex items-center justify-between text-xs text-[#544862]">
                        <span>Custom:</span>
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => {
                            setCurrentColor(e.target.value);
                            restoreSelection();
                            execCmd("foreColor", e.target.value);
                          }}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Highlighter Tool */}
                <div className="relative" data-toolbar-dropdown>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleDropdown("highlighter")}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeDropdown === "highlighter" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                    }`}
                    title="Highlight Background Color"
                  >
                    <Highlighter className="w-4.5 h-4.5 stroke-[1.9]" />
                  </button>
                  {activeDropdown === "highlighter" && (
                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-2 z-30">
                      <div className="text-[11px] font-bold text-[#8E869B] px-1 py-0.5 mb-1.5 uppercase tracking-wider">
                        Highlighter
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {HIGHLIGHT_COLORS.map((h) => (
                          <button
                            key={h.name}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setActiveDropdown(null);
                              restoreSelection();
                              execCmd("hiliteColor", h.value);
                            }}
                            className={`w-7 h-7 rounded-md border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                              h.value === "transparent" ? "border-gray-300 bg-white" : "border-gray-200"
                            }`}
                            style={{ backgroundColor: h.value }}
                            title={h.name}
                          >
                            {h.value === "transparent" && <X className="w-3 h-3 text-red-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 7. Media & Links */}
              {/* Link */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleOpenLinkModal}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors cursor-pointer text-[#544862]"
                title="Insert or Edit Link"
              >
                <Link2 className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Image with caret */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("image")}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer ${
                    activeDropdown === "image" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title="Insert Image"
                >
                  <ImageIcon className="w-4.5 h-4.5 stroke-[1.9]" />
                  <ChevronDown className="w-3 h-3 text-[#716A7E]" />
                </button>
                {activeDropdown === "image" && (
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-1.5 z-30">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleOpenImageUpload}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#5D2381]" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setActiveDropdown(null);
                        saveSelection();
                        setImageModalOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#5D2381]" />
                      <span>Insert via URL</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Video / Movie Clapper with caret */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  saveSelection();
                  setVideoModalOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors flex items-center gap-0.5 cursor-pointer text-[#544862]"
                title="Embed Video / YouTube"
              >
                <Film className="w-4.5 h-4.5 stroke-[1.9]" />
                <ChevronDown className="w-3 h-3 text-[#716A7E]" />
              </button>

              {/* Smile / Emoji */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("emoji")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeDropdown === "emoji" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title="Insert Emoji"
                >
                  <Smile className="w-4.5 h-4.5 stroke-[1.9]" />
                </button>
                {activeDropdown === "emoji" && (
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-2.5 z-30">
                    <div className="text-[11px] font-bold text-[#8E869B] px-1 py-0.5 mb-1.5 uppercase tracking-wider">
                      Popular Emojis
                    </div>
                    <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertEmoji(emoji)}
                          className="w-8 h-8 rounded-lg hover:bg-[#F3E8FF] text-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-115"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Code <> */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("code")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeDropdown === "code" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title="Code Formatting"
                >
                  <Code className="w-4.5 h-4.5 stroke-[1.9]" />
                </button>
                {activeDropdown === "code" && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-1.5 z-30">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleInsertInlineCode}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] cursor-pointer"
                    >
                      Inline Code
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleInsertCodeBlock}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] cursor-pointer"
                    >
                      Code Snippet Block
                    </button>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 8. Text Alignment with caret */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("align")}
                  className={`p-1.5 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer ${
                    activeDropdown === "align" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title={`Alignment: ${alignment}`}
                >
                  {alignment === "left" && <AlignLeft className="w-4.5 h-4.5 stroke-[1.9]" />}
                  {alignment === "center" && <AlignCenter className="w-4.5 h-4.5 stroke-[1.9]" />}
                  {alignment === "right" && <AlignRight className="w-4.5 h-4.5 stroke-[1.9]" />}
                  {alignment === "justify" && <AlignJustify className="w-4.5 h-4.5 stroke-[1.9]" />}
                  <ChevronDown className="w-3 h-3 text-[#716A7E]" />
                </button>
                {activeDropdown === "align" && (
                  <div className="absolute left-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-1 flex gap-1 z-30">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setAlignment("left");
                        setActiveDropdown(null);
                        execCmd("justifyLeft");
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        alignment === "left" ? "bg-[#F1E4F8] text-[#5D2381]" : "text-[#4A4458] hover:bg-gray-50"
                      }`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setAlignment("center");
                        setActiveDropdown(null);
                        execCmd("justifyCenter");
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        alignment === "center" ? "bg-[#F1E4F8] text-[#5D2381]" : "text-[#4A4458] hover:bg-gray-50"
                      }`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setAlignment("right");
                        setActiveDropdown(null);
                        execCmd("justifyRight");
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        alignment === "right" ? "bg-[#F1E4F8] text-[#5D2381]" : "text-[#4A4458] hover:bg-gray-50"
                      }`}
                      title="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setAlignment("justify");
                        setActiveDropdown(null);
                        execCmd("justifyFull");
                      }}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        alignment === "justify" ? "bg-[#F1E4F8] text-[#5D2381]" : "text-[#4A4458] hover:bg-gray-50"
                      }`}
                      title="Justify"
                    >
                      <AlignJustify className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 9. Indent / Outdent */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("outdent")}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors cursor-pointer text-[#544862]"
                title="Decrease Indent (Shift+Tab)"
              >
                <Outdent className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("indent")}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors cursor-pointer text-[#544862]"
                title="Increase Indent (Tab)"
              >
                <Indent className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 10. Bullet list */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("insertUnorderedList")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isBulletList ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                }`}
                title="Bulleted List"
              >
                <List className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Numbered list */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("insertOrderedList")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isOrderedList ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                }`}
                title="Numbered List"
              >
                <ListOrdered className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Quote */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  execCmd("formatBlock", isBlockquote ? "<p>" : "<blockquote>");
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isBlockquote ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                }`}
                title="Blockquote"
              >
                <Quote className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Horizontal line divider */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("insertHorizontalRule")}
                className="p-1.5 rounded-lg hover:bg-[#F9F5FC] transition-colors cursor-pointer text-[#544862]"
                title="Insert Horizontal Divider"
              >
                <Minus className="w-4.5 h-4.5 stroke-[1.9]" />
              </button>

              {/* Vertical Divider */}
              <div className="h-5 w-px bg-[#E3DAEC] mx-1" />

              {/* 11. More options (...) */}
              <div className="relative" data-toolbar-dropdown>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleDropdown("more")}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeDropdown === "more" ? "bg-[#F1E4F8] text-[#5D2381]" : "hover:bg-[#F9F5FC] text-[#544862]"
                  }`}
                  title="More Formatting & Word Tools"
                >
                  <MoreHorizontal className="w-4.5 h-4.5 stroke-[1.9]" />
                </button>
                {activeDropdown === "more" && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-[#ECE4F2] p-1.5 z-30">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setActiveDropdown(null);
                        saveSelection();
                        setTableModalOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <TableIcon className="w-3.5 h-3.5 text-[#5D2381]" />
                      <span>Insert Table</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setActiveDropdown(null);
                        execCmd("subscript");
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <SubscriptIcon className="w-3.5 h-3.5" />
                      <span>Subscript (X₂)</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setActiveDropdown(null);
                        execCmd("superscript");
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <SuperscriptIcon className="w-3.5 h-3.5" />
                      <span>Superscript (X²)</span>
                    </button>
                    <div className="h-px bg-[#ECE4F2] my-1" />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setActiveDropdown(null);
                        execCmd("removeFormat");
                        showToast("Formatting cleared");
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#DC2626] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <RemoveFormatting className="w-3.5 h-3.5" />
                      <span>Clear Formatting</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setActiveDropdown(null);
                        execCmd("selectAll");
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#F9F5FC] text-[#141010] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Select All (Ctrl+A)</span>
                    </button>
                    <div className="h-px bg-[#ECE4F2] my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        window.print();
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-[#FAF5FF] text-[#5D2381] font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <span>🖨️ Print / Save as PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Word Document Sheet Canvas */}
          <div className="w-full pb-16">
            <div
              className="w-full min-h-[640px] bg-white rounded-2xl sm:rounded-3xl border border-[#ECE4F2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col relative transition-all duration-200"
            >
              {/* Word Document Top Header Ruler Bar */}
              <div className="px-6 py-2.5 border-b border-[#ECE4F2] flex items-center justify-between text-xs text-[#716A7E] bg-[#FCFAFE] rounded-t-2xl sm:rounded-t-3xl">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#5D2381] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Word Document Sheet
                  </span>
                  <span>|</span>
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span>{charCount} characters</span>
                  <span>•</span>
                  <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
                </div>
              </div>

              {/* Editable Writing Area or HTML Code View */}
              <div className="p-7 sm:p-10 flex-1 flex flex-col">
                {isHtmlView ? (
                  <div className="flex-1 flex flex-col">
                    <div className="text-xs font-mono text-[#716A7E] mb-2 flex items-center justify-between">
                      <span>Raw HTML Source Mode</span>
                      <span className="text-[#5D2381]">Edit HTML tags directly</span>
                    </div>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => {
                        setHtmlContent(e.target.value);
                        if (editorRef.current) {
                          editorRef.current.innerHTML = e.target.value;
                        }
                        updateCounts();
                      }}
                      className="w-full flex-1 min-h-[480px] p-4 font-mono text-[13px] bg-[#1E1B2E] text-[#E0E7FF] rounded-xl focus:outline-none resize-y border border-[#3B3355] leading-relaxed"
                    />
                  </div>
                ) : (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={updateCounts}
                    onKeyUp={updateActiveFormats}
                    onMouseUp={updateActiveFormats}
                    onKeyDown={handleKeyDown}
                    className="word-doc-sheet w-full flex-1 min-h-[500px] focus:outline-none text-[15px] text-[#141010] leading-relaxed select-text"
                    spellCheck="true"
                  />
                )}
              </div>

              {/* Bottom Document Status Bar */}
              <div className="px-6 py-2 border-t border-[#ECE4F2] flex items-center justify-between text-[11px] text-[#8E869B] bg-[#FCFAFE] rounded-b-2xl sm:rounded-b-3xl">
                <span>Netopsys AI Rich Document Canvas</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Auto-formatted & Ready
                </span>
              </div>
            </div>
          </div>
          </div>

          {/* ===================================================================
              ALL BLOGS MANAGE VIEW
          =================================================================== */}
          <div className={activeAdminTab === "manage" ? "block" : "hidden"}>
            {/* Header & Controls Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#141010]">
                    All Blog Articles ({blogList.length})
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#716A7E] mt-0.5">
                    Manage, edit, or delete articles published on the frontend
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  {/* Write New Blog Button */}
                  <button
                    type="button"
                    onClick={() => {
                      resetEditor();
                      setActiveAdminTab("write");
                    }}
                    className="hover-brand-gradient bg-[#5D2381] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Write Blog</span>
                  </button>
                </div>
              </div>

              {/* Loading Indicator */}
              {isLoadingList && (
                <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-[#ECE4F2]">
                  <Loader2 className="w-8 h-8 text-[#5D2381] animate-spin" />
                  <p className="text-sm font-medium text-[#716A7E]">Loading blog posts...</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoadingList && blogList.length === 0 && (
                <div className="py-20 text-center bg-white rounded-2xl border border-[#ECE4F2]">
                  <p className="text-base font-semibold text-[#141010] mb-1">No blogs created yet</p>
                  <p className="text-xs text-[#716A7E] mb-4">Write and publish your first article.</p>
                  <button
                    type="button"
                    onClick={() => {
                      resetEditor();
                      setActiveAdminTab("write");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Write Blog Now</span>
                  </button>
                </div>
              )}

              {/* Blogs Grid */}
              {!isLoadingList && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {blogList
                    .filter((b) =>
                      b.title?.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((blog) => (
                      <div
                        key={blog.id}
                        className="bg-white rounded-2xl p-5 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(93,35,129,0.05)] transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Badges & Actions */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  blog.status === "Published"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-100 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {blog.status || "Published"}
                              </span>
                              {blog.isFeatured && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  ★ Featured
                                </span>
                              )}
                            </div>

                            {/* Action Icons: View, Edit & Delete */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => setViewingBlog(blog)}
                                className="text-gray-400 hover:text-[#5D2381] p-1.5 rounded-lg hover:bg-[#F6EEFA] transition-colors cursor-pointer"
                                title="View blog details"
                                aria-label={`View ${blog.title}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditBlog(blog)}
                                className="text-gray-400 hover:text-[#5D2381] p-1.5 rounded-lg hover:bg-[#F6EEFA] transition-colors cursor-pointer"
                                title="Edit blog"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlogToDelete(blog)}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete blog"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-bold text-[#141010] mb-2 leading-snug line-clamp-2">
                            {blog.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-xs text-[#554E62] leading-relaxed mb-4 line-clamp-3">
                            {blog.excerpt}
                          </p>
                        </div>

                        {/* Footer info */}
                        <div className="pt-3 border-t border-[#F5EEF8] flex items-center justify-between text-[11px] text-[#8E869B]">
                          <span>{blog.author?.name || blog.authorName || ""}</span>
                          <span>{blog.date}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
          </div>

          {/* DELETE CONFIRMATION MODAL */}
          {blogToDelete && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl border border-[#ECE4F2] shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-base font-bold text-[#141010] mb-1">Delete Blog Post</h3>
                <p className="text-xs text-[#716A7E] mb-5">
                  Are you sure you want to delete <span className="font-semibold text-[#141010]">"{blogToDelete.title}"</span>? This will remove it from the frontend blogs page.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBlogToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBlog}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW BLOG DETAILS MODAL */}
          {viewingBlog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-5 border-b border-[#ECE4F2] flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                      <Eye className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#141010]">Blog Preview</h3>
                      <p className="text-xs text-[#716A7E]">Quick details and overview</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingBlog(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
                  {/* Cover Image if available */}
                  {viewingBlog.image && (
                    <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100 border border-[#ECE4F2]">
                      <img
                        src={viewingBlog.image}
                        alt={viewingBlog.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex items-center flex-wrap gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        viewingBlog.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      ● {viewingBlog.status || "Published"}
                    </span>
                    {viewingBlog.isFeatured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-lg font-bold text-[#141010] leading-snug">
                    {viewingBlog.title}
                  </h4>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8FC] border border-[#ECE4F2] text-xs text-[#544862]">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Author</span>
                      <strong className="font-semibold text-[#141010]">
                        {viewingBlog.author?.name || viewingBlog.authorName || "Editorial Team"}
                        {(viewingBlog.author?.role || viewingBlog.authorRole) && ` (${viewingBlog.author?.role || viewingBlog.authorRole})`}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 block text-[11px]">Date</span>
                      <strong className="font-semibold text-[#141010]">
                        {viewingBlog.date || viewingBlog.created_at || "Recent"}
                      </strong>
                    </div>
                  </div>

                  {/* Excerpt */}
                  {viewingBlog.excerpt && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block mb-1">Excerpt</span>
                      <p className="text-xs text-[#4A4458] leading-relaxed bg-[#FAF8FC] border border-[#ECE4F2] p-3.5 rounded-2xl">
                        {viewingBlog.excerpt}
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#ECE4F2] flex items-center justify-between gap-2.5 bg-gray-50/50">
                  <a
                    href={`/blogs-detail?id=${viewingBlog.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#5D2381] hover:underline inline-flex items-center gap-1.5 px-3 py-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Page</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const b = viewingBlog;
                        setViewingBlog(null);
                        handleEditBlog(b);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5D2381] hover:bg-[#F6EEFA] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingBlog(null)}
                      className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1A6E] hover-brand-gradient shadow-sm cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Insert Link */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#ECE4F2] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4F2]">
              <div className="flex items-center gap-2">
                <Link2 className="w-4.5 h-4.5 text-[#5D2381]" />
                <h3 className="text-base font-bold text-[#141010]">Insert / Edit Link</h3>
              </div>
              <button
                onClick={() => setLinkModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  Destination URL
                </label>
                <input
                  type="text"
                  placeholder="https://netopsys.ai/case-studies"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  Display Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Click here to learn more"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between pt-3 border-t border-[#ECE4F2]">
              <button
                type="button"
                onClick={handleRemoveLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Remove Link</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient rounded-lg cursor-pointer shadow-xs"
                >
                  Apply Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Insert Image via URL */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#ECE4F2] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4F2]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-[#5D2381]" />
                <h3 className="text-base font-bold text-[#141010]">Insert Image via Web URL</h3>
              </div>
              <button
                onClick={() => setImageModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  Image Web URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  Caption / Alt Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Netopsys AI Cloud Infrastructure"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#ECE4F2]">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImageUrl}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient rounded-lg cursor-pointer shadow-xs"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Insert Video */}
      {videoModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#ECE4F2] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4F2]">
              <div className="flex items-center gap-2">
                <Film className="w-4.5 h-4.5 text-[#5D2381]" />
                <h3 className="text-base font-bold text-[#141010]">Embed Video</h3>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  YouTube or Video URL
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
                <p className="text-[11.5px] text-[#716A7E] mt-1.5">
                  Paste a YouTube, Vimeo, or direct MP4 link.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#ECE4F2]">
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertVideo}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient rounded-lg cursor-pointer shadow-xs"
              >
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Insert Table */}
      {tableModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#ECE4F2] shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE4F2]">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4.5 h-4.5 text-[#5D2381]" />
                <h3 className="text-base font-bold text-[#141010]">Insert Table</h3>
              </div>
              <button
                onClick={() => setTableModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#544862] mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm border border-[#D5CBE0] rounded-xl focus:outline-none focus:border-[#5D2381]"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#ECE4F2]">
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient rounded-lg cursor-pointer shadow-xs"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#141010] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 text-[13px] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
