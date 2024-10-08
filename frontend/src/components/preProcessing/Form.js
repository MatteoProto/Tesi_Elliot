import React, {useEffect} from 'react';
import {useState} from 'react';
import DatasetForm from './DatasetForm.js';
import HierarchyForm from './HierarchyForm.js';
import FixedForm from './FixedForm.js'
import '../../styles/preProcessing/Form.css'
import objectToFormData from "../../objectToFormData.js";
import {
    Box,
    Button,
    Typography,
    useMediaQuery, useTheme
} from '@mui/material';
import Results from "../Results.js";
import LoadingButton from '@mui/lab/LoadingButton';
import {enqueueSnackbar} from "notistack";
import { useNavigate } from 'react-router-dom';


function Form(props) {
    const [loading, setLoading] = useState(false)
    const [downloadLink, setDownloadLink] = useState()
    const [error, setError] = useState(false)
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const [isValid, setIsValid] = useState(false);
    const navigate = useNavigate();


    //elenco request.form.get
    const request = {

        loading_strategy: '',

        //dataset-prefiltering
        random_seed: '',
        binarize: false,
        global_threshold: false,
        user_average: false,
        user_k_core: false,
        item_k_core: false,
        iterative_k_core: false,
        n_rounds_k_core: false,
        cold_users: false,

        global_threshold_threshold: 0,
        user_k_core_core: 0,
        item_k_core_core: 0,
        iterative_k_core_core: 0,
        n_rounds_k_core_core: 0,
        n_rounds_k_core_rounds: 0,
        cold_users_threshold: 0,

        //dataset-testsplitting
        test_fixed_timestamp: false,
        test_temporal_hold_out: false,
        test_random_subsampling: false,
        test_random_cross_validation: false,

        test_fixed_timestamp_value: '',
        test_temporal_hold_out_test_ratio: 0,
        test_temporal_hold_out_leave_n_out: 0,
        test_random_subsampling_test_ratio: 0,
        test_random_cross_validation_folds: 0,

        //dataset-validation
        validation_fixed_timestamp: false,
        validation_temporal_hold_out: false,
        validation_random_subsampling: false,
        validation_random_cross_validation: false,

        validation_fixed_timestamp_value: '',
        validation_temporal_hold_out_test_ratio: 0,
        validation_temporal_hold_out_leave_n_out: 0,
        validation_random_subsampling_test_ratio: 0,
        validation_random_cross_validation_folds: 0,

        file: undefined,
        validation_file: undefined,
        test_file: undefined

    }
    const [requestState, setRequestState] = useState(request);
    const [fileName, setFileName] = useState("");
    const [ListFile, setListFile] = useState({});
    const handleChangeFile = (e) => {
        const selectedFileName = e.target.files[0]?.name;
            setFileName(selectedFileName);
        setRequestState(requestState => ({...requestState, file: e.target.files[0]}));
        // const fileReader = new FileReader();
        // fileReader.readAsText(e.target.files[0], "UTF-8");
        // fileReader.onload = e => {
        //    setRequestState(requestState => ({...requestState, file: e.target.result}));
        // };
    };
    const handleChangeListFile = (e) => {
        const selectedFile = e.target.files[0];
            setListFile(ListFile => ({...ListFile, [e.target.name]: selectedFile?.name}));
            setRequestState(prevRequestState => {
                if (e.target.name !== 'validation_file' && e.target.name !== 'test_file') {
                    return {...prevRequestState, file: selectedFile};
                } else {
                    return {...prevRequestState, [e.target.name]: selectedFile};
                }
            });
            // const fileReader = new FileReader();
            // fileReader.readAsText(e.target.files[0], "UTF-8");
            // fileReader.onload = e => {
            //    setRequestState(requestState => ({...requestState, file: e.target.result}));
            // };
    };


    const handleChange = (e) => {
        const {name, value} = e.target;
        setRequestState(requestState => ({...requestState, [name]: value}))
        props.setPreviousStep(0);
        setFileName('');
        setListFile({});
    }

    const handleChangeHier = (e) => {
        const {name, value} = e.target;
        props.setPreviousStep(0);
        setRequestState(requestState => ({...requestState, [name]: value}))
        props.setSubmitButton(true);
        setFileName('');
    }

    function translateRequest(requestState){ //Trasforma e semplifica la richiesta, per poterla semplificare nel backend
        const request = {
            loading_strategy:requestState.loading_strategy,
            binarize:requestState.binarize,
            random_seed:requestState.random_seed,

            file:requestState.file,
        }
        
        if(requestState.loading_strategy === 'fixed'){
            request.train_file = requestState.train_file
            request.test_file = requestState.test_file
        }

        if(requestState.loading_strategy!=='dataset') // Se la strategia non è dataset, non sono necessari altri passaggi, né altri parametri
            return request
        
        const prefilteringStrategies = []

        if(requestState.global_threshold)
            prefilteringStrategies.push({strategy:'global_threshold', threshold:requestState.global_threshold_threshold})
        if(requestState.user_average)
            prefilteringStrategies.push({strategy:'user_average'})
        if(requestState.user_k_core)
            prefilteringStrategies.push({strategy:'user_k_core', core:requestState.user_k_core_core})
        if(requestState.item_k_core)
            prefilteringStrategies.push({strategy:'item_k_core', core:requestState.item_k_core_core})
        if(requestState.iterative_k_core)
            prefilteringStrategies.push({strategy:'iterative_k_core', core:requestState.iterative_k_core_core})
        if(requestState.n_rounds_k_core)
            prefilteringStrategies.push({strategy:'n_rounds_k_core', core:requestState.n_rounds_k_core_core, rounds:requestState.n_rounds_k_core_rounds})
        if(requestState.cold_users)
            prefilteringStrategies.push({strategy:'cold_users', threshold:requestState.cold_users_threshold})

        request.prefiltering_strategies = JSON.stringify(prefilteringStrategies) // In questo modo eliminiamo la ridondanza nelle strategie di prefiltering, e semplifichiamo il lavoro al backend

        // Qui gestiamo la strategia di splitting di test
        if (requestState.test_fixed_timestamp){
            request.test_splitting_strategy = 'fixed_timestamp'
            request.test_splitting_timestamp = requestState.test_fixed_timestamp_value
        }
        if (requestState.test_temporal_hold_out){
            request.test_splitting_strategy = 'temporal_hold_out'
            if(requestState.test_temporal_hold_out_leave_n_out === 0) 
                request.test_splitting_ratio = requestState.test_temporal_hold_out_test_ratio
            else
                request.test_splitting_leave_n_out = requestState.test_temporal_hold_out_leave_n_out
        }
        if (requestState.test_random_subsampling){
            request.test_splitting_strategy = 'random_subsampling'
            request.test_splitting_ratio = requestState.test_random_subsampling_test_ratio // TODO: andrebbero implementati anche folds, o eventuale leave_n_out
        }
        if (requestState.test_random_cross_validation){
            request.test_splitting_strategy = 'random_cross_validation'
            request.test_splitting_folds = requestState.test_random_cross_validation_folds
        }

        // Qui gestiamo la strategia di splitting di validazione
        if (requestState.validation_fixed_timestamp){
            request.validation_splitting_strategy = 'fixed_timestamp'
            request.validation_splitting_timestamp = requestState.validation_fixed_timestamp_value
        }
        if (requestState.validation_temporal_hold_out){
            request.validation_splitting_strategy = 'temporal_hold_out'
            if(requestState.validation_temporal_hold_out_leave_n_out === 0) 
                request.validation_splitting_ratio = requestState.validation_temporal_hold_out_validation_ratio
            else
                request.validation_splitting_leave_n_out = requestState.validation_temporal_hold_out_leave_n_out
        }
        if (requestState.validation_random_subsampling){
            request.validation_splitting_strategy = 'random_subsampling'
            request.validation_splitting_ratio = requestState.validation_random_subsampling_validation_ratio // TODO: andrebbero implementati anche folds, o eventuale leave_n_out
        }
        if (requestState.validation_random_cross_validation){
            request.validation_splitting_strategy = 'random_cross_validation'
            request.validation_splitting_folds = requestState.validation_random_cross_validation_folds
        }
        return request
    }

    const FormSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = objectToFormData({...translateRequest(requestState)})
        fetch('http://localhost:5000/api/v1/preprocessing-json', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        }).then(res => res.json())
            .then(j => {
                setLoading(false)
                enqueueSnackbar('Richiesta inviata', j.task_id)
                navigate('/tasks')
            }).catch(e => {
            setLoading(false);
            enqueueSnackbar('An error occurred.', {variant: 'error'})
            setError(true)
        })
    }

    return (
        <>
            {!props.preStep ?
                <>
                    <Box>

                        <Typography className='text'
                                    sx={{fontWeight: 'bold'}}
                        >Use this tool to preprocess your recommendation datasets.
                        </Typography>


                        <Typography className='text'
                        >You can choose among 3 different loading strategies,
                            8 prefiltering approaches and several splitting strategies.
                        </Typography>

                    </Box>

                    <Box sx={{textAlign: 'center'}}>
                        <Button className='start' type='button' variant='contained' size='large' onClick={() => {
                            props.setPreStep(true);
                            props.setStep(0);
                            setRequestState(request)
                        }}
                        > Start
                        </Button>
                    </Box>
                </>
                :
                <div>
                    <form action="" method="POST" encType="multipart/form-data" id="form_data">

                        {requestState.loading_strategy === '' ?
                            <>
                                <Typography className='text'
                                            sx={{
                                                mb: 5
                                            }}
                                >Choose the loading strategy</Typography>

                                <Box className='ButtonContainer'>
                                    <Button variant='contained' type='button' name='loading_strategy'
                                            value='dataset'
                                            onClick={handleChange}
                                            className='start'
                                    > Dataset</Button>
                                    <Button variant='contained' type='button' name='loading_strategy' value='fixed'
                                            onClick={handleChange}
                                            className='start'
                                    > Fixed</Button>
                                    <Button variant='contained' type='button' name='loading_strategy'
                                            value='hierarchy'
                                            onClick={handleChangeHier}
                                            className='start'
                                    > Hierarchy</Button>
                                </Box>
                            </>
                            : null}
                        {requestState.loading_strategy === 'dataset' ?
                            <DatasetForm previousStep={props.previousStep} setPreviousStep={props.setPreviousStep}
                                         step={props.step} setStep={props.setStep} setPreStep={props.setPreStep}
                                         setSubmitButton={props.setSubmitButton} request={request}
                                         setRequestState={setRequestState} requestState={requestState}
                                         handleChangeFile={handleChangeFile} fileName={fileName} isValid={isValid}
                                         setIsValid={setIsValid}/>
                            : null}
                        {requestState.loading_strategy === 'fixed' ?
                            <FixedForm previousStep={props.previousStep} setPreviousStep={props.setPreviousStep}
                                       step={props.step} setStep={props.setStep} setPreStep={props.setPreStep}
                                       setSubmitButton={props.setSubmitButton} request={request}
                                       setRequestState={setRequestState} requestState={requestState}
                                       handleChangeListFile={handleChangeListFile} ListFile={ListFile} isValid={isValid}
                                       setIsValid={setIsValid}/>
                            : null}
                        {requestState.loading_strategy === 'hierarchy' ?
                            <HierarchyForm previousStep={props.previousStep} setPreviousStep={props.setPreviousStep}
                                           step={props.step} setStep={props.setStep} setPreStep={props.setPreStep}
                                           setSubmitButton={props.setSubmitButton} request={request}
                                           setRequestState={setRequestState} requestState={requestState}
                                           handleChangeFile={handleChangeFile} fileName={fileName} isValid={isValid}
                                           setIsValid={setIsValid}/>
                            : null}
                    </form>

                    {props.submitButton ?

                        <Box sx={{textAlign: 'center'}}>
                            <LoadingButton disabled={!isValid} type='submit' loading={loading}
                                           value='Process the Strategy' className='runData'
                                           onClick={FormSubmit} sx={{fontSize: {xs: "13px", sm: '15px'}}}
                                           varinat='outline'>
                                {!matches ? 'Process the Strategy' : 'Process'}

                            </LoadingButton>

                        </Box>
                        : null
                    }

                </div>


            }
            {downloadLink && <Results url={downloadLink} removeDownloadLink={() => setDownloadLink()}/>}
        </>
    );

}


export default Form;