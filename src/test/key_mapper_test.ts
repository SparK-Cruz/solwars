import { KeyMapper } from "../client/key_mapper";
import { Mapping } from "../space/entities/ships/mapping";

(<any>global).localStorage = {};
const mapper = new KeyMapper();
console.log('Defaults');
console.log(mapper.unpack());
mapper.unmap('KeyA');
mapper.unmap('KeyD');
mapper.unmap('CtrlLeft');
mapper.unmap('ShiftLeft');
mapper.map('KeyW', Mapping.FORWARD);
mapper.map('KeyS', Mapping.BACKWARD);
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
mapper.toggle('CtrlLeft', Mapping.SHOOT);
console.log('Toggle ctrl');
console.log(mapper.unpack());
mapper.toggle('CtrlLeft', Mapping.SHOOT);
console.log('Toggle ctrl');
console.log(mapper.unpack());
