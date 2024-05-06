const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  createReservation,
  destroyReservation,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (error) {
    next(error);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (error) {
    next(error);
  }
});

app.delete(
  "/api/customers:customer_id/reservations/:id",
  async (req, res, next) => {
    try {
      await destroyReservation({
        customer_id: req.params.customer_id,
        id: req.params.id,
      });
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createReservation({
        customer_id: req.params.customer_id,
        restaurant_id: req.body.restaurant_id,
        reservation_date: req.body.reservation_date,
        party_count: req.body.party_count,
      })
    );
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();

  await createTables();
  console.log("tables created");

  const [
    Regina,
    Rebeccany,
    Crumbantha,
    Julio,
    Vincent,
    LittleBadWolf,
    BarRoma,
  ] = await Promise.all([
    createCustomer({ name: "Regina" }),
    createCustomer({ name: "Rebeccany" }),
    createCustomer({ name: "Crumbantha" }),
    createCustomer({ name: "Julio" }),
    createRestaurant({ name: "Vincent" }),
    createRestaurant({ name: "Little Bad Wolf" }),
    createRestaurant({ name: "Bar Roma" }),
  ]);

  console.log("data seeded");

  const [Reservation] = await Promise.all([
    createReservation({
      customer_id: Regina.id,
      restaurant_id: LittleBadWolf.id,
      party_count: 4,
      reservation_date: "05/08/2024",
    }),
    createReservation({
      customer_id: Rebeccany.id,
      restaurant_id: Vincent.id,
      party_count: 2,
      reservation_date: "05/09/2024",
    }),
    createReservation({
      customer_id: Crumbantha.id,
      restaurant_id: BarRoma.id,
      party_count: 8,
      reservation_date: "05/20/2024",
    }),
  ]);

  await destroyReservation({
    id: Reservation.id,
    customer_id: Reservation.customer_id,
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
