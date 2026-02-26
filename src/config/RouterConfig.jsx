import React from 'react'
import {Route , Routes} from 'react-router-dom';
import Home from '../pages/Home/Home';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import Login from '../pages/Login/Login';
import Profile from '../pages/Profile/Profile';
import Favorites from '../pages/Favorites/Favorites';

function RouterConfig() {
  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/product/:id' element = {<ProductDetail/>}/>
        <Route path='/login' element={<Login/>} />
        <Route path='/profile' element={<Profile/>} />
        <Route path='/favorites' element={<Favorites/>} />
    </Routes>
  )
}

export default RouterConfig
