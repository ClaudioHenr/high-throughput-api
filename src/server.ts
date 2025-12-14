import { buildApp } from './app';

const startServer = async () => {
  const app = await buildApp();

    try {
        const port = Number(process.env.PORT) || 3000;
        await app.listen({ port, host: '0.0.0.0' });

        app.log.info(`🚀 Server running on port ${port}`);

    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

startServer();
