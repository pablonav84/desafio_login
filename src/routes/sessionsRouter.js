import { Router } from "express"
import { creaHash } from "../utils.js"
import { UsuariosManager } from "../dao/models/usuariosManagerMongo.js"
export const router=Router()

let uManager=new UsuariosManager()

router.post('/registro',async(req,res)=>{

    let {nombre, email, password} =req.body
    
    if(!nombre || !email || !password){
        
        return res.redirect("/registro?error=Faltan datos")
    }

    // Validación de correo válido
if (!await uManager.validarEmail(email)) {
    return res.redirect("/registro?error=El formato del correo electrónico no es válido");
}

// Validación de contraseña
if (!await uManager.validarPassword(password)) {
    return res.redirect("/registro?error=La contraseña debe contener 8 caracteres como minimo, una mayúscula y un caracter especial");
}

//Usuario admin
    let rol = 'usuario';
    if (email === 'adminCoder@coder.com' && password === "adminCod3r123") {
        rol = 'admin';
    }

    let existe=await uManager.getBy({email})
    if(existe){
        return res.redirect(`/registro?error=Ya existe un usuario registrado con email ${email}`)
    }

    password=creaHash(password)

    try {
        let nuevoUsuario=await uManager.create({nombre, email, password, rol})
        return res.redirect(`/login?mensaje=Registro exitoso para ${nombre}`)

    } catch (error) {
        return res.redirect(`/registro?error=Error 500 - error inesperado`)
    }
})

router.post('/login', async (req, res) => {
    let { email, password } = req.body;
    let usuario = await uManager.getBy({ email });

    if (!email || !password) {
        return res.status(400).json({ error: `Faltan datos` });
    }
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        if (usuario) {
            usuario.rol = 'admin';
        }
    }
    if (!usuario) {
        return res.status(401).json({ error: `Credenciales incorrectas` });
    }
    if (usuario.password !== creaHash(password)) {
        return res.status(401).json({ error: `Credenciales incorrectas` });
    }
    usuario = { ...usuario };
    delete usuario.password;
    req.session.usuario = usuario; // en un punto de mi proyecto

    res.status(200).json({
        usuario
    });
});


router.get('/logout', (req, res) => {
    req.session.destroy(e => {
        if (e) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({
                error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                detalle: `${e.message}`
            });
        } else {
            // Add an alert for successful logout
            res.send('<script>alert("Logout exitoso"); window.location.href="/login?mensaje=Logout exitoso";</script>');
        }
    });
});