import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (title: string, data: any[]) => {
  if (data.length === 0) return;

  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const rows = data.map(item => Object.values(item));

  // Add Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(title, 14, 22);
  
  // Add Timestamp
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    head: [headers.map(h => h.replace(/([A-Z])/g, ' $1').toUpperCase())],
    body: rows,
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 8 },
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const exportToExcel = (title: string, data: any[]) => {
  if (data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
  XLSX.writeFile(workbook, `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
};
