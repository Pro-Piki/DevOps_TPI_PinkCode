import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Evento from '../../src/models/Evento.js';

describe('Flujo de Eventos - Pruebas de Integración', () => {
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

    describe('1. Crear Evento', () => {
        test('Debería crear evento con datos completos', async () => {
            // QUÉ SE PRUEBA: Creación de evento con todos los datos
            const empleadoId = new mongoose.Types.ObjectId();

            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo - Planificación Q4',
                creadoPor: empleadoId
            });

            // RESULTADO ESPERADO: Evento guardado con todos los datos
            expect(evento._id).toBeDefined();
            expect(evento.fecha).toBeInstanceOf(Date);
            expect(evento.hora).toBe('14:30');
            expect(evento.detalle).toBe('Reunión de equipo - Planificación Q4');
            expect(evento.creadoPor).toEqual(empleadoId);
            expect(evento.createdAt).toBeDefined();
            expect(evento.updatedAt).toBeDefined();
        });

        test('Debería crear evento sin campo opcional creadoPor', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-22'),
                hora: '10:00',
                detalle: 'Capacitación de seguridad'
            });

            // QUÉ SE PRUEBA: Creación sin campo opcional
            // RESULTADO ESPERADO: Evento creado sin creadoPor
            expect(evento._id).toBeDefined();
            expect(evento.creadoPor).toBeUndefined();
            expect(evento.detalle).toBe('Capacitación de seguridad');
        });

        test('Debería fallar si faltan campos requeridos', async () => {
            const eventoSinFecha = new Evento({
                hora: '14:30',
                detalle: 'Evento sin fecha'
            });

            try {
                await eventoSinFecha.save();
                throw new Error('Debería haber fallado');
            } catch (error) {
                // QUÉ SE PRUEBA: Validación de campos requeridos
                // RESULTADO ESPERADO: Error de validación
                expect(error.message).toContain('fecha');
            }
        });
    });

    describe('2. Listar Eventos', () => {
        beforeEach(async () => {
            // Crear 3 eventos de prueba
            await Evento.create({
                fecha: new Date('2025-11-23'),
                hora: '10:00',
                detalle: 'Evento 3 - Último'
            });

            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Evento 1 - Primero'
            });

            await Evento.create({
                fecha: new Date('2025-11-22'),
                hora: '09:00',
                detalle: 'Evento 2 - Medio'
            });
        });

        test('Debería listar todos los eventos ordenados por fecha', async () => {
            // QUÉ SE PRUEBA: Listado de eventos ordenado
            const eventos = await Evento.find().sort({ fecha: 1, hora: 1 });

            // RESULTADO ESPERADO: 3 eventos en orden cronológico
            expect(eventos.length).toBe(3);
            expect(eventos[0].detalle).toBe('Evento 1 - Primero');
            expect(eventos[1].detalle).toBe('Evento 2 - Medio');
            expect(eventos[2].detalle).toBe('Evento 3 - Último');
        });

        test('Debería filtrar eventos por fecha específica', async () => {
            // QUÉ SE PRUEBA: Filtrado por fecha
            const eventosFecha = await Evento.find({
                fecha: new Date('2025-11-22')
            });

            // RESULTADO ESPERADO: 1 evento en esa fecha
            expect(eventosFecha.length).toBe(1);
            expect(eventosFecha[0].detalle).toBe('Evento 2 - Medio');
        });

        test('Debería filtrar eventos por rango de fechas', async () => {
            // QUÉ SE PRUEBA: Filtrado por rango
            const eventosFiltrados = await Evento.find({
                fecha: {
                    $gte: new Date('2025-11-21'),
                    $lte: new Date('2025-11-22')
                }
            }).sort({ fecha: 1 });

            // RESULTADO ESPERADO: 2 eventos en el rango
            expect(eventosFiltrados.length).toBe(2);
            expect(eventosFiltrados[0].detalle).toBe('Evento 1 - Primero');
            expect(eventosFiltrados[1].detalle).toBe('Evento 2 - Medio');
        });

        test('Debería contar total de eventos', async () => {
            const total = await Evento.countDocuments();

            // QUÉ SE PRUEBA: Conteo de documentos
            // RESULTADO ESPERADO: Total de 3 eventos
            expect(total).toBe(3);
        });
    });

    describe('3. Obtener Evento por ID', () => {
        test('Debería obtener evento por ID', async () => {
            const eventoCreado = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });

            // QUÉ SE PRUEBA: Obtención de evento por ID
            const evento = await Evento.findById(eventoCreado._id);

            // RESULTADO ESPERADO: Evento encontrado con datos correctos
            expect(evento).toBeDefined();
            expect(evento.detalle).toBe('Reunión de equipo');
            expect(evento._id).toEqual(eventoCreado._id);
        });

        test('Debería retornar null si evento no existe', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            // QUÉ SE PRUEBA: Búsqueda de evento inexistente
            const evento = await Evento.findById(fakeId);

            // RESULTADO ESPERADO: null
            expect(evento).toBeNull();
        });
    });

    describe('4. Actualizar Evento', () => {
        let eventoId;

        beforeEach(async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Reunión de equipo'
            });
            eventoId = evento._id;
        });

        test('Debería actualizar fecha y hora del evento', async () => {
            const evento = await Evento.findById(eventoId);
            evento.fecha = new Date('2025-11-22');
            evento.hora = '15:00';
            await evento.save();

            // QUÉ SE PRUEBA: Actualización de fecha y hora
            const eventoActualizado = await Evento.findById(eventoId);

            // RESULTADO ESPERADO: Datos actualizados
            expect(eventoActualizado.hora).toBe('15:00');
            expect(eventoActualizado.fecha.toISOString().split('T')[0]).toBe('2025-11-22');
        });

        test('Debería actualizar detalle del evento', async () => {
            const evento = await Evento.findById(eventoId);
            evento.detalle = 'Reunión de equipo - Actualizada';
            await evento.save();

            // QUÉ SE PRUEBA: Actualización de detalle
            const eventoActualizado = await Evento.findById(eventoId);

            // RESULTADO ESPERADO: Detalle actualizado
            expect(eventoActualizado.detalle).toBe('Reunión de equipo - Actualizada');
        });

        test('Debería actualizar updatedAt al modificar', async () => {
            const evento = await Evento.findById(eventoId);
            const updatedAtOriginal = evento.updatedAt;

            await new Promise(resolve => setTimeout(resolve, 100));

            evento.detalle = 'Modificado';
            await evento.save();

            const eventoActualizado = await Evento.findById(eventoId);

            // QUÉ SE PRUEBA: Actualización de timestamp
            // RESULTADO ESPERADO: updatedAt mayor que el original
            expect(eventoActualizado.updatedAt.getTime()).toBeGreaterThan(updatedAtOriginal.getTime());
        });

        test('Debería actualizar usando findByIdAndUpdate', async () => {
            const eventoActualizado = await Evento.findByIdAndUpdate(
                eventoId,
                {
                    fecha: new Date('2025-11-23'),
                    hora: '16:00',
                    detalle: 'Evento actualizado con findByIdAndUpdate'
                },
                { new: true }
            );

            // QUÉ SE PRUEBA: Actualización con findByIdAndUpdate
            // RESULTADO ESPERADO: Evento actualizado correctamente
            expect(eventoActualizado.hora).toBe('16:00');
            expect(eventoActualizado.detalle).toBe('Evento actualizado con findByIdAndUpdate');
        });
    });

    describe('5. Eliminar Evento', () => {
        test('Debería eliminar evento de la base de datos', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Evento a eliminar'
            });

            const eventoId = evento._id;

            await Evento.findByIdAndDelete(eventoId);

            // QUÉ SE PRUEBA: Eliminación de evento
            const eventoEliminado = await Evento.findById(eventoId);

            // RESULTADO ESPERADO: evento no encontrado
            expect(eventoEliminado).toBeNull();
        });

        test('Debería mantener integridad de otros eventos después de eliminar', async () => {
            const evento1 = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '10:00',
                detalle: 'Evento 1'
            });

            const evento2 = await Evento.create({
                fecha: new Date('2025-11-22'),
                hora: '11:00',
                detalle: 'Evento 2'
            });

            await Evento.findByIdAndDelete(evento1._id);

            // QUÉ SE PRUEBA: Integridad de datos después de eliminación
            const eventoRestante = await Evento.findById(evento2._id);

            // RESULTADO ESPERADO: evento2 intacto
            expect(eventoRestante).toBeDefined();
            expect(eventoRestante.detalle).toBe('Evento 2');
        });
    });

    describe('6. Búsquedas y Filtros Avanzados', () => {
        beforeEach(async () => {
            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '09:00',
                detalle: 'Reunión matutina'
            });

            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:00',
                detalle: 'Reunión vespertina'
            });

            await Evento.create({
                fecha: new Date('2025-11-22'),
                hora: '10:00',
                detalle: 'Capacitación técnica'
            });

            await Evento.create({
                fecha: new Date('2025-11-23'),
                hora: '15:00',
                detalle: 'Reunión de cierre'
            });
        });

        test('Debería buscar eventos por texto en detalle', async () => {
            const eventosReunion = await Evento.find({
                detalle: { $regex: 'Reunión', $options: 'i' }
            });

            // QUÉ SE PRUEBA: Búsqueda por texto
            // RESULTADO ESPERADO: 3 eventos con "Reunión"
            expect(eventosReunion.length).toBe(3);
            expect(eventosReunion.every(e => e.detalle.includes('Reunión'))).toBe(true);
        });

        test('Debería filtrar eventos de una fecha específica', async () => {
            const eventosDia = await Evento.find({
                fecha: new Date('2025-11-21')
            }).sort({ hora: 1 });

            // QUÉ SE PRUEBA: Filtrado por fecha exacta
            // RESULTADO ESPERADO: 2 eventos del mismo día
            expect(eventosDia.length).toBe(2);
            expect(eventosDia[0].hora).toBe('09:00');
            expect(eventosDia[1].hora).toBe('14:00');
        });

        test('Debería obtener eventos futuros desde una fecha', async () => {
            const eventosFuturos = await Evento.find({
                fecha: { $gte: new Date('2025-11-22') }
            }).sort({ fecha: 1 });

            // QUÉ SE PRUEBA: Filtrado de eventos futuros
            // RESULTADO ESPERADO: 2 eventos desde el 22 en adelante
            expect(eventosFuturos.length).toBe(2);
            expect(eventosFuturos[0].detalle).toBe('Capacitación técnica');
            expect(eventosFuturos[1].detalle).toBe('Reunión de cierre');
        });
    });

    describe('7. Flujo Completo: CRUD Evento', () => {
        test('Debería crear, actualizar, listar y eliminar evento', async () => {
            // 1. CREAR
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Evento de prueba'
            });

            expect(evento._id).toBeDefined();
            expect(evento.detalle).toBe('Evento de prueba');

            // 2. ACTUALIZAR
            evento.detalle = 'Evento de prueba - Modificado';
            evento.hora = '15:00';
            await evento.save();

            let eventoActualizado = await Evento.findById(evento._id);
            expect(eventoActualizado.detalle).toBe('Evento de prueba - Modificado');
            expect(eventoActualizado.hora).toBe('15:00');

            // 3. LISTAR (verificar que existe)
            const eventos = await Evento.find({ detalle: /prueba/i });
            expect(eventos.length).toBeGreaterThan(0);

            // 4. ELIMINAR
            await Evento.findByIdAndDelete(evento._id);

            const eventoEliminado = await Evento.findById(evento._id);
            expect(eventoEliminado).toBeNull();
        });
    });

    describe('8. Ordenamiento de Eventos', () => {
        beforeEach(async () => {
            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '15:00',
                detalle: 'Evento C'
            });

            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '09:00',
                detalle: 'Evento A'
            });

            await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '12:00',
                detalle: 'Evento B'
            });
        });

        test('Debería ordenar eventos por hora ascendente', async () => {
            const eventos = await Evento.find().sort({ hora: 1 });

            // QUÉ SE PRUEBA: Ordenamiento por hora
            // RESULTADO ESPERADO: Eventos ordenados por hora
            expect(eventos[0].hora).toBe('09:00');
            expect(eventos[1].hora).toBe('12:00');
            expect(eventos[2].hora).toBe('15:00');
        });

        test('Debería ordenar eventos por fecha y hora', async () => {
            await Evento.create({
                fecha: new Date('2025-11-20'),
                hora: '16:00',
                detalle: 'Evento anterior'
            });

            const eventos = await Evento.find().sort({ fecha: 1, hora: 1 });

            // QUÉ SE PRUEBA: Ordenamiento combinado
            // RESULTADO ESPERADO: Primero por fecha, luego por hora
            expect(eventos[0].detalle).toBe('Evento anterior');
            expect(eventos[1].detalle).toBe('Evento A');
        });
    });

    describe('9. Validación de Datos', () => {
        test('Debería aceptar diferentes formatos de hora', async () => {
            const evento1 = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '09:00',
                detalle: 'Evento mañana'
            });

            const evento2 = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Evento tarde'
            });

            // QUÉ SE PRUEBA: Flexibilidad en formato de hora
            // RESULTADO ESPERADO: Ambos formatos aceptados
            expect(evento1.hora).toBe('09:00');
            expect(evento2.hora).toBe('14:30');
        });

        test('Debería almacenar fecha como Date object', async () => {
            const evento = await Evento.create({
                fecha: new Date('2025-11-21'),
                hora: '14:30',
                detalle: 'Evento de prueba'
            });

            // QUÉ SE PRUEBA: Tipo de dato de fecha
            // RESULTADO ESPERADO: fecha es instancia de Date
            expect(evento.fecha).toBeInstanceOf(Date);
        });
    });
});
