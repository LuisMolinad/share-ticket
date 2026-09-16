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
    calculationResult,
    updateInvoiceDetails,
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
        onUpdateDetails={updateInvoiceDetails}
        onReset={resetInvoice}
        onExportPDF={handleExportPDF}
        participantCount={invoice.participants.length}
        itemCount={invoice.items.length}
      />

      <main className="main-content">
        <InvoiceDetailsCard invoice={invoice} onUpdate={updateInvoiceDetails} />

        <div className="grid-2">
          <ParticipantsManager
            participants={invoice.participants}
            onAdd={addParticipant}
            onRemove={removeParticipant}
            onUpdate={updateParticipant}
          />

          <ItemsManager
            items={invoice.items}
            participants={invoice.participants}
            splitMode={invoice.splitMode}
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
