import React, { useState, useContext } from 'react';
import { css } from '@emotion/core';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import Layout from '../components/layout/Layout';
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario';

import { FirebaseContext } from '../firebase';

import Error404 from '../components/layout/404';

// validaciones
import useValidacion from '../hooks/useValidacion';
import validarCrearProducto from '../validacion/validarCrearProducto';

const STATE_INICIAL = {
  nombre: '',
  descripcion: ''
}

const NuevoProducto = () => {

  // state de las imagenes
  const [nombreimagen, guardarNombre] = useState('');
  const [subiendo, guardarSubiendo] = useState(false);
  const [ progreso, guardarProgreso ] = useState(0);
  const [urlimagen, guardarUrlImagen] = useState('');

  const [ error, guardarError] = useState(false);

  const { valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);

  const { nombre, empresa, imagen, url, descripcion } = valores;

  // hook de routing para redireccionar
  const router = useRouter();

  // context con las operaciones crud de firebase
  const { usuario, firebase } = useContext(FirebaseContext);

  async function crearProducto() {

    // si el usuario no esta autenticado llevar al login
    if(!usuario) {
      return router.push('/login');
    }

    // crear el objeto de nuevo producto 
    const producto = {
        nombre, 
        descripcion,
        votos: 0,
        comentarios: [],
        creado: Date.now(), 
        creador: {
          id: usuario.uid,
          nombre: usuario.displayName
        }, 
        haVotado: []
    }

    // insertarlo en la base de datos
    firebase.db.collection('productos').add(producto);

    return router.push('/');

  }


  const handleUploadStart = () => {
      guardarProgreso(0);
      guardarSubiendo(true);
  }

  const handleProgress = progreso => guardarProgreso({ progreso });

  const handleUploadError = error => {
      guardarSubiendo(error);
      console.error(error);
  };

  const handleUploadSuccess = nombre => {
      guardarProgreso(100);
      guardarSubiendo(false);
      guardarNombre(nombre)
      firebase
          .storage
          .ref("productos")
          .child(nombre)
          .getDownloadURL()
          .then(url => {
            console.log(url);
            guardarUrlImagen(url);
          } );
  };
  var firebaseConfig = {
    apiKey: "AIzaSyB9IYuYQz8HDD05lg_mGm7dWRT8N8hVUoQ",
    authDomain: "tomatazos-fda73.firebaseapp.com",
    databaseURL: "https://tomatazos-fda73.firebaseio.com",
    projectId: "tomatazos-fda73",
    storageBucket: "tomatazos-fda73.appspot.com",
    messagingSenderId: "842115808564",
    appId: "1:842115808564:web:ae0fb841d5cea1ae5e7961"
  };

  return (
    <div>
      <Layout>
        { !usuario ? <Error404 /> : (
          <>
            <h1
              css={css`
                text-align: center;
                margin-top: 5rem;
              `}
            >Nueva Reseña</h1>
            <Formulario
              onSubmit={handleSubmit}
              noValidate
            >

              <fieldset>
                <legend>Información de la Pelicula </legend>
            
                <Campo>
                    <label htmlFor="nombre">Nombre de la Pelicula</label>
                    <input 
                        type="text"
                        id="nombre"
                        placeholder="Nombre de la pelicula"
                        name="nombre"
                        value={nombre}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </Campo>

                {errores.nombre && <Error>{errores.nombre}</Error> }

              </fieldset>

              <fieldset>
                

                <Campo>
                    <label htmlFor="descripcion">Reseña</label>
                    <textarea 
                        id="descripcion"
                        name="descripcion"
                        value={descripcion}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                </Campo>

                {errores.descripcion && <Error>{errores.descripcion}</Error> }
              </fieldset>

              
                

                {error && <Error>{error} </Error>}
    
                <InputSubmit 
                  type="submit"
                  value="Crear Reseña"
                />
            </Formulario>
          </>
        ) }
        
      </Layout>
    </div>
  )
}

export default NuevoProducto;