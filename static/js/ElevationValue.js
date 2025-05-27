var ElevationValueNS = {

	UNIT_TYPE_METERS : "Meters",
	UNIT_TYPE_FEET : "Feet",

	ElevationValue:function(initial_elevation_meters = 0)
	{
		// note: always stored in meters
		this.elevation_meters = initial_elevation_meters;

		// determines output units (also usable for output, I guess)
		this.unit_type = ElevationValueNS.UNIT_TYPE_METERS;

		this.feet_per_meter = 3.28084;

		this.units_abbreviation = {
			"Meters": "m",
			"Feet" : "ft"
		};

		// ----------------------------------------------------------------------
		this.setUnits = function(unit_type)
		{
			switch (unit_type)
			{
				// valid values
				case ElevationValueNS.UNIT_TYPE_METERS :
				case ElevationValueNS.UNIT_TYPE_FEET :
					this.unit_type = unit_type;
					break;
				default:
					const err = "ElevationValue.setUnits(): unknown unit type: " + unit_type;
					throw new Error(err);
			}
		}

		// ----------------------------------------------------------------------
		this.setElevationMeters = function(meters)
		{
			this.elevation_meters = meters;
		}
		// don't need feet setter, yet

		// ----------------------------------------------------------------------
		// elevation getter
		// Note: returns elevation according to this.unit_type !!!
		Object.defineProperty(this, "elevation", {
			get: () => {
				switch (this.unit_type)
				{
					case ElevationValueNS.UNIT_TYPE_METERS:
						return this.elevation_meters;

					case ElevationValueNS.UNIT_TYPE_FEET:
						return this.elevation_meters * 3.28084;

					default:
						const err = "ElevationValue.setUnits(): unknown unit type: " + this.unit_type;
						throw new Error(err);
				}
			},
			configurable: true, // Allows the property to be redefined later
			enumerable: true, // Makes the property visible in loops
		});

		// ----------------------------------------------------------------------
		// units getter
		// Note: returns elevation according to this.unit_type !!!
		Object.defineProperty(this, "units", {
			get: () => {
				return this.unit_type;
			}
		});

		// ----------------------------------------------------------------------
		// abbreviated units getter
		// Note: returns elevation according to this.unit_type !!!
		Object.defineProperty(this, "units_short", {
			get: () => {
				return this.units_abbreviation[this.unit_type];
			}
		});

		return this;
	}
};
