const {Client, MessageAttachment} = require("discord.js");
const auth = require("../secret/auth.json");
const readline = require("readline");
const yahooStockPrices = require("yahoo-stock-prices");
let selectedChannel = null;

const christusBot = new Client();

christusBot.on("ready", () => console.log(`Bot is ready. User ${christusBot.username}`))

christusBot.on("message", messageHandler);

const rl = readline.createInterface(process.stdin, process.stdout);

christusBot.login(auth.token);

function messageSender() {
    rl.question("Message -> ", sendMessageToSelected);
}

function sendMessageToSelected(answer) {
    selectedChannel.send(answer);
    messageSender();
}

messageSender();

function messageHandler(message) {
    if (message.content.startsWith("Christus Schreiber, "))
        christusMessageHandler(message);
    else if (message.content.startsWith("stonks $"))
        stonksMessageHandler(message);
}

function christusMessageHandler(message) {
    let command = message.content.substr(20).split(", ");

    switch (command[0]) {
        case "hilfe":
            commandHelp(message.channel);
            break;
        case "begrüß jemanden":
            commandGreet(message.channel, command[1]);
            break;
        case "sende eine Katze":
            commandCat(message.channel, command[1]);
            break;
        case "auswählen":
            selectedChannel = message.channel;
            message.channel.send("Es wurde gewählt.");
            break;
        case "stonks":
        case "wie stengan die Aktien":
            commandStock(message.channel, command[1]);
            break;
        case "test":
            //message.channel.send("Christus Schreiber, test");
            break;
        default:
            message.channel.send("Was meinst du? Rufe hilfe und du bekommst hilfe.")
    }
}

function stonksMessageHandler(message) {
    let stock = message.content.substring(8);
    commandStock(message.channel, stock);
}

function commandGreet(channel, name) {
    channel.send(`Servus ${name}, sei willkommen`);
}


function commandHelp(channel) {
    channel.send("Dir sei geholfen.");
}

function commandCat(channel, option) {
    if (option === "" || !option) {
        let messageAttachment = new MessageAttachment("https://cataas.com/cat");
        messageAttachment.name = "gadse.png";
        channel.send(messageAttachment);
    } else if (option === "die sich bewegt") {
        let messageAttachment = new MessageAttachment("https://cataas.com/cat/gif");
        messageAttachment.name = "gadse.gif";
        channel.send(messageAttachment);
    }
}

async function commandStock(channel, stock) {
    try {
        let price = await yahooStockPrices.getCurrentData(stock.toUpperCase());
        channel.send(`Die Aktie ${stock.toUpperCase()} steht grod auf ${price.price} ${price.currency}`);
    } catch (e) {
        channel.send("Do is jetzt wos foisch grennd du koffa");
    }
}
