export class DoNTimes {
    // -------------------------------------------------------------------------
    constructor(props, log_fn = null) {
        this.timeout_id = null;
        this.iterations_remaining = 0;
        if (props.interval_seconds <= 0) {
            throw new Error("SelfEditingString: interval_seconds must > 0");
        }
        if (props.iteration_count <= 0) {
            throw new Error("SelfEditingString: iteration_count must > 0");
        }
        this.callback = props.callback;
        this.interval_ms = props.interval_seconds * 1000;
        this.iteration_count = props.iteration_count;
        this.log_fn = log_fn ? log_fn : () => { };
        this.log("DoNTimes constructed");
    }
    // -------------------------------------------------------------------------
    log(...args) {
        if (this.log_fn) {
            this.log_fn(...args);
        }
    }
    // -------------------------------------------------------------------------
    start() {
        this.log("start()");
        this.iterations_remaining = this.iteration_count;
        if (this.interval_ms > 0) {
            this.timeout_id = setTimeout(this.timeoutHandler.bind(this), this.interval_ms);
        }
        else {
            this.log("unable to start, interval_ms false");
        }
    }
    // -------------------------------------------------------------------------
    timeoutHandler() {
        this.log("timeoutHandler() iterations_remaining:", this.iterations_remaining);
        if (this.callback) {
            this.callback();
        }
        this.iterations_remaining -= 1;
        if (this.iterations_remaining <= 0) {
            this.stop();
        }
        else {
            this.timeout_id = setTimeout(this.timeoutHandler.bind(this), this.interval_ms);
        }
    }
    // -------------------------------------------------------------------------
    stop() {
        this.log("stop()");
        if (this.timeout_id) {
            clearTimeout(this.timeout_id);
            this.timeout_id = null;
        }
        else {
            this.log("already stopped!");
        }
    }
}
;
// ----------------------------------------------------------------------------
export function DoNTimesFactory(props, log_fn = null) {
    return new DoNTimes(props, log_fn);
}
