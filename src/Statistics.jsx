/* eslint-disable react-hooks/exhaustive-deps */
import Chart from "react-apexcharts";
import { MenuBarExpo } from "./Components/DataGrid/Menu/Menu";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getAppointmentsData } from "./Services/services";
import moment from "moment";
import { Button } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
moment.locale("es");

export const Statistics = () => {
  const user = localStorage.getItem("user");
  const [selectAppointmetsUser] = useState(JSON.parse(user).email);
  const currentMonth = moment().month();
  const allMonths = Array.from({ length: 13 }, (_, i) => i);
  const monthNames = allMonths.map((month) =>
    moment(month, "M").format("MMMM")
  );
  const [dataByMonth, setDataByMonth] = useState([]);
  const [filterAll, setFilterAll] = useState(true);
  const months = monthNames.slice(1);
  const options = {
    chart: {
      id: "basic-bar",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 380,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    xaxis: {
      categories: months,
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return value + "€";
        },
      },
    },
  };

  const series = [
    {
      name: "La platicaaa ",
      data: dataByMonth,
    },
  ];

  /**
   * Get data appointments events
   */
  const getAppointments = async () => {
    try {
      const response = await getAppointmentsData();

      const totalPages = response.data.meta.pagination.pageCount;
      // Llama a la función para obtener todos los datos de las páginas restantes
      const additionalData = await fetchAdditionalPages(totalPages);

      // Combina todos los datos en un solo array
      const allAppointments = response.data.data.concat(
        ...additionalData.map((response) => response.data.data)
      );

      const uniqueAppointments = removeDuplicates(allAppointments);

      const mappedAppointments = uniqueAppointments
        .filter((item) => item.attributes.user === selectAppointmetsUser)
        .map((appointment) => {
          const { id, attributes } = appointment;
          const {
            namePatient,
            datetime_init,
            datetime_end,
            services_nails,
            tel,
            observations,
            type,
            status,
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
            status,
          };
        });

      const currentYear = new Date().getFullYear();
      let appointmentsThisYear = mappedAppointments.filter((appointment) => {
        const appointmentYear = new Date(
          appointment.datetime_init
        ).getFullYear();
        return appointmentYear === currentYear && appointment?.type === 2;
      });

      if (!filterAll) {
        console.log("entraaa ");
        appointmentsThisYear = appointmentsThisYear.filter(
          (appointment) => appointment.status === "Completada"
        );
      }

      const appointmentsByMonth = appointmentsThisYear.reduce(
        (acc, appointment) => {
          const month = new Date(appointment.datetime_init).getMonth() + 1;
          acc[month] = acc[month] || [];
          acc[month].push(appointment);
          return acc;
        },
        {}
      );

      const monthlyPrices = Object.entries(appointmentsByMonth).reduce(
        (acc, [month, appointments]) => {
          for (let i = 1; i <= 12; i++) {
            if (!acc[i.toString()]) {
              acc[i.toString()] = 0;
            }
          }

          if (appointments.length > 0) {
            acc[month] = appointments.reduce((sum, appointment) => {
              return (
                sum +
                appointment.services.data.reduce((serviceSum, service) => {
                  return serviceSum + service.attributes.price;
                }, 0)
              );
            }, 0);
          }
          return acc;
        },
        {}
      );

      setDataByMonth(Object.values(monthlyPrices));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  useEffect(() => {
    getAppointments();
  }, [filterAll]);

  /**
   *
   * @param {*} totalPages
   * @returns
   */
  const fetchAdditionalPages = async (totalPages) => {
    const additionalDataPromises = [];

    for (let i = 1; i <= totalPages; i++) {
      additionalDataPromises.push(getAppointmentsData(i));
    }

    return Promise.all(additionalDataPromises);
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

  return (
    <div className="app">
      <MenuBarExpo />
      <Typography variant="h4" style={{ margin: "1rem", textAlign: "center" }}>
        Estadísticas
      </Typography>

      <Button
        variant="contained"
        style={{ margin: ".5rem 1rem 1rem 0", backgroundColor: "#ee99c9" }}
        onClick={() => setFilterAll(!filterAll)}
      >
        {filterAll ? "Contabilizar por citas confirmadas" : "Contabilizar todo"}
      </Button>

      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Beneficios {moment(currentMonth + 1, "M").format("MMMM")} :{" "}
            {dataByMonth[currentMonth]} {" €"}
          </Typography>
        </CardContent>
      </Card>
      <div>
        <Typography variant="h5" style={{ margin: "1rem" }}>
          Ganancias año actual
        </Typography>
        <Chart options={options} series={series} type="bar" width="500" />
      </div>
    </div>
  );
};
