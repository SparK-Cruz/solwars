// import { JoinForm } from "./frontend/join_form.js";
// import { KeysForm } from "./frontend/keys_form.js";

// import { AssetManager } from './assets.js';
// import e = require("express");

// const assman = new AssetManager();
// const loading = <HTMLElement>document.getElementById("loading");
// const frontend = <HTMLElement>document.getElementById("frontend");

// let joinForm: JoinForm = null;
// let keysForm: KeysForm = null;

// function customEvent(name: string, data: any) {
//     const e = <any>new Event(name);
//     e.data = data;
//     return e;
// }

// assman.on("load", () => {
//     frontend.style.display = "block";
//     loading.style.display = "none";

//     joinForm = new JoinForm();
//     keysForm = new KeysForm();

//     joinForm.on('join', (e) => {
//         window.dispatchEvent(customEvent('joingame', e));
//     })
// });

// window.addEventListener('gamestart', () => {
//     frontend.style.display = "none";
//     (<any>joinForm).hide();
// });

// window.addEventListener('gamestop', () => {
//     frontend.style.display = "block";
//     (<any>joinForm).show();
// });

// assman.preload();
