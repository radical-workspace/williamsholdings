"use client";
import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function DashboardPage() {
  return (
    <div className="p-4">
      <Typography variant="h4" gutterBottom>
        Welcome to WilliamsHoldings Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Balance</Typography>
              <Typography variant="h3">$12,345.67</Typography>
              <Button variant="contained" color="primary" style={{ marginTop: 12 }}>
                Deposit
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Active Plans</Typography>
              <Typography variant="h4">3</Typography>
              <Typography color="textSecondary">Premium savings and Growth Plan</Typography>
              <Button variant="outlined" style={{ marginTop: 12 }}>
                View Plans
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Withdrawals</Typography>
              <Typography variant="h4">2</Typography>
              <Typography color="textSecondary">Awaiting admin approval</Typography>
              <Button variant="contained" color="secondary" style={{ marginTop: 12 }}>
                View Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
