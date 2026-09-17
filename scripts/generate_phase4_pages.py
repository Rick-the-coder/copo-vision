import os

pages = {
    "COConfiguration": {
        "endpoint": "co-configurations",
        "interface": "COConfiguration",
        "fields": [
            {"name": "target_percentage", "label": "Target (%)", "type": "number"},
            {"name": "calculation_method", "label": "Method", "type": "text"},
            {"name": "round_off_rules", "label": "Round-Off", "type": "text"},
            {"name": "minimum_student_count", "label": "Min Students", "type": "number"}
        ]
    },
    "AttainmentRules": {
        "endpoint": "attainment-rules",
        "interface": "AttainmentRule",
        "fields": [
            {"name": "level_name", "label": "Level Name", "type": "text"},
            {"name": "min_percentage", "label": "Min (%)", "type": "number"},
            {"name": "max_percentage", "label": "Max (%)", "type": "number"}
        ]
    },
    "AssessmentWeightage": {
        "endpoint": "assessment-weightages",
        "interface": "AssessmentWeightage",
        "fields": [
            {"name": "assessment_type_id", "label": "Type ID", "type": "number"},
            {"name": "course_id", "label": "Course ID", "type": "number"},
            {"name": "weightage_percentage", "label": "Weightage (%)", "type": "number"},
            {"name": "is_active", "label": "Is Active", "type": "checkbox"}
        ]
    }
}

template = """import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';

interface {interface} {{
  id: number;
{interfaces_fields}
  status?: boolean;
  is_active?: boolean;
}}

const {page_name} = () => {{
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{interface} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {{ register, handleSubmit, reset }} = useForm<any>();

  const {{ data: items, isLoading }} = useQuery({{ queryKey: ['{endpoint}'], queryFn: async () => (await api.get('/{endpoint}')).data as {interface}[] }});

  const createMutation = useMutation({{
    mutationFn: (newItem: any) => api.post('/{endpoint}', newItem),
    onSuccess: () => {{ queryClient.invalidateQueries({{ queryKey: ['{endpoint}'] }}); closeModal(); }}
  }});

  const updateMutation = useMutation({{
    mutationFn: (data: {{ id: number, item: any }}) => api.put(`/{endpoint}/${{data.id}}`, data.item),
    onSuccess: () => {{ queryClient.invalidateQueries({{ queryKey: ['{endpoint}'] }}); closeModal(); }}
  }});

  const deleteMutation = useMutation({{
    mutationFn: (id: number) => api.delete(`/{endpoint}/${{id}}`),
    onSuccess: () => {{ queryClient.invalidateQueries({{ queryKey: ['{endpoint}'] }}); }}
  }});

  const openModal = (item: {interface} | null = null) => {{
    setEditingItem(item);
    if (item) reset(item);
    else reset({{ status: true, is_active: true }});
    setIsModalOpen(true);
  }};

  const closeModal = () => {{ setIsModalOpen(false); setEditingItem(null); reset(); }};

  const onSubmit = (data: any) => {{
    if (editingItem) updateMutation.mutate({{ id: editingItem.id, item: data }});
    else createMutation.mutate(data);
  }};

  const filteredItems = items?.filter(i => JSON.stringify(i).toLowerCase().includes(searchTerm.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">{page_name}</h2>
        <button onClick={{() => openModal()}} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add {interface}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 relative">
          <Search className="w-5 h-5 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search..." value={{searchTerm}} onChange={{e => setSearchTerm(e.target.value)}} className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm uppercase tracking-wider text-slate-600">
              <tr>
{table_headers}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {{isLoading ? <tr><td colSpan={{10}} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr> :
                filteredItems.map(item => (
                  <tr key={{item.id}} className="hover:bg-slate-50">
{table_cells}
                    <td className="p-4 text-right">
                      <button onClick={{() => openModal(item)}} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={{() => {{ if(window.confirm('Delete?')) deleteMutation.mutate(item.id) }}}} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              }}
            </tbody>
          </table>
        </div>
      </div>

      {{isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{{editingItem ? 'Edit' : 'Add'}} {interface}</h3>
            <form onSubmit={{handleSubmit(onSubmit)}} className="space-y-4">
{form_fields}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={{closeModal}} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}}
    </div>
  );
};
export default {page_name};
"""

for page_name, config in pages.items():
    interface = config["interface"]
    endpoint = config["endpoint"]
    fields = config["fields"]
    
    interfaces_fields = "\n".join([f"  {f['name']}: {'boolean' if f['type'] == 'checkbox' else ('number' if f['type'] == 'number' else 'string')};" for f in fields])
    table_headers = "\n".join([f"                <th className=\"p-4\">{f['label']}</th>" for f in fields])
    table_cells = "\n".join([f"                    <td className=\"p-4\">{{item.{f['name']}}}</td>" for f in fields])
    
    form_fields = []
    for f in fields:
        input_type = f['type']
        value_as = ", valueAsNumber: true" if input_type == 'number' else ""
        required = "required: true"
        req_str = f"{{{required}{value_as}}}" if (required or value_as) else "{}"
        if req_str == "{}":
            req_str = ""
        else:
            if req_str.startswith("{,"):
                req_str = "{" + req_str[2:]
            
        form_fields.append(f"""              <div><label className="block text-sm mb-1">{f['label']}</label><input type="{input_type}" {{...register('{f['name']}', {req_str})}} className="w-full px-3 py-2 border rounded-lg" /></div>""")
    form_fields = "\n".join(form_fields)
    
    content = template.format(
        page_name=page_name,
        interface=interface,
        endpoint=endpoint,
        interfaces_fields=interfaces_fields,
        table_headers=table_headers,
        table_cells=table_cells,
        form_fields=form_fields
    )
    
    with open(f"/Users/shaileshbujade/COPO Vision- Predictive Analytics Platform for NBA Outcome Attainment  /frontend/src/pages/dashboard/{page_name}.tsx", "w") as f:
        f.write(content)

print("Generated Phase 4 Configuration pages.")
