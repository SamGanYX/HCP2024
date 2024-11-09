import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';

interface Investor {
  id: number;
  name: string;
  email: string;
  description: string;
  expertise: string;
  investmentRange: string;
  imageURL?: string;
}

const Investors: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);

  useEffect(() => {
    // Fetch investors data
    const fetchInvestors = async () => {
      try {
        const response = await fetch('http://localhost:8081/investors');
        const data = await response.json();
        
        // For each investor, fetch their images
        const investorsWithImages = await Promise.all(
          data.map(async (investor: Investor) => {
            const imageResponse = await fetch(`http://localhost:8081/investor_images/${investor.id}`);
            const images = await imageResponse.json();
            return {
              ...investor,
              imageURL: images[0]?.imageURL ? `http://localhost:8081/uploads/${images[0].imageURL}` : undefined
            };
          })
        );
        
        setInvestors(investorsWithImages);
      } catch (error) {
        console.error('Error fetching investors:', error);
      }
    };

    fetchInvestors();
  }, []);

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Our Investors
        </Typography>
        
        <Typography variant="h5" component="h2" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Meet the people who believe in our vision
        </Typography>

        <Grid container spacing={4}>
          {investors.map((investor) => (
            <Grid item xs={12} sm={6} md={4} key={investor.id}>
              <Card sx={{ height: '100%' }}>
                {investor.imageURL && (
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${investor.imageURL})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {investor.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {investor.expertise}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {investor.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Investment Range: {investor.investmentRange}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Investors;
