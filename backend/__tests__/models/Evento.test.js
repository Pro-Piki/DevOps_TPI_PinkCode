import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Evento from '../../src/models/Evento.js';

describe('Evento Model - Pruebas Unitarias', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Evento.deleteMany({});
  });

  describe('1. Validación de campos requeridos', () => {
    test('Debería fallar si no se proporciona fecha', async () => {
      const evento = new Evento({
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      try {
        await evento.save();
        throw new Error('Debería haber lanzado error');
      } catch (error) {
        // QUÉ SE PRUEBA: Validación de campo requerido 'fecha'
        // RESULTADO ESPERADO: Error indicando que falta 'fecha'
        expect(error.message).toContain('fecha');
      }
    });

    test('Debería fallar si no se proporciona hora', async () => {
      const evento = new Evento({
        fecha: new Date('2025-11-21'),
        detalle: 'Reunión de equipo'
      });

      try {
        await evento.save();
        throw new Error('Debería haber lanzado error');
      } catch (error) {
        // QUÉ SE PRUEBA: Validación de campo requerido 'hora'
        // RESULTADO ESPERADO: Error indicando que falta 'hora'
        expect(error.message).toContain('hora');
      }
    });

    test('Debería fallar si no se proporciona detalle', async () => {
      const evento = new Evento({
        fecha: new Date('2025-11-21'),
        hora: '14:30'
      });

      try {
        await evento.save();
        throw new Error('Debería haber lanzado error');
      } catch (error) {
        // QUÉ SE PRUEBA: Validación de campo requerido 'detalle'
        // RESULTADO ESPERADO: Error indicando que falta 'detalle'
        expect(error.message).toContain('detalle');
      }
    });

    test('Debería permitir crear evento con campos mínimos requeridos', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      // QUÉ SE PRUEBA: Creación con campos mínimos requeridos
      // RESULTADO ESPERADO: Evento creado sin errores
      expect(evento._id).toBeDefined();
      expect(evento.fecha).toBeInstanceOf(Date);
      expect(evento.hora).toBe('14:30');
      expect(evento.detalle).toBe('Reunión de equipo');
    });
  });

  describe('2. Validación de tipos de datos', () => {
    test('fecha debe ser tipo Date', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      // QUÉ SE PRUEBA: Tipo de dato de 'fecha'
      // RESULTADO ESPERADO: fecha es instancia de Date
      expect(evento.fecha).toBeInstanceOf(Date);
    });

    test('hora debe ser tipo String', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      // QUÉ SE PRUEBA: Tipo de dato de 'hora'
      // RESULTADO ESPERADO: hora es string
      expect(typeof evento.hora).toBe('string');
    });

    test('detalle debe ser tipo String', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      // QUÉ SE PRUEBA: Tipo de dato de 'detalle'
      // RESULTADO ESPERADO: detalle es string
      expect(typeof evento.detalle).toBe('string');
    });
  });

  describe('3. Campo opcional creadoPor', () => {
    test('Debería permitir crear evento sin creadoPor', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      // QUÉ SE PRUEBA: Campo opcional 'creadoPor'
      // RESULTADO ESPERADO: creadoPor es undefined
      expect(evento.creadoPor).toBeUndefined();
    });

    test('Debería permitir referenciar un Empleado válido en creadoPor', async () => {
      const empleadoId = new mongoose.Types.ObjectId();

      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo',
        creadoPor: empleadoId
      });

      // QUÉ SE PRUEBA: Referencia a Empleado en 'creadoPor'
      // RESULTADO ESPERADO: creadoPor contiene el ObjectId del empleado
      expect(evento.creadoPor).toEqual(empleadoId);
    });
  });

  describe('4. Timestamps automáticos', () => {
    test('Debería crear createdAt y updatedAt automáticamente', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      // QUÉ SE PRUEBA: Timestamps automáticos (createdAt, updatedAt)
      // RESULTADO ESPERADO: Ambos campos definidos
      expect(evento.createdAt).toBeDefined();
      expect(evento.updatedAt).toBeDefined();
      expect(evento.createdAt).toBeInstanceOf(Date);
      expect(evento.updatedAt).toBeInstanceOf(Date);
    });

    test('Debería actualizar updatedAt al modificar documento', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      const updatedAtOriginal = evento.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      evento.detalle = 'Reunión de equipo actualizada';
      await evento.save();

      // QUÉ SE PRUEBA: updatedAt se actualiza al guardar cambios
      // RESULTADO ESPERADO: updatedAt > updatedAtOriginal
      expect(evento.updatedAt.getTime()).toBeGreaterThan(updatedAtOriginal.getTime());
    });
  });

  describe('5. Operaciones CRUD del modelo', () => {
    test('Debería recuperar evento por ID', async () => {
      const eventoCreado = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      const eventoRecuperado = await Evento.findById(eventoCreado._id);

      // QUÉ SE PRUEBA: Recuperación de evento desde BD
      // RESULTADO ESPERADO: Evento encontrado con mismos datos
      expect(eventoRecuperado.detalle).toBe('Reunión de equipo');
      expect(eventoRecuperado.hora).toBe('14:30');
      expect(eventoRecuperado._id).toEqual(eventoCreado._id);
    });

    test('Debería actualizar evento correctamente', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      evento.detalle = 'Reunión de equipo modificada';
      evento.hora = '15:00';
      await evento.save();

      const eventoActualizado = await Evento.findById(evento._id);

      // QUÉ SE PRUEBA: Actualización de evento
      // RESULTADO ESPERADO: Datos actualizados correctamente
      expect(eventoActualizado.detalle).toBe('Reunión de equipo modificada');
      expect(eventoActualizado.hora).toBe('15:00');
    });

    test('Debería eliminar evento correctamente', async () => {
      const evento = await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      const eventoId = evento._id;

      await Evento.findByIdAndDelete(eventoId);

      const eventoEliminado = await Evento.findById(eventoId);

      // QUÉ SE PRUEBA: Eliminación de evento
      // RESULTADO ESPERADO: Evento no encontrado
      expect(eventoEliminado).toBeNull();
    });

    test('Debería listar todos los eventos', async () => {
      await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Reunión de equipo'
      });

      await Evento.create({
        fecha: new Date('2025-11-22'),
        hora: '10:00',
        detalle: 'Capacitación'
      });

      const eventos = await Evento.find();

      // QUÉ SE PRUEBA: Listado de todos los eventos
      // RESULTADO ESPERADO: 2 eventos en la BD
      expect(eventos.length).toBe(2);
    });
  });

  describe('6. Ordenamiento por fecha y hora', () => {
    beforeEach(async () => {
      await Evento.create({
        fecha: new Date('2025-11-23'),
        hora: '10:00',
        detalle: 'Evento 3'
      });

      await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '14:30',
        detalle: 'Evento 1'
      });

      await Evento.create({
        fecha: new Date('2025-11-22'),
        hora: '09:00',
        detalle: 'Evento 2'
      });
    });

    test('Debería ordenar eventos por fecha ascendente', async () => {
      const eventos = await Evento.find().sort({ fecha: 1 });

      // QUÉ SE PRUEBA: Ordenamiento por fecha
      // RESULTADO ESPERADO: Eventos ordenados cronológicamente
      expect(eventos.length).toBe(3);
      expect(eventos[0].detalle).toBe('Evento 1');
      expect(eventos[1].detalle).toBe('Evento 2');
      expect(eventos[2].detalle).toBe('Evento 3');
    });

    test('Debería ordenar eventos por fecha y hora combinados', async () => {
      // Agregar eventos en la misma fecha pero diferente hora
      await Evento.deleteMany({});

      await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '15:00',
        detalle: 'Evento tarde'
      });

      await Evento.create({
        fecha: new Date('2025-11-21'),
        hora: '09:00',
        detalle: 'Evento mañana'
      });

      const eventos = await Evento.find().sort({ fecha: 1, hora: 1 });

      // QUÉ SE PRUEBA: Ordenamiento por fecha y hora
      // RESULTADO ESPERADO: Eventos ordenados por fecha y luego por hora
      expect(eventos.length).toBe(2);
      expect(eventos[0].detalle).toBe('Evento mañana');
      expect(eventos[0].hora).toBe('09:00');
      expect(eventos[1].detalle).toBe('Evento tarde');
      expect(eventos[1].hora).toBe('15:00');
    });
  });
});
