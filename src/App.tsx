import { useEffect, useState } from 'react';
import './App.css';
import { Monument } from './types.d'

function App() {

  const [monuments, setMonuments] = useState<Monument[]>([]);
  
  useEffect(() => {
    fetch('https://monuments.milicia.net/monuments/provincia/Salamanca')
      .then(res => res.json())
      .then(data => setMonuments(data))
  }, []);

  return (
    <div className="App">
      <h1>Monumentos de Salamanca</h1>
      <div>{monuments.map((monument, index) => <ul key={index}>{monument.nombre}</ul>)}</div>
    </div>
  );
}

export default App;
