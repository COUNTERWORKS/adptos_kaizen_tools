function doPost(e) {
  const parameters = JSON.parse(e.postData.getDataAsString()); 

  const targetDate = parameters.targetDate; // 日付
  const brandName =parameters.brandName; // ブランド名
  const buildingName = parameters.buildingName; // 館名
  const sales = parameters.sales; // 売り上げ
  const salesWithoutTax = parameters.salesWithoutTax; // 売り上げ(税抜き)
  const cash = parameters.cash; // 現金
  const credit = parameters.credit; // クレジット
  const other = parameters.other; // その他
  const transactions =parameters.transactions; // 取引数
  const customers = parameters.customers; // 客数
  const pricePerCustomer = parameters.pricePerCustomer; // 客単価
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(buildingName);
  
  const lastRow = sheet.getLastRow();
  // stringにしないと勝手にdate形に変換されて厄介
  const date = sheet.getRange(lastRow, 1).setNumberFormat('@').getValue();

  if (date === targetDate) {
    sheet.getRange(lastRow, 2).setValue(brandName);
    sheet.getRange(lastRow, 3).setValue(sales);
    sheet.getRange(lastRow, 4).setValue(salesWithoutTax);
    sheet.getRange(lastRow, 5).setValue(cash);
    sheet.getRange(lastRow, 6).setValue(credit);
    sheet.getRange(lastRow, 7).setValue(other);
    sheet.getRange(lastRow, 8).setValue(transactions);
    sheet.getRange(lastRow, 9).setValue(customers);
    sheet.getRange(lastRow, 10).setValue(pricePerCustomer);
  } else {
    const nextRow = lastRow + 1;
    sheet.getRange(nextRow, 1).setNumberFormat('@').setValue(targetDate);
    sheet.getRange(nextRow, 2).setValue(brandName);
    sheet.getRange(nextRow, 3).setValue(sales);
    sheet.getRange(nextRow, 4).setValue(salesWithoutTax);
    sheet.getRange(nextRow, 5).setValue(cash);
    sheet.getRange(nextRow, 6).setValue(credit);
    sheet.getRange(nextRow, 7).setValue(other);
    sheet.getRange(nextRow, 8).setValue(transactions);
    sheet.getRange(nextRow, 9).setValue(customers);
    sheet.getRange(nextRow, 10).setValue(pricePerCustomer);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ meta: { status: "success" }})).setMimeType(ContentService.MimeType.JSON);
}

