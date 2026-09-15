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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Header
        invoice={invoice}
        onUpdateDetails={updateInvoiceDetails}
        onReset={resetInvoice}
        onExportPDF={handleExportPDF}
        participantCount={invoice.participants.length}
        itemCount={invoice.items.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <InvoiceDetailsCard invoice={invoice} onUpdate={updateInvoiceDetails} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500 mt-12">
        <p>ShareTicket • Aplicación de división de gastos con React, TypeScript y Patrones de Diseño (Strategy & Factory)</p>
      </footer>
    </div>
  );
}

export default App;
