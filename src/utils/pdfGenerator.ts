import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CalculationResult } from '../domain/types';

export function generateInvoicePDF(invoice: Invoice, result: CalculationResult) {
  const doc = new jsPDF();
  const currency = invoice.currency;

  // Header Background
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE GASTOS - DIVISIÓN DE FACTURA', 14, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Factura: ${invoice.title || 'Sin título'}  |  Fecha: ${invoice.date}`, 14, 30);

  // General summary box
  doc.setTextColor(31, 41, 55); // Gray 800
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General', 14, 52);

  const summaryData = [
    ['Subtotal ítems:', `${currency}${result.subtotal.toFixed(2)}`],
    ['Descuento aplicado:', `-${currency}${result.totalDiscount.toFixed(2)}`],
    [`Impuestos (${invoice.taxPercentage}%):`, `${currency}${result.totalTax.toFixed(2)}`],
    [`Propina (${invoice.tipPercentage}%):`, `${currency}${result.totalTip.toFixed(2)}`],
    ['TOTAL GENERAL:', `${currency}${result.grandTotal.toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: 56,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right', cellWidth: 40 },
    },
  });

  // Participants breakdown table
  let finalY = (doc as any).lastAutoTable.finalY || 90;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total a Pagar por Persona', 14, finalY + 12);

  const participantRows = result.shares.map((share) => [
    share.participantName,
    `${currency}${share.subtotal.toFixed(2)}`,
    share.discountShare > 0 ? `-${currency}${share.discountShare.toFixed(2)}` : `${currency}0.00`,
    `${currency}${share.taxShare.toFixed(2)}`,
    `${currency}${share.tipShare.toFixed(2)}`,
    `${currency}${share.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: finalY + 16,
    head: [['Participante', 'Subtotal', 'Descuento', 'Impuesto', 'Propina', 'TOTAL']],
    body: participantRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4, halign: 'center' },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      5: { fontStyle: 'bold', textColor: [79, 70, 229] },
    },
  });

  // Detailed items per participant
  finalY = (doc as any).lastAutoTable.finalY || 150;
  
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY += 15;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Consumo por Persona', 14, finalY);

  let currentY = finalY + 8;

  result.shares.forEach((share) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${share.participantName} (Total: ${currency}${share.total.toFixed(2)})`, 14, currentY);
    currentY += 4;

    const itemRows = share.assignedItems.map((item) => [
      item.itemName,
      `${item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)} un.`,
      `${currency}${item.price.toFixed(2)}`,
      `${currency}${item.share.toFixed(2)}`,
    ]);

    if (itemRows.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Ítem', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: itemRows,
        theme: 'striped',
        headStyles: { fillColor: [156, 163, 175], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 2 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(107, 114, 128);
      doc.text('Sin ítems específicos asignados.', 14, currentY + 4);
      currentY += 12;
    }
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
  const safeTitle = (invoice.title || 'factura').toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`ticket_${safeTitle}_${invoice.date}.pdf`);
}
