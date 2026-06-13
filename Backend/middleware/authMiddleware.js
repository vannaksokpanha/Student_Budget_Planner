const jwt = require('jsonwebtoken');

    const verifyToken = (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(403).json({ message: "No Token Provided" });
        }

        const token = authHeader.split(' ')[1]; 

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify toekn= jwt because use jwt to checck and it can verify the exp token
        req.user = decoded;  //  saves the user data (id, email) from the JWT token onto the req object so your route handlers can use it.
        // it's like idk
        next();
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Token expired" });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Server error" });
      }
    };

    module.exports = verifyToken;