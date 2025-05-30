// will take meters input and format to other units
var FormatUnitsNS = {

	UNIT_TYPE_METERS: "Meters",
	UNIT_TYPE_FEET: "Feet",

	FEET_PER_METER: 3.28084,

	// =========================================================================
	FormatUnits:function()
	{
		// unit type that will be returned
		this.unit_type = FormatUnitsNS.UNIT_TYPE_METERS;

		// default precision
		this.precision = 4;

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
		this.getUnitString = function()
		{
			unit_string = "??";

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
					const err = "getUnitSTring(): unknown unit type: " + unit_type;
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
		this.format = function(value_meters)
		{
			switch (this.unit_type)
			{
				case FormatUnitsNS.UNIT_TYPE_METERS:
					return `${this.toPrecision(value_meters)} m`;

				case FormatUnitsNS.UNIT_TYPE_FEET:
					const value_feet = value_meters * FormatUnitsNS.FEET_PER_METER;
					return `${this.toPrecision(value_feet)} ft`;
			}
		}

		return this;
	}

};