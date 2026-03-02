import React, { useState, useEffect } from 'react';
import './App.css';

// --- COMPONENTES ---

const Header = ({ setView, user, logout, cartCount, toggleCart, tasaUSD }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavClick = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {isMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>

      <div className="logo" onClick={() => handleNavClick('home')}>TOMFORD</div>

      {/* Aquí se agregó la condición para la clase 'open' */}
      <nav className={`desktop-nav ${isMenuOpen ? 'open' : ''}`}>
        <button onClick={() => handleNavClick('home')}>Fragancias</button>
        <button onClick={() => handleNavClick('catalogo')} className="nav-btn">CATÁLOGO</button>
        <button onClick={() => handleNavClick('home')}>Regalos</button>
        <button onClick={() => handleNavClick('home')}>Servicios</button>
        {user === 'admin1' && (
          <button onClick={() => handleNavClick('admin')} className="nav-btn" style={{ color: '#d4af37' }}>ADMIN</button>
        )}
        {tasaUSD && (
          <span style={{ marginLeft: '20px', color: '#888', fontSize: '0.7rem', letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
            1 USD = ${(1 / tasaUSD).toFixed(2)} MXN
          </span>
        )}
      </nav>

      <div className="header-icons">
        <div className="desktop-auth">
          {user ? (
            <div className="user-dropdown-container">
              <button className="user-name-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                {user.toUpperCase()} ▾
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  {user === 'admin1' && (
                    <button onClick={() => handleNavClick('admin')} style={{ color: '#d4af37' }}>PANEL ADMIN</button>
                  )}
                  <button onClick={() => handleNavClick('orders')}>MIS PEDIDOS</button>
                  <button onClick={() => { logout(); setIsUserMenuOpen(false); setIsMenuOpen(false); }}>SALIR</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => handleNavClick('login')}>CUENTA</button>
          )}
        </div>
        <button onClick={() => { toggleCart(); setIsMenuOpen(false); }} className="cart-icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
        </button>
      </div>
    </header>
  );
};
const CartDrawer = ({ isOpen, closeCart, cart, removeFromCart, handleCheckout, updateCartSize, updateCartQuantity }) => {
  const total = cart.reduce((acc, item) => acc + (Number(item.precio) * item.quantity), 0);
  const [cp, setCp] = useState('');
  const [calleColonia, setCalleColonia] = useState('');
  const [numero, setNumero] = useState('');
  const [direccionApi, setDireccionApi] = useState(null);

  const buscarCP = async (codigo) => {
    setCp(codigo);
    if (codigo.length === 5) {
      try {
        const res = await fetch(`/api/envio/${codigo}`); // CAMBIO: Ruta relativa
        const data = await res.json();
        if (res.ok) setDireccionApi(`${data.ciudad}, ${data.estado}`);
        else setDireccionApi(null);
      } catch (err) { console.error(err); }
    } else setDireccionApi(null);
  };

  const procesarPedido = () => {
    if (!calleColonia || !numero || !cp) return;
    const direccionFinal = `${calleColonia}, #${numero}. CP: ${cp}. ${direccionApi || ''}`;
    handleCheckout(direccionFinal);
  };

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h3>TU SELECCIÓN</h3>
          <button onClick={closeCart} className="close-btn">×</button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart">Tu carrito está vacío.</div>
        ) : (
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={`${item._id}-${item.selectedSize}`} className="cart-item">
                <img src={item.imagen_url} alt={item.nombre} onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="item-info">
                  <div className="info-top">
                    <h4>{item.nombre.split('(')[0]}</h4>
                    <button onClick={() => removeFromCart(index)} className="remove-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="cart-size-selector">
                    <button className={item.selectedSize === '50ml' ? 'active' : ''} onClick={() => updateCartSize(index, '50ml')}>50ML</button>
                    <span>|</span>
                    <button className={item.selectedSize === '100ml' ? 'active' : ''} onClick={() => updateCartSize(index, '100ml')}>100ML</button>
                  </div>
                  <div className="controls-row">
                    <div className="quantity-controls compact">
                      <button className="qty-btn" onClick={() => updateCartQuantity(index, -1)} disabled={item.quantity <= 1}>−</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateCartQuantity(index, 1)}>+</button>
                    </div>
                    <p className="cart-price">${(item.precio * item.quantity).toLocaleString('es-MX')} MXN</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="cart-footer">
          {cart.length > 0 && (
            <div className="shipping-form-luxury" style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
              <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>DATOS DE ENVÍO</p>
              <input type="text" placeholder="CALLE Y COLONIA" value={calleColonia} onChange={e => setCalleColonia(e.target.value)} style={{ width: '100%', padding: '10px', background: 'transparent', color: '#fff', border: '1px solid #333', marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="NÚMERO" value={numero} onChange={e => setNumero(e.target.value)} style={{ width: '50%', padding: '10px', background: 'transparent', color: '#fff', border: '1px solid #333' }} />
                <input type="text" placeholder="C.P." value={cp} onChange={e => buscarCP(e.target.value)} maxLength="5" style={{ width: '50%', padding: '10px', background: 'transparent', color: '#fff', border: '1px solid #333' }} />
              </div>
              {direccionApi && <p style={{ fontSize: '0.75rem', color: '#d4af37' }}>📍 {direccionApi}</p>}
            </div>
          )}
          <div className="total-row">
            <span>TOTAL</span>
            <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
          </div>
          <button className="btn-luxury full-width" onClick={procesarPedido}>PAGAR AHORA</button>
        </div>
      </div>
    </div>
  );
};

const AdminView = () => {
  const [productos, setProductos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [form, setForm] = useState({ 
    nombre: '', categoria: '', precio_50: '', precio_100: '', stock_50: '', stock_100: '', imagen_url: '' 
  });

  const fetchProductos = () => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data.resultados || []));
  };

  useEffect(() => { fetchProductos(); }, []);

  const confirmarEliminacion = async () => {
    if (!productToDelete) return;
    await fetch(`/api/productos/${productToDelete}`, { method: 'DELETE' }); // CAMBIO: Ruta relativa
    setProductToDelete(null);
    fetchProductos();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `/api/productos/${editingId}` : '/api/productos'; // CAMBIO: Ruta relativa
    
    const datosParaEnviar = {
      nombre: form.nombre,
      categoria: form.categoria,
      imagen_url: form.imagen_url,
      precio_50: Number(form.precio_50),
      precio_100: Number(form.precio_100),
      stock_50: Number(form.stock_50),
      stock_100: Number(form.stock_100)
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosParaEnviar)
    });
    
    if (res.ok) {
      setForm({ nombre: '', categoria: '', precio_50: '', precio_100: '', stock_50: '', stock_100: '', imagen_url: '' });
      setEditingId(null);
      fetchProductos();
    }
  };

  const handleEdit = (prod) => {
    setForm(prod);
    setEditingId(prod._id);
  };

  const estiloInput = {
    width: '100%',
    padding: '16px 20px',
    background: '#0a0a0a',
    color: '#fff',
    border: '1px solid #222',
    outline: 'none',
    fontSize: '0.75rem',
    letterSpacing: '1.5px',
    transition: 'border-color 0.3s'
  };

  const labelStyle = { 
    fontSize: '0.65rem', 
    color: '#d4af37', 
    marginBottom: '8px', 
    letterSpacing: '1px',
    display: 'block'
  };

  return (
    <div className="container" style={{ minHeight: '80vh', padding: '50px 20px', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '50px', letterSpacing: '3px', color: '#fff', fontWeight: '300' }}>PANEL DE ADMINISTRACIÓN</h2>
      
      <div style={{ background: '#050505', padding: '40px', border: '1px solid #1a1a1a', marginBottom: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h3 style={{ marginBottom: '30px', color: '#d4af37', fontSize: '0.9rem', letterSpacing: '2px', textAlign: 'center', borderBottom: '1px solid #1a1a1a', paddingBottom: '15px' }}>
          {editingId ? 'EDITAR PRODUCTO' : 'AGREGAR NUEVO PRODUCTO'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'flex-start' }}>
          
          <div style={{ flex: '1 1 calc(33% - 20px)', minWidth: '250px' }}>
            <label style={labelStyle}>NOMBRE DEL PRODUCTO:</label>
            <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>

          <div style={{ flex: '1 1 calc(33% - 20px)', minWidth: '250px' }}>
            <label style={labelStyle}>CATEGORÍA (EJ. PRIVATE BLEND):</label>
            <input type="text" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>

          <div style={{ flex: '1 1 calc(33% - 20px)', minWidth: '250px' }}>
            <label style={labelStyle}>RUTA DE LA IMAGEN (/img/...webp):</label>
            <input type="text" value={form.imagen_url} onChange={e => setForm({...form, imagen_url: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>
          
          <div style={{ flex: '1 1 calc(25% - 20px)', minWidth: '200px' }}>
            <label style={labelStyle}>PRECIO 50ML (MXN):</label>
            <input type="number" value={form.precio_50} onChange={e => setForm({...form, precio_50: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>

          <div style={{ flex: '1 1 calc(25% - 20px)', minWidth: '200px' }}>
            <label style={labelStyle}>PRECIO 100ML (MXN):</label>
            <input type="number" value={form.precio_100} onChange={e => setForm({...form, precio_100: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>

          <div style={{ flex: '1 1 calc(25% - 20px)', minWidth: '200px' }}>
            <label style={labelStyle}>STOCK 50ML:</label>
            <input type="number" value={form.stock_50} onChange={e => setForm({...form, stock_50: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>

          <div style={{ flex: '1 1 calc(25% - 20px)', minWidth: '200px' }}>
            <label style={labelStyle}>STOCK 100ML:</label>
            <input type="number" value={form.stock_100} onChange={e => setForm({...form, stock_100: e.target.value})} required style={estiloInput} onFocus={(e) => e.target.style.borderColor = '#d4af37'} onBlur={(e) => e.target.style.borderColor = '#222'} />
          </div>
          
          <div style={{ width: '100%', display: 'flex', gap: '20px', marginTop: '10px' }}>
            <button type="submit" className="btn-luxury" style={{ flex: 1, padding: '16px 0', fontSize: '0.8rem' }}>{editingId ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ nombre: '', categoria: '', precio_50: '', precio_100: '', stock_50: '', stock_100: '', imagen_url: '' }); }} className="btn-luxury" style={{ flex: 1, background: '#111', borderColor: '#222', color: '#888', padding: '16px 0', fontSize: '0.8rem' }}>
                CANCELAR
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ overflowX: 'auto', background: '#050505', border: '1px solid #1a1a1a', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '0.9rem', letterSpacing: '2px' }}>INVENTARIO ACTUAL</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #d4af37', color: '#d4af37', letterSpacing: '1px' }}>
              <th style={{ padding: '15px 10px', fontWeight: 'normal' }}>IMG</th>
              <th style={{ padding: '15px 10px', fontWeight: 'normal' }}>NOMBRE</th>
              <th style={{ padding: '15px 10px', fontWeight: 'normal' }}>CATEGORÍA</th>
              <th style={{ padding: '15px 10px', fontWeight: 'normal' }}>PRECIO (50/100)</th>
              <th style={{ padding: '15px 10px', fontWeight: 'normal' }}>STOCK (50/100)</th>
              <th style={{ padding: '15px 10px', fontWeight: 'normal', textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid #111', transition: 'background 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#0a0a0a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '15px 10px' }}><img src={p.imagen_url} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '2px' }} /></td>
                <td style={{ padding: '15px 10px', color: '#eee', letterSpacing: '1px' }}>{p.nombre}</td>
                <td style={{ padding: '15px 10px', color: '#888' }}>{p.categoria}</td>
                <td style={{ padding: '15px 10px', color: '#aaa' }}>${p.precio_50} / ${p.precio_100}</td>
                <td style={{ padding: '15px 10px', color: '#aaa' }}>{p.stock_50} / {p.stock_100}</td>
                <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(p)} style={{ padding: '8px 15px', marginRight: '10px', background: 'transparent', color: '#d4af37', border: '1px solid #d4af37', cursor: 'pointer', fontSize: '0.7rem', transition: 'all 0.3s' }} onMouseEnter={(e) => {e.target.style.background = '#d4af37'; e.target.style.color = '#000'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#d4af37'}}>EDITAR</button>
                  <button onClick={() => setProductToDelete(p._id)} style={{ padding: '8px 15px', background: 'transparent', color: '#cf4d4d', border: '1px solid #cf4d4d', cursor: 'pointer', fontSize: '0.7rem', transition: 'all 0.3s' }} onMouseEnter={(e) => {e.target.style.background = '#cf4d4d'; e.target.style.color = '#fff'}} onMouseLeave={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#cf4d4d'}}>ELIMINAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {productToDelete && (
        <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{fontSize: '1.2rem', marginBottom: '20px', color: '#fff'}}>¿ELIMINAR PRODUCTO?</h2>
            <p style={{fontSize: '0.8rem', color: '#888', marginBottom: '30px'}}>Esta acción no se puede deshacer y el producto será borrado del catálogo.</p>
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button className="btn-luxury" onClick={confirmarEliminacion} style={{background: '#cf4d4d', color: '#fff', borderColor: '#cf4d4d'}}>ELIMINAR</button>
              <button className="btn-luxury" onClick={() => setProductToDelete(null)} style={{background: '#333', borderColor: '#333'}}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CatalogoView = ({ productos, addToCart, tasaUSD }) => (
  <div className="container" style={{ minHeight: '80vh', padding: '50px 20px', color: '#fff' }}>
    <h2 style={{ textAlign: 'center', marginBottom: '40px', letterSpacing: '2px' }}>CATÁLOGO</h2>
    <div className="grid">
      {productos && productos.length > 0 ? (
        productos.map(prod => (
          <ProductCard key={prod._id} prod={prod} addToCart={addToCart} tasaUSD={tasaUSD} />
        ))
      ) : (
        <p style={{ textAlign: 'center', width: '100%' }}>Cargando catálogo...</p>
      )}
    </div>
  </div>
);

const OrdersView = ({ setView, setCart, setIsCartOpen }) => {
  const [pedidos, setPedidos] = useState([]);
  const [orderToDelete, setOrderToDelete] = useState(null); 
  const [direcciones, setDirecciones] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchPedidos = async () => {
    const res = await fetch('/api/pedidos', { // CAMBIO: Ruta relativa
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setPedidos(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const confirmarEliminacion = async () => {
    if (!orderToDelete) return;
    await fetch(`/api/pedidos/${orderToDelete}`, { // CAMBIO: Ruta relativa
      method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setOrderToDelete(null);
    fetchPedidos();
  };

  const handleDirChange = (id, valor) => {
    setDirecciones({ ...direcciones, [id]: valor });
  };

  const actualizarDireccion = async (id) => {
    const pedido = pedidos.find(p => p._id === id);
    const nuevaDir = direcciones[id] || pedido.direccion_envio;
    await fetch(`/api/pedidos/${id}`, { // CAMBIO: Ruta relativa
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ direccion_envio: nuevaDir })
    });
    setShowUpdateModal(true);
    fetchPedidos();
  };

  const toggleDropdown = (orderId, index) => {
    const key = `${orderId}-${index}`;
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOrderDropdown = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  return (
    <div className="container orders-container" style={{ flexGrow: 1, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <h2>HISTORIAL DE ÓRDENES</h2>
      {pedidos.map(p => {
        const isOrderExpanded = expandedOrders[p._id];
        return (
          <div key={p._id} className="order-card-luxury">
            <div 
              className="order-card-header" 
              onClick={() => toggleOrderDropdown(p._id)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>ORDEN #{p._id}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {new Date(p.fecha).toLocaleDateString()}
                <span style={{ fontSize: '0.8rem', color: '#d4af37' }}>{isOrderExpanded ? '▲' : '▼'}</span>
              </span>
            </div>
            
            {isOrderExpanded && (
              <>
                <div className="order-card-body">
                  {p.productos.map((item, i) => {
                    const isExpanded = expandedItems[`${p._id}-${i}`];
                    return (
                      <div key={i} style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '10px', marginBottom: '10px' }}>
                        <div 
                          className="order-item-line" 
                          onClick={() => toggleDropdown(p._id, i)}
                          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span>{item.nombre} <span style={{fontSize: '0.6rem', color: '#d4af37', marginLeft: '10px'}}>{isExpanded ? '▲' : '▼'}</span></span>
                          <span>x{item.quantity}</span>
                        </div>
                        
                        {isExpanded && (
                          <div style={{ display: 'flex', gap: '15px', marginTop: '15px', padding: '10px', background: '#080808', border: '1px solid #1a1a1a' }}>
                            <img src={item.imagen_url} alt={item.nombre} style={{ width: '60px', height: 'auto', objectFit: 'contain' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>{item.categoria || 'PRIVATE BLEND'}</span>
                              <span style={{ color: '#d4af37', marginTop: '5px', fontSize: '0.9rem' }}>${Number(item.precio).toLocaleString('es-MX')} MXN <span style={{fontSize: '0.6rem', color: '#666'}}>(C/U)</span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="address-edit-box" style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                    <label style={{ fontSize: '0.6rem', color: '#d4af37', letterSpacing: '2px' }}>DIRECCIÓN DE ENVÍO</label>
                    <textarea 
                      defaultValue={p.direccion_envio} 
                      onChange={(e) => handleDirChange(p._id, e.target.value)} 
                      style={{ width: '100%', background: 'transparent', color: '#888', border: '1px solid #1a1a1a', padding: '10px', marginTop: '10px', resize: 'none' }} 
                    />
                    <button 
                      onClick={() => actualizarDireccion(p._id)} 
                      style={{ marginTop: '10px', padding: '8px 15px', background: 'transparent', color: '#d4af37', border: '1px solid #d4af37', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '1px' }}
                    >
                      GUARDAR CAMBIOS
                    </button>
                  </div>
                </div>
                <div className="order-card-footer">
                  <span className="total-gold">${Number(p.total).toLocaleString()} MXN</span>
                  <div className="order-btns">
                    <button onClick={() => {setCart(p.productos); setIsCartOpen(true); setView('home');}} className="btn-order-edit">RE-ORDENAR</button>
                    <button onClick={() => setOrderToDelete(p._id)} className="btn-order-del">ELIMINAR</button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {orderToDelete && (
        <div className="modal-overlay" onClick={() => setOrderToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{fontSize: '1.2rem', marginBottom: '20px'}}>¿CANCELAR ORDEN?</h2>
            <p style={{fontSize: '0.8rem', color: '#888', marginBottom: '30px'}}>La orden #{orderToDelete} será eliminada permanentemente.</p>
            <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
              <button className="btn-luxury" onClick={confirmarEliminacion} style={{background: '#cf4d4d', color: '#fff'}}>ELIMINAR</button>
              <button className="btn-luxury" onClick={() => setOrderToDelete(null)} style={{background: '#333'}}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{fontSize: '1.2rem', marginBottom: '20px', marginTop: '10px'}}>Actualizado con éxito</h2>
            <button className="btn-luxury" onClick={() => setShowUpdateModal(false)}>CERRAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ prod, addToCart, tasaUSD }) => {
  const [size, setSize] = useState('50ml');
 
  const currentPrice = size === '50ml' ? prod.precio_50 : prod.precio_100;
  // Cálculo de conversión a dólares usando la tasa de la API
  const precioUSD = tasaUSD ? (currentPrice * tasaUSD).toFixed(2) : null;

  const handleAdd = () => {
    addToCart({ 
      ...prod, 
      nombre: `${prod.nombre} (${size})`, 
      precio: currentPrice, 
      selectedSize: size, 
      quantity: 1 
    });
  };

  return (
    <div className="card">
      <div className="img-container">
        <img src={prod.imagen_url} alt={prod.nombre} />
      </div>
      <h3>{prod.nombre}</h3>
      <p className="category">{prod.categoria || 'PRIVATE BLEND'}</p>
      
      {/* SELECTOR DE TAMAÑO ORIGINAL CON DIVISOR */}
      <div className="size-selector">
        <button 
          className={`size-btn ${size === '50ml' ? 'active' : ''}`} 
          onClick={() => setSize('50ml')}
        >
          50ML
        </button>
        <span className="divider">|</span>
        <button 
          className={`size-btn ${size === '100ml' ? 'active' : ''}`} 
          onClick={() => setSize('100ml')}
        >
          100ML
        </button>
      </div>

      <span className="price">${Number(currentPrice).toLocaleString('es-MX')} MXN</span>
      
      {/* CONVERSIÓN A DÓLARES (API) */}
      {precioUSD && (
        <p className="usd-tag" style={{ fontSize: '0.7rem', color: '#666', marginTop: '5px', marginBottom: '20px', letterSpacing: '1px' }}>
          APROX. ${precioUSD} USD
        </p>
      )}

      <button className="btn-add" onClick={handleAdd}>
        AÑADIR AL CARRITO
      </button>
    </div>
  );
};

const ProductGrid = ({ addToCart, productos, tasaUSD }) => {
  return (
    <section id="catalogo" className="products-section">
      <h2>Colección Privada</h2>
      <div className="grid">
        {productos.slice(0, 8).map(prod => (
          <ProductCard 
            key={prod._id} 
            prod={prod} 
            addToCart={addToCart} 
            tasaUSD={tasaUSD} 
          />
        ))}
      </div>
    </section>
  );
};

const Login = ({ setUser, setView }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  const handle = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/registro' : '/login';
    const res = await fetch(`/api/auth${endpoint}`, { // CAMBIO: Ruta relativa
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) { 
      if(isRegistering) { setIsRegistering(false); }
      else { 
        localStorage.setItem('token', data.token); 
        localStorage.setItem('usuario', data.usuario); 
        setUser(data.usuario); 
        if(data.usuario === 'admin1') {
          setView('admin');
        } else {
          setView('home'); 
        }
      }
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `/api/auth/${provider}`; // CAMBIO: Ruta relativa
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="auth-tabs">
          <button className={!isRegistering ? 'active' : ''} onClick={() => setIsRegistering(false)}>INGRESAR</button>
          <span className="divider">|</span>
          <button className={isRegistering ? 'active' : ''} onClick={() => setIsRegistering(true)}>CREAR CUENTA</button>
        </div>
        <h2 className="auth-title">{isRegistering ? 'Bienvenido' : 'Ingreso Exclusivo'}</h2>
        
        <form onSubmit={handle}>
          <input type="text" placeholder="USUARIO" required onChange={e => setForm({...form, nombre: e.target.value})} className="input-luxury" />
          {isRegistering && <input type="email" placeholder="EMAIL" required onChange={e => setForm({...form, email: e.target.value})} className="input-luxury" />}
          <input type="password" placeholder="PASSWORD" required onChange={e => setForm({...form, password: e.target.value})} className="input-luxury" />
          <button type="submit" className="btn-luxury full-width">{isRegistering ? 'REGISTRARME' : 'ENTRAR'}</button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', color: '#888', marginBottom: '15px', letterSpacing: '2px' }}>O CONTINUAR CON</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button onClick={() => handleOAuth('google')} style={{ padding: '8px', background: 'transparent', color: '#d4af37', border: '1px solid #333', cursor: 'pointer', fontSize: '0.7rem', flex: 1, letterSpacing: '1px' }}>GOOGLE</button>
            <button onClick={() => handleOAuth('github')} style={{ padding: '8px', background: 'transparent', color: '#d4af37', border: '1px solid #333', cursor: 'pointer', fontSize: '0.7rem', flex: 1, letterSpacing: '1px' }}>GITHUB</button>
            <button onClick={() => handleOAuth('facebook')} style={{ padding: '8px', background: 'transparent', color: '#d4af37', border: '1px solid #333', cursor: 'pointer', fontSize: '0.7rem', flex: 1, letterSpacing: '1px' }}>FACEBOOK</button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(localStorage.getItem('usuario') || null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [tasaUSD, setTasaUSD] = useState(null);

  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data.resultados || []));

    fetch('/api/conversion/MXN') // CAMBIO: Ruta relativa
      .then(res => res.json())
      .then(data => {
        if (data.tasasDeCambio) setTasaUSD(data.tasasDeCambio.USD);
      })
      .catch(err => console.error("Error en API Moneda:", err));
  }, [view]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenOAuth = query.get("token");
    const userOAuth = query.get("user");
    
    if (tokenOAuth && userOAuth) {
      localStorage.setItem('token', tokenOAuth);
      localStorage.setItem('usuario', userOAuth); 
      setUser(userOAuth);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("pago") === "exito") {
      const finalizar = async () => {
        const token = localStorage.getItem('token');
        const lastCart = JSON.parse(localStorage.getItem('last_cart') || '[]');
        const lastDir = localStorage.getItem('last_dir') || '';
        const total = lastCart.reduce((a, b) => a + (b.precio * b.quantity), 0);
        
        await fetch('/api/pedidos', { // CAMBIO: Ruta relativa
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ productos: lastCart, total, direccion_envio: lastDir })
        });

        try {
          const resProds = await fetch('/api/productos'); // CAMBIO: Corregido typo (awaitfetch)
          const dataProds = await resProds.json();
          const allProds = dataProds.resultados || [];

          for (const item of lastCart) {
            const prodDB = allProds.find(p => p._id === item._id);
            if (prodDB) {
              const stockKey = item.selectedSize === '50ml' ? 'stock_50' : 'stock_100';
              const nuevoStock = Math.max(0, prodDB[stockKey] - item.quantity);
              const { _id, ...datosActualizar } = prodDB;
              datosActualizar[stockKey] = nuevoStock;

              await fetch(`/api/productos/${item._id}`, { // CAMBIO: Ruta relativa
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizar)
              });
            }
          }
        } catch (err) {
          console.error("Error actualizando stock:", err);
        }

        setShowSuccessModal(true); setCart([]);
      };
      finalizar();
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleCheckout = async (direccion) => {
    const token = localStorage.getItem('token');
    if (!token) return setView('login');
    localStorage.setItem('last_cart', JSON.stringify(cart));
    localStorage.setItem('last_dir', direccion);
    const res = await fetch('/api/crear-pago', { // CAMBIO: Ruta relativa
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ carrito: cart })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="app">
      <Header setView={setView} user={user} logout={() => {localStorage.clear(); setUser(null); setView('home');}} cartCount={cart.length} toggleCart={() => setIsCartOpen(true)} tasaUSD={tasaUSD} />
      <CartDrawer isOpen={isCartOpen} closeCart={() => setIsCartOpen(false)} cart={cart} removeFromCart={(i) => setCart(cart.filter((_, idx) => idx !== i))} handleCheckout={handleCheckout} updateCartQuantity={(i, c) => { const nc = [...cart]; nc[i].quantity += c; if (nc[i].quantity >= 1) setCart(nc); }} updateCartSize={(i, s) => { const nc = [...cart]; nc[i].selectedSize = s; nc[i].precio = s === '50ml' ? Number(nc[i].precio_50) : Number(nc[i].precio_100); nc[i].nombre = nc[i].nombre.replace(/\((50|100)ml\)/, `(${s})`); setCart(nc); }} />
      
      {view === 'home' && (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>TOM FORD</h1>
              <p>Lujo moderno.</p>
              <button className="btn-luxury" onClick={() => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' })}>Descubrir</button>
            </div>
          </section>
          <div className="container" style={{ paddingTop: '80px' }}>
            <ProductGrid addToCart={(p) => {setCart([...cart, p]); setIsCartOpen(true);}} productos={productos} tasaUSD={tasaUSD} />
          </div>
        </>
      )}

      {view === 'catalogo' && (
        <CatalogoView 
          productos={productos} 
          addToCart={(p) => {setCart([...cart, p]); setIsCartOpen(true);}} 
          tasaUSD={tasaUSD}
        />
      )}

      {view === 'login' && <Login setUser={setUser} setView={setView} />}
      {view === 'orders' && <OrdersView setView={setView} setCart={setCart} setIsCartOpen={setIsCartOpen} />}
      {view === 'admin' && user === 'admin1' && <AdminView />}
      
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content">
            <div className="modal-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="1.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2>PAGO CONFIRMADO</h2>
            <button className="btn-luxury" onClick={() => setShowSuccessModal(false)}>LISTO</button>
          </div>
        </div>
      )}
      <footer className="footer"><p className="copyright">© 2026 TOMFORD BEAUTY. TODOS LOS DERECHOS RESERVADOS.</p></footer>
    </div>
  );
}

export default App;