var MapLinesNS = {

	MapLines:function(log_fn = null, google_map, max_points_count, elevation_fn)
	{
		// ----- consts -----

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};
		this.google_map = google_map;
		this.max_points_count = max_points_count;
		this.getElevation = elevation_fn;

		this.next_point_id = 0;

		// will be populated with: { lng:number, lat:number, id:number }
		this.points = [];


		// called when map lines thinks re-render is needed
		this.render_callback = null;

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
		this.checkForRenderReadiness = function()
		{
			this.log("checkForRenderReadiness()");

			let ready = true;

			// do all points have elevation, and no errors?
			for (let i = 0; i < this.points.length; ++i)
			{
				const cur_pt = this.points[i];
				this.log(`checking point ${cur_pt.id}`);
				if (cur_pt.elevation == null || cur_pt.error)
				{
					ready = false;
					break;
				}
			}

			if (ready)
			{
				this.log("CAN render");
			}
			else
			{
				this.log("can NOT render");
			}
		}

		// ----------------------------------------------------------------------
		this.newPoint = function(mapsMouseEvent)
		{
			let new_point = {};

			new_point["lat"] = mapsMouseEvent.latLng.lat();
			new_point["lng"] = mapsMouseEvent.latLng.lng();
			new_point["id"] = this.next_point_id;
			new_point["elevation"] = null;
			new_point["error"] = null;

			// note: async
			this.getElevation(mouse_pointer_lng_lat).then(elevation => {
				new_point["elevation"] = elevation;
				this.log(`point id:${new_point["id"]} elev: ${elevation}`);

				// this.checkForRenderReadiness();
				this.render_callback(this.points);

			}).catch(err => {
				this.log(`point id:${new_point["id"]} error getting elev: ${err}`);
				console.log(err);
				new_point["error"] = err;
			});

			this.next_point_id += 1;

			return new_point;
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

				const new_point = this.newPoint(mapsMouseEvent);
				this.points.push( new_point );
			}
			else
			{
				this.log(`reached max point count (${this.max_points_count})`);
			}
		}

		// ----------------------------------------------------------------------
		this.shutDown = function()
		{
			this.poly_line.setMap(null);
			this.poly_line = null;
		}

		// ----------------------------------------------------------------------

		this.poly_line = this.makeMapPath(google_map);

		this.log("MapLines constructed");
		return this;
	}	// end constructor
} // end MapLinessNS