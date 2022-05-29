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
}

module.exports = imgValidator;