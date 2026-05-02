import './Button.css';

/**
 * variant: 'primary' | 'secondary' | 'tertiary' | 'ghost'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  id,
  type = 'button',
  loading = false,
}) {
  return (
    <button
      id={id}
      type={type}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth ? 'btn--full' : '',
        loading ? 'btn--loading' : '',
      ].join(' ')}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {Icon && !loading && <Icon size={18} strokeWidth={2} className="btn__icon" />}
      <span className="btn__text">{children}</span>
    </button>
  );
}
