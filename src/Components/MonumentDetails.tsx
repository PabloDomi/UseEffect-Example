import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { Monument } from "../Utils/types"
import { useState } from "react";
import MonumentImageDialog from "./MonumentImageDialog";


interface MonumentDetailsProps {
    monument: Monument
}

export function MonumentDetails(props : MonumentDetailsProps ) {

    const { monument } = props

    const [imageOpen, setImageOpen] = useState<boolean>(false);

    function onImageLinkClick() {
        setImageOpen(true);
    }
    function onClose() {
        setImageOpen(false)
    }

    return (
        <Box key={monument.id} m={2} display="flex" justifyContent="center" alignItems="center">
            <Card sx={{ maxWidth: 800 }}>
                <CardContent>
                    <Typography variant="h4">{monument.nombre}</Typography>
                    <Typography variant="h6">{monument.tipoMonumento} ({monument.clasificacion})</Typography>
                    <Typography variant="caption">{monument.periodosHistoricos.join(", ")}</Typography>
                    <Typography marginTop={5}>{monument.descripcion}</Typography>
                </CardContent>
                {monument.hasImage && 
                <CardActions>
                    <Button size="small" onClick={onImageLinkClick}>Ver imagen</Button>
                </CardActions>}
            </Card>
            {monument.hasImage && <MonumentImageDialog isOpen={imageOpen} onClose={onClose} monument={monument} />}
        </Box>
    )
}