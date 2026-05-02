import './Card.css';

/**
 * elevated: adds floating shadow
 * glass: applies glassmorphism
 */
export default function Card({ children, className = '', elevated = false, glass = false, onClick, id }) {
  return (
    <div
      id={id}
      className={[
        'card',
        elevated ? 'card--elevated' : '',
        glass ? 'card--glass' : '',
        onClick ? 'card--clickable' : '',
        className,
      ].join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
