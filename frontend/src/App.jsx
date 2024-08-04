import { useState } from 'react'
import './App.css'
import Editor from './components/Editor'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
 
 <Editor/>
    </>
  )
}

export default App
