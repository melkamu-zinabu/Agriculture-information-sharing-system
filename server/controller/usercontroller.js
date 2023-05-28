import bcrypt from 'bcryptjs'
import validator from "validator"
//login secretkey..
//to register user

  export const register= async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Validate password format
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character',
      });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

    //this is how we handle it in the front end
    //in the frontend code when we post data or when we register
    //const response = await post('/.....
    //1. If the response status is within the range of 200-299 (indicating a successful response),
    // you can access the message property in the result object to get the success message (result.msg).
    //2. If the response status is outside of that range, indicating an error response,
    // you can access the error property in the result object to get the error message (result.error).
    // const result = await response.json();
    // try {
    //     const response = await post('/api/register', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify(data)
    //     });
    
    //     const result = await response.json();
    
    //     if (response.ok) {
    //       console.log(result.message);
    //       // Handle successful registration
    //     } else {
    //       console.error(result.error);
    //       // Display error message to the user or perform error handling
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     // Handle network or server errors
    //   }
    
  export const getAllUsers = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      const users = await User.find({})
        .select("-password")
        .skip(skip)
        .limit(limit);
  //exclude users pw
      const count = await User.countDocuments({});
  
      res.status(200).json({
        success: true,
        users,
        count,
        message: "List of users",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "An error occurred while fetching the users." });
    }
  };
  
  
  export const removeAccount = async (req, res) => {
    try {
      const { id: userId } = req.params;
      const user = await User.findOneAndRemove({ _id: userId });
  
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: `No user with id: ${userId} found.`,
        });
      }
  
      res.status(200).json({ success: true, msg: "Successfully deleted." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, msg: "An error occurred while deleting the account." });
    }
  };
  

  export const updateAccount = async (req, res) => {
    try {
      const { name, email, role } = req.body;
  
      if (!name || !email || !role) {
        return res.status(400).json({ success: false, msg: "Please provide name, email, and role." });
      }
  
      const user = await User.findOneAndUpdate(
        { _id: req.user.Id },
        { name, email, role },
        { runValidators: true, new: true }
      );
  
      if (!user) {
        return res.status(400).json({ success: false, msg: "Unable to update the account." });
      }
  
      res.status(200).json({ success: true, msg: "Account updated successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, msg: "An error occurred while updating the account." });
    }
  };
  

 
 export const login = async (req, res) => {
    const { password, email } = req.body;
  
    // Validate the request parameters
    if (!password || !email) {
      return res.status(400).json({ success: false, msg: "Please provide the email and password." });
    }
  
    try {
      // Find the user based on the provided email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, msg: "Invalid credentials." });
      }
  
      // Compare the provided password with the stored password hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, msg: "Incorrect password." });
      }
  
      // Generate a JWT token with the user ID as the payload
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
       // Save the token to the user's tokens array
      user.tokens.push({ token });

     // Save the updated user document
      await user.save();
      res.status(201).json({ success: true, token, msg: "Logged in successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, msg: "An error occurred while logging in." });
    }
  };
  

 export const changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  // Validate the request parameters
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    throw new Error(
      "Please provide the old password, new password, and confirm new password."
    );
  }

  if (newPassword !== confirmNewPassword) {
    throw new Error("The new password and confirm new password do not match.");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(newPassword)) {
    throw new Error(
      "The new password should contain at least one uppercase letter, one lowercase letter, one digit, and one special symbol. It should be at least 8 characters long."
    );
  }

  try {
    // Retrieve the user's data from the database
    const user = await User.findById(req.user.Id);
    if (!user) {
      throw new Error(`No user with id: ${req.user.Id} found.`);
    }

    // Verify that the old password matches the password stored in the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("The old password is incorrect.");
    }

    // Hash and update the user's password with the new password in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, msg: "Password successfully updated." });
  } catch (error) {
    // Handle any database or server errors
    console.error(error);
    res.status(500).json({ success: false, msg: "An error occurred while changing the password." });
  }
};


 


  // export const updaterole = async function

  // export logout // Assuming you have the necessary imports and setup

  
  // app.post('/api/logout', authenticate,
// Logout route
  export const logout =async (req, res) => {
    try {
      // Remove the current token from the user's tokens array
      //req.token , token is added in the req, in the middleware of authenticate look in route
      req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
  
      // Save the updated user document
      await req.user.save();
  
      res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  };
  //the font end code for logout
  // import React from 'react';

// function Logout() {
//   const handleLogout = async () => {
//     try {
//       // Send a request to the backend to logout
//       const response = await fetch('/api/logout', {
//         method: 'POST',
//         credentials: 'include',
//       });

//       if (response.ok) {
//         // Successful logout
//         // Redirect the user to the login page or perform any other necessary actions
//         window.location.href = '/login';
//       } else {
//         // Failed logout
//         // Handle the error or display an error message
//         console.error('Logout failed');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   return (
//     <button onClick={handleLogout}>
//       Logout
//     </button>
//   );
// }

// export default Logout;


 // export const forgetpassword = async function

//  font end code


const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resetStatus, setResetStatus] = useState('');

  const handleSendEmail = async (e) => {
    e.preventDefault();

    try {
      // Make an API call to send the reset email
      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
        setResetStatus('Email sent. Please check your inbox for further instructions.');
      } else {
        const errorData = await response.json();
        setResetStatus(errorData.message);
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
      setResetStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {!emailSent ? (
        <form onSubmit={handleSendEmail}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send Reset Email</button>
        </form>
      ) : (
        <p>{resetStatus}</p>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordPage = () => {
  const { token, email } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState(null);
  const history = useHistory();

  useEffect(() => {
    // You can perform any necessary actions here with the token and email values,
    // such as pre-filling form fields or validating the token.

    console.log('Token:', token);
    console.log('Email:', email);
  }, [token, email]);

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/reset-password', {
        email,
        newPassword,
        resetToken: token,
      });
      setResetStatus(response.data.message);
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetStatus('Failed to reset password.');
    }
  };

  const handleGoBack = () => {
    history.push('/login'); // Redirect to the login page after password reset
  };

  return (
    <div>
      <h1>Reset Password</h1>
      {resetStatus ? (
        <div>
          <p>{resetStatus}</p>
          <button onClick={handleGoBack}>Go Back to Login</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>New Password:</label>
          <input type="password" value={newPassword} onChange={handlePasswordChange} />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};



const App = () => {
  return (
    <Router>
      <Switch>
        {/* Other routes */}
        <Route path="/reset-password/:token" component={ResetPasswordPage} />
      </Switch>
    </Router>
  );
};


// api
// Define User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: Date,
});
// Endpoint to handle sending the reset email
app.post('/api/send-reset-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a reset token and expiration
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour

    // Update the user with the reset token and expiration
    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    // Send the reset email
    const transporter = nodemailer.createTransport({
      // Configure your email provider details
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click on the following link to reset your password: http://your-website.com/reset-password?token=${resetToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending reset email:', error);
        return res.status(500).json({ message: 'Failed to send reset email.' });
      }
      console.log('Reset email sent:', info.response);
      return res.status(200).json({ message: 'Reset email sent successfully.' });
    });
  } catch (error) {
    console.error('Error sending reset email:', error);
    return res.status(500).json({ message: 'Failed to send reset email.' });
  }
});

// Endpoint to handle resetting the password
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email and valid reset token
    const user = await User.findOne({
      email,
      resetToken: req.body.resetToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired reset token.' });
    }

    // Update the user's password
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
});

