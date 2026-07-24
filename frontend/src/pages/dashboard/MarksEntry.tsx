import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Search, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const MarksEntryPage = () => {
  const [assessmentId, setAssessmentId] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [marksData, setMarksData] = useState<any[]>([]); // mock grid state
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Mocking students since full selector UI exceeds simple bounds, we'll fetch mock or empty for demo
  const handleLoadStudents = () => {
      // In a real app, this fetches students for the selected assessment's course/section
      if(!assessmentId) return alert('Enter Assessment ID first');
      setMarksData([
          { student_id: 1, marks_obtained: 0, remarks: '', attendance_status: 'Present' },
          { student_id: 2, marks_obtained: 0, remarks: '', attendance_status: 'Present' },
          { student_id: 3, marks_obtained: 0, remarks: '', attendance_status: 'Present' },
      ]);
  }

  const handleMarkChange = (index: number, field: string, value: any) => {
      const updated = [...marksData];
      updated[index][field] = value;
      setMarksData(updated);
  }

  const submitMarks = async () => {
      try {
          setSaveStatus('saving');
          await api.post('/marks/bulk', {
              assessment_id: parseInt(assessmentId),
              is_final_submission: isFinal,
              marks: marksData
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Marks Entry</h2>
        {saveStatus === 'success' && <span className="flex items-center text-green-600 gap-2 font-medium"><CheckCircle2 className="w-5 h-5"/> Saved successfully</span>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-end gap-4">
          <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Assessment ID</label>
              <input type="number" value={assessmentId} onChange={e => setAssessmentId(e.target.value)} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary" placeholder="Enter Assessment ID" />
          </div>
          <button onClick={handleLoadStudents} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium">Load Students</button>
      </div>

      {marksData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
                          <tr>
                              <th className="p-4">Student ID</th>
                              <th className="p-4">Attendance</th>
                              <th className="p-4">Marks Obtained</th>
                              <th className="p-4">Remarks</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                          {marksData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                  <td className="p-4 font-semibold">{row.student_id}</td>
                                  <td className="p-4">
                                      <select value={row.attendance_status} onChange={(e) => handleMarkChange(idx, 'attendance_status', e.target.value)} className="border rounded px-2 py-1 bg-white">
                                          <option value="Present">Present</option>
                                          <option value="Absent">Absent</option>
                                      </select>
                                  </td>
                                  <td className="p-4">
                                      <input type="number" disabled={row.attendance_status === 'Absent'} value={row.marks_obtained} onChange={(e) => handleMarkChange(idx, 'marks_obtained', parseFloat(e.target.value))} className="w-24 border rounded px-3 py-1 outline-none focus:border-primary disabled:bg-slate-100" />
                                  </td>
                                  <td className="p-4">
                                      <input type="text" value={row.remarks} onChange={(e) => handleMarkChange(idx, 'remarks', e.target.value)} className="w-full border rounded px-3 py-1 outline-none focus:border-primary" placeholder="Optional remark" />
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} className="w-4 h-4 text-primary rounded" />
                      <span className="text-sm font-medium text-slate-700">Submit as Final (Cannot be changed later)</span>
                  </label>
                  <button onClick={submitMarks} disabled={saveStatus === 'saving'} className="bg-primary text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-70">
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
