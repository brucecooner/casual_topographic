var MapLinesNS = {

	MapLines:function(log_fn = null, google_map, max_points_count)
	{
		// ----- consts -----
		// color of stack trace lines
		// this.trace_output_color = "#888888";

		// ----- variables -----

		// ----------------------------------------------------------------------
		this.log = log_fn ? log_fn : () => {};
		this.google_map = google_map;
		this.max_points_count = max_points_count;

		this.next_point_id = 0;

		// will be populated with: { lng:number, lat:number, id:number }
		this.points = [];

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
		this.addPoint = function(mapsMouseEvent)
		{
			this.log("addPoint():");
			this.log(mapsMouseEvent);

			if (this.points.length < this.max_points_count)
			{
				const path = this.poly_line.getPath();
				path.push(mapsMouseEvent.latLng);

				this.points.push( { "lng": mapsMouseEvent.latLng.lng(), "lat": mapsMouseEvent.latLng.lat(), "id": this.next_point_id } );
				this.next_point_id++;
			}
			else
			{
				this.log(`reached max point count (${this.max_points_count})`);
			}
		}

		this.poly_line = this.makeMapPath(google_map);

		this.log("MapLines constructed");
		return this;
	}	// end constructor
} // end MapLinessNS