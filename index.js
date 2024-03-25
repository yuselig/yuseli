const fs = require("fs");
const path = require("path");
const login = require("fb-chat-api");

// Rutas de archivos
const sessionFile = "session.json"; // Archivo de sesión en la raíz del proyecto
const blockedUsersFile = "blocked-users.txt"; // Archivo para almacenar usuarios bloqueados en la raíz principal
const conversationLogFile = "conversation_log.txt"; // Archivo para almacenar la conversación en la raíz principal

// Credenciales para iniciar sesión
const loginCred = {
  appState: JSON.parse(fs.readFileSync(sessionFile, "utf-8")),
};

let blockedUsers = {}; // Almacena los usuarios bloqueados
let stopListener; // Variable para detener la escucha

// Función para cargar los usuarios bloqueados desde el archivo al inicio
function loadBlockedUsers() {
  try {
    if (fs.existsSync(blockedUsersFile)) {
      const data = fs.readFileSync(blockedUsersFile, "utf-8");
      blockedUsers = JSON.parse(data);
      console.log("Usuarios bloqueados cargados con éxito.");
    }
  } catch (error) {
    console.error("Error al cargar usuarios bloqueados:", error.message);
  }
}

// Función para guardar los usuarios bloqueados en el archivo
function saveBlockedUsers() {
  try {
    const directory = path.dirname(blockedUsersFile);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    const data = JSON.stringify(blockedUsers);
    fs.writeFileSync(blockedUsersFile, data, "utf-8");
    console.log("Usuarios bloqueados guardados con éxito.");
  } catch (error) {
    console.error("Error al guardar usuarios bloqueados:", error.message);
  }
}

// Función para guardar la conversación
function saveConversation(message) {
  try {
    const logMessage = `${message.body}\n`;

    fs.appendFileSync(conversationLogFile, logMessage, 'utf-8');
    // Comenté la línea de log para evitar la salida en la consola
    // console.log(`Guardando mensaje en el registro de conversación: ${message.body}`);
  } catch (error) {
    console.error("Error al guardar la conversación:", error.message);
  }
}


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
    keywords: ["tiene WhatsApp", "pasame WhatsApp", "tienes Whatsapp","al wasap","wasat","wasa","Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp",
    "por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp","por Whatsapp", "tu WhatsApp", "tienes WhatsApp","en whatsapp", "por whatsapp", "tu whatsapp", "el whatsapp", "su whatsapp"],
    responses: ['Mas tarde te doy mi WhatsApp', 'Mas tarde te lo envio','Más tarde te lo mando', 'Más tarde te lo enviaré', 'En un rato te lo mando', 'Luego te lo envío', 'Después te lo mando', 'Te lo enviaré más tarde', 'En un momento te lo mando', 'En un momento te lo enviaré', 'En un rato te lo mando', 'Dentro de un rato te lo envío', 'Más adelante te lo mando', 'Te lo envio mas tarde'],
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
    responses: ['Enviame ya amor🔥💯.', 'Espero me cumplas que yo te dare lo tuyo amor', 'ahi que esperar amor','Mañana cuando me envies yo te are hasta videos metiendome mi conolador en el culo amor','si me cumples yo te dare a ti lo que tu quieras amor','Yo con unas ganas que me cumplas amor🔥💯','Seria muy rico si lo hisieras ya amor','Tu si lo haces te consentiria mucho mi amor❤.','Yo aqui con unas ganas que me envies para hacer cosas ricas amor','Seria rico si lo hisieras ya mismo amor','podemos hacerlo rico amor','Mejor ahora que mañana amor','hagalo ahora seria muy rico amor','yo toda desnuda con unas ganas si me envias amor','Quiero hacerte muchas cosas ricas cuando me envies amor','yo con unas ganas complacerte amor🥵','Seria rico si lo haces amor.','Amor no sabes todos los deseos que tengo de venirme si me envias amor','amor yo puedo complacerte si me haces eso amor','yo quiero ser tu mujer si lo haces lo sere amor','Con unas ganas de meterlo en mi culito si me envias mi amor'],
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
    keywords: ["como estas","como vas", "tal", "buenos dias","buenas noches","tal","Como estas?", "muy bien y usted", "bien y tu"],
    responses: ['Estoy, bien gracias', 'Bastante bien.', 'Muy bien Gracias', 'Bien, gracias.', 'Estoy de maravilla, Amor❤️.'],
  },


  {
    keywords: ["reina", "atractiva", "guapa", "princesa","belleza", "amor", "bb", "linda", "hermosa", "preciosa", "te amo", "amo", "adoro", "te quiero", "belleza", "bellezima", "belleza","encantadora", "fascinante", "atractiva", "hermosa", "maravillosa", "carismática", "espléndida", "elegante", "agradable", "deslumbrante", "deslumbradora", "encantadoramente", "atractivamente", "fascinantemente", "guapa", "encanto", "adorable", "adoracion", "cariñosa", "amorosa"],
    responses: ['Gracias amor', 'Enserio', 'Eso siii todo natural amor', 'De verdad q eres super lindo',  'Tu eres tan lindo de verdad', 'tu me gustas mucho', 'Gracias amor 💞', 'Gracias mí corazón', 'Y eso q no me conoces','Es usted muy amable.', 'Gracias rey', 'Gracias por ser tan bello', 'Gracias mí amor', 'Gracias bb', 'Usted también es hermoso mi amor', 'Gracias ☺️', 'Gracias 🥴', 'Bello mi amor', 'Hay BB eres la mejor persona 💗','Todo hermoso mi BB ❣️', 'Bello 🤩 meeeee encantaaaaaas', '❤️ tan bello', 'Gracias rey', 'Gracias cielo ❤️', 'Hay amor que lindo 😻', 'Gracias mi vida', 'Tan lindo me agradas mucho', 'Hay cielo que lindo', 'Besos mi amor', 'Hay amor tan lindo 😍', 'Te mando un beso y un abrazo fuerte', 'Tan bello mi amor', 'Gracias me encabtas amor', 'Es usted un amor', 'Tu me gustas más mi bb', 'Siii Loo seee mi rey', 'Y gracias mi  amor 😍😍❤️💘', 'Y gracias', 'Tu me gustasoooo como loca', 'Aww Tu me gustas 😍😍', 'Tu me gustas', 'Si de algo pudes estar seguro es que yo quiero venirme Amor👅', 'Tii amo💘', '❤️💘 Que bello cariño', 'Yo también te quiero 😘', 'quiero que me cojas amor💖'],
  },

  {
    keywords: ["las enviaste","Ya me enviastes esos","las enviaste","las enviaste","Eso ya lo tengo","mensajes repetitivos","repetitivos","repetidos", "Manda mas","esos ya los vi", "muchas veces", "Ya me enviaste","ya las enviastes", "Ya me envio","foto de ahorita ","ya los tengo","Ya esos los vi","pides","fotos diferentes","ya me envio","con lo mismo", "Dejame verte", "pides", "pides","son los mismos","ya me las envío","envia lo mismo","mismos","mismos","mismos","mismos","los mismos", "la bloqueo", "ya me envio esas", "mismos","mismos","mismos","mismos","mismos","no lo mismo","lo mismo","diferentes","diferentes","diferentes","enviastes","repites","repite",'muestrame'
],
    responses: ['encantada de enviarte videos largos todo el mes como tu quieras una vez me envies a mi nequi 3164909368 amor','Tu sabes que me enviasa mi nequi 3164909368 y are todos los videos que tu quieras todo el mes amor ','amor tu me envias a mi nequi 3164909368 yo te hago los videos como tu quieras todo el mes amor','si me envia yo hago todos los videos que tu quieras todo el mes igual me gusta hacerlo amor','yo puedo hacerte muchos videos como tu los quieras todo el mes solo me envies a mi nequi 3164909368 amor','yo encantada de hacerte todos los videos que quieras si me enviasa a mi nequi 3164909368 amor','lo siento pero si tu me envias a mi nequi 3164909368 yo te hagoo todos los videos que tu quieras todo el mes amor','yo te hago videos de ahorita todos los que tu quieras si me envias a mi nequi 3164909368 amor','si quieres que te envié diferentes me envias amor y tenemos video llamadas y después cojemos amor'],
  },

    {
      keywords: ["mamar", "cuca", "comer", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grande","masturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito", "meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas" , "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrarte", "comerte", "verga", "pechospene", "culito","meterselo", "oral", "guevo", "chupar", "sexo", "venirme", "paja", "cenosmamar", "cuca", "culo", "cojerte", "tetas ", "excita", "duro", "paro", "vagina", "grandemasturbarme", "chupartela", "chuparsela", "panocha", "mamarcela", "anal", "penetrar", "comerte", "verga", "mamarlo", "pechospene", "culito", "meterselo", "pene","culito","trio", "mamarselo","venirme","paraito","culiar", "mojadita","chupo","te chupo", "postura", "mojada", "lo meto", "paja","ruza", "tetas", "Chuparte", "cosita", "muchas ganas", "darte duro", "venir","lengua","sexo","pecho","culea","lo meto", "en cuatro","cuca","paja","pichas","chupadora", "chucha","leche","provoca", "chochita","Parado","exitas","chupas", "vagina","verga","penetrarte","por atras", "clítoris","pezones","clítoris","vagina","panocha","arrecho","vengas","panochota","delicioso","panocha","cuca","venirme","senos", "guevo", "chupar", "oral","detras","sabroso","cuatro","delicioso","venirte","chupo", "pecho","cachuo","teta","chupo","pichas","chuparia","sexo","chupartela","clavo","kuliar","chuparte","parolo","metertelo","teticas", "chorros","colita","senitos","cuka","culo","excitado","vagina", "chuparte","lambertela","piernas","gallito","vengas","chupo","mojar","masturbandose","chocho","vajina","parado","metertelo","duro", "chupar","chuparias","morboso","chupete","sexi","vaginal","cogerte","teticas","culo","benirme","venirme","pechos","rajita","chiquito","cucona","chupo","fisting","palmaditas","masturva","comer", "chupando","huevo","cuquita","cukita","grueso","pechitos","me vengo","puntita","culito","gimes","Llenarlas","Llenarte","comas", "todito","chupas","venir","metiendotelo","consolador","dedo", "chupamelo","dandose","metere","llena de","huevas","mamada","boca", "Piquitos","juguetes","la cara","seno","legua","lengua","follarte", "calientes","ardientes","caliente","la comas","culiarte", "berga","verga","grueso","grande","comas", "pipi", "semen","chorriandome", "masturbes","chorro","la cama", "multiorgasmica","orgasmo","vajina","puchecas", "en 4","culiarmela", "culiamos","chupes","sentirte", "metertelo","chiguito", "clavan","meter","culiamos","chocha","te viniste", "bajina","la paja", "te cojan","kulito", "penetrar","lengua", "cojan","chupas","parar ","soy adicto","cojer", "Sabrozo", "besarte","vaginita","culiarte", "vaginota","morbo", "esas ganas","sexo", "cucota","senos", "venir dentro","anal", "culo","cabeza","clitorix","clitoris","ardiente", "sexo","sexo","sexo","sexo","sexo","sexo","sexo","sexo","sexo","sexo", "venirme", "paja","cenos"],
      responses: ['Así me encanta el huevo rico 🤤 Ami me gusta mucho', 'Cree q con esas labias de q me va hacer feliz', 'Q Rico Eso Me Encanta', 'Ay No Se Que Decir🤭', 'Super rico❤️❤️', 'divino papasito', 'Uf, qué rico. Me encantaría. 😋😋😋😋', 'Ayyy Q RiKo sii', 'Qué delicia 😘😘❤😍😍😍', 'Dime que me harías', 'Q rico seriaa amor 😍😍❤️🤤😈', 'Huuuuy q ricoo Mii bb', 'mee encantaa q ricooo mi amor', '😋😋😋q riicooo me encantaaaaaa', 'yaaa quiroo sentirlooo', 'Aaaaahh uufhssss q ricoooo', 'Riiicooo 😋😋👅', 'Ricooo riicoo ricoooo', 'Uufhsss dioossssss q ricoooooo 😍😍😍😍😍😈😈😈', 'q me deje las piernas temblando sexo rudo contigo amor seria perfectoo', 'Huy q riiicooo uffhsss', 'Quierooo esooo paraaa mi, sentirloo dentro de miii😍😍😍😍', 'Q ricooo sería super😈😋😋😋', 'Mee encantaria sentirlo dentro d mii 😈😋😋', '😋😋😋 seriaaaa ricooo', 'yoo quierooo 😈😈', 'sii Bebé y me mandas videos yoo quiero ver 😋😋😋😈😍😍', 'Waooo q ricoooo bb', 'Q ricooo bb meee encantaaas', 'huy q ricoo bb','Quiero darte mucho culo amor.', 'Uf q ricooooooo mee encantaria tu penee😋😋😋😋', '😋😋😋 ufsss ricoooo', 'Pero no me mandas', '😮😮😋😋😋😈q riiicoooo mee encantaaa','Yo con ganas de que me lo metas bien rico mi amor','Yo quiero venirme amor','Estoy mojada amor','Jajajaja si tú vieras cm hago el amor','Quería estar contigo, amor','la tengo mojada amor.','Webo es lo que quiero amor.',  'Venga y juguemos en la cama',  'Me tienes mil Hermoso.','Se debe sentir rico muy rico','Yo quiero abrazarte para que me metas el pene','Tu pene es mi felicidad',  'Si mi amor te lo hago así y te lo chupo y me trago tu espelma',  'Quiero que me metas el pene en el culo',  'Quiero sentir tu pene en mi cuka pero quiero que me des bien duro amor',  'Si rico no me importa que me duela quiero tu pene grande dentro de mi cuka amor',  'mi cuka ama a tu pene amor','Quiero pene',  'Me haces gritar de placer mi amor amo tu pene y lo quiero para mí solita', 'Rico te lo mamo cuántas veces quieras',  'Quiero cojer con tigo amor','Quiero coger contigo mi príncipe azul','Quiero que me chupes las tetas',  'quiero sentir tu huevo dentro de mi así todo grande por mi Cuca y mi boca uuuff y mi culito rico','Venga y yo lo enseñó a hacerme gritar De placer amor',  'Así me encanta mamá el huevo rico 🤤 Ami me gusta mucho','Tu me darias pene amor',  'Quiero chupar tu pene amor','Quiero venirme amor','Quiero tu pene amor❤.','Yo quiero pene amor♥','quiero que me den por el culito rico',  'tu te imajinas yo consientiendote todos los dias tu pene amor','yo si quiero que me des tu pene amor💋🔥.','Para que se venga en mi cuca amor',  'yo si quiero que seas tu el que me coja amor💋🔥.','Quiero darte mi cuca amor',  'Si que rico seria sentirte dentro de mi amor','lo tienes paradito amor','siento mucho placer cuando chateo amor','me colocas caliente amor','Estaba muy caliente pensándolo amor',  'Quiero que me hagas temblar las piernas amor.','quiero que me hagas venir amor','Quiero saber que se siente tu pene mientras me cojes amor',  'para colocarte el pene, bien erecto, mientras lo lamo hasta la punta y lo devoro con mis labios Amor',  'No te imajinas lo mucho q me exita pensar en ti hermoso','Así me encanta que te gusta que te hagan en la cama',  'Uuf si rico 🤤 yo te haría acabar con mi boca',  'Si tengo ganas ya estoy mojadita','Me dejaste muy mojada','Te quiero sentir RiKo amor','Seré tu esclava sexual','Tengo unas tetas grandes y deliciosas',  'Nesecito culiarte hasta el cansancio','Cual pose te gusta más mi amor lindo dime','Quiero chuparte el pene bien sabroso',  'Me hiciste mojar riko','Ufff me excitas mucho',],
    },
  {
    keywords: ["real","acoso","no me gusta","pelao","real","real","real","esa no eres tu","no eres tu","hp","ya envie los", "sijin", "fiscalía", "investigador","falsa","ya te mande los","bulla","no me interesa", "extorcion", "no saliste con nada","no mando plata", "falsa", "robadas", "robe", "no envio dinero", "no envío dinero", "no envío dinero", "no pago", "ya mande la plata","no soy de pagar","no es usted","grabacion","no creo","sin nada","doy en efectivo","no tengo dinero","que eres tu","estoy pelado","en canado","no ver no ago","no te voy a enviar","no voy a pagar","no te voy","tu cuento","la misma persona","problemas","hay se los envie","ya se los puse","zorra","en la carcel","compu","no tengo ahora dinero","compu","no te voy a enviar","no te voy mandar","Ya  te envié","Ya te envié", "Aller te envie","enviame plata tu", "maldita", "compu", "no mando plata", "no te envio nada", "no tengo el dinero","no insistas", "no te creo", "estoy pobre", "no tengo", "sin platica", "todo cerrado", "no doy adelantado", "sabado","domingo","lunes","agua fria","putas","no busco putas", "compu","no te voy a mandar","no mando plata","no me interesa","seas real","estoy preso","preso","no caigo", "diciendo mentiras", "mentiras", "robar a otro","a robar", "no eres la misma", "pura mentira",  "no me interesa", "estoy en la carcel", "la carcel", "estafar","engañar","bloqueo","la bloqueo", "no tengo plata","pero no tengo plata", "investigacion","bobo","Ya te envié", "ya se los envie","ya le envie la plata","real","real","Ya se los envie","policia","fraude","mentira","no eres tu",  "carcel", "maldita", "mentirosa", "bloquear","estafa","real","robo","ladrona","real","cai","denunciar","estafadora","maquina","Maquina","computadora","una computadora","no real","no cumples","no real","robo","ladrona","no real","no eres Real","falso","me robo","publicar","le voy a decir","ya te envie", "Ya te envié","envié el dinero","envié los 20","robaste","me robaste","envié la plata","le envié la plata","te envié plata","no eres real","listo ya te envie","te consine","te mande","malparida","ladrones","que carcel","robot", "banco","mentirosa", "robo","no real","maquina","Ya te gire","Ya yo te mandé la plata","ya te jire","ya le mnde","selo puse", "revise","revisa","te pague","te cancele","le voy a decir","fiscalia","robando","ya te deposite","ya deposite","ya te mande el dinero","real","ya le page","te transferi","mira el recibo", "ya se los mande","ya te envie","ya te gire", "yo ya le mande", "yo ya le mande", "yo ya le mande", "yo ya le mande", "ya te los gire", "te envie la plata","soy de venezuela", "no es normal",  "me dejaste de hablar", "no tengo dinero", "y para eso tengo que enviarte plata", "lo das gratis", "porque me cobras", "porque me cobras", "me vas a seguir cobrando", "porque me pides 20 mil", "sin plata", "aquí te pago", "venga hasta aquí", "a que me paguen", "grabados", "falso", "conocerte primero", "me tocaría el", "ahora que salga a almorzar no tengo plata en el nequi", "no gracias", "cuentas falsa", "cuenta falsa", "no tengo plata", "me pagan hasta", "te pago en efectivo","pago en efectivo", "ando pelado", "estemos los dos le doy", "cuando estemos", "cuando nos vemos le envío", "acá le doy su plata", "no te puedo enviar plata", "sin conocerla", "te pago acá","te pago aca", "te pago aqui","no te puedo enviar", "te pago acá", "te doy acá", "no puedo enviarte", "no envío plata", "tunvado","tunbado", "no te puedo enviar", "no te conozco","ver y no comer", "no me han pagado", "cuenta en cero", "allá te pago", "aquí le pago", "no venga aquí le pago", "aquí le pago", "no doy plata", "adelantado", "una máquina", "no creo", "acá te pago", "no aca te pago", "no señora", "contéstame una llamada y te los envío", "bloqueo", "no hay money", "no hay plata", "quiero culiar te bien rico", "esa no es tu panocha", "no es tu panocha", "a bloquear", "yo te los doy si nos vemos", "no me gusta enviar plata", "¿qué quieres?", "sí o no", "pero toca más ratico", "que me paguen", "no tengo nada", "no tengo plata", "el jueves me pagan", "pero no tengo", "te pago", "te pago después", "hoy no tengo", "que me vas a cumplir", "no me mandes nada", "una repetidera", "no mando nada", "repetidora", "póngase seria", "si eres tú", "que eres tú", "no te entiendo", "está cerrada", "colageno", "plata no", "sin plata", "no tengo plata", "qué te envío", "me ha pasado", "otro cuento", "ficticios", "no mando plata", "lejos del pueblo", "no, mi vida", "no hay nequi", "no eres tú", "quien eres", "acá no es", "pidiendo plata", "no haces caso", "pa creerte", "no tengo manda tu", "no tengo nada", "lástima", "no tengo", "yo no salgo", "que no", "mentirosa", "no envío", "no hablas serio", "nada serio", "pues no", "cosas falsas", "falsas", "no te conozco", "eres de dinero", "no eres tú", "no me enviaron", "ya te llego la transferencia", "mi sugar", "regálame un paquete", "no me excita", "no puedo", "orita nada", "echate agua", "no digas eso", "no la conozco", "no puedo", "no le puedo mandar", "quien eres", "ya te envié", "esa no otras", "no me gusta", "no la verdad", "no me gusta", "pero tú no", "no voy a pagar", "que no", "no aguanta", "cómo se que es verdad", "sin hacer nada", "ni te distingo", "robos", "estafas", "no la entiendo", "por ahora no", "no se cansa", "no se puede", "estoy sin plata", "no se va poder", "le da asco", "no sé quién es", "insultar", "no me responde", "no la conozco", "no quiero", "después la plata", "luego te doy la plata","luego le doy la plata", "no tengo dinero", "no tengo plata", "no la conozco", "si no no", "no se qué dices", "dinero en persona", "no eres tú", "orita no", "quién es usted", "no creo", "quien eres", "no salgas con nada", "otra vez con lo mismo", "no hay plata", "no hay dinero", "no hay money", "a bloquear", "no sales con nada", "muy falsa", "falsa", "no me gusta enviar", "vividores", "no te creo", "cómo sé que eso es verdad", "pagan mensual", "me pagan hasta el", "engañado","engañando", "han engañado", "pura mentira", "no los tengo", "ni siquiera me conoces", "me bloqueas", "bloqueas", "falsa", "no me gusta así", "estoy en una finca", "y me pagan el", "orita no hay", "no tengo plata ahora", "estoy ahora sin plata", "aquí te pago","no es usted","sin sentindido","sin centido", "a que me paguen", "tunvado", "tumbado", "no te conozco", "no doy plata", "estafándome", "en la finca", "ser falsa", "soy mujer","argentina", "bahamas", "barbados", "belice", "bolivia", "brasil", "chile", "costa rica", "cuba", "dominica", "ecuador", "el salvador", "granada", "guatemala", "guyana", "haití", "honduras", "jamaica", "méxico", "nicaragua", "panamá", "paraguay", "peru", "republica dominicana", "san cristobal y nieves", "san vicente y las granadinas", "santa lucía", "surinam", "trinidad y tobago", "uruguay", "venezuela", "españa", "estados unidos", "venezuela"],
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
      ['Enviame 20Mil a mi nequi 3164909368 que yo le hago lo que usted quiera amor', 6000],
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
    [
      ['si quieres enviame 20Mil a mi nequi 3164909368 te are los videos que tu quieras amor', 6000],
      ['enviar video video1.mp4', 6000],
      ['enviar video video2.mp4', 6000],
      ['enviar video video3.mp4', 6000],
    ],
    [
      ['Mi amor si tu me envias a mi nequi 3164909368 los 20Mil yo puedo consentirte con todo lo que usted me diga todo el mes, yo soy muy caliente Amor🥵🔥🔥🔥', 6000],
      ['enviar video anal.mp4', 6000],
      ['enviar video cola3.mp4', 6000],
      ['enviar video polvo.mp4', 6000],

    ],
    [
      ['Si me envias a mi nequi 3164909368 20Mil yo le hago cosas ricas todo el mes, como tu me digas amor', 6000],
      ['enviar video video1.mp4', 6000],
      ['enviar video video2.mp4', 6000],
      ['enviar video video3.mp4', 6000],
    ],
    [
      ['Amor me envias 20Mil a mi nequi 3164909368 no pienso dejar que usted pase de largo sin venirse rico todo el mes amor', 6000],
      ['enviar video anal.mp4', 6000],
      ['enviar video cola3.mp4', 6000],
      ['enviar video polvo.mp4', 6000],
    ],
    [
      ['Amor me envias a mi nequi 3164909368 20 mil yo lo consiento con todo lo que usted quiera para que nunca me deje amor', 6000],
      ['enviar video veterna.mp4', 6000],
      ['enviar video a2.mp4', 6000],
      ['enviar video 4a.mp4', 6000],
    ],
    [
      ['Yo puedo ayudarte a lograr que se te pare rico solo enviame a mi nequi 3164909368 20Mil yo soy muy calinte y se complacerlo rico amor', 6000],
      ['enviar video veterna.mp4', 6000],
      ['enviar video a3.mp4', 6000],
      ['enviar video febrero.mp4', 6000],

    ],
    [
      ['Enviame a mi nequi 3164909368 20Mil y la pasamos rico todo el mes, te hago videos como digas llamadas y lo que tu digas tu amor', 6000],
      ['enviar video toche.mp4', 6000],
      ['enviar imagen lana2.jpg', 6000],
      ['enviar imagen lana3.jpg', 6000],
      ['enviar video lana4.mp4', 6000],
    ],
  ],
},
{
  keywords: ['dinero','no uso nequi','yo no tengo nequi','no tengo plata en nequi','no tengo cuenta en nequi', 'no tengo el nequi','no tengo nequi','no tengo nequi','nequi', 'plata','neki','en efetivo','plata','plata','plata','plata','plata','plata','plata','plata', 'pagen', 'efetivo', 'pago','daviplata','bancolombia', 'davi plata','numero', 'funciona', 'pagado', 'neqi','si no de una', 'no tengo'],
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
      ['Aqui sola con unas ganas de venirme amor🔥', 6000],
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
  keywords: ["donde ests","donde vive","dirección","Veamos en tu casa","donde estas","dime donde","donde eres","de donde eres","dónde vives","dime dónde vives","donde es","vives en","donde eres","donde esta","donde eres?","donde vives","donde vives?","donde andas", "parte","en que parte","parte te encuentras","direccion","parte","parte","parte","parte","parte","parte","parte","estas viviendo","ciudad","que lado", "lugar", "pais", "dnde estas", "donde te ecuentras", "te ecuentras","que barrio","barrio eres","ubicación","barrio","tu ubicación","donde estas","localidad", "país","tu donde vives","país","país", "desde donde","desde donde","que parte", "parte de","parte eres","sitio","estas en bogota","direcion"],
  sequences: [
    [
      ['Soy Venezolana y estoy aquí en Bogota en la 127 con avenida villas en frente de bulevar niza.', 6000],
      ['Y tu de Pais eres amor', 6000],
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
  keywords: ["que edad","que edad", "edad tienes","cuantos años","años tienes","Cuanto años","cuantos años tienes","años tenes","cuantos años","años tienes","Cuantos años tienes","Cuántos años tienes?","cuantos años tenes","años tenes","cuántos años tenes","cuántos años tiene","años tiene","Usted años","Ust años","Ust años tiene","años tu","Ust años tiene","cuánto años tiene","años tiene","cuántos años tenés","cuántos años tenes","años tenes"],
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

// Respuestas aleatorias para mensajes desconocidos
const randomResponses = [
 'Bueno pero tiene q enviarme algo de dinero',
  'Sii mándame unas fotos',
  'Si te guste amor',
  'Shiiii 🥰❤️',
  'Si mi amor',
  '❤️super rico 🤤',
  'Hay dios 😁',
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
  'Usted me agrada amor',
  'mi amorsito rico',
  'Yo puedo ser tu novia si lo quieres asi Amor🔥♥️.',
  'Y no veo tu interés',
  'Me ayudarás',
  'Heres un hombre bello me encantas come me tratas',
  'Envíeme una foto',
  'ya te dire a ti si a todo Amor',
  'Ahh ok sii esta biene alegra',
  'Dime cosas calientes Amor',
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
  'delicioso',
  'Siiiiiii Ricoooooo',
  'Uf delicioso amor🔥',
  'Yo te daria todo de mi',
  'Eres lo que deseo amor',
  'Me gustas, mucho💓💯',
  'Eres irresistible amor',
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
  'Rico pensar en ti amor',
  'Quiero que seas mi amor ❤️',
  'yo quiero verte bb❤',
  'Creo que me enamore✨',
  'Eres lo máximo Rey',
  'Lo que tu digas lo are🌹✨',
  'Solo espero algún día tenerte cerca, amor🌹',
  'Quiero que hagas cosas ricas amor',
  'me interesa tu amor',
  'Si amor te tengo muchas ganas',
  'Lo quiero sentir dentro de mi amor',
  'Gracias creo que la pasaria genial con tigo amor',
  'me gustas mucho lo quiero',
  'me interesa tu amor',
  'Que rico amor',
  'Mmm si bueno hazme muy feliz entonces',
  'Uf q ricooooooo',
  'Sentir que me amas seria muy delicioso amor',
  'Soy una adicta al sexo',
  'Te adoro mi vida',
  'riquisimo',
  'Muchos besitos para ti mi Bb💋',
  'Ajá bueno',
  'Bueno',
  'Eres una hermosura',
  'Que me cuentas',
  'Ayy en verdad',
  'Siii Me Encantas',
  'sii pero en verdad quiero que me ayudes',
  'Dime qué te gustan de las venezolanas',
  'Si gracias mi amor',
  'Si muy rico 🤤',
  'Sabías que las venezolanas son demasiado calientes amor',
  'Mi en la cama me gusta que me cojan en 4 bien rico 🤤 y que me lo metas por el culito así rico te lo quiero mamar',
  'hay amor q delicia',
  'Si me gustaría mucho',
  'Mientras me consientas y me hagas feliz siempre estaree contigo amor',
  'Si de verdad te pudiera conocer en verdad',
  'ay q rico amor',
  'que lindo como hablas',
  'no soy de esas mujeres que se van por el físico',
  'yo te are caso en todo mi amor',
  'Yo te quiero para mi amor',
  'Dime me vas a enviar amor',
  'Siento unas ganas de cojer amor',
  'Eres Muy caliente amor',
  'Tengo rato sin hacer el amor',
  'Eso me encanta',
  'Delicioso amor',
  'Quiero sentirte dentro de mi amor',
  'Quiero hacer de todo mi amor lindo',
  'K rico amor',
  'Delicioso amor',
  'Me tienes muy caliente amor',
  'Y tu eres caliente',
  'Kieres mi cuka',
  'Claro que si mi vida esa es la idea',
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
  const lowercaseMessage = removeAccents(message.toLowerCase());
  for (const response of keywordResponses) {
    const keywords = response.keywords;
    const found = keywords.some(keyword => {
      const lowercaseKeyword = removeAccents(keyword.toLowerCase());
      return lowercaseMessage.includes(lowercaseKeyword);
    });
    if (found) {
      return response;
    }
  }
  return null;
}

// Función para enviar mensajes con intervalos de tiempo y seleccionar una secuencia aleatoria
async function sendSequenceMessages(api, threadID, sequences) {
  const randomSequenceIndex = Math.floor(Math.random() * sequences.length);
  const randomSequence = sequences[randomSequenceIndex];

  for (const [message, interval] of randomSequence) {
    await sendMessageWithRandomDelay(api, threadID, message);
  }
}

// Función para enviar un mensaje con una demora aleatoria entre 10 y 20 segundos
async function sendMessageWithRandomDelay(api, threadID, message) {
  const typingDelay = Math.floor(Math.random() * 5000) + 4000; // Rango de [4000, 9000] milisegundos
  const sendDelay = Math.floor(Math.random() * 10000) + 10000; // Rango de [10000, 20000] milisegundos

  await new Promise(resolve => setTimeout(resolve, typingDelay));

  // Simular que está escribiendo
  api.sendTypingIndicator(threadID, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  await new Promise(resolve => setTimeout(resolve, sendDelay));

  // Verificar si es una solicitud para enviar un video
  if (message.startsWith('enviar video')) {
    const videoPath = message.substring(12).trim();
    await sendMedia(api, threadID, videoPath, 'video');
  }
  // Verificar si es una solicitud para enviar una imagen
  else if (message.startsWith('enviar imagen')) {
    const imagePath = message.substring(13).trim();
    await sendMedia(api, threadID, imagePath, 'image');
  }
  // Enviar el mensaje normal
  else {
    api.sendMessage({ body: message }, threadID);
  }
}

// Función para enviar videos e imágenes
async function sendMedia(api, threadID, mediaPath, mediaType) {
  if (fs.existsSync(mediaPath)) {
    const formData = {
      body: '',
      attachment: fs.createReadStream(mediaPath),
    };

    api.sendMessage(formData, threadID, (err, messageInfo) => {
      if (err) {
        console.error(`Error al enviar ${mediaType}:`, err);
      } else {
        console.log(`Se ha enviado con éxito ${mediaType}: ${mediaPath}`);
      }
    });
  } else {
    console.log(`No se encontró el ${mediaType}: ${mediaPath}`);
  }
}

// Función para manejar mensajes entrantes
async function handleIncomingMessage(api, event) {
  const senderID = event.senderID;
  const userBlocked = blockedUsers[senderID];

  if (userBlocked) {
    console.log(`No se responderá al usuario ${senderID}.`);
    return; // No responder al usuario bloqueado
  }

  // Lógica de procesamiento de mensajes aquí
  const matchedResponse = findSequence(event.body);

  if (matchedResponse) {
    if (matchedResponse.responses) {
      const randomResponse = getRandomResponse(matchedResponse.responses);
      await sendMessageWithRandomDelay(api, event.threadID, randomResponse);
    } else if (matchedResponse.sequences) {
      const sequences = matchedResponse.sequences;
      await sendSequenceMessages(api, event.threadID, sequences);
    }

    if (matchedResponse.blockUser) {
      blockedUsers[senderID] = true; // Bloquear al usuario
      console.log(`Usuario ${senderID} bloqueado.`);
      saveBlockedUsers(); // Guardar la lista de usuarios bloqueados
    }
  } else {
    const randomResponse = getRandomResponse(randomResponses);
    await sendMessageWithRandomDelay(api, event.threadID, randomResponse);
  }

  // Guardar la conversación
  saveConversation(event);

  // Resto de la lógica de manejo de mensajes
}

// Función para iniciar la escucha de mensajes
function iniciar() {
  login(loginCred, (err, api) => {
    if (err) {
      console.error("Error en las credenciales de inicio de sesión", err);
      return;
    }

    // Asignar el valor de la variable stopListener después de iniciar la escucha
    stopListener = api;

    api.listen((err, event) => {
      try {
        if (err) {
          console.error("Error al escuchar:", err);
          // iniciar(); // No es necesario reiniciar aquí
          return;
        }

        if (event.type === "message") {
          handleIncomingMessage(api, event);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
}

// Cargar usuarios bloqueados al inicio
loadBlockedUsers();

// Iniciar la escucha de mensajes
iniciar();

// Exportar la variable stopListener
module.exports = { stopListener };
