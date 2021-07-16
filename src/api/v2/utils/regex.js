'use strict';

/**
 * Expresiones regulares para validar datos de modelos de componentes.
 */

const email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,20})+$/;
const password = /^(?=.*[A-Z])(?=.*[0-9])(?=.{7,})/;

module.exports = {
    email,
    password
};