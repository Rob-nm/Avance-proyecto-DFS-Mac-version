import React, { useState, useEffect } from 'react';
import './App.css';

// --- COMPONENTES ---

const Header = ({ setView, user, logout, cartCount, toggleCart }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Función para navegar y cerrar el menú automáticamente
  const handleNavClick = (viewName) => {
    setView(viewName);
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      
      {/*  BOTÓN HAMBURGUESA */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMenuOpen(true)}
        aria-label="Abrir menú"
      >
        {/* Icono de 3 líneas minimalista */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/*  LOGO (Centrado en Móvil, Izquierda en Desktop) */}
      <div className="logo" onClick={() => handleNavClick('home')}>TOMFORD</div>

      {/*  NAVEGACIÓN DE ESCRITORIO  */}
      <nav className="desktop-nav">
        <button onClick={() => setView('home')}>Fragancias</button>
        <button onClick={() => setView('home')}>Más buscados</button>
        <button onClick={() => setView('home')}>Regalos</button>
        <button onClick={() => setView('home')}>Servicios</button>
      </nav>

      {/* 4. ICONOS Y CUENTA (Derecha) */}
      <div className="header-icons">
        {/* Auth Desktop: Oculto en móvil para ahorrar espacio */}
        <div className="desktop-auth">
          {user ? (
            <button onClick={logout}>Salir ({user})</button>
          ) : (
            <button onClick={() => setView('login')}>Cuenta</button>
          )}
        </div>

        {/* Carrito: Visible siempre */}
        <button onClick={toggleCart} className="cart-icon-btn" aria-label="Carrito">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
        </button>
      </div>

      {/*  MENÚ MÓVIL  */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}>
        
        {/* Botón Cerrar  */}
        <button className="close-menu-btn" onClick={() => setIsMenuOpen(false)}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="mobile-links-container">
          <button onClick={() => handleNavClick('home')}>Fragancias</button>
          <button onClick={() => handleNavClick('home')}>Más buscados</button>
          <button onClick={() => handleNavClick('home')}>Regalos</button>
          <button onClick={() => handleNavClick('home')}>Servicios</button>

          <div className="mobile-auth-divider"></div>

          {user ? (
            <button className="mobile-auth-btn" onClick={() => { logout(); setIsMenuOpen(false); }}>
              Cerrar Sesión ({user})
            </button>
          ) : (
            <button className="mobile-auth-btn" onClick={() => handleNavClick('login')}>
              Ingresar / Crear Cuenta
            </button>
          )}
        </div>
      </div>

    </header>
  );
};

// --- CART DRAWER ---
const CartDrawer = ({ isOpen, closeCart, cart, removeFromCart, handleCheckout, updateCartSize, updateCartQuantity }) => {
  const total = cart.reduce((acc, item) => acc + (Number(item.precio) * item.quantity), 0);

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
              <div key={`${item.id}-${item.selectedSize}`} className="cart-item">
                <img 
                    src={item.imagen_url} 
                    alt={item.nombre} 
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                
                <div className="item-info">
                  <div className="info-top">
                    <h4>{item.nombre.split('(')[0]}</h4>
                    {/* Ícono de Basura */}
                    <button onClick={() => removeFromCart(index)} className="remove-btn" aria-label="Eliminar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Selector de Tamaño */}
                  <div className="cart-size-selector">
                    <button 
                      className={item.selectedSize === '50ml' ? 'active' : ''}
                      onClick={() => updateCartSize(index, '50ml')}
                    >50ML</button>
                    <span>|</span>
                    <button 
                      className={item.selectedSize === '100ml' ? 'active' : ''}
                      onClick={() => updateCartSize(index, '100ml')}
                    >100ML</button>
                  </div>

                  <div className="controls-row">
                    {/* Selector de Cantidad */}
                    <div className="quantity-controls compact">
                      <button 
                        className="qty-btn" 
                        onClick={() => updateCartQuantity(index, -1)}
                        disabled={item.quantity <= 1}
                      >−</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => updateCartQuantity(index, 1)}
                      >+</button>
                    </div>

                    <p className="cart-price">${(item.precio * item.quantity).toLocaleString('es-MX')} MXN</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer">
          <div className="total-row">
            <span>TOTAL</span>
            <span>${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
          </div>
          <button className="btn-luxury full-width" onClick={handleCheckout}>
            PAGAR AHORA
          </button>
        </div>
      </div>
    </div>
  );
};


const Hero = () => {
  const scrollSafe = () => {
    const section = document.getElementById('catalogo');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>TOM FORD</h1>
        <p>La máxima expresión del lujo moderno.</p>
        <button className="btn-luxury" onClick={scrollSafe}>Descubrir</button>
      </div>
    </section>
  );
};


const ProductCard = ({ prod, addToCart }) => {
  const [size, setSize] = useState('50ml'); 
  
  const currentStock = size === '50ml' ? (prod.stock_50 !== undefined ? prod.stock_50 : 10) : (prod.stock_100 !== undefined ? prod.stock_100 : 10);
  const currentPrice = size === '50ml' ? Number(prod.precio_50) : Number(prod.precio_100);

  const handleAdd = () => {
    const cartItem = {
      ...prod,
      nombre: `${prod.nombre} (${size})`, 
      precio: currentPrice,
      selectedSize: size,
      quantity: 1,
      maxStock: currentStock 
    };
    addToCart(cartItem);
  };

  return (
    <div className="card">
      <div className="img-container">
        <img 
          src={prod.imagen_url} 
          alt={prod.nombre}
          onError={(e) => {
             e.target.style.display = 'none';
             e.target.parentNode.innerHTML = '<span style="color:#666; font-size:0.8rem">IMG NO DISPONIBLE</span>';
          }} 
        />
      </div>
      <h3>{prod.nombre}</h3>
      <p className="category">{prod.categoria || 'Private Blend'}</p>
      
      <div className="size-selector">
        <button 
          className={`size-btn ${size === '50ml' ? 'active' : ''}`}
          onClick={() => setSize('50ml')}
        >50ML</button>
        <span className="divider">|</span>
        <button 
          className={`size-btn ${size === '100ml' ? 'active' : ''}`}
          onClick={() => setSize('100ml')}
        >100ML</button>
      </div>

      <span className="price">${currentPrice.toLocaleString('es-MX')} MXN</span>
      
      {currentStock > 0 ? (
        <button className="btn-add" onClick={handleAdd}>
          AÑADIR AL CARRITO
        </button>
      ) : (
        <span className="out-of-stock">AGOTADO</span>
      )}
    </div>
  );
};


const ProductGrid = ({ addToCart }) => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/productos')
      .then(res => {
        if (!res.ok) throw new Error('Error de conexión');
        return res.json();
      })
      .then(data => Array.isArray(data) ? setProductos(data) : setProductos([]))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="error-msg">⚠️ {error}</div>;

  return (
    <section id="catalogo" className="products-section">
      <h2>Colección Privada</h2>
      <div className="grid">
        {productos.map(prod => (
          <ProductCard key={prod.id} prod={prod} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
};


const Login = ({ setUser, setView }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    const endpoint = isRegistering ? '/registro' : '/login';
    
    try {
      const res = await fetch(`http://localhost:4000/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || 'Error en la operación');

      if (isRegistering) {
        setMensaje('Cuenta creada con éxito. Ahora puedes ingresar.');
        setIsRegistering(false);
      } else {
        setUser(data.usuario);
        setView('home');
      }
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="auth-tabs">
          <button className={!isRegistering ? 'active' : ''} onClick={() => { setIsRegistering(false); setError(''); }}>INGRESAR</button>
          <span className="divider">|</span>
          <button className={isRegistering ? 'active' : ''} onClick={() => { setIsRegistering(true); setError(''); }}>CREAR CUENTA</button>
        </div>
        <h2 className="auth-title">{isRegistering ? 'Bienvenido' : 'Ingreso Exclusivo'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" placeholder="NOMBRE DE USUARIO" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          {isRegistering && (
            <div className="input-group">
              <input type="email" placeholder="EMAIL DE CONTACTO" required onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          )}
          <div className="input-group">
            <input type="password" placeholder="CONTRASEÑA" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn-luxury full-width">{isRegistering ? 'REGISTRARME' : 'ENTRAR'}</button>
          {error && <p className="msg error">{error}</p>}
          {mensaje && <p className="msg success">{mensaje}</p>}
        </form>
      </div>
    </div>
  );
};



function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && item.selectedSize === product.selectedSize
      );

      if (existingItemIndex >= 0) {
        const item = prevCart[existingItemIndex];
        
        if (item.quantity >= item.maxStock) {
          alert("¡Lo sentimos! No hay más piezas disponibles en stock.");
          return prevCart; 
        }

        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, product];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const updateCartQuantity = (index, change) => {
    const newCart = [...cart];
    const item = newCart[index];
    
    if (change === 1 && item.quantity >= item.maxStock) {
       alert(`Solo quedan ${item.maxStock} unidades disponibles.`);
       return;
    }

    const newQuantity = item.quantity + change;
    
    if (newQuantity >= 1) {
      item.quantity = newQuantity;
      setCart(newCart);
    }
  };

  const updateCartSize = (index, newSize) => {
    const newCart = [...cart];
    const item = newCart[index];
    if (item.selectedSize === newSize) return;

    item.selectedSize = newSize;
    item.precio = newSize === '50ml' ? Number(item.precio_50) : Number(item.precio_100);
    item.nombre = item.nombre.replace(/\((50|100)ml\)/, `(${newSize})`);
    
    setCart(newCart);
  };


  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      
      const resCheck = await fetch('http://localhost:4000/api/productos');
      if (!resCheck.ok) throw new Error('Error al conectar con inventario');
      
      const freshProducts = await resCheck.json();

      for (const item of cart) {
        const freshProduct = freshProducts.find(p => p.id === item.id);
        
        if (freshProduct) {
          const realStock = item.selectedSize === '50ml' ? freshProduct.stock_50 : freshProduct.stock_100;
          if (item.quantity > realStock) {
            alert(`⚠️ STOCK INSUFICIENTE: \n\nEl producto "${item.nombre}" solo tiene ${realStock} unidades disponibles.`);
            return; 
          }
        }
      }

      //  PROCESAR COMPRA 
      const resBuy = await fetch('http://localhost:4000/api/compra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart) // Enviamos el carrito para que el backend reste
      });

      if (resBuy.ok) {
        alert("Pedido confirmado. Gracias por su elegancia.");
        setCart([]); 
        setIsCartOpen(false);
       
      } else {
        throw new Error('Error al procesar la compra en el servidor');
      }

    } catch (error) {
      console.error(error);
      alert("Error al procesar su pedido. Intente nuevamente.");
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app">
      <Header 
        setView={setView} user={user} logout={() => setUser(null)}
        cartCount={totalItems} 
        toggleCart={() => setIsCartOpen(true)}
      />
      
      <CartDrawer 
        isOpen={isCartOpen} closeCart={() => setIsCartOpen(false)} 
        cart={cart} removeFromCart={removeFromCart} handleCheckout={handleCheckout}
        updateCartSize={updateCartSize}
        updateCartQuantity={updateCartQuantity}
      />
      
      {view === 'home' && (
        <>
          <Hero />
          <div className="container">
            <ProductGrid addToCart={addToCart} />
          </div>
        </>
      )}

      {view === 'login' && <Login setUser={setUser} setView={setView} />}
      
      {view === 'story' && (
        <div className="container story">
          <h2>La Filosofía</h2>
          <p>La belleza es una fuerza poderosa. Define tu estilo.</p>
        </div>
      )}

        {/* --- FOOTER CON REDES SOCIALES --- */}
        <footer className="footer">
        <div className="social-links">
          {/* Facebook */}
          <a href="https://www.facebook.com/tomford/" target="_blank" rel="noreferrer" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          
          {/* Instagram */}
          <a href="https://www.instagram.com/tomford/" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
        <p className="copyright">Â© 2026 TOMFORD BEAUTY. TODOS LOS DERECHOS RESERVADOS.</p>
      </footer>
    </div>
  );
}

export default App;