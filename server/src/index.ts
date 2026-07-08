import { createApp } from './app';

const PORT = Number(process.env.PORT) || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Comando del Día API en http://localhost:${PORT}`);
});
