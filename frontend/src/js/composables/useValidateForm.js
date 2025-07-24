
/*
 * Función para validar un formulario
 * @param {Object} formValues - Datos ingresados por el usuario {campo: valor}
 * @param {Object} validationRules - Reglas de validación {campo: { reglas }}
 * @returns {Object} - Devuelve los errores {campo: mensajeError}
*/

export function validateForm(formValues, validationRules) {
    
    const errors = {}; // Aquí guardaremos los errores encontrados

    for (const field in validationRules) {
        const rules = validationRules[field]; // Reglas para el campo actual
        const value = formValues[field] || ''; // Valor ingresado (o vacío si no existe)

        // Validación de campo obligatorio
        if (rules.required) {
            const isEmptyString = typeof value === 'string' && value.trim() === '';
            const isEmptyArray = Array.isArray(value) && value.length === 0;
            const isEmptyFile = value instanceof FileList && value.length === 0;
            const isNullish = value === null || value === undefined;

            if (isNullish || isEmptyString || isEmptyArray || isEmptyFile) {
                errors[field] = 'Este campo es obligatorio.';
                continue;
            }
        }

        // Validar longitud mínima
        if (rules.minLength && value.length < rules.minLength) {
            errors[field] = `Debe tener al menos ${rules.minLength} caracteres.`;
        }

        // Validar longitud máxima
        if (rules.maxLength && value.length > rules.maxLength) {
            errors[field] = `No puede superar los ${rules.maxLength} caracteres.`;
        }

        // Validar formato de email
        if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors[field] = 'Ingrese un correo electrónico válido.';
        }

        // Validar si debe ser un número
        if (rules.numeric && isNaN(value)) {
            errors[field] = 'Este campo debe ser un número.';
        }

        // Validar si debe coincidir con otro campo (ej. confirmación de contraseña)
        if (rules.match && value !== formValues[rules.match]) {
            errors[field] = 'Los valores no coinciden.';
        }

        // Validar si la contraseña tiene al menos un número
        if (rules.hasNumber && !/\d/.test(value)) {
            errors[field] = 'Debe contener al menos un número.';
        }

        // Validar si la contraseña tiene al menos un carácter especial
        if (rules.hasSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            errors[field] = 'Debe contener al menos un carácter especial.';
        }
    }

    return errors; // Retorna los errores encontrados
}


// EJEMPLO

// import { validateForm } from './validateForm.js';

// const formValues = {
//     nombre: 'Ana',
//     email: 'correo.com', // ❌ Error: No es un email válido
//     password: 'abc123', // ❌ Error: Falta un carácter especial
//     confirmPassword: 'abc123' // ❌ Error: Falta un carácter especial
// };

// // Reglas de validación
// const validationRules = {
//     nombre: { required: true, minLength: 3 },
//     email: { required: true, email: true },
//     password: { required: true, minLength: 6, hasNumber: true, hasSpecialChar: true },
//     confirmPassword: { required: true, match: 'password' }
// };

// // Validamos el formulario
// const errors = validateForm(formValues, validationRules);

// console.log(errors);

// {
//     "email": "Ingrese un correo electrónico válido.",
//     "password": "Debe contener al menos un carácter especial.",
//     "confirmPassword": "Debe contener al menos un carácter especial."
// }