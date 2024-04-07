import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { productsModelo } from '../dao/models/products.Modelo.js';
import { cartModelo } from '../dao/models/carts.Modelo.js';

export const router = Router();


// Vista home
router.get('/', (req, res) => {
  res.status(200).render('login');
})

router.get('/registro',(req,res)=>{

    let {error, mensaje} = req.query

    res.status(200).render('registro', {error, mensaje})
})

router.get('/home', auth, (req,res)=>{

    let usuario=req.session.usuario

    res.status(200).render('home', {usuario})
})

router.get('/login',(req,res)=>{

    res.status(200).render('login')
})

//Vista productos
router.get('/products', auth, async (req,res)=>{
    let usuario=req.session.usuario

    let { pagina, limit, sort } = req.query;
  if (!pagina) {
    pagina = 1;
  }
  let sortOption = {}; // Inicializa un objeto vacío para las opciones de ordenamiento
  if (sort) {
    // Verifica si se proporciona el parámetro 'sort'
    if (sort === "asc") {
      sortOption = {
        /* Define los criterios de ordenamiento para el orden ascendente */
      };
    } else if (sort === "desc") {
      sortOption = {
        /* Define los criterios de ordenamiento para el orden descendente */
      };
    }
  }
  let {
    docs: productos,
    totalPages,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage,
  } = await productsModelo.paginate(
    {},
    { limit: limit || 10, page: pagina, lean: true, sort: sortOption }
  );
  res.setHeader("Content-Type", "text/html");
  return res
    .status(200)
    .render("products", {
        usuario,
      productos,
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
    });
})

//Vista detalle de los productos
router.get("/products/:id", auth, async (req, res) => {
    let usuario=req.session.usuario
      let id = req.params.id;
      let product = await productsModelo.findById(id);

      res.setHeader("Content-Type", "text/html");
      return res.status(200).render("detail", { product, usuario });
    });

//Vista de carritos
router.get("/carts", auth, async (req, res) => {
    let usuario=req.session.usuario
      let { pagina, limit } = req.query;
      if (!pagina) {
        pagina = 1;
      }
      let {
        docs: carts,
        totalPages,
        prevPage,
        nextPage,
        hasPrevPage,
        hasNextPage,
      } = await cartModelo.paginate(
        {},
        { limit: limit || 5, page: pagina, lean: true }
      );
      res.render("carts", {
        usuario,
        carts,
        totalPages,
        prevPage,
        nextPage,
        hasPrevPage,
        hasNextPage,
      });
    });

// Vista detalle de carrito
router.get("/carts/:id", auth, async (req, res) => {
    let usuario=req.session.usuario
      const cartId = req.params.id;
      
    let carts = await cartModelo.findById(cartId).populate("items.productId");

    res.setHeader("Content-Type", "text/html");
    return res.status(200).render("detailCarts", { carts, usuario });
    });