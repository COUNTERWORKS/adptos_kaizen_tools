fn request() {
  const sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  const accessKey = PropertiesService.getScriptProperties().getProperty('ACCESS_KEY');
  const slackApiToken = PropertiesService.getScriptProperties().getProperty('SLACK_API_TOKEN');

  const payload =
    {
      "token": slackApiToken,
      "channel": "#pop_up_now",
      "text": "売り上げの取得を開始します。1分後に反映されます。\n https://docs.google.com/spreadsheets/d/1PhOzKxLoOUlY_JEP5hgS90B8ACbXBwS0NCwwQ8c8xqQ/edit?usp=sharing",
      "icon_url": "https://tsukunin.com/images/icon.png",
      "username": "TSUKUNINの分身"
    };
  

  const options =
   {
     "method" : "post",
     "payload" : payload
   };

  if (sheets.length > 1) {
    UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', options);
    sheets.forEach(sheet => {
      const buildingName = sheet.getName();
      const brandName = sheet.getRange(2, 2).getValue();
      const email = sheet.getRange(3, 2).getValue();
      const password = sheet.getRange(4, 2).getValue();
      UrlFetchApp.fetch('https://zslp8wuj46.execute-api.us-west-2.amazonaws.com/test', { 
        "method" : "post",
        "headers": { "x-api-key": accessKey },
        "payload" :JSON.stringify({ buildingName, brandName, email, password }),
        "muteHttpExceptions": true
      });
    });
  }
}

