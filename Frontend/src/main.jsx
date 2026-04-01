import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthContextProvider } from './context/AuthContext.jsx';
import { ResourceContextProvider } from './context/ResourceContext.jsx';


createRoot(document.getElementById('root')).render(
    <AuthContextProvider>
        <ResourceContextProvider>
            <App />
        </ResourceContextProvider>
    </AuthContextProvider>

)


