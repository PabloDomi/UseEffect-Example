import { useEffect, useState } from 'react';
import { Monument } from '../Utils/types'

export function MonumentsList() {

    const [monuments, setMonuments] = useState<Monument[]>([]);
  
  useEffect(() => {
    fetch('https://monuments.milicia.net/monuments/provincia/Salamanca')
      .then(res => res.json())
      .then(data => setMonuments(data))
  }, []);

    return (
    <div>
        <h1>Monumentos de Salamanca</h1>
        <div>
            {monuments.map((monument, index) => (
                <div key={monument.id}>
                    <h2>{monument.nombre}</h2>
                    <p>{monument.descripcion}</p>
                    <p><strong>{monument.tipoMonumento}</strong></p>
                </div>
            ))}</div>
    </div>
    );   
}