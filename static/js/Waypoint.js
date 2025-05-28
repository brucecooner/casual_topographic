export var WaypointNS = {
	// there is no single specification about which dimension comes first, so I will reject
	// either and demand an object, but allow for two key name sets on that object
	Waypoint:function(lat, lng, elevation)
	{
		this.longitude = undefined;
		this.latitude = undefined;
		this.elevation = undefined;
		
		// more to come...

		this.latitude = lat;
		this.longitude = lng;

		this.elevation = elevation;
	}
};
