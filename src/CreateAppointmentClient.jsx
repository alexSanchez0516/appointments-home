import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  DateTimePicker,
  LocalizationProvider,
  renderTimeViewClock,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createAppointment,
  getAppointmentsData,
  getServices,
} from "./Services/services";

export const CreateAppointmentClient = () => {
  const [services, setServices] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const initialValues = {
    id: null,
    namePatient: "",
    datetime_init: dayjs(), // Usa dayjs para obtener la fecha actual
    datetime_end: dayjs(),
    complete: false,
    user: "client",
    tel: "",
    observations: "",
    services_nails: [],
  };

  /**
   * Check colision events
   * @param {*} datetimeStart
   * @param {*} datetimeEnd
   * @param {*} calendarEvents
   * @returns boolean
   */
  const hasCollision = (datetimeStart, datetimeEnd, calendarEvents) => {
    const datetimeEndDayjs = dayjs(datetimeEnd);
    const datetimeStartDayjs = dayjs(datetimeStart);

    return calendarEvents.some((event) => {
      const eventStart = dayjs(event.start);
      const eventEnd = dayjs(event.end);

      // Verificar si el intervalo de tiempo se superpone con el evento del mismo día
      const isSameDay =
        datetimeStartDayjs.isSame(eventStart, "day") &&
        datetimeEndDayjs.isSame(eventEnd, "day");
      const isOverlapping =
        isSameDay &&
        ((datetimeStartDayjs.isAfter(eventStart) &&
          datetimeStartDayjs.isBefore(eventEnd)) ||
          (datetimeEndDayjs.isAfter(eventStart) &&
            datetimeEndDayjs.isBefore(eventEnd)) ||
          (datetimeStartDayjs.isBefore(eventStart) &&
            datetimeEndDayjs.isAfter(eventEnd)));

      return isOverlapping;
    });
  };

  /**
   * Get data appointments events
   */
  const getAppointments = async () => {
    try {
      const response = await getAppointmentsData();

      const mappedAppointments = response.data.data
        // .filter((item) => item.attributes.user === selectAppointmetsUser)
        .map((appointment) => {
          const { id, attributes } = appointment;
          const {
            namePatient,
            datetime_init,
            datetime_end,
            services_nails,
            tel,
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
          };
        });

      const calendarEvents = mappedAppointments.map((appointment) => {
        const {
          datetime_init,
          datetime_end,
          namePatient,
          price,
          tel,
          id,
          services,
        } = appointment;
        const start = dayjs(datetime_init).toDate();
        const end = dayjs(datetime_end).toDate();

        return {
          start,
          end,
          tel,
          title: namePatient,
          services,
          data: {
            x: price, // Puedes ajustar esto según tus necesidades
            y: id,
          },
        };
      });
      setCalendarEvents(calendarEvents);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *
   * @param {*} values formik
   * @returns
   */
  const onSubmit = (values) => {
    if (checkDataFormValues(values)) {
      toast.error("Faltan campos por rellenar");
      return;
    }

    // Verifica que las fechas tengan el formato correcto
    const formattedDatetimeInit = dayjs(values.datetime_init).toISOString();
    const formattedDatetimeEnd = dayjs(values.datetime_end).toISOString();

    // Verifica que cada servicio tenga un ID antes de mapear
    const validServicesNails = values.services_nails.filter(
      (service) => service.id
    );
    const serviceIds = validServicesNails.map((service) => service.id);
    // Crea la solicitud con los datos formateados
    const requestData = {
      namePatient: values.namePatient,
      datetime_init: formattedDatetimeInit,
      complete: false,
      datetime_end: formattedDatetimeEnd,
      user: values.user,
      tel: values.tel,
      services_nails: serviceIds,
    };

    // Define la función para manejar el éxito de la solicitud
    const handleSuccess = () => {
      const successMessage = values.id
        ? "Cita actualizada correctamente"
        : "Cita creada correctamente";

      toast.success(successMessage);
      formik.resetForm();
    };

    // if (!hasCollision) {}
    createAppointment(requestData)
      .then(handleSuccess)
      .catch((error) => {
        toast.error(
          "Error en la solicitud, inténtalo más tarde",
          JSON.stringify(error)
        );
      });
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
  });

  /**
   * check values min for submit
   * @param {*} values formik
   * @returns boolean
   */
  const checkDataFormValues = (values) => {
    return (
      !values.namePatient ||
      values.services_nails.length === 0 ||
      !values.datetime_init ||
      !values.datetime_end
    );
  };

  useEffect(() => {
    //   getAppointments();
    getServices().then(({ data }) => {
      const mappedData = data.data
        // .filter((item) => item.attributes.user === selectAppointmetsUser)
        .map(({ id, attributes }) => {
          const { name, price, duration } = attributes;
          return { id, name, price, duration };
        });
      setServices(mappedData);
    });
  }, []);

  return (
    <div>
      <ToastContainer />

      <Box style={{ width: "95%" }}>
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
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                alt="LOGOTIPO"
                onClick={() => {
                  window.location.href("/citas");
                }}
                width={"200"}
                src="/src/assets/logo.png"
              ></img>
            </div>
            <Typography
              variant="h5"
              style={{
                marginBottom: ".5rem",
                marginTop: ".5rem",
                marginLeft: ".5rem",
              }}
            >
              Crear cita
            </Typography>
            <TextField
              fullWidth
              id="namePatient"
              label="Nombre y apellidos"
              name="namePatient"
              onBlur={formik.handleBlur}
              multiline
              value={formik.values.namePatient}
              error={
                formik.touched.namePatient && Boolean(formik.errors.namePatient)
              }
              helperText={
                formik.touched.namePatient && formik.errors.namePatient
              }
              onChange={formik.handleChange}
            />
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
            <FormControl sx={{ m: 1, width: "100%" }}>
              <InputLabel id="demo-multiple-chip-label">Servicios</InputLabel>
              <Select
                labelId="demo-multiple-chip-label"
                id="demo-multiple-chip"
                multiple
                value={formik.values.services_nails}
                onChange={(event) => {
                  formik.handleChange(event);
                  const selectedIds = event.target.value;
                  formik.setFieldValue("services_nails", selectedIds);
                }}
                input={
                  <OutlinedInput id="select-multiple-chip" label="Servicios" />
                }
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value.id} label={value.name} />
                    ))}
                  </Box>
                )}
              >
                {services.map((service) => (
                  <MenuItem key={service.id} value={service}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <InputLabel
                style={{ margin: ".3rem 0 .3rem .5rem" }}
                id="demo-multiple-chip-label1123"
              >
                Fecha/hora
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
            </LocalizationProvider>

            <TextField
              style={{ width: "100%" }}
              id="outlined-textarea"
              label="Observaciones"
              placeholder="observations"
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

            <div style={{ display: "flex", justifyContent: "end" }}>
              <Button
                style={{
                  margin: ".3rem .5rem .3rem .5rem",
                  backgroundColor: "#ee99c9",
                  alignSelf: "end",
                }}
                variant="contained"
                type="submit"
              >
                Crear Cita
              </Button>
            </div>
          </div>
        </Box>
      </Box>
    </div>
  );
};
