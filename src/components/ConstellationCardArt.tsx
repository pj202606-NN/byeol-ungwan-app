import './ConstellationCardArt.css';

/** Reuse the existing JPEG-derived WebP art without changing source files or frames. */
export default function ConstellationCardArt({ src, alt, eager = false, position }: { src?: string; alt: string; eager?: boolean; position?: string }) {
  if (!src) return null;
  return <img className="constellation-card-art" src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" style={position ? { objectPosition: position } : undefined} />;
}
