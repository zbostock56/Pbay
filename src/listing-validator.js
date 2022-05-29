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
    if (title !== undefined && ((typeof title !== "string") || (title.length > 100) || (title.length === 0))) {
        status = false;
        errors.title = "Invalid title";
    }

    const desc = req.body.desc;
    if (desc !== undefined && ((typeof desc !== "string") || (desc.length > 1000))) {
        status = false;
        errors.desc = "Invalid description";
    }

    const category = req.body.category;
    if (category !== undefined && (isNaN(parseInt(category)) || (category < 1) || (category > 19))) {
        status = false;
        errors.category = "Invalid category";
    }

    const updateImg = req.body.updateImg;
    if (updateImg !== undefined && (updateImg !== "1" && updateImg !== "0")) {
        status = false;
        errors.updateImg = "Invalid image update option";
    }

    // const location = req.body.location;
    // if (location && ((typeof location !== "string") || (location.length > 50) || (title.length === 0))) {
    //     status = false;
    //     errors.location = "Invalid location";
    // }

    // const phoneValidator = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    // const phoneNumber = req.body.phoneNumber;
    // if (phoneNumber && ((typeof phoneNumber !== "string") || (phoneValidator.test(phoneNumber) == false))) {
    //     status = false;
    //     errors.phoneNumber = "Invalid phone number";
    // }

    const price = req.body.price;
    if (price !== undefined && (isNaN(parseFloat(price)) || (price < 0))) {
        status = false;
        errors.price = "Invalid price";
    }

    if (status == false) {
        let errMsg = "";
        for (const msg in errors) {
            errMsg = `${errMsg} ${errors[msg]},`;
        }
        errMsg = errMsg.substring(0, errMsg.length - 1);

        res.status(400).json({ msg: errMsg });
    } else {
        next();
    }
};

module.exports = listingValidator;