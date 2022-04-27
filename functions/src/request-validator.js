/*
  ============= listingValidator =============
  DESC: Middleware for validating request creation/edits

  PARAMETERS: All neccesarry middleware params (req, res, next)
  ==========================================
*/
const requestValidator = (req, res, next) => {
    let status = true;
    const errors = {};

    const title = req.body.title;
    if (title && ((typeof title !== "string") || (title.length > 100) || (title.length === 0))) {
        status = false;
        errors.title = "Invalid title"
    }

    const desc = req.body.desc;
    if (desc && ((typeof desc !== "string") || (desc.length > 1000))) {
        status = false;
        errors.title = "Invalid description";
    }

    if (status == false) {
        res.status(400).json({ msg: errors });
    } else {
        next();
    }
};

module.exports = requestValidator;