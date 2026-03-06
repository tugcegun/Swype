import iconImg from '../../assets/icon.png'

export default function Logo({ size = 32, className = '' }) {
  return (
    <img
      src={iconImg}
      alt="SW"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ imageRendering: 'auto' }}
    />
  )
}
