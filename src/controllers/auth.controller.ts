import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  EstadoUsuario,
  JwtPayload,
  LoginInput,
  RegistroDonanteInput,
  Rol,
  Usuario
} from '../types/user';

// Sustituir por un repositorio de base de datos en producción.
export const usersDatabase: Usuario[] = [];
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET es obligatoria');
}

const publicUser = (user: Usuario): Omit<Usuario, 'passwordHash'> => {
  const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const registerDonor = async (
  req: Request<unknown, unknown, RegistroDonanteInput>,
  res: Response
): Promise<Response> => {
  try {
    const nombre = req.body.nombre?.trim();
    const correo = req.body.correo?.trim().toLowerCase();
    const password = req.body.password;

    if (!nombre || !correo || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
    }

    if (usersDatabase.some((user) => user.correo === correo)) {
      return res.status(409).json({ mensaje: 'El correo ya está registrado' });
    }

    const now = new Date();
    const user: Usuario = {
      id: randomUUID(),
      nombre,
      correo,
      passwordHash: await bcrypt.hash(password, 12),
      rol: Rol.DONANTE,
      estado: EstadoUsuario.ACTIVO,
      creadoEn: now,
      actualizadoEn: now
    };

    usersDatabase.push(user);

    return res.status(201).json({
      mensaje: 'Donante registrado con éxito',
      usuario: publicUser(user)
    });
  } catch {
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response
): Promise<Response> => {
  const correo = req.body.correo?.trim().toLowerCase();
  const password = req.body.password;
  const user = usersDatabase.find((candidate) => candidate.correo === correo);

  if (!user || user.estado !== EstadoUsuario.ACTIVO || !password || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ mensaje: 'Credenciales inválidas' });
  }

  const payload: JwtPayload = { sub: user.id, correo: user.correo, rol: user.rol };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

  return res.status(200).json({
    accessToken,
    usuario: publicUser(user)
  });
};