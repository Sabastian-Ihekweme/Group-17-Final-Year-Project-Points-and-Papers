import { useState } from 'react'
import UserRegistration from './UserRegistration'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MyRoutes from './MyRoutes';

function App() {


  return (
    <>
      <BrowserRouter>
        <MyRoutes/>
      </BrowserRouter>
    </>
  )
}

export default App
