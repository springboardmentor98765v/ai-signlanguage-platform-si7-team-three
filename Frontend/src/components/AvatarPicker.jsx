import { useRef } from 'react'
import { Camera, X } from 'lucide-react'

const PRESET_COLORS = [
  'from-signal-teal to-violet-500',
  'from-signal-coral to-signal-amber',
  'from-violet-500 to-signal-coral',
  'from-signal-amber to-signal-teal',
]

export default function AvatarPicker({ name = '', avatar, color = PRESET_COLORS[0], onChange, onColorChange, size = 96 }) {
  const inputRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 3 * 1024 * 1024) {
      alert('Please choose an image under 3MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result) // data URL, stored as `avatar`
    reader.readAsDataURL(file)
  }

  const initial = name?.[0]?.toUpperCase() || '?'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {avatar ? (
          <img
            src={avatar}
            alt="Your avatar"
            className="h-full w-full rounded-full border-2 border-white/20 object-cover shadow-glass"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center rounded-full border-2 border-white/20 bg-gradient-to-br font-display font-bold text-night-950 shadow-glass ${color}`}
            style={{ fontSize: size * 0.4 }}
          >
            {initial}
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-night-800 text-mist-100 shadow-glass transition hover:bg-night-700"
          title="Upload photo"
        >
          <Camera size={15} />
        </button>

        {avatar && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-night-800 text-signal-coral shadow-glass transition hover:bg-night-700"
            title="Remove photo"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      {!avatar && onColorChange && (
        <div className="flex gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onColorChange(c)}
              className={`h-6 w-6 rounded-full bg-gradient-to-br ${c} transition
                ${color === c ? 'ring-2 ring-mist-100 ring-offset-2 ring-offset-night-900' : 'opacity-70 hover:opacity-100'}`}
              title="Use this color"
            />
          ))}
        </div>
      )}

      <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-signal-teal hover:underline">
        {avatar ? 'Change photo' : 'Upload photo'}
      </button>
    </div>
  )
}
