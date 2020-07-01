// 1) To get started with this demo, first head to https://dashboard.stripe.com/account/apikeys
// and copy your "Test Publishable Key" (it looks like pk_test_abcdef) into the line below.
export const publishableKey = "pk_test_51GxPG7A1cJPtamf11TBpMhRKSPIJ3Xm0CtaCvkSvp6sDB5PQ3VQ9j443Yj5okM9NMcYjR4nD3AP2zmQ1YbkmfjuZ00hUEqMODh";

// 2) Next, optionally, to have this demo save your user's payment details, head to
// https://github.com/stripe/example-ios-backend , click "Deploy to Heroku", and follow
// the instructions (don't worry, it's free). Paste your Heroku URL below
// (it looks like https://blazing-sunrise-1234.herokuapp.com ).
const backendBaseURL = "https://us-central1-stripe-function.cloudfunctions.net/charge";
const localTestURL = "http://localhost:5001/stripe-function/us-central1/charge";
// 3) Optionally, to enable Apple Pay, follow the instructions at https://stripe.com/docs/apple-pay/apps
// to create an Apple Merchant ID. Paste it below (it looks like merchant.com.yourappname).
const appleMerchantID = "";

export class StripeService {

  constructor() {
    // if (-1 !== publishableKey.indexOf("pk_test")) {
    //   throw new Error("publishableKey must be changed from placeholder");
    // }
    // if (-1 !== backendBaseURL.indexOf("https://yours.herokuapp.com/")) {
    //   throw new Error("backendBaseURL must be changed from placeholder");
    // }
  }

  public async _postRequest(token: string, amount: number) {
    try {
      const result = await fetch(localTestURL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          amount,
          "name": "Test User", // user name 
          "customer": "" // customer id
        })
      });
      console.log(result);
      return result;
    } catch (e) {
      console.error("Purchase is failed!", e);
    }
  }
}