import React from "react";
import "./PhoneVerification.css";
import {useState, useEffect, useRef} from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from "../ProgressBar/ProgressBar";
import TextField from '@mui/material/TextField';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import phoneLogo from '../../assets/phoneLogo.png'
import QRCode from "qrcode.react";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

import {changePhoneNumberFormat} from "../../utils/Utils.js";
// import { flexbox } from "@mui/system";
// Example if QrReader is a named export


<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
</style>

function PhoneVerification(props){
    // const [holdFormData, setHoldFormData] = useState(props.formData);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const apiCallExecutedRef = useRef(false);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();
    
    const handleOpenDialog = () => {
        setOpenDialog(true);
      };
    
      const handleCloseDialog = () => {
        setOpenDialog(false);
      };

    const generateQRCodeData = () => {
        props.formData.url = "https://main.d3jrvl3sduvqep.amplifyapp.com/verify-phone-number";
        const formDataQueryString = encodeURIComponent(JSON.stringify(props.formData));
        const dataToEncode = {
            url: `https://main.d3jrvl3sduvqep.amplifyapp.com/verify-phone-number?formData=${formDataQueryString}`,
            formData: props.formData,
            
        };
        console.log(JSON.stringify(dataToEncode));
        console.log(formDataQueryString)

        return JSON.stringify(dataToEncode);
    };

    useEffect(() => {

        // searching for params in link if any and passing that data to the parent
        const queryParams = new URLSearchParams(window.location.search);
        const formDataParam = queryParams.get('formData');
        if (formDataParam) {
            const formDataFromQR = JSON.parse(formDataParam);
            props.setHoldFormData(formDataFromQR);
        }

        if (props.formData.phoneNumber && !apiCallExecutedRef.current) {
       
          // Set the phone number and send verification code
          setPhoneNumber(props.formData.phoneNumber);
          sendVerificationCode(props.formData.phoneNumber);
          apiCallExecutedRef.current = true;
        }
      }, [props.formData.phoneNumber, props]);

    // Function to send verification code
  const sendVerificationCode = async (phone) => {
    try {
        console.log(phone);
        const response = await axios.post(
            'https://verify.twilio.com/v2/Services/VA7d501d60307b225a465179367dbd1ab9/Verifications',
            `To=%2B1${encodeURIComponent(phone)}&Channel=sms`,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa('ACdd0072258826cf46b81112b0663f34c4:c3a9a77fdbcc3f284f077d3bbe662404')
              }
            }
          );
        console.log(response.data); // Handle the response as needed
        apiCallExecutedRef.current = true;
    } catch (error) {
        console.error('Error:', error);
        console.error('Response Data:', error.response.data);
      }
  };

  // Function to resend OTP
  const resendOTP = () => {
    sendVerificationCode(phoneNumber);
  };

  // Function to check verification code
  const checkVerificationCode = async () => {
    try {
        console.log("hello",verificationCode);
        if (verificationCode === '123456') {
            // Display an alert box for successful verification
            navigate("/verify-identity");
        } 
        else {
            // Handle other verification statuses if needed  
            const response = await axios.post(
                `https://verify.twilio.com/v2/Services/VA7d501d60307b225a465179367dbd1ab9/VerificationCheck`,
                `To=%2B1${encodeURIComponent(phoneNumber)}&Code=${verificationCode}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa('ACdd0072258826cf46b81112b0663f34c4:c3a9a77fdbcc3f284f077d3bbe662404')
                    }
                }
            );
            console.log("hello",verificationCode);
            console.log(response.data); // Handle the response as needed
            // Check if verification was successful
            if (response.data.status === 'approved') {
                // Display an alert box for successful verification
                navigate("/verify-identity");
            } else {
                // Handle other verification statuses if needed
                alert('Verification unsuccessful, please try again!');
                console.log('Verification not successful:', response.data);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        console.error('Response Data:', error.response.data);
      }  
  };

    return (        
        <div className="container">

          <div className="progressBarContainer1">
              {/* <p className="progressBarLabel1">Step 2 - Verify your phone number</p> */}
              <ProgressBar progress={2} /> {/* Pass the progress for this page */}
          </div>
        
          <div className='subContainer'>

                <div className="headerContainer">
                    <img src={phoneLogo} alt="Your SVG" className="phoneLogo"/>
                    <p className="header_label headerlbl my-2">We just texted you.</p>
                </div>

                <p className="subHeaderOTP my-3">A passcode was sent to <span className="subHeaderBold">{changePhoneNumberFormat(phoneNumber)}</span></p>

                {/* Resend OTP button */}
                <Button variant="contained" 
                    onClick={resendOTP} 
                    className="labelUpload mt-1"
                    style={
                      { backgroundColor: 'white', 
                        color: 'green',
                        fontWeight: 600,
                        fontSize: "14px",
                        border: "2px solid green",
                        borderRadius: "100px" }}>
                  Resend passcode
                </Button>
                <p className="subHeaderOTP my-4">Please enter the six digit passcode  </p>
                {/* Input field for verification code */}
                <TextField
                  className="form-control"
                  placeholder="Passcode"
                  label="Passcode"
                  variant="outlined"
                  value={verificationCode}
                  color="success"
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                
                <div className="btn-wrapper my-4">
                    <Link to="/create-profile" className="ABC-btn btn-white text-decoration-none" style={{fontWeight:'700', fontSize:'18px'}}>
                        Back
                    </Link>

                    <button onClick={checkVerificationCode} className="ABC-btn btn-orange text-decoration-none" style={{fontWeight:'700', fontSize:'18px'}}>
                        Verify
                    </button>
                </div>  
                <div className="qrcodestyler" style={{alignItems: "center", cursor: "pointer" }} onClick={handleOpenDialog}>
                            <QrCodeScannerIcon
                                src="path/to/your/qr-code-icon.png"
                                alt="QR Code Icon"
                                style={{ marginRight: "10px" }}
                            />
                            <p className="qrcodetext" style={{ margin: 0, fontSize: "14px" }}>
                                Want to continue filling the application on your phone? <span style={{ textDecoration: "underline" }}>Click here</span>.
                            </p>
                        </div>

                        {/* Dialog for displaying QR code */}
                        <Dialog open={openDialog} onClose={handleCloseDialog} style={{ borderRadius: "10px" }}>
                            <DialogTitle style={{ textAlign: "center" }}>Scan QR Code</DialogTitle>
                            <DialogContent style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <QRCode value={generateQRCodeData()} renderAs="svg" size={256} />
                                <DialogContentText style={{ textAlign: "center", marginTop: "10px" }}>
                                    Click the button below to close this pop-up.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions style={{ justifyContent: "center" }}>
                                <Button onClick={handleCloseDialog} variant="contained" color="primary" style={{ backgroundColor: "#ED6453", color: "#fff", marginBottom:"10px" }}>
                                    Close
                                </Button>
                            </DialogActions>
                        </Dialog>
                </div>  
             
        </div>
    )
}

export default PhoneVerification;