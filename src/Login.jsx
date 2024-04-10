/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";
import authService from "./Services/authService";
export const Login = () => {

  const validationSchema = Yup.object({
    identifier: Yup.string()
      .email("Formato de correo electrónico inválido")
      .required("Campo requerido"),
    password: Yup.string().required("Campo requerido"),
  });

  const onSubmit = (values) => {
    authService.login(values).then((response) => {
      try {
        if (response.jwt) {
          localStorage.setItem("user", JSON.stringify(values));
          authService
          .getUserById(response.user.id)
          .then((responseUser) => {
             localStorage.setItem("user", JSON.stringify(responseUser));
            window.location.reload();
            
          });
        }else {
          toast.error("Login incorrecto");
        }
      } catch (error) {
        console.log();
        
        toast.error("ERROR");
      }
    });
  };

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: onSubmit,
  });

  // Use useEffect to check local storage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const userData = JSON.parse(storedUser);

      // Set the formik values with the user data
      formik.setValues(userData);
    }
  }, []);

  return (
    <form
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        // height: "50vh",
      }}
      onSubmit={formik.handleSubmit}
      className="container"
    >
      <ToastContainer />
      <Typography
        color={"black"}
        variant="h6"
        noWrap
        component="a"
        sx={{
          mr: 2,
          display: { md: "flex" },
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: ".3rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <img
          alt="LOGOTIPO"
          width={"300"}
          src="manifest-icon-512.maskable.png"
        />
      </Typography>
      <div className="wrapper" style={{ minWidth: "300px", maxWidth: "500px" }}>
        <div className="title">
          <span>Control de acceso</span>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <div className="row">
            <TextField
              fullWidth
              style={{ margin: ".5rem" }}
              label="identifier"
              variant="outlined"
              id="identifier"
              name="identifier"
              placeholder="identifier"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.identifier}
            />
          </div>

          <div className="row">
            <TextField
              fullWidth
              style={{ margin: ".5rem" }}
              label="Password"
              variant="outlined"
              id="password"
              type="password"
              name="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="contained"
          style={{
            margin: "1rem",
            backgroundColor: "#ee99c9",
          }}
        >
          Entrar
        </Button>
      </div>
    </form>
  );
};
