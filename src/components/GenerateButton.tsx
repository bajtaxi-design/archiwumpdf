interface Props {
  disabled: boolean
  loading: boolean
  progress: { current: number; total: number } | null
  onClick: () => void
}

export default function GenerateButton({ disabled, loading, progress, onClick }: Props) {
  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-base text-white shadow-lg shadow-blue-900/30 transition"
      >
        {loading
          ? progress
            ? `Generuję… ${progress.current}/${progress.total}`
            : 'Generuję PDF…'
          : 'Utwórz PDF'}
      </button>

      {loading && progress && (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}