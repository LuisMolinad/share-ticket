import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CalculationResult } from '../domain/types';
import { formatAmount } from './formatters';

export function generateInvoicePDF(invoice: Invoice, result: CalculationResult) {
  const doc = new jsPDF();
  const currency = invoice.currency;

  // Header Background
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 42, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE GLOBAL DE GASTOS', 14, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grupo: ${invoice.title || 'Gastos Grupales'}  |  Fecha: ${invoice.date}  |  Tickets: ${invoice.subInvoices.length}`, 14, 32);

  // General summary box
  doc.setTextColor(31, 41, 55); // Gray 800
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General Consolidado', 14, 52);

  const summaryData = [
    ['Subtotal general de ítems:', `${currency}${formatAmount(result.subtotal)}`],
    ['Descuentos totales:', `-${currency}${formatAmount(result.totalDiscount)}`],
    ['Impuestos totales:', `${currency}${formatAmount(result.totalTax)}`],
    ['Propinas totales:', `${currency}${formatAmount(result.totalTip)}`],
    ['GRAN TOTAL CONSOLIDADO:', `${currency}${formatAmount(result.grandTotal)}`],
  ];

  autoTable(doc, {
    startY: 56,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { halign: 'right', cellWidth: 40 },
    },
  });

  // Participants breakdown table
  let finalY = (doc as any).lastAutoTable.finalY || 90;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total a Pagar por Persona (Consolidado)', 14, finalY + 12);

  const participantRows = result.shares.map((share) => [
    share.participantName,
    `${currency}${formatAmount(share.subtotal)}`,
    share.discountShare > 0 ? `-${currency}${formatAmount(share.discountShare)}` : `${currency}0.00`,
    `${currency}${formatAmount(share.taxShare)}`,
    `${currency}${formatAmount(share.tipShare)}`,
    `${currency}${formatAmount(share.total)}`,
  ]);

  autoTable(doc, {
    startY: finalY + 16,
    head: [['Participante', 'Subtotal', 'Descuento', 'Impuestos', 'Propinas', 'TOTAL']],
    body: participantRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      5: { fontStyle: 'bold', textColor: [79, 70, 229] },
    },
  });

  // Detailed items per participant across tickets
  finalY = (doc as any).lastAutoTable.finalY || 150;
  
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 15;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Desglose Detallado por Participante y Ticket', 14, finalY);

  let currentY = finalY + 8;

  result.shares.forEach((share) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${share.participantName} — Total Acumulado: ${currency}${formatAmount(share.total)}`, 14, currentY);
    currentY += 6;

    share.ticketBreakdowns.forEach((tb) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(`• Ticket: ${tb.subInvoiceTitle} (Subtotal: ${currency}${formatAmount(tb.total)})`, 18, currentY);
      currentY += 4;

      const itemRows = tb.assignedItems.map((item) => [
        item.itemName.replace(/\[.*?\]\s*/, ''),
        `${item.quantity % 1 === 0 ? item.quantity : formatAmount(item.quantity)} un.`,
        `${currency}${formatAmount(item.price)}`,
        `${currency}${formatAmount(item.share)}`,
      ]);

      if (itemRows.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Ítem', 'Cant.', 'Precio Unit.', 'Subtotal']],
          body: itemRows,
          theme: 'striped',
          headStyles: { fillColor: [156, 163, 175], textColor: [255, 255, 255] },
          styles: { fontSize: 8.5, cellPadding: 2 },
          margin: { left: 18 },
        });
        currentY = (doc as any).lastAutoTable.finalY + 8;
      } else {
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Sin ítems en este ticket.', 22, currentY + 3);
        currentY += 8;
      }
    });

    currentY += 4;
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generado por ShareTicket App - Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const safeTitle = (invoice.title || 'gastos_grupales').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`reporte_global_${safeTitle}_${invoice.date}.pdf`);
}
