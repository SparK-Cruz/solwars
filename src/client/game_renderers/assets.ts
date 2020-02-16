export class Assets {
  private static pool :any;

  public static fetchAll(assetnames :string[], listener :AssetListener) :void {
    const assets :any[] = [];

    const checkEnd = () => {
      if (assets.filter((x :Asset) => !!x).length === assetnames.length)
        listener.callback.call(listener.target, assets);
    };

    for(let i in assetnames) {
      const index :number = parseInt(i);
      const name = assetnames[index];

      Assets.fetch(name, {target: this, callback: (asset :Asset) => {
        assets[index] = asset;
        checkEnd();
      }});
    }
  }

  public static fetch(assetname :string, listener :AssetListener) :Asset {
    if (assetname.indexOf('img/') === 0)
      return Assets.fetchImage(assetname, listener);
  }

  private static fetchImage(assetname :string, listener :AssetListener) :Asset {
    const asset = new Asset();

    asset.onload(listener);

    asset.content = new Image();
    asset.content.onload = () => {
      asset.triggerLoad();
    };
    asset.content.src = assetname;

    return asset;
  }
}

export class Asset {
  private listeners :AssetListener[] = [];

  public loaded: boolean = false;
  public content: any;

  public onload(listener :AssetListener) {
    this.listeners.push(listener);
  }

  public triggerLoad() {
    this.loaded = true;
    for(let i in this.listeners) {
      let listener = this.listeners[i];
      listener.callback.call(listener.target, this);
    }
  }
}

export interface AssetListener {
  target :any;
  callback :Function;
}
