Server Side

JWT Authentication without firebase

> npm i express cors dotenv bcryptjs jsonwebtoken mongoose
 
> MONGODB_URI=mongodb+srv://<db-user>:<db-password>@cluster0.rjtqv.mongodb.net/todo_DB?retryWrites=true&w=majority&appName=Cluster0
 
> JWT_SECRET= genarte secret in this process:

 in vscode open terminal and type node hit enter

> require('crypto').randomBytes(64).toString('hex')

 copy the result and use it in JWT_SECRET
