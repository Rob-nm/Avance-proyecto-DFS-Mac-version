import React, { useState, useEffect } from 'react';
import './App.css';

// --- CONFIGURACIÓN DE URL PARA DESPLIEGUE ---
// En local usará localhost, en Vercel usará la variable que configures.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- COMPONENTES ---

const Header = ({ setView, user, userRole, logout, cartCount, toggleCart }) => {
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
        
        {/* Botón exclusivo para el administrador */}
        {userRole === 'admin' && (
          <button onClick={() => setView('home')} className="nav-btn" style={{ color: '#d4af37', fontWeight: 'bold' }}>
            PANEL DE CONTROL
          </button>
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
        const res = await fetch(`${API_BASE_URL}/api/envio/${codigo}`);
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
                    <button onClick={() => removeFromCart(index)} className="remove-btn">×</button>
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
            <div className="shipping-form-luxury">
              <input type="text" placeholder="CALLE Y COLONIA" value={calleColonia} onChange={e => setCalleColonia(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="NÚMERO" value={numero} onChange={e => setNumero(e.target.value)} />
                <input type="text" placeholder="C.P." value={cp} onChange={e => buscarCP(e.target.value)} maxLength="5" />
              </div>
              {direccionApi && <p className="address-hint">📍 {direccionApi}</p>}
            </div>
          )}
          <div className="total-row"><span>TOTAL</span><span>${total.toLocaleString('es-MX')} MXN</span></div>
          <button className="btn-luxury full-width" onClick={procesarPedido} disabled={cart.length === 0}>PAGAR AHORA</button>
        </div>
      </div>
    </div>
  );
};

const OrdersView = ({ setView, setCart, setIsCartOpen }) => {
  const [pedidos, setPedidos] = useState([]);
  const [orderToDelete, setOrderToDelete] = useState(null); 
  const [direcciones, setDirecciones] = useState({});

  const fetchPedidos = async () => {
    const res = await fetch(`${API_BASE_URL}/api/pedidos`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setPedidos(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchPedidos(); }, []);

  const confirmarEliminacion = async () => {
    await fetch(`${API_BASE_URL}/api/pedidos/${orderToDelete}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setOrderToDelete(null);
    fetchPedidos();
  };

  const actualizarDireccion = async (id) => {
    const pedido = pedidos.find(p => p._id === id);
    const nuevaDir = direcciones[id] || pedido.direccion_envio;
    await fetch(`${API_BASE_URL}/api/pedidos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ direccion_envio: nuevaDir })
    });
    fetchPedidos();
  };

  return (
    <div className="container orders-container">
      <h2>HISTORIAL DE ÓRDENES</h2>
      {pedidos.map(p => (
        <div key={p._id} className="order-card-luxury">
          <div className="order-card-header"><span>ORDEN #{p._id}</span><span>{new Date(p.fecha).toLocaleDateString()}</span></div>
          <div className="order-card-body">
            {p.productos.map((item, i) => (
              <div key={i} className="order-item-line">
                <span>{item.nombre}</span><span>x{item.quantity}</span>
              </div>
            ))}
            <div className="address-edit-box">
              <label>DIRECCIÓN DE ENVÍO</label>
              <textarea defaultValue={p.direccion_envio} onChange={(e) => setDirecciones({ ...direcciones, [p._id]: e.target.value })} />
              <button onClick={() => actualizarDireccion(p._id)}>GUARDAR CAMBIOS</button>
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
          <div className="modal-content">
            <h2>¿CANCELAR ORDEN?</h2>
            <div style={{display: 'flex', gap: '15px'}}>
              <button className="btn-luxury" onClick={confirmarEliminacion} style={{background: '#cf4d4d'}}>ELIMINAR</button>
              <button className="btn-luxury" onClick={() => setOrderToDelete(null)}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ prod, addToCart, tasaUSD, userRole }) => {
  const [size, setSize] = useState('50ml');
  const currentPrice = size === '50ml' ? prod.precio_50 : prod.precio_100;
  const precioUSD = tasaUSD ? (currentPrice * tasaUSD).toFixed(2) : null;

  return (
    <div className="card">
      <div className="img-container"><img src={prod.imagen_url} alt={prod.nombre} /></div>
      <h3>{prod.nombre}</h3>
      <p className="category">{prod.categoria || 'PRIVATE BLEND'}</p>
      <div className="size-selector">
        <button className={size === '50ml' ? 'active' : ''} onClick={() => setSize('50ml')}>50ML</button>
        <span className="divider">|</span>
        <button className={size === '100ml' ? 'active' : ''} onClick={() => setSize('100ml')}>100ML</button>
      </div>
      <span className="price">${Number(currentPrice).toLocaleString('es-MX')} MXN</span>
      {precioUSD && <p className="usd-tag">APROX. ${precioUSD} USD</p>}
      <button className="btn-add" onClick={() => addToCart({ ...prod, nombre: `${prod.nombre} (${size})`, precio: currentPrice, selectedSize: size, quantity: 1 })}>
        AÑADIR AL CARRITO
      </button>
      {userRole === 'admin' && (
        <div className="admin-actions">
          <button className="btn-luxury edit">EDITAR</button>
          <button className="btn-luxury del">ELIMINAR</button>
        </div>
      )}
    </div>
  );
};

const Login = ({ setUser, setUserRole, setView }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });

  const handle = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/registro' : '/login';
    const res = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) { 
      if(isRegistering) { setIsRegistering(false); }
      else { 
        localStorage.setItem('token', data.token); 
        localStorage.setItem('usuario', data.usuario); 
        if (data.rol) {
          localStorage.setItem('userRole', data.rol);
          setUserRole(data.rol);
        }
        setUser(data.usuario); 
        setView('home'); 
      }
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${API_BASE_URL}/api/auth/${provider}`;
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="auth-tabs">
          <button className={!isRegistering ? 'active' : ''} onClick={() => setIsRegistering(false)}>INGRESAR</button>
          <span className="divider">|</span>
          <button className={isRegistering ? 'active' : ''} onClick={() => setIsRegistering(true)}>CREAR CUENTA</button>
        </div>
        <form onSubmit={handle}>
          <input type="text" placeholder="USUARIO" required onChange={e => setForm({...form, nombre: e.target.value})} className="input-luxury" />
          {isRegistering && <input type="email" placeholder="EMAIL" required onChange={e => setForm({...form, email: e.target.value})} className="input-luxury" />}
          <input type="password" placeholder="PASSWORD" required onChange={e => setForm({...form, password: e.target.value})} className="input-luxury" />
          <button type="submit" className="btn-luxury full-width">{isRegistering ? 'REGISTRARME' : 'ENTRAR'}</button>
        </form>
        <div className="oauth-box">
          <button onClick={() => handleOAuth('google')}>GOOGLE</button>
          <button onClick={() => handleOAuth('github')}>GITHUB</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(localStorage.getItem('usuario') || null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [productos, setProductos] = useState([]);
  const [tasaUSD, setTasaUSD] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/productos`)
      .then(res => res.json())
      .then(data => setProductos(data.resultados || []));

    fetch(`${API_BASE_URL}/api/conversion/MXN`)
      .then(res => res.json())
      .then(data => { if (data.tasasDeCambio) setTasaUSD(data.tasasDeCambio.USD); })
      .catch(err => console.error("Error API Moneda:", err));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("pago") === "exito") {
      const finalizar = async () => {
        const token = localStorage.getItem('token');
        const lastCart = JSON.parse(localStorage.getItem('last_cart') || '[]');
        const lastDir = localStorage.getItem('last_dir') || '';
        const total = lastCart.reduce((a, b) => a + (b.precio * b.quantity), 0);
        await fetch(`${API_BASE_URL}/api/pedidos`, {
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
    const res = await fetch(`${API_BASE_URL}/api/crear-pago`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ carrito: cart })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleLogout = () => {
    localStorage.clear(); setUser(null); setUserRole(null); setView('home');
  };

  return (
    <div className="app">
      <Header setView={setView} user={user} userRole={userRole} logout={handleLogout} cartCount={cart.length} toggleCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} closeCart={() => setIsCartOpen(false)} cart={cart} removeFromCart={(i) => setCart(cart.filter((_, idx) => idx !== i))} handleCheckout={handleCheckout} updateCartQuantity={(i, c) => { const nc = [...cart]; nc[i].quantity += c; if (nc[i].quantity >= 1) setCart(nc); }} updateCartSize={(i, s) => { const nc = [...cart]; nc[i].selectedSize = s; nc[i].precio = s === '50ml' ? nc[i].precio_50 : nc[i].precio_100; setCart(nc); }} />
      
      {view === 'home' && (
        <>
          <section className="hero">
            <div className="hero-content">
              <h1>TOM FORD</h1>
              <p>Lujo moderno.</p>
              <button className="btn-luxury" onClick={() => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' })}>Descubrir</button>
            </div>
          </section>
          <section id="catalogo" className="products-section">
            <h2>Colección Privada</h2>
            <div className="grid">
              {productos.slice(0, 8).map(prod => (
                <ProductCard key={prod._id} prod={prod} addToCart={(p) => {setCart([...cart, p]); setIsCartOpen(true);}} tasaUSD={tasaUSD} userRole={userRole} />
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'catalogo' && (
        <div className="container" style={{padding: '50px 20px'}}>
          <div className="grid">
            {productos.map(prod => (
              <ProductCard key={prod._id} prod={prod} addToCart={(p) => {setCart([...cart, p]); setIsCartOpen(true);}} tasaUSD={tasaUSD} userRole={userRole} />
            ))}
          </div>
        </div>
      )}

      {view === 'login' && <Login setUser={setUser} setUserRole={setUserRole} setView={setView} />}
      {view === 'orders' && <OrdersView setView={setView} setCart={setCart} setIsCartOpen={setIsCartOpen} />}
      
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="modal-content"><h2>PAGO CONFIRMADO</h2><button className="btn-luxury" onClick={() => setShowSuccessModal(false)}>LISTO</button></div>
        </div>
      )}
      <footer className="footer"><p>© 2026 TOMFORD BEAUTY. TODOS LOS DERECHOS RESERVADOS.</p></footer>
    </div>
  );
}

export default App;