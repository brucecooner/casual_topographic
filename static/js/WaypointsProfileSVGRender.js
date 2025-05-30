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
			const total_length_meters = waypoint_list.getLengthMeters();

			if (!total_length_meters)
			{
				this.log("total_length_meters is false, not rendering");
			}

			// will have to scale y with elevation extent
			const elev_info = waypoint_list.getElevationInfo();

			const vert_pixels_per_meter = elev_info.vertical_extent ? this.height / elev_info.vertical_extent : 0;

			let current_x = 0;
			waypoint_list.segments.forEach(cur_seg => {
				const horz_pixels = this.width * (cur_seg.length_meters / total_length_meters);

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
