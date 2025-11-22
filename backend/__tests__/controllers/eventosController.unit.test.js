import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Evento from '../../src/models/Evento.js';
import { getEventos, crearEvento, actualizarEvento, eliminarEvento } from '../../src/controllers/eventos.controller.js';

describe('Eventos Controller - Pruebas Unitarias de Lógica', () => {
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

    // Helper para crear mock de req y res
    const mockResponse = () => {
        const res = {};
        res.status = (code) => {
            res.statusCode = code;
            return res;
        };
        res.json = (data) => {
            res.body = data;
            return res;
        };
        return res;
    };

    describe('1. GET /eventos - getEventos', () => {
        test('Debería retornar array vacío si no hay eventos', async () => {
            const req = {};
            const res = mockResponse();

            await getEventos(req, res);

            // QUÉ SE PRUEBA: Respuesta cuando no hay eventos
            // RESULTADO ESPERADO: Status 200 con array vacío
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Eventos obtenidos');
            expect(res.body.data).toEqual([]);
        });

        test('Debería retornar todos los eventos ordenados por fecha y hora', async () => {

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

            const req = {};
            const res = mockResponse();

            await getEventos(req, res);

            // QUÉ SE PRUEBA: Obtención y ordenamiento de eventos
            // RESULTADO ESPERADO: Status 200 con 3 eventos ordenados cronológicamente
            expect(res.statusCode).toBe(200);
            expect(res.body.data.length).toBe(3);
            expect(res.body.data[0].detalle).toBe('Evento 1');
            expect(res.body.data[1].detalle).toBe('Evento 2');
            expect(res.body.data[2].detalle).toBe('Evento 3');
        });

        test('Debería retornar status 200 y estructura correcta de respuesta', async () => {
            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {};
            const res = mockResponse();

            await getEventos(req, res);

            // QUÉ SE PRUEBA: Estructura de respuesta correcta
            // RESULTADO ESPERADO: Objeto con message y data
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('2. POST /eventos - crearEvento', () => {
        test('Debería crear evento con datos válidos', async () => {
            const req = {
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Creación exitosa de evento
            // RESULTADO ESPERADO: Status 201 con evento creado
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Evento creado');
            expect(res.body.data).toBeDefined();
            expect(res.body.data.detalle).toBe('Reunión de equipo');
            expect(res.body.data.hora).toBe('14:30');

            const eventos = await Evento.find();
            expect(eventos.length).toBe(1);
        });

        test('Debería retornar status 201 con el evento creado', async () => {
            const empleadoId = new mongoose.Types.ObjectId();

            const req = {
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30',
                    detalle: 'Reunión de equipo',
                    creadoPor: empleadoId
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Respuesta con status 201
            // RESULTADO ESPERADO: Status 201 y datos del evento
            expect(res.statusCode).toBe(201);
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.creadoPor).toBeDefined();
        });

        test('Debería fallar (400) si falta el campo fecha', async () => {
            const req = {
                body: {
                    hora: '14:30',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Validación de campo requerido 'fecha'
            // RESULTADO ESPERADO: Status 400 con mensaje de error
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Faltan datos requeridos');
        });

        test('Debería fallar (400) si falta el campo hora', async () => {
            const req = {
                body: {
                    fecha: '2025-11-21',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Validación de campo requerido 'hora'
            // RESULTADO ESPERADO: Status 400 con mensaje de error
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Faltan datos requeridos');
        });

        test('Debería fallar (400) si falta el campo detalle', async () => {
            const req = {
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30'
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Validación de campo requerido 'detalle'
            // RESULTADO ESPERADO: Status 400 con mensaje de error
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Faltan datos requeridos');
        });
    });

    describe('3. PUT /eventos/:id - actualizarEvento', () => {
        test('Debería actualizar evento existente con datos válidos', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {
                params: { id: evento._id.toString() },
                body: {
                    fecha: '2025-11-22',
                    hora: '15:00',
                    detalle: 'Reunión de equipo actualizada'
                }
            };
            const res = mockResponse();

            await actualizarEvento(req, res);

            // QUÉ SE PRUEBA: Actualización exitosa de evento
            // RESULTADO ESPERADO: Status 200 con evento actualizado
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Evento actualizado');
            expect(res.body.data.detalle).toBe('Reunión de equipo actualizada');
            expect(res.body.data.hora).toBe('15:00');

            // Verificar en BD
            const eventoActualizado = await Evento.findById(evento._id);
            expect(eventoActualizado.detalle).toBe('Reunión de equipo actualizada');
        });

        test('Debería retornar status 200 con evento actualizado', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {
                params: { id: evento._id.toString() },
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30',
                    detalle: 'Reunión modificada'
                }
            };
            const res = mockResponse();

            await actualizarEvento(req, res);

            // QUÉ SE PRUEBA: Respuesta con status 200
            // RESULTADO ESPERADO: Status 200 y datos actualizados
            expect(res.statusCode).toBe(200);
            expect(res.body.data._id).toBeDefined();
        });

        test('Debería retornar 404 si el evento no existe', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            const req = {
                params: { id: idInexistente.toString() },
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await actualizarEvento(req, res);

            // QUÉ SE PRUEBA: Manejo de evento no encontrado
            // RESULTADO ESPERADO: Status 404 con mensaje apropiado
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Evento no encontrado');
        });

        test('Debería fallar (400) si faltan datos requeridos', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {
                params: { id: evento._id.toString() },
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30'
                }
            };
            const res = mockResponse();

            await actualizarEvento(req, res);

            // QUÉ SE PRUEBA: Validación de datos requeridos en actualización
            // RESULTADO ESPERADO: Status 400 con mensaje de error
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Faltan datos requeridos');
        });

        test('Debería permitir actualizar solo algunos campos', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {
                params: { id: evento._id.toString() },
                body: {
                    fecha: '2025-11-21',
                    hora: '16:00',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await actualizarEvento(req, res);

            // QUÉ SE PRUEBA: Actualización parcial de campos
            // RESULTADO ESPERADO: Solo hora actualizada
            expect(res.body.data.hora).toBe('16:00');
            expect(res.body.data.detalle).toBe('Reunión de equipo');
        });
    });

    describe('4. DELETE /eventos/:id - eliminarEvento', () => {
        test('Debería eliminar evento existente', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {
                params: { id: evento._id.toString() }
            };
            const res = mockResponse();

            await eliminarEvento(req, res);

            // QUÉ SE PRUEBA: Eliminación exitosa de evento
            // RESULTADO ESPERADO: Status 200 con evento eliminado
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Evento eliminado');
            expect(res.body.data._id).toBeDefined();

            // Verificar que se eliminó de BD
            const eventoEliminado = await Evento.findById(evento._id);
            expect(eventoEliminado).toBeNull();
        });

        test('Debería retornar status 200 con evento eliminado', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            const req = {
                params: { id: evento._id.toString() }
            };
            const res = mockResponse();

            await eliminarEvento(req, res);

            // QUÉ SE PRUEBA: Respuesta con status 200
            // RESULTADO ESPERADO: Status 200 y datos del evento eliminado
            expect(res.statusCode).toBe(200);
            expect(res.body.data.detalle).toBe('Reunión de equipo');
        });

        test('Debería retornar 404 si el evento no existe', async () => {
            const idInexistente = new mongoose.Types.ObjectId();

            const req = {
                params: { id: idInexistente.toString() }
            };
            const res = mockResponse();

            await eliminarEvento(req, res);

            // QUÉ SE PRUEBA: Manejo de evento no encontrado
            // RESULTADO ESPERADO: Status 404 con mensaje apropiado
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Evento no encontrado');
        });
    });

    describe('5. Validación de formato de fecha', () => {
        test('Debería aceptar fecha en formato ISO (YYYY-MM-DD)', async () => {
            const req = {
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Aceptación de formato ISO
            // RESULTADO ESPERADO: Evento creado con fecha correcta
            expect(res.statusCode).toBe(201);
            expect(res.body.data.fecha).toBeDefined();
        });

        test('Debería convertir correctamente string de fecha a Date', async () => {
            const req = {
                body: {
                    fecha: '2025-11-21',
                    hora: '14:30',
                    detalle: 'Reunión de equipo'
                }
            };
            const res = mockResponse();

            await crearEvento(req, res);

            // QUÉ SE PRUEBA: Conversión de string a Date
            // RESULTADO ESPERADO: Fecha almacenada como Date en BD
            const eventos = await Evento.find();
            expect(eventos[0].fecha).toBeInstanceOf(Date);
        });
    });
});
