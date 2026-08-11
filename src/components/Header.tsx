export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">ArchiwumPDF</h1>
          <p className="text-[11px] text-slate-400 leading-none mt-0.5">Archiwum 13 SAS · offline</p>
        </div>
        <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
          v1.1
        </div>
      </div>
    </header>
  )
}