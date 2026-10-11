import { useInvoiceCalculator } from './hooks/useInvoiceCalculator';
import { Header } from './components/Header';
import { InvoiceDetailsCard } from './components/InvoiceDetailsCard';
import { ParticipantsManager } from './components/ParticipantsManager';
import { ItemsManager } from './components/ItemsManager';
import { SummaryView } from './components/SummaryView';
import { generateInvoicePDF } from './utils/pdfGenerator';

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
  } = useInvoiceCalculator();

  const handleExportPDF = () => {
    generateInvoicePDF(invoice, calculationResult);
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

        <SummaryView invoice={invoice} result={calculationResult} onExportPDF={handleExportPDF} />
      </main>

      <footer className="footer">
        <p>ShareTicket • Aplicación de división de gastos con React, TypeScript y CSS Puro</p>
      </footer>
    </div>
  );
}

export default App;
