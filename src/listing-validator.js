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
    if ((typeof title !== "string") || (title.length > 100) || (title.length === 0)) {
        status = false;
        errors.title = "Invalid title";
    }

    const desc = req.body.desc;
    if ((typeof desc !== "string") || (desc.length > 1000)) {
        status = false;
        errors.desc = "Invalid description";
    }

    const category = req.body.category;
    if (isNaN(parseInt(category)) || (category < 1) || (category > 19)) {
        status = false;
        errors.category = "Invalid category";
    }

    const price = req.body.price;
    if (isNaN(parseFloat(price)) || (price < 0)) {
        status = false;
        errors.price = "Invalid price";
    }

    if (status == false) {
        let errMsg = "";
        for (const msg in errors) {
            errMsg = `${errMsg} ${errors[msg]},`;
        }
        errMsg = errMsg.substring(0, errMsg.length - 1);

        return res.status(400).json({ msg: errMsg });
    } else {
        next();
    }
};

module.exports = listingValidator;