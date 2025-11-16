import React, { useState, useEffect, useContext, createContext } from 'react';
import { ShoppingCart, User, LogIn, LogOut, Package, Home as HomeIcon, X, Plus, Minus, MapPin, CreditCard } from 'lucide-react';

// --- FIREBASE GLOBALS AND CONFIGURATION ---
// Variables globales MANDATORIAS
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Declaración global de las funciones de Firebase (serán asignadas dentro de useEffect)
let firestoreFunctions = {};
let authFunctions = {};

// Funciones de fallback (para evitar errores si no se inicializa)
let getAuth, initializeApp, signInWithCustomToken, signInAnonymously, onAuthStateChanged, getFirestore, collection, onSnapshot, doc, getDoc, setDoc, updateDoc, query, where;

// --- DATA MOCK (Equivalent of your 'pizzas' array) ---
const KITS = [
  {
    id: 'k001',
    name: 'Lasagna Gourmet de Pollo',
    price: 12990,
    description: 'Finas láminas de pasta fresca rellenas de pollo desmenuzado, espinacas y una bechamel de queso parmesano.',
    category: 'Pasta',
    img: 'https://placehold.co/400x300/a3e635/000000?text=LASAGNA+KIT',
  },
  {
    id: 'k002',
    name: 'Curry Rojo Tailandés Vegano',
    price: 9990,
    description: 'Un kit auténtico con pasta de curry rojo, leche de coco premium y vegetales de temporada listos para calentar.',
    category: 'Vegano',
    img: 'https://placehold.co/400x300/34d399/000000?text=CURRY+KIT',
  },
  {
    id: 'k003',
    name: 'Salmón con Miel y Mostaza',
    price: 15490,
    description: 'Filetes de salmón de alta calidad listos para hornear con una salsa de miel y mostaza y acompañamiento de quinoa.',
    category: 'Pescado',
    img: 'https://placehold.co/400x300/60a5fa/000000?text=SALMON+KIT',
  },
];

// --- CONTEXT APIs ---
const AuthContext = createContext();
const CartContext = createContext();

// Format price utility
const formatPrice = (price) => price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

// --- CONTEXT PROVIDERS ---

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Función asíncrona para cargar Firebase (solución al error Top-level await)
    const loadFirebaseAndAuth = async () => {
      try {
        const firebaseAppModule = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js');
        const firebaseAuthModule = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
        const firebaseFirestoreModule = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');

        // 1. Asignar funciones globales
        initializeApp = firebaseAppModule.initializeApp;
        getAuth = firebaseAuthModule.getAuth;
        signInWithCustomToken = firebaseAuthModule.signInWithCustomToken;
        signInAnonymously = firebaseAuthModule.signInAnonymously;
        onAuthStateChanged = firebaseAuthModule.onAuthStateChanged;
        getFirestore = firebaseFirestoreModule.getFirestore;
        collection = firebaseFirestoreModule.collection;
        onSnapshot = firebaseFirestoreModule.onSnapshot;
        doc = firebaseFirestoreModule.doc;
        setDoc = firebaseFirestoreModule.setDoc;
        updateDoc = firebaseFirestoreModule.updateDoc;
        query = firebaseFirestoreModule.query;
        where = firebaseFirestoreModule.where;

        // 2. Inicializar App
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);

        // 3. Autenticación (con token o anónima)
        const authenticate = async () => {
          const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          if (token) {
            await signInWithCustomToken(authInstance, token);
          } else {
            await signInAnonymously(authInstance);
          }
        };
        await authenticate();

        // 4. Listener de estado de autenticación
        const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
          setUser(currentUser);
          setIsLoadingAuth(false);
          if (currentUser) {
              console.log("Authenticated User ID:", currentUser.uid);
          } else {
               console.log("No user is signed in or mock user used.");
          }
        });
        return () => unsubscribe();
      } catch (e) {
        console.error("Error setting up Firebase:", e);
        setIsLoadingAuth(false);
        // Fallback: Mock user if no environment token is present
        if (typeof __initial_auth_token === 'undefined') {
            setUser({ uid: 'mock-user-123', email: 'mock@sazonplanner.cl' });
        }
      }
    };
    
    loadFirebaseAndAuth();

    // Cleanup function is returned inside the async block
    // If an error occurs, no cleanup is needed for the listener that wasn't set.
  }, []);

  const login = (email, password) => {
      // Lógica de login Mock o real (dependerá del backend)
      setUser({ uid: 'test-user-456', email: email });
  };

  const logout = () => {
      // Lógica de logout Mock
      if (auth && auth.signOut) {
        auth.signOut().then(() => setUser(null));
      } else {
        setUser(null);
      }
  };

  // En una aplicación real, se podría mostrar un spinner si isLoadingAuth es true.
  return (
    <AuthContext.Provider value={{ user, db, auth, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({}); // { kitId: quantity }

  const cartTotal = Object.entries(cartItems).reduce((total, [kitId, quantity]) => {
    const kit = KITS.find(k => k.id === kitId);
    return total + (kit ? kit.price * quantity : 0);
  }, 0);

  const cartCount = Object.values(cartItems).reduce((acc, q) => acc + q, 0);

  const addToCart = (kitId, quantity = 1) => {
    setCartItems(prev => ({
      ...prev,
      [kitId]: (prev[kitId] || 0) + quantity,
    }));
  };

  const updateQuantity = (kitId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(kitId);
    } else {
      setCartItems(prev => ({ ...prev, [kitId]: newQuantity }));
    }
  };

  const removeFromCart = (kitId) => {
    setCartItems(prev => {
      const newItems = { ...prev };
      delete newItems[kitId];
      return newItems;
    });
  };

  const clearCart = () => setCartItems({});

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, cartCount, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// --- COMPONENTS ---

const Navbar = ({ navigate }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartTotal, cartCount } = useContext(CartContext);
  
  const formattedTotal = formatPrice(cartTotal);

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <button onClick={() => navigate('home')} className="flex items-center space-x-2 text-xl font-bold hover:text-green-400 transition">
          <Package className="w-6 h-6 text-green-400" />
          <span>Sazón Planner</span>
        </button>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('tienda')} 
            className="px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-700 transition"
          >
            <HomeIcon className="inline w-4 h-4 mr-1" /> Tienda
          </button>
          
          {user ? (
            <>
              <button 
                onClick={() => navigate('profile')} 
                className="px-3 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 transition"
              >
                <User className="inline w-4 h-4 mr-1" /> Mi Perfil
              </button>
              <button 
                onClick={logout} 
                className="px-3 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 transition"
              >
                <LogOut className="inline w-4 h-4 mr-1" /> Salir
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate('login')} 
              className="px-3 py-2 text-sm font-medium rounded-md bg-yellow-600 hover:bg-yellow-700 transition"
            >
              <LogIn className="inline w-4 h-4 mr-1" /> Iniciar Sesión
            </button>
          )}

          <button 
            onClick={() => navigate('carrito')} 
            className="flex items-center px-4 py-2 text-sm font-medium rounded-full bg-blue-600 hover:bg-blue-700 transition relative"
          >
            <ShoppingCart className="w-5 h-5 mr-2" /> 
            Carrito: {formattedTotal}
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Header = () => (
  <div className="bg-gradient-to-r from-green-700 to-green-900 text-white py-16 shadow-xl">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-5xl font-extrabold mb-2">Sazón Planner Premium</h1>
      <p className="text-xl font-light">¡Tus kits congelados gourmet listos en minutos!</p>
    </div>
  </div>
);

// Equivalent to CardPizza.jsx
const KitCard = ({ kit, navigate }) => {
  const { addToCart } = useContext(CartContext);
  
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition duration-300 w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)]">
      <img src={kit.img} alt={kit.name} className="w-full h-48 object-cover" onError={(e) => e.target.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Sazon+Kit'}/>
      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-green-600">{kit.category}</span>
        <h5 className="text-xl font-bold text-gray-900 mt-1">{kit.name}</h5>
        <p className="text-3xl font-extrabold text-gray-800 my-2">{formatPrice(kit.price)}</p>
        
        <div className="flex justify-between items-center mt-3">
          <button 
            onClick={() => navigate('detalle', kit.id)} 
            className="flex-grow mr-2 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Ver Detalle
          </button>
          <button 
            onClick={() => addToCart(kit.id)} 
            className="flex-grow py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" /> Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ navigate }) => (
  <>
    <Header />
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Explora la Semana Sin Estrés</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {KITS.slice(0, 3).map(kit => (
          <KitCard key={kit.id} kit={kit} navigate={navigate} />
        ))}
      </div>
      <div className="text-center mt-10">
        <button 
          onClick={() => navigate('tienda')} 
          className="px-8 py-3 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg"
        >
          Ver Catálogo Completo
        </button>
      </div>
    </main>
  </>
);

const ShopPage = ({ navigate }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [...new Set(KITS.map(k => k.category))];
  const filteredKits = selectedCategory 
    ? KITS.filter(kit => kit.category === selectedCategory) 
    : KITS;

  return (
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Catálogo de Kits Congelados</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtro Lateral */}
        <aside className="lg:w-1/4 p-4 bg-gray-50 rounded-xl shadow-inner h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Filtrar por</h3>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left p-2 rounded-lg transition ${!selectedCategory ? 'bg-green-600 text-white font-semibold' : 'hover:bg-gray-200'}`}
              >
                Todas las Categorías
              </button>
            </li>
            {categories.map(category => (
              <li key={category}>
                <button 
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left p-2 rounded-lg transition ${selectedCategory === category ? 'bg-green-600 text-white font-semibold' : 'hover:bg-gray-200'}`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Galería de Kits */}
        <section className="lg:w-3/4">
          <div className="flex flex-wrap justify-start gap-6">
            {filteredKits.map(kit => (
              <KitCard key={kit.id} kit={kit} navigate={navigate} />
            ))}
          </div>
          {filteredKits.length === 0 && (
            <p className="text-center text-gray-500 mt-10">No hay kits disponibles en esta categoría.</p>
          )}
        </section>
      </div>
    </main>
  );
};

const CartItem = ({ item, kit, updateQuantity, removeFromCart }) => {
    return (
        <div className="flex items-center border-b py-4">
            <img src={kit.img} alt={kit.name} className="w-16 h-16 object-cover rounded-md mr-4" onError={(e) => e.target.src = 'https://placehold.co/400x300/e5e7eb/6b7280?text=Kit'}/>
            <div className="flex-grow">
                <h4 className="font-semibold text-gray-900">{kit.name}</h4>
                <p className="text-sm text-gray-600">{formatPrice(kit.price)} c/u</p>
            </div>
            <div className="flex items-center space-x-2 mr-6">
                <button 
                    onClick={() => updateQuantity(kit.id, item.quantity - 1)} 
                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                    aria-label="Disminuir Cantidad"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="font-medium w-6 text-center">{item.quantity}</span>
                <button 
                    onClick={() => updateQuantity(kit.id, item.quantity + 1)} 
                    className="p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                    aria-label="Aumentar Cantidad"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="font-bold text-lg text-gray-900 w-24 text-right">
                {formatPrice(kit.price * item.quantity)}
            </div>
            <button 
                onClick={() => removeFromCart(kit.id)} 
                className="ml-4 p-1 text-red-500 hover:text-red-700 transition"
                aria-label="Eliminar Producto"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

const CartPage = ({ navigate }) => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart, cartCount } = useContext(CartContext);
    const cartDetails = Object.keys(cartItems).map(kitId => ({
        kit: KITS.find(k => k.id === kitId),
        quantity: cartItems[kitId],
    })).filter(item => item.kit); // Filter out any mock kits not found

    return (
        <main className="container mx-auto px-4 py-8 min-h-[70vh]">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-4">
                Tu Carrito de Compras ({cartCount} {cartCount === 1 ? 'ítem' : 'ítems'})
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Detalle de Items */}
                <section className="lg:w-3/4 bg-white p-6 rounded-xl shadow-lg">
                    {cartDetails.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <p className="text-lg text-gray-600">Tu carrito está vacío.</p>
                            <button 
                                onClick={() => navigate('tienda')} 
                                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Ir a la tienda
                            </button>
                        </div>
                    ) : (
                        <div>
                            {cartDetails.map(item => (
                                <CartItem 
                                    key={item.kit.id} 
                                    item={item} 
                                    kit={item.kit} 
                                    updateQuantity={updateQuantity} 
                                    removeFromCart={removeFromCart} 
                                />
                            ))}
                            <button 
                                onClick={clearCart} 
                                className="mt-4 text-sm text-red-500 hover:text-red-700"
                            >
                                Vaciar Carrito
                            </button>
                        </div>
                    )}
                </section>

                {/* Resumen de Compra */}
                {cartDetails.length > 0 && (
                    <aside className="lg:w-1/4 bg-gray-50 p-6 rounded-xl shadow-lg h-fit">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Resumen</h3>
                        <div className="flex justify-between text-lg font-medium py-2">
                            <span>Subtotal:</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-medium py-2 border-t mt-2 pt-2">
                            <span className="text-xl font-bold text-green-700">Total a Pagar:</span>
                            <span className="text-xl font-bold text-green-700">{formatPrice(cartTotal)}</span>
                        </div>
                        <button 
                            onClick={() => navigate('checkout')} 
                            className="mt-6 w-full py-3 text-white font-semibold rounded-lg bg-green-600 hover:bg-green-700 transition"
                        >
                            Proceder al Pago
                        </button>
                    </aside>
                )}
            </div>
        </main>
    );
};

const LoginPage = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password); // Mock login
    navigate('home');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="********"
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <LogIn className="w-5 h-5 mr-2" /> Ingresar
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
            ¿No tienes cuenta? 
            <button onClick={() => navigate('register')} className="ml-1 text-blue-600 hover:text-blue-800">Regístrate</button>
        </p>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('address');
  const [address, setAddress] = useState({ street: 'Av. Mockingbird 123', city: 'Santiago', phone: '912345678' });
  
  if (!user) return <p className="text-center py-10">Debes iniciar sesión para ver tu perfil.</p>;
  
  const uid = user.uid || 'N/A';
  
  const handleSave = (e) => {
    e.preventDefault();
    // NOTA: En una aplicación real, esta función guardaría los datos en Firestore
    console.log("Guardando datos:", address);
    // Usar un modal en lugar de alert
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    messageText.textContent = 'Datos de dirección y contacto guardados exitosamente.';
    messageBox.classList.remove('hidden');
    setTimeout(() => messageBox.classList.add('hidden'), 3000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'address':
        return (
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Direcciones y Contacto</h3>
            <p className="text-sm text-gray-500 p-2 bg-gray-100 rounded-md">Tu ID de Usuario para compartir: **{uid}**</p>
            
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="text" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} className="block w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500" required />
            
            <label className="block text-sm font-medium text-gray-700">Calle y Número</label>
            <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="block w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500" required />

            <label className="block text-sm font-medium text-gray-700">Ciudad / Comuna</label>
            <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="block w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500" required />

            <button type="submit" className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md">
              <MapPin className="w-5 h-5 mr-2 inline" /> Guardar Dirección y Contacto
            </button>

            <h3 className="text-xl font-bold pt-6 border-t mt-6">Datos de Pago (Mock)</h3>
            <p className="text-sm text-gray-500">Solo aceptamos Tarjetas de Crédito/Débito.</p>
            <button className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
              <CreditCard className="w-5 h-5 mr-2 inline" /> Agregar Método de Pago
            </button>
          </form>
        );
      case 'orders':
        return (
          <div>
            <h3 className="text-xl font-bold mb-4">Órdenes Pendientes</h3>
            <p className="text-gray-600 mb-4">Solo mostramos pedidos activos o recién entregados.</p>
            
            <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                    <p className="font-semibold text-yellow-800">Orden #00123: {formatPrice(45000)}</p>
                    <p className="text-sm text-yellow-700">Estado: **En camino** - Entrega estimada: Mañana.</p>
                </div>
                <button className="text-sm text-yellow-600 hover:text-yellow-800 font-medium p-2 rounded-full hover:bg-yellow-200 transition">
                    Ver Detalle
                </button>
            </div>
            
             <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                    <p className="font-semibold text-green-800">Orden #00122: {formatPrice(32000)}</p>
                    <p className="text-sm text-green-700">Estado: **Entregada** - Hace 2 días.</p>
                </div>
                <button className="text-sm text-green-600 hover:text-green-800 font-medium p-2 rounded-full hover:bg-green-200 transition">
                    Ver Detalle
                </button>
            </div>

            <p className="mt-6 text-sm text-gray-500">El historial completo de órdenes está archivado y no se muestra aquí.</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <main className="container mx-auto px-4 py-8 min-h-[70vh]">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Mi Perfil</h2>
      
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-2xl">
        <div className="flex justify-around border-b mb-6">
          <button 
            onClick={() => setActiveTab('address')}
            className={`py-3 px-6 font-semibold transition ${activeTab === 'address' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Direcciones y Pago
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 font-semibold transition ${activeTab === 'orders' ? 'border-b-4 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-800'}`}
          >
            Mis Órdenes
          </button>
        </div>
        
        {renderContent()}
        
      </div>
      
      {/* Custom Message Box (Replaces alert) */}
      <div id="messageBox" className="hidden fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-xl transition-opacity duration-300 z-50">
        <p id="messageText"></p>
      </div>
    </main>
  );
};

const Footer = () => (
  <footer className="text-center py-6 bg-gray-900 text-gray-400 mt-10">
    © 2024 - Sazón Planner Premium - Todos los derechos reservados.
  </footer>
);

// --- MAIN APP COMPONENT ---

const AppContent = () => {
  const [route, setRoute] = useState('home');
  const [selectedKitId, setSelectedKitId] = useState(null);
  
  // Custom navigation function to handle routes and parameters
  const navigate = (newRoute, id = null) => {
    setSelectedKitId(id);
    setRoute(newRoute);
    window.scrollTo(0, 0);
  };

  const renderRoute = () => {
    switch (route) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'tienda':
        return <ShopPage navigate={navigate} />;
      case 'carrito':
        return <CartPage navigate={navigate} />;
      case 'login':
      case 'register':
        return <LoginPage navigate={navigate} />;
      case 'profile':
        return <ProfilePage navigate={navigate} />;
      case 'detalle':
        // Find the kit using selectedKitId and render a detail page (simplified for now)
        const kit = KITS.find(k => k.id === selectedKitId);
        return kit ? (
            <div className="container mx-auto p-8">
                <h2 className="text-3xl font-bold">{kit.name}</h2>
                <p>{kit.description}</p>
                <p className="text-2xl font-extrabold text-red-600">{formatPrice(kit.price)}</p>
                <button onClick={() => navigate('tienda')} className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">Volver</button>
            </div>
        ) : <p className="text-center py-10">Producto no encontrado.</p>;
      case 'checkout':
        return <p className="text-center py-10 text-xl font-bold">Página de Checkout (Pendiente de implementación en Backend).</p>;
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 font-sans">
      <Navbar navigate={navigate} />
      <div className="flex-grow">
        {renderRoute()}
      </div>
      <Footer />
    </div>
  );
};

const App = () => (
  // Load Tailwind CSS CDN for styling
  <>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      {`
        body { font-family: 'Inter', sans-serif; }
      `}
    </style>
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  </>
);

export default App;
