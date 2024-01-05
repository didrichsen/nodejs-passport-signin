export function isAuthenticated(req ,res, next) {
    if(req.isAuthenticated()) return next()

    res.send("You are not authenticated");

}

export function isAdmin(req, res, next) {
    if (req.user.role === "admin") return next();

    res.send("You are not an admin");
}