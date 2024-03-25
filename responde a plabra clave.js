const fs = require("fs");
const login = require("fb-chat-api");

const loginCred = {
  appState: JSON.parse(fs.readFileSync("session.json", "utf-8")),
};

let running = false;

function handleMessage(api, event) {
  try {
    const reactionKeywords = ["haha", "yawa", "tanga", "gago", "ayie"];
    for (const reactionKeyword of reactionKeywords) {
      if (event.body.includes(reactionKeyword)) {
        const reaction = reactionKeyword === "ayie" ? ":love:" : ":laughing:";
        api.setMessageReaction(reaction, event.messageID, (err) => {
          if (err) {
            console.error(err);
          }
        });
        return; // Stop processing once a reaction keyword is matched
      }
    }

    const customKeywords = {
      "hello": "Hello there! How can I help you?",
      // Puedes agregar más palabras clave y respuestas aquí
    };

    // Verificar si el mensaje contiene alguna palabra clave personalizada
    for (const keyword in customKeywords) {
      if (event.body.includes(keyword)) {
        api.sendMessage(customKeywords[keyword], event.threadID);
        return; // Detener el procesamiento una vez que se encuentra una palabra clave
      }
    }

    // Si no se encuentra ninguna palabra clave, continuar con el manejo predeterminado
    // ...
  } catch (error) {
    console.log(error);
    api.sendMessage("An error has occurred.", event.threadID);
  }
}








let stopListener; // Definir la variable stopListener en el alcance global

function start() {
  login(loginCred, (err, api) => {
    if (err) {
      console.error("Login credentials error", err);
      return;
    }

    api.listen((err, event) => {
      try {
        if (err) {
          console.error("Listen error:", err);
          start();
          return;
        }
      } catch (err) {
        console.error(err);
      }

      if (event.type === "message") {
        handleMessage(api, event);
      }
    });
  });
}

start();
module.exports = { stopListener }; // Exportar la variable stopListener
