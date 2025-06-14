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
];

[...botNames].forEach((n, i, a) => {
    const targetIndex = Math.min(Math.floor(Math.random() * a.length), a.length - 1);
    botNames.splice(i, 1);
    botNames.splice(targetIndex, 0, n);
});

export class BotNamePool {
    private static index = 0;

    public static get() {
        if (this.index == botNames.length)
            this.index = 0;

        return botNames[this.index++];
    }

    public static getAnon() {
        return "Anon" + (Math.random() * 999 | 0);
    }
}
