const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const router = express.Router();

// Example schema
const typeDefs = gql`
  type Transaction {
    id: ID!
    from: String!
    to: String!
    amount: Float!
    asset: String!
  }
  type Query {
    transactions(user: String!): [Transaction]
  }
`;

// Example resolvers
const resolvers = {
  Query: {
    transactions: async (_, { user }) => {
      // Replace with real data source!
      return [
        { id: 'tx1', from: user, to: 'bob', amount: 5.0, asset: 'PI' }
      ];
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
(async () => {
  await server.start();
  server.applyMiddleware({ app: router });
})();

module.exports = router;
