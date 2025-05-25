var MapLinesCanvasRenderNS = {

	MapLinesCanvasRender:function(log_fn = null, canvas)
	{
		// ----- consts -----

		// ----- variables -----
		this.log = log_fn ? log_fn : () => {};

		// canvas stuff
		this.canvas = canvas;

		this.canvas_context = this.canvas.getContext('2d');
		// you get weird disconnected lines if you don't initialize the dash
		this.canvas_context.setLineDash([0,0]);
		this.canvas_context.strokeStyle = "red";

		// ----------------------------------------------------------------------
		this.line = function(x1, y1, x2, y2)
		{
			this.log(`line() ${x1},${y1} to ${x2},${y2}`);

			this.canvas_context.beginPath();
			this.canvas_context.moveTo( x1, y1 );
			this.canvas_context.lineTo( x2, y2 );
			this.canvas_context.stroke();
		}

		// test diagonal line
		// this.line(0,0, this.canvas.width, this.canvas.height);

		// ----------------------------------------------------------------------
		// receives: [ {lng:number, lat:number}, ... ] 
		this.render = function(points)
		{
			this.log("rendering...");
			const point_count = points.length;

			if (point_count < 2)
			{
				this.log("point_count < 2, not rendering");
				return;
			}

			this.canvas_context.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

			// dims we need
			const canvas_width = this.canvas.width;
			const canvas_height = this.canvas.height;
			this.log(`canvas width: ${canvas_width} canvas_height:${canvas_height} point_count:${point_count}`);

			const pixels_between_points = canvas_width / (point_count-1);
			const pixels_per_feet = canvas_height / vertical_extent;
			this.log(`pixels_between_points:${pixels_between_points}  pixels_per_feet:${pixels_per_feet}`);

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
					const y1 = canvas_height - ((current_point["elevation"] - min_elevation) * pixels_per_feet);
					const y2 = canvas_height - ((next_point["elevation"] - min_elevation) * pixels_per_feet);
					this.line(current_x, y1, current_x + pixels_between_points, y2);
				}
				current_x += pixels_between_points;
			}

		}

		// ----------------------------------------------------------------------

		this.log("MapLinesCanvasRender constructed");
		return this;
	}	// end constructor
} // end MapLinessNS