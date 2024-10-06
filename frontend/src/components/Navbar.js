import React, {useState} from 'react';
import '../styles/Navbar.css';
import {Link as RouterLink} from 'react-router-dom';
import {AppBar, Button, Divider, Drawer, IconButton, List, ListItem, Toolbar, Typography} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate } from 'react-router-dom';


function Navbar(props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // Stato per il dialogo di conferma
    const navigate = useNavigate();

    const change = () => {
        props.setPreStep(false);
        props.setStep(5);
        props.setPreviousStep(5)
        props.setSubmitButton(false);
        props.setEvStep(-1);
        props.setPreviousevStep(-1)
    }

    const headersData = props.logged
  ? [
      { label: "Tasks", href: "/tasks" },
      { label: "Data preprocessing", href: "/preprocessing" },
      { label: "Recommendation", href: "/recommendation" },
      { label: "Evaluation", href: "/evaluation" }
    ]
  : [
      { label: "Login", href: "/login" },
      { label: "SignIn", href: "/signin" }
    ];


    const handleLogout = async () => {
        await fetch('http://localhost:5000/logout', {
            method: 'POST',
            credentials: 'include'  // Invia i cookie di sessione
        });
        props.setLogged(''); // Ora imposta il valore a '' per indicare il logout
        props.setTask({});
        navigate('/'); // Reindirizza alla homepage
    };

    return (
        <AppBar position="static" sx={{backgroundColor: '#297db6'}}>
            <Toolbar className="toolbar">
                <RouterLink className='link' to='/'>
                    <HomeIcon
                        fontSize='large'
                        sx={{
                            display: {xs: "none", md: 'block'},
                            pl: '2px',
                            color: 'white',
                        }}></HomeIcon>
                    <Typography variant='h5'
                                sx={{
                                    textAlign: 'center',
                                    color: 'white',
                                    ml: 1,
                                    fontWeight: 'bold',
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                                    fontFamily: '"Arial Black", Gadget, sans-serif',
                                    pt: '2px'
                                }}>
                        Elliot Web</Typography></RouterLink>
                <div>
                    {headersData.map(({label, href}) => (
                        <Button
                            key={label}
                            onClick={change}
                            {...{
                                color: "inherit",
                                to: href,
                                component: RouterLink,
                                className: "button",
                                sx: {
                                    display: {xs: "none", md: 'inline'},
                                    color: 'white',
                                    fontFamily: '"Arial Black", Gadget, sans-serif',
                                    p: '10px',
                                    ml: '10px',
                                    borderRadius: '10px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    }
                                }

                            }}
                        >{label}
                        </Button>
                    ))}
                    {props.logged && (
                        <Button
                            onClick={() => setIsLogoutDialogOpen(true)} // Apre il dialogo di conferma
                            sx={{
                                display: { xs: "none", md: 'inline' },
                                color: 'white',
                                fontFamily: '"Arial Black", Gadget, sans-serif',
                                p: '10px',
                                ml: '10px',
                                borderRadius: '10px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                }
                            }}
                        >
                            Logout
                        </Button>
                    )}
                    <Drawer
                        open={isDrawerOpen}
                        onClose={() => setIsDrawerOpen(false)}
                        anchor='top'
                    >
                        <List sx={{backgroundColor: '#297db6', p: 0}}>
                            {headersData.map(({label, href}) => (
                                <React.Fragment key={label}> <ListItem button key={label} component={RouterLink}
                                                                       to={href} sx={{
                                    color: 'white', fontFamily: '"Arial Black", Gadget, sans-serif', display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '10px',
                                    fontSize: '1.1em',
                                    p: '16px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    }
                                }} onClick={() => {
                                    setIsDrawerOpen(false);
                                    change()
                                }}>
                                    {label}

                                </ListItem>
                                    <Divider></Divider>
                                </React.Fragment>
                            ))}
                        </List>
                    </Drawer>
                    <IconButton edge="start" color="inherit" onClick={() => setIsDrawerOpen(true)}
                                sx={{display: {xs: "block", md: 'none'}}}>
                        <ArrowDropDownIcon fontSize='large'/>
                    </IconButton>

                    {/* Dialogo di conferma per il logout */}
                    <Dialog
                        open={isLogoutDialogOpen}
                        onClose={() => setIsLogoutDialogOpen(false)}
                    >
                        <DialogTitle>Conferma Logout</DialogTitle>
                        <DialogContent>
                            <DialogContentText>Sei sicuro di voler effettuare il logout?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setIsLogoutDialogOpen(false)}>Annulla</Button>
                            <Button onClick={() =>{handleLogout();setIsLogoutDialogOpen(false)}} autoFocus>Logout</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </Toolbar>

        </AppBar>


    );
}

export default Navbar;