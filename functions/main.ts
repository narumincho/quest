import * as functions from "firebase-functions";

export const main = functions.https.onRequest((request, response) => {
  response.send("ok");
});
