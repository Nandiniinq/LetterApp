import React from "react";
import { signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material"; // Fixed import

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const user = await signInWithGoogle();
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          marginBottom: "20px",
          fontWeight: "bold",
          color: "white",
          textAlign: "center",
        }}
      >
        Welcome to Letter App
      </Typography>

      {/* Google Sign-in Button */}
      <Button
        variant="contained"
        onClick={handleLogin}
        sx={{
          width: "300px",
          padding: "12px",
          backgroundColor: "#6a0dad",
          color: "#fff",
          borderRadius: "30px",
          "&:hover": { backgroundColor: "#5a0cad" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        {/* Google Logo with Colors */}
        <Box
          component="span"
          sx={{
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: "white",
          }}
        >
          <GoogleIcon
            sx={{
              fontSize: "20px",
              color: "#4285F4", // Blue
              background: `linear-gradient(to right, #EA4335, #FBBC05, #34A853, #4285F4)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
        </Box>
        Sign in with Google
      </Button>
    </Box>
  );
};

export default Login;





