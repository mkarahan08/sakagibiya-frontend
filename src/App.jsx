import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar/Navbar'
import RouterConfig from './config/RouterConfig'
import CategoryBar from './components/CategoryBar/CategoryBar'
import Footer from './components/Footer/Footer'
import { fetchFavorites } from './redux/slices/favoritesSlice'


function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);

  // Kullanıcı giriş yaptığında favorileri yükle
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isAuthenticated) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div className="app-wrapper">
        <Navbar/>
        <CategoryBar/>
        <main className="main-content">
          <RouterConfig/>
        </main>
        <Footer/>
    </div>
  )
}

export default App
