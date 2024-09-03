import { Router } from 'express';
import { Authroutes } from './auth/routes';
import { ReservationRoutes } from './reservations/routes';
import { LodgementRoutes } from './lodgements/routes';
import { BusyDateRoutes } from './busydates/routes';

export class AppRoutes {

  static get routes(): Router {

    const router = Router();
    
   router.use('/api/auth', Authroutes.routes );
   router.use('/api/reservations', ReservationRoutes.routes );
   router.use('/api/busydates', BusyDateRoutes.routes )
   router.use('/api/lodgements', LodgementRoutes.routes )

    return router;
  }

}

/**
 * 
 * 
 proyecto 7 del legacy
const { check } = require('express-validator');


router.put('/:id',[
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom( existeUsuarioPorId ),
    check('rol').custom( esRoleValido ), 
    validarCampos
],usuariosPut );

router.post('/',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 letras').isLength({ min: 6 }),
    check('correo', 'El correo no es válido').isEmail(),
    check('correo').custom( emailExiste ),
    // check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE','USER_ROLE']),
    check('rol').custom( esRoleValido ), 
    validarCampos
], usuariosPost );

router.delete('/:id',[
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom( existeUsuarioPorId ),
    validarCampos
],usuariosDelete );

router.patch('/', usuariosPatch );






  public updateTodo = async( req: Request, res: Response ) => {
    const id = +req.params.id;
    const [error, updateTodoDto] = UpdateTodoDto.create({...req.body, id});
    if ( error ) return res.status(400).json({ error });
    
    const todo = await prisma.todo.findFirst({
      where: { id }
    });

    if ( !todo ) return res.status( 404 ).json( { error: `Todo with id ${ id } not found` } );

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updateTodoDto!.values
    });
  
    res.json( updatedTodo );

  }


  public deleteTodo = async(req:Request, res: Response) => {
    const id = +req.params.id;

    const todo = await prisma.todo.findFirst({
      where: { id }
    });

    if ( !todo ) return res.status(404).json({ error: `Todo with id ${ id } not found` });

    const deleted = await prisma.todo.delete({
      where: { id }
    });

    ( deleted ) 
      ? res.json( deleted )
      : res.status(400).json({ error: `Todo with id ${ id } not found` });
    

  }
 */