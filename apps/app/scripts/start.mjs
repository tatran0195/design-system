process.env.PORT ??= '4310';
process.env.NITRO_PORT ??= process.env.PORT;
process.env.HOST ??= '0.0.0.0';
process.env.NITRO_HOST ??= process.env.HOST;
await import('../.output/server/index.mjs');
