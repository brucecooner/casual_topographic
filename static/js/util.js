// -------------------------------------------------------------------------
function toPrecision(num, precision)
{
	const shifter = 10 ** precision;
	const as_int = Math.floor(num * shifter);	// shift left by precision, to int to remove decimals
	return as_int / (shifter);	// shift back right by precision
}

// ----------------------------------------------------------------------------
// returns as string: lat,lng to specified precision
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
function isTouchDevice() 
{
	return 'ontouchstart' in window; // || navigator.maxTouchPoints > 0;
}

// -------------------------------------------------------------------------
function setDataAttributeOnClass(class_name, data_attribute, value)
{
	console.log("setDataAttributeOnClass()");
	console.log("class name:", class_name, "  data_attrib: " , data_attribute, " value:", value);

	const elements = document.getElementsByClassName(class_name);

	for (let i = 0; i < elements.length; i++)
	{
		const cur_elem = elements[i];

		console.log("setting on :");
		console.log(cur_elem);

		cur_elem.setAttribute(data_attribute, value);
	}
}