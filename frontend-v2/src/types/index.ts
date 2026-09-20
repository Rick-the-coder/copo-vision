export interface User {
  user_id: number;
  username: string;
  full_name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardSummary {
  total_students: number;
  average_co_attainment: number;
  average_po_attainment: number;
  total_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  unread_alerts: number;
  at_risk_students: number;
}

export interface Assessment {
  assessment_id: number;
  assessment_name: string;
  assessment_type: string;
  max_marks: string | number;
  assessment_date: string;
  subject_id: number;
  subject_code: string;
  subject_name: string;
}

export interface COAttainmentRecord {
  co_attainment_id: number;
  student_id: number;
  enrollment_no: string;
  student_name: string;
  co_id: number;
  co_code: string;
  attainment_percentage: string | number;
  attainment_level: string | number;
}

export interface POAttainmentRecord {
  po_attainment_id: number;
  student_id: number;
  enrollment_no: string;
  student_name: string;
  po_id: number;
  attainment_percentage: string | number;
  attainment_level: string | number;
}

export interface PredictionRecord {
  prediction_id?: number;
  student_id: number;
  enrollment_no?: string;
  student_name?: string;
  model_id?: number;
  predicted_co_attainment: string | number;
  predicted_po_attainment: string | number;
  prediction_status: string;
  predicted_at?: string;
}

export interface AlertRecord {
  alert_id: number;
  student_id: number;
  enrollment_no: string;
  student_name: string;
  faculty_id?: number | null;
  alert_type: string;
  co_id?: number | null;
  po_id?: number | null;
  message: string;
  severity: 'high' | 'medium' | 'low' | string;
  is_read: number;
  created_at: string;
}

export interface BloomClassification {
  predicted_level: string;
  confidence: string;
  matched_verbs: string[];
  all_signals_found: string[];
}

export interface COSuggestion {
  co_id: number;
  suggested_co: string;
  match_score: number;
}

export interface NLPClassificationResponse {
  status: string;
  question_text: string;
  bloom_classification: BloomClassification;
  co_suggestion?: COSuggestion;
}
