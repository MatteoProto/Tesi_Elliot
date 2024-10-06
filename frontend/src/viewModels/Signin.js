import React, { useState } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import '../styles/Home.css'; 
import { useNavigate } from 'react-router-dom'; 


function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const onSignIn = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (data.ans) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registrazione fallita' };
      }
    } catch (error) {
      return { success: false, error: 'Errore di rete. Riprova.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Le password non coincidono');
      return;
    }

    const result = await onSignIn(email, password);

    if (result.success) {
      console.log('Registrazione riuscita');
      navigate('/Login');
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="Conatainer">
      <Typography
        sx={{
          fontFamily: "'Merriweather', serif;",
          textAlign: 'center',
          fontWeight: 'bold',
          mt: 5,
          fontSize: '2.9em'
        }}
        className="homeTit"
      >
        Sign In
      </Typography>

      <form onSubmit={handleSubmit} className="form">
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        {errorMessage && (
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth>
          Sign In
        </Button>
      </form>
    </div>
  );
}

export default SignIn;
