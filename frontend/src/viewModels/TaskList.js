import React, { useState, useEffect } from 'react';
import { Typography, List, ListItem, ListItemText, CircularProgress, Link } from '@mui/material';
import '../styles/Home.css'; // Assumendo che gli stili siano definiti qui

function Tasks({ logged, task, setTask }) {
  const [loading, setLoading] = useState(true); // Stato per indicare il caricamento

  // Funzione per recuperare i task dell'utente
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/user/', {
        credentials: 'include'  // Invia i cookie, incluso il cookie di sessione
      });
      const data = await response.json();
      
      const sortedTasks = data.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      setTask(sortedTasks);
      setLoading(false);
    } catch (error) {
      console.error('Errore durante il recupero dei task:', error);
      setLoading(false);
    }
  };

  // Effettua il polling ogni 2 secondi
  useEffect(() => {
    fetchTasks(); 
    const intervalId = setInterval(fetchTasks, 2000); 

    return () => clearInterval(intervalId); 
  }, [logged]); 

  return (
    <div className="task-container">
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Merriweather', serif;",
          textAlign: 'center',
          fontWeight: 'bold',
          mt: 5,
          fontSize: '2.9em',
          color: '#297db6'
        }}
      >
        Lista dei Task
      </Typography>

      {loading ? (
        <div className="loading-container">
          <CircularProgress />
          <Typography variant="body1">Caricamento dei task...</Typography>
        </div>
      ) : task.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
          Nessun task trovato.
        </Typography>
      ) : (
        <List sx={{ width: '80%', margin: '0 auto', mt: 3 }}>
          {task.map((task) => (
            <ListItem key={task.task_id} sx={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              mb: 2,
              boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)'
            }}>
              <ListItemText
                primary={`Task ID: ${task.task_id} | Tipo Task: ${task.task_type}`}
                secondary={`Stato: ${task.status} | Creato il: ${new Date(task.created).toLocaleString()}`}
              />
              {task.result && (
                <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                  <Link href={task.result} target="_blank" rel="noopener" sx={{ color: 'green', textDecoration: 'underline' }}>
                    Clicca qui per il risultato
                  </Link>
                </Typography>
              )}
              {task.error && (
                <Typography variant="body2" sx={{ color: 'red', fontWeight: 'bold' }}>
                  Errore: {task.error}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}

export default Tasks;
