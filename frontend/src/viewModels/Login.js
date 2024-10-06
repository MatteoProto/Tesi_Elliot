import React, { useState } from 'react';
import { Typography, TextField, Button } from '@mui/material';
import '../styles/Home.css'; 
import fetchTasks from './TaskList'


function Login({ setLogged,  }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const onLogin = async (email, password, setTask) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (data.ans) {
        return { success: true, id: data.user_id, email: data.email};
      } else {
        return { success: false, error: data.error || 'Login fallito' };
      }
    } catch (error) {
      return { success: false, error: 'Errore di rete. Riprova.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onLogin(email, password);

    if (result.success) {
      console.log('Login riuscito');
      setLogged(result.id)
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
        Login
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
        {errorMessage && (
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>
      </form>
    </div>
  );
}

export default Login;