import type { Settings } from '../types'

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
}

export default function SettingsPanel({ settings, onChange }: Props) {
  const update = (partial: Partial<Settings>) => onChange({ ...settings, ...partial })

  return (
    <div className="space-y-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">Jakość / rozmiar PDF</label>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'low', label: 'Wysoka' },
            { value: 'medium', label: 'Średnia' },
            { value: 'high', label: 'Silna' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ compression: opt.value })}
              className={`py-2.5 text-sm rounded-xl border font-medium transition active:scale-95 ${
                settings.compression === opt.value
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">
          Silna kompresja = dużo mniejszy plik, nieco gorsza jakość zdjęć
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1.5">Tekst nagłówka</label>
        <input
          type="text"
          value={settings.headerText}
          onChange={(e) => update({ headerText: e.target.value })}
          placeholder="np. Rodzina Baczyńskich · 1945"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition"
        />
      </div>

      <div className="space-y-3 pt-1">
        <Toggle
          label="Numery stron"
          checked={settings.pageNumbers}
          onChange={(v) => update({ pageNumbers: v })}
        />
        <Toggle
          label='Watermark „Archiwum 13 SAS”'
          checked={settings.watermark}
          onChange={(v) => update({ watermark: v })}
        />
      </div>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}