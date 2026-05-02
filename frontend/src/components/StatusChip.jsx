import './StatusChip.css';

/**
 * status: 'complete' | 'inprogress' | 'pending' | 'score'
 */
export default function StatusChip({ label, status = 'pending', score }) {
  return (
    <span className={`chip chip--${status}`}>
      {status === 'score' && score !== undefined ? `${score}%` : label}
    </span>
  );
}
