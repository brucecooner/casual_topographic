/*
	log with named channels

	// create logging instance
	const logging = new LogChannelsNS().LogChannels();

	// add a channel:
	const my_channel = logging.addChannel("my_channel");

	// use the channel like console, but messages are prefixed with channel name
	my_channel.log("hi");		>> my_channel: hi
	my_channel.log("there"); 	>> my_channel: there

	my_channel.warn("look out")	>> my_channel: uh oh (in console.warn colors)
	my_channel.error("too late")	>> my_channel: too late (in console.error colors)

	// can go through logging instance to get channel by channel name or function
	logging.my_channel.log("another way");						>> my_channel: another way
	logging.getChannel("my_channel", "yet another way")	>> my_channel: yet another

	// NOTE:
	// the channel variable name you store a channel with doesn't HAVE to match its internal name
	const channel_bob = logging.addChannel("steve");
	// but you'll generally prefer that they do...
	channel_bob.log("hi");	>> steve: hi
	// internally it's known by steve
	logging.steve.log("its me");	>> steve: it's me

	// You don't have to keep the channel variable around though, you can throw it away
	// and just access the channel through the logging instance if you like.
	logging.addChanel("mary");
	logging.mary.log("hello");		>> mary: hello

	// you can generally pass around the channels or log functions, and the channel name
	// is preserved when logging.
	((internal_channel) => { internal_channel.warn("warned from inside")})(my_channel); >> my_channel: warned from inside
	((log_fn) =>  {log_fn("from an IIFE")})(logging.my_channel.log); >> my_channel: from an IIFE
	// useful for giving something externally controllable logging


	// config...
	// start silently (global)
	const disabled_logging = new LogChannelsNS().LogChannels({ enabled: false });
	const nada = disabled_logging.addChannel("nada");
	nada.log("shhhh")		>> no output
	// change enabled state
	disabled_logging.setEnabled(true);
	nada.log("now you can hear me")	>> nada: now you can hear me

	// start a channel silently
	quiet_channel = LoggingChannelsNS.newChannel("quiet", {"enabled":false});
	quiet_channel.log("shhhh") >> no output
	// change later
	quiet_channel.setEnabled(true)
	quiet_channel.log("hear this")	>> quiet: hear this

	// List of channel names: 
	logging.addChannel("another_channel");
	logging.channelList();		>> Array ["my_channel", "another_channel"]

	// Sorry, but this obviously invalidates the console's use stack frames that guide 
	// you to the msg source.
	// You can use the experimental trace feature though.
	// channel.setTraceLevel(trace_level)
	// Specify  use one of the constants above and only messages >= the set level 
	// will produce a trace.
	channel.setTraceLevel(LogChannelsNS.TRACE_LEVEL_WARN) // only see trace on warnings and errors
	// Note that the trace sort of "guesses" how far down the stack to get 
	// the call location (looks for first entry without LogChannels.js in it), so caveat emptor.

	// Notes:
	//		- Will throw error if you try to add a channel twice
	//		- Will throw error if you use a non-existent channel name

	// ---------------------------------------------------------
	TODO:
		- message caching?

	Known bugs:
		-table() just doesn't work here
*/

let LogChannelsNS = {
	// used to denote whether or not trace output is desired on message types
	// note that to trigger a trace, the message must have a LOWER level than the current setting
	TRACE_LEVEL_NONE : 0,
	TRACE_LEVEL_ERROR : 1,
	TRACE_LEVEL_WARN : 2,
	TRACE_LEVEL_LOG : 3,

	// -------------------------------------------------------------------------
	LogChannels:function(initial_config)
	{
		// config
		this.config = {
			enabled: true,
		};

		Object.assign(this.config, initial_config);

		// internals
		this.channels = {};
		this.trace_output_color = "#888888";

		// -------------------------------------------------------------------
		this.setEnabled = function(new_enabled)
		{
			this.config.enabled = new_enabled;
		}

		// -------------------------------------------------------------------
		this.getChannel = function(channel_name) 
		{
			if (!(channel_name in this.channels))
			{
				const err = `LogChannels.getChannel(): channel not found: ${channel_name}`;
				throw new Error(err);
			}

			return this.channels[channel_name];
		}

		// -------------------------------------------------------------------
		// returns: false (no log should be output) OR message_prefix
		this.preLog = function(channel_name)
		{
			let return_value = false;

			if (this.config.enabled)
			{
				const channel = this.getChannel(channel_name);
				if (channel.isEnabled())
				{
					return_value = channel_name + ": ";
				}
			}

			return return_value;
		}

		// -------------------------------------------------------------------
		this.postLog = function(channel_name, msg_trace_level = LogChannelsNS.TRACE_LEVEL_LOG)
		{
			let return_value = false;

			const channel = this.getChannel(channel_name);

			// note: no response if trace_level not in config, maybe this should be a warning?
			if ("trace_level" in channel.config && msg_trace_level <= channel.config.trace_level)
			{
				const error_stack = new Error().stack.split("\n");

				// experimental feature:
				// dig through stack until we find an entry that does NOT contain this filename.
				// HAZARD: hardwired name, somewhat delicate code here!!!!
				for (let i = 0; i < error_stack.length; i++)
				{
					if (!error_stack[i].toLowerCase().includes("logchannels.js"))
					{
						console.log("   %c(" + error_stack[i] + ")", `color:${this.trace_output_color}`);
						break;
					}
				}
				// console.log("   %c(" + error_stack[2] + ")", `color:${this.trace_output_color}`);
				// console.log("   %c(" + error_stack[3] + ")", `color:${this.trace_output_color}`);
			}
		}

		// -------------------------------------------------------------------
		this.log = function(channel_name, ...args)
		{
			const msg_prefix = this.preLog(channel_name);
			if (msg_prefix)
			{
				console.log(msg_prefix, ...args);

				this.postLog(channel_name, LogChannelsNS.TRACE_LEVEL_LOG);
			}
		}
		// -------------------------------------------------------------------
		this.dir = function(channel_name, ...args)
		{
			const msg_prefix = this.preLog(channel_name);
			if (msg_prefix)
			{
				console.dir(msg_prefix, ...args);

				this.postLog(channel_name, LogChannelsNS.TRACE_LEVEL_LOG);
			}
		}
		// -------------------------------------------------------------------
		// note that table only takes one argument
		this.table = function(channel_name, arg)
		{
			console.log("tabling");
			console.table(arg);

			const msg_prefix = this.preLog(channel_name);
			if (msg_prefix)
			{
				// doesn't work here for some reason?
				console.table(msg_prefix, arg);

				this.postLog(channel_name, LogChannelsNS.TRACE_LEVEL_LOG);
			}
		}
		// -------------------------------------------------------------------
		this.warn = function(channel_name, ...args)
		{
			const msg_prefix = this.preLog(channel_name);
			if (msg_prefix)
			{
				console.warn(msg_prefix, ...args);

				this.postLog(channel_name, LogChannelsNS.TRACE_LEVEL_WARN);
			}
		}
		// -------------------------------------------------------------------
		this.error = function(channel_name, ...args)
		{
			const msg_prefix = this.preLog(channel_name);
			if (msg_prefix)
			{
				console.error(msg_prefix, ...args);

				this.postLog(channel_name, LogChannelsNS.TRACE_LEVEL_ERROR);
			}
		}

		// -------------------------------------------------------------------
		this.addChannel = function(name, config)
		{
			// validate arguments
			if (!name)
			{ throw new Error("addChannel(): name must be provided"); }
			if (typeof name !== "string")
			{ throw new Error("addChannel(): name must be a string"); }
			if (config && typeof config !== "object")
			{ throw new Error("addChannel(): config must be an object"); }

			if (name in this.channels)
			{
				const err = `LogChannels.addChannel(): channel '${name}' already added.`;
				console.error(err);
				throw new Error(err);
			}

			// start with default channel config
			let new_channel_config = {
				enabled: true,
				trace_level: false,
			};
			if (config)
			{
				Object.assign(new_channel_config, config);
			}

			const boundLog = this.log.bind(this);
			const boundDir = this.dir.bind(this);
			const boundTable = this.table.bind(this);
			const boundWarn = this.warn.bind(this);
			const boundError = this.error.bind(this);

			const new_channel = {
				name: name,
				config: new_channel_config,
				isEnabled: function() { return this.config.enabled; },
				setEnabled: function(new_enabled) { this.config.enabled = new_enabled; },
				setTraceLevel: function(trace_level) { this.config.trace_level = trace_level; },
				log: function(...args) {
					boundLog(name, ...args);
				},
				dir: function(...args) {
					boundDir(name, ...args);
				},
				table: function(args) {
					boundTable(name, args);
				},
				warn: function(...args) {
					boundWarn(name, ...args);
				},
				error: function(...args) {
					boundError(name, ...args); }
			};

			this.channels[name] = new_channel;

			// getter for channel by name on this logging instance
			// e.g. logging.test.log("test msg")
			Object.defineProperty(this, name, {
				get: () => { return this.getChannel(name); },
				configurable: true, // Allows the property to be redefined later
				enumerable: true, // Makes the property visible in loops
			});

			return new_channel;

		}	// end addChannel()

		// -------------------------------------------------------------------
		this.channelList = function()
		{
			let channel_names = [];

			for (key in this.channels)
			{
				channel_names.push(key);
			}

			return channel_names;
		}

		return this;
	}	// end constructor
};	// end LogChannelsNS

// logging.addChannel("index")
// logging.index.log("blah")
// logging.index.dir(foo)
// logger class instance <dot> channel name <dot> method
// let my_channel = logger.getChannel("index") => channel object
// my_channel.log("hi") => "index: hi"
// my_channel.dir(foo)
