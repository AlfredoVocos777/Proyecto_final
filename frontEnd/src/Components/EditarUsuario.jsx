import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL_USUARIOS, URL_ROLES, URL_DEPARTAMENTOS } from "../Constants/endpoints";

export default function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    direccion: "",
    telefono: "",
    usuario: "",
    id_rol: null,
    id_departamento: null,
    contraseña: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [uRes, rRes, dRes] = await Promise.all([
          axios.get(`${URL_USUARIOS}/${id}`),
          axios.get(URL_ROLES),
          axios.get(URL_DEPARTAMENTOS),
        ]);
        const u = uRes.data;
        setForm(f => ({
          ...f,
          nombre: u.nombre || "",
          apellido: u.apellido || "",
          dni: u.dni || "",
          email: u.email || "",
          direccion: u.direccion || "",
          telefono: u.telefono || "",
          usuario: u.usuario || "",
          id_rol: u.id_rol || null,
          id_departamento: u.id_departamento || null,
          contraseña: "",
        }));
        setRoles(rRes.data || []);
        setDepartamentos(dRes.data || []);
        setError("");
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el usuario o los roles");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setOk("");
    try {
      const payload = { ...form };
      if (!payload.contraseña) delete payload.contraseña; // solo si quiere cambiarla
      await axios.put(`${URL_USUARIOS}/${id}`, payload);
      setOk("Usuario actualizado");
      // Volver al listado después de 1 segundo
      setTimeout(() => navigate('/GestionarUsuarios'), 1000);
    } catch (e) {
      console.error(e);
      setError("No se pudo actualizar el usuario");
    }
  };

  if (loading) return <div className="container mt-5 pt-5">Cargando...</div>;

  return (
    <div className="page-container">
      <div className="form-container" style={{maxWidth: 700}}>
        <h2 className="form-title">Editar Usuario</h2>
        {error && <div className="message message-error">{error}</div>}
        {ok && <div className="message message-success">{ok}</div>}

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <div>
              <label>Nombre</label>
              <input className="form-input" name="nombre" value={form.nombre} onChange={onChange} />
            </div>
            <div>
              <label>Apellido</label>
              <input className="form-input" name="apellido" value={form.apellido} onChange={onChange} />
            </div>
            <div>
              <label>DNI</label>
              <input className="form-input" name="dni" value={form.dni} onChange={onChange} />
            </div>
            <div>
              <label>Email</label>
              <input className="form-input" name="email" value={form.email} onChange={onChange} />
            </div>
            <div>
              <label>Dirección</label>
              <input className="form-input" name="direccion" value={form.direccion} onChange={onChange} />
            </div>
            <div>
              <label>Teléfono</label>
              <input className="form-input" name="telefono" value={form.telefono} onChange={onChange} />
            </div>
            <div>
              <label>Usuario</label>
              <input className="form-input" name="usuario" value={form.usuario} onChange={onChange} />
            </div>
            <div>
              <label>Rol</label>
              <select className="form-input" name="id_rol" value={form.id_rol || ''} onChange={onChange}>
                <option value="">(sin rol)</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                ))}
              </select>
            </div>
            {/* Solo mostrar departamento si el rol NO es Presentante */}
            {(() => {
              const rolSeleccionado = roles.find(r => r.id_rol === parseInt(form.id_rol));
              const esPresentante = rolSeleccionado?.nombre?.toLowerCase() === 'presentante';
              
              if (!esPresentante) {
                return (
                  <div>
                    <label>Departamento</label>
                    <select className="form-input" name="id_departamento" value={form.id_departamento || ''} onChange={onChange}>
                      <option value="">Sin departamento</option>
                      {departamentos.map(d => (
                        <option key={d.id_departamento} value={d.id_departamento}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}
            <div>
              <label>Nueva contraseña (opcional)</label>
              <input className="form-input" name="contraseña" type="password" value={form.contraseña} onChange={onChange} />
            </div>
          </div>
          <button className="btn-primary" type="submit">Guardar cambios</button>
          <button className="btn-primary" type="button" style={{marginTop: 10}} onClick={() => navigate(-1)}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}
