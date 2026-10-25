import { validateEnvironment } from './environment.js';

const valid = {
  DB_HOST: '127.0.0.1', DB_NAME: 'comunidad_deportiva_dev',
  DB_USER: 'comunidad_deportiva_app', DB_PASSWORD: 'test-only',
};

describe('Configuracion del backend', () => {
  it('convierte los puertos a numeros y aplica los valores locales por defecto', () => {
    expect(validateEnvironment(valid)).toMatchObject({ PORT: 3000, DB_PORT: 5434 });
    expect(validateEnvironment({ ...valid, PORT: '3100', DB_PORT: '5435' }))
      .toMatchObject({ PORT: 3100, DB_PORT: 5435 });
  });

  it('rechaza una credencial ausente sin mostrar los valores de configuracion', () => {
    expect(() => validateEnvironment({ ...valid, DB_PASSWORD: '' })).toThrow('DB_PASSWORD');
  });

  it('rechaza el usuario administrador', () => {
    expect(() => validateEnvironment({ ...valid, DB_USER: 'postgres' })).toThrow('usuario limitado');
  });

  it('permite los dos origenes locales y normaliza una lista explicita', () => {
    expect(validateEnvironment(valid).FRONTEND_ORIGINS)
      .toEqual(['http://localhost:4200', 'http://127.0.0.1:4200']);
    expect(validateEnvironment({ ...valid, FRONTEND_ORIGINS: ' https://ejemplo.cl/,https://ejemplo.cl' }).FRONTEND_ORIGINS)
      .toEqual(['https://ejemplo.cl']);
  });

  it('admite un puerto de vista previa si se configura de forma explicita', () => {
    expect(validateEnvironment({ ...valid, FRONTEND_ORIGINS: 'http://localhost:55922' }).FRONTEND_ORIGINS)
      .toEqual(['http://localhost:55922']);
  });

  it.each(['*', '', 'javascript:alert(1)', 'https://ejemplo.cl/ruta', 'https://usuario:clave@ejemplo.cl'])
    ('rechaza un origen invalido %j', (FRONTEND_ORIGINS) => {
      expect(() => validateEnvironment({ ...valid, FRONTEND_ORIGINS })).toThrow('FRONTEND_ORIGINS');
    });

  it.each(['0', '65536', 'abc', '5434.5', ''])('rechaza el puerto invalido %j', (DB_PORT) => {
    expect(() => validateEnvironment({ ...valid, DB_PORT })).toThrow('DB_PORT');
  });
});
