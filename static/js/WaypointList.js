// import {WaypointNS} from 'Waypoint.js';

export var WaypointListNS = {
	WaypointList:function(log_fn = null)
	{
		// ----- validation -----

		// ----- consts -----
		this.meters_per_degree = 111139.0; // ish...
		this.feet_per_meter = 3.28084;

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};

		this.waypoints = [];

		// tracks segments between points
		this.segments = [];
		this.newSegment = function(point1, point2) {
			// TODO: take increasing latitude into account!
			const lng_diff = point2.lng() - point1.lng();
			const lat_diff = point2.lat() - point1.lat();
			const distance_meters = Math.sqrt(Math.pow(lng_diff,2) + Math.pow(lat_diff,2)) * this.meters_per_degree;

			return { point1, point2, distance_meters };
		},

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

			// add segment?
			if (this.waypoints.length >= 2)
			{
				const last_point = this.waypoints.at(-1);
				const next_to_last_point = this.waypoints.at(-2);
				const new_segment = this.newSegment(next_to_last_point, last_point);
				this.segments.push(new_segment);
			}
		}

		// ----------------------------------------------------------------------
		this.getPoints = function()
		{
			return this.waypoints;
		}

		// ----------------------------------------------------------------------
		// distance between all waypoints
		this.getDistanceMeters = function()
		{
			const total_distance_meters = this.segments.reduce((accum, cur_seg) => accum + cur_seg.distance_meters, 0);
			return total_distance_meters;
		}

		// ----------------------------------------------------------------------
		// warning: you might get nulls back for elevation values if they haven't
		// been fetched yet
		this.getElevationInfo = function()
		{
			let min_elevation = undefined;
			let max_elevation = undefined;
			let vertical_extent = 0;

			this.waypoints.forEach(cur_pt => {
				// a bit tricky, as 0 is a valid value
				if (typeof cur_pt.elevation !== "undefined")
				{
					const cur_elev = cur_pt.elevation;
					min_elevation = min_elevation !== undefined ? Math.min(cur_elev, min_elevation) : cur_elev;
					max_elevation = max_elevation !== undefined ? Math.max(cur_elev, max_elevation) : cur_elev; 
				}
			});

			// since elevation is fetched, it might have been null in all points
			if (max_elevation !== null && min_elevation !== null)
			{
				vertical_extent = max_elevation - min_elevation;
			}

			return { min_elevation, max_elevation, vertical_extent };
		}

		this.log("WaypointList constructed");
		return this;
	}	// end constructor
} // end WaypointListNS