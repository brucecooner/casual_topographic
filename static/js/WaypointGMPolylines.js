export var WaypointGMPolylinesNS = {
	WaypointGMPolylines:function(google_map, log_fn = null)
	{
		// ----- validation -----
		if (!google_map)
		{
			const err = `WaypointGMPolylines.constructor(): google_map must be provided`;
			throw new Error(err);
		}

		// ----- consts -----

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};

		// ----------------------------------------------------------------------
		this.makeMapPath = function(g_map)
		{
			const path = new google.maps.Polyline({
				path: [],
				geodesic: false,
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2,
				clickable: false,
			});

			path.setMap(g_map);

			return path;
		}

		// ----------------------------------------------------------------------
		this.addPoint = function(waypoint)
		{
			this.log("addPoint()");

			const path = this.poly_line.getPath();
			path.push(waypoint);
		}

		// ----------------------------------------------------------------------
		this.shutDown = function()
		{
			this.log("shutDown()");

			this.poly_line.setMap(null);
			this.poly_line = null;
		}

		// ----------------------------------------------------------------------

		this.poly_line = this.makeMapPath(google_map);

		this.log("WaypointGMPolylines constructed");
		return this;
	}	// end constructor
} // end WaypointGMPolylinesNS