const express = require("express");
const app = express();
const { ApolloServer } = require("apollo-server-express");
const { graphqlUploadExpress } = require("graphql-upload");
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} = require("apollo-server-core");
const http = require("http");
const mongoose = require("mongoose");
const { verify } = require("jsonwebtoken");

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const dataLoaders = require("./dataLoaders");

const PORT = 5050;

async function startApolloServer(typeDefs, resolvers, port) {
    try {
      app.use(cors({
        origin: '*',
      }));
      app.use(bodyParser.json({ limit: "50mb" }));
      app.use(express.json());
      app.use(cookieParser());
      app.use(graphqlUploadExpress());
      app.use((req, _, next) => {
        const authHeader = req.headers["authorization"];
        const accessToken = authHeader && authHeader.split(" ")[1];
        try {
          const data = verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  
          req.userId = data;
        } catch (err) {
          console.error(err);
        }
        next();
      });
      const httpServer = http.createServer(app);
      const db = await mongoose.connect(process.env.DATABASE_URI);
      const server = new ApolloServer({
        typeDefs,
        resolvers,        
        context: ({ req, res }) => ({
          req,
          res,
          ...dataLoaders,
          db
        }),
        plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer }),
          process.env.NODE_ENV === "production"
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageGraphQLPlayground(),
        ],
      });
      await server.start();
      server.applyMiddleware({ app });
      await new Promise((resolve) => httpServer.listen({ port: port }, resolve));
      console.log(
        `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
      );
    } catch (err) {
      console.log(err);
    }
  }

  startApolloServer(typeDefs, resolvers, PORT);