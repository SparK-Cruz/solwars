const botNames = [
    'Albert',
    'Allen',
    'Bert',
    'Bob',
    'Cecil',
    'Clarence',
    'Elliot',
    'Elmer',
    'Ernie',
    'Eugene',
    'Fergus',
    'Ferris',
    'Frank',
    'Frasier',
    'Fred',
    'George',
    'Graham',
    'Harvey',
    'Irwin',
    'Larry',
    'Lester',
    'Marvin',
    'Neil',
    'Niles',
    'Oliver',
    'Opie',
    'Ryan',
    'Toby',
    'Ulric',
    'Ulysses',
    'Uri',
    'Waldo',
    'Wally',
    'Walt',
    'Wesley',
    'Yanni',
    'Yogi',
    'Yuri',
].sort((a, b) => Math.round(Math.random() * 2 - 1));

export class BotNamePool {
    private static index = 0;

    public static get() {
        if (this.index == botNames.length)
            this.index = 0;

        return botNames[this.index++];
    }
}
