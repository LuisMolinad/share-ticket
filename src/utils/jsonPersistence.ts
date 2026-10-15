import type { Invoice } from '../domain/types';

const STORAGE_KEY = 'share_ticket_current_invoice_v1';

export function loadInvoiceFromStorage(): Invoice | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.subInvoices) && Array.isArray(parsed.participants)) {
        return parsed as Invoice;
      }
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }
  return null;
}

export function saveInvoiceToStorage(invoice: Invoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function exportInvoiceJSON(invoice: Invoice): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoice, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const safeTitle = (invoice.title || 'gastos_grupales').toLowerCase().replace(/[^a-z0-9]/g, '_');
  downloadAnchor.setAttribute("download", `share_ticket_backup_${safeTitle}_${invoice.date}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importInvoiceJSON(file: File): Promise<Invoice> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.subInvoices) && Array.isArray(parsed.participants)) {
          resolve(parsed as Invoice);
        } else {
          reject(new Error('El archivo JSON no tiene un formato válido de ShareTicket.'));
        }
      } catch {
        reject(new Error('Error al parsear el archivo JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsText(file);
  });
}
