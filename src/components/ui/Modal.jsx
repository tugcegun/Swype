import { X } from 'lucide-react'
import { useRef, useState, useCallback } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('input, select, textarea, button, a')) return
    setDragging(true)
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }, [pos])

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    setPos({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-swype-mid rounded-sm shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-swype-silver/40 dark:border-swype-dark"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          cursor: dragging ? 'grabbing' : 'default',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b border-swype-silver/30 dark:border-swype-dark/50 select-none"
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-sm font-semibold text-swype-dark dark:text-swype-cream">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-swype-cream rounded-sm transition-colors cursor-pointer">
            <X size={16} className="text-swype-silver" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
