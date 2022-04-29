/*
  =================== imgValidator ===================
  DESC: Middleware for validating image creations/edits

  PARAMETERS: All neccesarry middleware parameters (req, res, next)
  ====================================================
*/
const imgValidator = (req, res, next) => {
    let status = true;
    const errors = {};

    if (req.body.img) {
        if (!(req.body.img instanceof Uint8Array)) {
            status = false;
            errors.img = "Invalid image";
        }
    }

    if (req.body.imgUpdated && (typeof req.body.imgUpdated !== "boolean")) {
        status = false;
        errors.imgUpdated = "Invalid image update status";
    }

    if (status == false) {
        res.status(400).json({ msg: errors });
    } else {
        next();
    }
}

module.exports = imgValidator;