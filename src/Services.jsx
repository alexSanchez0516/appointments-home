/* eslint-disable react-hooks/exhaustive-deps */
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { MenuBarExpo } from "./Components/DataGrid/Menu/Menu";

import { STATUS_NOTES, USERS } from "./constants/contants";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "./Services/services";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const Services = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const user = localStorage.getItem("user");
  const navigate = useNavigate(); // Hook para navegación
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectAppointmetsUser, setSelectAppointmetsUser] = useState(
    JSON.parse(user).email
  );
  // JSON.parse(user)?.img_profile?.url
  const initialValues = {
    id: null,
    user: JSON.parse(user).email,
    name: "",
    observations: "",
    status: STATUS_NOTES[0],
  };

  const handleChange = (event) => {
    setSelectAppointmetsUser(event.target.value);
  };

  const formik = useFormik({
    initialValues,
    onSubmit: (values) => {
      if (values.id == null) {
        delete values.id;
      }
      values.user = JSON.parse(user).email;
      values.id
        ? updateNote(values.id, values).then(() => {
            toast.success("Nota actualizado correctamente");
            getServicesData();
            handleClose();
            formik.resetForm();
          })
        : createNote({ ...values, id: undefined }).then(() => {
            toast.success("Nota creado correctamente");
            getServicesData();
            handleClose();
            formik.resetForm();
          });
    },
  });

  useEffect(() => {
    getServicesData();
  }, []);

  useEffect(() => {
    getServicesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectAppointmetsUser]);

  const getServicesData = () => {
    getNotes()
      .then(({ data }) => {
        console.log({ selectAppointmetsUser });
        const mappedData = data.data

          // .filter((item) => item.attributes.user === selectAppointmetsUser)
          .map(({ id, attributes }) => {
            const { name, observations, status, user } = attributes;
            return { id, name, observations, status, user };
          });
        setRows(mappedData);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const setDataForFormikByCellSelect = (evt) => {
    console.log({ evt });

    formik.setFieldValue("id", evt.id);
    formik.setFieldValue("name", evt.name);
    formik.setFieldValue("observations", evt.observations);
    formik.setFieldValue("status", evt.status);
    formik.setFieldValue("user", evt.user);

    handleOpen();
  };

  const deleteServices = () => {
    if (!formik.values.id) {
      return;
    }
    handleClose();
    Swal.fire({
      title: "¿Estás segur@ de eliminar el Nota?",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      icon: "warning",
      confirmButtonColor: "#ee99c9",
      cancelButtonColor: "red",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteNote(formik.values.id)
          .then(() => {
            toast.success("Nota eliminada correctamente");
            getServicesData();
            formik.resetForm();
          })
          .catch(() => {
            toast.error("Ups, hubo un error, contacta con el programador");
          });
      }
    });
  };
  console.log({ rows });

  return (
    <div>
      <ToastContainer />

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-observations"
      >
        <Box sx={style}>
          <Typography
            variant="h4"
            style={{ marginBottom: ".5rem", marginTop: ".5rem" }}
          >
            {formik.values.id ? "Ver Nota" : "Crear Nota"}
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              "& .MuiTextField-root": { m: 1, width: "25ch" },
            }}
            noValidate
            autoComplete="off"
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexFlow: "column wrap",
              }}
            >
              <TextField
                fullWidth
                style={{ width: "100%", marginBottom: "1rem" }}
                id="name"
                name="name"
                label="Nombre Nota"
                multiline
                maxRows={4}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name ? formik.errors.name : ""}
              />

              <TextField
                fullWidth
                style={{ width: "100%", marginBottom: "1rem" }}
                id="observations"
                label="Observaciones"
                multiline
                name="observations"
                maxRows={4}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.observations}
                error={
                  formik.touched.observations &&
                  Boolean(formik.errors.observations)
                }
                helperText={
                  formik.touched.observations ? formik.errors.observations : ""
                }
              />

              <Box sx={{ minWidth: '100%', margin: 1 }} style={{}}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Estado</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={formik.values.status}
                    label="Estado"
                    style={{width: '200px'}}
                    onChange={(value) => {
                      console.log(value.target.value);
                      formik.setFieldValue("status", value.target.value);
                    }}
                  >
                    {STATUS_NOTES.map((status, index) => {
                      return (
                        <MenuItem
                          key={`status_item_id_${index + 1}`}
                          value={status}
                        >
                          {status}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              <div style={{ display: "flex" }}>
                {formik.values.id && (
                  <Button
                    style={{ margin: ".3rem 0 .3rem .5rem" }}
                    variant="contained"
                    color="error"
                    onClick={() => {
                      deleteServices();
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                )}
                <Button
                  style={{ margin: ".3rem 0 .3rem .5rem" }}
                  variant="contained"
                  color="error"
                  onClick={() => {
                    formik.resetForm();
                    handleClose();
                  }}
                >
                  <CancelIcon />
                </Button>
                <Button
                  style={{
                    margin: ".3rem 0 .3rem .5rem",
                    backgroundColor: "rgb(147, 227, 253)",
                  }}
                  variant="contained"
                  type="submit"
                >
                  <SaveIcon />
                </Button>
              </div>
            </div>
          </Box>
        </Box>
      </Modal>

      <MenuBarExpo />
      <Typography
        variant="h4"
        style={{ textAlign: "center", marginTop: "1rem" }}
      >
        Notas
      </Typography>
      <Box sx={{ minWidth: 120, margin: 2 }} style={{}}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Usuario</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={selectAppointmetsUser}
            label="Usuario"
            onChange={handleChange}
          >
            {USERS.map((user, index) => {
              return (
                <MenuItem key={`user_item_id_${index}`} value={user}>
                  {user}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          style={{ margin: "1rem 1rem 1rem 0", backgroundColor: "rgb(147, 227, 253)" }}
          onClick={() => navigate("/citas")}
        >
          Volver
        </Button>
        <Button
          variant="contained"
          style={{ margin: "1rem 1rem 1rem 0", backgroundColor: "rgb(147, 227, 253)" }}
          onClick={handleOpen}
        >
          <AddIcon />
        </Button>
      </div>

      <div style={{ width: "100%", marginTop: "2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <Accordion style={{ width: "100%" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              En progreso
            </AccordionSummary>
            <AccordionDetails>
              {rows
                .filter((row) => row.status === STATUS_NOTES[1])
                .map((row) => (
                  <Card
                    onClick={() => setDataForFormikByCellSelect(row)}
                    key={row.id}
                    sx={{ width: "100%" }}
                  >
                    <CardContent>
                      <Typography sx={{ mb: 1.5 }} style={{ color: "green" }}>
                        {row.status} {/* Ejemplo: Estado de la nota */}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        {/* ${row.user === "xymind0516@gmail.com" ? "de/xymind0516" : row.user === "cristina@gmail.com" ? "de/cristina" : "predeterminada"}.jpeg`} */}

                        <Avatar
                          alt="Cindy Baker"
                          src={
                            "https://api.divisione.es/uploads/" +
                            row.user === "xymind0516@gmail.com"
                              ? "alex_d03ec5afa9.jpeg"
                              : row.user === "cristina@gmail.com" ? "1695319530128_581739228e.jpg": ""
                          }
                        />
                      </Typography>
                      <Typography
                        variant="h6"
                        style={{
                          marginBottom: "1rem",
                          display: "flex",
                          flexWrap: "wrap",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        component="div"
                      >
                        {row.name}
                      </Typography>
                      <Typography va variant="body2">
                        {row.observations}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Ver</Button>
                    </CardActions>
                  </Card>
                ))}
            </AccordionDetails>
          </Accordion>

          <Accordion style={{ width: "100%" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Sin estado
            </AccordionSummary>
            <AccordionDetails>
              {rows
                .filter((row) => row.status === STATUS_NOTES[0])
                .map((row) => (
                  <Card
                    onClick={() => setDataForFormikByCellSelect(row)}
                    key={row.id}
                    sx={{ width: "100%" }}
                  >
                    <CardContent>
                      <Typography sx={{ mb: 1.5 }} style={{ color: "green" }}>
                        {row.status} {/* Ejemplo: Estado de la nota */}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        {/* ${row.user === "xymind0516@gmail.com" ? "de/xymind0516" : row.user === "cristina@gmail.com" ? "de/cristina" : "predeterminada"}.jpeg`} */}

                        <Avatar
                          alt="Cindy Baker"
                          src={
                            "https://api.divisione.es/uploads/" +
                            (row.user === "xymind0516@gmail.com"
                              ? "alex_d03ec5afa9.jpeg"
                              : row.user === "cristina@gmail.com" ? "1695319530128_581739228e.jpg" : "")
                          }
                        />
                      </Typography>
                      <Typography
                        variant="h6"
                        style={{
                          marginBottom: "1rem",
                          display: "flex",
                          flexWrap: "wrap",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        component="div"
                      >
                        {row.name}
                      </Typography>
                      <Typography va variant="body2">
                        {row.observations}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Ver</Button>
                    </CardActions>
                  </Card>
                ))}
            </AccordionDetails>
          </Accordion>

          <Accordion style={{ width: "100%" }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              Completada
            </AccordionSummary>
            <AccordionDetails>
              {rows
                .filter((row) => row.status === STATUS_NOTES[2])
                .map((row) => (
                  <Card
                    onClick={() => setDataForFormikByCellSelect(row)}
                    key={row.id}
                    sx={{ width: "100%" }}
                  >
                    <CardContent>
                      <Typography sx={{ mb: 1.5 }} style={{ color: "green" }}>
                        {row.status} {/* Ejemplo: Estado de la nota */}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                      >

                        <Avatar
                          alt="Cindy Baker"
                          src={
                            "https://api.divisione.es/uploads/" +
                            (row.user === "xymind0516@gmail.com"
                              ? "alex_d03ec5afa9.jpeg"
                              : row.user === "cristina@gmail.com" ? "1695319530128_581739228e.jpg" : "")
                          }
                        />
                      </Typography>
                      <Typography
                        variant="h6"
                        style={{
                          marginBottom: "1rem",
                          display: "flex",
                          flexWrap: "wrap",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        component="div"
                      >
                        {row.name}
                      </Typography>
                      <Typography va variant="body2">
                        {row.observations}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Ver</Button>
                    </CardActions>
                  </Card>
                ))}
            </AccordionDetails>
          </Accordion>

       
        </div>
        {/* <DataGrid
          loading={loading}
          rows={rows}
          onCellClick={setDataForFormikByCellSelect}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
        /> */}
      </div>
    </div>
  );
};
