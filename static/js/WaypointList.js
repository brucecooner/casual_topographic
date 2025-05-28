// import {WaypointNS} from 'Waypoint.js';

export var WaypointListNS = {
	WaypointList:function(log_fn = null)
	{
		// ----- validation -----

		// ----- consts -----

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};

		this.waypoints = [];

		// ----------------------------------------------------------------------
		this.numPoints = function()
		{
			return this.waypoints.length;
		}

		// ----------------------------------------------------------------------
		this.addPoint = function(waypoint)
		{
			this.log("addPoint()");

			this.waypoints.push(waypoint);
		}

		this.log("WaypointList constructed");
		return this;
	}	// end constructor
} // end WaypointListNS