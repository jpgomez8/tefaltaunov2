# Propuesta de plataforma multideportiva para Chile

Alcance inicial y evolución hacia Android e iOS

Para revisión de Yerko y Jean Paul  |  24 de octubre de 2026  |  Versión 1

### La decisión que queremos tomar

Proponemos desarrollar una plataforma que ayude a las personas a encontrar o formar grupos compatibles para practicar deportes y actividades físicas. Este documento busca acordar la dirección del producto, una primera versión comprobable y el camino hacia aplicaciones publicadas en Android e iOS.

La ambición es operar en todo Chile y preparar una expansión posterior a otros países. El lanzamiento debe acompañarse de comunidades locales activas y capacidad de operación. La popularidad, los ingresos y el interés institucional son resultados por demostrar.

### La propuesta central

La persona indica qué quiere hacer, dónde, cuándo y con qué nivel. Puede sumarse a un encuentro existente o expresar interés en formar un grupo. La plataforma reúne intenciones compatibles y facilita una propuesta que requiere confirmación de sus participantes y de quien coordine.

Ejemplo: varias personas quieren comenzar a trotar después del trabajo en una misma zona. Sus horarios coinciden, se propone un encuentro, un anfitrión acepta coordinar y los participantes confirman. Si la experiencia funciona, pueden repetirla semanalmente.

### Qué conocemos del proyecto actual

- Existe un frontend Angular con registro, acceso por correo y Google, manejo de sesión y una bienvenida básica. No se ha validado el acceso completo contra una API funcional.

- La documentación describe usuarios, jugadores, canchas, partidos e invitaciones. En la copia revisada, el backend figura como una referencia Git y su carpeta está vacía; debemos recuperar su código.

- PostgreSQL es una preferencia expresada entre los colaboradores. NestJS, Prisma, Docker y la estrategia móvil se presentan aquí como decisiones propuestas.

### Primer acuerdo recomendado

Validar primero el recorrido intención, grupo, encuentro y repetición. Mantener un diseño multideportivo, comprobarlo con pocas categorías y ampliar funciones específicas según uso real.

## Usuarios y experiencia del producto

### A quién queremos ayudar

El participante busca compañía, una actividad adecuada o un grupo al que integrarse. El organizador necesita reunir personas y coordinar encuentros. Clubes, entrenadores e instituciones podrían usar herramientas específicas más adelante. Una persona puede participar y organizar en distintos momentos.

### El recorrido principal

- Elegir intereses, nivel por actividad, disponibilidad y ubicación manual o autorizada.

- Explorar mapa y lista con filtros de fecha, distancia, intensidad, costo y requisitos.

- Revisar detalles y sumarse a un encuentro, o publicar una intención cuando no exista una opción adecuada.

- Recibir una propuesta de grupo. Sus integrantes confirman y un anfitrión acepta la coordinación antes de fijar el encuentro.

- Consultar instrucciones, recibir avisos y gestionar participación o cancelación.

- Registrar asistencia y decidir si se desea volver a participar o seguir a la comunidad.

### Una base común para múltiples disciplinas

| Actividad | Datos específicos de ejemplo |
|---|---|
| Trote y caminata | Distancia, ritmo o intensidad y duración. |
| Fútbol y básquet | Modalidad, cantidad necesaria y organización de equipos. |
| Ciclismo y senderismo | Ruta propuesta, dificultad y equipamiento. |
| Yoga y entrenamiento | Tipo de sesión, nivel y materiales necesarios. |

Todos los encuentros comparten lugar, horario, organizador, cupos y condiciones. Un catálogo ampliable permite incorporar deportes. Cada disciplina se habilita con requisitos claros y pruebas de su recorrido; aparecer en el catálogo no implica disponer de torneos o reservas especializadas.

### Pantallas iniciales

Inicio y exploración; detalle del encuentro; creación y edición; formulario de intención; propuestas de grupo; mis encuentros y solicitudes; perfil; coordinación del encuentro; panel de organización; administración y reportes.

### Cuando todavía no hay actividad cercana

Permitir registrar interés, seguir una zona y compartir una propuesta. Las solicitudes no se presentan como encuentros confirmados. Si no se alcanza un grupo viable, se avisa y se ofrecen alternativas sin prometer disponibilidad.

## Alcance de la primera versión

El MVP debe completar un encuentro real de principio a fin. La formación de grupos puede comenzar con revisión manual y reglas transparentes. La automatización se incorpora cuando tengamos evidencia sobre compatibilidad y asistencia.

| Incluir en el MVP | Criterio de aceptación |
|---|---|
| Cuenta y perfil | Acceso funcional, intereses y nivel por actividad; recuperación y eliminación de cuenta previstas antes del lanzamiento público. |
| Exploración nacional | Selección de región y comuna, mapa y lista; búsqueda manual sin exigir geolocalización. |
| Encuentros e inscripciones | Crear, editar, cancelar y unirse; controlar cupos y duplicados incluso con solicitudes simultáneas. |
| Intenciones y propuestas | Recoger actividad, zona y disponibilidad; consentimiento para participar en una propuesta. |
| Confirmación y espera | Estados visibles, cancelación y promoción desde lista de espera con confirmación del participante. |
| Coordinación y avisos | Mensajes del encuentro, notificación de cambios y recordatorios con preferencias configurables. |
| Asistencia y repetición | Asistencia confirmada por organizador y participante cuando sea posible; discrepancias revisables. |
| Administración | Revisar reportes, bloquear abuso y gestionar catálogo y encuentros. |

### Funciones para etapas posteriores

Aplicaciones de tienda; recomendaciones avanzadas; grupos recurrentes; retos; pagos; reservas de recintos; torneos y panel institucional. Se priorizan por demanda y viabilidad. El seguimiento GPS continuo y una red social general no son necesarios para validar la propuesta inicial.

### Confianza integrada en el recorrido

Proponemos iniciar con adultos, encuentros grupales y lugares públicos. Mostrar información útil sobre el anfitrión, reglas del encuentro y vías para reportar o bloquear. No publicar domicilios ni ubicación individual en vivo por defecto. La verificación de correo o teléfono no debe presentarse como una validación completa de identidad.

Los datos de asistencia deben poder corregirse. Un registro de participación no garantiza seguridad ni equivale a una evaluación de salud o capacidad deportiva.

## Arquitectura propuesta y base técnica

Recomendamos una API compartida por la web y las futuras aplicaciones móviles. Para un equipo de dos personas, un backend modular desplegado como una sola aplicación simplifica desarrollo y operación. Revisaremos el backend recuperado antes de decidir qué conservar.

| Componente | Propuesta y propósito |
|---|---|
| Web | Angular con interfaz adaptada a móvil; evaluar instalación como PWA. |
| API | NestJS como propuesta, organizada por módulos y con contrato documentado. |
| Datos | PostgreSQL y Prisma para modelos, consultas y migraciones. |
| Entorno local | Docker Compose para base de datos y servicios; acordar si la web se ejecuta localmente o también en contenedor. |
| Integraciones | Proveedor de mapas, correo y notificaciones elegido por cobertura, costo, privacidad y compatibilidad móvil. |
| Operación | Entornos separados de desarrollo, prueba y producción; copias de seguridad, registros y seguimiento de errores. |

### Modelo de dominio inicial

Usuario, perfil de actividad, categoría, lugar, encuentro, inscripción, intención, propuesta de grupo, notificación y reporte. Comunidad y membresía pueden incorporarse al validar grupos recurrentes. Las preferencias de nivel pertenecen a cada actividad de una persona.

Inscripciones y encuentros requieren estados explícitos. Una solicitud de grupo no reserva una plaza; una propuesta no se convierte en encuentro hasta su confirmación. Los cupos deben protegerse con operaciones transaccionales en la base de datos.

### Compatibilidad explicable

Comenzar por actividad, zona o radio de desplazamiento, coincidencia horaria, nivel e intensidad. Presentar el motivo de la sugerencia y permitir aceptarla o descartarla. No necesitamos un modelo de inteligencia artificial para comprobar este mecanismo.

### Preparación para crecer

Guardar fechas con zona horaria y referencias territoriales, usar categorías configurables y prever idiomas y monedas. Para búsquedas geográficas avanzadas, evaluar una extensión espacial según las consultas reales. Añadir colas o servicios separados cuando una necesidad medida lo justifique.

Verificar con pruebas los recorridos críticos: sesión, permisos, concurrencia de cupos, cancelaciones y confirmación de propuestas. Mantener migraciones revisables y comprobar que las copias de seguridad se restauran.

## Evolución hacia Android e iOS

Las aplicaciones Android e iOS forman parte de la visión del producto. Su publicación es una etapa específica con desarrollo, pruebas y operación propios. El backend y las reglas de negocio deben servir a todas las plataformas desde el inicio.

### Ruta tecnológica recomendada

Evaluar Angular con Capacitor como primera opción para aprovechar el trabajo web. Capacitor permite proyectos Android e iOS y acceso a funciones nativas mediante plugins [4]. Antes de adoptarlo, hacer una prueba en dispositivos con mapas, acceso de usuarios, notificaciones y enlaces de invitación.

Si esa prueba descubre limitaciones importantes, comparar una interfaz móvil con Flutter o React Native, manteniendo la API. Esa alternativa supone otro frontend y mayor esfuerzo de mantenimiento. La decisión debe basarse en el prototipo y las capacidades del equipo.

| Etapa | Resultado esperado |
|---|---|
| Web adaptada a móvil | Validar el producto y sus recorridos en teléfonos; enlaces compartibles y accesibilidad básica. |
| Prueba móvil | Validar navegación, permisos, almacenamiento de sesión, mapas y enlaces en Android e iOS. |
| Beta distribuida | Pruebas en dispositivos reales, notificaciones, estabilidad y sesiones de usuarios externos. |
| Publicación | Preparar cuentas, firma, fichas, soporte y revisiones de Google Play y App Store. |
| Mantenimiento | Monitorear errores, responder soporte y actualizar dependencias y requisitos de plataforma. |

### Preparación para publicar

- Definir titularidad de las cuentas de desarrollador y presupuesto recurrente. Para compilar y firmar iOS, prever acceso a un entorno macOS con Xcode o un servicio compatible.

- Implementar permisos de ubicación y notificaciones solo cuando aporten valor; revisar sesión, eliminación de cuenta y tratamiento de datos en móvil.

- Preparar política de privacidad, información de uso de datos, contacto de soporte, capturas y credenciales de revisión cuando sean necesarias.

- Revisar requisitos vigentes de pruebas, pagos y contenido generado por usuarios. Google contempla pruebas específicas para determinadas cuentas personales [6]; Apple evalúa funcionalidad y experiencia, además de otras reglas [5].

Publicar no consiste solo en empaquetar la web. La aprobación depende de las revisiones de cada tienda y debe presupuestarse junto con pruebas, correcciones y mantenimiento. Los requisitos se verificarán otra vez antes del envío.

## Validación y despliegue en Chile

### Disponibilidad nacional y activación local

La plataforma se diseña para permitir actividades en todo Chile. El acompañamiento a organizadores se concentra inicialmente en zonas donde podamos reunir participantes. La expansión operativa sigue la actividad real y nuestra capacidad de soporte.

| Fase | Trabajo y evidencia para avanzar |
|---|---|
| Descubrimiento | Entrevistar como punto de partida a 10 participantes y 3 organizadores de varias actividades. Registrar problemas, alternativas y disposición a probar. |
| Piloto asistido | Recoger solicitudes y coordinar manualmente encuentros. Observar qué coincidencias se aceptan y qué ocurre con la asistencia. |
| MVP web | Implementar el recorrido validado y probarlo con comunidades fundadoras, conservando intervención manual cuando sea útil. |
| Comunidades recurrentes | Comprobar retorno de participantes y organizadores; corregir cancelaciones y barreras de acceso. |
| Expansión y móvil | Ampliar zonas con anfitriones disponibles y abrir betas Android e iOS cuando el recorrido principal sea estable. |

### Cómo evaluaremos el piloto

Propuesta inicial para discutir: un piloto de seis semanas con tres comunidades o anfitriones y al menos seis encuentros realizados. Estas cifras son objetivos de planificación, no resultados ni garantía estadística. Registrar también todos los encuentros propuestos que no llegaron a realizarse.

- Conversión de propuesta a encuentro: propuestas que terminan en al menos una reunión realizada.

- Asistencia: participantes registrados como asistentes sobre participantes confirmados; separar datos sin verificar.

- Retorno: personas que vuelven a asistir dentro de los 30 días posteriores a su primera asistencia.

- Continuidad del organizador: anfitriones que coordinan un segundo encuentro.

- Costo de operación: tiempo de coordinación y soporte por encuentro; costos de servicios y captación.

Como umbrales iniciales de discusión, buscar que asista al menos el 60 % de los confirmados, que regrese el 30 % de quienes asistieron con seguimiento completo y que al menos dos anfitriones repitan. Revisar estos umbrales tras el piloto y reportar siempre los tamaños de muestra.

### Captación y alcance público

Invitar comunidades existentes y facilitar enlaces de inscripción para WhatsApp e Instagram. Un eventual piloto municipal debe responder a necesidades concretas, con métricas agregadas y consentimiento adecuado. Publicar resultados verificables; inscripciones no equivalen a impacto en salud.

## Negocio y sostenibilidad del proyecto

### Diferenciación que debemos comprobar

MeetSport y Falta1 describen funciones de conexión deportiva en Chile [1][2]. Sweatpals ofrece descubrimiento de actividades y comunidades [3]. Por eso no basaremos el proyecto en afirmar que nadie hace algo similar. Proponemos validar el valor de reunir intenciones compatibles y sostener encuentros, especialmente para quienes todavía no tienen grupo.

La marca Falta Uno es provisional. Existe una propuesta pública llamada Falta1 [2]; conviene revisar alternativas, dominios y disponibilidad de marca antes de invertir en identidad o publicar tiendas.

### Hipótesis de ingresos

| Posible cliente | Valor por el que probaríamos cobrar |
|---|---|
| Organizadores y clubes | Gestión de encuentros recurrentes, comunicaciones y participantes. |
| Organizadores de actividades pagadas | Inscripción y gestión de pagos, cancelaciones y devoluciones. |
| Instituciones y empresas | Herramientas para coordinar programas y consultar participación agregada. |

Mantener gratuito el acceso básico es una propuesta por validar. Antes de fijar precios, entrevistar compradores y conseguir compromisos de pilotos pagados. No financiar el modelo con venta de ubicaciones o perfiles personales.

### Costos y responsabilidades

Estimar horas disponibles de ambos, alojamiento, base de datos, mapas, mensajes, almacenamiento, monitoreo, cuentas de tiendas y dispositivos de prueba. Definir un presupuesto mensual máximo y alertas de consumo antes de abrir el servicio público.

Acordar quién conduce producto y contacto con usuarios, quién mantiene infraestructura y datos, y cómo se reparten soporte y desarrollo. Documentar propiedad del código, decisiones, accesos, titularidad de cuentas y responsabilidades entre colaboradores.

### Riesgos que afectan la viabilidad

- Poca actividad por zona: captar anfitriones y publicar horarios recurrentes antes de invertir en difusión amplia.

- Confirmaciones sin asistencia: recordatorios, cancelación fácil y seguimiento de causas.

- Mantenimiento excesivo: limitar el MVP, usar una API compartida y ampliar por evidencia.

- Interés institucional sin compra: probar primero utilidad y capacidad de operación; no depender de un convenio futuro.

La atención de medios o autoridades sería consecuencia de resultados demostrables. La participación en la plataforma por sí sola no permite atribuir una mejora de salud ni una reducción de inactividad.

## Acuerdos para comenzar y referencias

### Decisiones para revisar entre ambos

- ¿Compartimos el foco en formar grupos compatibles y facilitar encuentros recurrentes?

- ¿Qué dos o tres actividades usaremos para probar los recorridos y qué anfitriones podemos convocar?

- ¿Dónde está el backend original y qué componentes vale la pena recuperar?

- ¿Adoptamos la arquitectura propuesta y una prueba de Capacitor antes de decidir la interfaz móvil?

- ¿Con cuánto tiempo semanal y presupuesto contamos? ¿Cómo repartimos soporte y desarrollo?

- ¿Qué nombre evaluaremos y quién será titular de repositorios, infraestructura y cuentas de publicación?

- ¿Aceptamos el alcance del MVP y los criterios propuestos para evaluar el piloto?

### Entregables del siguiente ciclo

Un alcance acordado; entrevistas y hallazgos; un prototipo navegable del recorrido principal; acceso al backend recuperado o decisión documentada de reconstrucción; modelo de datos inicial; tablero de trabajo con responsables; presupuesto y plan de piloto. Estimaremos fechas tras revisar estos elementos y la disponibilidad de ambos.

### Referencias consultadas

Estas fuentes respaldan las capacidades públicas de otros productos y la ruta móvil. No constituyen evidencia de su adopción, ingresos o calidad. Consulta realizada el 24 de octubre de 2026.

[1] MeetSport
https://www.meetsport.cl/site/

[2] Falta1
https://falta1app.cl/

[3] Sweatpals y descubrimiento de actividades
https://help.sweatpals.com/21-discovering-events-and-lineups

[4] Capacitor con Angular
https://capacitorjs.com/solution/angular

[5] Apple y pautas de revisión
https://developer.apple.com/app-store/review/guidelines/

[6] Google Play y requisitos de pruebas
https://support.google.com/googleplay/android-developer/answer/14151465?hl=es
