import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider>
      <UserProvider>
        <SettingsProvider>
          <ProductProvider>
            <CartProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </CartProvider>
          </ProductProvider>
        </SettingsProvider>
      </UserProvider>
    </CurrencyProvider>
  </StrictMode>,
)
