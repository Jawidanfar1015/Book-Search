const { AuthenticationError } = require("apollo-server-express")
const { signToken } = require("../utils/auth")
const { User } = require("../models")

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select("-__v -password")
                return userData;
            }
            throw new AuthenticationError("You need to be logged in!");
        }
    },

    Mutation: {
        addUser: async (parent, args, context) => {
            const user = await User.create(args);
            const token = await signToken(user);
            return { user, token };
        },

        login: async (parent, {email, password}, context) => {
            const user = await User.findOne({ email }); 

            if (!user) {
                throw new AuthenticationError("No user found!");
            }

            const correctPass = await user.isCorrectPassword(password);

            if (!correctPass ) {
                throw new AuthenticationError("Incorrect Credentials");
            }

            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: { newBook }}},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You need to be logged in")
        },

        removeBook: async (parent, { bookId }, context ) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId }}},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You need to be logged in ");
        }   
    }
}

module.exports = resolvers;
