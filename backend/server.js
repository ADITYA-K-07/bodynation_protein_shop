import app, { prepareApp } from './app.js';

async function startServer() {
  try {
    await prepareApp();
    console.log('Body Nation backend ready');

    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    process.exit(1);
  }
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default async function handler(req, res) {
  await prepareApp();
  return app(req, res);
}
