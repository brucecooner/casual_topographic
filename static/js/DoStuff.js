var DoStuffNS = {

	DoStuff:function(log_fn = null, remember = false)
	{
		if (log_fn)
		{
			this.log = log_fn;
		}
		else
		{
			this.log = function(...args) {}
		}

		// { "event_name": str, "subbed": [ fn(props:{}), ...] }
		this.event_descriptors = {};

		// [{ "event_name", ...props }, ...]
		this.pending = [];

		this.handled = remember ? [] : null;

		// true when resolving events
		this.running = false;

		// ----------------------------------------------------------------------
		this.status = function()
		{
			this.log("status:");
			this.log("event descriptors: ");
			this.log(this.event_descriptors);
		}

		// ----------------------------------------------------------------------
		// get event descriptor for named event
		// note: may return null if event has not yet been placed in system
		this.getEventDescriptor = function(event_name)
		{
			return this.event_descriptors[event_name];
		}

		// ----------------------------------------------------------------------
		// use to get empty default event desriptor
		this.newEventDescriptor = function(event_name)
		{
			return { "event_name": event_name, "subbed": [] }
		}

		// ----------------------------------------------------------------------
		this.newEvent = function(event_name, props)
		{
			return { event_name, props };
		}

		// ----------------------------------------------------------------------
		// just loads an empty descriptor into the system
		this.addEvent = function(event_name)
		{
			this.event_descriptors[event_name] = this.newEventDescriptor(event_name);
		}

		// ----------------------------------------------------------------------
		// subscribes a handler to a specific event_name
		this.sub = function(event_name, handler)
		{
			desc = this.getEventDescriptor(event_name);

			if (desc)
			{
				desc["subbed"].push(handler)
				this.log("sub(): added handler for:" + event_name);
			}
			else
			{
				new_desc = this.newEventDescriptor(event_name);
				new_desc["subbed"].push(handler);
				this.event_descriptors[event_name] = new_desc;
				this.log("sub() : created event: " + event_name);
			}
		}

		// ----------------------------------------------------------------------
		// runs events until pending is empty
		this.run = function()
		{
			this.running = true;

			// if loop runs this long, you've probably caused a message cascade
			const iterate_limit = 10;

			// count loop iterations
			let been_at_it = 0;
			while (this.pending.length)
			{
				const cur_event = this.pending[0];

				const cur_event_desc = this.getEventDescriptor(cur_event["event_name"]);

				if (cur_event_desc)
				{
					cur_event_desc["subbed"].forEach(cur_fn =>
					{
						cur_fn(cur_event["props"]);
					});

					if (this.handled)
					{
						this.handled.push(cur_event);
					}

					this.pending.splice(0,1);
				}
				else
				{
					const error_msg = `run(): no descriptor found for event_name: ${cur_event["event_name"]}`;
					this.log(error_msg);
					console.error(error_msg);
				}

				been_at_it += 1;
				if (been_at_it >= iterate_limit)
				{
					this.log("run(): reached iteration limit!");
					break;
				}
			};	// end while

			this.running = false;
		}

		// ----------------------------------------------------------------------
		this.do = function(event_name, props)
		{
			this.log(event_name);

			event_desc = this.getEventDescriptor(event_name);

			if (event_desc)
			{
				this.pending.push(this.newEvent(event_name, props));

				if (!this.running)
				{
					this.run();
				}
			}
			else
			{
				error_msg = `do(): no descriptor for event_name:${event_name}`;
				this.log(error_msg);
				console.error(error_msg);
			}
		}

		this.log("DoStuff created.");
		return this;
	}


}