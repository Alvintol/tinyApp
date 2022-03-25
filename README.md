# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product


!["Screenshot of URLs Page"](#)

!["Screenshot of Register Page"](#)

!["Screenshot of Error Page"](#)


## Dependencies

- Node.js : Server Environment
- Express : Framework
- EJS : Javascript Incorporated Template enabling
- bcrypt : Hashing for passwords
- body-parser : Middleware for parsing response bodies    
- cookie-session : Middleware for parsing cookies
- nodemon : Command-Line Interface to scan for file changes
- Mocha : Testing Framework 
- Chai : Testing Framework
- morgan : Middleware for Request logging


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

### Things to note

- Behaviour requirement titles(ie. GET /urls, POST /urls/:id) are searchable and commented above each route

- Random Button: Hidden next to register button on navbar. Becuase why not. You were adventurous enough to try and find a page that doesnt exist. Why not randomly go somewhere that does?