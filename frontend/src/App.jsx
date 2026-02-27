import React, { useState, useEffect } from 'react';
import './App.css';

// --- COMPONENTES ---

const Header = ({ setView, user, logout, cartCount, toggleCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleNavClick = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header">
      <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      <div className="logo" onClick={() => handleNavClick('home')}>TOMFORD</div>

      <nav className="desktop-nav">
        <button onClick={() => setView('home')}>Fragancias</button>
        <button onClick={() => setView('catalogo')} className="nav-btn">CATÁLOGO</button>
        <button onClick={() => setView('home')}>Regalos</button>
        <button onClick={() => setView('home')}>Servicios</button>
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
                  <button onClick={() => handleNavClick('orders')}>MIS PEDIDOS</button>
                  <button onClick={() => { logout(); setIsUserMenuOpen(false); }}>SALIR</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setView('login')}>CUENTA</button>
          )}
        </div>
        <button onClick={toggleCart} className="cart-icon-btn">
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
        const res = await fetch(`http://localhost:4000/api/envio/${codigo}`);
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

  const fetchPedidos = async () => {
    const res = await fetch('http://localhost:4000/api/pedidos', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setPedidos(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const confirmarEliminacion = async () => {
    if (!orderToDelete) return;
    await fetch(`http://localhost:4000/api/pedidos/${orderToDelete}`, {
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
    await fetch(`http://localhost:4000/api/pedidos/${id}`, {
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

  return (
    <div className="container orders-container" style={{ flexGrow: 1, minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <h2>HISTORIAL DE ÓRDENES</h2>
      {pedidos.map(p => (
        <div key={p._id} className="order-card-luxury">
          <div className="order-card-header"><span>ORDEN #{p._id}</span><span>{new Date(p.fecha).toLocaleDateString()}</span></div>
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
        </div>
      ))}

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
    const res = await fetch(`http://localhost:4000/api/auth${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) { 
      if(isRegistering) { setIsRegistering(false); }
      else { 
        localStorage.setItem('token', data.token); 
        localStorage.setItem('usuario', data.usuario); 
        setUser(data.usuario); 
        setView('home'); 
      }
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `http://localhost:4000/api/auth/${provider}`;
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
    fetch('http://localhost:4000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data.resultados || []));

    fetch('http://localhost:4000/api/conversion/MXN')
      .then(res => res.json())
      .then(data => {
        if (data.tasasDeCambio) setTasaUSD(data.tasasDeCambio.USD);
      })
      .catch(err => console.error("Error en API Moneda:", err));
  }, []);

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
        await fetch('http://localhost:4000/api/pedidos', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ productos: lastCart, total, direccion_envio: lastDir })
        });
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
    const res = await fetch('http://localhost:4000/api/crear-pago', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ carrito: cart })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="app">
      <Header setView={setView} user={user} logout={() => {localStorage.clear(); setUser(null); setView('home');}} cartCount={cart.length} toggleCart={() => setIsCartOpen(true)} />
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