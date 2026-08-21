import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, RefreshCw, Network } from 'lucide-react';
import api from '../../services/api';

const COPOMappingMatrixPage = () => {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  
  // Fetch available courses for the dropdown
  const { data: courses, isLoading: isCoursesLoading } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: async () => (await api.get('/courses')).data 
  });

  // Fetch the Matrix Data for the selected course
  const { data: matrixData, isLoading: isMatrixLoading, refetch } = useQuery({ 
    queryKey: ['co-po-matrix', selectedCourse], 
    queryFn: async () => (await api.get(`/co-engine/matrix/${selectedCourse}`)).data,
    enabled: !!selectedCourse
  });

  // Local state to hold user edits before saving
  const [localMatrix, setLocalMatrix] = useState<any[]>([]);

  // Sync local state when backend data arrives
  React.useEffect(() => {
    if (matrixData?.matrix) {
      setLocalMatrix(JSON.parse(JSON.stringify(matrixData.matrix))); // Deep copy
    } else {
      setLocalMatrix([]);
    }
  }, [matrixData]);

  const saveMutation = useMutation({
    mutationFn: (mappings: any[]) => api.post('/co-engine/matrix/save', { course_id: selectedCourse, mappings }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['co-po-matrix', selectedCourse] });
      alert('Matrix saved successfully!');
    }
  });

  const handleInputChange = (coIndex: number, type: 'po' | 'pso', targetId: number, value: string) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) numValue = 0;
    if (numValue > 3) numValue = 3;

    const newMatrix = [...localMatrix];
    if (type === 'po') {
      newMatrix[coIndex].po_mappings[targetId] = numValue;
    } else {
      newMatrix[coIndex].pso_mappings[targetId] = numValue;
    }
    setLocalMatrix(newMatrix);
  };

  const handleSave = () => {
    // Flatten matrix into expected array of mapping entries
    const flatMappings: any[] = [];
    localMatrix.forEach(row => {
      Object.keys(row.po_mappings).forEach(poId => {
        flatMappings.push({
            co_id: row.co_id,
            po_id: parseInt(poId, 10),
            pso_id: null,
            correlation_level: row.po_mappings[poId]
        });
      });
      Object.keys(row.pso_mappings).forEach(psoId => {
        flatMappings.push({
            co_id: row.co_id,
            po_id: null,
            pso_id: parseInt(psoId, 10),
            correlation_level: row.pso_mappings[psoId]
        });
      });
    });

    saveMutation.mutate(flatMappings);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">CO-PO/PSO Mapping Matrix</h2>
          <p className="text-slate-500 text-sm mt-1">Define correlation levels between Course Outcomes and Program Outcomes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="w-full sm:w-64 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary py-2.5 px-4 shadow-sm transition-all text-sm"
          >
            <option value="">Select a Course...</option>
            {courses?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.course_code} - {c.course_name}</option>
            ))}
          </select>

          {selectedCourse && (
            <button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-sm font-medium text-sm disabled:opacity-70"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Matrix
            </button>
          )}
        </div>
      </div>

      {!selectedCourse ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <Network className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Course Selected</h3>
          <p className="text-slate-500 max-w-md">Please select a course from the dropdown above to view and edit its CO-PO correlation matrix.</p>
        </div>
      ) : isMatrixLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-24 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary/60 mb-4" />
          <p className="text-slate-500 font-medium">Loading matrix data...</p>
        </div>
      ) : matrixData && localMatrix.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Correlation Levels:</span>
              <div className="flex gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span>0: None</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-200"></span>1: Low</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span>2: Medium</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span>3: High</span>
              </div>
            </div>
            <button onClick={() => refetch()} className="text-slate-500 hover:text-primary flex items-center gap-1.5 text-sm font-medium transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-md hover:bg-slate-50">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-r border-b border-slate-200 w-32 bg-slate-100 text-slate-700 font-semibold tracking-wide text-sm">COs</th>
                  {matrixData.pos.length > 0 && (
                    <th colSpan={matrixData.pos.length} className="p-2 border-r border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold text-sm tracking-wide">
                      Program Outcomes (POs)
                    </th>
                  )}
                  {matrixData.psos.length > 0 && (
                    <th colSpan={matrixData.psos.length} className="p-2 border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold text-sm tracking-wide">
                      Program Specific Outcomes (PSOs)
                    </th>
                  )}
                </tr>
                <tr className="bg-white text-xs font-semibold tracking-wider text-slate-600 shadow-sm relative z-10">
                  <th className="p-3 border-r border-b border-slate-200 bg-slate-100"></th>
                  {matrixData.pos.map((po: any) => (
                    <th key={`po_${po.id}`} className="p-3 border-r border-b border-slate-200 w-16" title={po.title}>{po.number}</th>
                  ))}
                  {matrixData.psos.map((pso: any) => (
                    <th key={`pso_${pso.id}`} className="p-3 border-r border-b border-slate-200 w-16 bg-blue-50/30" title={pso.title}>{pso.number}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localMatrix.map((row, rowIndex) => (
                  <tr key={row.co_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-800 bg-slate-50/80">
                      {row.co_number}
                    </td>
                    
                    {matrixData.pos.map((po: any) => (
                      <td key={`cell_po_${po.id}`} className="p-0 border-r border-slate-100 relative">
                        <input 
                          type="number" 
                          min="0" max="3" 
                          value={row.po_mappings[po.id] || 0}
                          onChange={(e) => handleInputChange(rowIndex, 'po', po.id, e.target.value)}
                          className={`w-full h-12 text-center outline-none transition-all ${
                            row.po_mappings[po.id] == 3 ? 'font-bold text-white bg-primary focus:ring-inset focus:ring-2 focus:ring-primary-dark' :
                            row.po_mappings[po.id] == 2 ? 'font-bold text-white bg-blue-400 focus:ring-inset focus:ring-2 focus:ring-blue-600' :
                            row.po_mappings[po.id] == 1 ? 'font-medium text-blue-900 bg-blue-100 focus:ring-inset focus:ring-2 focus:ring-blue-400' :
                            'text-slate-400 bg-transparent focus:bg-slate-50 focus:ring-inset focus:ring-2 focus:ring-primary/20'
                          }`}
                        />
                      </td>
                    ))}

                    {matrixData.psos.map((pso: any) => (
                      <td key={`cell_pso_${pso.id}`} className="p-0 border-r border-slate-100 relative">
                        <input 
                          type="number" 
                          min="0" max="3" 
                          value={row.pso_mappings[pso.id] || 0}
                          onChange={(e) => handleInputChange(rowIndex, 'pso', pso.id, e.target.value)}
                          className={`w-full h-12 text-center outline-none transition-all ${
                            row.pso_mappings[pso.id] == 3 ? 'font-bold text-white bg-primary focus:ring-inset focus:ring-2 focus:ring-primary-dark' :
                            row.pso_mappings[pso.id] == 2 ? 'font-bold text-white bg-blue-400 focus:ring-inset focus:ring-2 focus:ring-blue-600' :
                            row.pso_mappings[pso.id] == 1 ? 'font-medium text-blue-900 bg-blue-100 focus:ring-inset focus:ring-2 focus:ring-blue-400' :
                            'text-slate-400 bg-transparent focus:bg-slate-50 focus:ring-inset focus:ring-2 focus:ring-primary/20'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100">
            <Network className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Course Outcomes</h3>
          <p className="text-slate-500 max-w-md">No Course Outcomes (COs) found for this course. Please configure COs first before mapping them to POs/PSOs.</p>
        </div>
      )}
    </div>
  );
};
export default COPOMappingMatrixPage;
