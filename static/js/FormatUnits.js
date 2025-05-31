// will take meters input and format to other units
var FormatUnitsNS = {

	UNIT_TYPE_METERS: "Meters",
	UNIT_TYPE_KILOMETERS: "Kilometers",
	UNIT_TYPE_FEET: "Feet",
	UNIT_TYPE_MILES: "Miles",

	// conversions
	FEET_PER_METER: 3.28084,
	FEET_PER_MILE: 5280.0,

	// =========================================================================
	FormatUnits:function()
	{
		// unit type that will be returned by default
		this.unit_type = FormatUnitsNS.UNIT_TYPE_METERS;

		// default precision
		this.precision = 2;

		this.abbreviated_units = {
			"Meters": "m",
			"Feet": "ft",
			"Kilometers": "km",
			"Miles": "mi",
		};

		// ----------------------------------------------------------------------
		this.getUnitType = function()
		{
			return this.unit_type;
		}

		// ----------------------------------------------------------------------
		this.setUnitType = function(unit_type)
		{
			switch (unit_type)
			{
				// valid values
				case FormatUnitsNS.UNIT_TYPE_METERS :
				case FormatUnitsNS.UNIT_TYPE_FEET :
					this.unit_type = unit_type;
					break;
				default:
					const err = "setUnitType(): unknown unit type: " + unit_type;
					throw new Error(err);
			}
		}

		// ----------------------------------------------------------------------
		// long form of current units
		this.getUnitString = function()
		{
			unit_string = "unknown type";

			switch (this.unit_type)
			{
				// valid values
				case FormatUnitsNS.UNIT_TYPE_METERS :
					unit_string = "Meters";
					break;
				case FormatUnitsNS.UNIT_TYPE_FEET :
					unit_string = "Feet";
					break;
				default:
					const err = "getUnitSTring(): invalid unit type: " + unit_type;
					throw new Error(err);
			}

			return unit_string;
		}

		// ----------------------------------------------------------------------
		this.toPrecision = function(num, precision = null)
		{
			const use_precision = precision || this.precision;

			const shifter = 10 ** use_precision;
			const as_int = Math.floor(num * shifter);	// shift left by precision, to int to remove decimals
			return as_int / (shifter);	// shift back right by precision
		}

		// ----------------------------------------------------------------------
		// if larger_units is true, will upscale to km/miles
		this.format = function(value_meters, larger_units = false)
		{
			let value_final = value_meters;
			let units_string = "unknown type";

			switch (this.unit_type)
			{
				case FormatUnitsNS.UNIT_TYPE_METERS:
					value_final = value_meters;
					units_string = this.abbreviated_units[FormatUnitsNS.UNIT_TYPE_METERS];

					if (larger_units && value_final >= 1000.0)
					{
						value_final /= 1000.0;
						units_string = this.abbreviated_units[FormatUnitsNS.UNIT_TYPE_KILOMETERS];
					}
				break;

				case FormatUnitsNS.UNIT_TYPE_FEET:
					value_final = value_meters * FormatUnitsNS.FEET_PER_METER;
					units_string = FormatUnitsNS.UNIT_TYPE_FEET;

					if (larger_units && value_final >= FormatUnitsNS.FEET_PER_MILE * 0.5)
					{
						value_final /= FormatUnitsNS.FEET_PER_MILE;
						units_string = this.abbreviated_units[FormatUnitsNS.UNIT_TYPE_MILES];
					}
				break;

				default:
					const err = `FormatUnits.format() unknown unit_type: ${this.unit_type}`;
					throw new Error(err);
				break;
			}

			return `${this.toPrecision(value_final)} ${units_string}`;
		}

		return this;
	}

};