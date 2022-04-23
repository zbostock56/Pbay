/*
  ============= listingValidator =============
  DESC: Middleware for validating listing creations/edits

  PARAMETERS: All neccesarry middleware params (req, res, next)
  ==========================================
*/

const listingValidator = (req, res, next) => {
    let status = true;
    const errors = {}

    const title = req.body.title;
    if (title && ((typeof title !== "string") || (title.length > 100) || (title.length === 0))) {
        status = false;
        errors.title = "Invalid title";
    }

    const desc = req.body.desc;
    if (desc && ((typeof desc !== "string") || (desc.length > 500))) {
        status = false;
        errors.desc = "Invalid description";
    }

    const location = req.body.location;
    if (location && ((typeof location !== "string") || (location.length > 50) || (title.length === 0))) {
        status = false;
        errors.location = "Invalid location";
    }

    const phoneValidator = /^\([0-9]{3}\)-[0-9]{3}-[0-9]{4}$/;
    const phoneNumber = req.body.phoneNumber;
    if (phoneNumber && ((typeof phoneNumber !== "string") || (phoneValidator.test(phoneNumber) == false))) {
        status = false;
        errors.phoneNumber = "Invalid phone number";
    }

    const price = req.body.price;
    if (price && (parseInt(price) == NaN)) {
        status = false;
        errors.price = "Invalid price";
    }

    if (status == false) {
        res.status(400).json({ msg: errors });
    } else {
        next();
    }
};

module.exports = listingValidator;