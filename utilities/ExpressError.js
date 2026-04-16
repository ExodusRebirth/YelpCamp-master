const errorTime = new Date().getDate();
class ExpressError extends Error {
    constructor(message, status) {
        super()

        this.message = message;
        this.status = status;
        errorTime;


    }
}

module.exports = ExpressError;