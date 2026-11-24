// Mismo número que BudgetModal
const WHATSAPP_NUMBER = '+5491176498888';
const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppFAB() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-8 right-8 rounded-full bg-white border border-[#25D366]/30 p-3.5 w-16 h-16 flex items-center justify-center z-[100] shadow-lg hover:scale-110 hover:bg-[#F0FFF5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] transition duration-300 motion-reduce:transition-none motion-reduce:hover:scale-100 group"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#25D366]" aria-hidden="true" focusable="false">
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.5 0 .16 5.33.15 11.89c0 2.1.55 4.15 1.59 5.96L.05 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.33 11.9-11.89a11.82 11.82 0 0 0-3.43-8.43ZM12.05 21.8a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.38a9.87 9.87 0 0 1-1.52-5.27c0-5.45 4.44-9.89 9.9-9.89a9.82 9.82 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.48 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
      <div className="absolute right-20 bg-white px-4 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none transition-opacity duration-300 whitespace-nowrap">
        <p className="font-body font-bold text-xs text-on-surface">Escribinos por WhatsApp</p>
      </div>
    </a>
  );
}
