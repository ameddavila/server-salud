import { Router } from 'express';
import { receiveData, receiveDataLogOnly } from '../controllers/dataController';

const router = Router();

// Ruta para insertar datos en la base de datos
router.post('/medicamentos', receiveData);

// Ruta para solo registrar los datos recibidos
router.post('/medicamentos/log', receiveDataLogOnly);

export default router;
