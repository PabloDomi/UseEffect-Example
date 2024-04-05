import { useEffect, useState } from 'react';
import { Monument } from '../Utils/types'
import { RETRIEVE_MONUMENTS } from '../Utils/Urls';
import { SALAMANCA } from '../Utils/consts';

interface MonumentCity {
    CITY_TO_USE: string;
}

export function useListMonuments( props : MonumentCity ) {
    const [lista, setLista] = useState<Monument[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const ciudad = props.CITY_TO_USE

    useEffect(() => {
        fetch(RETRIEVE_MONUMENTS + ciudad)
            .then(response => response.json())
            .then(data => {
                setLista(data);
                setIsLoading(false);
            })
            .catch(error => console.error(error));
    }, []);

    return { lista, isLoading };
}