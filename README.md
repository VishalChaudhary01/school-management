## This is a simple School Management Platform built with Next.js and MySQL.

It currently includes two main features:

- Add School – A form to add new schools to the database.
- View Schools – A page that lists all schools in a card-style layout with their details.

## Step - 2: OTP-Based Sign-In Feature

I have successfully implemented an **OTP-based sign-in feature** in this project using **NextAuth**.  

### Authentication Setup
- **NextAuth** provides several features for authentication in Next.js projects.  
- I have used **Email Credentials Provider** to verify emails.  
- OTPs are sent using **Resend**.  
- Since I don’t have a domain right now, I have tested this feature locally only. (Resend requires a custom domain to send emails to external users.)  

###  Client-Side
- Used **NextAuth session** to check if a user is logged in or not.  
- If a session exists:
  - Show button to **Add School**, **Logout**.  
- If a session does not exist:
  - Show only the **list of schools** and a **Login** button.  

### Server-Side
- Used **getServerSession** for API-based authentication.  
- If a session has a user → allow access to the protected route.  
- If no user → return **Unauthorized User** error.  

---

Thank you once again for reviewing my project.  
I’ll be waiting for the next round — and please let me know if you’d like me to implement any additional features.  
