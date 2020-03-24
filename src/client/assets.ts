import { EventEmitter } from 'events';

export class Assets {
    private static pool :any = {};

    public static fetchAll(assetnames :string[], callback: any) :void {
        const assets :any[] = [];

        const checkEnd = () => {
            if (assets.filter((x :Asset) => x.content.src && x.content.complete).length === assetnames.length)
                callback(assets);
        };

        for(let i in assetnames) {
            const index :number = parseInt(i);
            const name = assetnames[index];

            Assets.fetch(name).once('load', (asset :Asset) => {
                assets[index] = asset;
                checkEnd();
            });
        }
  }

    public static fetch(assetname :string) :Asset {
        if (assetname.indexOf('img/') !== 0) {
            const asset = new Asset();
            setTimeout(() => { asset.emit('load', asset); }, 300);
            return asset;
        }

        const asset = Assets.fetchImage(assetname);
        return asset;
    }

    private static fetchImage(assetname :string) :Asset {
        if (this.pool.hasOwnProperty(assetname)) {
            const asset = this.pool[assetname];
            // cached resources are acting weird, timeout 0 didn't work
            setTimeout(() => { asset.emit('load', asset); }, 300);
            return asset;
        }

        const asset = new Asset();

        asset.content = new Image();
        asset.content.onload = () => {
            asset.emit('load', asset);
        };
        asset.content.src = assetname;

        this.pool[assetname] = asset;

        return asset;
    }
}

export class Asset extends EventEmitter {
    public loaded: boolean = false;
    public content: any;

    public constructor() {
        super();
        this.setMaxListeners(0);
    }
}
