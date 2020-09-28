// using require because npm sucks with typings
const express = require("express");
import { Server } from "http";
import { Room } from "./server/room";
import { Config, BotsConfig } from "./space/config";

// test stuff
import { BotManager } from "./server/bots/bot_manager";

const app = express();
const server = new Server(app);

// Static files
app.use("/", express.static(__dirname + "/client"));

Config.read(() => {
    const STATIC_PORT = Config.serverPort;

    const port = process.env.PORT || STATIC_PORT;

    const room = new Room(server);
    server.listen(port);
    room.open();

    console.log("Serving on port " + port);

    // BOTs
    if (typeof process.argv[2] != "undefined"
        && process.argv[2] === "no-bots")
        return;

    const botman = new BotManager(room);
    Config.bots.forEach((config: BotsConfig) => {
        botman.add(config.count, config);
    });
});
