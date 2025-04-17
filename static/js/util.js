	// -------------------------------------------------------------------------
	function toPrecision(num, precision)
	{
		const shifter = 10 ** precision;
		const as_int = Math.floor(num * shifter);	// shift left by precision, to int to remove decimals
		return as_int / (shifter);	// shift back right by precision
	}

   // ----------------------------------------------------------------------------
	function toDisplayCoords(lng, lat, display_precision)
	{
		const lng_precision = toPrecision(lng, display_precision).toString();
		const lat_precision = toPrecision(lat, display_precision).toString();
		// negative sign + 3 digits + decimal point + decimals
		const padded_length = 1 + 3 + 1 + display_precision;

		const padded_lng = lng_precision.padStart(padded_length, " ");
		const padded_lat = lat_precision.padStart(padded_length, " ");

		return `${padded_lat},${padded_lng}`;
	}

	// -------------------------------------------------------------------------
	function getEPQSUrl(lng, lat)
	{
		return `https://epqs.nationalmap.gov/v1/json?x=${lng}&y=${lat}&units=Feet`;
	}

	// -------------------------------------------------------------------------
	function isTouchDevice() 
	{
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	}

	// ----------------------------------------------------------------------------
	// non promise returning form
	// function getElevation(lng_lat_obj, elevation_callback)
	// {
	// 	console.log("getElevation(", lng_lat_obj, ")");

	// 	const error_rate = 0.9;

	// 	console.log('getElevation() error_rate: ', error_rate);

	// 	const elevation_url = getEPQSUrl(lng_lat_obj["lng"], lng_lat_obj["lat"])

	// 	fetch(elevation_url).then(res =>
	// 	{
	// 		const error_trigger = Math.random();
	// 		console.log("error_trigger", error_trigger);

	// 		if (error_trigger < error_rate)
	// 		{
	// 			throw new Error("manually triggered error");
	// 		}

	// 		res.json().then(json =>
	// 		{
	// 			elevation_callback(json.value);
	// 		});
	// 	}).catch(err => {
	// 		console.error("error getting elevation");
	// 		console.error(err);
	// 	});
	// }

	let getElevation_error_rate = 0.0;

	// ----------------------------------------------------------------------------
	async function getElevation(lng_lat_obj, elevation_callback)
	{
		// console.log("getElevation(", lng_lat_obj, ")");

		const error_rate = 0.9;

		const elevation_url = getEPQSUrl(lng_lat_obj["lng"], lng_lat_obj["lat"])

		return new Promise((resolve, reject) => {
			fetch(elevation_url).then(res =>
			{
				if (Math.random() < getElevation_error_rate)
				{
					console.log("getElevation(): throwing manual error");
					throw new Error("forced error getting elevation");
				}

				// error responses will say they are json, but they are NOT!
				// grab text, try to parse as json
				res.text().then(text => {
					try {
						const parsed_json = JSON.parse(text);
						resolve(parsed_json.value);	// finally got what we were looking for
					}
					catch {
						// json parse error, original response was just some error text, but
						// at least now insead of a json parse error we'll return an equally
						// unhelpful system error
						throw new Error(text);
					}
				}).catch(text_err => {
					reject(text_err);
				});

			}).catch(err => {
				reject(err);
			});
		});
	}

