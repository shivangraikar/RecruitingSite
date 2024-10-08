"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Link,
  Chip,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DescriptionIcon from "@mui/icons-material/Description";
import WorkIcon from "@mui/icons-material/Work";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import "../styles/styles.css";
import HeadlineTicker from "../components/HeadlineTicker";
import ProfileDialog from "../components/ProfileDialog";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [educationFilter, setEducationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, isLoaded, isSignedIn } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { signOut } = useClerk();
  const [headlines, setHeadlines] = useState([]);
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const sortedUsers = userList.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkUserProfile = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.id);
        const userSnapshot = await getDoc(userDoc);
        setHasProfile(userSnapshot.exists());
      }
    };

    const fetchHeadlines = async () => {
      const fetchedHeadlines = [
        "New jobs in tech are up by 20% this month!",
        "Demand for React developers continues to rise.",
        "AI skills are becoming essential in the job market.",
        "Remote work opportunities are increasing in tech.",
      ];
      setHeadlines(fetchedHeadlines);
    };

    if (isSignedIn) {
      fetchUsers();
      checkUserProfile();
      fetchHeadlines();
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    const filterUsers = () => {
      const filtered = users.filter((user) => {
        const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const skillsMatch = Array.isArray(user.skills) &&
          user.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        const degreeMatch = user.degree && user.degree.toLowerCase().includes(searchTerm.toLowerCase());
        const educationMatch = educationFilter === "" || (user.degree && user.degree === educationFilter);

        return (nameMatch || skillsMatch || degreeMatch) && educationMatch;
      });
      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [users, searchTerm, educationFilter]);

  const handleSearch = () => {
    filterUsers();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleOpenProfile = (profile) => {
    setSelectedProfile(profile);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <Box className="Container" sx={{ backgroundColor: "linear-gradient(to right, #f0f4f8, #f7f7f7)", minHeight: "100vh", paddingBottom: "2rem" }}>
        <AppBar position="static" sx={{ backgroundColor: "#2b3a42", color: "#fff", boxShadow: "none" }}>
          <Container>
            <Toolbar>
              <Link href="/" underline="none" color="inherit">
                <Typography  variant={isMobile ? "h7" : "h6"} component="div" sx={{ flexGrow: 1, display: "flex", alignItems: "center", fontWeight: 700 }}>
                  <WorkIcon sx={{ mr: 1, color: "#4caf50" }} />
                  TechMarket
                </Typography>
              </Link>
              <Box sx={{ flexGrow: 1 }} />
              {hasProfile ? (
                <Button
                  onClick={() => router.push("/edit_profile")}
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    borderRadius: "30px",
                    fontWeight: "bold",
                    padding: "6px 20px",
                    "&:hover": { backgroundColor: "#388e3c" },
                  }}
                >
                  My Profile
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/create_profile")}
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    borderRadius: "30px",
                    fontWeight: "bold",
                    padding: "6px 20px",
                    "&:hover": { backgroundColor: "#388e3c" },
                  }}
                >
                  Add Profile
                </Button>
              )}
              <IconButton onClick={handleSignOut} sx={{ color: "#fff" }}>
                <LogoutIcon sx={{ color: '#28a745' }} />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
  
        <Container sx={{ mt: 4 }}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: "bold", color: "#2b3a42" }}>
            Tech Professionals
          </Typography>
  
          <HeadlineTicker headlines={headlines} />
  
          <Box display="flex" sx={{ mt: 3, mb: 4 }}>
            <TextField
              label="Search profiles by name, skill, or degree"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                mr: 2,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#cfd8dc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#90a4ae",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4caf50",
                  },
                },
              }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              onClick={handleSearch} 
              sx={{
                height: '40px',
                backgroundColor: "#4caf50",
                "&:hover": {
                  backgroundColor: "#388e3c"
                }
              }}
            >
              Search
            </Button>
          </Box>
        </Container>
  
        <Box display="flex" justifyContent="center">
          <Box width={"80%"} mx={4}>
            {loading ? (
              <CircularProgress />
            ) : filteredUsers.length > 0 ? (
              <Grid container spacing={3}>
                {filteredUsers.map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user.id}>
                    <Card
                      onClick={() => handleOpenProfile(user)}
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                        "&:hover": { transform: "scale(1.05)", boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" },
                        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
                        borderRadius: "15px",
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={isMobile ? 1 : 2}>
                          <Avatar
                            src={user.photoURL}
                            alt={user.name}
                            sx={{ mr: 2, width: isMobile ? 40 : 60, height: isMobile ? 40 : 60, border: "2px solid #4caf50" }}
                          />
                          <Typography variant={isMobile ? "h7" : "h6"} sx={{ fontWeight: "bold", color: "#2b3a42" }}>
                            {user.name}
                          </Typography>
                        </Box>
                        <Box mb={isMobile ? 1 : 2}>
                          <GitHubIcon sx={{ mr: 1, color: "#333" }} />
                          <Typography component="span">GitHub</Typography>
                        </Box>
                        <Box mb={isMobile ? 1 : 2}>
                          <LinkedInIcon sx={{ mr: 1, color: "#0a66c2" }} />
                          <Typography component="span">LinkedIn</Typography>
                        </Box>
                        <Box mb={isMobile ? 1 : 2}>
                          <DescriptionIcon sx={{ mr: 1, color: "#757575" }} />
                          <Typography component="span">Resume</Typography>
                        </Box>
                        <Box>
                          {user.skills &&
                            user.skills
                              .slice(isMobile ? (0, 2) : (0, 0))
                              .map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  sx={{
                                    mr: 1,
                                    mb: 1,
                                    backgroundColor: "#e0f7fa",
                                    color: "#00796b",
                                    fontWeight: "bold",
                                  }}
                                />
                              ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No users found.</Typography>
            )}
          </Box>
  
          <ProfileDialog
            open={openDialog}
            onClose={handleCloseDialog}
            profile={selectedProfile}
          />
        </Box>
      </Box>
    </>
  );
}
