import { prisma } from './db/prisma';
import { serializeChecklist } from './lib/task-mapper';

async function main() {
  const count = await prisma.task.count();
  if (count > 0) {
    console.log('Base de datos ya tiene datos, omitiendo seed.');
    return;
  }

  const tasks = [
    {
      title: 'Entregar reporte fiscal trimestral',
      description:
        'Consolidar cifras de ingresos y gastos del trimestre, generar el PDF final y enviarlo a contabilidad antes del cierre de operaciones.',
      urgent: true,
      important: true,
      checklist: [
        { id: '1', text: 'Recolectar facturas pendientes', completed: true },
        { id: '2', text: 'Consolidar hoja de cálculo', completed: true },
        { id: '3', text: 'Revisar cifras con contador', completed: false },
        { id: '4', text: 'Enviar PDF final', completed: false },
      ],
    },
    {
      title: 'Confirmar pago de renta',
      description:
        'Transferir el pago de renta del mes y guardar el comprobante en la carpeta compartida.',
      urgent: true,
      important: true,
      checklist: [
        { id: '5', text: 'Verificar saldo disponible', completed: true },
        { id: '6', text: 'Realizar transferencia', completed: false },
        { id: '7', text: 'Guardar comprobante', completed: false },
      ],
    },
    {
      title: 'Planear rutina de ejercicio semanal',
      description:
        'Diseñar un plan de entrenamiento de 4 días considerando el horario de trabajo, con enfoque en fuerza y cardio.',
      urgent: false,
      important: true,
      checklist: [
        { id: '8', text: 'Elegir días de entrenamiento', completed: true },
        { id: '9', text: 'Buscar rutina de fuerza', completed: false },
        { id: '10', text: 'Agendar en calendario', completed: false },
      ],
    },
    {
      title: 'Actualizar CV y portafolio',
      description:
        'Revisar experiencia reciente, actualizar proyectos destacados y exportar versión en PDF.',
      urgent: false,
      important: true,
      checklist: [
        { id: '11', text: 'Actualizar experiencia', completed: false },
        { id: '12', text: 'Actualizar proyectos', completed: false },
      ],
    },
    {
      title: 'Responder correos acumulados',
      description:
        'Vaciar la bandeja de entrada respondiendo o archivando los correos pendientes de esta semana.',
      urgent: true,
      important: false,
      checklist: [
        { id: '13', text: 'Clasificar por urgencia', completed: true },
        { id: '14', text: 'Responder los 5 más antiguos', completed: false },
      ],
    },
    {
      title: 'Agendar cita al dentista',
      description: 'Llamar al consultorio para agendar la revisión semestral.',
      urgent: true,
      important: false,
      checklist: [],
    },
    {
      title: 'Organizar fotos del celular',
      description: 'Eliminar duplicados y hacer respaldo de las fotos del último año.',
      urgent: false,
      important: false,
      checklist: [
        { id: '15', text: 'Eliminar duplicados', completed: false },
        { id: '16', text: 'Subir respaldo a la nube', completed: false },
      ],
    },
    {
      title: 'Probar nueva app de notas',
      description: 'Evaluar si vale la pena migrar el sistema de notas actual.',
      urgent: false,
      important: false,
      checklist: [],
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        urgent: t.urgent,
        important: t.important,
        checklist: serializeChecklist(t.checklist),
      },
    });
  }

  const today = new Date();
  today.setHours(10, 0, 0, 0);

  for (let i = 1; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    await prisma.task.create({
      data: {
        title: `Tarea completada día -${i}`,
        description: 'Tarea de ejemplo para historial de racha.',
        urgent: i % 3 === 0,
        important: i % 2 === 0,
        status: 'completed',
        completedAt: d,
        pointsAwarded: 15,
        quadrantAtCompletion: 2,
        checklist: '[]',
      },
    });
  }

  console.log('Seed completado.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
