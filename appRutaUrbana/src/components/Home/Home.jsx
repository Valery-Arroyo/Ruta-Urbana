import React from 'react'; 
import Container from '@mui/material/Container'; 
import Typography from '@mui/material/Typography'; 
import '@fontsource/oswald';
export function Home() {
  return (
    <Container sx={{ p: 2 }} maxWidth="sm">
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="secondary"
        gutterBottom
        sx={{ fontFamily: 'Oswald', letterSpacing: 4, textTransform: 'uppercase' }}
      >
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary">
      </Typography>
    </Container>
  );
}