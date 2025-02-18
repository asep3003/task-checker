require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const creds = require("./spreadsheets-netsight.json");
const moment = require("moment");
const { sendMessageTest } = require("./bot_telegram");

const spreadsheetId = process.env.SPREADSHEETS_SHEET_ID;
const sheetTitle = process.env.SPREADSHEETS_SHEET_TITLE;

const serviceAccountAuth = new JWT({
  email: creds.client_email,
  key: creds.private_key.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const readSpreadsheets = async () => {
  try {
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo(); // Wajib memuat info dulu

    const sheet = doc.sheetsByTitle[sheetTitle];
    await sheet.loadHeaderRow(); // Memuat baris header secara eksplisit

    let rows = await sheet.getRows();

    const mappedData = rows.map((row) => {
      return {
        matkul: row._rawData[0] ? row._rawData[0] : "-",
        week: row._rawData[1] ? row._rawData[1] : "-",
        tugas: row._rawData[2] ? row._rawData[2] : "-",
        breakdown: row._rawData[3] ? row._rawData[3] : "-",
        deadline: row._rawData[6]
          ? moment(row._rawData[6], "DD-MM-YYYY HH:mm:ss").format("YYYY-MM-DD")
          : "-",
        progress: row._rawData[7] ? row._rawData[7] : "-",
        remark: row._rawData[8] ? row._rawData[8] : "-",
      };
    });

    // const filteredByDate = mappedData.filter((entry) => {
    //   const deadline = moment(entry.deadline, "YYYY-MM-DD");
    //   const today = moment("2025-02-24");

    //   const targetDates = [0, 1, 2, 3].map((day) =>
    //     moment(today).add(day, "day")
    //   );

    //   return targetDates.some((date) => deadline.isSame(date, "day"));
    // });

    const filteredByDate = mappedData.filter((entry) => {
      const deadline = moment(entry.deadline, "YYYY-MM-DD");
      // const today = moment("2025-02-24");
      const today = moment();
      const targetDates = [0, 1, 2, 3].map((day) =>
        moment(today).add(day, "day")
      );
      return targetDates.some((date) => deadline.isSame(date, "day"));
    });

    const groupedByDate = filteredByDate.reduce((acc, entry) => {
      const deadline = moment(entry.deadline, "YYYY-MM-DD").format(
        "YYYY-MM-DD"
      );
      if (!acc[deadline]) {
        acc[deadline] = [];
      }
      acc[deadline].push(entry);
      return acc;
    }, {});

    let message = `
${process.env.ENV === "test" && "🛑 Testing 🛑"}

Berikut ini adalah daftar tugas yang harus segera diselesaikan:

${Object.entries(groupedByDate)
  .map(
    ([deadline, entries]) =>
      `🗓️ ${deadline}:\n${entries
        .map(
          (entry) =>
            // `Matkul: ${entry.matkul}\nWeek: ${entry.week}\nTugas: ${entry.tugas}\nBreakdown: ${entry.breakdown}\nDeadline: ${entry.deadline}\nProgress: ${entry.progress}\nRemark: ${entry.remark}`
            `- ${entry.tugas} [${entry.week}][${entry.matkul}]`
        )
        .join("\n")}`
  )
  .join("\n\n")}
    `;

    try {
      sendMessageTest(message);
    } catch (error) {
      return console.log(error);
    }

    // console.log(message);

    // console.log(filteredByDate);
    // console.log(mappedData);
    return;
  } catch (error) {
    console.error("Error:", error);
  }
};

readSpreadsheets();
