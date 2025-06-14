import { Entity } from "./entities.js";

export interface Stage {
  moveEntity(entity: Entity, position: { x: number, y: number }): void;
  add(entity: Entity): void;
  spawn(entity: Entity): void;
  remove(entity: Entity): void;
  addAll(entities: Entity[]): void;
  step(delta: number): number;
  fetchEntitiesAround(point: { x: number, y: number }): Entity[][];
}
