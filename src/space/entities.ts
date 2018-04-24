export interface Entity {
  memId :string;
  type :EntityType;
  x :number;
  y :number;
  vx :number;
  vy :number;
  angle :number;
  vangle :number;
  health :number;
  damage : number;

  step() :void;
}

export interface EntityType {
  name :string
}

export namespace EntityType {
  export const Structure = {name: 'structure'};
  export const ItemDrop = {name: 'itemdrop'};
  export const Ship = {name: 'ship'};
}
