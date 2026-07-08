const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatLongDateEs(date = new Date()): string {
  return `${DIAS[date.getDay()]}, ${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}

export function taskMeta(task: { checklist: { completed: boolean }[] }): string {
  const done = task.checklist.filter((s) => s.completed).length;
  const total = task.checklist.length;
  return total ? `${done}/${total} subtareas` : '';
}
