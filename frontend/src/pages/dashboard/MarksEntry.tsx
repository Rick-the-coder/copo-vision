import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle2, ClipboardEdit } from 'lucide-react';
import api from '../../services/api';

const MarksEntryPage = () => {
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  const [selectedSem, setSelectedSem] = useState<number | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [assessmentId, setAssessmentId] = useState<number | ''>('');
  const [isFinal, setIsFinal] = useState(false);
  const [marksData, setMarksData] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Fetch all necessary reference data
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: async () => (await api.get('/departments')).data });
  const { data: semesters } = useQuery({ queryKey: ['semesters'], queryFn: async () => (await api.get('/semesters')).data });
  const { data: courses } = useQuery({ queryKey: ['courses'], queryFn: async () => (await api.get('/courses')).data });
  const { data: assessments } = useQuery({ queryKey: ['assessments'], queryFn: async () => (await api.get('/assessments')).data });
  const { data: students } = useQuery({ queryKey: ['students'], queryFn: async () => (await api.get('/students')).data });

  // Filtered dropdown lists based on selections
  const filteredCourses = useMemo(() => {
      if (!courses) return [];
      return courses.filter((c: any) => (!selectedDept || c.department_id === selectedDept));
  }, [courses, selectedDept]);

  const filteredAssessments = useMemo(() => {
      if (!assessments) return [];
      return assessments.filter((a: any) => (!selectedCourse || a.course_id === selectedCourse) && (!selectedSem || a.semester_id === selectedSem));
  }, [assessments, selectedCourse, selectedSem]);

  const activeAssessment = useMemo(() => {
      return assessments?.find((a: any) => a.id === assessmentId);
  }, [assessments, assessmentId]);

  const handleLoadStudents = () => {
      if(!assessmentId) return alert('Select an Assessment first');
      
      // Filter students by department and semester
      const eligibleStudents = students?.filter((s: any) => 
          (!selectedDept || s.department_id === selectedDept) &&
          (!selectedSem || s.semester_id === selectedSem)
      ) || [];

      if (eligibleStudents.length === 0) {
          alert("No students found for the selected criteria.");
          setMarksData([]);
          return;
      }

      setMarksData(eligibleStudents.map((s: any) => ({
          student_id: s.id,
          student_name: s.student_name,
          roll_number: s.roll_number,
          marks_obtained: 0,
          remarks: '',
          attendance_status: 'Present'
      })));
  }

  const handleMarkChange = (index: number, field: string, value: any) => {
      const updated = [...marksData];
      if (field === 'marks_obtained') {
          let num = parseFloat(value);
          if (isNaN(num)) num = 0;
          if (activeAssessment && num > activeAssessment.maximum_marks) num = activeAssessment.maximum_marks;
          if (num < 0) num = 0;
          updated[index][field] = num;
      } else {
          updated[index][field] = value;
      }
      setMarksData(updated);
  }

  const submitMarks = async () => {
      try {
          setSaveStatus('saving');
          await api.post('/marks/bulk', {
              assessment_id: assessmentId,
              is_final_submission: isFinal,
              marks: marksData.map(d => ({
                  student_id: d.student_id,
                  marks_obtained: d.marks_obtained,
                  remarks: d.remarks,
                  attendance_status: d.attendance_status
              }))
          });
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(null), 3000);
      } catch (err: any) {
          alert(err.response?.data?.detail || "Failed to save marks");
          setSaveStatus(null);
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Advanced Marks Entry</h2>
          <p className="text-slate-500 text-sm mt-1">Bulk entry of student assessment marks</p>
        </div>
        {saveStatus === 'success' && (
          <span className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-100">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Saved successfully
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
              <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Department</label>
                  <select value={selectedDept} onChange={e => setSelectedDept(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                      <option value="">All Departments</option>
                      {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.department_code} - {d.department_name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Semester</label>
                  <select value={selectedSem} onChange={e => setSelectedSem(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                      <option value="">All Semesters</option>
                      {semesters?.map((s: any) => <option key={s.id} value={s.id}>Semester {s.semester_number}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Course / Subject</label>
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                      <option value="">All Courses</option>
                      {filteredCourses.map((c: any) => <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Assessment *</label>
                  <select value={assessmentId} onChange={e => setAssessmentId(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm">
                      <option value="">Select Assessment</option>
                      {filteredAssessments.map((a: any) => <option key={a.id} value={a.id}>{a.assessment_name} (Max: {a.maximum_marks})</option>)}
                  </select>
              </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={handleLoadStudents} disabled={!assessmentId} className="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
                <ClipboardEdit className="w-4 h-4" /> Load Students
              </button>
          </div>
      </div>

      {marksData.length > 0 && activeAssessment && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-800">Entering marks for: {activeAssessment.assessment_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Please ensure all marks are correct before final submission.</p>
                  </div>
                  <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100 font-medium">Max Marks: {activeAssessment.maximum_marks}</span>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[13px] uppercase tracking-wider text-slate-600 font-semibold">
                              <th className="p-4 w-24">Roll No</th>
                              <th className="p-4">Student Name</th>
                              <th className="p-4 w-32">Attendance</th>
                              <th className="p-4 w-32">Marks ({activeAssessment.maximum_marks})</th>
                              <th className="p-4 w-24">Percentage</th>
                              <th className="p-4 w-1/4">Remarks</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {marksData.map((row, idx) => (
                              <tr key={row.student_id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 font-medium text-slate-900">{row.roll_number}</td>
                                  <td className="p-4 text-slate-700">{row.student_name}</td>
                                  <td className="p-4">
                                      <select value={row.attendance_status} onChange={(e) => handleMarkChange(idx, 'attendance_status', e.target.value)} className="w-full border border-slate-200 rounded-md px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all">
                                          <option value="Present">Present</option>
                                          <option value="Absent">Absent</option>
                                      </select>
                                  </td>
                                  <td className="p-4">
                                      <input 
                                          type="number" 
                                          min="0" 
                                          max={activeAssessment.maximum_marks}
                                          disabled={row.attendance_status === 'Absent'} 
                                          value={row.marks_obtained} 
                                          onChange={(e) => handleMarkChange(idx, 'marks_obtained', e.target.value)} 
                                          className={`w-full border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm disabled:bg-slate-100 disabled:text-slate-400 ${row.marks_obtained > activeAssessment.maximum_marks ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary'}`} 
                                      />
                                  </td>
                                  <td className="p-4 font-medium">
                                      <span className={row.attendance_status === 'Absent' ? 'text-slate-400' : 'text-slate-700'}>
                                        {row.attendance_status === 'Absent' ? '0%' : `${((row.marks_obtained / activeAssessment.maximum_marks) * 100).toFixed(1)}%`}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <input type="text" value={row.remarks} onChange={(e) => handleMarkChange(idx, 'remarks', e.target.value)} className="w-full border border-slate-200 rounded-md px-3 py-1.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm transition-all" placeholder="Optional remark" />
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary transition-all" />
                      <div>
                        <span className="block text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">Submit as Final</span>
                        <span className="block text-xs text-slate-500">Warning: Cannot be changed later</span>
                      </div>
                  </label>
                  <button onClick={submitMarks} disabled={saveStatus === 'saving'} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-70 hover:bg-primary-dark transition-colors shadow-sm">
                      {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                      {isFinal ? 'Submit Final Marks' : 'Save Draft'}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
export default MarksEntryPage;
