import Nomina from "../models/Nomina.js";
import CalculoDetalle from "../models/CalculoDetalle.js";
import Empleado from "../models/Empleado.js";
import Fichaje from "../models/Fichaje.js";
import Licencia from "../models/Licencia.js";
import { Notificacion } from "../models/Notificacion.js";

// Función para obtener días del mes
const obtenerDiasDelMes = (año, mes) => {
  return new Date(año, mes, 0).getDate();
};

// Función para calcular días trabajados (considerando licencias)
const calcularDiasTrabajados = async (empleadoId, periodo) => {
  const [año, mesStr] = periodo.split("-");
  const mes = parseInt(mesStr) - 1; // JS usa 0-11
  const diasDelMes = obtenerDiasDelMes(año, mes + 1);

  // Obtener licencias aprobadas en ese período
  const fechaInicio = new Date(año, mes, 1);
  const fechaFin = new Date(año, mes, diasDelMes);

  const licenciasAprobadas = await Licencia.countDocuments({
    empleadoId,
    estado: "aprobado",
    fechaInicio: { $lte: fechaFin },
    fechaFin: { $gte: fechaInicio },
  });

  // Días trabajados = días del mes - licencias
  const diasTrabajados = Math.max(1, diasDelMes - licenciasAprobadas);
  const diasAusencia = licenciasAprobadas;

  return { diasTrabajados, diasAusencia, diasDelMes };
};

// Función para calcular horas trabajadas
const calcularHorasTrabajadas = async (empleadoId, periodo) => {
  const [año, mesStr] = periodo.split("-");
  const mes = parseInt(mesStr);

  // Obtener todos los fichajes del mes
  const fichajes = await Fichaje.find({
    empleadoId,
    fecha: {
      $gte: new Date(año, mes - 1, 1),
      $lt: new Date(año, mes, 1),
    },
  });

  let totalHoras = 0;
  let horasExtras = 0;

  // Asumir 8 horas por día trabajado
  totalHoras = fichajes.length * 8;

  // Verificar horas extras (más de 8 horas por día)
  fichajes.forEach((fichaje) => {
    if (fichaje.horasTrabajadas && fichaje.horasTrabajadas > 8) {
      horasExtras += fichaje.horasTrabajadas - 8;
    }
  });

  return { totalHoras, horasExtras };
};

// Función para calcular componentes de nómina
const calcularComponentes = async (empleado, diasTrabajados, horasExtras) => {
  const sueldoBasico = empleado.sueldoBruto || empleado.sueldoBasico || 0;
  const diasDelMes = 22; // Promedio de días laborales

  // Validar que sueldoBasico sea un número válido
  if (!sueldoBasico || isNaN(sueldoBasico) || sueldoBasico <= 0) {
    throw new Error(`Sueldo básico inválido: ${sueldoBasico}. Empleado debe tener sueldoBruto definido.`);
  }

  // Haberes
  const haberes = {
    sueldoBasico: sueldoBasico || 0,
    antiguedad: Math.round((sueldoBasico * 0.25) * (diasTrabajados / diasDelMes)) || 0, // 25% de antigüedad prorrateo
    presentismo: diasTrabajados === diasDelMes ? Math.round(sueldoBasico * 0.1) : 0, // 10% si trabajó todo
    horasExtras: Math.round(horasExtras * (sueldoBasico / 160)) || 0, // Basado en valor hora
    viaticos: Math.round(sueldoBasico * 0.05) || 0, // 5% fijo
    otrosHaberes: 0,
  };

  haberes.totalHaberes = Math.round(
    (haberes.sueldoBasico || 0) +
    (haberes.antiguedad || 0) +
    (haberes.presentismo || 0) +
    (haberes.horasExtras || 0) +
    (haberes.viaticos || 0) +
    (haberes.otrosHaberes || 0)
  );

  // Deducciones
  const deducciones = {
    jubilacion: Math.round(haberes.totalHaberes * 0.11) || 0, // 11%
    obraSocial: Math.round(haberes.totalHaberes * 0.03) || 0, // 3%
    ley19032: Math.round(haberes.totalHaberes * 0.015) || 0, // 1.5%
    sindicato: Math.round(haberes.totalHaberes * 0.02) || 0, // 2%
    otrosDes: 0,
  };

  deducciones.totalDeducciones = Math.round(
    (deducciones.jubilacion || 0) +
    (deducciones.obraSocial || 0) +
    (deducciones.ley19032 || 0) +
    (deducciones.sindicato || 0) +
    (deducciones.otrosDes || 0)
  );

  const totalNeto = Math.round((haberes.totalHaberes || 0) - (deducciones.totalDeducciones || 0));

  return { haberes, deducciones, totalNeto };
};

// Obtener todas las nóminas
export const obtenerNominas = async (req, res) => {
  try {
    const { empleadoId, estado, periodo } = req.query;

    const filtro = {};

    if (empleadoId) {
      filtro.empleadoId = empleadoId;
    }

    if (estado) {
      filtro.estado = estado;
    }

    if (periodo) {
      filtro.periodo = periodo;
    }

    const nominas = await Nomina.find(filtro)
      .populate("empleadoId", "nombre apellido numeroLegajo email")
      .populate("aprobadoPor", "nombre apellido numeroLegajo")
      .sort({ periodo: -1 });

    res.json({
      success: true,
      data: nominas,
      total: nominas.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener nóminas",
      error: error.message,
    });
  }
};

// Obtener una nómina por ID
export const obtenerNominaById = async (req, res) => {
  try {
    const { id } = req.params;

    const nomina = await Nomina.findById(id)
      .populate("empleadoId", "nombre apellido numeroLegajo email cuil puesto categoria")
      .populate("aprobadoPor", "nombre apellido numeroLegajo");

    if (!nomina) {
      return res.status(404).json({
        success: false,
        message: "Nómina no encontrada",
      });
    }

    // Obtener detalles del cálculo
    const detalles = await CalculoDetalle.find({ nominaId: id }).sort({
      orden: 1,
    });

    res.json({
      success: true,
      data: {
        nomina,
        detalles,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener nómina",
      error: error.message,
    });
  }
};

// Calcular nómina para un empleado
export const calcularNomina = async (req, res) => {
  try {
    const { empleadoId, periodo } = req.body;

    // Validar formato de período
    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      return res.status(400).json({
        success: false,
        message: "Período debe estar en formato YYYY-MM",
      });
    }

    // Verificar que el empleado existe
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: "Empleado no encontrado",
      });
    }

    // Verificar si ya existe nómina para ese período
    const nominaExistente = await Nomina.findOne({ empleadoId, periodo });

    // Calcular datos
    const { diasTrabajados, diasAusencia } = await calcularDiasTrabajados(
      empleadoId,
      periodo
    );
    const { totalHoras, horasExtras } = await calcularHorasTrabajadas(
      empleadoId,
      periodo
    );
    const { haberes, deducciones, totalNeto } = await calcularComponentes(
      empleado,
      diasTrabajados,
      horasExtras
    );

    // Si existe nómina, actualizar; si no, crear
    let nuevaNomina;
    if (nominaExistente && nominaExistente.estado !== "aprobado") {
      // Actualizar nómina existente (solo si no está aprobada)
      nominaExistente.estado = "calculado";
      nominaExistente.diasTrabajados = diasTrabajados;
      nominaExistente.diasAusencia = diasAusencia;
      nominaExistente.horasTrabajadas = totalHoras;
      nominaExistente.horasExtras = horasExtras;
      nominaExistente.haberes = haberes;
      nominaExistente.deducciones = deducciones;
      nominaExistente.totalNeto = totalNeto;
      nominaExistente.calculadoEn = new Date();

      nuevaNomina = await nominaExistente.save();
    } else if (nominaExistente && nominaExistente.estado === "aprobado") {
      // No permitir recalcular nóminas aprobadas
      return res.status(400).json({
        success: false,
        message: "No se puede recalcular una nómina ya aprobada",
      });
    } else {
      // Crear nueva nómina
      nuevaNomina = new Nomina({
        empleadoId,
        periodo,
        estado: "calculado",
        diasTrabajados,
        diasAusencia,
        horasTrabajadas: totalHoras,
        horasExtras,
        sueldoBasico: empleado.sueldoBruto || empleado.sueldoBasico || 0,
        haberes,
        deducciones,
        totalNeto,
        calculadoEn: new Date(),
      });

      await nuevaNomina.save();
    }

    // Crear detalles del cálculo (eliminar antiguos si existen)
    if (nominaExistente) {
      await CalculoDetalle.deleteMany({ nominaId: nuevaNomina._id });
    }

    const detalles = [];

    // Haberes
    detalles.push(
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "remunerativo",
        concepto: "Sueldo Básico",
        cantidad: 1,
        valorUnitario: haberes.sueldoBasico,
        totalConcepto: haberes.sueldoBasico,
        orden: 1,
      },
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "remunerativo",
        concepto: "Antigüedad",
        cantidad: 1,
        valorUnitario: haberes.antiguedad,
        totalConcepto: haberes.antiguedad,
        orden: 2,
      },
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "remunerativo",
        concepto: "Presentismo",
        cantidad: 1,
        valorUnitario: haberes.presentismo,
        totalConcepto: haberes.presentismo,
        orden: 3,
      },
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "remunerativo",
        concepto: "Horas Extras",
        cantidad: horasExtras,
        valorUnitario: Math.round((empleado.sueldoBruto || empleado.sueldoBasico || 0) / 160),
        totalConcepto: haberes.horasExtras,
        orden: 4,
      }
    );

    // No remunerativo
    detalles.push({
      nominaId: nuevaNomina._id,
      empleadoId,
      tipoConcepto: "no_remunerativo",
      concepto: "Viáticos",
      cantidad: 1,
      valorUnitario: haberes.viaticos,
      totalConcepto: haberes.viaticos,
      orden: 5,
    });

    // Deducciones
    detalles.push(
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "deduccion",
        concepto: "Jubilación (11%)",
        cantidad: 1,
        valorUnitario: deducciones.jubilacion,
        totalConcepto: deducciones.jubilacion,
        orden: 6,
      },
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "deduccion",
        concepto: "Obra Social (3%)",
        cantidad: 1,
        valorUnitario: deducciones.obraSocial,
        totalConcepto: deducciones.obraSocial,
        orden: 7,
      },
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "deduccion",
        concepto: "Ley 19032 (1.5%)",
        cantidad: 1,
        valorUnitario: deducciones.ley19032,
        totalConcepto: deducciones.ley19032,
        orden: 8,
      },
      {
        nominaId: nuevaNomina._id,
        empleadoId,
        tipoConcepto: "deduccion",
        concepto: "Sindicato (2%)",
        cantidad: 1,
        valorUnitario: deducciones.sindicato,
        totalConcepto: deducciones.sindicato,
        orden: 9,
      }
    );

    // Guardar detalles
    await CalculoDetalle.insertMany(detalles);

    // Poblar antes de responder
    await nuevaNomina.populate("empleadoId", "nombre apellido numeroLegajo");

    res.status(201).json({
      success: true,
      message: "Nómina calculada exitosamente",
      data: {
        nomina: nuevaNomina,
        detalles,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al calcular nómina",
      error: error.message,
    });
  }
};

// Calcular nóminas para múltiples empleados
export const calcularNominasMultiples = async (req, res) => {
  try {
    const { empleadoIds, periodo } = req.body;

    if (!Array.isArray(empleadoIds) || empleadoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "empleadoIds debe ser un array no vacío",
      });
    }

    if (!periodo || !/^\d{4}-\d{2}$/.test(periodo)) {
      return res.status(400).json({
        success: false,
        message: "Período debe estar en formato YYYY-MM",
      });
    }

    const resultados = [];
    const errores = [];

    for (const empleadoId of empleadoIds) {
      try {
        const empleado = await Empleado.findById(empleadoId);
        if (!empleado) {
          errores.push({
            empleadoId,
            error: "Empleado no encontrado",
          });
          continue;
        }

        // Verificar si ya existe
        const existente = await Nomina.findOne({ empleadoId, periodo });
        if (existente) {
          errores.push({
            empleadoId,
            error: "Ya existe nómina para este período",
          });
          continue;
        }

        // Calcular
        const { diasTrabajados, diasAusencia } = await calcularDiasTrabajados(
          empleadoId,
          periodo
        );
        const { totalHoras, horasExtras } = await calcularHorasTrabajadas(
          empleadoId,
          periodo
        );
        const { haberes, deducciones, totalNeto } = await calcularComponentes(
          empleado,
          diasTrabajados,
          horasExtras
        );

        // Crear nómina
        const nomina = new Nomina({
          empleadoId,
          periodo,
          estado: "calculado",
          diasTrabajados,
          diasAusencia,
          horasTrabajadas: totalHoras,
          horasExtras,
          sueldoBasico: empleado.sueldoBasico,
          haberes,
          deducciones,
          totalNeto,
          calculadoEn: new Date(),
        });

        await nomina.save();
        resultados.push({
          empleadoId,
          nominaId: nomina._id,
          totalNeto,
        });
      } catch (error) {
        errores.push({
          empleadoId,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${resultados.length} nóminas calculadas`,
      data: {
        calculadas: resultados,
        errores,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al calcular nóminas",
      error: error.message,
    });
  }
};

// Aprobar nómina
export const aprobarNomina = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobadoPor } = req.body;

    // Verificar que quien aprueba existe
    const usuario = await Empleado.findById(aprobadoPor);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario que aprueba no encontrado",
      });
    }

    const nomina = await Nomina.findById(id);
    if (!nomina) {
      return res.status(404).json({
        success: false,
        message: "Nómina no encontrada",
      });
    }

    if (nomina.estado === "aprobado") {
      return res.status(400).json({
        success: false,
        message: "Esta nómina ya fue aprobada",
      });
    }

    nomina.estado = "aprobado";
    nomina.aprobadoPor = aprobadoPor;
    nomina.fechaAprobacion = new Date();

    await nomina.save();

    // Crear notificación para el empleado
    const notificacionCreada = await Notificacion.create({
      empleadoId: nomina.empleadoId,
      tipo: "aprobacion",
      asunto: "Tu recibo de haberes está disponible",
      descripcion: `Tu nómina del período ${nomina.periodo} ha sido aprobada. Ya puedes descargar tu recibo de haberes desde la sección "Mis Documentos".`,
      leida: false,
    });

    await nomina.populate([
      { path: "empleadoId", select: "nombre apellido legajo" },
      { path: "aprobadoPor", select: "nombre apellido legajo" },
    ]);

    res.json({
      success: true,
      message: "Nómina aprobada",
      data: nomina,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al aprobar nómina",
      error: error.message,
    });
  }
};

// Obtener resumen de nóminas por período
export const obtenerResumenPeriodo = async (req, res) => {
  try {
    const { periodo } = req.params;

    const nominas = await Nomina.find({ periodo })
      .populate("empleadoId", "nombre apellido numeroLegajo");

    const resumen = {
      periodo,
      totalEmpleados: nominas.length,
      totalHaberes: 0,
      totalDeducciones: 0,
      totalNeto: 0,
      porEstado: {
        pendiente: 0,
        calculado: 0,
        aprobado: 0,
      },
      nominas,
    };

    nominas.forEach((nomina) => {
      resumen.totalHaberes += nomina.haberes.totalHaberes;
      resumen.totalDeducciones += nomina.deducciones.totalDeducciones;
      resumen.totalNeto += nomina.totalNeto;
      resumen.porEstado[nomina.estado]++;
    });

    res.json({
      success: true,
      data: resumen,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener resumen de período",
      error: error.message,
    });
  }
};
