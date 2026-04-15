// Mismo número que BudgetModal
const WHATSAPP_NUMBER = '+5491144340580';
const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppFAB() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-8 right-8 rounded-full bg-[#C5A059] p-4 w-16 h-16 flex items-center justify-center z-[100] shadow-lg hover:scale-110 transition-transform duration-300 group"
    >
      <span className="material-symbols-outlined text-white text-2xl">chat</span>
      <div className="absolute right-20 bg-white px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
        <p className="font-body font-bold text-xs text-on-surface">Hablá con nuestro equipo</p>
      </div>
    </a>
  );
}
