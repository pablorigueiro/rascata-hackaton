// Cabecera de cada rol: quién soy en esta pestaña y enlace para cambiarlo.
export default function Identidad({ rol, nombre, detalle }) {
  return (
    <div className="identidad">
      <div>
        <p className="identidad__rol">{rol}</p>
        <h1 className="identidad__nombre">{nombre}</h1>
        {detalle && <p className="identidad__detalle">{detalle}</p>}
      </div>
      <a href="#/" className="identidad__cambiar">Cambiar</a>
    </div>
  )
}
