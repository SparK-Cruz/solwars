<h1 style="line-height: 1.2rem"><sup style="font-size: 1rem">SubSpace</sup><br/>Sol Wars</h1>

An "arena IO" physics based web version fan game of **SubSpace**: the multiplayer online game released in 1997 by Virgin Interactive Entertainment (VIE) and continued by the community to this day with project [continuum](https://getcontinuum.com/). <sup>([continuum steam page](https://store.steampowered.com/app/352700/Subspace_Continuum/))</sup>

## Requirements:

- nodejs
- yarn

Install *nodejs* for your operating system.

> On **windows**, go to [NodeJS Download page](https://nodejs.org/en/download) and download either the .msi file or use powershell to download it.

> On **mac**, go to [NodeJS Download page](https://nodejs.org/en/download) and download either the .pkg file or use bash to download it.

> On **linux** you use your package manager to download nodejs.

If you downloaded it with *npm* instead of *yarn* you can install *yarn* using:
```
npm install -g yarn
```

## Compiling:

To compile we update the dependencies with yarn and run the build script:

```
yarn
yarn build
```

## Running:

The env var `PORT` controls which port the game server will bind to.

```
PORT=8080 yarn start
```
[http://localhost:8080/](http://localhost:8080/)

To run the server with a map other than the default one use the `-map` argument:

```
PORT=8080 yarn start -map demo
```

To disable bots use the `no-bots` argument:
```
PORT=8080 yarn start no-bots
```

## Configuration:

You can edit the file `config.json` to your heart's content then restart the server.

You can also edit or add any map file in the `maps` folder and use the `-map` option when starting the server.
