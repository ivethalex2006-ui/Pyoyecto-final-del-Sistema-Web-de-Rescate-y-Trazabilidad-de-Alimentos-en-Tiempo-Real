export enum Rol {
  ADMIN = 'ADMIN',
  DONANTE = 'DONANTE',
  BENEFICIARIO = 'BENEFICIARIO',
  VOLUNTARIO = 'VOLUNTARIO'
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  BLOQUEADO = 'BLOQUEADO'
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: Rol;
  estado: EstadoUsuario;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface RegistroDonanteInput {
  nombre: string;
  correo: string;
  password: string;
}

export interface LoginInput {
  correo: string;
  password: string;
}

export interface JwtPayload {
  sub: string;
  correo: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}