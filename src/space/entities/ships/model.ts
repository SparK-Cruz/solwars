export interface Model {
    id: string;
    name: string;
    make: string;
    description: string;
    polygon: number[][];
    color: string;
    decals: { name: string, color: string }[]
    guns?: { x: number, y: number }[]
    disabled?: boolean
}

export namespace Model {
    export const Warbird: Model = {
        id: 'warbird',
        name: 'HA-46',
        make: 'OConner Domanic',
        description: 'An agile, light fighter.',
        polygon: [
            [2, -13],
            [4, -10],
            [6, -2],
            [15, 4],
            [15, 7],
            [7, 9],
            [6, 14],
            [2, 15],
            [1, 9],
            [0, 9],
            [-1, 15],
            [-5, 14],
            [-6, 9],
            [-14, 7],
            [-14, 4],
            [-5, -2],
            [-3, -10],
            [-1, -13]
        ],
        color: '#cccccc',
        decals: [{
            name: 'decal0',
            color: '#cc3300'
        }]
    }

    export const Javelin: Model = {
        id: 'javelin',
        name: 'FC-12/0',
        make: 'Crummand',
        description: 'A multi-role, fast defensive fighter.',
        polygon: [
            [1, -13],
            [4, -8],
            [7, -3],
            [9, 3],
            [15, 7],
            [14, 9],
            [6, 8],
            [9, 13],
            [4, 15],
            [1, 12],
            [0, 12],
            [-3, 15],
            [-8, 13],
            [-5, 8],
            [-13, 9],
            [-14, 7],
            [-8, 3],
            [-6, -3],
            [-3, -8],
            [0, -13],
        ],
        color: '#ffcc00',
        decals: [{
            name: 'decal0',
            color: '#ffffff'
        }]
    }

    export const Spider: Model = {
        id: 'spider',
        name: 'RSC17',
        make: 'Loakhaed',
        description: 'The leading edge in cloak technology.',
        polygon: [
            [1, -14],
            [5, -4],
            [10, -4],
            [12, -9],
            [14, 5],
            [7, 8],
            [5, 14],
            [2, 14],
            [1, 10],
            [0, 10],
            [-1, 14],
            [-4, 14],
            [-6, 8],
            [-13, 5],
            [-11, -9],
            [-9, -4],
            [-4, -4],
            [0, -14],
        ],
        color: '#336600',
        decals: [{
            name: 'decal0',
            color: '#996600'
        }],
        guns: [
            { x: 1, y: 15 },
            { x: 11, y: 13 },
            { x: -10, y: 13 },
        ]
    }

    export const Leviathan: Model = {
        id: 'leviathan',
        name: 'Ut-59',
        make: 'Ivangrad',
        description: 'A powerful defense bomber.',
        polygon: [
            [1, -15],
            [3, -13],
            [3, -10],
            [7, -10],
            [13, -5],
            [13, 2],
            [8, 6],
            [11, 8],
            [11, 12],
            [4, 15],
            [2, 12],
            [1, 8],
            [0, 8],
            [-1, 12],
            [-3, 15],
            [-10, 12],
            [-10, 8],
            [-7, 6],
            [-12, 2],
            [-12, -5],
            [-6, -10],
            [-2, -10],
            [-2, -13],
            [0, -15],
        ],
        color: '#666699',
        decals: [{
            name: 'decal0',
            color: '#ffff00'
        }]
    }

    export const Terrier: Model = {
        id: 'terrier',
        name: 'Nu-34',
        make: 'Blight Aerospace',
        description: 'Heavily armed attack fighter.',
        polygon: [
            [1, -13],
            [3, -7],
            [10, 3],
            [11, -2],
            [13, 4],
            [13, 11],
            [10, 13],
            [1, 14],
            [0, 14],
            [-9, 13],
            [-12, 11],
            [-12, 4],
            [-10, -2],
            [-9, 3],
            [-2, -7],
            [0, -13],
        ],
        color: '#cc0000',
        decals: [{
            name: 'decal0',
            color: '#ffffff'
        }],
        guns: [
            { x: 11, y: 16 },
            { x: -10, y: 16 },
        ]
    }

    export const Weasel: Model = {
        disabled: true,
        id: 'weasel',
        name: 'ZnK/0-1',
        make: 'Yamakazi Sholi',
        description: 'Advanced weapons recon vessel.',
        polygon: [[-16, 12], [0, -16], [16, 12]],
        color: 'rgb(255, 255, 255)',
        decals: []
    }

    export const Lancaster: Model = {
        disabled: true,
        id: 'lancaster',
        name: '4F/2 HMS',
        make: 'Avro',
        description: 'Experimental bomber/fighter.',
        polygon: [[-16, 12], [0, -16], [16, 12]],
        color: 'rgb(255, 255, 255)',
        decals: []
    }

    export const Shark: Model = {
        disabled: true,
        id: 'shark',
        name: 'SY/9',
        make: 'Lezarwerks',
        description: 'Advanced cloakable fighter with Gravity Drive.',
        polygon: [[-16, 12], [0, -16], [16, 12]],
        color: 'rgb(255, 255, 255)',
        decals: []
    }

    export const Football: Model = {
        disabled: true,
        id: 'football',
        name: 'Football',
        make: 'Venus',
        description: 'A football',
        color: '#ffffff',
        polygon: [
            [ 4, -16],
            [ 10, -11],
            [ 15, -3],
            [ 15, 4],
            [ 10, 10],
            [ 4, 15],
            [-3, 15],
            [-11, 10],
            [-16, 4],
            [-16, -3],
            [-11, -11],
            [-3, 16],
        ],
        decals: [{
            name: 'decal0',
            color: '#ffffff'
        }],
    }

    export const byId: any = (() => {
        const obj = {};
        for (let i in Model) {
            const current = (<any>Model)[i];
            (<any>obj)[current.id] = current;
        }
        return obj;
    })();

    export const all: Model[] = (() => {
        const list = [];
        for (let i in Model) {
            if ((<Model>(<any>Model)[i]).id)
                list.push((<any>Model)[i]);
        }
        return list;
    })();
}
