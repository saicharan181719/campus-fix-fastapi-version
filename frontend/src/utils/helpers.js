export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatLocation(location) {
  if (!location) return '—';
  const parts = [location.block, location.building, location.room, location.area];
  return parts.filter(Boolean).join(', ');
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function specLabel(spec) {
  const map = {
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    cleaning: 'Cleaning',
    wifi_it: 'Wi-Fi / IT',
    classroom_equipment: 'Classroom Equipment',
    security: 'Security',
    other: 'Other',
  };
  return map[spec] || spec || '—';
}
