import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, RefreshCw } from 'lucide-react';
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">CO-PO/PSO Mapping Matrix</h2>
        <div className="flex gap-4 items-center">
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary py-2 px-4 shadow-sm"
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
              className="bg-primary text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Matrix
            </button>
          )}
        </div>
      </div>

      {!selectedCourse ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          Please select a course from the dropdown above to view and edit its correlation matrix.
        </div>
      ) : isMatrixLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : matrixData && localMatrix.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-sm text-slate-600">Enter correlation levels (1=Low, 2=Medium, 3=High). Leave 0 for no correlation.</span>
            <button onClick={() => refetch()} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-100 text-sm font-semibold tracking-wider text-slate-700">
                <tr>
                  <th className="p-3 border-r border-slate-200 w-32 bg-slate-200">COs</th>
                  {matrixData.pos.map((po: any) => (
                    <th key={`po_${po.id}`} className="p-3 border-r border-slate-200" title={po.title}>{po.number}</th>
                  ))}
                  {matrixData.psos.map((pso: any) => (
                    <th key={`pso_${pso.id}`} className="p-3 border-r border-slate-200 bg-blue-50/50" title={pso.title}>{pso.number}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {localMatrix.map((row, rowIndex) => (
                  <tr key={row.co_id} className="hover:bg-slate-50">
                    <td className="p-3 border-r border-slate-200 font-bold text-slate-700 bg-slate-50">
                      {row.co_number}
                    </td>
                    
                    {matrixData.pos.map((po: any) => (
                      <td key={`cell_po_${po.id}`} className="p-0 border-r border-slate-200">
                        <input 
                          type="number" 
                          min="0" max="3" 
                          value={row.po_mappings[po.id] || 0}
                          onChange={(e) => handleInputChange(rowIndex, 'po', po.id, e.target.value)}
                          className={`w-full h-full p-3 text-center outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${row.po_mappings[po.id] > 0 ? 'font-bold text-primary bg-blue-50/30' : 'text-slate-400 bg-transparent'}`}
                        />
                      </td>
                    ))}

                    {matrixData.psos.map((pso: any) => (
                      <td key={`cell_pso_${pso.id}`} className="p-0 border-r border-slate-200">
                        <input 
                          type="number" 
                          min="0" max="3" 
                          value={row.pso_mappings[pso.id] || 0}
                          onChange={(e) => handleInputChange(rowIndex, 'pso', pso.id, e.target.value)}
                          className={`w-full h-full p-3 text-center outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${row.pso_mappings[pso.id] > 0 ? 'font-bold text-primary bg-blue-50/30' : 'text-slate-400 bg-transparent'}`}
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          No Course Outcomes (COs) found for this course. Please configure COs first.
        </div>
      )}
    </div>
  );
};
export default COPOMappingMatrixPage;
