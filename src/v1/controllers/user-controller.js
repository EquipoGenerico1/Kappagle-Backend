//Imports
const user = require('../models/user-model')
const authJWT = require('../helpers/jwt')

/**
 * POST     /api/login                  -> login
 * POST     /api/signup                 -> signup
 * POST     /api/refresh-token          -> refreshToken
 * 
 * GET      /users:id                   -> getUser
 * GET      /users                      -> userAll
 * GET      /users/checks               -> checkAll
 * GET      /users/getWorkedHoursUser   -> getWorkedHoursUser
 * GET      /users/getWorkedHoursAdmin   -> getWorkedHoursAdmin
 * 
 * POST     /users/checks/checkin       -> checkIn
 * PATCH    /users/checks/:id/checkout  -> checkOut
 * PATCH    /users/:user/checks/:check  -> checkModify
 */

module.exports = {
    login,
    signup,
    refreshToken,
    getUser,
    userAll,
    checkAll,
    checkIn,
    checkOut,
    checkModify,
    getWorkedHoursUser,
    getWorkedHoursAdmin,
    currentCheck
}

const _UPDATE_DEFAULT_CONFIG = {
    new: true,
    runValidators: true
}

/**
 * Authenticates a user and returns JWT
 * @param {request} req Request
 * @param {*} res Response
 */
async function login(req, res) {
    console.log({ request: req.headers["x-forwarded-for"] });
    console.log("/////////////////////////////////////////////");
    console.log(req.ip);

    if (req.body.password && req.body.email) {
        user.findOne({
            email: req.body.email
        })
            .select("_id password role")
            .exec((err, userResult) => {
                if (err || !userResult) {
                    return res.status(401).send({ error: "User does not exist" });
                }

                userResult.comparePassword(req.body.password, userResult.password, function (err, isMatch) {
                    if (isMatch & !err) {
                        let dataToken = authJWT.createToken(userResult);
                        return res.status(200).json({
                            access_token: dataToken[0],
                            refresh_token: authJWT.createRefreshToken(userResult),
                            expires_in: dataToken[1],
                            role: userResult.role
                        });

                    } else {
                        return res.status(401).send({ error: "Password or Email Invalid" });
                    }
                });

            });
    } else {
        return res.status(401).send({ error: "BadRequest" });
    }
}

/**
 * Creates a user and returns a JWT
 * @param {request} req Request
 * @param {*} res Response
 */
async function signup(req, res) {

    user.create(req.body)
        .then(user => {
            let dataToken = authJWT.createToken(user);
            let userResponse = {
                access_token: dataToken[0],
                refresh_token: authJWT.createRefreshToken(user),
                expires_in: dataToken[1],
                role: user.role
            };
            return res.status(201).json(userResponse);

        })
        .catch(err => {
            console.log(err)
            return res.status(400).send(err);
        });
}

/**
 * Refreshes access_token
 * @param {request} req Request
 * @param {*} res Response
 */
async function refreshToken(req, res) {
    authJWT.refreshToken(req, res);
}

/**
 * Initializes currentCheck with a new check in & unique id
 * @param {request} req Request
 * @param {*} res Response
 */
async function checkIn(req, res) {

    let loggedUser = req.user;

    user.findById(loggedUser._id, { currentCheck: 1 }, { new: true })
        .then(user => {
            if (!user.currentCheck) {

                user.currentCheck = {
                    checkIn: moment().utc().unix(),
                    checkOut: null,
                    _id: uniqid()
                };

                user.markModified('currentCheck');
                user.save(function (err, product) {
                    if (err) {
                        return res.status(404).json({ message: 'Check In was not possible', error: err })
                    } else {
                        return res.status(201).json(product.currentCheck)
                    }
                })
            } else {
                return res.status(404).json({ message: 'You have already checked in, please check out first' })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({ message: 'User was not found', error: err })
        })
}

/**
 * Creates a new check inside checks composed by the currentCheck fields and updates the checkout field
 * then sets currentCheck to undefined
 * @param {request} req Request
 * @param {*} res Response
 */
async function checkOut(req, res) {
    const loggedUser = req.user

    user.findById(loggedUser._id, { currentCheck: 1, checks: 1 }, { new: true })
        .then(user => {
            if (user.currentCheck) {
                let completedCheck = {
                    checkIn: user.currentCheck.checkIn,
                    checkOut: moment().utc().unix(),
                    _id: user.currentCheck._id
                }
                user.checks.push(completedCheck);
                user.currentCheck = undefined;
                user.markModified('currentCheck');
                user.save(function (err, product) {
                    if (err) {
                        return res.status(404).json({ message: 'Check out was not possible', error: err })
                    } else {
                        return res.status(201).json(product.checks.filter(check => check._id == completedCheck._id))
                    }
                })
            } else {
                return res.status(404).json({ message: 'There is no current check yet, please check in first' })
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({ message: 'User was not found', error: err })
        })

}

/**
 * Get current check from logged User
 * @param {request} req Request
 * @param {*} res Response
 */
async function currentCheck(req, res) {
    const loggedUser = req.user
    user.findById(loggedUser._id, { currentCheck: 1 }).then(user => {
        if (user.currentCheck) {
            return res.status(201).json(user.currentCheck)
        } else {
            return res.status(404).json({ message: 'No hay un fichaje en curso' })
        }
    })

}

/**
 * Update fields the check list
 * @param {request} req Request
 * @param {*} res Response
 */
async function checkModify(req, res) {

    user.findOneAndUpdate({ _id: req.params.user, "checks._id": req.params.check },
        {
            $set: {
                "checks.$.checkIn": req.body.checkIn,
                "checks.$.checkOut": req.body.checkOut
            }
        },
        {
            new: true
        })
        .then(resultUser => {

            let resultCheck = resultUser.checks.find(check => check._id == req.params.check)
            return res.json(resultCheck)
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({ message: 'Users was not found', error: err })
        })
}

/**
 * Get all checks list the user
 * @param {request} req Request
 * @param {*} res Response
 */
async function checkAll(req, res) {

    let loggedUser = req.user

    user.findById(loggedUser._id, { 'checks': 1 })
        .then(resultUser => {
            if (resultUser.checks[0]) {
                return res.json(resultUser.checks.reverse())
            }
            return res.status(404).json({ message: 'No hay check-in para este usuario' })
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({ message: 'Users was not found', error: err })
        })
}

/**
 * Get all users list
 * @param {request} req Request
 * @param {*} res Response
 */
async function userAll(req, res) {
    var field = req.query.name ? { 'name': { '$regex': req.query.name } } : {}
    user.find(field, { name: 1 })
        .then(resultUsers => {
            return res.json(resultUsers)
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({ message: 'Users not found', error: err })
        })
}

/**
 * Get users list for ID
 * @param {request} req Request
 * @param {*} res Response
 */
async function getUser(req, res) {
    user.findById(req.params.id)
        .then(resultUser => {
            return res.json(resultUser)
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json({ message: 'User was not found', error: err })
        })
}

async function getChecksByRange(from, to, id) {
    from = moment(from, "DD-MM-YYYY").utc().unix();
    to = moment(to, "DD-MM-YYYY").utc().unix();

    return new Promise((resolve, reject) => {
        user.findById(id, {}, { new: true })
            .then(user => {
                var checks = user.checks.filter(
                    check => {
                        return check.checkIn >= from
                            && check.checkIn <= to;
                    })
                resolve(checks);
            })
            .catch(err => {
                res.status(404).json({ message: 'User was not found', error: err });
                reject();
            })

    });
}

/**
 * Get user worked hours in a range of time between from and to
 * @param {*} from From Date
 * @param {*} to To Date
 * @param {*} id User
 */
async function getWorkedHours(from, to, id) {
    if (from && to) {
        var checks = await getChecksByRange(from, to, id);
        if (checks) {
            var seconds = 0;
            checks.forEach(check => { seconds += check.checkOut - check.checkIn; });
            var hours = seconds / 3600
            return hours
        }
    } else {
        return res.status(401).send({ error: "BadRequest" });
    }
}

/**
 * Get user worked hours from logged User
 * @param {request} req Request
 * @param {*} res Response
 */
async function getWorkedHoursUser(req, res) {
    if (req.query.from && req.query.to) {
        let hours = await getWorkedHours(req.query.from, req.query.to, req.user._id);
        return res.status(201).json({ hours });
    } else {
        return res.status(401).send({ error: "BadRequest" });
    }
}

/**
 * Get user worked hours from a provided User
 * @param {request} req Request
 * @param {*} res Response
 */
async function getWorkedHoursAdmin(req, res) {
    if (req.query.from && req.query.to) {
        let hours = await getWorkedHours(req.query.from, req.query.to, req.params.id);
        return res.status(201).json({ hours });
    } else {
        return res.status(401).send({ error: "BadRequest" });
    }
}