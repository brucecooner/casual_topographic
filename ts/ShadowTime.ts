export class ShadowTime {

	log: Function = () => {};

	// parameters
	day_start_hour: number;

	update_interval_minutes: number;

	// css class of elements to apply shadow to (could be a fancier selector I guess)
	shadowed_elements_class: string;

	box_shadow_blur_radius: number;
	box_shadow_spread: number;

	box_shadow_x_offset_max: number;
	box_shadow_y_offset_max: number;
	box_shadow_y_offset_min: number;

	// computed
	day_length_hours: number;
	day_end_hour:number;

	// -------------------------------------------------------------------------
	// returns hour constrained to day start - day end
	constrainedHour(hour: number): number
	{
		return Math.max(this.day_start_hour, Math.min(hour, this.day_end_hour));
	}

	// -------------------------------------------------------------------------
	// calculates position on unit circle of a dot traveling from PI (-1,0) to
	// 0 (1,0) over the course of a "day"
	calcHourOffset(hours:number, minutes:number): { offset_x:number, offset_y:number }
	{
		// calc hour as number from 0..1
		const hour_in_day = this.constrainedHour(hours) - this.day_start_hour;
		const normalized_hour = Math.min(1.0, Math.max(0.0, (hour_in_day / this.day_length_hours )));

		// box corner follows unit circle from PI (-1,0) to 0 (1,0) (lower half)
		const angle = Math.PI + (normalized_hour * Math.PI);

		const offset_x = Math.cos(angle);
		const offset_y = Math.sin(angle);

		return { offset_x, offset_y };
	}

	// -------------------------------------------------------------------------
	setShadows(offset_x: number, offset_y: number)
	{
		let shadowed_elements = document.getElementsByClassName("timedShadow");

		for (let i = 0; i < shadowed_elements.length; i++) {
			const element = shadowed_elements[i] as HTMLElement;

			element.style.boxShadow = `${offset_x}px ${offset_y}px ${this.box_shadow_blur_radius}px ${this.box_shadow_spread}px rgb(0,0,0,0.4)`;
		}
	}

	// -------------------------------------------------------------------------
	setTime(hours:number, minutes:number)
	{
		this.log("setTime(", hours, ":", minutes);

		const offsets = this.calcHourOffset(hours, minutes);

		// flip y because shadow y_offsets are increasing downward in screenspace
		this.setShadows(offsets["offset_x"] * this.box_shadow_x_offset_max, (-offsets["offset_y"] * this.box_shadow_y_offset_max) + this.box_shadow_y_offset_min);
	}

	// -------------------------------------------------------------------------
	update()
	{
		this.log("update()");

		const current_time = new Date();
		this.setTime(current_time.getHours(), current_time.getMinutes());
	}

	// -------------------------------------------------------------------------
	start()
	{
		this.log("start");

		setInterval(this.update.bind(this), (this.update_interval_minutes * 60) * 1000);
	}

	// -------------------------------------------------------------------------
	constructor(props: {	day_start_hour:number,
								shadowed_elements_class:string,
								box_shadow_blur_radius: number,
								box_shadow_spread: number,
								box_shadow_x_offset_max: number,
								box_shadow_y_offset_max: number,
								box_shadow_y_offset_min: number,
								update_interval_minutes: number,
							 },
					log_fn: Function)
	{
		if (log_fn)
		{
			this.log = log_fn;
		}

		// validation
		if (props.day_start_hour < 0 || props.day_start_hour > 23)
		{
			throw new Error(`ShadowTime: invalid day_start_hour: ${props.day_start_hour}`);
		}
		// day must start before noon
		if (props.day_start_hour >= 12)
		{
			throw new Error(`ShadowTime: day_start_hour must be < 12: ${props.day_start_hour}`);
		}
		if (props.shadowed_elements_class == "")
		{
			throw new Error(`ShadowTime: shadowed_elements_class cannot be ""`);
		}

		this.day_start_hour = props.day_start_hour;
		this.update_interval_minutes = props.update_interval_minutes;
		this.shadowed_elements_class = props.shadowed_elements_class;
		this.box_shadow_blur_radius = props.box_shadow_blur_radius;
		this.box_shadow_spread = props.box_shadow_spread;
		this.box_shadow_x_offset_max = props.box_shadow_x_offset_max;
		this.box_shadow_y_offset_max = props.box_shadow_y_offset_max;
		this.box_shadow_y_offset_min = props.box_shadow_y_offset_min;

		// computed
		this.day_end_hour = 12 + (12 - this.day_start_hour);
		this.day_length_hours = (12 - this.day_start_hour) * 2;

		this.log("ShadowTime constructed");
	}
}

// ----------------------------------------------------------------------------
export function ShadowTimeFactory(	props: {	day_start_hour:number,
															shadowed_elements_class:string,
															box_shadow_blur_radius: number,
															box_shadow_spread: number,
															box_shadow_x_offset_max: number,
															box_shadow_y_offset_max: number,
															box_shadow_y_offset_min: number,
															update_interval_minutes: number,
												},
												log_fn: Function)
{
	return new ShadowTime(props, log_fn);
}