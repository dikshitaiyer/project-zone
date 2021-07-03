const UserModel = require("./../db/schema/User");
const Project = require('../db/schema/projectSchema');
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utills/sendMail");

const maxage = 3 * 24 * 60 * 60;
const createwebToken = (id) =>
{
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxage,
  });
};

exports.profile = async (req, res) =>
{
  const { userid } = req;
  try
  {
    const user = await UserModel.findById(userid);
    return res.status(200).json(user);
  } catch (err)
  {
    // console.log(err);
    res.status(500).json({ error: "500 Internal Error" });
  }
};

exports.UserDashboard = async (req, res) =>
{
  const { userid } = req;
  try
  {
    const user = await UserModel.findById(userid);
    return res.status(200).json(user.profile);
  } catch (err)
  {
    // console.log(err);
    return res.status(500).json({ error: "500 Internal Error" });
  }
};

exports.UpdateUserDashbaord = async (req, res) =>
{
  const { userid } = req;
  const { data } = req.body;
  try
  {
    UserModel.findByIdAndUpdate(
      userid,
      data,
      { new: true },
      function (err, doc)
      {
        if (err)
        {
          // console.log(err);
          return res.status(500).json({ error: "NO user with such id" });
        } else
        {
          // console.log(doc);
          return res.status(200).json(doc.profile);
        }
      }
    );
  } catch (err)
  {
    // console.log(err);
    return res.status(500).json({ error: "500 Internal Error" });
  }
};

exports.sendemail = async (req, res) =>
{
  const { email } = req.body;
  try
  {
    const user = await UserModel.findOne({ email: email });
    if (user)
    {
      const id = user._id;
      const token = jwt.sign(
        { id },
        process.env.ACCESS_TOKEN_SECRET_FOREGTPASS,
        { expiresIn: "10m" }
      );
      // const link_prod = `${req.protocol}://${req.hostname}/project-zone/forget-password/${token}`;

      /* Above link will be used when client-side is fully deployed, if we are running client-side on local host 
      then link below will be sent as email */

      const link = `${ req.protocol }://${ req.hostname }:3000/project-zone/forget-password/${ token }`;

      const content = `<h2 style={{textAlign ="center"}}>Project-zone account Forget password link</h2>
      
      Dear ${ user.firstname }, please click on following link to reset your password

      <p style={{textAlign ="center"}}><a href=${ link }>${ link }</a></p>
      
      Thank you`;

      await sendEmail(
        email,
        "Projetzone account forget passsword link",
        content
      );

      UserModel.findByIdAndUpdate(
        id,
        { password_reset_token: token },
        { new: true },
        function (err, doc)
        {
          if (err)
          {
            // console.log(err);
            return res.status(500).json({ error: "NO user with such id" });
          }
        }
      );

      return res.status(200).send({ msg: "Email sent successfully" });
    } else
    {
      return res.status(401).json({ error: "Email not registered" });
    }
  } catch (err)
  {
    // console.log(err);
    return res.status(500).json({ error: "500 internal error" });
  }
};

exports.ResetPassword = async (req, res) =>
{
  const { token, password } = req.body;
  try
  {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_FOREGTPASS,
      async (err, user) =>
      {
        if (err)
        {
          return res.status(401).json({ error: "TOKEN EXPIERED" });
        }
        const { id } = user;
        const salt = await bcrypt.genSalt();
        const password_ = await bcrypt.hash(password, salt);
        UserModel.findByIdAndUpdate(
          id,
          { password_reset_token: "", password: password_ },
          { new: true },
          function (err, doc)
          {
            if (err)
            {
              // console.log(err);
              return res.status(500).json({ error: "NO user with such id" });
            } else
            {
              return res.status(200).json({ msg: "Password reset successfull" });
            }
          }
        );
      }
    );
  } catch (err)
  {
    // console.log(err);
    return res.status(500).json({ error: "500 internal error" });
  }
};
exports.AddNewProject = async (req, res) => {

  const { userid } = req;
  const { name, description, level, skills } = req.body;

  try {
    const newProject = Project({
      name,
      description,
      level,
      skills,
    });

  const resp = await newProject.save();
  console.log(resp);

  UserModel.findByIdAndUpdate(
    userid,
    { "$push": { "profile.projects_added" : name} },
    { new: true, "upsert": true },
    function (err, doc) {
      if (err) {
        console.log(err);
        res.status(500).json({ error: "NO user with such id" });
      }
    }
  );

    return res.status(200).json({success: "Project is Added"})
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "500 Internal Error" });
  }
}

exports.SendContactEmail = async (req, res) => {

  const { fullname, email, message } = req.body;

  try{

    const user = await UserModel.findOne({ email: email });
    if (user) {
      const id = user._id;

      const link = `${req.protocol}://${req.hostname}:3000/`;

      const usercontent = `<h3 style="text-align:center">Thanks for contacting us !</h3>
      
      <p>Dear ${user.firstname}, We have sent your message/feedback successfully.</p> 
      <p>We appreciate you contacting us .Thanks for showing much interest.</p>
      <p>Keep contacting for any queries/ feedback related to project-zone.</p>
      <hr/>
      <h3 style="text-align:center"><a href=${link}>Visit project-zone again !</a></h3>
      <hr/>
      
      Thanks again ! Have a great day!`;

      await sendEmail(
        email,
        "Thanks for getting in touch with project-zone ",
        usercontent
      );

      const admincontent = `<h3 style="text-align:center"> Hey Rohit ! You have got a contact message from project-zone !</h3>
      
      <p>${user.firstname} has contacted on project-zone. We have sent him a thank you mail. </p>
      <p>These are the ${user.firstname}'s contact details.</p>
      <hr/>
      <h3>Full Name: ${fullname}</h3>
      <hr/>
      <h3>Email: ${email}</h3>
      <hr/>
      <h3>Message : ${message}</h3>
      <hr/>

      `;

      await sendEmail(
        process.env.SENDGRID_VERIFIED_MAIL,
        "Got Contact from project-zone",
        admincontent
      );

      UserModel.findByIdAndUpdate(
        id,
        { "$push": { "messages_sent" : message} },
        { new: true, "upsert": true },
        function (err, doc) {
          if (err) {
            console.log(err);
            res.status(500).json({ error: "NO user with such id" });
          } 
        }
      );

      res.status(200).send({ success: "Message saved, Email sent" });
    } else {
      return res.status(401).json({ error: "Email not registered" });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "500 Internal Error" });
  }

}


