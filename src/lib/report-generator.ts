'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CheckEligibilityOutput } from '@/ai/flows/check-eligibility';
import { format } from 'date-fns';

type EligibilityReportData = CheckEligibilityOutput;

// A helper function to generate a well-formatted PDF
export const generatePdf = (data: EligibilityReportData) => {
  const doc = new jsPDF();
  const { schemes, finalAdvice } = data;
  let currentY = 15; // Top margin

  const addText = (text: string, x: number, y: number, size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.text(text, x, y);
    return doc.getTextDimensions(text).h;
  };
  
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    const dims = doc.getTextDimensions(lines);
    return dims.h;
  };

  // --- Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(33, 37, 41); // Dark color
  addText('Government Scheme Eligibility Report', 14, currentY, 22, 'bold');
  currentY += 10;

  doc.setFontSize(11);
  doc.setTextColor(108, 117, 125); // Muted color
  addText(`Report Generated: ${format(new Date(), 'PPP')}`, 14, currentY, 11);
  currentY += 15;

  // --- AI Final Advice ---
  if (finalAdvice) {
    doc.setFillColor(248, 249, 250); // Light grey background
    doc.rect(14, currentY - 5, 182, addWrappedText(finalAdvice, 20, currentY, 170) + 10, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    addText("AI Advisor's Summary", 20, currentY, 12, 'bold');
    currentY += 7;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 37, 41);
    currentY += addWrappedText(finalAdvice, 20, currentY, 170);
    currentY += 15;
  }
  
  const checkPageBreak = () => {
    if (currentY > 270) {
        doc.addPage();
        currentY = 15;
    }
  }

  // --- Schemes Loop ---
  schemes.forEach((scheme, index) => {
    checkPageBreak();
    
    // Scheme Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(scheme.eligible ? '#198754' : '#dc3545'); // Green for eligible, Red for not
    const status = scheme.eligible ? '(Eligible)' : '(Not Eligible)';
    addText(`${scheme.schemeName} ${status}`, 14, currentY, 16, 'bold');
    currentY += 8;

    // AI Explanation
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(108, 117, 125);
    const explanation = scheme.eligible ? scheme.explanation : (scheme.rejectionReason || 'No reason provided.');
    currentY += addWrappedText(explanation, 14, currentY, 180);
    currentY += 10;

    checkPageBreak();

    // Documents Required Table
    if (scheme.documentsRequired && scheme.documentsRequired.length > 0) {
        autoTable(doc, {
            startY: currentY,
            head: [['Documents Required']],
            body: scheme.documentsRequired.map(doc => [doc]),
            theme: 'grid',
            headStyles: { fillColor: [52, 58, 64] }, // Dark grey
            bodyStyles: { fontSize: 10 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    checkPageBreak();

    // Application Steps Table
    if (scheme.applicationSteps && scheme.applicationSteps.length > 0) {
        autoTable(doc, {
            startY: currentY,
            head: [['Application Steps']],
            body: scheme.applicationSteps.map(step => [step]),
            theme: 'grid',
            headStyles: { fillColor: [52, 58, 64] },
            bodyStyles: { fontSize: 10 },
            didParseCell: (data) => { // Add numbering
              if (data.section === 'body' && data.column.index === 0) {
                data.cell.text = `${data.row.index + 1}. ${data.cell.text}`;
              }
            }
        });
        currentY = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Add a separator line
    if (index < schemes.length - 1) {
        doc.setDrawColor(222, 226, 230);
        doc.line(14, currentY, 196, currentY);
        currentY += 10;
    }
  });


  // Save the PDF
  doc.save(`GovScheme_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

// A helper function to generate the CSV
export const generateCsv = (data: EligibilityReportData) => {
  const { schemes } = data;
  
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // CSV Header
  const headers = [
    "Scheme Name",
    "Eligible",
    "Priority",
    "Explanation/Rejection Reason",
    "Documents Required",
    "Application Steps"
  ];
  csvContent += headers.join(",") + "\r\n";

  // CSV Rows
  schemes.forEach(scheme => {
    const row = [
      `"${scheme.schemeName}"`,
      scheme.eligible ? "Yes" : "No",
      `"${scheme.priority}"`,
      `"${scheme.eligible ? (scheme.explanation || '').replace(/"/g, '""') : (scheme.rejectionReason || '').replace(/"/g, '""')}"`,
      `"${scheme.documentsRequired.join(', ')}"`,
      `"${scheme.applicationSteps.map((s, i) => `${i + 1}. ${s}`).join('; ')}"`
    ];
    csvContent += row.join(",") + "\r\n";
  });

  // Create and download the file
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `GovScheme_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
