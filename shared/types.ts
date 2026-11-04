export interface JobPosting {
  id: string;
  jobCode: string;
  title: string;
  category: string;
  location: string;
  employmentType: string;
  experience: string;
  summary: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
}

export type ApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Shortlisted"
  | "Reschedule"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Selected"
  | "Rejected";

export interface ApplicationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  resumeUrl?: string | null;
  portfolioUrl?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isActive: boolean;
}

export interface InterviewRound {
  id: string;
  name: string;
  duration: string;
  slots: TimeSlot[];
}

export interface InterviewBooking {
  id: string;
  candidateName: string;
  candidateEmail: string;
  roundName: string;
  date: string;
  time: string;
  interviewer: string;
  status: "Scheduled" | "Completed" | "Rescheduled" | "Cancelled";
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Hiring Manager" | "Technical Interviewer" | "Recruiter";
  status: "Active" | "Inactive";
  lastLogin?: string | null;
  createdAt?: string;
}
