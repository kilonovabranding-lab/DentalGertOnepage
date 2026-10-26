// Fuente de verdad del contenido de Dental Gert (ES/EN). Las páginas se generan con `node src/build.mjs`.
export const SITE = process.env.SITE_URL || 'https://dental-gert.pages.dev'

export const BRAND = {
  name: 'Dental Gert',
  tagline: { es: 'El mejor aliado de tu sonrisa', en: 'Your smile’s best ally' },
  email: 'dentalgert@gmail.com',
  phone: '+50377390440',
  phoneDisplay: '7739 0440',
  wa: 'https://wa.me/50377390440?text=' + encodeURIComponent('Hola Dental Gert, quisiera Agendar mi cita por whatsapp'),
  waEn: 'https://wa.me/50377390440?text=' + encodeURIComponent('Hola Dental Gert, quisiera Agendar mi cita por whatsapp'),
  fb: 'https://www.facebook.com/DENTALGert',
  ig: 'https://www.instagram.com/dentalgert/',
  maps: 'https://maps.app.goo.gl/cWwQeTvxu6N4whk6A',
  address: { street: 'Colonia Médica', city: 'San Salvador', region: 'San Salvador', country: 'SV' }, // TODO: calle y número exactos
  ga4: '', // TODO: ID de GA4 (G-XXXXXXX). Vacío = no se carga
  cfBeacon: '', // TODO: token de Cloudflare Web Analytics (o activarlo desde el panel de Pages)
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '1x00000000000000000000AA', // clave de prueba de Cloudflare
}

// Horario visible (el servidor usa lib/config.js).
export const HOURS = [
  { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], open: '08:00', close: '12:00' },
  { days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], open: '13:30', close: '16:30' },
  { days: ['Sa'], open: '08:00', close: '13:00' },
]

export const SERVICES = [
  { slug: 'diagnostico', min: 25, icon: 'search',
    es: { name: 'Diagnóstico', desc: 'Revisión completa de dientes y encías para detectar a tiempo caries u otros problemas y definir contigo tu plan de tratamiento.' },
    en: { name: 'Diagnosis', desc: 'A complete check of your teeth and gums to catch cavities and other problems early and agree on your treatment plan.' } },
  { slug: 'limpieza', min: 25, icon: 'sparkle',
    es: { name: 'Limpieza dental', desc: 'Retiramos el sarro y la placa que el cepillado no alcanza. Previene el sangrado de encías y el mal aliento.' },
    en: { name: 'Dental cleaning', desc: 'We remove the tartar and plaque your brush can’t reach, helping prevent bleeding gums and bad breath.' } },
  { slug: 'relleno', min: 40, icon: 'fill',
    es: { name: 'Relleno dental', desc: 'Restauramos dientes con caries o fracturas con materiales de calidad que se integran de forma natural a tu sonrisa.' },
    en: { name: 'Dental filling', desc: 'We restore decayed or chipped teeth with quality materials that blend naturally into your smile.' } },
  { slug: 'endodoncia', min: 60, icon: 'root',
    es: { name: 'Endodoncia', desc: 'Tratamiento de conducto para salvar un diente con infección o dolor intenso, sin necesidad de extraerlo.' },
    en: { name: 'Root canal', desc: 'Root canal treatment to save an infected or very painful tooth instead of removing it.' } },
  { slug: 'extraccion', min: 30, icon: 'extract',
    es: { name: 'Extracción dental', desc: 'Retiro cuidadoso de piezas que ya no se pueden recuperar, con anestesia local y acompañamiento en tu recuperación.' },
    en: { name: 'Tooth extraction', desc: 'Careful removal of teeth that can no longer be saved, with local anesthesia and follow-up during recovery.' } },
  { slug: 'cordales', min: 75, icon: 'wisdom',
    es: { name: 'Cirugía de cordales', desc: 'Extracción de muelas del juicio que duelen, no tienen espacio o crecen inclinadas, con un procedimiento planificado.' },
    en: { name: 'Wisdom tooth surgery', desc: 'Planned removal of wisdom teeth that hurt, lack space or grow at an angle.' } },
  { slug: 'blanqueamiento', min: 75, icon: 'shine',
    es: { name: 'Blanqueamiento dental', desc: 'Aclara el tono de tus dientes de forma segura y con supervisión profesional, para una sonrisa más luminosa.' },
    en: { name: 'Teeth whitening', desc: 'Safely brightens the shade of your teeth under professional supervision for a more radiant smile.' } },
]

export const COUNTRIES = [
  ['US', '+1', 'Estados Unidos', 'United States'], ['CA', '+1', 'Canadá', 'Canada'], ['MX', '+52', 'México', 'Mexico'],
  ['GT', '+502', 'Guatemala', 'Guatemala'], ['HN', '+504', 'Honduras', 'Honduras'], ['NI', '+505', 'Nicaragua', 'Nicaragua'],
  ['CR', '+506', 'Costa Rica', 'Costa Rica'], ['PA', '+507', 'Panamá', 'Panama'], ['CO', '+57', 'Colombia', 'Colombia'],
  ['VE', '+58', 'Venezuela', 'Venezuela'], ['PE', '+51', 'Perú', 'Peru'], ['AR', '+54', 'Argentina', 'Argentina'],
  ['CL', '+56', 'Chile', 'Chile'], ['ES', '+34', 'España', 'Spain'], ['IT', '+39', 'Italia', 'Italy'],
  ['DE', '+49', 'Alemania', 'Germany'], ['FR', '+33', 'Francia', 'France'], ['GB', '+44', 'Reino Unido', 'United Kingdom'],
]

const fmtDur = (m, l) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`)
export const duration = fmtDur

export const T = {
  es: {
    lang: 'es', locale: 'es_SV', hreflang: 'es-SV', path: '/', other: '/en/', otherLabel: 'EN', otherName: 'English',
    title: 'Dental Gert | Clínica dental en Colonia Médica, San Salvador',
    desc: 'Clínica dental en Colonia Médica, San Salvador: diagnóstico, limpiezas, rellenos, endodoncias, extracciones, cordales y blanqueamiento. Agenda en línea.',
    skip: 'Saltar al contenido',
    nav: [['#servicios', 'Servicios'], ['#quienes-somos', 'Quiénes somos'], ['#contacto', 'Contáctanos']],
    cta: 'Agenda tu cita',
    menuOpen: 'Abrir menú', menuClose: 'Cerrar menú', theme: 'Cambiar entre modo claro y oscuro', langSwitch: 'Cambiar idioma a inglés',
    hero: {
      eyebrow: 'Clínica dental · Colonia Médica, San Salvador',
      h1: 'Tu clínica dental en Colonia Médica, San Salvador',
      lead: 'Atención odontológica cercana y personalizada para toda la familia. Elige tu servicio, fecha y hora: tu cita queda confirmada en menos de un minuto.',
      wa: 'Escríbenos por WhatsApp',
      trust: ['Más de 6 años cuidando sonrisas', 'Atención para toda la familia', 'Materiales de calidad'],
      open: 'Abierto ahora', closed: 'Cerrado ahora', closes: 'cierra', opens: 'abre',
      photoAlt: 'Consultorio de Dental Gert en Colonia Médica',
    },
    bk: {
      title: 'Agenda tu cita', close: 'Cerrar formulario',
      steps: ['Servicio', 'Fecha', 'Hora', 'Tus datos'],
      service: 'Servicio', servicePh: 'Elige un servicio',
      date: 'Fecha', datePh: 'Elige una fecha', prev: 'Mes anterior', next: 'Mes siguiente',
      weekdays: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
      time: 'Hora', timePh: 'Elige una hora', morning: 'Mañana', afternoon: 'Tarde',
      noSlots: 'No quedan horarios este día. Prueba otra fecha.', pickDateFirst: 'Primero elige una fecha en el calendario.', loading: 'Consultando horarios…',
      residence: '¿Dónde resides?', national: 'Salvadoreño o residente', foreign: 'Extranjero',
      nombres: 'Nombres', apellidos: 'Apellidos', telefono: 'Número de teléfono', dui: 'DUI', duiPh: '00000000-0',
      pais: 'País', paisPh: 'Elige tu país', pasaporte: 'Número de pasaporte',
      correo: 'Correo', correoHint: 'Opcional. Recibe tu confirmación y la invitación a tu Google Calendar.',
      motivo: 'Motivo de la cita', motivoHint: 'Opcional. Cuéntanos brevemente qué sientes.',
      optional: 'opcional',
      consent: 'Acepto que Dental Gert use mis datos para gestionar mi cita, según la <a href="/privacidad/">política de privacidad</a>.',
      submit: 'Confirmar mi cita', sending: 'Confirmando…',
      noscript: 'Para agendar en línea activa JavaScript, o escríbenos por WhatsApp al 7739 0440.',
      err: {
        service: 'Elige el servicio que necesitas.', date: 'Elige una fecha disponible.', time: 'Elige una hora disponible.',
        nombres: 'Escribe tus nombres.', apellidos: 'Escribe tus apellidos.',
        telefono: 'Revisa tu número: 8 dígitos que empiezan con 2, 6 o 7.', telefonoIntl: 'Revisa tu número con el código de tu país.',
        dui: 'Revisa tu DUI: 8 dígitos, guion y dígito verificador.', pasaporte: 'Revisa tu número de pasaporte.', pais: 'Elige tu país.',
        correo: 'Revisa tu correo, por ejemplo nombre@gmail.com.', consentimiento: 'Necesitamos tu autorización para agendar.',
        slot_taken: 'Esa hora acaba de reservarse. Elige otra, tus datos siguen aquí.', captcha: 'No pudimos verificar el envío. Inténtalo de nuevo.',
        server: 'Algo falló de nuestro lado. Inténtalo de nuevo o escríbenos por WhatsApp.', network: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
      },
      done: {
        title: '¡Tu cita está confirmada!', with: 'Te esperamos', code: 'Código de reserva',
        mailNote: 'Te enviamos la confirmación y la invitación de Google Calendar a tu correo.',
        gcal: 'Añadir a Google Calendar', ics: 'Descargar .ics', wa: 'Escribir por WhatsApp',
        change: '¿Necesitas cambiar o cancelar? Escríbenos por WhatsApp.', again: 'Agendar otra cita',
      },
    },
    services: { label: 'Servicios', h2: 'Cuidamos cada etapa de tu salud bucal', lead: 'Desde la primera revisión hasta los tratamientos especializados, con citas a tu medida.', book: 'Agendar este servicio', duration: 'Duración aprox.' },
    about: {
      label: 'Quiénes somos', h2: 'Una sonrisa saludable es parte de tu bienestar',
      body: [
        'En Dental Gert creemos que una sonrisa saludable es parte fundamental del bienestar y la confianza de cada persona. Desde nuestros inicios, nos hemos enfocado en brindar una atención odontológica integral y personalizada, procurando que cada paciente reciba un servicio de calidad y una experiencia satisfactoria.',
        'Con una trayectoria de entre 6 y 10 años de atención, trabajamos con compromiso, confianza y calidez humana, ofreciendo soluciones odontológicas para toda la familia. Nos distinguimos por el trato amable, la atención individualizada y la calidad de los materiales utilizados en nuestros procedimientos.',
        'Estamos ubicados en la Colonia Médica, San Salvador.',
      ],
      tabs: [
        ['Nuestra misión', 'Elevar el bienestar de la comunidad mediante una atención odontológica personalizada y de excelencia. Nos enfocamos en la detección temprana de patologías y en la educación sobre hábitos de higiene oral. A través de tratamientos y rehabilitaciones especializadas, buscamos aliviar el dolor, recuperar la funcionalidad bucal y favorecer una sonrisa armónica que fortalezca la confianza y el amor propio de cada paciente.'],
        ['Nuestra visión', 'Ser una clínica dental reconocida por pacientes nacionales y extranjeros, distinguiéndonos por la calidad de nuestros servicios y el compromiso con la satisfacción de quienes confían en nosotros.'],
        ['Nuestro compromiso', 'En Dental Gert, cada paciente merece una atención cercana, profesional y adaptada a sus necesidades. Nuestro compromiso es acompañarte en el cuidado de tu salud bucal para que puedas sonreír con tranquilidad y confianza.'],
      ],
      values: [['heart', 'Trato amable', 'Te escuchamos y te explicamos cada paso.'], ['user', 'Atención individualizada', 'Un plan pensado para ti, no un protocolo genérico.'], ['shield', 'Materiales de calidad', 'Procedimientos con materiales confiables y duraderos.'], ['family', 'Para toda la familia', 'Cuidamos la sonrisa de chicos y grandes.']],
    },
    faq: {
      label: 'Preguntas frecuentes', h2: 'Resolvemos tus dudas antes de tu visita',
      items: [
        ['¿Cómo agendo mi cita?', 'Elige el servicio, la fecha y la hora en el formulario de esta página y completa tus datos. Tu cita queda confirmada al instante y, si dejas tu correo, recibes la invitación en Google Calendar. También puedes escribirnos por WhatsApp al 7739 0440.'],
        ['¿Puedo cambiar o cancelar mi cita?', 'Sí. Escríbenos por WhatsApp al 7739 0440 con la mayor anticipación posible; así liberamos el horario para otro paciente.'],
        ['Tengo dolor, ¿me pueden atender pronto?', 'Escríbenos por WhatsApp contándonos qué sientes y buscamos el primer espacio disponible. En línea puedes reservar desde dos horas antes.'],
        ['¿Qué debo llevar a mi primera cita?', 'Tu DUI o pasaporte, la lista de medicamentos que tomas y, si los tienes, radiografías o informes de tratamientos anteriores. Te recomendamos llegar 10 minutos antes.'],
        ['¿Atienden a niños?', 'Sí, ofrecemos atención odontológica para toda la familia.'],
        ['¿Atienden a pacientes extranjeros?', 'Sí. En el formulario elige “Extranjero” e ingresa tu pasaporte y tu número con el código de tu país.'],
        ['¿Cuánto dura cada tratamiento?', 'Diagnóstico y limpieza dental: 25 min. Relleno: 40 min. Extracción: 30 min. Endodoncia: 1 h. Cirugía de cordales y blanqueamiento: 1 h 15 min. Son tiempos aproximados por cita.'],
        ['¿Qué formas de pago aceptan?', 'Escríbenos por WhatsApp y te confirmamos las formas de pago disponibles.'], // TODO: confirmar formas de pago
        ['¿Cuál es su horario?', 'Lunes a viernes de 8:00 a. m. a 12:00 m. d. y de 1:30 p. m. a 4:30 p. m. Sábados de 8:00 a. m. a 1:00 p. m. Domingos cerrado.'],
      ],
    },
    contact: {
      label: 'Contáctanos', h2: 'Estamos en Colonia Médica, San Salvador', lead: '¿Prefieres hablar con nosotros? Escríbenos y te ayudamos a encontrar el mejor horario.',
      wa: 'WhatsApp', phone: 'Teléfono', email: 'Correo', address: 'Dirección', addressText: 'Colonia Médica, San Salvador', route: 'Cómo llegar', map: 'Ver mapa',
      mapNote: 'El mapa de Google se carga al hacer clic.', hours: 'Horario',
      hoursRows: [['Lunes a viernes', '8:00 a. m. – 12:00 m. d.<br>1:30 p. m. – 4:30 p. m.'], ['Sábados', '8:00 a. m. – 1:00 p. m.'], ['Domingos', 'Cerrado']],
      social: 'Síguenos',
    },
    footer: { privacy: 'Política de privacidad', cookies: 'Política de cookies', cookieSettings: 'Configurar cookies', rights: 'Todos los derechos reservados.', by: 'Sitio por REM Agency' },
    totop: 'Volver arriba',
    cookies: {
      text: 'Usamos cookies necesarias para que el sitio funcione y, si lo aceptas, cookies de analítica para mejorar tu experiencia.',
      accept: 'Aceptar todas', reject: 'Solo necesarias', config: 'Configurar', save: 'Guardar preferencias',
      necessary: 'Necesarias', necessaryD: 'Tema, idioma y tus preferencias de cookies. Siempre activas.',
      analytics: 'Analítica', analyticsD: 'Google Analytics 4, para saber cómo se usa el sitio.',
      policy: 'Leer política de cookies',
    },
    legalPaths: { privacy: '/privacidad/', cookies: '/cookies/' },
  },
  en: {
    lang: 'en', locale: 'en_US', hreflang: 'en', path: '/en/', other: '/', otherLabel: 'ES', otherName: 'Español',
    title: 'Dental Gert | Dental clinic in Colonia Médica, San Salvador',
    desc: 'Dental clinic in Colonia Médica, San Salvador: check-ups, cleanings, fillings, root canals, extractions, wisdom teeth and whitening. Book online.',
    skip: 'Skip to content',
    nav: [['#servicios', 'Services'], ['#quienes-somos', 'About us'], ['#contacto', 'Contact']],
    cta: 'Book your appointment',
    menuOpen: 'Open menu', menuClose: 'Close menu', theme: 'Toggle light and dark mode', langSwitch: 'Switch language to Spanish',
    hero: {
      eyebrow: 'Dental clinic · Colonia Médica, San Salvador',
      h1: 'Your dental clinic in Colonia Médica, San Salvador',
      lead: 'Warm, personalized dental care for the whole family. Choose your service, date and time: your appointment is confirmed in under a minute.',
      wa: 'Message us on WhatsApp',
      trust: ['Over 6 years caring for smiles', 'Care for the whole family', 'Quality materials'],
      open: 'Open now', closed: 'Closed now', closes: 'closes', opens: 'opens',
      photoAlt: 'Dental Gert office in Colonia Médica',
    },
    bk: {
      title: 'Book your appointment', close: 'Close form',
      steps: ['Service', 'Date', 'Time', 'Your details'],
      service: 'Service', servicePh: 'Choose a service',
      date: 'Date', datePh: 'Choose a date', prev: 'Previous month', next: 'Next month',
      weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      time: 'Time', timePh: 'Choose a time', morning: 'Morning', afternoon: 'Afternoon',
      noSlots: 'No times left on this day. Try another date.', pickDateFirst: 'First choose a date on the calendar.', loading: 'Checking availability…',
      residence: 'Where do you live?', national: 'Salvadoran or resident', foreign: 'Foreign visitor',
      nombres: 'First names', apellidos: 'Last names', telefono: 'Phone number', dui: 'DUI', duiPh: '00000000-0',
      pais: 'Country', paisPh: 'Choose your country', pasaporte: 'Passport number',
      correo: 'Email', correoHint: 'Optional. Get your confirmation and a Google Calendar invitation.',
      motivo: 'Reason for your visit', motivoHint: 'Optional. Briefly tell us what you feel.',
      optional: 'optional',
      consent: 'I agree that Dental Gert may use my data to manage my appointment, as described in the <a href="/en/privacy/">privacy policy</a>.',
      submit: 'Confirm my appointment', sending: 'Confirming…',
      noscript: 'To book online please enable JavaScript, or message us on WhatsApp at +503 7739 0440.',
      err: {
        service: 'Choose the service you need.', date: 'Choose an available date.', time: 'Choose an available time.',
        nombres: 'Enter your first names.', apellidos: 'Enter your last names.',
        telefono: 'Check your number: 8 digits starting with 2, 6 or 7.', telefonoIntl: 'Check your number including your country code.',
        dui: 'Check your DUI: 8 digits, hyphen and check digit.', pasaporte: 'Check your passport number.', pais: 'Choose your country.',
        correo: 'Check your email, e.g. name@gmail.com.', consentimiento: 'We need your consent to book.',
        slot_taken: 'That time was just booked. Pick another one, your details are still here.', captcha: 'We couldn’t verify the request. Please try again.',
        server: 'Something went wrong on our side. Try again or message us on WhatsApp.', network: 'You seem to be offline. Check your connection and try again.',
      },
      done: {
        title: 'Your appointment is confirmed!', with: 'See you soon', code: 'Booking code',
        mailNote: 'We sent the confirmation and a Google Calendar invitation to your email.',
        gcal: 'Add to Google Calendar', ics: 'Download .ics', wa: 'Message on WhatsApp',
        change: 'Need to change or cancel? Message us on WhatsApp.', again: 'Book another appointment',
      },
    },
    services: { label: 'Services', h2: 'We care for every stage of your oral health', lead: 'From your first check-up to specialized treatments, with appointments that fit your schedule.', book: 'Book this service', duration: 'Approx. duration' },
    about: {
      label: 'About us', h2: 'A healthy smile is part of your well-being',
      body: [
        'At Dental Gert we believe a healthy smile is a fundamental part of everyone’s well-being and confidence. Since day one we have focused on comprehensive, personalized dental care, making sure every patient receives quality service and a positive experience.',
        'With 6 to 10 years of practice, we work with commitment, trust and human warmth, offering dental solutions for the whole family. We stand out for our friendly care, individual attention and the quality of the materials we use.',
        'We are located in Colonia Médica, San Salvador.',
      ],
      tabs: [
        ['Our mission', 'To raise our community’s well-being through personalized, excellent dental care. We focus on early detection and on teaching good oral hygiene habits. Through specialized treatments and rehabilitation, we aim to relieve pain, restore oral function and support a harmonious smile that strengthens each patient’s confidence and self-esteem.'],
        ['Our vision', 'To be a dental clinic recognized by local and international patients for the quality of our services and our commitment to the satisfaction of those who trust us.'],
        ['Our commitment', 'At Dental Gert, every patient deserves close, professional care adapted to their needs. Our commitment is to accompany you in caring for your oral health so you can smile with peace of mind and confidence.'],
      ],
      values: [['heart', 'Friendly care', 'We listen and explain every step.'], ['user', 'Individual attention', 'A plan designed for you, not a generic protocol.'], ['shield', 'Quality materials', 'Reliable, long-lasting materials in every procedure.'], ['family', 'For the whole family', 'We care for smiles of all ages.']],
    },
    faq: {
      label: 'FAQ', h2: 'Answers before your visit',
      items: [
        ['How do I book an appointment?', 'Choose the service, date and time in the form on this page and fill in your details. Your appointment is confirmed instantly and, if you leave your email, you get a Google Calendar invitation. You can also message us on WhatsApp at +503 7739 0440.'],
        ['Can I change or cancel my appointment?', 'Yes. Message us on WhatsApp at +503 7739 0440 as early as possible so we can offer the time to another patient.'],
        ['I’m in pain, can you see me soon?', 'Message us on WhatsApp describing how you feel and we’ll find the first available slot. Online you can book as soon as two hours ahead.'],
        ['What should I bring to my first visit?', 'Your ID or passport, a list of medications you take and, if you have them, X-rays or reports from previous treatments. Please arrive 10 minutes early.'],
        ['Do you treat children?', 'Yes, we offer dental care for the whole family.'],
        ['Do you treat international patients?', 'Yes. In the form choose “Foreign visitor” and enter your passport and phone number with your country code.'],
        ['How long does each treatment take?', 'Diagnosis and cleaning: 25 min. Filling: 40 min. Extraction: 30 min. Root canal: 1 h. Wisdom tooth surgery and whitening: 1 h 15 min. Times are approximate per visit.'],
        ['Which payment methods do you accept?', 'Message us on WhatsApp and we’ll confirm the available payment methods.'],
        ['What are your opening hours?', 'Monday to Friday 8:00 am – 12:00 pm and 1:30 pm – 4:30 pm. Saturday 8:00 am – 1:00 pm. Closed on Sundays.'],
      ],
    },
    contact: {
      label: 'Contact', h2: 'Find us in Colonia Médica, San Salvador', lead: 'Prefer to talk to us? Send us a message and we’ll help you find the best time.',
      wa: 'WhatsApp', phone: 'Phone', email: 'Email', address: 'Address', addressText: 'Colonia Médica, San Salvador, El Salvador', route: 'Get directions', map: 'Show map',
      mapNote: 'The Google map loads when you click.', hours: 'Opening hours',
      hoursRows: [['Monday – Friday', '8:00 am – 12:00 pm<br>1:30 pm – 4:30 pm'], ['Saturday', '8:00 am – 1:00 pm'], ['Sunday', 'Closed']],
      social: 'Follow us',
    },
    footer: { privacy: 'Privacy policy', cookies: 'Cookie policy', cookieSettings: 'Cookie settings', rights: 'All rights reserved.', by: 'Website by REM Agency' },
    totop: 'Back to top',
    cookies: {
      text: 'We use necessary cookies to run the site and, with your consent, analytics cookies to improve your experience.',
      accept: 'Accept all', reject: 'Necessary only', config: 'Settings', save: 'Save preferences',
      necessary: 'Necessary', necessaryD: 'Theme, language and your cookie choices. Always on.',
      analytics: 'Analytics', analyticsD: 'Google Analytics 4, to understand how the site is used.',
      policy: 'Read cookie policy',
    },
    legalPaths: { privacy: '/en/privacy/', cookies: '/en/cookies/' },
  },
}

// Páginas legales. TODO: revisión legal por parte de la clínica.
export const LEGAL = {
  privacy: {
    es: { path: '/privacidad/', title: 'Política de privacidad | Dental Gert', h1: 'Política de privacidad', html: `
<p>Dental Gert ("la clínica"), ubicada en Colonia Médica, San Salvador, es responsable de los datos personales que nos compartes al agendar una cita en este sitio. Contacto: <a href="mailto:dentalgert@gmail.com">dentalgert@gmail.com</a> · 7739 0440.</p>
<h2>Qué datos recogemos</h2><p>Nombres, apellidos, número de teléfono, DUI (o pasaporte y país si eres extranjero), correo electrónico y motivo de la cita (opcionales), además del servicio, la fecha y la hora elegidos.</p>
<h2>Para qué los usamos</h2><p>Únicamente para agendar, confirmar y dar seguimiento a tu cita, identificarte como paciente y comunicarnos contigo. No vendemos ni cedemos tus datos con fines comerciales.</p>
<h2>Dónde se guardan</h2><p>Tu cita se registra en el Google Calendar y en hojas de cálculo de Google Drive de la clínica, con una copia de respaldo administrada por REM Agency (remagencysv@gmail.com), encargada técnica del sitio. El sistema de reservas (Cloudflare) borra tus datos personales 30 días después de la cita.</p>
<h2>Tus derechos</h2><p>Puedes pedir acceso, corrección o eliminación de tus datos escribiendo a <a href="mailto:dentalgert@gmail.com">dentalgert@gmail.com</a>.</p>
<h2>Base legal</h2><p>Tratamos tus datos con tu consentimiento, que otorgas al marcar la casilla del formulario, conforme a la normativa salvadoreña de protección de datos personales.</p>` },
    en: { path: '/en/privacy/', title: 'Privacy policy | Dental Gert', h1: 'Privacy policy', html: `
<p>Dental Gert ("the clinic"), located in Colonia Médica, San Salvador, is responsible for the personal data you share when booking on this site. Contact: <a href="mailto:dentalgert@gmail.com">dentalgert@gmail.com</a> · +503 7739 0440.</p>
<h2>Data we collect</h2><p>First and last names, phone number, DUI (or passport and country for international patients), email and reason for visit (optional), plus the chosen service, date and time.</p>
<h2>How we use it</h2><p>Only to schedule, confirm and follow up on your appointment, identify you as a patient and contact you. We never sell or share your data for marketing.</p>
<h2>Where it is stored</h2><p>Your appointment is recorded in the clinic’s Google Calendar and Google Drive spreadsheets, with a backup managed by REM Agency (remagencysv@gmail.com), the site’s technical provider. The booking system (Cloudflare) deletes your personal data 30 days after the appointment.</p>
<h2>Your rights</h2><p>You can request access, correction or deletion of your data by writing to <a href="mailto:dentalgert@gmail.com">dentalgert@gmail.com</a>.</p>
<h2>Legal basis</h2><p>We process your data with the consent you give by ticking the box in the form, in accordance with Salvadoran personal data protection regulations.</p>` },
  },
  cookies: {
    es: { path: '/cookies/', title: 'Política de cookies | Dental Gert', h1: 'Política de cookies', html: `
<p>Este sitio usa almacenamiento local y cookies en tu navegador.</p>
<h2>Necesarias</h2><p>Guardan tu tema (claro u oscuro), tu idioma y tus preferencias de cookies. También usamos Cloudflare Turnstile para proteger el formulario contra spam. No se pueden desactivar.</p>
<h2>Analítica (opcional)</h2><p>Google Analytics 4 solo se carga si lo aceptas, y nos ayuda a saber cuántas personas visitan el sitio y agendan citas. Usamos además Cloudflare Web Analytics, que no usa cookies ni identifica a las personas.</p>
<h2>Cambiar tu elección</h2><p>Puedes cambiar tus preferencias en cualquier momento desde "Configurar cookies" en el pie de página.</p>` },
    en: { path: '/en/cookies/', title: 'Cookie policy | Dental Gert', h1: 'Cookie policy', html: `
<p>This site uses local storage and cookies in your browser.</p>
<h2>Necessary</h2><p>They store your theme (light or dark), language and cookie choices. We also use Cloudflare Turnstile to protect the form from spam. They can’t be turned off.</p>
<h2>Analytics (optional)</h2><p>Google Analytics 4 only loads with your consent and helps us understand how many people visit and book. We also use Cloudflare Web Analytics, which uses no cookies and doesn’t identify people.</p>
<h2>Changing your choice</h2><p>You can change your preferences anytime from "Cookie settings" in the footer.</p>` },
  },
}
