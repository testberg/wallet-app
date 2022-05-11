import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
    palette: {
        primary: {
            main: '#6753fb',
        },
        secondary: {
            main: '#2ccd9a',
        },
        error: {
            main: red.A400,
        },
    },
});

export default theme;
