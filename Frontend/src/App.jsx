import { useState } from 'react'
import UserRegistration from './UserRegistration'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MyRoutes from './MyRoutes';
import supabase from './config/supabaseClient';

function App() {

  console.log(supabase);


  return (
    <>
      <BrowserRouter>
        <MyRoutes/>
      </BrowserRouter>
    </>
  )
}

export default App
