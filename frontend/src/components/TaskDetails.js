//////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, CircularProgress } from '@mui/material';

function TaskDetails() {
    const { taskId } = useParams();  // Otteniamo il taskId dall'URL
    const [taskStatus, setTaskStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Funzione per controllare lo stato del task
        const fetchTaskStatus = () => {
            fetch(`http://localhost:5000/api/v1/task-status/${taskId}`)
                .then(response => response.json())
                .then(data => {
                    setTaskStatus(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching task status:", error);
                    setLoading(false);
                });
        };

        fetchTaskStatus();
    }, [taskId]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <Typography variant='h4'>Task ID: {taskId}</Typography>
            <Typography>Status: {taskStatus?.status}</Typography>

            {taskStatus?.state === 'COMPLETED' && (
                <>
                    <Typography>Task Completed Successfully!</Typography>
                    <Button
                        variant='contained'
                        href={`http://127.0.0.1:5000${taskStatus.result_file}`}  // Link per scaricare il file
                        download
                    >
                        Download Result
                    </Button>
                </>
            )}

            {taskStatus?.state === 'FAILURE' && (
                <Typography color='error'>Task Failed: {taskStatus?.status}</Typography>
            )}
        </div>
    );
}

export default TaskDetails;
