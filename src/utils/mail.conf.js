import nodemailer from "nodemailer";
import { ApiError } from "./apiError.js";
const MAIL = nodemailer.createTransport({
    host: process.env.MAIL_HOST ,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user:process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    }
  });
export const allMail = async (to_email,subject = "Tooltip",content ="") => {
  try {
    const response = await MAIL.sendMail({
      from: process.env.MAIL_FROM_ADDRESS,
      to: to_email,
      subject: subject,
      html: `<!doctype html>
      <html lang="en">
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <title>${subject}</title>
          <style media="all" type="text/css">
              /* -------------------------------------
                GLOBAL RESETS
            ------------------------------------- */
      
              body {
                  font-family: Helvetica, sans-serif;
                  -webkit-font-smoothing: antialiased;
                  font-size: 16px;
                  line-height: 1.3;
                  -ms-text-size-adjust: 100%;
                  -webkit-text-size-adjust: 100%;
              }
      
              table {
                  border-collapse: separate;
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  width: 100%;
              }
      
              table td {
                  font-family: Helvetica, sans-serif;
                  font-size: 16px;
                  vertical-align: top;
              }
      
              /* -------------------------------------
                BODY & CONTAINER
            ------------------------------------- */
      
              body {
                  background-color: #f4f5f6;
                  margin: 0;
                  padding: 0;
              }
      
              .body {
                  background-color: #f4f5f6;
                  width: 100%;
              }
      
              .container {
                  margin: 0 auto !important;
                  max-width: 600px;
                  padding: 0;
                  padding-top: 24px;
                  width: 600px;
              }
      
              .content {
                  box-sizing: border-box;
                  display: block;
                  margin: 0 auto;
                  max-width: 600px;
                  padding: 0;
              }
      
              /* -------------------------------------
                HEADER, FOOTER, MAIN
            ------------------------------------- */
      
              .main {
                  background: #ffffff;
                  border: 1px solid #eaebed;
                  border-radius: 16px;
                  width: 100%;
              }
      
              .wrapper {
                  box-sizing: border-box;
                  padding: 24px;
              }
      
              .footer {
                  clear: both;
                  padding-top: 24px;
                  text-align: center;
                  width: 100%;
              }
      
              .footer td,
              .footer p,
              .footer span,
              .footer a {
                  color: #9a9ea6;
                  font-size: 16px;
                  text-align: center;
              }
      
              /* -------------------------------------
                TYPOGRAPHY
            ------------------------------------- */
      
              p {
                  font-family: Helvetica, sans-serif;
                  font-size: 16px;
                  font-weight: normal;
                  margin: 0;
                  margin-bottom: 16px;
              }
      
              a {
                  color: #0867ec;
                  text-decoration: underline;
              }
      
              /* -------------------------------------
                BUTTONS
            ------------------------------------- */
              
              .button-36 {
                  background-image: linear-gradient(92.88deg, #455EB5 9.16%, #5643CC 43.89%, #673FD7 64.72%);
                  border-radius: 8px;
                  border-style: none;
                  box-sizing: border-box;
                  color: #FFFFFF;
                  width: 100%;
                  cursor: pointer;
                  flex-shrink: 0;
                  font-family: "Inter UI", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
                  font-size: 16px;
                  font-weight: 500;
                  height: 4rem;
                  padding: 0 2.6rem;
                  text-align: center;
                  text-shadow: rgba(0, 0, 0, 0.25) 0 3px 8px;
                  transition: all .5s;
                  user-select: none;
                  -webkit-user-select: none;
                  touch-action: manipulation;
              }
      
              .button-36:hover {
                  box-shadow: rgba(80, 63, 205, 0.5) 0 1px 30px;
                  transition-duration: .1s;
              }
      
              @media (min-width: 768px) {
                  .button-36 {
                      padding: 0 2.6rem;
                  }
              }
      
              .btn>tbody>tr>td {
                  padding-bottom: 16px;
              }
      
              .btn table {
                  width: auto;
              }
      
              .btn table td {
                  background-color: #ffffff;
                  border-radius: 4px;
                  text-align: center;
              }
      
              .btn a {
                  background-color: #ffffff;
                  border: solid 2px #0867ec;
                  border-radius: 4px;
                  box-sizing: border-box;
                  color: #0867ec;
                  cursor: pointer;
                  display: inline-block;
                  font-size: 16px;
                  font-weight: bold;
                  margin: 0;
                  padding: 12px 24px;
                  text-decoration: none;
                  text-transform: capitalize;
              }
      
              .btn-primary table td {
                  background-color: #0867ec;
              }
      
              .btn-primary a {
                  background-color: #0867ec;
                  border-color: #0867ec;
                  color: #ffffff;
              }
      
              @media all {
                  .btn-primary table td:hover {
                      background-color: #ec0867 !important;
                  }
      
                  .btn-primary a:hover {
                      background-color: #ec0867 !important;
                      border-color: #ec0867 !important;
                  }
              }
      
              /* -------------------------------------
                OTHER STYLES THAT MIGHT BE USEFUL
            ------------------------------------- */
      
              .last {
                  margin-bottom: 0;
              }
      
              .first {
                  margin-top: 0;
              }
      
              .align-center {
                  text-align: center;
              }
      
              .align-right {
                  text-align: right;
              }
      
              .align-left {
                  text-align: left;
              }
      
              .text-link {
                  color: #0867ec !important;
                  text-decoration: underline !important;
              }
      
              .clear {
                  clear: both;
              }
      
              .mt0 {
                  margin-top: 0;
              }
      
              .mb0 {
                  margin-bottom: 0;
              }
      
              .preheader {
                  color: transparent;
                  display: none;
                  height: 0;
                  max-height: 0;
                  max-width: 0;
                  opacity: 0;
                  overflow: hidden;
                  mso-hide: all;
                  visibility: hidden;
                  width: 0;
              }
      
              .powered-by a {
                  text-decoration: none;
              }
      
              /* -------------------------------------
                RESPONSIVE AND MOBILE FRIENDLY STYLES
            ------------------------------------- */
      
              @media only screen and (max-width: 640px) {
      
                  .main p,
                  .main td,
                  .main span {
                      font-size: 16px !important;
                  }
      
                  .wrapper {
                      padding: 8px !important;
                  }
      
                  .content {
                      padding: 0 !important;
                  }
      
                  .container {
                      padding: 0 !important;
                      padding-top: 8px !important;
                      width: 100% !important;
                  }
      
                  .main {
                      border-left-width: 0 !important;
                      border-radius: 0 !important;
                      border-right-width: 0 !important;
                  }
      
                  .btn table {
                      max-width: 100% !important;
                      width: 100% !important;
                  }
      
                  .btn a {
                      font-size: 16px !important;
                      max-width: 100% !important;
                      width: 100% !important;
                  }
              }
      
              /* -------------------------------------
                PRESERVE THESE STYLES IN THE HEAD
            ------------------------------------- */
      
              @media all {
                  .ExternalClass {
                      width: 100%;
                  }
      
                  .ExternalClass,
                  .ExternalClass p,
                  .ExternalClass span,
                  .ExternalClass font,
                  .ExternalClass td,
                  .ExternalClass div {
                      line-height: 100%;
                  }
      
                  .apple-link a {
                      color: inherit !important;
                      font-family: inherit !important;
                      font-size: inherit !important;
                      font-weight: inherit !important;
                      line-height: inherit !important;
                      text-decoration: none !important;
                  }
      
                  #MessageViewBody a {
                      color: inherit;
                      text-decoration: none;
                      font-size: inherit;
                      font-family: inherit;
                      font-weight: inherit;
                      line-height: inherit;
                  }
              }
          </style>
      </head>
      
      <body>
          <div class="align-center" >
              <h3 style="background-color: black; border-radius: 10px;"><img width="200" height="100%"
                      src="https://res.cloudinary.com/dae6oihks/image/upload/v1711034350/uneh0g6sohk1gd2v4yyw.png" alt="">
              </h3>
           
          </div>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
              <tr>
                  <td>&nbsp;</td>
                  <td class="container">
                      <div class="content">
      
                          <!-- START CENTERED WHITE CONTAINER -->
                          <span class="preheader">This is preheader text. Some clients will show this text as a
                              preview.</span>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
      
                              <!-- START MAIN CONTENT AREA -->
                              <div style="margin: 10px;">
                                  ${content}
                              </div>
                              <!-- END MAIN CONTENT AREA -->
                          </table>
      
                          <!-- START FOOTER -->
                          <div class="footer">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                      <td class="content-block">
                                          <!-- <span class="apple-link">Company Inc, 7-11 Commercial Ct, Belfast BT1 2NB</span> -->
                                          <br> Don't like these emails? <a href="#">Unsubscribe</a>.
                                      </td>
                                  </tr>
                                  <tr>
                                      <td class="content-block powered-by">
                                          Powered by <a href="https://tooltip.one">tooltip.one</a>
                                      </td>
                                  </tr>
                              </table>
                          </div>
      
                          <!-- END FOOTER -->
      
                          <!-- END CENTERED WHITE CONTAINER -->
                      </div>
                  </td>
                  <td>&nbsp;</td>
              </tr>
          </table>
      </body>
      
      </html>`,
    });
  } catch (error) {
    throw new ApiError(403,"Error when sending email");
  }
}
export default MAIL;