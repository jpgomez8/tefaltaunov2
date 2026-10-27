export function validateEnvironment(config: Record<string, unknown>) {
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as const;
  for (const key of required) {
    if (typeof config[key] !== 'string' || config[key].length === 0) {
      throw new Error(`Falta la variable de configuracion ${key}`);
    }
  }
  if (config.DB_USER === 'postgres') {
    throw new Error('El backend debe usar el usuario limitado de la aplicacion');
  }

  function port(key: string, fallback: number) {
    const raw = config[key] ?? fallback;
    const value = Number(raw);
    if (!/^\d+$/.test(String(raw)) || !Number.isInteger(value) || value < 1 || value > 65535) {
      throw new Error(`Puerto invalido en ${key}`);
    }
    return value;
  }

  const rawOrigins = config.FRONTEND_ORIGINS ?? 'http://localhost:4200,http://127.0.0.1:4200';
  if (typeof rawOrigins !== 'string' || rawOrigins.trim() === '') {
    throw new Error('FRONTEND_ORIGINS debe contener origenes HTTP validos');
  }
  const origins = rawOrigins.split(',').map((origin) => {
    try {
      const url = new URL(origin.trim());
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
          url.pathname !== '/' || url.search || url.hash) throw new Error();
      return url.origin;
    } catch {
      throw new Error('FRONTEND_ORIGINS contiene un origen no valido');
    }
  });

  return {
    ...config, PORT: port('PORT', 3000), DB_PORT: port('DB_PORT', 5434),
    FRONTEND_ORIGINS: [...new Set(origins)],
  };
}
