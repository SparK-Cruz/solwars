// using require because npm sucks with typings
const express = require("express");
import { Server } from "http";
import { Room } from "./server/room";
import { Config, BotsConfig } from "./space/config";

import { BotManager } from "./server/bots/bot_manager";

const app = express();
const server = new Server(app);

// Static files
app.use("/", express.static(__dirname + "/client"));

Config.read(() => {
    const STATIC_PORT = Config.serverPort;

    const port = process.env.PORT || STATIC_PORT;
    process.env.UV_THREADPOOL_SIZE = "30";

    let mapName = 'kuiperbelt';
    const mapArgIndex = process.argv.indexOf('-map');
    if (mapArgIndex !== -1) {
        mapName = process.argv[mapArgIndex+1] ?? mapName;
    }

    const room = new Room(server, mapName);
    server.listen(port);
    room.open();

    console.log("Serving on port " + port);

    // BOTs
    if (!process.argv.includes("no-bots")) {
        const botman = new BotManager(room);
        Config.bots.forEach((config: BotsConfig) => {
            botman.add(config.count, config);
        });
    }
});
