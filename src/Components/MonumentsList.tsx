import { useEffect, useState } from 'react';
import { Monument } from '../Utils/types'
import { MonumentDetails } from './MonumentDetails';
import { RETRIEVE_MONUMENTS } from '../Utils/Urls';
import { SALAMANCA } from '../Utils/consts';
import { CircularProgress, Container, Box } from '@mui/material';

export function MonumentsList() {

    const [lista, setLista] = useState<Monument[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {

    if(lista) {
        return
    }

    fetch(RETRIEVE_MONUMENTS + SALAMANCA)
    .then((response) => {
        response.json()
            .then((monuments: Monument[]) => {
            setLista(monuments);
            setIsLoading(false);
        });
    });
  }, [lista]);

  return (
    <Container>
        {isLoading && 
            <Box    p={4} m={12} 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center">

                <CircularProgress />
            </Box>}
        {lista && 
            lista.map((monument) =>
                <MonumentDetails monument={monument} key={monument.id} />
            )
        }
    </Container>
);
}