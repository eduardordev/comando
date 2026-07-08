const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatLongDateEs(date = new Date()): string {
  return `${DIAS[date.getDay()]}, ${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function taskMeta(task: { area?: string; checklist: { completed: boolean }[] }): string {
  const parts: string[] = [];
  if (task.area?.trim()) parts.push(task.area.trim());
  const total = task.checklist.length;
  if (total) {
    const done = task.checklist.filter((s) => s.completed).length;
    parts.push(`${done}/${total} subtareas`);
  }
  return parts.join(' · ');
}
