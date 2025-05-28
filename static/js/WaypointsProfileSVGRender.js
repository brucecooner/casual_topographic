// ============================================================================
// ============================================================================
var WaypointsProfileSVGRenderNS = {

	WaypointsProfileSVGRender:function(log_fn = null, width, height, svgee, handleSVG_fn)
	{
		// ----- consts -----

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};
		this.svgee = svgee;
		this.handleSVG = handleSVG_fn;

		this.width = width;
		this.height = height;

		// ----------------------------------------------------------------------
		// receives: [ {lng:number, lat:number, elevation:number (other cruft) }, ... ] 
		this.renderPoints = function(points)
		{
			this.log("rendering...");
			const point_count = points.length;

			if (point_count < 2)
			{
				this.log("point_count < 2, not rendering");
				return;
			}

			// need min/max
			let min_elevation = null;
			let max_elevation = null;
			points.forEach(cur_pt => {
				if (cur_pt["elevation"])
				{
					const cur_elev = cur_pt["elevation"];
					min_elevation = min_elevation !== null ? Math.min(cur_elev, min_elevation) : cur_elev;
					max_elevation = max_elevation !== null ? Math.max(cur_elev, max_elevation) : cur_elev; 
				}
			});
			const vertical_extent = max_elevation - min_elevation;

			this.log(`min_elevation: ${min_elevation}  max_elevation: ${max_elevation}  vertical_extent:${vertical_extent}`);

			// this ain't right, the distance between pixels is a function of their coordinates!
			// TODO: so fix that later
			const pixels_between_points = this.width / (point_count-1);
			const pixels_per_feet = this.height / vertical_extent;
			this.log(`pixels_between_points:${pixels_between_points}  pixels_per_feet:${pixels_per_feet}`);

			svgee.new(this.width, this.height);

			// want to draw them in pairs, so we can skip those without an elevation yet
			let current_x = 0;
			// note: going to index points.length-1 because drawing in pairs
			for (let current_point_index = 0; current_point_index <= points.length - 2; current_point_index += 1)
			{
				const current_point = points[current_point_index];
				const next_point = points[current_point_index + 1];

				this.log(`current_point_index: ${current_point_index}`);
				this.log(`current_point`);
				this.log(current_point);

				if (current_point["elevation"] !== null && next_point["elevation"] !== null)
				{
					// flip y in canvas
					const y1 = this.height - ((current_point["elevation"] - min_elevation) * pixels_per_feet);
					const y2 = this.height - ((next_point["elevation"] - min_elevation) * pixels_per_feet);
					// this.line(current_x, y1, current_x + pixels_between_points, y2);
					const cur_line = svgee.line(current_x, y1, current_x + pixels_between_points, y2);
					svgee.appendNode(cur_line);
				}
				current_x += pixels_between_points;
			}

			const svg_text = svgee.generateSVG();
			this.handleSVG(svg_text);
		}

		// ----------------------------------------------------------------------
		this.render = function(waypoint_list)
		{
			this.log("render()");
			const segments_count = waypoint_list.segments.length;

			if (segments_count < 1)
			{
				this.log("no segments to render");
				return;
			}

			// this.log("width:", width, "  height:", height);

			svgee.new(this.width, this.height);

			// need to know what fraction of total each segment represents
			const total_distance_meters = waypoint_list.getDistanceMeters();

			if (!total_distance_meters)
			{
				this.log("total_distance_meters is false, not rendering");
			}

			// will have to scale y with elevation extent
			const elev_info = waypoint_list.getElevationInfo();

			const vert_pixels_per_meter = elev_info.vertical_extent ? this.height / elev_info.vertical_extent : 0;

			// this.log("total_distance_meters:", total_distance_meters);
			// this.log("elev info:", elev_info);
			// this.log("vert pix per meter:", vert_pixels_per_meter);

			let current_x = 0;
			waypoint_list.segments.forEach(cur_seg => {
				const horz_pixels = this.width * (cur_seg.distance_meters / total_distance_meters);

				const y1 = this.height - ((cur_seg.point1.elevation - elev_info.min_elevation) * vert_pixels_per_meter);
				const y2 = this.height - ((cur_seg.point2.elevation - elev_info.min_elevation) * vert_pixels_per_meter);

				const new_line = svgee.line(current_x, y1, current_x + horz_pixels, y2);
				svgee.appendNode(new_line);

				current_x += horz_pixels;
			});

			const svg_text = svgee.generateSVG();
			this.handleSVG(svg_text);
		}

		this.log("WaypointsProfileSVGRender constructed");
		return this;
	}	// end constructor
}
