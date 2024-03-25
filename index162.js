const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const puppeteer = require('puppeteer');
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Especifica la ruta del ejecutable de Chrome
  },
});

const semaphore = require('semaphore');

const queueSemaphore = semaphore(1); // Inicializa el semáforo con un recuento de 1, lo que significa acceso exclusivo

// Resto del código...

async function handleIncomingMessage(message) {
  const senderId = message.from;
  const userBlocked = blockedUsers[senderId];

  if (userBlocked) {
    console.log(`No se responderá al usuario ${senderId}.`);
    return; // No responder al usuario bloqueado
  }

  messageCount++;

  if (messageCount > peakThreshold) {
    lastMessageDuringPeak = message.body; // Almacena el último mensaje durante el pico
    if (!isQueueProcessing) {
      processMessageQueue();
    }
  } else {
    console.log(message.body);
    const matchedResponse = findSequence(message.body);

    if (matchedResponse) {
      if (matchedResponse.responses) {
        const randomResponse = getRandomResponse(matchedResponse.responses);
        await sendDelayedMessage(message.from, randomResponse);
      } else if (matchedResponse.sequences) {
        const sequences = matchedResponse.sequences;
        await sendSequenceMessages(message.from, sequences);
      }

      if (matchedResponse.blockUser) {
        blockedUsers[senderId] = true; // Bloquear al usuario
        console.log(`Usuario ${senderId} bloqueado.`);
      }
    } else {
      const randomResponse = getRandomResponse(randomResponses);
      await sendDelayedMessage(message.from, randomResponse);
    }
  }

  saveConversation(message); // Guardar la conversación

  setTimeout(() => {
    if (messageCount > peakThreshold && lastMessageDuringPeak !== null) {
      queueSemaphore.take(function() { // Adquirir el semáforo antes de trabajar en la cola
        messageQueue.push({ chatId: message.from, message: lastMessageDuringPeak });
        queueSemaphore.leave(); // Liberar el semáforo después de terminar
        lastMessageDuringPeak = null; // Reiniciar la variable para el próximo pico si ocurre
        if (!isQueueProcessing) {
          processMessageQueue();
        }
      });
    }
    messageCount = 0; // Reiniciar el contador de mensajes
  }, peakDuration);
}

async function processMessageQueue() {
  if (messageQueue.length > 0) {
    queueSemaphore.take(function() { // Adquirir el semáforo antes de trabajar en la cola
      const nextMessage = messageQueue.shift(); // Obtiene y elimina el próximo mensaje de la cola
      queueSemaphore.leave(); // Liberar el semáforo después de terminar
      sendDelayedMessage(nextMessage.chatId, nextMessage.message);
    });
  }
}



const fs = require('fs');

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Conexión exitosa nenes');
});

client.on('authFailure', () => {
  console.log('¡Usuario bloqueado!');
  sendAlert('¡Usuario bloqueado!'); // Enviar alerta cuando se bloquee la cuenta
});

const blockedUsers = {}; // Almacena los usuarios bloqueados

// Función para eliminar tildes de las palabras
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Palabras clave con respuestas aleatorias y secuencias de mensajes
const keywordResponses = [
      {
    keywords: ["hola preciosa", "hola bb", "hola corazon", "hola princesa", "hola amor", "hola princesa", "hola bb", "hola preciosa", "hola reina", "hola como", "hola reina", "hola soy", "hola cariño", "hl","hola","hola","hola","noches", "saludos", "hla"],
    responses: ['Hola Bello❤️🔥.', 'Hola corazón', 'Hola❤️.','Hola☺️.', 'Hola Rey','Hola papi'],
  },
    {
    keywords: ["feliz año", "año nuevo", "2024", "Feliz Año", "año nuevo"],
    responses: ['Feliz año nuevo 2024❤️', 'Feliz año mi vida Hermoso', '2024 lleno de bendiciones ✨️','❤️ Feliz Año, Amor❤️'],
  },
  {
    keywords: ["buenos dias", "feliz mañana","buen dia"],
    responses: ['Hola buenos días amor como amaneciste❤️.', 'Hola buenos dias amor❤️.', 'Hola feliz mañana🔥.','Hola Buenos dias💋.','Hola Rey','Hola papi'],
  },
    {
    keywords: ["feliz año", "año nuevo", "2024", "Feliz Año", "año nuevo"],
    responses: ['Feliz año nuevo 2024❤️', 'Feliz año mi vida Hermoso', '2024 lleno de bendiciones ✨️','❤️ Feliz Año, Amor❤️'],
  },
  {
    keywords: ["buena noche", "buenas noches", "feliz noche", "feliz noche"],
    responses: ['Buenas noches amor💋.', 'Feliz noche amor💋.', 'Buenas noches Rey','Buenas noches☺️.'],
  },
  {
    keywords: ["buenas tardes", "buena tarde", "feliz tarde", "feliz noche"],
    responses: ['Buenas tardes amor💋.', 'Feliz tarde amor💋.', 'Feliz tarde Rey','Buena tarde amor☺️.'],
  },
  {
    keywords: ["Voy mañana", "vemos mañana", "ver.mañana", "Tocará mañana", "Listo mañana", "mañana te coloco", "dije q mañana", "Sería mañana", "te dije mañana", "consinaría mañana", "Mañana te mando", "MAÑANA LE ENVIO", "mañana le envio", "Mañana te envío", "Mañana amor sin falta", "Mañana recargo", "toca mañana", "Mañana puedo", "mañana ahora no", "anda mañana", "mañana te los puedo", "mañana te envío", "vemos mañana", "los paso mañana", "mañana boy", "en la mañana", "mañana si", "Boy mañana", "Para mañana", "mañana te guiro", "mañana te los", "mañana si puedo", "Si pero mañana", "mañana y te los", "Mañana nos vemos", "Mañana cuando", "Mañana se lo", "mañana apenas", "no vemos mañana", "pero mañana", "Mañana se lo", "mañana te pongo", "Toca mañana", "envío mañana", "Pero mañana", "mañana te lo", "pero mañana", "lo mando mañana", "yo mañana le", "envío mañana", "Mañana temprano", "mide mañana", "Mañana te coloco", "será mañana", "Mañana te los pongo", "Mañana te los envío", "Mañana te giro", "Mañana salgo", "puedo mañana", "mañana se los", "tocaría mañana", "te enbio mañana", "doy mañana", "en la mañana", "tu casa mañana", "En la mañana", "si quieres mañana", "puedes mañana", "amor mañana", "mañana te los envío", "te los doy mañana", "mañana te doy", "Mañana amorsito", "mañana te consigno", "Toca mañana", "Mañana bb", "Mañana te mando", "mañana te envío", "mañana si puedo", "Para ir mañana", "será hasta mañana", "culiar mañana", "mañana le pongo", "mando mañana", "Si pero mañana"],
    responses: ['Enviame ya amor🔥💯.', 'Espero me cumplas que yo te dare lo tuyo amor', 'ahi que esperar amor','si me cumples yo te dare a ti lo que tu quieras amor','Yo con unas ganas que me cumplas amor🔥💯','Seria muy rico si lo hisieras ya amor','Tu si lo haces te consentiria mucho mi amor❤.','Yo aqui con unas ganas que me envies para hacer cosas ricas amor','Seria rico si lo hisieras ya mismo amor','podemos hacerlo rico amor','Mejor ahora que mañana amor','hagalo ahora seria muy rico amor','yo toda desnuda con unas ganas si me envias amor','Quiero hacerte muchas cosas ricas cuando me envies amor','yo con unas ganas complacerte amor🥵','Seria rico si lo haces amor.','Amor no sabes todos los deseos que tengo de venirme si me envias amor','amor yo puedo complacerte si me haces eso amor','yo quiero ser tu mujer si lo haces lo sere amor','Con unas ganas de meterlo en mi culito si me envias mi amor'],
  },
  {
    keywords: ["Cuando será","cuando nos","Quieres venir","cuando nos","cuando nos","aqui le doy","aca le doy","cuando","Va venir","cuando","Ven a mi casa","si vienes","vas a venir","vas a venir?","cuando","donde yo vivo","un taxi","mi casa","Venga","Venga asta","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","Venga","venga pues","Venga","y me visita","mi visita","Vienes","puedo visitar","encontrarnos","cuando te puedo","Cuando sera", "cuando vienes", "un encuentro", "encuentro","nos encontramos", "Cuando nos vemos","pero cuando","y vamos","vamos a","Venga","en vivo"],
    responses: ['amor me envias primero y me confirmas cuando puedes que yo estare para ti hermoso', 'me envias a mi nequi y nos colocamos de acuerdo bien amor', 'me envias a mi nequi para confirmar y nos colocamos de acuerdo cuando vamos a estar juntos los dos amor','La unica es que me envies para confirmar hablamos bien cuando nos podemos ver amor'],
  },
  {
    keywords: ["Chao", "chaooo","Chao","Chao","Chaoo", "adios","mañana hablamos", "voy a descansar", "hasta pronto","voy a dormir", "Chaito"],
    responses: ['Chao Besos Amor¡¡🔥💋💋💋💋💋💋💋💋💋', 'Chao Besitos Hermoso🔥♥💯💯💯💯💯💯💯💯💯', 'Espero y la pases rico Chao amor🙋‍♀️❤️🔥','Chao Besoss Preciosooo💓💯💯💯','Besossssss💓💯💯💯💯💯💯💯','Chao amor💋💯','Bueno chao que pases soñando conmigo Besos Amor🔥♥💤💤💤💤💤💤💤'],
  },
  {
    keywords: ["como estas","como vas", "tal", "buenos dias","buenas noches","tal","Como estas?", "muy bien y usted"],
    responses: ['Estoy, bien gracias', 'Bastante bien.', 'Muy bien Gracias', 'Bien, gracias.', 'Estoy de maravilla, Amor❤️.'],
  },

  {
    keywords: ["donde ests","donde vive","dirección","Veamos en tu casa","donde estas","dime donde","donde eres","de donde eres","dónde vives","dime dónde vives","donde es","vives en","donde eres","donde esta","donde eres?","donde vives","donde vives?","donde andas", "parte","en que parte","parte te encuentras","direccion","parte","parte","parte","parte","parte","parte","parte","estas viviendo","ciudad","que lado", "lugar", "pais", "dnde estas", "donde te ecuentras", "te ecuentras","que barrio","barrio eres","ubicación","barrio","tu ubicación","donde estas","localidad", "país","tu donde vives","país","país", "desde donde","desde donde","que parte", "parte de","parte eres","sitio","estas en bogota","direcion"],
    responses: ['Soy Venezolana y estoy aquí en Bogota en la 127 con avenida villas en frente de bulevar niza.'],
  },


  {
    keywords: ["reina", "atractiva", "guapa", "princesa","belleza", "amor", "bb", "linda", "hermosa", "preciosa", "te amo", "amo", "adoro", "te quiero", "belleza", "bellezima", "belleza","encantadora", "fascinante", "atractiva", "hermosa", "maravillosa", "carismática", "espléndida", "elegante", "agradable", "deslumbrante", "deslumbradora", "encantadoramente", "atractivamente", "fascinantemente", "guapa", "encanto", "adorable", "adoracion", "cariñosa", "amorosa"],
    responses: ['Gracias amor', 'Enserio', 'Eso siii todo natural amor', 'De verdad q eres super lindo',  'Tu eres tan lindo de verdad', 'tu me gustas mucho', 'Gracias amor 💞', 'Gracias mí corazón', 'Y eso q no me conoces','Es usted muy amable.', 'Gracias rey', 'Gracias por ser tan bello', 'Gracias mí amor', 'Gracias bb', 'Usted también es hermoso mi amor', 'Ya bello 🤩', 'Gracias 🥴', 'Bello mi amor', 'Hay BB eres la mejor persona 💗', 'Tú eres perfecto', 'Todo hermoso mi BB ❣️', 'Bello 🤩 meeeee encantaaaaaas', '❤️ tan bello', 'Gracias rey', 'Gracias cielo ❤️', 'Hay amor que lindo 😻', 'Gracias mi vida', 'Tan lindo me agradas mucho', 'Hay cielo que lindo', 'Besos mi amor', 'Hay amor tan lindo 😍', 'Te mando un beso y un abrazo fuerte', 'Tan bello mi amor', 'Gracias me encabtas amor', 'Es usted un amor', 'Te amo más mi bb', 'Yo a usted lo quiero mucho mucho', 'Siii Loo seee mi rey', 'Y gracias mi  amor 😍😍❤️💘', 'Y gracias', 'Te amooooo como loca', 'Aww te amo 😍😍', 'Te amo', 'Si de algo pudes estar seguro es que yo quiero venirme Amor👅', 'Tii amo💘', '❤️💘 yo lo amo más', 'Yo también te quiero 😘', 'quiero que me cojas amor💖'],
  },

  {
    keywords: ["las enviaste","Ya me enviastes esos","las enviaste","las enviaste","Eso ya lo tengo","mensajes repetitivos","repetitivos","repetidos", "Manda mas","esos ya los vi", "muchas veces", "Ya me enviaste","ya las enviastes", "Ya me envio","foto de ahorita ","ya los tengo","Ya esos los vi","pides","fotos diferentes","ya me envio","con lo mismo", "Dejame verte", "pides", "pides","son los mismos","ya me las envío","envia lo mismo","mismos","mismos","mismos","mismos","los mismos", "la bloqueo", "ya me envio esas", "mismos","mismos","mismos","mismos","mismos","no lo mismo","lo mismo","diferentes","diferentes","diferentes","enviastes","repites","repite",'muestrame'
],
    responses: ['encantada de enviarte videos largos todo el mes como tu quieras una vez me envies a mi nequi 3164909368 amor','Tu sabes que me enviasa mi nequi 3164909368 y are todos los videos que tu quieras todo el mes amor ','amor tu me envias a mi nequi 3164909368 yo te hago los videos como tu quieras todo el mes amor','si me envia yo hago todos los videos que tu quieras todo el mes igual me gusta hacerlo amor','yo puedo hacerte muchos videos como tu los quieras todo el mes solo me envies a mi nequi 3164909368 amor','yo encantada de hacerte todos los videos que quieras si me enviasa a mi nequi 3164909368 amor','lo siento pero si tu me envias a mi nequi 3164909368 yo te hagoo todos los videos que tu quieras todo el mes amor','yo te hago videos de ahorita todos los que tu quieras si me envias a mi nequi 3164909368 amor','si quieres que te envié diferentes me envias amor y tenemos video llamadas y después cojemos amor'],
  },

    {
      keywords: ["mamar", "cuca", "comer", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grande","masturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito", "meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito","meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas ", "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrar", "comerte", "verga", "pechospene", "culito", "meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja","cenos"],
      responses: ['Así me encanta el huevo rico 🤤 Ami me gusta mucho', 'Cree q con esas labias de q me va hacer feliz', 'Q Rico Eso Me Encanta', 'Ay No Se Que Decir🤭', 'Super rico❤️❤️', 'divino papasito', 'Uf, qué rico. Me encantaría. 😋😋😋😋', 'Ayyy Q RiKo sii', 'Qué delicia 😘😘❤😍😍😍', 'Dime que me harías', 'Q rico seriaa amor 😍😍❤️🤤😈', 'Huuuuy q ricoo Mii bb', 'mee encantaa q ricooo mi amor', '😋😋😋q riicooo me encantaaaaaa', 'yaaa quiroo sentirlooo', 'Aaaaahh uufhssss q ricoooo', 'Riiicooo 😋😋👅', 'Ricooo riicoo ricoooo', 'Uufhsss dioossssss q ricoooooo 😍😍😍😍😍😈😈😈', 'q me deje las piernas temblando sexo rudo contigo amor seria perfectoo', 'Huy q riiicooo uffhsss', 'Quierooo esooo paraaa mi, sentirloo dentro de miii😍😍😍😍', 'Q ricooo sería super😈😋😋😋', 'Mee encantaria sentirlo dentro d mii 😈😋😋', '😋😋😋 seriaaaa ricooo', 'yoo quierooo 😈😈', 'sii Bebé y me mandas videos yoo quiero ver 😋😋😋😈😍😍', 'Waooo q ricoooo bb', 'Q ricooo bb meee encantaaas', 'huy q ricoo bb', 'Uf q ricooooooo mee encantaria tu penee😋😋😋😋', '😋😋😋 ufsss ricoooo', 'Pero no me mandas', '😮😮😋😋😋😈q riiicoooo mee encantaaa'],
    },
  {
    keywords: ["real","hp","ya envie los", "sijin", "fiscalía", "investigador","falsa","ya te mande los","bulla","no me interesa", "extorcion", "no saliste con nada","no mando plata", "falsa", "robadas", "robe", "no envio dinero", "no envío dinero", "no envío dinero", "no pago", "ya mande la plata","no soy de pagar","falsa","grabacion","no creo","sin nada","doy en efectivo","no tengo dinero","que eres tu","estoy pelado","en canado","no ver no ago","no te voy a enviar","no voy a pagar","no te voy","tu cuento","la misma persona","problemas","hay se los envie","ya se los puse","zorra","en la carcel","compu","no tengo ahora dinero","compu","no te voy a enviar","no te voy mandar","Ya  te envié","Ya te envié", "Aller te envie","enviame plata tu", "maldita", "compu", "no mando plata", "no te envio nada", "no tengo el dinero","no insistas", "no te creo", "compu", "compu", "compu", "compu","compu","compu","compu","compu","compu","compu","compu","compu","compu","no te voy a mandar","no mando plata","no me interesa","seas real","estoy preso","preso","no caigo", "diciendo mentiras", "mentiras", "robar a otro","a robar", "no eres la misma", "pura mentira",  "no me interesa", "estoy en la carcel", "la carcel", "estafar","engañar","bloqueo","la bloqueo", "no tengo plata","pero no tengo plata", "investigacion","bobo","Ya te envié", "ya se los envie","ya le envie la plata","real","real","Ya se los envie","policia","fraude","mentira","no eres tu",  "carcel", "maldita", "mentirosa", "bloquear","estafa","real","robo","ladrona","real","cai","denunciar","estafadora","maquina","Maquina","computadora","una computadora","no real","no cumples","no real","robo","ladrona","no real","no eres Real","falso","me robo","publicar","le voy a decir","ya te envie", "Ya te envié","envié el dinero","envié los 20","robaste","me robaste","envié la plata","le envié la plata","te envié plata","no eres real","listo ya te envie","te consine","te mande","malparida","ladrones","que carcel","robot", "banco","mentirosa", "robo","no real","maquina","Ya te gire","Ya yo te mandé la plata","ya te jire","ya le mnde","selo puse", "revise","revisa","te pague","te cancele","le voy a decir","fiscalia","robando","ya te deposite","ya deposite","ya te mande el dinero","real","ya le page","te transferi","mira el recibo", "ya se los mande","ya te envie","ya te gire", "yo ya le mande", "yo ya le mande", "yo ya le mande", "yo ya le mande", "ya te los gire", "te envie la plata"],
    blockUser: true, // Esta palabra clave bloqueará al usuario
  },
  // Agrega el resto de tus definiciones de palabras clave aquí
      {
  keywords: ['rico','cosota','videito', 'rica','rika','riko', 'provocativa', 'ricota', 'lechita', 'desnuda','video', 'videos', 'mandame'],
  sequences: [
    [
      ['Tenía pensado que si me enviabas algo te enviaría algo rico', 6000],
      ['Enviame 20Mil a mi nequi 3164909368 te are los videos que tu quieras amor', 6000],
      ['enviar video video1.mp4', 6000],
      ['enviar video video2.mp4', 6000],
      ['enviar video video3.mp4', 6000],
      ['Enviame y hacemos video llamadas todo el mes amor', 6000],
    ],
    [
      ['Si me envía la plata ahora le acepto llamadas para que me veas', 6000],
      ['Envia 20Mil a mi nequi 3164909368 seria mas que suficiente cariño❤️', 6000],
      ['enviar video anal.mp4', 6000],
      ['enviar video cola3.mp4', 6000],
      ['enviar video polvo.mp4', 6000],
      ['Cuando me envíes algo yo te envío muchas cosas rica', 6000],

    ],
        [
      ['Amor enviame 20Mil a mi nequi 3164909368 y te enseño que es placer todo el mes amor', 6000],
      ['enviar video video1.mp4', 6000],
      ['enviar video video2.mp4', 6000],
      ['enviar video video3.mp4', 6000],
      ['yo si te paro Rico todo el mes amor', 6000],

    ],
      [
      ['amor enviame 20mil a mi nequi 3164909368 que tu me dises como quieres que te haga los videos que yo te complasco amor', 6000],
      ['enviar video anal.mp4', 6000],
      ['enviar video cola3.mp4', 6000],
      ['enviar video polvo.mp4', 6000],
      ['Me puedes video llamar todo el mes a mi me gusta venirme mucho amor', 6000],
    ],
    [
      ['Enviame 20Mil a mi nequi 3164909368 que yo le hago lo que usted quiera a mi me exita mucho sentirme deseada amor', 6000],
      ['enviar video veterna.mp4', 6000],
      ['enviar video a2.mp4', 6000],
      ['enviar video 4a.mp4', 6000],
      ['puedes verme como me doy en llamada hasta venirme amor', 6000],

    ],
        [
      ['enviame a mi nequi 3164909368 20Mil y te hago los videos mas ricos que puedas ver amor', 6000],
      ['enviar video veterna.mp4', 6000],
      ['enviar video a3.mp4', 6000],
      ['enviar video febrero.mp4', 6000],
      ['yo si hago que se te pare duro amor', 6000],

    ],
    [
      ['Enviame 20Mil a mi nequi 3164909368 que yo lo complasco con lo que usted me diga amor', 6000],
      ['enviar video toche.mp4', 6000],
      ['enviar imagen lana2.jpg', 6000],
      ['enviar imagen lana3.jpg', 6000],
      ['enviar video lana4.mp4', 6000],
      ['puedes verme en video llamada hasta todo el mes amor', 6000],

    ],
  ],
},
{
  keywords: ['dinero','no uso nequi','yo no tengo nequi','no tengo plata en nequi','no tengo cuenta en nequi', 'no tengo el nequi','no tengo nequi','no tengo nequi','nequi', 'plata','neki','en efetivo','plata','plata','plata','plata','plata','plata','plata','plata', 'pagen', 'efetivo', 'pago','daviplata','bancolombia', 'davi plata','numero', 'funciona', 'pagado', 'neqi', 'no tengo'],
  sequences: [
    [
      ['solo vas a una tienda donde tengan nequi me envias 20Mil a mi nequi 3164909368 yo are caso en todo mi Amor.', 6000],
      ['enviar video veterna.mp4', 6000],
      ['enviar imagen entra5.jpg', 6000],
      ['enviar imagen a2.jpg', 6000],
      ['Quiero complacerte todo el mes amor', 6000],
    ],
    [
      ['Solo vas a una tienda y enviarme 20mil a mi nequi 3164909368 Con eso ganas tu Amor..', 6000],
      ['enviar video b12.mp4', 6000],
      ['enviar imagen b11.jpg', 6000],
      ['enviar imagen b15.jpg', 6000],
      ['No vallas a mostrar las fotos a nadie porque tengo dos niñas', 6000],
    ],
  ],
},
// Agregar más palabras clave y sus respuestas/secuencias asociadas aquí
{
  keywords: ['foto', 'fotos','fotico','foticos'],
  sequences: [
    [
      ['Te voy a regalar estas amor', 6000],
      ['enviar imagen uno1.jpg', 6000],
      ['enviar imagen piko1.jpg', 6000],
      ['enviar video video1.mp4', 6000],
    ],
    [
      ['Esta bien amor🔥', 6000],
      ['enviar imagen pelis5.jpg', 6000],
      ['enviar imagen pelis2.jpg', 6000],
      ['enviar imagen pelis4.jpg', 6000],
    ],
    [
      ['Bien amor💯🔥', 6000],
      ['enviar imagen pelis6.jpg', 6000],
      ['enviar imagen pelis3.jpg', 6000],
      ['enviar imagen pelis2.jpg', 6000],
    ],
     [
      ['Si rico amor🔥', 6000],
      ['enviar imagen pelis1.jpg', 6000],
      ['enviar imagen pelis7.jpg', 6000],
      ['enviar imagen paka1.jpg', 6000],
     ],
    [
      ['Si Amor🔥.', 6000],
      ['enviar video febrero.mp4', 6000],
      ['enviar imagen amor.jpg', 6000],
      ['enviar imagen amor2.jpg', 6000],
    ],
  ],
},
{
  keywords: ["quien vives","vives con alguien","vives sola","Vives sola","soltera", "comprometida", "casada", "hijos","marido", "novio","quien vives","quién vives","con quien vives","con quien vives","eres soltera",  "esposo","tienes esposo","Conkien vives", "pareja", "Vives sola?"],
  sequences: [
    [
      ['enviar video papa.ogg', 6000],
      ['enviar video tienepareja.ogg', 6000],
    ],
    [
      ['tengo varios años separada del papá de mis hijas,Soy mamá de 2 niñas y solo me he dedicado a ellas el 100 %', 6000],
      ['enviar video tienepareja2.ogg', 6000],
    ],
  ],
},
    {
  keywords: ["hago", "deliciosa", "que haces", "aces","haces", "que hace","ases", "asiendo","aciendo","haciendo"],
  sequences: [
    [
      ['Soy muy adicta al sexo con ganas de venirme amor', 6000],
      ['enviar imagen 007.jpg', 6000],
      ['enviar video toche.mp4', 6000],
    ],
    [
      ['Yo aqui sola con unas ganas de venirme amor', 6000],
      ['enviar imagen vivo1.jpg', 6000],
      ['enviar imagen vivo2.jpg', 6000],
      ['enviar video  amor1.mp4', 6000],
    ],
        [
      ['yo tenia unas ganas de venirme enviame cosas de sexo amor.', 6000],
      ['enviar imagen paka.jpg', 6000],
      ['enviar imagen lana2.jpg', 6000],
      ['enviar video  lana4.mp4', 6000],
    ],
  ],
},

{
  keywords: ['llamada','me contesta','Te llamo','videollamada','llamando','yamada','Llamada','no contesta', 'llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamando','llamo','te llamo','llamanda','contesta','contestas','llama',"yamarte","contestame"],
  sequences: [
    [
      ['Cuando me pases 20Mil a mi nequi 3164909368 me puedes llamar estoy desnuda con unas ganas amor', 6000],
      ['enviar imagen piko2.jpg', 6000],
      ['enviar imagen entra3.jpg', 6000],
      ['enviar imagen 007.jpg', 6000],
      ['te mando videos y aremos lo que tu quieras amor', 6000],
      ],
    [
      ['Si me pasa 20Mil a mi nequi 3164909368 yo ando desnuda y me puedes llamar todo el mes que despues culiamos amor', 6000],
      ['enviar imagen cero.jpg', 6000],
      ['enviar imagen uno.jpg', 6000],
      ['enviar imagen dos.jpg', 6000],
      ['enviar video febrero.mp4', 6000],
      ['yo are lo que tú digas amor', 6000],
      ],
    [
      ['Envíame 20Mil a mi nequi 3164909368 que yo ando desnuda y te vídeo llamo todito el mes y vez como me meto un consolador en el culito amor mio', 6000],
      ['enviar video lana.mp4', 6000],
      ['enviar imagen lana2.jpg', 6000],
      ['enviar imagen lana3.jpg', 6000],
      ['enviar video lana4.mp4', 6000],
    ],
  ],
},
{
  keywords: ['presencial','persona','en persona','cuanto necesitas','cuanto','para follar','personal mente','Cuanto bale','Cuanto vale','cuanto cobra','personal','personal','personal','personal',"y cuanto", "pides", "cuesta", "Que vale","rato","un rato","el rato","valor", "valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","valor","pides"],
  sequences: [
    [
      ['si puedes venir a culiarme con 50Mil amor primero tienes que enviarme 20Mil a mi nequi 3164909368 para confirmar invitarte y me das por el culitoo y te lo mamo rico en mi apartamento Amor', 6000],
      ['enviar imagen apk.jpg', 6000],
      ['enviar imagen apk1.jpg', 6000],
      ['enviar imagen a1.jpg', 6000],
      ],
    [
      ['Si me puedes venir con 50Mil cojerme pero primero tienes que enviarme 20Mil a mi nequi 3164909368 para confirmar e invitarte a mi casa a culiar y me des por el culo y te lo mame rico mi amor', 6000],
      ['enviar imagen 007.jpg', 6000],
      ['enviar video bbl.mp4', 6000],
    ],
  ],
},
{
  keywords: ["audio","envieme nota","envieme una nota","audio para","un audio","audio","escuchar tu voz","nota de voz","un audio","escuchar","tu voz","mensaje de voz","de voz","una nota","nota","nota de voz"],
  sequences: [
    [
      ['enviar video audio.ogg', 6000],
    ],
    [
      ['enviar video real.ogg', 6000],
    ],
    [
      ['no me gustan audios amor', 6000],
    ],

  ],
},
{
  keywords: ["edad","que edad","qué edad", "edad tienes","cuantos años","años tienes","años","Cuanto años","cuántos años tienes","años tienes"],
  sequences: [
    [
      ['enviar video años22.ogg', 6000],
      ['Y cuantos tienes tu amor', 6000],
    ],
    [
      ['enviar video años.ogg', 6000],
    ],
  ],
},

  {
    keywords: ["trabajas", "trabajando", "dedicas"],
    sequences: [
      [
        ['trabajo aveces en un salon de belleza🥹.', 6000],
        ['Y que haces estudias trabajas', 6000],
      ],
      [
        ['trabajo aveces en un salon de belleza🥹.', 6000],
        ['Y que haces estudias trabajas', 6000],
      ],
    ],
  },
];

// Diccionario de secuencias y sus imágenes o videos asociados
const sequences = {
  // Agregar más secuencias aquí si es necesario
  // secuencia3: [ ... ]
};

// Respuestas aleatorias para mensajes desconocidos
const randomResponses = [
 'Bueno pero tiene q enviarme algo de dinero',
  'Sii mándame unas fotos',
  'Yo con ganas de que me lo metas bien rico mi amor',
  'Te e pedido dinero y nada',
  'Si te guste amor',
  'Shiiii 🥰❤️',
  'Si mi amor',
  '❤️super rico 🤤',
  'Hay dios 😁',
  'Yo quiero venirme amor',
  'Delicioso está bien',
  'Woow',
  'Vale',
  'Que finooo',
  'Ahhh yaa que chevere',
  'Sip',
  'Si claro',
  '❤️super rico 🤤',
  'Si delicioso amor',
  'Divino amor',
  'Unnm eso es bueno',
  'Estaba mas caliente amor',
  'Si Rey',
  'Estoy mojada amor',
  'Eso es bueno',
  'Si Rico',
  'Bueno Amor❤️',
  'Lindo',
  'Eres mío Amor',
  'Un ya Rico',
  'Me alegro',
  'Ajá y entonces',
  'Un ya cielo',
  'Vale cielo está bien',
  'Vale mí amor ❤️😍',
  'Que me Arias amor',
  'Vale amor está Bien que haces horita',
  'Ok esta bien',
  'Hay se ve el interés de una persona',
  'Que bueno mi amor',
  'Usted me gusto mucho amor',
  'mi amorsito rico',
  'Voy hacer tu amor pero desde acá',
  'Yo puedo ser tu novia pero desde aquí',
  'Y no veo tu interés',
  'Me ayudarás',
  'Heres un hombre bello me encantas come me tratas',
  'Envíeme una foto',
  'ya te dire a ti si a todo Amor',
  'Ahh ok sii esta biene alegra',
  'Dime cosas calientes Amor',
  'Queria venirme amor',
  'claro que si🥰',
  'Si gracias 😊',
  'Delicioso ♥️',
  'Uff muy rico bebe',
  'Ahh ya amor',
  'Sii que rico bebe',
  'q ricooo mi amor',
  'Riiicooo 😋😋👅',
  'Ricooo riicoo ricoooo',
  'Qué bien, cariño',
  'Te diré a ti si a todo, amor',
  'Quería estar contigo, amor',
  'delicioso',
  'Siiiiiii Ricoooooo',
  'Uf delicioso amor🔥',
  'Yo te daria todo de mi',
  'Eres lo que deseo amor',
  'Me gustas, mucho💓💯',
  'Eres irresistible amor',
  'Quiero darte mucho culo amor.',
  'Ayyy q delicia ers tu Rey.',
  'Dare lo que sea por tenerlo a mi lado hermoso💋🔥',
  'Me encantas♥♥',
  'Cosita deliciosa✨',
  'Deliciosooo amor❤️.',
  'Q Delicia❤🔥🔥',
  'Me Facinas Bb',
  'Te adoro mi vida',
  'tu me enamoras💕',
  'Qué hombre tan Bello.',
  'Tu me excitas mucho',
  'me muero por verlo',
  'la tengo mojada amor.',
  'Rico pensar en ti amor',
  'Quiero que seas mi amor ❤️',
  'eres perfecto',
  'yo quiero verte bb❤',
  'Webo es lo que quiero amor.',
  'Creo que me enamore✨',
  'Quiero adorarte toda mi vida Belloo🌹🌹',
  'Ud estodo lo que quiero en mi vida amor 💋',
  'Eres lo máximo Rey',
  'Lo que tu digas lo are🌹✨',
  'Solo espero algún día tenerte cerca, amor🌹',
  'Venga y juguemos en la cama',
  'Quiero que hagas cosas ricas amor',
  'Me tienes mil Hermoso.',
  'me interesa tu amor',
  'Si amor te tengo muchas ganas',
  'Lo quiero sentir dentro de mi amor',
  'Se debe sentir rico muy rico',
  'Yo quiero abrazarte para que me metas el pene',
  'Tu pene es mi felicidad',
  'Si mi amor te lo hago así y te lo chupo y me trago tu espelma',
  'Gracias la paso genial con tigo amor',
  'Quiero que me metas el pene en el culo',
  'Quiero sentir tu pene en mi cuka pero quiero que me des bien duro amor',
  'mi cuka ama a tu pene amor',
  'Quiero pene',
  'Si rico no me importa que me duela quiero tu pene grande dentro de mi cuka amor',
  'me gustas mucho lo quiero',
  'Me haces gritar de placer mi amor amo tu pene y lo quiero para mí solita',
  'Rico te lo mamo cuántas veces quieras',
  'Quiero coger contigo mi príncipe azul',
  'me interesa tu amor',
  'Quiero cojer con tigo amor',
  'Quiero que me chupes las tetas',
  'Que rico amor',
  'Mmm si bueno hazme muy feliz entonces',
  'quiero sentir tu huevo dentro de mi así todo grande por mi Cuca y mi boca uuuff y mi culito rico',
  'Venga y yo lo enseñó a hacerme gritar De placer amor',
  'Así me encanta mamá el huevo rico 🤤 Ami me gusta mucho',
  'Tu me darias pene amor',
  'Uf q ricooooooo',
  'Quiero chupar tu pene amor',
  'Sentir que me amas seria muy delicioso amor',
  'Quiero venirme amor',
  'Soy una adicta al sexo',
  'Te adoro mi vida',
  'Quiero tu pene amor❤.',
  'Yo quiero pene amor♥',
  'quiero que me den por el culito rico',
  'riquisimo',
  'tu te imajinas yo consientiendote todos los dias tu pene amor',
  'yo si quiero que me des tu pene amor💋🔥.',
  'Para que se venga en mi cuca amor',
  'yo si quiero que seas tu el que me coja amor💋🔥.',
  'Quiero darte mi cuca amor',
  'Si que rico seria sentirte dentro de mi amor',
  'lo tienes paradito amor',
  'siento mucho placer cuando chateo amor',
  'me colocas caliente amor',
  'Estaba muy caliente pensándolo amor',
  'Muchos besitos para ti mi Bb💋',
  'Quiero que me hagas temblar las piernas amor.',
  'quiero que me hagas venir amor',
  'Quiero saber que se siente tu pene mientras me cojes amor',
  'Eres una hermosura',
  'para colocarte el pene, bien erecto, mientras lo lamo hasta la punta y lo devoro con mis labios Amor',
  'Ayy en verdad',
  'Siii Me Encantas',
  'sii pero en verdad quiero que me ayudes',
  'Dime qué te gustan de las venezolanas',
  'Si gracias mi amor',
  'Si muy rico 🤤',
  'Sabías que las venezolanas son demasiado caliente',
  'No te imajinas lo mucho q me exita pensar en ti hermoso',
  'Mi en la cama me gusta que me cojan en 4 bien rico 🤤 y que me lo metas por el culito así rico te lo quiero mamar',
  'hay amor q delicia',
  'Si me gustaría mucho',
  'Mientras me consientas y me hagas feliz siempre estaree contigo',
  'Así me encanta que te gusta que te hagan en la cama',
  'Uuf si rico 🤤 yo te haría acabar con mi boca',
  'Si de verdad te pudiera conocer en verdad',
  'Si tengo ganas ya estoy mojadita',
  'ay q rico amor',
  'Me dejaste muy mojada',
  'que lindo como hablas',
  'no soy de esas mujeres que se van por el físico',
  'yo te are caso en todo mi amor',
  'Y si me va hacer el favor🔥',
  'Yo te quiero para mi amor',
  'Dime me vas a enviar amor',
  'Sígue exitandome amor',
  'Te quiero sentir RiKo amor',
  'Siento unas ganas de cojer amor',
  'Eres Muy caliente amor',
  'Tengo rato sin hacer el amor',
  'Eso me encanta muchísimo mi amor lindo',
  'Seré tu esclava sexual',
  'Tengo unas tetas grandes y deliciosas',
  'Quiero sentirte dentro de mi amor',
  'Quiero hacer de todo mi amor lindo',
  'Nesecito culiarte hasta el cansancio',
  'Cual pose te gusta más mi amor lindo dime',
  'Quiero chuparte el pene bien sabroso',
  'Me tienes muy caliente',
  'Y tu eres caliente',
  'Kieres mi cuka',
  'Me hiciste mojar riko',
  'Claro que si mi vida esa es la idea',
  'Ufff me excitas mucho',
  'Uffff seria riquisimo',
  'cuando me envias amor',
];

// Función para obtener una respuesta aleatoria de una lista
function getRandomResponse(responsesList) {
  const randomIndex = Math.floor(Math.random() * responsesList.length);
  return responsesList[randomIndex];
}

// Función para verificar si el mensaje incluye alguna de las palabras clave asociadas con una secuencia
function findSequence(message) {
  const lowercaseMessage = removeAccents(message.toLowerCase()); // Eliminamos los acentos del mensaje
  for (const response of keywordResponses) {
    const keywords = response.keywords;
    const found = keywords.some(keyword => {
      const lowercaseKeyword = removeAccents(keyword.toLowerCase()); // Eliminamos los acentos de la palabra clave
      return lowercaseMessage.includes(lowercaseKeyword);
    });
    if (found) {
      return response;
    }
  }
  return null;
}

// Función para enviar mensajes con intervalos de tiempo y seleccionar una secuencia aleatoria
async function sendSequenceMessages(chatId, sequences) {
  const randomSequenceIndex = Math.floor(Math.random() * sequences.length);
  const randomSequence = sequences[randomSequenceIndex];

  for (const [message, interval] of randomSequence) {
    if (message.startsWith('enviar video')) {
      // Es una solicitud para enviar un video
      const videoPath = message.substring(12).trim();
      if (fs.existsSync(videoPath)) {
        const media = MessageMedia.fromFilePath(videoPath);
        await client.sendMessage(chatId, media);
      } else {
        await client.sendMessage(chatId, 'No se encontró el video.');
      }
    } else if (message.startsWith('enviar imagen')) {
      // Es una solicitud para enviar una imagen
      const imagePath = message.substring(13).trim();
      if (fs.existsSync(imagePath)) {
        const media = MessageMedia.fromFilePath(imagePath);
        await client.sendMessage(chatId, media);
      } else {
        await client.sendMessage(chatId, 'No se encontró la imagen.');
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, interval));
      await client.sendMessage(chatId, message);
    }
  }
}

let messageCount = 0;
let peakThreshold = 2; // Umbral para considerar un pico de mensajes
let peakDuration = 15000; // Duración en milisegundos para verificar el pico
let messageQueue = [];
let isQueueProcessing = false;
let lastMessageDuringPeak = null; // Variable para almacenar el último mensaje durante un pico

// Función para procesar la cola de mensajes
async function processMessageQueue() {
  if (messageQueue.length > 0) {
    const nextMessage = messageQueue.shift(); // Obtiene y elimina el próximo mensaje de la cola
    await sendDelayedMessage(nextMessage.chatId, nextMessage.message);
  }
}


// Resto del código...

async function handleIncomingMessage(message) {
  const senderId = message.from;
  const userBlocked = blockedUsers[senderId];

  if (userBlocked) {
    console.log(`No se responderá al usuario ${senderId}.`);
    return; // No responder al usuario bloqueado
  }

  messageCount++;

  if (messageCount > peakThreshold) {
    lastMessageDuringPeak = message.body; // Almacenar el último mensaje durante el pico
    if (!isQueueProcessing) {
      processMessageQueue();
    }
  } else {
    console.log(message.body);
    const matchedResponse = findSequence(message.body);

    if (matchedResponse) {
      if (matchedResponse.responses) {
        const randomResponse = getRandomResponse(matchedResponse.responses);
        await sendDelayedMessage(message.from, randomResponse);
      } else if (matchedResponse.sequences) {
        const sequences = matchedResponse.sequences;
        await sendSequenceMessages(message.from, sequences);
      }

      if (matchedResponse.blockUser) {
        blockedUsers[senderId] = true; // Bloquear al usuario
        console.log(`Usuario ${senderId} bloqueado.`);
      }
    } else {
      const randomResponse = getRandomResponse(randomResponses);
      await sendDelayedMessage(message.from, randomResponse);
    }
  }

  saveConversation(message); // Guardar la conversación

  setTimeout(() => {
    if (messageCount > peakThreshold && lastMessageDuringPeak !== null) {
      messageQueue.push({ chatId: message.from, message: lastMessageDuringPeak });
      lastMessageDuringPeak = null; // Reiniciar la variable para el próximo pico si ocurre
      if (!isQueueProcessing) {
        processMessageQueue();
      }
    }
    messageCount = 0; // Reiniciar el contador de mensajes
  }, peakDuration);
}

// Función para enviar un mensaje con una demora ajustada entre 8 y 20 segundos
async function sendDelayedMessage(chatId, message) {
  const delay = messageQueue.length > 0 ? 20000 : Math.floor(Math.random() * 12000) + 8000; // Se ajusta el rango a [8000, 20000]
  await new Promise(resolve => setTimeout(resolve, delay));
  await client.sendMessage(chatId, message);

  if (messageQueue.length > 0) {
    processMessageQueue(); // Procesar el siguiente mensaje en la cola si existe
  } else {
    isQueueProcessing = false; // No hay más mensajes en la cola
  }
}






// Función para guardar la conversación en un archivo
// Función para guardar la conversación en un archivo
function saveConversation(message) {
  const conversationFilePath = 'conversation_log.txt'; // Nombre del archivo para todas las conversaciones
  const conversationLog = `${new Date().toISOString()} - ${message.from}: ${message.body}\n`;

  fs.appendFile(conversationFilePath, conversationLog, (err) => {
    if (err) {
      console.error('Error al guardar la conversación:', err);
    }
  });
}

// Función para enviar una alerta
function sendAlert(message) {
  // Aquí puedes implementar el código para enviar la alerta, por ejemplo, enviar un mensaje a un grupo de WhatsApp o enviar un correo electrónico.
  console.log(`ALERTA: ${message}`);
}



// Manejar eventos de mensajes
client.on('message', handleIncomingMessage);

// Función para inicializar el cliente y navegar a WhatsApp Web con opciones de espera
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  client.initialize(browser);
})();
