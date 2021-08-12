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

    console.log(command);

    switch (command[0].toLowerCase()) {
        case "hilfe":
            commandHelp(message.channel);
            break;
        case "begrüß jemanden":
            commandGreet(message.channel, command[1]);
            break;
        case "sende eine katze":
            commandCat(message.channel, command[1]);
            break;
        case "auswählen":
            selectedChannel = message.channel;
            message.channel.send("Es wurde gewählt.");
            break;
        case "stonks":
        case "wie stengan die aktien":
            commandStock(message.channel, command[1]);
            break;
        case "wie gehts im pfeif?":
            commandPfeif(message.channel);
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

async function commandPfeif(channel) {
    const gestern = getYesterday(2);
    const heute = getYesterday(0);
    const pfeifAktien = 5;
    const pfeifKaufPreis = 4.04;
    let pfeifAktuellPreisPromise = await yahooStockPrices.getCurrentData("NOK");
    let pfeifAktuellPreis = pfeifAktuellPreisPromise.price;
    let pfeifGesternPreisVerlauf = await yahooStockPrices.getHistoricalPrices(
        gestern.getMonth(),
        gestern.getDate(),
        gestern.getFullYear(),
        heute.getMonth(),
        heute.getDate(),
        heute.getFullYear(),
        "NOK",
        "1d");
    let pfeifGesternPreis = pfeifGesternPreisVerlauf[1].close;
    let pfeifInsgesamt = pfeifAktien * (pfeifAktuellPreis - pfeifKaufPreis);
    let pfeifHeute = Math.round(pfeifAktien * (pfeifAktuellPreis - pfeifGesternPreis) * 100);
    console.log(pfeifGesternPreisVerlauf);
    let message = "";

    if (pfeifHeute < 0)
        message += `Auwehtschal, da Pfeiffer hot heut scho wieda ${pfeifHeute*-1} Cent Verlust gmocht.`;
    else if (pfeifHeute > 0)
        message += `Wahnsinn, da Pfeiffer hot heut scho ${pfeifHeute} Cent Gewinn verbuchen kennan.`;
    else
        message += "Seit heut hot si genau nix beim Pfeif dau.";

    if (pfeifInsgesamt < 0)
        message += ` Dazua hot a an insgesamten Verlust vo ${(pfeifInsgesamt * -1).toPrecision(3)}$.`;
    else if (pfeifInsgesamt > 0)
        message += ` Oagaweise hot er auf lange sicht scho ${pfeifInsgesamt.toPrecision(3)}$ dazua griagt.`;
    else
        message += " Insgesamt is er auf exakt 0 Gewinn 0 Verlust";

    channel.send(message);
}

function getYesterday(back) {
    let yest = new Date(Date.now());
    yest.setDate(yest.getDate() - back);
    return yest;
}