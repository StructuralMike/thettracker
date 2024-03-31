import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ShouldStartProvider } from './timerContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(

    <ShouldStartProvider>
        <App />
    </ShouldStartProvider>

)
