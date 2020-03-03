import { KeyMapper } from "../client/key_mapper";
import { Mapping } from "../space/entities/ships/mapping";

(<any>global).localStorage = {};
const mapper = new KeyMapper();
console.log('Defaults');
console.log(mapper.unpack());
mapper.unmap(65);
mapper.unmap(68);
mapper.unmap(17);
mapper.unmap(16);
mapper.map(87, Mapping.FORWARD);
mapper.map(83, Mapping.BACKWARD);
console.log('WASDish');
console.log(mapper.unpack());
mapper.pack();
console.log('Saved');
console.log(localStorage.keyMapping);
mapper.restore();
console.log('Restored')
console.log(mapper.unpack());
mapper.pack();
console.log('Saved')
console.log(localStorage.keyMapping);
mapper.toggle(17, Mapping.SHOOT);
console.log('Toggle ctrl');
console.log(mapper.unpack());
mapper.toggle(17, Mapping.SHOOT);
console.log('Toggle ctrl');
console.log(mapper.unpack());
