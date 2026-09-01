// simulated EVC Plus / Zaad gateway. nothing real happens, see the readme.
// a valid somali mobile number plus the demo pin approves, anything else fails.
// a production build would call the hormuud waafi merchant api here.

// somali mobiles: optional +252 or 0, then 6x and 7 more digits (61..69 ...)
const SOMALI_MOBILE = /^(?:\+?252|0)?6\d{7,8}$/;

export function isValidSomaliMobile(phone) {
  return SOMALI_MOBILE.test(String(phone || "").replace(/[\s-]/g, ""));
}

export function simulateCharge({ phone, pin, amount, method = "evc" }) {
  const demoPin = process.env.EVC_DEMO_PIN || "1234";

  if (!isValidSomaliMobile(phone)) {
    return { approved: false, message: "Enter a valid Somali mobile number" };
  }
  if (String(pin) !== String(demoPin)) {
    return { approved: false, message: "Wrong PIN" };
  }
  if (!(Number(amount) > 0)) {
    return { approved: false, message: "Amount must be greater than 0" };
  }

  const ref = `${method.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  return { approved: true, reference: ref, message: "Payment approved" };
}

export default simulateCharge;
