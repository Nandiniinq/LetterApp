import React, { useEffect, useState } from "react";
import { logout } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem("letterDraft");
    setHasDraft(!!draft); // Convert to boolean: true if draft exists, false otherwise
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("user");
    navigate("/");
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
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          textAlign: "center",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "2px 2px 10px rgba(255,255,255,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: "20px", color: "#000" }}>
          Welcome, {user?.displayName}
        </Typography>

        {hasDraft && (
          <Typography variant="body1" sx={{ marginBottom: "10px", color: "gray" }}>
            You have a saved draft.
          </Typography>
        )}

        <Button
          variant="contained"
          sx={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            backgroundColor: "purple",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#6a0dad",
            },
          }}
          onClick={() => navigate("/editor")}
        >
          Open Letter Editor
        </Button>

        <Button
          variant="contained"
          sx={{
            width: "100%",
            padding: "12px",
            backgroundColor: "purple",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#6a0dad",
            },
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Container>
    </Box>
  );
};

export default Dashboard;



