import Twilio from 'twilio'

const account_sid = import.meta.env.REACT_APP_TWILIO_SID
const account_token = import.meta.env.REACT_APP_TWILIO_TOKEN

const client = new Twilio(account_sid, account_token);
 
export default client

 