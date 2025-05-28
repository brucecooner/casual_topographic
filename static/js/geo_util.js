export var GeoUtil = {

	// conversion constants:
	miles_per_meter: 0.000621371,

	// force errors from getElevation:
	getElevation_error_rate: 0.0,

	// -------------------------------------------------------------------------
	// note: queries in meters
	getEPQSUrl: function(lng, lat)
	{
		return `https://epqs.nationalmap.gov/v1/json?x=${lng}&y=${lat}&units=Meters`;
	},

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

	// ----------------------------------------------------------------------------
	getElevation: async function(lat, lng)
	{
		// console.log("getElevation(", lng_lat_obj, ")");

		const elevation_url = GeoUtil.getEPQSUrl(lng, lat)

		return new Promise((resolve, reject) => {
			fetch(elevation_url).then(res =>
			{
				if (Math.random() < GeoUtil.getElevation_error_rate)
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
	},

	// -------------------------------------------------------------------------
	// uses Haversine formula to calculate distance
	// -large distances are less accurate
	distance_meters: function(lat1, lng1, lat2, lng2)
	{
	// from : https://www.movable-type.co.uk/scripts/latlong.html
	// Haversine
	// formula: 	a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
	// c = 2 ⋅ atan2( √a, √(1−a) )
	// d = R ⋅ c
	// where: 	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km);
	// note that angles need to be in radians to pass to trig functions!
	// JavaScript: 	

	// const R = 6371e3; // metres
	// const φ1 = lat1 * Math.PI/180; // φ, λ in radians
	// const φ2 = lat2 * Math.PI/180;
	// const Δφ = (lat2-lat1) * Math.PI/180;
	// const Δλ = (lon2-lon1) * Math.PI/180;

	// const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	//           Math.cos(φ1) * Math.cos(φ2) *
	//           Math.sin(Δλ/2) * Math.sin(Δλ/2);
	// const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	// const d = R * c; // in metres

		const rads_per_degree = Math.PI / 180.0;

		// radius
		const R = 6371e3;	// meters

		// to radians...
		const lat1_rads = lat1 * rads_per_degree;
		const lat2_rads = lat2 * rads_per_degree;
		const delta_lat = (lat2 - lat1) * rads_per_degree;
		const delta_lng = (lng2 - lng1) * rads_per_degree;

		// console.log("distance_meters");
		// console.log("lat1_rads:", lat1_rads, "  lat2_rads:", lat2_rads);
		// console.log("delta_lat:", delta_lat, "  delta_lng:", delta_lng);

		const a =	Math.sin(delta_lat / 2.0) * Math.sin(delta_lat / 2.0) +
						Math.cos(lat1_rads) * Math.cos(lat2_rads) *
						Math.sin(delta_lng / 2.0) * Math.sin(delta_lng / 2.0);

		// console.log("a:", a);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		// console.log("c:", c);

		const d = R * c;	// units of R above

		return d;
	}
};