'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CheckEligibilityOutput } from '@/ai/flows/check-eligibility';
import { format } from 'date-fns';

type EligibilityReportData = CheckEligibilityOutput;

// A helper function to generate the PDF
export const generatePdf = (data: EligibilityReportData) => {
  const doc = new jsPDF();
  const { schemes, finalAdvice } = data;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Government Scheme Eligibility Report', 14, 22);

  // Report Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Report generated on: ${format(new Date(), 'PPP')}`, 14, 30);

  // Introduction / Final Advice from AI
  if (finalAdvice) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60);
    const splitAdvice = doc.splitTextToSize(`AI Advisor's Summary: ${finalAdvice}`, 180);
    doc.text(splitAdvice, 14, 40);
    doc.setFont('helvetica', 'normal');
  }

  // Filter schemes
  const eligibleSchemes = schemes.filter(s => s.eligible);
  const notEligibleSchemes = schemes.filter(s => !s.eligible);

  let currentY = 60; // Start position for tables

  // Table for Eligible Schemes
  if (eligibleSchemes.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Eligible Schemes', 'Priority', 'Explanation']],
      body: eligibleSchemes.map(s => [s.schemeName, s.priority, s.explanation]),
      headStyles: { fillColor: [34, 139, 34] }, // Green
      didDrawPage: (data) => { currentY = data.cursor?.y || currentY; },
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Table for Potentially Relevant Schemes
  if (notEligibleSchemes.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Potentially Relevant Schemes', 'Reason for Ineligibility']],
      body: notEligibleSchemes.map(s => [s.schemeName, s.rejectionReason || 'N/A']),
      headStyles: { fillColor: [220, 53, 69] }, // Red
    });
  }

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
      `"${scheme.eligible ? scheme.explanation.replace(/"/g, '""') : (scheme.rejectionReason || '').replace(/"/g, '""')}"`,
      `"${scheme.documentsRequired.join(', ')}"`,
      `"${scheme.applicationSteps.join('; ')}"`
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
