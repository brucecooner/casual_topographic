/* quick and dirty channel-based logging system

create:
	mylogging = LogChannelsNS.LogChannels(true);

add your own named channel:
	mylogging.addChannel("bob", true);

log on your channel:
	mylogging.log("bob", "bob says hi");
	mylogging.bob("bob says hi from his own channel func");
	mylogging.sue("hi");	// raises console.error, you didn't add a channel named sue yet


Warnings:
	-can't use spaces in names, probably

TODO:
	-desperately needs proper stack trace location of original caller to log
*/
var LogChannelsNS = {

	LogChannels:function(initialEnabled = true, initialChannelsEnabledState = true, channelNamePrefixesDefault = true)
	{
		// ----- consts -----
		// color of stack trace lines
		this.trace_output_color = "#888888";

		// ----- settings -----
		// overall enabled
		this.logging_enabled = initialEnabled;

		this.channel_name_prefixes_enabled_default = channelNamePrefixesDefault;

		this.channel_trace_output_enabled_default = false;

		this.initial_channels_enabled_state = initialChannelsEnabledState;

		// tracks channels' state
		// { "channelName" : { enabled:boolean, name_prefix_enabled:boolean, trace_output_enabled:boolean}, ... }
		this.channels = {};

		// ----------------------------------------------------------------------
		this.addChannel = function(channelName, config = null)
		{
			default_config = {
				enabled: this.initial_channels_enabled_state,
				name_prefix_enabled: this.channel_name_prefixes_enabled_default,
				trace_output_enabled: this.channel_trace_output_enabled_default };

			if (config)
			{
				Object.assign(default_config, config);
			}

			this.channels[channelName] = default_config;

			this[channelName] = this.getChannelFunc(channelName);
		}

		// ----------------------------------------------------------------------
		this.log = function(channelName, ...args)
		{
			if (this.channels[channelName])
			{
				if (this.logging_enabled && this.channels[channelName]["enabled"])
				{
					if (this.channels[channelName]["name_prefix_enabled"])
					{
						console.log(channelName + ":", ...args);
					}
					else
					{
						console.log(...args);
					}

					// optional trace on following line, not the prettiest but ok for now
					if (this.channels[channelName]["trace_output_enabled"])
					{
						// TODO: make prettier
						const logStack = new Error().stack;
						second_line = logStack.split("\n")[1];
						console.log("   %c(from:" + second_line + ")", `color:${this.trace_output_color}`);
					}

				}
				else
				{
					// console.log("channel not active!")
				}
			}
			else
			{
				console.error("LogChannels.log: no channel with name: " + channelName);
			}
		}

		// ----------------------------------------------------------------------
		this.setEnabled = function(enabledState)
		{
			this.logging_enabled = enabledState;
		}

		// ----------------------------------------------------------------------
		this.setChannelEnabled = function(channelName, enabledState)
		{
			if (this.channels[channelName])
			{
				this.channels[channelName]["enabled"] = enabledState;
			}
			else
			{
				console.error("LogChannels.setChannelEnabled: no channel with name: " + channelName);
			}
		}

		// ----------------------------------------------------------------------
		// get channel as function logging.log("mychannel") => logging.myChannel()
		this.getChannelFunc = function(channelName)
		{
			if (this.channels[channelName])
			{
				return this.log.bind(this, channelName);
			}
			else
			{
				console.error("LogChannels.getChannel: no channel with name: " + channelName);
			}
		}

		return this;
	}	// end constructor
} // end LogChannelsNS