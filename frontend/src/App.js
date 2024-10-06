import React, {useEffect, useState} from 'react';
import {Routes, Route} from 'react-router-dom';
import PreProcessing from './viewModels/PreProcessing.js';
import Home from './viewModels/Home.js';
import Recommendation from './viewModels/Recommendation.js';
import Evaluation from './viewModels/Evaluation.js';
import {Box, Container, CssBaseline} from "@mui/material";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { StyledEngineProvider } from '@mui/material/styles';
import {SnackbarProvider} from 'notistack';
import './styles/App.css'
import Login from './viewModels/Login.js';
import SignIn from './viewModels/Signin.js';
import Tasks from './viewModels/TaskList.js';

function App() {
    const [previousStep, setPreviousStep] = useState(5);
    const [step, setStep] = useState(0);
    const [evStep,setEvStep]=useState(-1);
    const [previousevStep, setPreviousevStep] =useState(-1);

    const [submitButton, setSubmitButton] = useState(false);
    const [preStep, setPreStep] = useState(false);

    const [logged, setLogged] = useState(null)
    const [task, setTask] = useState({})

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('http://localhost:5000/get-user-id', {
                    method: 'GET',
                    credentials: 'include'  // Include i cookie di sessione nella richiesta
                });
                if (response.ok) {
                    const data = await response.json();
                    setLogged(data.user_id);  // Imposta lo stato di login con l'ID utente
                } else {
                    setLogged(null);  // Se non autenticato, imposta lo stato a null
                }
            } catch (error) {
                console.error('Errore durante il controllo dello stato di login:', error);
                setLogged(null);
            }
        };

        checkLoginStatus();
    }, []);


    return (
        <StyledEngineProvider injectFirst>
            <div style={{ position: 'sticky', top: 0, zIndex: 2000 }}>
            <SnackbarProvider anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }} autoHideDuration={3000} preventDuplicate  style={{ position: 'sticky', top: 0, left: '50%', transform: 'translateX(-50%)' }}
            />
            </div>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: '#fdfdfd',
                zIndex: 1,

            }}>
            <Navbar logged={logged} setLogged={setLogged} setTask={setTask} setPreviousStep={setPreviousStep} setStep={setStep} setSubmitButton={setSubmitButton} setPreStep={setPreStep} setPreviousevStep={setPreviousevStep} setEvStep={setEvStep} >

            </Navbar>
            <CssBaseline/>
            <Container component="main">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/preprocessing" element={logged?<PreProcessing logged={logged} setPreviousStep={setPreviousStep} setStep={setStep} setSubmitButton={setSubmitButton} previousStep={previousStep} step={step} submitButton={submitButton} preStep={preStep} setPreStep={setPreStep}  />:<Home/>}/>
                    <Route path="/recommendation" element={logged?<Recommendation logged={logged}/>:<Home/>}/>
                    <Route path="/evaluation" element={logged?<Evaluation logged={logged} previousevStep={previousevStep} setPreviousevStep={setPreviousevStep} evStep={evStep} setEvStep={setEvStep} />:<Home/>}/>
                    <Route path="/tasks" element={logged?<Tasks logged={logged} task={task} setTask={setTask}/>:<Home/>} />
                    <Route path="/login" element={logged?<Home/>:<Login setLogged={setLogged} setTask={setTask}/>} />
                    <Route path="/signin" element={logged?<Home/>:<SignIn />} />
                    <Route path="*" element={<Home/>} />
                </Routes>
            </Container>
            <Footer/>
        </Box>
        </StyledEngineProvider>
    );
}

export default App;
