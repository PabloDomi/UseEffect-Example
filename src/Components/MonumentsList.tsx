import { useState } from 'react';
import { Monument } from '../Utils/types'
import { MonumentDetails } from './MonumentDetails';

import { CircularProgress, Container, Box } from '@mui/material';
import { useListMonuments } from '../hooks/useListMonuments';
import { CITIES } from '../Utils/consts';

export function MonumentsList() {

    const CITY_TO_USE = CITIES.SALAMANCA

    const {isLoading, lista} = useListMonuments({CITY_TO_USE})

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