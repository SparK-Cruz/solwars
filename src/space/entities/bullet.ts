import { Entity, EntityType, EntityPool } from '../entities';

class Bullet implements Entity {
    public id :number;
    public type = EntityType.Bullet;

    public sectorKey :string;
    public collisionMap = [[0, 0]];
    public shape :any;

    public x :number;
    public y :number;
    public vx :number;
    public vy :number;
    public angle :number;

    public step() :void {

    }
    public collide(other :Entity, result :any) :void {

    }
}

// Make stage create collision areas
// Allocate entities in collision areas based on coords
// Call check-collisions in each of those where an entity is found
// Store result in cache in case more entities are there, then skip
// Result is list of collisions, with angles, intersections and what not.
// Call collide method in entities, pass collision details to it.
// Each entity reacts based on collision data.
