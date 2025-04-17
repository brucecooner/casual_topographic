
export class SelfEditingString {
	// value at start of every edit cycle
	initial_value:string = "";

	// value as edits occur
	current_value:string = "";

	// how often edit occurs
	interval_ms:number;

	// callback to edit string (receives current value, should return next value)
	edit_callback:Function;

	// called after edit (optional)
	post_edit_callback: Function | null = null;

	timeout_id: number | null;

	// how many times to call edit_callback
	iteration_count: number = 1;

	iterations_remaining: number = 0;

	log_fn: Function | null;

	// -------------------------------------------------------------------------
	constructor(props: {initial_value: string, edit_callback: Function, interval_seconds: number, iteration_count: number, log_fn:Function, post_edit_callback?:Function|null})
	{
		if (props.interval_seconds <= 0)
		{
			throw new Error("SelfEditingString: interval_seconds must > 0");
		}

		if (props.iteration_count <= 0)
		{
			throw new Error("SelfEditingString: iteration_count must > 0");
		}

		this.initial_value = props.initial_value;
		this.edit_callback = props.edit_callback;
		this.interval_ms = props.interval_seconds * 1000;
		this.iteration_count = props.iteration_count;
		this.timeout_id = null;

		this.log_fn = props.log_fn;

		if (props.post_edit_callback && props.post_edit_callback !== null)
		{
			this.post_edit_callback = props.post_edit_callback ? props.post_edit_callback : null;
		}

		this.log("SelfEditingString constructed");
	}

	// -------------------------------------------------------------------------
	log(...args: any[])
	{
		if (this.log_fn)
		{
			this.log_fn(...args);
		}
	}


	// -------------------------------------------------------------------------
	start()
	{
		this.log("start()");

		this.current_value = this.initial_value;
		this.iterations_remaining = this.iteration_count;

		if (this.interval_ms)
		{
			this.timeout_id = setTimeout(this.timeoutHandler.bind(this), this.interval_ms);
		}
		else
		{
			this.log("unable to start, interval_ms false");
		}
	}

	// -------------------------------------------------------------------------
	timeoutHandler()
	{
		this.log("timeoutHandler() iteration_count:", this.iteration_count, " current_value: ", this.current_value);

		if (this.edit_callback)
		{
			this.current_value = this.edit_callback(this.current_value);
		}

		if (this.post_edit_callback)
		{
			this.post_edit_callback(this.current_value);
		}

		this.iterations_remaining -= 1;

		if (this.iterations_remaining <= 0)
		{
			this.stop();
		}
		else
		{
			this.timeout_id = setTimeout(this.timeoutHandler.bind(this), this.interval_ms);
		}
	}

	// -------------------------------------------------------------------------
	stop()
	{
		this.log("stop()");

		if (this.timeout_id)
		{
			clearTimeout(this.timeout_id);
			this.timeout_id = null;
		}
		else
		{
			this.log("already stopped!");
		}
	}
};

// ----------------------------------------------------------------------------
export function SelfEditingStringFactory(props: {initial_value: string, edit_callback: Function, interval_seconds: number, iteration_count: number, log_fn:Function})
{
	return new SelfEditingString(props);
}
