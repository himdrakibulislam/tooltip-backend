import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_API_KEY);
export default stripe; 