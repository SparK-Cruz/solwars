import subject from '../client/input_store.js';
import { KeyMapper } from "../client/frontend/KeyMapper.js";
import { Mapping } from "../space/entities/ships/mapping.js";

subject.data.keyMapping = {
    'ArrowUp': Mapping.FORWARD, //Arrow up
    'ArrowDown': Mapping.BACKWARD, //Arrow down
    'ArrowLeft': Mapping.LEFT, //Arrow left
    'KeyA': Mapping.LEFT, //A
    'ArrowRight': Mapping.RIGHT, //Arrow right
    'KeyD': Mapping.RIGHT, //D
    'KeyQ': Mapping.STRAFE_LEFT, //Q
    'KeyE': Mapping.STRAFE_RIGHT, //E
    'Space': Mapping.SHOOT, //SPACE BAR
    'ShiftLeft': Mapping.AFTERBURNER, //SHIFT
};
const mapper = new KeyMapper(subject.data.keyMapping);

const showResult = () => {
    return JSON.stringify(subject.export(), null, 4);
};

console.log('Defaults');
console.log(showResult());
mapper.unmap('KeyA');
mapper.unmap('KeyD');
mapper.unmap('ShiftLeft');
mapper.map('KeyW', Mapping.FORWARD);
mapper.map('KeyS', Mapping.BACKWARD);
console.log('WASDish');
console.log(showResult());
mapper.toggle('CtrlLeft', Mapping.SHOOT);
console.log('Toggle ctrl');
console.log(showResult());
mapper.toggle('CtrlLeft', Mapping.SHOOT);
console.log('Toggle ctrl');
console.log(showResult());
