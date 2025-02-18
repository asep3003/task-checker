const axios = require("axios");
require("dotenv").config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
const CHATIDTEST =
  process.env.ENV === "test"
    ? process.env.TELEGRAM_CHAT_ID_TEST
    : process.env.TELEGRAM_CHAT_ID;

class BotTelegram {
  // static async sendMessage(message) {
  //   try {
  //     const result = await axios.post(
  //       TELEGRAM_API_URL,
  //       { chat_id: CHATID, text: message, parse_mode: "HTML" },
  //       { timeout: 10000 }
  //     );

  //     return result;
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  // }

  static async sendMessageTest(message) {
    try {
      const result = await axios.post(
        TELEGRAM_API_URL,
        { chat_id: CHATIDTEST, text: message, parse_mode: "HTML" },
        { timeout: 10000 }
      );

      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = BotTelegram;

//     const msg = `
// Daily Report Apps Monitoring Sigmon Mobile Apps

// *${date}*
// Total Test = ${total_test} Test
// OK = ${ok_test} Test
// NOK = ${nok_test} Test
// Link Report : ${linkfile}
// `;
