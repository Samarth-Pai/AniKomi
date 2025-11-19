import NextAuth from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import GithubProvider from 'next-auth/providers/github'
import clientPromise from '@/app/lib/mongodb'
import CredentialsProvider from 'next-auth/providers/credentials'
import { headers } from 'next/headers'

const createUserOauth = async (userDict) => {
  const username = userDict.name.replace(" ", "_").toLowerCase()
  const client = await clientPromise
  const db = await client.db("anikomi")
  const users = await db.collection("users")
  console.log("colle", users)
  // const userResult = await users.findOne({"username": username})
  await users.insertOne({
    username: username,
    name: userDict.name,
    email: userDict.email,
    password: '',
    oauth: true,
    friends: [],
    image: userDict.image
  })
  console.log("Added successful")
}

const createUserManual = async (userDict) => {
  const client = await clientPromise
  const db = await client.db("anikomi")
  const users = await db.collection("users")
  // const userResult = await users.findOne({email: userDict.email})
  await users.insertOne({
    username: userDict.username,
    name: userDict.name,
    email: userDict.email,
    password: userDict.password,
    oauth: false,
    friends: [],
  })
}

export const authOptions = {
  providers: [
    // OAuth authentication providers...  
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // })
    // Passwordless / email sign in
    //   EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD
    //     }
    //   },
    //   from: process.env.EMAIL_FROM
    // }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      id: "signup",
      name: "signup",
      type: 'credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      // credentials: {
      //   username: { label: "Username", type: "text", },
      //   password: { label: "Password", type: "password" },
      //   email: { label: "Email", type: "email"},
      //   name: { label: "Name", type: "text"}
      // },
      
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = {
          name: credentials.name,
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
        }

        const myHeaders = new Headers();
        myHeaders.append("usernameEmail", user.name);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };

        const userExistsReq = await fetch("/api/userExists", requestOptions)
        const userExists = await userExistsReq.json()
        console.log(userExists)
        if(userExists.message == false){
          await createUserManual(user)
          return user;
        }
        return null;
      }
    }),
    CredentialsProvider({
      id: "login",
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "login",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      // credentials: {
      //   username: { label: "Username", type: "text", },
      //   password: { label: "Password", type: "password" },
      //   email: { label: "Email", type: "email"},
      //   name: { label: "Name", type: "text"}
      // },
      credentials: {},
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        
        const myHeaders2 = new Headers();
        console.log(credentials)
        myHeaders2.append("usernameemail", credentials.usernameEmail);
        myHeaders2.append("password", credentials.password);
        
        // const requestOptions2 = {
        //   method: "GET",
        //   headers: myHeaders2,
        //   redirect: "follow"
        // };
        const requestOptions = {
            method: "GET",
            headers: myHeaders2,
            redirect: "follow"
        };
        
        console.log("Inside login authorize", myHeaders2)
        const host = headers().get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'; // Adjust based on your environment
        const baseUrl = `${protocol}://${host}`;
        const userPasswordExistsReq = await fetch(baseUrl + "/api/userPasswordExists", requestOptions)
        const userPasswordExists = await userPasswordExistsReq.json();
        console.log("Done echking")
        console.log("show: ", userPasswordExists)
        if(userPasswordExists.message && !userPasswordExists.oauth){
          console.log("Found it seems...")
          const myHeaders = new Headers();
          myHeaders.append("email", userPasswordExists.email);

          const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
          };

          console.log("Entering final arc...")
          const host = headers().get('host');
          const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'; // Adjust based on your environment
          const baseUrl = `${protocol}://${host}`;
          const userReq = await fetch(baseUrl + "/api/getUser", requestOptions)
          const user = await userReq.json()
          console.log("Final arc", user)
          return user
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // This callback is triggered after a successful sign-in.
      // You can add logic here to identify if it's a new signup
      // and perform actions accordingly.
      console.log("autho")
      console.log("user", user)

      if (account.provider == "google") {
        const myHeaders = new Headers();
        myHeaders.append("usernameEmail", user.email);
        myHeaders.append("oauth", true);

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };
        console.log("Trying to request...");
        const host = headers().get('host');
        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'; // Adjust based on your environment
        const baseUrl = `${protocol}://${host}`;

        const userExistsReq = await fetch(baseUrl + "/api/userExists", requestOptions)
        const userExists = await userExistsReq.json()
        console.log("userEcists", userExists)
        if(!userExists.message && userExists.oauth){
          await createUserOauth(user);
        }
      }
      else{
        console.log(user)
      }

      // Example: Check if the user is new and perform specific actions
      // if (isNewUser(user)) { // Implement isNewUser logic based on your database
      //   await performNewUserSetup(user);
      // }

      return true; // Return true to allow sign-in, false to deny
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }