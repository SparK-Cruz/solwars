import Result from './result';
import BVH    from './bvh';
import SAT    from './sat';
import BVHBranch from './bvh_branch';

/**
 * The base class for bodies used to detect collisions
 * @class
 * @protected
 */
export default class Body {
	public x :number;
	public y :number;
	public padding :number;

	public _circle :boolean;
	public _polygon :boolean;
	public _point :boolean;

	public _bvh :BVH;
	public _bvh_branch = false;
	public _bvh_parent :BVH | BVHBranch;
	public _bvh_padding :number;

	public _bvh_min_x :number;
	public _bvh_min_y :number;
	public _bvh_max_x :number;
	public _bvh_max_y :number;


	/**
	 * @constructor
	 * @param {Number} [x = 0] The starting X coordinate
	 * @param {Number} [y = 0] The starting Y coordinate
	 * @param {Number} [padding = 0] The amount to pad the bounding volume when testing for potential collisions
	 */
	constructor(x = 0, y = 0, padding = 0) {
		/**
		 * @desc The X coordinate of the body
		 * @type {Number}
		 */
		this.x = x;

		/**
		 * @desc The Y coordinate of the body
		 * @type {Number}
		 */
		this.y = y;

		/**
		 * @desc The amount to pad the bounding volume when testing for potential collisions
		 * @type {Number}
		 */
		this.padding = padding;

		/** @private */
		this._circle = false;

		/** @private */
		this._polygon = false;

		/** @private */
		this._point = false;

		/** @private */
		this._bvh = null;

		/** @private */
		this._bvh_parent = null;

		/** @private */
		this._bvh_branch = false;

		/** @private */
		this._bvh_padding = padding;

		/** @private */
		this._bvh_min_x = 0;

		/** @private */
		this._bvh_min_y = 0;

		/** @private */
		this._bvh_max_x = 0;

		/** @private */
		this._bvh_max_y = 0;
	}

	/**
	 * Determines if the body is colliding with another body
	 * @param {Circle|Polygon|Point} target The target body to test against
	 * @param {Result} [result = null] A Result object on which to store information about the collision
	 * @param {Boolean} [aabb = true] Set to false to skip the AABB test (useful if you use your own potential collision heuristic)
	 * @returns {Boolean}
	 */
	collides(target :Body, result :Result = null, aabb = true) {
		return SAT(this, target, result, aabb);
	}

	/**
	 * Returns a list of potential collisions
	 * @returns {Array<Body>}
	 */
	potentials() {
		const bvh = this._bvh;

		if(bvh === null) {
			throw new Error('Body does not belong to a collision system');
		}

		return bvh.potentials(this);
	}

	/**
	 * Removes the body from its current collision system
	 */
	remove() {
		const bvh = this._bvh;

		if(bvh) {
			bvh.remove(this, false);
		}
	}

	/**
	 * Creates a {@link Result} used to collect the detailed results of a collision test
	 */
	createResult() {
		return new Result();
	}

	/**
	 * Creates a Result used to collect the detailed results of a collision test
	 */
	static createResult() {
		return new Result();
	}
};
