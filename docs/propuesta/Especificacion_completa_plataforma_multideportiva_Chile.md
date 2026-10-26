# 01 Plataforma multideportiva para Chile
Especificación funcional y técnica para revisión conjunta

Pantallas, botones, reglas de negocio y evolución hacia Android e iOS

Para Yerko y Jean Paul · Versión 2 · 24 de octubre de 2026

## La propuesta

Crear un sistema donde cualquier persona adulta pueda descubrir encuentros de actividad física o expresar qué quiere practicar, en qué zona y en qué horarios. La plataforma ayuda a encontrar o formar un grupo compatible, confirmar un encuentro y mantener la participación en el tiempo.

## La diferencia que intentaremos demostrar

Convertir intenciones dispersas en encuentros realizados. El mapa, las inscripciones y la coordinación son la base; el valor que queremos comprobar es ayudar a formar grupos cuando todavía no existe una actividad adecuada. No afirmamos exclusividad mundial ni éxito comercial garantizado.

## Cobertura y evolución

Diseño nacional para Chile, con categorías multideportivas ampliables y preparación para otros países. Activación de comunidades por zonas donde podamos acompañar a organizadores. Web, Android e iOS compartirán API y buena parte del código de cliente, con adaptaciones por plataforma.

## Cómo usar esta especificación

Este es el comportamiento propuesto del producto, no una descripción de funcionalidades ya terminadas. Cada sección indica su etapa. Los controles descritos incluyen botones, filtros, enlaces y menús; se muestran según estado y permisos. Las maquetas son esquemas funcionales, pendientes de diseño visual y pruebas con usuarios.

## Punto de partida del repositorio

Hay un frontend Angular con acceso, registro y bienvenida. La documentación describe módulos de fútbol. El código de la API no está disponible en la copia revisada y debe recuperarse. Las pantallas deportivas, el monorepo y las funciones detalladas aquí requieren implementación o comprobación.

# 02 Guía de lectura y alcance del documento
Referencia de navegación

El índice enlaza a cada sección. Las páginas de pantallas detallan lo que se ve, qué hace cada control y cómo responde el sistema ante condiciones normales o errores.

## Convenciones

- MVP: primera versión web con un recorrido completo y operación asistida.

- Consolidación: mejoras que dependen del uso real del MVP; no se ofrecen como disponibles al inicio.

- Móvil: pruebas y publicación específicas de Android e iOS.

- Futuro: módulos con costo y complejidad propios, sujetos a validación y decisión conjunta.

# 03 Producto y entregas por etapas
Plan de producto

| Etapa | Resultado | Condición para avanzar |
|---|---|---|
| Descubrimiento | Entrevistas, prototipo y encuentros coordinados manualmente. | Confirmar problemas y reunir anfitriones dispuestos a probar. |
| MVP web | Explorar, crear, unirse, solicitar grupo, confirmar y cerrar encuentros. | Recorridos críticos probados y soporte operativo disponible. |
| Consolidación | Comunidades, recurrencias y propuestas mejor automatizadas. | Retorno de participantes y organizadores medido. |
| Móvil | Betas y publicación Android e iOS. | Integraciones y experiencia aprobadas por el equipo en dispositivos. |
| Servicios ampliados | Pagos, reservas, torneos y herramientas institucionales. | Demanda validada, responsables y presupuesto definidos. |

## Primera versión utilizable

Cuentas de adultos; selección de región, comuna y actividades; mapa y lista; encuentros gratuitos; inscripciones y espera; solicitudes de grupo; propuestas asistidas; mensajes de encuentro; avisos en la app y por correo; asistencia; reportes y administración. La formación inicial de grupos puede tener revisión manual.

## Alcance deliberadamente posterior

Cobros integrados, reservas de infraestructura, seguimiento GPS continuo, menores de edad, competiciones completas, recomendaciones avanzadas y paneles institucionales requieren diseño propio. No se muestran botones activos hacia funciones que todavía no existen.

## Criterio de priorización

Una función avanza cuando reduce una barrera observada para asistir o repetir, ayuda a operar los encuentros o sostiene el servicio. Cada entrega debe poder demostrarse con datos de prueba y luego observarse en un piloto real. Las fechas se estimarán después de revisar código, disponibilidad y dependencias.

# 04 Roles y permisos
MVP y ampliaciones identificadas

| Rol | Acceso permitido | Límite principal |
|---|---|---|
| Visitante | Explorar actividades públicas y abrir enlaces compartidos. | No acceder a chat, lista privada ni inscribirse. |
| Participante | Editar su perfil, solicitar grupos, inscribirse y cancelar. | No cambiar cupos, horarios o asistentes de otros. |
| Organizador | Gestionar sus encuentros, avisos y asistencia. | Sin acceso a claves, correo privado o ubicación personal de asistentes. |
| Coorganizador | Gestionar encuentros delegados. Consolidación. | Permisos acotados al encuentro; no hereda la cuenta del anfitrión. |
| Moderador | Revisar casos y aplicar medidas autorizadas. | Acceso vinculado al caso y registrado; sin exportaciones indiscriminadas. |
| Administrador | Gestionar catálogo, configuración y permisos internos. | Acciones sensibles con auditoría y acceso reforzado. |
| Institución | Administrar sus actividades y consultar métricas autorizadas. Futuro. | Aislamiento entre organizaciones y vistas agregadas. |

## Reglas comunes

- Una misma cuenta puede organizar y participar. No es necesario crear dos usuarios.

- El backend verifica autenticación, rol, propiedad del recurso y estado en cada operación. Ocultar un botón no es autorización.

- Los permisos internos se conceden explícitamente y se revocan al dejar la función. El rol de administrador no se obtiene por un campo enviado desde el registro.

- Un organizador no elimina una denuncia ni altera la evidencia de un caso. La persona afectada puede solicitar revisión de medidas.

## Privacidad dentro de un encuentro

El organizador ve lo necesario para coordinar: nombre público, estado de inscripción y datos deportivos pertinentes. Los asistentes pueden ver un perfil limitado de otros confirmados. La visibilidad exacta se informa antes de inscribirse. Las listas no se publican completas por defecto a visitantes.

# 05 Navegación y comportamiento común
MVP y diseño multiplataforma

En móvil se proponen cinco destinos: Explorar, Mis planes, Crear, Avisos y Perfil. Crear abre dos opciones: Crear encuentro y Buscar grupo. En escritorio se mantienen los mismos conceptos con navegación superior o lateral y una vista más amplia de mapa y lista.

| Control global | Acción y comportamiento |
|---|---|
| Cambiar zona | Selecciona país, región y comuna; Chile es el país inicial. No exige ubicación del dispositivo. |
| Buscar | Busca encuentros por título, actividad o lugar dentro de los filtros elegidos. |
| Atrás / Cerrar | Vuelve al contexto anterior preservando filtros; pregunta si se perderán cambios sin guardar. |
| Crear | Abre el selector entre encuentro concreto y solicitud para formar grupo. |
| Reintentar | Repite una consulta fallida; las mutaciones usan identificador para evitar duplicación. |
| Ayuda | Abre soporte o guía del contexto. No se presenta como servicio de emergencia. |
| Compartir | Abre compartir del sistema o copia un enlace web con alternativa cuando no hay app instalada. |

## Estados de todas las pantallas

- Cargando: indicador o esqueleto; controles que dependen de datos esperan la respuesta.

- Vacío: explicación y siguiente acción concreta; nunca resultados inventados para llenar el mapa.

- Error: mensaje entendible, opción de reintento y conservación de datos de formulario cuando corresponda.

- Sin conexión: indicar que los datos pueden estar desactualizados; no confirmar plazas ni publicaciones localmente.

- Acceso vencido: solicitar acceso y recuperar el destino original sin repetir automáticamente una operación sensible.

## Lenguaje y accesibilidad

Usar nombres claros como Unirme, Cancelar participación y Crear encuentro. Mostrar costo, nivel y requisitos antes de confirmar. Los iconos tienen etiqueta accesible; estado y errores no dependen solo del color. Los términos técnicos quedan en herramientas internas.

# 06 Explorar actividades y mapa
MVP · Pantalla EXP

| Control | Resultado esperado |
|---|---|
| Usar mi ubicación | Pide permiso al activarse. Si se rechaza, ofrece seleccionar zona. |
| Actividad / Fecha / Nivel | Filtra categorías, intervalo y dificultad. Limpiar filtros conserva solo la zona. |
| Gratis / Distancia | Acota costo y radio; la distancia indica su referencia, no tiempo real de viaje. |
| Mapa / Lista | Cambia presentación preservando filtros, resultados y selección. |
| Buscar en esta zona | Consulta el área visible después de mover el mapa, con paginación o agrupación. |
| Ver encuentro | Abre detalle. La tarjeta informa fecha, nivel, cupos y organizador. |
| No encuentro un plan | Abre una solicitud de grupo con actividad y zona precargadas. |

## Reglas y aceptación

La exploración pública excluye borradores, encuentros privados y cancelados de los resultados normales. Los marcadores representan lugares de encuentro, no personas en vivo. No ordenar únicamente por cercanía: fecha y compatibilidad deben ser visibles. Ante fallo del proveedor de mapa, la lista sigue siendo utilizable. Las distancias y tiempos son informativos; no se inventa disponibilidad de recintos.

# 07 Acceso y configuración inicial
MVP · Pantallas AUT y ONB

Permitir explorar sin cuenta. Solicitar acceso al inscribirse, crear, guardar o publicar una intención. Después del acceso se vuelve al punto original y se pide confirmar la acción pendiente.

| Pantalla y controles | Acción, validación y salida |
|---|---|
| AUT01 · Crear cuenta | Nombre público, correo, contraseña y declaración de mayoría de edad. Aceptar condiciones y privacidad por separado de comunicaciones opcionales. |
| AUT02 · Ingresar | Correo y contraseña. Error genérico ante credenciales inválidas y limitación de intentos. |
| Continuar con Google | Intercambio validado por el backend. No confiar en datos de identidad enviados sin comprobar. |
| Olvidé mi contraseña | Envía enlace temporal; misma respuesta visible exista o no la cuenta. |
| Verificar correo / Reenviar | Comprueba un enlace temporal. La publicación e inscripción requieren correo verificado. |
| ONB01 · Elegir actividades | Selección múltiple con nivel e intensidad por disciplina. Campos opcionales identificados. |
| ONB02 · Elegir zona | Región y comuna obligatorias para preferencias; ubicación precisa opcional y contextual. |
| Guardar y continuar | Guarda preferencias. Si falta información obligatoria, señala el campo y conserva el resto. |
| Omitir por ahora | Permite saltar preferencias opcionales; nunca condiciones necesarias para la cuenta. |

## Casos que hay que resolver

- Un correo asociado a un proveedor no se vincula a otra identidad solo por una coincidencia no verificada; exigir una comprobación de titularidad.

- Las contraseñas nunca se devuelven en respuestas ni se guardan en registros. En recuperación, revocar o permitir revisar las sesiones existentes.

- El acceso social en iOS debe revisarse frente a las reglas de la tienda para determinar los métodos adicionales necesarios.

- Una cuenta eliminada o suspendida recibe una salida explicable y una vía de soporte; una cuenta sin verificar no pierde los formularios ya completados.

# 08 Detalle de un encuentro
MVP · Pantalla ENC01

| Control visible según estado | Acción y restricción |
|---|---|
| Unirme | Requiere cuenta verificada y encuentro disponible; muestra un resumen antes de confirmar. |
| Entrar a lista de espera | Se ofrece cuando no hay plaza; no equivale a estar inscrito. |
| Guardar / Compartir | Guarda un favorito o comparte el enlace. Guardar no reserva cupos. |
| Cómo llegar | Abre una aplicación de mapas o alternativa web con el punto autorizado. |
| Ver organizador / Reportar | Muestra perfil limitado o crea un reporte categorizado. |
| Chat del encuentro | Solo para participantes autorizados y organización; no disponible para visitantes. |
| Cancelar participación | Muestra consecuencias, confirma y actualiza el estado. No cancela el encuentro. |
| Editar / Gestionar | Solo organizador o delegado autorizado; abre la gestión, no un formulario público. |

Mostrar duración, mínimo de participantes, nivel, materiales, accesibilidad declarada, reglas, política de cambios y estado del encuentro. El MVP publica encuentros gratuitos: cualquier costo externo debe aclararse antes de inscribirse, sin simular un cobro o una reserva gestionada por la plataforma.

# 09 Crear y editar encuentros
MVP · Pantallas ENC02 y ENC03

| Paso | Campos y controles |
|---|---|
| 1 · Actividad | Categoría, título, modalidad, nivel e intensidad. Continuar valida requisitos de la disciplina. |
| 2 · Lugar y horario | Lugar público o recinto, punto de reunión, fecha, inicio, fin y zona horaria. Buscar lugar, Ajustar punto y Atrás. |
| 3 · Participación | Mínimo y máximo, materiales, condiciones y visibilidad. En MVP, encuentros públicos o por enlace; el enlace no es una garantía de privacidad. |
| 4 · Revisar | Resumen completo, vista previa y declaración de información correcta. Publicar o Guardar borrador. |
| Editar publicado | Modificar campos, revisar impacto y Guardar cambios. Notificar a afectados cuando sea un cambio relevante. |

## Validaciones antes de publicar

- Inicio futuro y fin posterior; mínimo de participantes positivo y máximo no inferior al mínimo. Límites de texto y categorías habilitadas.

- El organizador indica si participa; si ocupa plaza, se crea una inscripción y cuenta para la capacidad.

- No se puede reducir la capacidad por debajo de las plazas confirmadas u ofrecidas sin resolverlas explícitamente.

- Cambios de lugar, fecha, intensidad o condiciones se destacan y solicitan reconfirmación. No marcar ausente a quien todavía no la entrega.

- Guardar borrador no publica ni envía invitaciones. Una pérdida de conexión no se interpreta como publicación exitosa.

## Botones secundarios y casos de salida

Vista previa muestra lo que verá un visitante. Por enlace excluye el encuentro de búsquedas, pero cualquiera con el enlace puede abrir su vista pública. Descartar borrador requiere confirmación. Duplicar crea un borrador sin asistentes o chat. Cancelar exige motivo y avisos; Eliminar solo aplica a borradores o según retención. Un lugar registrado no equivale a tener permiso o reserva del recinto.

## Horario nacional

Guardar instante y zona horaria del lugar; mostrar la fecha local explícita. No asumir que todo Chile usa la hora de Santiago. Las recurrencias futuras deberán manejar cambios de hora y excepciones por ocurrencia.

# 10 Inscripciones y lista de espera
MVP · Pantalla INS

La inscripción inicial será directa en encuentros abiertos. Los encuentros con aprobación previa se podrán añadir después. Cada persona tiene una sola inscripción vigente por encuentro y las plazas se asignan en el servidor.

| Botón o estado | Regla y respuesta |
|---|---|
| Confirmar participación | Revalida estado, capacidad y duplicados en una transacción. Devuelve inscripción o una alternativa explicable. |
| Ya estoy inscrito | Sustituye Unirme; permite ir a Mis planes. Un doble clic no genera otra plaza. |
| Entrar a espera | Registra orden de espera. Explica que el cupo no está confirmado. |
| Aceptar plaza ofrecida | Reserva temporal sujeta a vencimiento visible; convierte la oferta en inscripción de forma atómica. |
| Rechazar plaza / Salir de espera | Libera la oferta o retira la solicitud; propone la siguiente persona. |
| Cancelar participación | Confirma la salida y libera plaza; conserva registro del cambio para auditoría. |
| Reconfirmar cambio | Acepta las nuevas condiciones; Declinar permite retirarse sin marcar ausencia. |

## Promoción y conflictos

Una vacante genera una oferta a la primera persona elegible. Su plazo es configurable y visible; la plaza queda reservada durante ese plazo. Al vencer se ofrece a la siguiente persona. La reconfirmación pendiente conserva plaza hasta aceptación, retirada o vencimiento informado; después se libera sin marcar ausencia. Los cambios o cancelaciones invalidan ofertas incompatibles.

## Escenarios de aceptación

- Con una plaza y dos confirmaciones simultáneas, como máximo una obtiene esa plaza.

- Una solicitud repetida con el mismo identificador devuelve el resultado previo; si hay resultado incierto, consultar antes de repetir.

- Una oferta vencida no se acepta aunque el cliente conserve una pantalla antigua.

- No se promociona automáticamente a alguien con un encuentro coincidente sin advertir el conflicto. La persona decide si acepta.

# 11 Solicitudes para encontrar grupo
MVP asistido · Pantalla INT

Una intención expresa disponibilidad e interés, sin fijar todavía un encuentro. Es una función distinta de una inscripción. Sus datos se usan para sugerir grupos y no se publican como un mapa de rutinas personales.

| Campo o control | Comportamiento |
|---|---|
| Elegir actividad | Una categoría principal por solicitud; permite perfil de nivel e intensidad. |
| Elegir zona y distancia | Define dónde está dispuesto a reunirse; no necesita guardar su domicilio. |
| Agregar disponibilidad | Franja horaria con fechas o días, duración y fecha de vencimiento. En el MVP se puede limitar a rangos concretos. |
| Definir condiciones | Costo aceptable, materiales y requisitos de accesibilidad pertinentes; no solicitar datos clínicos. |
| Puedo organizar | Ofrece actuar como anfitrión; no asigna ese rol automáticamente. |
| Buscar coincidencias | Muestra encuentros existentes y posibles propuestas con información limitada. |
| Publicar solicitud | Confirma uso de preferencias para propuestas; informa que no garantiza formar un grupo. |
| Editar / Pausar / Cerrar | Recalcula coincidencias futuras, detiene avisos o termina la búsqueda. |

## Cuando faltan coincidencias

Mostrar Mantener búsqueda, Cambiar horario, Ampliar zona y Crear encuentro. Ampliar preferencias requiere elección explícita. No relajar silenciosamente nivel, accesibilidad o costo. Vencer la solicitud avisa y ofrece renovarla.

## Privacidad y control

Una persona decide qué datos públicos acompañan una propuesta. Las coincidencias muestran compatibilidad y una zona aproximada; no exponen horarios completos de terceros. Las solicitudes pausadas, cerradas, bloqueadas o vencidas se excluyen de nuevas propuestas.

# 12 Propuestas y formación de grupos
MVP asistido y automatización posterior · Pantalla GRU

El primer mecanismo puede ejecutarse con reglas simples y revisión humana. No necesita inteligencia artificial para probar la idea. Se seleccionan actividad, área compatible, franja común y requisitos; el motivo de la sugerencia debe poder explicarse.

| Control | Resultado y límite |
|---|---|
| Ver propuesta | Muestra actividad, zona, franja, cantidad interesada, condiciones y vencimiento; no datos privados de otras solicitudes. |
| Me interesa | Aceptación provisional. No es inscripción ni confirmación definitiva de fecha o lugar. |
| No me acomoda | Rechaza la propuesta; opcionalmente indica causa para mejorar sugerencias. |
| Proponer alternativa | Sugiere otro horario o lugar para revisión; no cambia unilateralmente el acuerdo. |
| Ofrecerme como anfitrión | Permite coordinar si se acepta la responsabilidad y se cumplen requisitos. |
| Confirmar encuentro | Cuando hay anfitrión y condiciones concretas, solicita aceptación final de cada participante. |
| Salir de propuesta | Retira su interés; puede mantener la solicitud activa para otras opciones. |

## Condiciones para convertir en encuentro

- Identificar anfitrión, lugar, horario concreto, mínimo viable, capacidad y requisitos compatibles.

- Reservar las plazas acordadas temporalmente o solicitar confirmación antes de abrir al público; nunca sobrepasar capacidad.

- Crear un único encuentro ligado a la propuesta mediante una operación idempotente. Cada inscripción requiere aceptación explícita.

- Si nadie organiza o no se llega al mínimo en plazo, cerrar o reformular la propuesta e informar. Una sugerencia no es una actividad realizada.

## Límites de la recomendación

No inferir salud, seguridad del entorno o capacidad deportiva a partir de preferencias. Bloqueos y permisos se aplican antes de mostrar coincidencias. Los pesos de compatibilidad se ajustan con datos del piloto y no se presentan como una garantía de afinidad personal.

# 13 Gestión del organizador y asistencia
MVP · Pantalla ORG

| Control | Acción y protección |
|---|---|
| Mis encuentros | Lista borradores, publicados, confirmados, en curso y finalizados; filtra por fecha y estado. |
| Ver participantes | Muestra confirmados, espera, ofertas y reconfirmaciones; datos mínimos para coordinar. |
| Confirmar realización | Revisa mínimo, lugar y condiciones. Si no se cumplen, requiere resolver o cancelar; no confirma de forma engañosa. |
| Enviar aviso | Publica información logística a inscritos. Cambios esenciales deben editar también el encuentro. |
| Iniciar encuentro | Marca en curso cuando corresponde y cierra inscripciones según su configuración. |
| Registrar asistencia | Marca presente, ausente o sin verificar; permite corrección y revisión de discrepancias. |
| Finalizar | Cierra la actividad, solicita revisión de asistencia y ofrece repetir como nuevo borrador. |
| Retirar participante | Exige motivo, informa al afectado y deja trazabilidad; no borra reportes. |
| Cancelar encuentro | Motivo obligatorio y confirmación con cantidad de afectados. Notifica y libera ofertas pendientes. |

## Comprobación de asistencia

En el MVP, usar lista del organizador y confirmación posterior del participante. Un QR o código temporal puede evaluarse en móvil, pero no constituye prueba absoluta. No exigir rastreo continuo ni acceso a ubicación para registrar asistencia. Las discrepancias quedan como no verificadas hasta revisión.

## Responsabilidad y continuidad

Si el anfitrión debe salir, el MVP permite cancelar y avisar. La transferencia a un coorganizador requiere aceptación explícita y se incorpora al consolidar comunidades. Una retirada o suspensión del anfitrión debe activar revisión de sus próximos encuentros y avisos a afectados.

## Aceptación

Solo quien tenga permisos sobre ese encuentro modifica asistentes. Los cupos se recalculan al retirar o cancelar. Cada acción administrativa conserva autor, fecha, motivo y resultado; la interfaz confirma el efecto antes de mostrar éxito.

# 14 Mensajes y coordinación
MVP · Pantalla MSG

Un espacio por encuentro reúne logística y preguntas de sus integrantes autorizados. En el MVP se propone texto y avisos del organizador; imágenes, mensajes privados y grupos ajenos a encuentros quedan para validación posterior.

| Control | Comportamiento |
|---|---|
| Enviar mensaje | Valida longitud, permisos y límites de frecuencia. Estado enviando, enviado o fallido con reintento sin duplicación. |
| Responder | Relaciona respuesta con mensaje para mantener contexto. |
| Fijar aviso | Solo organización. Muestra información útil y autor de la publicación. |
| Silenciar conversación | Desactiva avisos de mensajes; no oculta cambios críticos del encuentro en la bandeja. |
| Reportar mensaje | Abre caso con motivo y referencia del mensaje; no reenvía todo el chat a otros usuarios. |
| Bloquear usuario | Impide contacto directo y nuevas sugerencias conjuntas según política; ofrece opciones en encuentros ya compartidos. |
| Volver al encuentro | Muestra detalles vigentes para evitar depender de mensajes desactualizados. |

## Acceso y conservación

La sala solo se habilita al confirmar inscripción o rol organizador. La lista de espera no concede acceso. Al retirarse se revoca el envío y acceso ordinario; se conserva la evidencia necesaria según política. Al finalizar se deja lectura limitada durante un plazo definido y comunicado. La retención exacta se acuerda antes del piloto.

## Reglas operativas

- Modificar fecha o lugar en un mensaje no cambia el recurso oficial. El organizador debe editarlo por su formulario.

- Un bloqueo no elimina evidencia ni promete evitar todo encuentro físico. Si existe un encuentro compartido, mostrar la situación y vías para retirarse o reportar.

- La reconexión recupera mensajes por identificador; una notificación push no se usa como fuente completa del historial.

- El moderador accede a mensajes vinculados a un caso con permiso y auditoría. No se promete cifrado de extremo a extremo si no se implementa.

# 15 Avisos y comunicaciones
MVP y adaptación móvil · Pantalla AVI

| Aviso | Disparador y acción principal |
|---|---|
| Inscripción confirmada | Operación persistida. Ver encuentro. |
| Plaza ofrecida | Oferta válida con vencimiento. Aceptar o rechazar. |
| Encuentro modificado | Cambio esencial. Revisar y reconfirmar o retirarse. |
| Encuentro cancelado | Estado persistido y motivo. Ver alternativas. |
| Recordatorio | Programación según preferencias. Ver instrucciones. |
| Grupo propuesto | Coincidencia revisada. Ver propuesta. |
| Asistencia por revisar | Cierre del encuentro. Confirmar o informar discrepancia. |
| Reporte actualizado | Cambio del caso visible al denunciante. Ver estado sin datos confidenciales. |

## Controles de la bandeja

Todos / No leídos, Abrir, Marcar leído, Marcar todos leídos y Configurar avisos. Los contadores se sincronizan con servidor. Abrir un aviso no acepta una oferta ni confirma asistencia automáticamente. Si el enlace está vencido, mostrar el estado actual y una alternativa.

## Canales por etapa

MVP: bandeja interna y correo para comunicaciones operativas. Móvil: push tras probar permisos y entrega en Android e iOS. SMS solo si se justifica su costo. Las campañas promocionales y de aliados tienen preferencias separadas y no son condición para participar.

## Entrega confiable

- Crear avisos a partir de cambios confirmados en base de datos. Registrar envío y reintentos sin duplicar.

- Las acciones consultan siempre el estado vigente; correo y push pueden llegar tarde.

- Registrar zonas horarias, horarios preferidos y deduplicación de recordatorios.

- Retirar tokens de dispositivo inválidos y desvincularlos al cerrar sesión. No mostrar información sensible en la pantalla bloqueada.

# 16 Perfil privacidad y ajustes
MVP · Pantallas PER y AJU

| Sección y controles | Datos y comportamiento |
|---|---|
| Perfil público · Editar | Nombre público, avatar opcional, biografía breve, intereses y nivel por actividad. Vista previa antes de guardar. |
| Mis planes | Próximos, organizados, espera, propuestas e historial. Abre la acción pendiente adecuada. |
| Guardados | Favoritos de encuentros; retirarlos no cancela una inscripción. |
| Preferencias · Guardar | Zona, actividades, horario y avisos. No cambia inscripciones existentes. |
| Privacidad | Decidir visibilidad de perfil y datos deportivos. El correo y domicilio no son datos públicos. |
| Seguridad | Cambiar contraseña, revisar sesiones y cerrar otras sesiones. Reautenticación para acciones sensibles. |
| Mis datos / Ayuda | Solicitar copia o corrección y revisar casos propios; plazo operativo informado. |
| Eliminar cuenta | Explica efecto sobre próximos encuentros, solicitudes y datos conservados; reautentica y confirma. |
| Cerrar sesión | Revoca la sesión correspondiente y elimina credenciales del dispositivo; no borra inscripciones. |

## Eliminar una cuenta con encuentros pendientes

Resolver antes sus encuentros organizados: cancelar y avisar o transferir en una etapa que lo permita. Retirar futuras inscripciones y solicitudes; revocar sesiones y tokens. Aplicar la política documentada de eliminación o anonimización, separando los datos que deban conservarse. No prometer borrado instantáneo de copias o evidencias que tengan otra política.

## Reputación y trayectoria

El MVP puede mostrar participación confirmada y rol de organizador, explicando cómo se obtiene. Calificaciones públicas y puntajes se evalúan después. No convertir automáticamente una cancelación en sanción ni publicar una clasificación de confiabilidad sin revisión y posibilidad de corregir errores.

# 17 Catálogo multideportivo y requisitos
MVP configurable y ampliación por disciplina

| Familia | Datos específicos | Regla funcional |
|---|---|---|
| Caminata y trote | Distancia, duración, ritmo orientativo y superficie. | Indicar si acepta principiantes y si hay pausas. |
| Ciclismo | Tipo de bicicleta, ruta, dificultad y equipamiento. | Confirmar compatibilidad del tipo de salida. |
| Fútbol y deportes de equipo | Modalidad, tamaño del grupo y posiciones opcionales. | Mínimo y máximo según formato configurado. |
| Tenis pádel y similares | Modalidad individual o dobles y nivel. | No presentar disponibilidad de cancha sin confirmación. |
| Yoga y entrenamiento | Estilo, duración, intensidad y materiales. | Distinguir sesión entre pares y actividad dirigida. |
| Senderismo y montaña | Dificultad, duración, desnivel y equipo requerido. | Activación sujeta a requisitos y capacidad de coordinación. |
| Natación y actividades acuáticas | Recinto o entorno, nivel y requisitos del lugar. | Publicación solo con información y coordinación adecuadas. |
| Otras disciplinas | Plantilla propia con campos y unidades. | Revisión de catálogo y pruebas antes de habilitar. |

## Controles del participante

Buscar categoría, Ver requisitos, Elegir nivel, Guardar preferencias y Sugerir actividad. Sugerir no publica una categoría automáticamente. Los niveles son propios de cada disciplina; una persona puede ser principiante en una y avanzada en otra.

## Controles de catálogo

Administración puede Crear categoría, Editar plantilla, Habilitar, Deshabilitar y Revisar sugerencias. Deshabilitar bloquea nuevas publicaciones, sin borrar historial. Los cambios de campos se versionan para interpretar encuentros previos.

## Cobertura de todos los deportes

La arquitectura admite ampliar disciplinas. La disponibilidad efectiva depende de plantillas, reglas y operación verificadas. Las familias de mayor complejidad no heredan sin revisión las condiciones de un trote urbano. Requisitos deportivos no equivalen a diagnóstico o consejo clínico.

# 18 Estados y reglas del sistema
MVP · Referencia para diseño y backend

| Recurso | Estados y transiciones propuestas |
|---|---|
| Encuentro | Borrador → Publicado → Confirmado → En curso → Finalizado. Cancelado es salida terminal desde estados activos. Lleno es una condición calculada. |
| Inscripción | Confirmada; en espera; plaza ofrecida; reconfirmación pendiente; cancelada. La asistencia se registra por separado. |
| Intención | Activa → Pausada o Cerrada; puede vencer. Al incorporarse a un encuentro se vincula y se pausa según elección. |
| Propuesta | Preparación → En consulta → Lista para confirmar → Convertida. También rechazada, vencida o cerrada con motivo. |
| Asistencia | Sin verificar → Presente o Ausente. Discrepancia abre revisión; correcciones conservan historial. |
| Reporte | Recibido → En revisión → Resuelto o Cerrado. Revisión solicitada conserva la decisión original. |

## Invariantes que nunca deben romperse

- Plazas confirmadas, reservadas por reconfirmación y ofrecidas no superan la capacidad.

- Una persona no tiene más de una plaza activa en un mismo encuentro.

- Un encuentro cancelado no admite nuevas inscripciones, ofertas o envíos ordinarios al chat.

- Una propuesta se convierte como máximo en un encuentro; aceptar interés no equivale a aceptar inscripción.

- Cambiar estado requiere permiso y transición válida; no basta con enviar un campo estado desde el cliente.

- No eliminar historial para ocultar cancelaciones o conflictos; separar datos públicos de auditoría interna.

## Eventos temporales

Vencimientos y recordatorios se programan con tareas reintentables. Una tarea atrasada consulta estado y fecha antes de actuar. Si coinciden una cancelación y una oferta, el estado final del encuentro impide confirmar la plaza. Las pruebas de integración deben cubrir estas carreras y los límites horarios.

# 19 Comunidades y encuentros recurrentes
Consolidación · Pantallas COM

Una comunidad reúne personas y calendario alrededor de actividades o una zona. Se habilita después de comprobar encuentros recurrentes; el MVP puede permitir seguir organizadores sin construir toda esta gestión.

| Control | Resultado |
|---|---|
| Crear comunidad | Nombre, descripción, zona, actividades y reglas. Revisión según riesgo de suplantación o abuso. |
| Seguir / Dejar de seguir | Recibir novedades sin convertirse en miembro de una organización. |
| Solicitar ingreso / Unirme | Ingreso por aprobación o abierto según comunidad; no inscribe en encuentros. |
| Ver calendario | Consulta actividades y cupos por fecha. |
| Crear serie | Define frecuencia, zona horaria y fecha de fin; genera ocurrencias con control de excepciones. |
| Editar solo esta / Editar futuras | Distingue cambio por ocurrencia y por serie; avisa a inscritos afectados. |
| Invitar coorganizador | Delega permisos definidos tras aceptación de la persona. |
| Gestionar miembros | Aprobar, retirar o cambiar rol con trazabilidad. |
| Pausar / Archivar | Impide nuevas actividades según alcance; conserva y resuelve las existentes. |

## Reglas de recurrencia

Cada ocurrencia tiene identidad, capacidad, inscripciones y estado propios. No duplicar automáticamente participantes de la semana anterior. Cambios de horario estacional se calculan desde la zona del lugar. Cancelar una fecha no cancela la serie. Cerrar comunidad requiere revisar próximos encuentros.

## Crecimiento y límites

Cada encuentro se comparte mediante un enlace con vista previa. Ofrecer Invitar a alguien sin importar libreta de contactos por defecto. Los organizadores reciben herramientas útiles antes de pedir que abandonen sus canales actuales. Las comunidades con identidad institucional deben verificarse antes de mostrar una insignia que sugiera respaldo oficial.

# 20 Pagos y reservas de lugares
Futuro · Módulos independientes del MVP

Encuentro, pago y reserva son recursos diferentes. Pagar una inscripción no prueba que un recinto esté reservado. Integrar estos módulos solo con proveedores y organizadores que puedan operar confirmaciones, cancelaciones y devoluciones.

| Módulo y botones | Comportamiento a diseñar |
|---|---|
| Inscripción · Ver precio | Importe final, moneda, cargos y condiciones visibles antes de confirmar. |
| Pagar / Volver | Pasarela externa o integración autorizada. Volver del proveedor no confirma el pago por sí solo. |
| Ver pago / Comprobante | Estado pendiente, confirmado, fallido o reembolsado según conciliación del servidor. |
| Solicitar devolución | Muestra elegibilidad y estado de revisión; no promete devolución inmediata. |
| Recinto · Ver horarios | Disponibilidad confirmada por operador o proveedor, con fecha de actualización. |
| Reservar / Pagar reserva | Retención temporal y confirmación del recinto. Resolver vencimientos y conflictos. |
| Cancelar reserva | Aplica condiciones acordadas y registra devolución si corresponde. |
| Administrar recinto | Operador autorizado gestiona horarios, bloqueos, precios y calendario. |

## Requisitos de ingeniería

- Verificar firmas de notificaciones del proveedor, usar identificadores idempotentes y conciliar movimientos.

- Separar estado financiero y estado de participación; resolver pago confirmado tras vencimiento de cupo sin sobreventa.

- No almacenar datos completos de tarjetas. Usar un proveedor apropiado y documentar quién cobra y quién devuelve.

- Acordar moneda, cargos, liquidaciones, soporte y obligaciones aplicables antes de activar cobros.

- Revisar las políticas vigentes de las tiendas para cada tipo de producto o servicio pagado.

## Decisión comercial

Comisiones y suscripciones son hipótesis. Probar disposición de pago con organizadores antes de desarrollar todo el circuito financiero. La monetización no debe ocultar actividades gratuitas relevantes ni presentar anuncios como recomendaciones neutrales.

# 21 Torneos retos y motivación
Futuro · Pantallas TOR y RET

| Función y controles | Regla de producto |
|---|---|
| Torneo · Crear | Disciplina, formato, calendario, equipos o participantes y reglamento propio. |
| Inscribir equipo | Plantilla, responsable, cupos y elegibilidad. Inscripción pendiente hasta requisitos completos. |
| Generar calendario | Vista previa antes de publicar; validar recintos y cruces de horarios. |
| Registrar resultado | Roles autorizados; confirmación o revisión si existe discrepancia. |
| Ver tabla / Reglamento | Criterios explícitos de puntuación, desempate y clasificación. |
| Reto · Participar | Objetivo, periodo y forma de registrar participación; posibilidad de abandonar. |
| Registrar avance | Fuente y nivel de verificación visibles. No inferir rendimiento real solo por geolocalización. |
| Ver logro / Beneficio | Distingue logro dentro de la app de recompensa externa con condiciones propias. |

## Motivación que queremos promover

Favorecer constancia, exploración y participación según capacidades. Ejemplos: asistir a tres caminatas o probar una actividad nueva. Ofrecer objetivos adaptables y pausas. No exigir rachas que penalicen descanso ni clasificar a personas de disciplinas o condiciones incomparables.

## Antes de implementar

- Validar un formato concreto de torneo con sus organizadores. Una categoría deportiva no incorpora automáticamente su reglamento competitivo.

- Revisar resultados, reclamos, cambios de calendario y cancelación antes de publicar clasificación.

- Si existen premios, definir proveedor, vigencia, disponibilidad y criterios de entrega.

- No presentar una misión o logro como recomendación médica ni como garantía de reducción de inactividad.

## Valor para la expansión

Una campaña nacional puede conectar comunidades locales con una temática compartida. Debe tener anfitriones, fechas y soporte reales antes de difundirse. Los resultados públicos distinguirán personas únicas, asistencias y encuentros realizados para evitar cifras engañosas.

# 22 Moderación y administración
MVP · Pantallas ADM y MOD

| Control interno | Acción y restricción |
|---|---|
| Ver reportes / Filtrar | Bandeja por estado, categoría y prioridad; datos mínimos visibles por rol. |
| Abrir caso / Asignar | Permite revisar evidencia y responsable; acceso auditado. |
| Solicitar información | Comunicación vinculada al caso; no revela datos de la otra parte. |
| Ocultar contenido | Medida con motivo, alcance y fecha. No destruye la evidencia. |
| Restringir / Suspender | Define duración, acciones afectadas y revisión de próximos encuentros. |
| Resolver / Revisar decisión | Registro de razonamiento y notificación permitida a cada parte. |
| Gestionar catálogo | Categorías, plantillas y lugares; validación antes de cambios masivos. |
| Ver tareas fallidas | Reintentar avisos u ofertas con idempotencia y permisos. |
| Configurar / Auditar | Parámetros operativos y consulta de acciones internas; acceso restringido. |

## Controles del usuario que reporta

Reportar encuentro, Reportar perfil, Reportar mensaje, Adjuntar explicación, Enviar, Ver mis casos y Solicitar revisión. Cada envío devuelve identificador. Evitar exigir información ajena al caso. Los adjuntos se habilitan solo si hay almacenamiento, análisis y acceso seguro.

## Procedimiento operativo

Definir responsables y tiempos de respuesta alcanzables para dos desarrolladores. Mostrar horarios de soporte y límites del servicio. Una denuncia no implica sanción automática; las restricciones urgentes siguen criterios documentados. La app no promete supervisión presencial ni asistencia de emergencia.

## Criterios de aceptación

Un moderador sin asignación o permiso no abre información restringida. Una suspensión no elimina evidencias. Las personas pueden corregir datos o pedir revisión. Las acciones masivas y cambios de roles requieren confirmación adicional y quedan en auditoría.

# 23 Herramientas para instituciones
Futuro · Validación mediante un piloto acordado

Municipios, universidades, clubes y empresas podrían publicar programas y observar participación de sus propias actividades. La plataforma no presupone convenios, financiamiento ni apoyo de organismos públicos.

| Control institucional | Uso y límite |
|---|---|
| Crear programa | Agrupa actividades con responsables y fechas; verifica titularidad de la organización. |
| Asignar coordinador | Permisos dentro de su organización, con revocación y auditoría. |
| Publicar actividad | Reutiliza reglas de encuentros y deja claro quién organiza. |
| Ver demanda agregada | Interés por actividad, área y horario con controles para evitar revelar grupos pequeños. |
| Ver participación | Personas únicas, asistencias y retorno dentro de un periodo definido. |
| Comparar periodos | Muestra denominadores y cambios de cobertura; no implica causalidad. |
| Exportar informe | Solo información autorizada y agregada; nunca ubicaciones o rutinas individuales por defecto. |

## Cómo se validaría el valor público

Acordar una zona, actividades y objetivos operativos. Recoger una línea base y documentar alcance, invitaciones, confirmaciones, asistencias y retorno. Si se quiere afirmar impacto sobre hábitos o salud, se necesita un diseño de evaluación específico; el uso de la app por sí solo no lo demuestra.

## Privacidad y aislamiento

Definir finalidad y acceso por organización. Aplicar umbrales de agregación y revisar riesgo de reidentificación antes de mostrar mapas o exportar; agregar datos no garantiza anonimato. No entregar listas de interesados a instituciones sin una base y comunicación adecuadas. Definir retención y acuerdos antes del piloto.

## Atención de medios y autoridades

Preparar una historia con resultados verificables y testimonios autorizados. Distinguir usuarios registrados, asistentes y organizadores recurrentes. Un prototipo atractivo puede abrir conversaciones; la utilidad sostenida debe respaldar cualquier afirmación de éxito.

# 24 Modelo de datos y relaciones
Propuesta técnica · MVP y extensiones separadas

| Entidad | Relación y responsabilidad |
|---|---|
| Usuario y sesión | Identidad, credenciales o proveedor, verificación y sesiones revocables. |
| Preferencia deportiva | Usuario con categoría, nivel e intensidad; sin nivel global único. |
| Lugar y territorio | Punto de encuentro, comuna, región, país y zona horaria. |
| Encuentro | Actividad, organizador, lugar, fecha, requisitos, capacidad y estado. |
| Inscripción y oferta | Usuario con encuentro, estado, orden de espera y vencimiento de oferta. |
| Intención y disponibilidad | Usuario, actividad, área y franjas; vigencia y condiciones. |
| Propuesta y miembro | Grupo compatible con respuestas individuales; enlace único al encuentro convertido. |
| Mensaje y notificación | Contexto autorizado, autor, entrega y lectura; no contienen credenciales. |
| Asistencia y revisión | Registro verificable y correcciones, separado de inscripción. |
| Reporte y auditoría | Evidencia, permisos, actuaciones y retención definida. |

## Relaciones principales

Usuario --< Preferencia >-- Categoria
Usuario --< Inscripcion >-- Encuentro >-- Lugar
Usuario --< Intencion --< Disponibilidad
Propuesta --< MiembroPropuesta >-- Usuario
Propuesta --0..1 Encuentro
Encuentro --< Mensaje / Asistencia / Aviso

## Restricciones y datos geográficos

Índices para categoría, fecha y estado; índice espacial para búsquedas por área; unicidad de inscripción por usuario y encuentro; claves foráneas y control de concurrencia de capacidad. PostGIS permite almacenar, indexar y consultar datos geográficos [5]. Las formas y unidades se definen de manera consistente.

Comunidades, pagos, reservas y torneos se añaden con entidades propias. El modelo de base de datos no es el contrato público: respuestas de API excluyen credenciales y campos internos. Migraciones versionadas y pruebas conservan la interpretación de datos existentes.

# 25 Stack recomendado y decisiones técnicas
Arquitectura propuesta para acordar entre ambos

| Capa | Elección | Aplicación |
|---|---|---|
| Cliente web | Angular y TypeScript | Standalone, Signals y diseño adaptado a móvil. |
| Interfaz | Ionic y Tailwind CSS | Ionic para interacción móvil; Tailwind para composición y utilidades. |
| Android e iOS | Capacitor | Proyectos de plataforma, plugins y publicación con pruebas reales. |
| Estado | Signals y SignalStore | Estado por funcionalidad; RxJS para flujos asíncronos adecuados. |
| API | NestJS y TypeScript | REST documentado; WebSockets solo en funciones que lo requieran. |
| Datos | PostgreSQL y PostGIS | Relaciones, cupos transaccionales y cercanía geográfica. |
| ORM | Prisma | Modelos y consultas comunes; comprobar consultas espaciales con la versión elegida. |
| Workspace | Nx | Aplicaciones, bibliotecas y límites de dependencias. |
| Entorno | Docker Compose | Base de datos y servicios reproducibles para ambos. |
| Pruebas | Vitest y Playwright | Unidad, integración y navegador; pruebas móviles adicionales. |

## Versiones y compatibilidad

Fijar versiones soportadas y compatibles en una matriz de Angular, Nx, Ionic, Capacitor, Node, TypeScript, NestJS y Prisma. No usar un requisito abierto como Angular 17 o superior. Mantener lockfile y comprobar actualizaciones en CI. Revisar las tablas oficiales de soporte y compatibilidad antes de instalar [1].

## Límites de la propuesta

Tailwind no reemplaza los mecanismos de estilo internos de Ionic: usar variables CSS y partes expuestas por sus componentes cuando corresponda [6]. Signals no sustituye validación, API ni persistencia. La selección es adecuada para probar este producto; se confirma con una prueba móvil, espacial y de concurrencia antes de desarrollar todo el alcance.

# 26 Monorepo y contratos compartidos
Propuesta Nx · Separación cliente y servidor

apps/
  api/                  NestJS
  web/                  Angular
  mobile/               Angular Ionic y Capacitor
libs/
  contracts/            Contratos publicos y tipos
  api-client/           Cliente generado desde OpenAPI
  client/
    features/           Encuentros grupos perfiles
    data-access/        API y estado
    ui/                 Componentes compartidos
    platform/           Adaptadores web y movil
  server/
    domain/             Reglas de negocio
    database/           Prisma y consultas espaciales
  testing/              Factories y utilidades de prueba
infra/                  Docker y configuracion
docs/                   Decisiones y especificaciones

## Evitar dos productos duplicados

Web y móvil mantienen contenedores de navegación y adaptadores propios, con funcionalidades reutilizadas en bibliotecas cliente. Las bibliotecas compartidas se crean por necesidad real; no generar decenas de capas vacías. Nx permite imponer límites de dependencias mediante etiquetas y reglas de lint [2].

## Contrato de API y generación

Los DTOs validados del backend describen entradas y salidas. NestJS publica OpenAPI [4]. Desde ese documento se genera un cliente Angular revisable. CI detecta cambios incompatibles y generación desactualizada. Compartir clases con class-validator es opcional, no una condición para toda la interfaz.

## Lo que Prisma no resuelve automáticamente

El tipado de las consultas de base de datos no sincroniza por sí solo el contrato de red ni las versiones de apps ya instaladas. Fechas, unidades, campos opcionales y errores se definen en la API. Las bibliotecas cliente no importan Prisma Client, secretos o módulos exclusivos de Node. Compartir tipos no ejecuta validación de datos recibidos.

# 27 API autenticación y seguridad
MVP · Contratos ilustrativos sujetos a implementación

| Recurso o acción | Contrato propuesto |
|---|---|
| Sesión y perfil | /v1/auth y /v1/me: registro, acceso, verificación, renovación y revocación. |
| Exploración | GET /v1/encounters: categoría, fecha, zona o radio y paginación. |
| Encuentro | POST /v1/encounters; GET o PATCH /v1/encounters/:id; cancelación por acción explícita. |
| Participación | /v1/encounters/:id/registrations y /offers: inscribir, cancelar y aceptar oferta. |
| Grupos | /v1/intentions y /v1/proposals: crear solicitudes, responder y confirmar. |
| Coordinación | /messages, /notifications y /attendance: permisos por contexto. |
| Moderación | /v1/reports y /v1/admin: accesos separados y auditados. |

## Contrato estable

Respuestas paginadas con identificadores estables, fechas con zona definida y errores con código, mensaje y referencia de solicitud. Validar cuerpo, parámetros y límites en servidor [3]. El backend calcula capacidad y transiciones. Una aplicación instalada antigua no debe romperse por una migración de base de datos.

## Sesiones por plataforma

Proponer tokens de acceso de duración limitada y renovación rotativa revocable. En web, diseñar cookies seguras HttpOnly para renovación con controles CSRF y CORS adecuados; en móvil, almacenamiento protegido por el sistema operativo mediante una integración comprobada. No replicar sin revisión el localStorage actual como estrategia definitiva.

## Controles imprescindibles

- Hash apropiado de contraseñas; verificación del proveedor social en servidor; límites de intentos y revocación de sesiones.

- Autorización por recurso, rol y estado; no aceptar cambios de propietario o permisos desde campos arbitrarios.

- HTTPS, secretos fuera del repositorio y separación de entornos. No registrar contraseñas, tokens ni coordenadas personales innecesarias.

- Validación de archivos y enlaces si se habilitan. Protección contra abuso y revisión de retención y privacidad antes de publicar.

# 28 Android iOS y publicación
Etapa móvil · Diseñada desde el inicio

## Prueba técnica previa a comprometer el alcance

Construir una pequeña aplicación con acceso, mapa, ubicación opcional, invitación por enlace y notificación. Probarla en Android e iOS reales. Verificar rendimiento de lista y mapa, teclado, botón atrás, restauración de sesión, pérdida de red y accesibilidad. El resultado confirma o modifica la elección de Capacitor.

| Integración | Comportamiento requerido |
|---|---|
| Ubicación | Permiso contextual y alternativa manual. Sin rastreo continuo en el MVP. |
| Push | Preferencias, dispositivos múltiples y enlaces que abren el recurso vigente. |
| Deep links | Invitación abre web o app. Tras instalar o acceder se recupera el destino cuando sea técnicamente viable. |
| Almacenamiento de sesión | Persistencia protegida y limpieza de credenciales al revocar o cerrar sesión. |
| Calendario y compartir | Exportar un evento o abrir compartir solo por acción del usuario; no confirma asistencia. |
| Compilación | Proyectos Android e iOS versionados, firma y secretos fuera del código. |

## Herramientas y proceso de tiendas

La compilación de iOS requiere macOS y Xcode, localmente o mediante infraestructura compatible. Android requiere su entorno y SDK compatibles. La elección entre Swift Package Manager y CocoaPods depende de Capacitor y plugins seleccionados; seguir sus requisitos oficiales [7].

- Definir titularidad de cuentas, identificadores, certificados, presupuesto y responsables.

- Preparar betas, pruebas externas, fichas, capturas, soporte, datos de privacidad y acceso para revisión.

- Verificar requisitos vigentes de pruebas de Google Play y pautas de Apple antes de cada envío [9][10].

- Publicar por etapas, monitorizar fallos y conservar compatibilidad de la API. La revisión de tienda puede exigir cambios; no se garantiza aprobación automática.

# 29 Calidad operación y accesibilidad
MVP y mantenimiento continuo

| Área | Criterio de preparación |
|---|---|
| Pruebas de negocio | Cupos concurrentes, espera, vencimientos, cancelaciones y conversión única de propuestas. |
| API y permisos | Probar acceso propio y ajeno, validación, errores y sesiones revocadas. |
| Interfaz | Vitest según configuración compatible; Playwright para recorridos críticos de navegador. |
| Aplicaciones instaladas | Pruebas reales de permisos, push, enlaces, sesión y actualizaciones. La emulación de navegador no las sustituye [8]. |
| CI | Lint, tipos, pruebas, compilación, migraciones y generación de contratos; revisión antes de desplegar. |
| Operación | Estado de servicios, errores, tareas fallidas y alertas con responsables. |
| Recuperación | Copias de seguridad y restauración ensayada; plan de incidentes y reversión. |
| Accesibilidad | Teclado, foco, lector de pantalla, contraste, tamaño de texto y alternativa al mapa. |

## Despliegue y servicios

Entornos separados de desarrollo, pruebas y producción. Docker Compose reproduce dependencias locales; producción se elige por costo, respaldo y operación. Empezar con API modular única. Incorporar Redis y una cola solo si necesitamos entrega durable o volumen; los recordatorios deben ser confiables desde el MVP mediante una solución simple y persistente.

## Objetivos por medir

Definir un volumen de prueba de referencia y medir latencia de exploración, inscripciones y carga de mapa. No prometer escala nacional sin ensayos. Acordar objetivos de recuperación y pérdida aceptable de datos antes del lanzamiento; no confundir una copia existente con una restauración comprobada.

## Definición de terminado

Una función está terminada cuando cumple reglas, permisos y estados; tiene errores comprensibles; pasa los controles adecuados; se observa en pruebas y dispone de soporte. Una pantalla con botones sin persistencia o lógica no cumple el criterio.

# 30 Piloto crecimiento y sostenibilidad
Plan de validación · Objetivos por acordar

Propuesta inicial: entrevistas con diez participantes y tres organizadores; después un piloto de seis semanas con al menos tres anfitriones y seis encuentros realizados. Son objetivos de planificación, no resultados ni muestra representativa nacional.

| Señal | Definición y uso |
|---|---|
| Propuestas útiles | Propuestas que terminan en encuentro realizado sobre propuestas enviadas con plazo cerrado. |
| Asistencia | Asistencias verificadas sobre confirmaciones vigentes al cierre de inscripción; informar no verificadas. |
| Retorno | Personas con segunda asistencia dentro de 30 días sobre primeras asistentes con seguimiento completo. |
| Organización recurrente | Anfitriones que realizan al menos un segundo encuentro en el periodo. |
| Oferta local | Encuentros disponibles por actividad, zona y horario; no solo total nacional. |
| Costo de operación | Tiempo de coordinación y soporte, infraestructura y captación por encuentro realizado. |

## Decidir con evidencia

Como umbrales iniciales de discusión: 60 % de asistencia, 30 % de retorno entre personas con seguimiento completo y al menos dos anfitriones que repitan. Si no se alcanzan, investigar causas y ajustar; no ampliar publicidad para esconder la falta de utilidad. Registrar tamaños de muestra y encuentros cancelados.

## Crecimiento nacional

Permitir registro y propuestas en todo Chile, acompañando zonas con anfitriones y calendario real. Compartir enlaces y dar valor a comunidades existentes. Repetir la activación local antes de ampliar el gasto de captación. El nombre es provisional: evaluar alternativas por la existencia pública de Falta1 [12].

## Ingresos y presupuesto

Probar herramientas pagadas para organizadores, comisiones sobre actividades pagadas y pilotos institucionales. Son hipótesis. Estimar alojamiento, mapas, correo, almacenamiento, dispositivos, tiendas y horas de soporte. Definir tope mensual y alertas; no depender de financiamiento o convenios todavía inexistentes.

# 31 Backlog y acuerdos de los colaboradores
Guía para convertir la propuesta en trabajo

| Entrega | Resultado verificable |
|---|---|
| Base recuperada | Revisar API original, dependencias y datos; acordar reutilización o reconstrucción. |
| Pruebas técnicas | Validar mapa, consulta por cercanía, cupos concurrentes y prueba móvil. |
| Cuentas y contratos | Sesión completa, roles, DTOs, contrato OpenAPI y cliente generado. |
| Primer encuentro | Crear, explorar, inscribirse, cancelar, coordinar y registrar asistencia. |
| Formación asistida | Solicitudes, propuesta, respuestas y conversión única en encuentro. |
| Operación del piloto | Avisos, reportes, panel interno, restauración y medición de resultados. |
| Consolidación y móvil | Priorizar con datos y confirmar los requisitos de publicación. |

## Preguntas para acordar antes de programar

- ¿Qué actividades y anfitriones usaremos primero? ¿Quién puede acompañar los encuentros y responder soporte?

- ¿Aceptamos inscripciones directas, encuentros gratuitos y adultos en el MVP? ¿Qué datos son realmente necesarios?

- ¿Qué tiempo semanal y presupuesto aporta cada uno? ¿Cómo se distribuyen producto, desarrollo, pruebas y operación?

- ¿Quién será titular de marca, repositorio, infraestructura y cuentas de tiendas? ¿Cómo acordamos decisiones y salida de un colaborador?

- ¿Cuáles serán los plazos operativos de espera, retención, avisos y revisión de casos? Deben estar configurados y comunicados.

- ¿Qué proveedor de mapas y mensajería elegiremos después de comparar cobertura, costo y prueba móvil?

## Cómo revisar este documento

Anotar por sección Aceptar, Ajustar o Posponer, con motivo y responsable. Después transformar cada pantalla en historias y criterios de aceptación. Las decisiones técnicas se registran con fecha y alternativas. No iniciar simultáneamente todos los módulos futuros.

## Siguiente resultado concreto

Un alcance inicial aprobado entre ambos, prototipo del recorrido, tablero priorizado y estimación basada en tareas y disponibilidad. Este documento orienta el proyecto; no sustituye diseño detallado, acuerdos comerciales o revisión de requisitos aplicables antes de publicar.

# 32 Referencias y fundamento de la propuesta
Fuentes oficiales y propuestas públicas · Consulta 24 de octubre de 2026

Las capacidades técnicas se contrastaron con documentación oficial. Las páginas de competidores describen lo que sus autores ofrecen; no prueban adopción, ingresos, calidad ni disponibilidad en cada zona. El diseño funcional y los umbrales del piloto son propuestas para este proyecto.

[1] Angular y soporte de versiones: https://angular.dev/reference/releases

[2] Nx y límites entre módulos: https://nx.dev/docs/features/enforce-module-boundaries

[3] NestJS y validación de peticiones: https://docs.nestjs.com/techniques/validation

[4] NestJS y contrato OpenAPI: https://docs.nestjs.com/openapi/introduction

[5] PostGIS y consultas geográficas: https://postgis.net/

[6] Ionic y estilos de componentes: https://ionicframework.com/docs/theming/css-shadow-parts

[7] Capacitor y requisitos de entorno: https://capacitorjs.com/docs/getting-started/environment-setup

[8] Playwright y emulación de dispositivos: https://playwright.dev/docs/emulation

[9] Google Play y pruebas para cuentas personales: https://support.google.com/googleplay/android-developer/answer/14151465?hl=es

[10] Apple y pautas de revisión: https://developer.apple.com/app-store/review/guidelines/

[11] MeetSport y comunidad deportiva: https://www.meetsport.cl/site/

[12] Falta1 y encuentros deportivos: https://falta1app.cl/

[13] Sweatpals y descubrimiento de actividades: https://help.sweatpals.com/21-discovering-events-and-lineups

## Decisiones que necesitan comprobación práctica

Compatibilidad exacta del stack y sus plugins; cobertura espacial de la versión elegida de Prisma; rendimiento de mapas en teléfonos; modelo operativo de anfitriones; privacidad de las vistas agregadas; disposición a participar y pagar; requisitos vigentes de publicación. Los datos actuales del repositorio no confirman estas capacidades.
