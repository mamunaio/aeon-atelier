import { NovaMascot } from '../assistant/NovaMascot'

export function PageLoader() {
  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="nova-float"><NovaMascot mood="think" size={96} /></div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-aurora-400"
              style={{ animation: `nova-float-kf 0.9s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
