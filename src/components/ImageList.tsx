import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ImageItem } from '../types'

interface Props {
  images: ImageItem[]
  onReorder: (images: ImageItem[]) => void
  onRemove: (id: string) => void
  onRotate: (id: string) => void
}

function SortableItem({
  item,
  index,
  onRemove,
  onRotate,
}: {
  item: ImageItem
  index: number
  onRemove: (id: string) => void
  onRotate: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 ${
        isDragging ? 'shadow-2xl shadow-black/50 ring-2 ring-blue-500/50' : ''
      }`}
    >
      <button
        type="button"
        className="touch-none p-1.5 text-slate-500 active:text-slate-300"
        {...attributes}
        {...listeners}
        aria-label="Przeciągnij, aby zmienić kolejność"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>

      <img
        src={item.previewUrl}
        alt=""
        className="w-14 h-14 object-cover rounded-xl flex-shrink-0 bg-slate-800"
        style={{ transform: `rotate(${item.rotation}deg)` }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{item.file.name}</p>
        <p className="text-xs text-slate-500">Strona {index + 1}</p>
      </div>

      <button
        type="button"
        onClick={() => onRotate(item.id)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 active:bg-slate-700"
        title="Obróć o 90°"
      >
        ↻
      </button>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-950/70 text-red-400 active:bg-red-900"
        title="Usuń"
      >
        ✕
      </button>
    </div>
  )
}

export default function ImageList({ images, onReorder, onRemove, onRotate }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex((i) => i.id === active.id)
    const newIndex = images.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(images, oldIndex, newIndex))
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-14 text-slate-500">
        <div className="text-4xl mb-3 opacity-40">📄</div>
        <p className="text-base font-medium">Brak zdjęć</p>
        <p className="text-sm mt-1 text-slate-600">Dodaj zdjęcia z galerii, aby zacząć</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {images.map((item, index) => (
            <SortableItem
              key={item.id}
              item={item}
              index={index}
              onRemove={onRemove}
              onRotate={onRotate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}