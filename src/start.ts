import express from "express";
import { Server } from "http";
import { Room } from "./server/room.js";
import { Config } from "./space/config.js";
import { BotsConfig } from "./space/config_interfaces.js";

import { BotManager } from "./server/bots/bot_manager.js";

const app = express();
const server = new Server(app);

// Static files
app.use("/", express.static("./client"));
app.use("/", express.static("./dist/client"));

Config.read(() => {
    const STATIC_PORT = Config.serverPort;

    const port = process.env.PORT || STATIC_PORT;
    process.env.UV_THREADPOOL_SIZE = "30";

    let mapName = 'default';
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
