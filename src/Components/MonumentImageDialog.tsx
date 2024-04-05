import { Box, Button, Card, CardMedia, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Monument } from '../Utils/types.d';
import { IMAGE_URL_GETTER } from '../Utils/Urls'
import { useState } from "react";

type MonumentImageDialogProps = {
    monument: Monument;
    isOpen: boolean;
    onClose: () => void;
};

function MonumentImageDialog(props: MonumentImageDialogProps) {
    const { monument, isOpen, onClose } = props;
    const [isLoading, setIsLoading] = useState<boolean>(true);

    function imageLoaded() {
        setIsLoading(false);
    }

    return (<Dialog open={isOpen} onClose={onClose}
        aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description"
        maxWidth="sm" fullWidth={true}
    >
        <DialogTitle id="alert-dialog-title">
            {monument.nombre}
        </DialogTitle>
        <DialogContent>
            <Box m={2} display="flex" justifyContent="center" alignItems="center">
                {isLoading &&
                    <CircularProgress />
                }
                <Card sx={{ maxWidth: 400 }}>
                    <CardMedia component="img" sx={{ display: isLoading ? "none" : "block" }}
                        image={`${IMAGE_URL_GETTER(monument.id)}`} alt={monument.nombre}
                        onLoad={imageLoaded}
                    />
                </Card>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>
                Cerrar
            </Button>
        </DialogActions>
    </Dialog>);
}

export default MonumentImageDialog;