export const auth = (req, res, next) => {
    if (!req.session.usuario) {
        res.send('<script>alert("No hay usuarios autenticados");window.location.href="/login";</script>');
    } else {
        next();
    }
}