import * as XLSX from 'xlsx';
import type { Invoice, CalculationResult } from '../domain/types';

export function exportToGoogleSheets(invoice: Invoice, result: CalculationResult) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Resumen General
  const summaryRows: (string | number | { t: string; v: any; f: string })[][] = [
    ['REPORTE GLOBAL DE GASTOS - SHARE TICKET'],
    ['Grupo / Sesión:', invoice.title || 'Gastos Grupales'],
    ['Fecha:', invoice.date],
    ['Moneda:', invoice.currency],
    ['Participantes:', invoice.participants.length],
    ['Total Tickets:', invoice.subInvoices.length],
    [],
    ['Concepto', 'Monto'],
    ['Subtotal General', result.subtotal],
    ['Descuentos Totales', result.totalDiscount],
    ['Impuestos Totales', result.totalTax],
    ['Propinas Totales', result.totalTip],
    ['GRAN TOTAL CONSOLIDADO', { t: 'f', v: result.grandTotal, f: 'B9-B10+B11+B12' }],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen General');

  // 2. Sheet: Desglose por Persona
  const participantHeader = ['Participante', 'Subtotal', 'Descuento', 'Impuestos', 'Propinas', 'TOTAL'];
  const participantRows: (string | number | { t: string; v: any; f: string })[][] = [
    participantHeader,
  ];

    result.shares.forEach((share, index) => {
      const rowIdx = index + 2; // 1-based index, header is row 1
      participantRows.push([
        share.participantName,
        share.subtotal,
        share.discountShare,
        share.taxShare,
        share.tipShare,
        { t: 'f', v: share.total, f: `B${rowIdx}-C${rowIdx}+D${rowIdx}+E${rowIdx}` },
      ]);
    });

    if (result.shares.length > 0) {
      const startRow = 2;
      const endRow = result.shares.length + 1;
      participantRows.push([
        'TOTAL',
        { t: 'f', v: result.subtotal, f: `SUM(B${startRow}:B${endRow})` },
        { t: 'f', v: result.totalDiscount, f: `SUM(C${startRow}:C${endRow})` },
        { t: 'f', v: result.totalTax, f: `SUM(D${startRow}:D${endRow})` },
        { t: 'f', v: result.totalTip, f: `SUM(E${startRow}:E${endRow})` },
        { t: 'f', v: result.grandTotal, f: `SUM(F${startRow}:F${endRow})` },
      ]);
    }

  const wsParticipants = XLSX.utils.aoa_to_sheet(participantRows);
  XLSX.utils.book_append_sheet(wb, wsParticipants, 'Desglose por Persona');

  // 3. Sheet: Detalle por Ticket
  const ticketRows: (string | number)[][] = [
    ['Ticket / Sub-factura', 'Nombre del Ítem', 'Cantidad', 'Precio Unit.', 'Subtotal Ítem', 'Participantes Asignados'],
  ];

  invoice.subInvoices.forEach((sub) => {
    sub.items.forEach((item) => {
      const assignedNames = item.assignedParticipantIds.length === 0
        ? 'Todos (Repartido equitativamente)'
        : item.assignedParticipantIds
            .map((pId) => invoice.participants.find((p) => p.id === pId)?.name || pId)
            .join(', ');

      ticketRows.push([
        sub.title,
        item.name,
        item.quantity,
        item.price,
        item.quantity * item.price,
        assignedNames,
      ]);
    });
  });

  const wsTickets = XLSX.utils.aoa_to_sheet(ticketRows);
  XLSX.utils.book_append_sheet(wb, wsTickets, 'Detalle por Tickets');

  // Generate filename and trigger download (.xlsx is natively imported into Google Sheets with formulas)
  const safeTitle = (invoice.title || 'gastos_grupales').toLowerCase().replace(/[^a-z0-9]/g, '_');
  XLSX.writeFile(wb, `reporte_google_sheets_${safeTitle}_${invoice.date}.xlsx`);
}
