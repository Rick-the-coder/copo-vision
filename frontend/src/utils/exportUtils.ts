export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Convert array of objects to CSV string
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let cellData = row[fieldName];
        if (cellData === null || cellData === undefined) cellData = '';
        if (typeof cellData === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          cellData = cellData.replace(/"/g, '""');
          if (cellData.includes(',') || cellData.includes('"') || cellData.includes('\n')) {
            cellData = `"${cellData}"`;
          }
        }
        return cellData;
      }).join(',')
    )
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
