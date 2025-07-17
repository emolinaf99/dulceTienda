// Usuario es el usuario en sesion
// Rol es el string que hace referencia al rol que tiene permiso y que se debe buscar en usuario

export async function funcionPermisoDeRol (usuario, rol) {

    let permisoEncontrado  = usuario ? usuario.role == rol : null

    if(permisoEncontrado != null){
        return true 
    } else {
        return false
    }
}