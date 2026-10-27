import { config } from "./env.ts";

const errorContent = {
  "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Registro de consultas API",
    version: "1.0.0",
    description: [
      "API para autenticación y gestión del registro de consultas.",
      "La sesión se conserva en una cookie HttpOnly; el navegador debe enviar credenciales.",
      `La API sugiere renovar la sesión cada ${config.sessionRenewAfterMinutes} minuto(s).`,
    ].join(" "),
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  tags: [
    { name: "Sistema", description: "Estado del servicio" },
    { name: "Pacientes", description: "Consulta de pacientes y tipo de seguro" },
    { name: "Especialidades", description: "Consulta de especialidades médicas" },
    { name: "IPSS", description: "Consulta de afiliados y tipos de afiliado" },
    { name: "Autenticación", description: "Inicio, consulta, renovación y cierre de sesión" },
    { name: "Programaciones", description: "Consulta, creación y anulación de programaciones de consultas" },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: config.sessionCookie.name,
        description: "Cookie HttpOnly creada por POST /api/auth/login.",
      },
    },
    schemas: {
      AuthenticatedUser: {
        type: "object",
        required: ["userId", "username", "firstName", "lastName", "roleId", "role"],
        properties: {
          userId: { type: "integer" },
          username: { type: "string", example: "bgalan" },
          firstName: { type: "string", nullable: true, example: "Benjamin" },
          lastName: { type: "string", nullable: true, example: "Galan" },
          roleId: { type: "integer", nullable: true },
          role: {
            type: "string",
            nullable: true,
            enum: ["Administrador", "Admisionista", "Medico/a", "Enfermero/a", null],
          },
        },
      },
      UserResponse: {
        type: "object",
        required: ["user", "renewAfterMs"],
        properties: {
          user: { $ref: "#/components/schemas/AuthenticatedUser" },
          renewAfterMs: {
            type: "integer",
            description: "Tiempo sugerido antes de preguntar al usuario si desea renovar la sesión.",
            example: config.sessionRenewAfterMinutes * 60 * 1000,
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string", example: "La sesión no es válida o ha expirado." },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Sistema"],
        summary: "Comprobar que la API responde",
        responses: {
          "200": {
            description: "La API está disponible.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/api/pacientes": {
      get: {
        tags: ["Pacientes"],
        summary: "Listar y buscar pacientes",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "busqueda", in: "query", schema: { type: "string", maxLength: 100 } },
          { name: "tipoSeguroId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "pagina", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "tamanioPagina", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Pacientes encontrados con su tipo de seguro y metadatos de paginacion.",
            content: {
              "application/json": {
                schema: {
                  type: "object", properties: {
                    pacientes: { type: "array", items: { type: "object", additionalProperties: true } },
                    paginacion: { type: "object", additionalProperties: true },
                  }
                }
              }
            },
          },
          "400": { description: "Los filtros no son validos.", content: errorContent },
          "401": { description: "Se requiere una sesion valida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para consultar pacientes.", content: errorContent },
        },
      },
    },
    "/api/pacientes/expediente/{inss}": {
      get: {
        tags: ["Pacientes"],
        summary: "Obtener expedientes por número INSS",
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            name: "inss",
            in: "path",
            required: true,
            description: "Número INSS numérico entre 1 y 2147483647.",
            schema: { type: "integer", minimum: 1, maximum: 2147483647 },
          },
        ],
        responses: {
          "200": {
            description: "Expedientes activos asociados al número INSS.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    expedientes: { type: "array", items: { type: "object", additionalProperties: true } },
                  },
                },
              },
            },
          },
          "400": { description: "El número INSS no es válido.", content: errorContent },
          "401": { description: "Se requiere una sesión válida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para consultar pacientes.", content: errorContent },
          "404": { description: "No se encontró un expediente para ese número INSS.", content: errorContent },
        },
      },
    },
    "/api/especialidades": {
      get: {
        tags: ["Especialidades"],
        summary: "Listar especialidades",
        description: "Devuelve las especialidades para usarlas en un selector.",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "busqueda", in: "query", schema: { type: "string", maxLength: 100 } },
          { name: "pagina", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "tamanioPagina", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Especialidades encontradas y metadatos de paginación.",
            content: {
              "application/json": {
                schema: {
                  type: "object", properties: {
                    especialidades: {
                      type: "array", items: {
                        type: "object", properties: {
                          especialidadId: { type: "integer" },
                          codigoEspecialidad: { type: "string", nullable: true },
                          nombreEspecialidad: { type: "string" },
                          fechaCreacion: { type: "string", format: "date-time" },
                        }
                      }
                    },
                    paginacion: { type: "object", additionalProperties: true },
                  }
                }
              }
            },
          },
          "400": { description: "Los filtros no son validos.", content: errorContent },
          "401": { description: "Se requiere una sesion valida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para consultar especialidades.", content: errorContent },
        },
      },
    },
    "/api/medicos": {
      get: {
        tags: ["Medicos"],
        summary: "Listar medicos",
        description: "Devuelve los medicos para usarlos en un selector.",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "busqueda", in: "query", schema: { type: "string", maxLength: 100 } },
          { name: "pagina", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "tamanioPagina", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          "200": {
            description: "Medicos encontrados y metadatos de paginación.",
            content: {
              "application/json": {
                schema: {
                  type: "object", properties: {
                    medicos: {
                      type: "array", items: {
                        type: "object", properties: {
                          medicoId: { type: "integer" },
                          codigoMinsa: { type: "string", nullable: true },
                          cedula: { type: "string", nullable: true },
                          telefono: { type: "string", nullable: true },
                          disponibilidad: { type: "boolean", nullable: true },
                          nombre: { type: "string" },
                          apellido: { type: "string" },
                        }
                      }
                    },
                    paginacion: { type: "object", additionalProperties: true },
                  }
                }
              }
            },
          },
          "400": { description: "Los filtros no son validos.", content: errorContent },
          "401": { description: "Se requiere una sesion valida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para consultar medicos.", content: errorContent },
        },
      },
    },
    "/api/ipss/tipos-afiliados": {
      get: {
        tags: ["IPSS"],
        summary: "Obtener tipos de afiliado",
        description: "Devuelve los tipos de asegurado activos para usarlos en un selector.",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Lista de tipos de afiliado activos.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["tiposAfiliados"],
                  properties: {
                    tiposAfiliados: {
                      type: "array", items: {
                        type: "object", required: ["TipoAseguradoId", "CodigoTipo", "Descripcion"], properties: {
                          TipoAseguradoId: { type: "integer", example: 4 },
                          CodigoTipo: { type: "string", example: "ASG-AG" },
                          Descripcion: { type: "string", example: "Asegurado" },
                        }
                      }
                    },
                  },
                }
              }
            },
          },
          "401": { description: "Se requiere una sesión válida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para consultar tipos de afiliado.", content: errorContent },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión",
        description: "Valida las credenciales, establece la cookie HttpOnly y devuelve los datos públicos del usuario.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", maxLength: 50, example: "bgalan" },
                  password: { type: "string", format: "password", minLength: 1 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Inicio de sesión exitoso. El servidor envía Set-Cookie.",
            headers: {
              "Set-Cookie": {
                description: "Cookie HttpOnly; el cliente no debe intentar leerla desde JavaScript.",
                schema: { type: "string" },
              },
            },
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } },
          },
          "400": { description: "El cuerpo de la solicitud no es válido.", content: errorContent },
          "401": { description: "Credenciales incorrectas.", content: errorContent },
          "429": { description: "Se excedió el límite de intentos.", content: errorContent },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Autenticación"],
        summary: "Consultar la sesión actual",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Usuario autenticado.",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } },
          },
          "401": { description: "No hay una sesión válida.", content: errorContent },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Autenticación"],
        summary: "Rotar y renovar la sesión",
        description: "Llamar solo después de que el usuario confirme que desea continuar. Reemplaza la cookie anterior.",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Sesión renovada y cookie reemplazada.",
            headers: {
              "Set-Cookie": {
                description: "Nueva cookie HttpOnly para la sesión renovada.",
                schema: { type: "string" },
              },
            },
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } },
          },
          "401": { description: "La sesión expiró o no es válida.", content: errorContent },
          "429": { description: "Se excedió el límite de renovaciones.", content: errorContent },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Autenticación"],
        summary: "Cerrar sesión",
        security: [{ sessionCookie: [] }],
        responses: {
          "204": { description: "Sesión revocada y cookie eliminada." },
        },
      },
    },
    "/api/programaciones": {
      get: {
        tags: ["Programaciones"],
        summary: "Listar programaciones de consultas",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "fecha", in: "query", schema: { type: "string", format: "date" } },
          { name: "codigoMinsa", in: "query", schema: { type: "string", maxLength: 20 } },
          { name: "numeroConsultorio", in: "query", schema: { type: "string", maxLength: 20 } },
          { name: "pagina", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "tamanioPagina", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          "200": { description: "Programaciones y metadatos de paginación." },
          "400": { description: "Los filtros no son válidos.", content: errorContent },
          "401": { description: "Se requiere una sesión válida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para consultar programaciones.", content: errorContent },
        },
      },
      post: {
        tags: ["Programaciones"],
        summary: "Crear una programación de consultas",
        description: "El usuario creador se obtiene de la sesión autenticada. No se reciben IDs de médico o consultorio.",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fecha", "jornada", "limitePacientes", "codigoMinsaMedico", "numeroConsultorio"],
                properties: {
                  fecha: { type: "string", format: "date" },
                  jornada: { type: "string", enum: ["AM", "PM"] },
                  limitePacientes: { type: "integer", minimum: 1, maximum: 60 },
                  codigoMinsaMedico: { type: "string", maxLength: 20 },
                  numeroConsultorio: { type: "string", maxLength: 20 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Programación creada." },
          "400": { description: "Los datos no son válidos.", content: errorContent },
          "401": { description: "Se requiere una sesión válida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para crear programaciones.", content: errorContent },
          "404": { description: "No se encontró el médico o consultorio disponible.", content: errorContent },
          "409": { description: "El médico o el consultorio ya tiene programación en esa fecha y jornada.", content: errorContent },
        },
      },
    },
    "/api/programaciones/{codigoProgramacion}": {
      delete: {
        tags: ["Programaciones"],
        summary: "Anular una programación",
        description: "Realiza una anulación lógica; no se permite modificar una programación creada.",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "codigoProgramacion", in: "path", required: true, schema: { type: "string", format: "uuid" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["motivoAnulacion"],
                properties: { motivoAnulacion: { type: "string", minLength: 1, maxLength: 255 } },
              },
            },
          },
        },
        responses: {
          "204": { description: "Programación anulada." },
          "400": { description: "El código o motivo de anulación no es válido.", content: errorContent },
          "401": { description: "Se requiere una sesión válida.", content: errorContent },
          "403": { description: "El rol no tiene permiso para anular programaciones.", content: errorContent },
          "404": { description: "No se encontró la programación activa.", content: errorContent },
        },
      },
    },
  },
} as const;
