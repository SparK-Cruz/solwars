import { Config } from "./space/config";
import { Bot } from "./server/bot";

Config.read(() => {
    let bots = Config.bots;

    if (typeof process.argv[2] != 'undefined') {
        bots = parseInt(process.argv[2]);
    }

    Bot.set(bots);
});
