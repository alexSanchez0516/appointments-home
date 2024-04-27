/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
import "moment/dist/locale/es";
import { Calendar, momentLocalizer } from "react-big-calendar";

import CachedIcon from "@mui/icons-material/Cached";
import CancelIcon from "@mui/icons-material/Cancel";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

import AddIcon from "@mui/icons-material/Add";
import AddTaskIcon from "@mui/icons-material/AddTask";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import NoAccountsIcon from "@mui/icons-material/NoAccounts";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SaveIcon from "@mui/icons-material/Save";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import {
  LocalizationProvider,
  renderTimeViewClock,
} from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useFormik } from "formik";
import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { MenuBarExpo } from "./Components/DataGrid/Menu/Menu";
import {
  createAppointment,
  createAppointmentRecurrent,
  deleteAppointment,
  getAppointmentsData,
  updateAppointment,
} from "./Services/services";
import {
  DAYS_RECURRENTS,
  STATUS_APPOINTMENTS,
  TYPES_EVENT,
  TYPES_RECURRENTS,
  USERS,
  daysOfWeek,
} from "./constants/contants";
// Add utc and timezone plugins to dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the timezone to Europe/Madrid (Spain)
dayjs.tz.setDefault("Europe/Madrid");
moment.locale("es");
dayjs.locale("es");
const localizer = momentLocalizer(moment);
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

const MonthEvent = ({ event }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
      <span>{event.title}</span>
      {event.status === "Pendiente" && <PendingActionsIcon />}
      {event.status === "Ausente" && <NoAccountsIcon />}
      {event.status === "Completada" && <AddTaskIcon />}
      {event.status === "Cancelada" && <DoDisturbIcon />}
    </div>
  );
};

export const CalendarApp = () => {
  const [open, setOpen] = useState(false);
  const today = dayjs();
  const tenAM = today.set("hour", 6).set("minute", 0).toDate();
  const nineThirtyPM = today.set("hour", 23).set("minute", 30).toDate();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [services] = useState([]);
  const [date, setDate] = useState(moment().toDate());
  const [namePatientsList, setNamePatientsList] = useState([]);
  const user = localStorage.getItem("user");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectAppointmetsUser, setSelectAppointmetsUser] = useState(
    JSON.parse(user).email
  );

  const handleChange = (event) => {
    setSelectAppointmetsUser(event.target.value);
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const initialValues = {
    id: null,
    namePatient: "",
    type: null,
    status: STATUS_APPOINTMENTS[0],
    datetime_init: dayjs(), // Usa dayjs para obtener la fecha actual
    datetime_end: null,
    complete: false,
    user: JSON.parse(user).email,
    tel: "",
    observations: "",
    services_nails: [],
    colour: "#ee99c9",
    recurrent: false,
    events_recurrent: null, //id
    recurrent_type: null,
    diasSeleccionados: [], // Inicializado como un arreglo vacío
  };

  /**
   * Show event selected
   * @param {*} event
   */
  const handleSelected = (event) => {
    const serviceIds = event.services.data.map((service) => service.id);
    const servicesFilters = services.filter((service) =>
      serviceIds.includes(service.id)
    );
    formik.setFieldValue("id", event.data.y);
    formik.setFieldValue("namePatient", event.title);
    formik.setFieldValue("type", event.type);
    formik.setFieldValue("datetime_init", dayjs(event.start));
    formik.setFieldValue("datetime_end", dayjs(event.end));
    formik.setFieldValue("tel", event.tel);
    formik.setFieldValue("services_nails", servicesFilters);
    formik.setFieldValue("observations", event.observations);
    formik.setFieldValue("status", event.status);
    formik.setFieldValue("colour", event.colour ?? "#ee99c9");
    formik.setFieldValue(
      "events_recurrent",
      event.events_recurrent ?? "#ee99c9"
    );

    handleOpen();
  };

  /**
   * Delete event by id
   * @param {*} id
   */
  const deleteEvent = async (id) => {
    console.log({ forikValues: formik.values });

    const configPopUp = {
      title: "¿Estás segur@ de eliminar la cita?",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      icon: "warning",
      confirmButtonColor: "#ee99c9",
      cancelButtonColor: "red",
    };
    if (formik.values.events_recurrent?.data?.id) {
      configPopUp.showDenyButton = true;
      configPopUp.denyButtonText = "Eliminar todos";
    }

    Swal.fire(configPopUp).then(async (result) => {
      if (result.isConfirmed) {
        deleteAppointment(id)
          .then(() => {
            toast.success("Cita/Evento eliminada correctamente");
            getAppointments();
          })
          .catch(() => {
            toast.error("Ups, hubo un error, contacta con el programador");
          });
      } else if (result.isDenied && formik.values.events_recurrent?.data?.id) {
        const appointmentRecurentByID = await getAppointDataFullPaginate();

        toast
          .promise(
            Promise.all(
              appointmentRecurentByID.map((appointment) =>
                deleteAppointment(appointment.id)
              )
            ),
            {
              pending: "Eliminando citas recurrentes...",
              success:
                "Todas las citas/eventos recurrentes eliminados correctamente 👌",
              error: "Error al eliminar citas recurrentes 🤯",
            }
          )
          .then(() => {
            getAppointments(); // Actualiza la lista de citas después de la eliminación exitosa
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  };

  const createRecurrentAppointments = async (
    requestData,
    recurrentType,
    diasSeleccionados
  ) => {
    try {
      const yearStart = dayjs().startOf("year");
      const yearEnd = dayjs().endOf("year");
      let currentDate = yearStart;

      const formikHourStart = dayjs(requestData.datetime_init).hour();
      const formikMinuteStart = dayjs(requestData.datetime_init).minute();
      const formikHourEnd = dayjs(requestData.datetime_end).hour();
      const formikMinuteEnd = dayjs(requestData.datetime_end).minute();

      const getNextDayOfWeek = (date, dayOfWeek) => {
        let resultDate = dayjs(date).day(dayOfWeek);
        if (resultDate.isBefore(date)) resultDate = resultDate.add(1, "week");
        return resultDate;
      };

      while (currentDate.isBefore(yearEnd)) {
        if (
          recurrentType === "Diario" ||
          recurrentType === "Semanal" ||
          recurrentType === "Mensual"
        ) {
          for (const dia of diasSeleccionados) {
            // Cambiado a bucle for...of
            let nextDate =
              recurrentType === "Diario"
                ? currentDate
                : getNextDayOfWeek(currentDate, daysOfWeek[dia]);

            if (
              dayjs(nextDate).isBefore(yearEnd) &&
              dayjs(nextDate).isAfter(yearStart)
            ) {
              let adjustedStartDate = dayjs(nextDate)
                .hour(formikHourStart)
                .minute(formikMinuteStart)
                .toISOString();
              let adjustedEndDate = dayjs(nextDate)
                .hour(formikHourEnd)
                .minute(formikMinuteEnd)
                .toISOString();

              let newRequestData = {
                ...requestData,
                datetime_init: adjustedStartDate,
                datetime_end: adjustedEndDate,
              };

              // Crea la cita con las fechas ajustadas
              await createAppointment(newRequestData);
            }
          }

          // Avanza al siguiente periodo según el tipo de recurrencia
          if (recurrentType === "Diario") {
            currentDate = currentDate.add(1, "day");
          } else if (recurrentType === "Semanal") {
            currentDate = currentDate.add(1, "week");
          } else if (recurrentType === "Mensual") {
            currentDate = currentDate.add(1, "month");
          }
        }
      }
    } catch (error) {
      console.log({ error });
      throw error; // Asegúrate de propagar el error para manejarlo más arriba si es necesario
    }
  };
  /**
   *
   * @param {*} values formik
   * @returns
   */
  const onSubmit = (values) => {
    console.log({ values });

    // Verifica que las fechas tengan el formato correcto
    const formattedDatetimeInit = dayjs(values.datetime_init).toISOString();
    const formattedDatetimeEnd = dayjs(values.datetime_end).toISOString();

    // Crea la solicitud con los datos formateados
    const requestData = {
      namePatient: values.namePatient,
      datetime_init: formattedDatetimeInit,
      complete: false,
      datetime_end: formattedDatetimeEnd,
      user: JSON.parse(user).email,
      tel: values.tel,
      type: values.type,
      services_nails: [],
      status: values.status,
      observations: values.observations,
      colour: values.colour,
      events_recurrent: values?.events_recurrent,
      events_recurrent_id: values?.events_recurrent,
    };

    // Define la función para manejar el éxito de la solicitud
    const handleSuccess = () => {
      const successMessage = values.id
        ? "Evento actualizada correctamente"
        : "Evento creada correctamente";

      toast.success(successMessage);
      handleClose();
      formik.resetForm();
    };

    if (!values.id) {
      if (values.recurrent_type && values.recurrent) {
        createAppointmentRecurrent({
          data: {
            type: values.recurrent_type,
          },
        }).then(async (response) => {
          requestData.events_recurrent = response.data.data.id;
          requestData.events_recurrent_id = response.data.data.id;
          try {
            toast
              .promise(
                createRecurrentAppointments(
                  requestData,
                  values.recurrent_type,
                  formik.values.diasSeleccionados
                ),
                {
                  pending: "Creando citas recurrentes...",
                  success: "Citas recurrentes creadas correctamente 👌",
                  error: "Error al crear citas recurrentes 🤯",
                }
              )
              .then(() => {
                getAppointments();
                handleClose();
                formik.resetForm();
              })
              .catch((error) => {
                console.error(error);
              });
          } catch (error) {
            toast.error(
              "Error en la solicitud[HAZ CAPTURA]",
              JSON.stringify(error)
            );
          }
        });
      } else {
        createAppointment(requestData)
          .then(() => {
            getAppointments();
            handleSuccess();
            formik.resetForm();
          })
          .catch((error) => {
            toast.error(
              "Error en la solicitud[HAZ CAPTURA]",
              JSON.stringify(error)
            );
          });
      }
    } else {
      const configPopUp = {
        title: "¿Que deseas actualizar?",
        showCancelButton: true,
        confirmButtonText: "Actualizar la actual",
        cancelButtonText: "Cancelar",
        icon: "warning",
        confirmButtonColor: "#ee99c9",
        cancelButtonColor: "red",
        showDenyButton: true,
        denyButtonText: "Actualizar todas",
      };
      handleClose();

      Swal.fire(configPopUp).then(async (result) => {
        if (result.isConfirmed) {
          requestData.events_recurrent_id = requestData.events_recurrent.data.id;
          updateAppointment(values.id, requestData)
            .then(() => {
              getAppointments();
              handleSuccess();
              formik.resetForm();

            })
            .catch((error) => {
              toast.error(
                "Error en la solicitud[HAZ CAPTURA]",
                JSON.stringify(error)
              );
            });
        } else if (
          result.isDenied &&
          formik.values.events_recurrent?.data?.id
        ) {
          const appointmentRecurentByID = await getAppointDataFullPaginate();
          requestData.events_recurrent_id =
            formik.values.events_recurrent?.data?.id;

          toast
            .promise(
              Promise.all(
                appointmentRecurentByID.map((appointment) => {
                  // Utiliza directamente la fecha y hora originales de cada cita
                  const updatedRequestData = {
                    ...requestData,
                    datetime_init: appointment.datetime_init, // Usa la fecha/hora de inicio original
                    datetime_end: appointment.datetime_end, // Usa la fecha/hora de fin original
                  };
                  // Llama a updateAppointment con el ID de la cita y los datos originales
                  return updateAppointment(appointment.id, updatedRequestData);
                })
              ),
              {
                pending: "Actualizando citas recurrentes...",
                success:
                  "Todas las citas/eventos recurrentes actualizados correctamente 👌",
                error: "Error al actualizar citas recurrentes 🤯",
              }
            )
            .then(() => {
              formik.resetForm();
              getAppointments(); // Actualiza la lista de citas después de la actualización exitosa
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
  });

  const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

  useEffect(() => {
    getAppointments();
  }, []);

  const getAppointDataFullPaginate = async () => {
    const response = await getAppointmentsData(selectAppointmetsUser);
    const totalPages = response.data.meta.pagination.pageCount;
    // Llama a la función para obtener todos los datos de las páginas restantes
    const additionalData = await fetchAdditionalPages(
      totalPages,
      formik.values.events_recurrent?.data?.id
    );

    // Combina todos los datos en un solo array
    const allAppointments = response.data.data.concat(
      ...additionalData.map((response) => response.data.data)
    );
    const filtrados = allAppointments.filter((elm) =>
      elm.attributes.user.includes("gmail")
    );
    const uniqueAppointments = removeDuplicates(filtrados);

    return uniqueAppointments;
  };

  /**
   * Get data appointments events
   */
  const getAppointments = async () => {
    try {
      if (selectAppointmetsUser) {
        const response = await getAppointmentsData(selectAppointmetsUser);
        const totalPages = response.data.meta.pagination.pageCount;
        // Llama a la función para obtener todos los datos de las páginas restantes
        const additionalData = await fetchAdditionalPages(totalPages);

        // Combina todos los datos en un solo array
        const allAppointments = response.data.data.concat(
          ...additionalData.map((response) => response.data.data)
        );
        const filtrados = allAppointments.filter((elm) =>
          elm.attributes.user.includes("gmail")
        );
        const uniqueAppointments = removeDuplicates(filtrados);

        const mappedAppointments = uniqueAppointments.map((appointment) => {
          const { id, attributes } = appointment;
          const {
            namePatient,
            datetime_init,
            datetime_end,
            services_nails,
            tel,
            observations,
            type,
            colour,
            status,
            events_recurrent,
          } = attributes;

          // Calcula la suma de los precios de todos los servicios
          const totalPrice = services_nails.data.reduce((sum, service) => {
            return sum + service.attributes.price;
          }, 0);

          return {
            id,
            namePatient,
            price: totalPrice,
            datetime_init,
            datetime_end,
            services: services_nails,
            tel: tel ?? null,
            observations,
            type,
            colour,
            status,
            events_recurrent,
          };
        });

        const patiendsMapp = mappedAppointments.reduce((acc, cita) => {
          const exists = acc.some(
            (item) =>
              item.label === cita.namePatient && item.telefono === cita.tel
          );
          if (!exists) {
            acc.push({
              label: cita.namePatient,
              telefono: cita.tel,
            });
          }
          return acc;
        }, []);

        setNamePatientsList(patiendsMapp);

        const calendarEvents = mappedAppointments.map((appointment) => {
          const {
            datetime_init,
            datetime_end,
            namePatient,
            price,
            tel,
            id,
            services,
            observations,
            colour,
            type,
            status,
            events_recurrent,
          } = appointment;
          const start = dayjs(datetime_init).toDate();
          const end = dayjs(datetime_end).toDate();
          return {
            start,
            end,
            tel,
            title: namePatient,
            services,
            observations,
            type,
            colour,
            events_recurrent,
            status,
            data: {
              x: price,
              y: id,
            },
          };
        });
        setCalendarEvents(calendarEvents);
        setLoadingEvents(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *
   * @param {*} allAppointments
   * @returns
   */
  const removeDuplicates = (allAppointments) => {
    const uniqueAppointments = [];
    const idSet = new Set();

    allAppointments.forEach((appointment) => {
      if (!idSet.has(appointment.id)) {
        uniqueAppointments.push(appointment);
        idSet.add(appointment.id);
      }
    });

    return uniqueAppointments;
  };

  /**
   *
   * @param {*} totalPages
   * @returns
   */
  const fetchAdditionalPages = async (totalPages, recurrent_id = null) => {
    const additionalDataPromises = [];

    for (let i = 1; i <= totalPages; i++) {
      if (recurrent_id) {
        additionalDataPromises.push(
          getAppointmentsData(
            selectAppointmetsUser,
            i,
            formik.values.events_recurrent?.data?.id
          )
        );
      } else {
        additionalDataPromises.push(
          getAppointmentsData(selectAppointmetsUser, i)
        );
      }
    }

    return Promise.all(additionalDataPromises);
  };

  useEffect(() => {
    getAppointments();
  }, [selectAppointmetsUser]);

  useEffect(() => {
    formik.setFieldValue("diasSeleccionados", []);
  }, [formik.values.recurrent_type]);

  /**
   * Select slot, and verify datetime
   */
  const onSelectSlot = useCallback((slotInfo) => {
    formik.setFieldValue("type", TYPES_EVENT.EVENTO_PERSONAL).then(() => {
      formik.setFieldValue("datetime_init", dayjs(slotInfo.start));
      formik.setFieldValue("datetime_end", dayjs(slotInfo.end));
      handleOpen();
    });
  }, []);

  const handleOpenEvent = () => {
    formik.setFieldValue("type", TYPES_EVENT.EVENTO_PERSONAL).then(() => {
      handleOpen();
    });
  };

  if (loadingEvents) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span>Cargando eventos...</span>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        marginTop: "1rem",
        marginBottom: "10rem",
        width: "98vw",
      }}
    >
      <ToastContainer />
      <MenuBarExpo />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          style={{
            margin: ".5rem 1rem 1rem 0",
            backgroundColor: "rgb(147, 227, 253)",
          }}
          onClick={handleOpenEvent}
        >
          <AddIcon />
        </Button>
        <Button
          variant="contained"
          style={{
            margin: ".5rem 1rem 1rem 0",
            backgroundColor: "rgb(147, 227, 253)",
          }}
          onClick={() => {
            window.location.reload();
          }}
        >
          <CachedIcon />
        </Button>
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
      </div>
      <Modal
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            variant="h4"
            style={{ marginBottom: ".5rem" }}
          >
            {formik.values.id
              ? `${
                  formik.values.type === TYPES_EVENT.EVENTO_PERSONAL
                    ? "Evento"
                    : "Cita"
                } `
              : `Crear ${
                  formik.values.type === TYPES_EVENT.EVENTO_PERSONAL
                    ? "Evento"
                    : "Cita"
                } `}
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
              <Autocomplete
                fullWidth
                id="namePatient"
                name="namePatient"
                value={formik.values.namePatient}
                onChange={(_, value) => {
                  const selectedPatient = namePatientsList.find(
                    (patient) => patient.label === value
                  );

                  formik.setFieldValue("namePatient", value);

                  if (selectedPatient) {
                    formik.setFieldValue("tel", selectedPatient.telefono);
                  } else {
                    formik.setFieldValue("tel", ""); // Si no hay coincidencia, puedes establecer un valor predeterminado o dejarlo en blanco
                  }
                }}
                freeSolo
                options={namePatientsList.map((option) => option.label)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    onChange={(e) => formik.handleChange(e)}
                    onBlur={(e) => formik.handleBlur(e)}
                    fullWidth
                    label={
                      formik.values.type !== TYPES_EVENT.EVENTO_PERSONAL
                        ? "Nombre/apellidos Paciente"
                        : "Evento"
                    }
                  />
                )}
              />
              {formik.values.type !== TYPES_EVENT.EVENTO_PERSONAL && (
                <TextField
                  style={{ width: "100%" }}
                  id="outlined-textarea"
                  label="Telefono"
                  placeholder="Teléfono"
                  multiline
                  name="tel"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.tel}
                  error={formik.touched.tel && Boolean(formik.errors.tel)}
                  helperText={formik.touched.tel && formik.errors.tel}
                />
              )}
              <TextField
                style={{ width: "100%" }}
                id="observations"
                label={
                  selectAppointmetsUser?.includes("test1")
                    ? "Observaciones"
                    : selectAppointmetsUser?.includes("test2")
                    ? "Notas"
                    : "Observaciones"
                }
                placeholder="..."
                multiline
                name="observations"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.observations}
                error={
                  formik.touched.observations &&
                  Boolean(formik.errors.observations)
                }
                helperText={
                  formik.touched.observations && formik.errors.observations
                }
              />

              <div style={{display: 'flex', gap: '.5rem'}}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es"
              >
                <div style={{display: 'flex', flexDirection: 'column'}}>
                <InputLabel
                  style={{ margin: ".3rem 0 .3rem .5rem" }}
                  id="demo-multiple-chip-label1123"
                >
                  Fecha/hora INICIO
                </InputLabel>

                <DateTimePicker
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} sx={{ width: "300px" }} />
                  )}
                  name="datetime_init"
                  value={formik.values.datetime_init}
                  onChange={(value) =>
                    formik.setFieldValue("datetime_init", value)
                  }
                  onBlur={formik.handleBlur}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                />
                {formik.touched.datetime_init &&
                  Boolean(formik.errors.datetime_init) && (
                    <div>{formik.errors.datetime_init}</div>
                  )}
                </div>
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es"
              >

<div style={{display: 'flex', flexDirection: 'column'}}>

                <InputLabel
                  style={{ margin: ".3rem 0 .3rem .5rem" }}
                  id="demo-multiple-chip-label11"
                >
                  Fecha/hora FIN
                </InputLabel>
                <DateTimePicker
                  // disabled
                  name="datetime_end"
                  value={formik.values.datetime_end}
                  onChange={(value) =>
                    formik.setFieldValue("datetime_end", value)
                  }
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.datetime_end &&
                  Boolean(formik.errors.datetime_end) && (
                    <div>{formik.errors.datetime_end}</div>
                  )}
</div>
              </LocalizationProvider>
              </div>

              {!formik.values.id && (
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.recurrent || false}
                        onChange={() =>
                          formik.setFieldValue(
                            "recurrent",
                            !formik.values.recurrent
                          )
                        }
                        defaultChecked={formik.values.recurrent}
                      />
                    }
                    label="¿Recurrente?"
                  />
                </FormGroup>
              )}

              {formik.values.recurrent && !formik.values.id && (
                <>
                  <Box sx={{ minWidth: 120, margin: 1 }} style={{}}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        ¿Cada cuanto?
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={formik.values.recurrent_type}
                        label="¿Cada cuanto?"
                        onChange={(value) => {
                          console.log(value.target.value);
                          formik.setFieldValue(
                            "recurrent_type",
                            value.target.value
                          );
                        }}
                      >
                        {TYPES_RECURRENTS.map((status, index) => {
                          return (
                            <MenuItem
                              key={`status_item_id__recurrent${index}`}
                              value={status}
                            >
                              {status}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Box>

                  {formik.values.recurrent_type !== TYPES_RECURRENTS[0] &&
                    !formik.values.id && (
                      <Box sx={{ minWidth: 120, margin: 1 }} style={{}}>
                        <FormControl fullWidth>
                          <InputLabel id="demo-simple-select-label">
                            ¿Qué días?
                          </InputLabel>
                          <Select
                            labelId="demo-multiple-chip-label"
                            id="demo-multiple-chip"
                            multiple
                            label="¿Qué días?"
                            value={formik.values.diasSeleccionados ?? []} // Asegúrate de que esto sea un arreglo
                            onChange={(event) => {
                              const {
                                target: { value },
                              } = event;
                              formik.setFieldValue(
                                "diasSeleccionados",
                                typeof value === "string"
                                  ? value.split(",")
                                  : value
                              );
                            }}
                            input={
                              <OutlinedInput
                                id="select-multiple-chip"
                                label="Chip"
                              />
                            }
                            renderValue={(selected) => (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {selected.map((value) => (
                                  <Chip key={value} label={value} />
                                ))}
                              </Box>
                            )}
                            // MenuProps y otros props...
                          >
                            {DAYS_RECURRENTS.map((name) => (
                              <MenuItem key={name} value={name}>
                                {name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                </>
              )}

              <Box sx={{ minWidth: 120, margin: 1 }} style={{}}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Estado</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={formik.values.status}
                    label="Estado"
                    onChange={(value) => {
                      console.log(value.target.value);
                      formik.setFieldValue("status", value.target.value);
                    }}
                  >
                    {STATUS_APPOINTMENTS.filter((statusFilter) => {
                      if (formik.values.type === TYPES_EVENT.EVENTO_PERSONAL) {
                        return statusFilter !== "Ausente"; // Filtrar todo lo que no sea "Ausente"
                      } else {
                        return true; // Si no es EVENTO_PERSONAL, conservar todos los elementos
                      }
                    }).map((status, index) => {
                      return (
                        <MenuItem
                          key={`status_item_id_${index}`}
                          value={status}
                        >
                          {status}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
              <div style={{ marginLeft: ".5rem", marginBottom: "1rem" }}>
                <InputLabel id="color_demo">Color</InputLabel>
                <input
                  type="color"
                  name="colour"
                  value={formik.values.colour}
                  onChange={formik.handleChange}
                />
              </div>

              <div style={{ display: "flex" }}>
                {formik.values.id &&
                  selectAppointmetsUser === JSON.parse(user).email && (
                    <Button
                      style={{ margin: ".3rem 0 .3rem .5rem" }}
                      variant="contained"
                      color="error"
                      onClick={() => {
                        formik.resetForm();
                        handleClose();
                        deleteEvent(formik.values.id);
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
                {selectAppointmetsUser === JSON.parse(user).email && (
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
                )}
              </div>
            </div>
          </Box>
        </Box>
      </Modal>

      {!loadingEvents && (
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          views={["month", "week", "day", "agenda"]}
          date={date}
          onNavigate={onNavigate}
          step={15}
          defaultDate={date}
          toolbar={true}
          // culture=
          popup={false}
          messages={{
            month: "Mes",
            day: "Día actual",
            today: "Día actual",
            week: "Semana",
            previous: "Anterior",
            next: "Siguiente",
            noEventsInRange: "No hay eventos en este periodo",
            date: "Día",
            time: "Rango horario",
            work_week: "Laboral",
            event: "Cliente",
            showMore: (total) => `+${total} más`,
          }}
          selectable
          defaultView="month"
          components={{
            event: MonthEvent,
          }}
          onSelectSlot={onSelectSlot}
          min={tenAM}
          max={nineThirtyPM}
          onSelectEvent={handleSelected}
          formats={{
            dayHeaderFormat: (date) => {
              return dayjs(date).format("DD/MM/YYYY");
            },
          }}
          eventPropGetter={(event) => {
            let newStyle = {
              backgroundColor: "#ee99c9",
              color: "black",
              borderRadius: "0px",
              border: "none",
            };
            newStyle.backgroundColor = event?.colour;
            return {
              className: "",
              style: newStyle,
            };
          }}
        />
      )}
    </div>
  );
};
