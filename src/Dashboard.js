import React from 'react';
import bgImage from '../assets/ai-mairim.png'; // 👈 Importert bilde

export default function Dashboard() {
  return (
    <div className="relative z-[1] min-h-screen bg-[#121212] text-[#f0f0f0] font-[Inter] p-4">
      {/* Bakgrunnsbilde med fallback gradient */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-[12px] opacity-30 -z-10"
        style={{
          backgroundImage: `url(${bgImage}), linear-gradient(to right, #121212, #1e1e1e)`,
          backgroundBlendMode: 'overlay',
        }}
      />

      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-6 p-4 bg-[#1e1e1e] border-b border-[#333]">
        {/* Avatar */}
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-[3px] border-[#00c2a8] shrink-0">
          <img
            src="/path/to/avatar.jpg"
            alt="Avatar"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

        {/* Rådtekst */}
        <div className="flex-1">
          <h2 className="m-0 text-[20px] font-semibold">Hei Robin 👋</h2>
          <p className="my-2 text-[16px] text-[#ffb347]">
            Husk å oppdatere budsjettet ditt for denne måneden!
          </p>

          {/* Inputfelt */}
          <input
            type="text"
            placeholder="Din saldo"
            className="mt-2 px-3 py-2 text-[16px] rounded border border-[#888] bg-[#1e1e1e] text-[#f0f0f0] w-full max-w-[200px]"
          />
        </div>
      </div>

      {/* Seksjoner */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="bg-[#1e1e1e] p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Utgifter</h3>
          <p className="text-sm text-gray-300">Ingen registrerte utgifter ennå.</p>

          <div className="flex flex-wrap gap-3 mt-3">
            <button className="bg-[#00c2a8] text-white font-bold px-4 py-2 rounded cursor-pointer transition-colors duration-200 hover:bg-[#009e8f]">
              Legg til utgift
            </button>
            <button className="bg-[#00c2a8] text-white font-bold px-4 py-2 rounded cursor-pointer transition-colors duration-200 hover:bg-[#009e8f]">
              Skann kvittering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

