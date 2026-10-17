import { useInvoiceCalculator } from './hooks/useInvoiceCalculator';
import { Header } from './components/Header';
import { InvoiceDetailsCard } from './components/InvoiceDetailsCard';
import { ParticipantsManager } from './components/ParticipantsManager';
import { ItemsManager } from './components/ItemsManager';
import { SummaryView } from './components/SummaryView';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { exportToGoogleSheets } from './utils/googleSheetsExporter';
import { exportInvoiceJSON, importInvoiceJSON } from './utils/jsonPersistence';

export function App() {
  const {
    invoice,
    activeSubInvoice,
    calculationResult,
    updateInvoiceDetails,
    updateActiveSubInvoiceDetails,
    addSubInvoice,
    removeSubInvoice,
    setActiveSubInvoiceId,
    addParticipant,
    removeParticipant,
    updateParticipant,
    addItem,
    removeItem,
    toggleItemAssignment,
    resetInvoice,
    importInvoice,
  } = useInvoiceCalculator();

  const handleExportPDF = () => {
    generateInvoicePDF(invoice, calculationResult);
  };

  const handleExportSheets = () => {
    exportToGoogleSheets(invoice, calculationResult);
  };

  const handleExportJSON = () => {
    exportInvoiceJSON(invoice);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importInvoiceJSON(file);
      importInvoice(imported);
      e.target.value = '';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al importar el archivo JSON.';
      alert(message);
    }
  };

  return (
    <div className="app-container">
      <Header
        invoice={invoice}
        activeSubInvoice={activeSubInvoice}
        onUpdateGroupDetails={updateInvoiceDetails}
        onAddSubInvoice={addSubInvoice}
        onRemoveSubInvoice={removeSubInvoice}
        onSelectSubInvoice={setActiveSubInvoiceId}
        onReset={resetInvoice}
        onExportPDF={handleExportPDF}
        onExportSheets={handleExportSheets}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        participantCount={invoice.participants.length}
      />

      <main className="main-content">
        <InvoiceDetailsCard
          subInvoice={activeSubInvoice}
          currency={invoice.currency}
          onUpdate={updateActiveSubInvoiceDetails}
        />

        <div className="grid-2">
          <ParticipantsManager
            participants={invoice.participants}
            onAdd={addParticipant}
            onRemove={removeParticipant}
            onUpdate={updateParticipant}
          />

          <ItemsManager
            subInvoice={activeSubInvoice}
            participants={invoice.participants}
            currency={invoice.currency}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onToggleAssignment={toggleItemAssignment}
          />
        </div>

        <SummaryView invoice={invoice} result={calculationResult} onExportPDF={handleExportPDF} onExportSheets={handleExportSheets} />
      </main>

      <footer className="footer">
        <p>ShareTicket • Aplicación de división de gastos con React, TypeScript y CSS Puro</p>
      </footer>
    </div>
  );
}

export default App;
