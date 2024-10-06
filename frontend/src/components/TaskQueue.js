import React from 'react';
import { List, ListItem, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function TaskQueue({ tasks }) {
    return (
        <div>
            <Typography variant='h5'>Task Queue</Typography>
            <List>
                {tasks.map((task, index) => (
                    <ListItem key={index}>
                        <Typography>
                            Task ID: {task.task_id} - Status: {task.status}
                        </Typography>
                        <Link to={`/task/${task.task_id}`}>
                            <Button variant="contained">View Task</Button>
                        </Link>
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default TaskQueue;
