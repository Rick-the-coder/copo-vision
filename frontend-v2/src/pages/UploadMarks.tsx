import React, { useEffect, useState, useRef } from 'react';
import api from '../config/api';
import { Assessment } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Layers,
  FileCheck,
  X,
} from 'lucide-react';

export const UploadMarks: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoadingAssessments, setIsLoadingAssessments] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    status: 'success' | 'error';
    message?: string;
    records_inserted?: number;
    errors?: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assessments to populate dropdown
  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoadingAssessments(true);
      try {
        const res = await api.get('/api/assessments/');
        if (res.data.status === 'success' && Array.isArray(res.data.assessments)) {
          setAssessments(res.data.assessments);
          if (res.data.assessments.length > 0) {
            setSelectedAssessmentId(String(res.data.assessments[0].assessment_id));
          }
        }
      } catch (err: any) {
        console.error('Failed to load assessments:', err);
      } finally {
        setIsLoadingAssessments(false);
      }
    };

    fetchAssessments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setUploadResult({
          status: 'error',
          message: 'Please select a valid Excel file (.xlsx or .xls)',
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setUploadResult({
          status: 'error',
          message: 'Please select a valid Excel file (.xlsx or .xls)',
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadResult({ status: 'error', message: 'Please attach an Excel file (.xlsx)' });
      return;
    }
    if (!selectedAssessmentId) {
      setUploadResult({ status: 'error', message: 'Please select an assessment from the dropdown' });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('assessment_id', selectedAssessmentId);
      // Send numeric user_id from AuthContext
      const uploadedById = user?.user_id !== undefined && user?.user_id !== null ? String(user.user_id) : '1';
      formData.append('uploaded_by', uploadedById);

      const response = await api.post('/api/uploads/marks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setUploadResult({
          status: 'success',
          records_inserted: response.data.records_inserted,
          errors: response.data.errors,
        });
        // Clear file
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setUploadResult({
          status: 'error',
          message: response.data.message || 'Upload processing failed',
        });
      }
    } catch (err: any) {
      setUploadResult({
        status: 'error',
        message: err.response?.data?.message || err.message || 'Upload request failed',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedAssessment = assessments.find(
    (a) => String(a.assessment_id) === String(selectedAssessmentId)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Introduction Banner */}
      <div className="academic-card p-6 bg-gradient-to-r from-white via-slate-50 to-navy-50/30">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-200 flex items-center justify-center shrink-0">
            <UploadCloud className="w-6 h-6 text-navy-800" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Assessment Marks Ingestion & CO Mapping
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload evaluation spreadsheets with question-level marks and Course Outcome (CO) tags.
              The parser computes student-level marks for each mapped CO and populates the OBE attainment engine.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="academic-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Assessment Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Assessment <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                disabled={isLoadingAssessments || isUploading}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-navy-600 focus:ring-1 focus:ring-navy-600 disabled:opacity-50"
                required
              >
                {isLoadingAssessments ? (
                  <option>Loading assessments catalog from database...</option>
                ) : assessments.length === 0 ? (
                  <option>No assessments found</option>
                ) : (
                  assessments.map((a) => (
                    <option key={a.assessment_id} value={a.assessment_id}>
                      [{a.subject_code}] {a.subject_name} — {a.assessment_name} ({a.assessment_type}, Max: {a.max_marks})
                    </option>
                  ))
                )}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Selects the course offering and target assessment schema
              </p>
            </div>

            {/* Uploaded By Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Faculty Assessor / Uploaded By (User ID)
              </label>
              <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 flex items-center justify-between">
                <span>{user?.full_name || 'Demo Faculty'} ({user?.username || 'faculty1'})</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-navy-50 text-navy-800 border border-navy-200 font-bold">
                  User ID: #{user?.user_id || 1}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Transmitted as numeric user_id ({user?.user_id || 1}) from active session for upload batch tracking
              </p>
            </div>
          </div>

          {/* Assessment Details Preview Pill */}
          {selectedAssessment && (
            <div className="p-3.5 rounded-lg bg-navy-50/70 border border-navy-200/80 text-xs text-navy-900 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-600 block">Course Code & Name</span>
                <span className="font-semibold">{selectedAssessment.subject_code} - {selectedAssessment.subject_name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-600 block">Exam Type</span>
                <span className="font-semibold">{selectedAssessment.assessment_type} ({selectedAssessment.assessment_name})</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-600 block">Max Assessment Marks</span>
                <span className="font-semibold">{selectedAssessment.max_marks} Marks</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-navy-600 block">Assessment Date</span>
                <span className="font-semibold">{selectedAssessment.assessment_date ? new Date(selectedAssessment.assessment_date).toLocaleDateString() : 'Active'}</span>
              </div>
            </div>
          )}

          {/* Drag and Drop File Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Marks Spreadsheet File (.xlsx, .xls) <span className="text-rose-600">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-emerald-400 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-navy-600 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">{selectedFile.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for upload
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-3 text-xs text-rose-600 hover:text-rose-800 flex items-center space-x-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove file</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    Click to select or drag and drop marks spreadsheet
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Accepts Excel workbooks (.xlsx, .xls)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-6 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-navy-900/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Parsing & Writing Marks...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Ingest Marks</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Card */}
      {uploadResult && (
        <div
          className={`p-5 rounded-xl border ${
            uploadResult.status === 'success'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/90 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start space-x-3">
            {uploadResult.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-bold">
                {uploadResult.status === 'success'
                  ? 'Marks Spreadsheet Processed Successfully'
                  : 'Ingestion Encountered an Error'}
              </h4>
              {uploadResult.status === 'success' && (
                <div className="mt-1 text-xs text-emerald-900">
                  <span className="font-bold">{uploadResult.records_inserted}</span> student mark entries recorded in the database.
                </div>
              )}
              {uploadResult.message && (
                <div className="mt-1 text-xs">{uploadResult.message}</div>
              )}

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-3 p-3 rounded bg-amber-50/80 border border-amber-300 text-amber-900 text-xs">
                  <div className="font-bold mb-1">Notice / Skipped Rows:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {uploadResult.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <li className="font-semibold italic">
                        ...and {uploadResult.errors.length - 10} more rows skipped
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Excel Schema Reference Card for Faculty */}
      <div className="academic-card p-5 bg-slate-50/50">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">
          <Info className="w-4 h-4 text-navy-700" />
          <span>Institutional Spreadsheet Template Specifications</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          To ensure automated parsing, please format the Excel file with the following header hierarchy:
        </p>
        <div className="overflow-x-auto text-[11px] font-mono border border-slate-200 rounded-lg bg-white">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-2 px-3 text-left">Row #</th>
                <th className="py-2 px-3 text-left">Col 1</th>
                <th className="py-2 px-3 text-left">Col 2 (Q1)</th>
                <th className="py-2 px-3 text-left">Col 3 (Q2)</th>
                <th className="py-2 px-3 text-left">Col 4 (Q3)</th>
                <th className="py-2 px-3 text-left">Col 5 (Q4)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-1.5 px-3 font-semibold text-slate-500">Row 1</td>
                <td className="py-1.5 px-3 text-slate-400">enrollment_no</td>
                <td className="py-1.5 px-3 font-semibold text-navy-800">Q1</td>
                <td className="py-1.5 px-3 font-semibold text-navy-800">Q2</td>
                <td className="py-1.5 px-3 font-semibold text-navy-800">Q3</td>
                <td className="py-1.5 px-3 font-semibold text-navy-800">Q4</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-semibold text-slate-500">Row 2</td>
                <td className="py-1.5 px-3 text-slate-400">CO Code</td>
                <td className="py-1.5 px-3 font-semibold text-amber-700">CO1</td>
                <td className="py-1.5 px-3 font-semibold text-amber-700">CO2</td>
                <td className="py-1.5 px-3 font-semibold text-amber-700">CO3</td>
                <td className="py-1.5 px-3 font-semibold text-amber-700">CO4</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-semibold text-slate-500">Row 3</td>
                <td className="py-1.5 px-3 text-slate-400">Max Marks</td>
                <td className="py-1.5 px-3 text-slate-700">5</td>
                <td className="py-1.5 px-3 text-slate-700">5</td>
                <td className="py-1.5 px-3 text-slate-700">10</td>
                <td className="py-1.5 px-3 text-slate-700">10</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-semibold text-slate-500">Row 4+</td>
                <td className="py-1.5 px-3 font-semibold text-slate-800">CS2025001</td>
                <td className="py-1.5 px-3 text-slate-600">4.5</td>
                <td className="py-1.5 px-3 text-slate-600">3.0</td>
                <td className="py-1.5 px-3 text-slate-600">8.0</td>
                <td className="py-1.5 px-3 text-slate-600">9.0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
