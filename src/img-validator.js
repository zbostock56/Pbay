/*
  =================== imgValidator ===================
  DESC: Middleware for validating image creations/edits

  PARAMETERS: All neccesarry middleware parameters (req, res, next)
  ====================================================
*/
const imgValidator = (req, res, next) => {
    let status = true;
    const errors = {};

    if (req.body.imgs && Array.isArray(req.body.imgs)) {
        if (req.body.imgs.length > 3) {
            status = false;
            errors.imgs = "Cannot upload more than 3 images";
        }

        for (let i = 0; i < req.body.imgs.length; i++) {
            if (!(req.body.imgs[i] instanceof Uint8Array)) {
                status = false;
                errors.imgs = "Invalid image";
                break;
            }
        }
    } else if (req.body.imgs) {
        status = false;
        errors.imgs = "Invalid image input";
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