
import NextAuth, { getServerSession } from "next-auth/next";
import CredentialsProvider  from "next-auth/providers/credentials";
import { mongooseConnect } from "@/lib/mongoose";
import { User } from "@/models/User"
import bcrypt from 'bcryptjs'
export const authOptions = {
    providers:[
        CredentialsProvider({
            name: 'Credentials',
            id:"credentials",
            credentials: {
                email:{label: "Email", type:"text",placeholder:"jsmith"},
                password: {label: "Password", type:"password", placeholder:"******"}
            },
            async authorize(credentials) {
                await mongooseConnect()
                
                const userFound = await User.findOne({email:credentials?.email}).select("+password")                                
                if(!userFound) throw new Error("El correo electrónico ingresado no existe")
                const passwordMatch = await bcrypt.compare(credentials.password, userFound.password)
                if(!passwordMatch) throw new Error("La contraseña es incorrecta")

               
                return userFound;
            }
        })
    ],
     
    callbacks:{
        jwt({account, token, user,profile, session}){
            if(user) token.user=user
            console.log(user)
            return token
        },
        session({session,token}){
            session.user = token.user
            console.log(session)
            return session
        }

    },
    secret:process.env.NEXTAUTH_SECRET,  
    pages:{
        signIn:"/login"        
    }
}

export default NextAuth(authOptions)