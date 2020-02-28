import { Config } from "./space/config";
import { Bot } from "./server/bot";

Config.read(() => {
    Bot.set(Config.bots);
});
