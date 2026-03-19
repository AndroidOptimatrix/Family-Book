// Request Types
export interface MedicalHelpRequest {
  // Personal Information
  patient_full_name: string;
  patient_nukh?: string;
  patient_age: number | string;
  paternal_side?: string;
  maternal_side?: string;
  inlaws_side?: string;
  native_place?: string;
  current_city?: string;
  occupation?: string;
  
  // Medical Information
  disease_name: string;
  sickness_duration?: string;
  hospital_name: string;
  hospital_address?: string;
  estimated_cost?: number | string;
  financial_arrangements?: string;
  
  // Insurance Information
  has_mediclaim?: number | string | boolean;
  mediclaim_details?: string;
  has_ayushman_card?: number | string | boolean;
  ayushman_card_number?: string;
  
  // Bank Details
  hospital_bank_name?: string;
  hospital_account_number?: string;
  hospital_ifsc_code?: string;
  hospital_branch?: string;
  
  // Social Reference
  social_leader_name?: string;
  social_leader_contact?: string;
  social_leader_relationship?: string;
  
  // Informant Details
  informant_name: string;
  informant_relationship?: string;
  informant_mobile: string;
  informant_alternate_mobile?: string;
  
  // System Fields (Optional - usually set by backend)
  admin_notes?: string;
  created_by?: string;
  
  // File Uploads (these are handled as FormData)
  patient_photo?: File;
  quotation_letter?: File;
}

// Response Types
export interface MedicalHelpResponse {
  result: 'success' | 'fail';
  msg: string;
  patient_id?: number;
  request_date?: string;
  request_status?: 'pending' | 'approved' | 'rejected' | 'in_progress';
  patient_photo_url?: string;
  quotation_letter_url?: string;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  data: T[];
}
