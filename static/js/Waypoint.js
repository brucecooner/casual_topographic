export var WaypointNS = {

	next_point_id : 0,

	Waypoint:function(lat, lng, elevation)
	{
		this.longitude = undefined;
		this.latitude = undefined;
		this.elevation = undefined;
		this.id = undefined;

		// more to come...

		this.latitude = lat;
		this.longitude = lng;

		this.elevation = elevation;

		this.id = WaypointNS.next_point_id++;

		this.lat = function() { return this.latitude; }
		this.lng = function() { return this.longitude; }
	}
};
