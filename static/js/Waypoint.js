export var WaypointNS = {

	next_point_id : 0,

	Waypoint:function(lat, lng, elevation_meters = null)
	{
		// declare
		this.longitude = undefined;
		this.latitude = undefined;
		this.elevation_meters = null;
		this.id = undefined;

		// assign
		this.latitude = lat;
		this.longitude = lng;

		this.elevation_meters = elevation_meters;

		this.id = WaypointNS.next_point_id++;

		// for compatibility with Google Map mouse events
		this.lat = function() { return this.latitude; }
		this.lng = function() { return this.longitude; }

		this.setElevationMeters = function(elev_meters) { this.elevation_meters = elev_meters; }

		// get elevation
		Object.defineProperty(this, "elevation", {
			get: () => { return this.elevation_meters; }
		});

	}
};
