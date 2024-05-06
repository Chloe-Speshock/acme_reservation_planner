const {
  client,
  createTables,
  fetchUsers,
  fetchPlaces,
  createUser,
  createPlace,
  createVacation,
  fetchVacations,
  destroyVacation,
} = require("./db");

const express = require("express");
const app = express();

app.use(express.json());
app.use(require("morgan")("dev"));

app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});

app.get("/api/places", async (req, res, next) => {
  try {
    res.send(await fetchPlaces());
  } catch (error) {
    next(error);
  }
});

app.get("/api/vacations", async (req, res, next) => {
  try {
    res.send(await fetchVacations());
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users:user_id/vacations/:id", async (req, res, next) => {
  try {
    await destroyVacation({ user_id: req.params.user_id, id: req.params.id });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.post("/api/users/:user_id/vacations", async (req, res, next) => {
  try {
    res.status(201).send(
      await createVacation({
        user_id: req.params.user_id,
        place_id: req.body.place_id,
        depatrure_date: req.body.departure_date,
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

  const [moe, lucy, larry, ethyl, paris, london, nyc] = await Promise.all([
    createUser({ name: "moe" }),
    createUser({ name: "lucy" }),
    createUser({ name: "larry" }),
    createUser({ name: "ethyl" }),
    createPlace({ name: "paris" }),
    createPlace({ name: "london" }),
    createPlace({ name: "nyc" }),
  ]);

  console.log("data seeded");

  console.log(await fetchUsers());
  console.log(await fetchPlaces());

  const [vacation, vacation2] = await Promise.all([
    createVacation({
      user_id: moe.id,
      place_id: nyc.id,
      departure_date: "02/24/2024",
    }),
    createVacation({
      user_id: moe.id,
      place_id: nyc.id,
      departure_date: "02/28/2024",
    }),
  ]);
  console.log("vacations created");
  console.log(await fetchVacations());

  await destroyVacation({ id: vacation.id, user_id: vacation.user_id });

  console.log(await fetchVacations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
