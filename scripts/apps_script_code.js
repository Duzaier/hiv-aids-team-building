function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(contents);
    var dateStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm");
    var ss = SpreadsheetApp.create("Danh Sach Tham Gia Team Building - " + dateStr);
    var sheet = ss.getActiveSheet();
    sheet.setName("Danh Sách");
    
    // 1. BANNER TITLE (Row 1)
    sheet.getRange("A1:I1").merge();
    var titleCell = sheet.getRange("A1");
    titleCell.setValue("CHIẾN DỊCH TEAM BUILDING HIV-AIDS 2026 - DANH SÁCH THAM GIA");
    titleCell.setFontFamily("Arial");
    titleCell.setFontSize(14);
    titleCell.setFontWeight("bold");
    titleCell.setFontColor("#ffffff");
    titleCell.setBackground("#dc2626");
    titleCell.setHorizontalAlignment("center");
    titleCell.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 42);
    
    // 2. SUBTITLE (Row 2)
    sheet.getRange("A2:I2").merge();
    var subCell = sheet.getRange("A2");
    subCell.setValue("Thời gian xuất dữ liệu: " + dateStr + " (Hệ thống Antigravity)");
    subCell.setFontFamily("Arial");
    subCell.setFontSize(10);
    subCell.setFontStyle("italic");
    subCell.setFontColor("#ffffff");
    subCell.setBackground("#991b1b");
    subCell.setHorizontalAlignment("center");
    subCell.setVerticalAlignment("middle");
    sheet.setRowHeight(2, 26);
    
    // Row 3 blank spacer
    sheet.setRowHeight(3, 12);
    
    // 3. TABLE HEADERS (Row 4)
    var headers = [
      "STT",
      "Họ và tên",
      "Mã số SV",
      "Email",
      "Số điện thoại",
      "Đội thi",
      "Vai trò",
      "Hình thức",
      "Thời gian ĐK"
    ];
    sheet.getRange(4, 1, 1, 9).setValues([headers]);
    var headerRange = sheet.getRange("A4:I4");
    headerRange.setFontFamily("Arial");
    headerRange.setFontSize(11);
    headerRange.setFontWeight("bold");
    headerRange.setFontColor("#ffffff");
    headerRange.setBackground("#0f172a");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(4, 34);
    
    // 4. DATA ROWS (Row 5+)
    var rows = data.rows || [];
    if (rows.length > 0 && (rows[0][0] === "STT" || rows[0][1] === "Họ và tên")) {
      rows.shift();
    }
    
    if (rows.length > 0) {
      sheet.getRange(5, 1, rows.length, 9).setValues(rows);
      var dataRange = sheet.getRange(5, 1, rows.length, 9);
      dataRange.setFontFamily("Arial");
      dataRange.setFontSize(10);
      dataRange.setVerticalAlignment("middle");
      
      sheet.getRange(5, 1, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(5, 3, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(5, 5, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(5, 7, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(5, 8, rows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(5, 9, rows.length, 1).setHorizontalAlignment("center");
      
      for (var i = 0; i < rows.length; i++) {
        var rowNum = 5 + i;
        sheet.setRowHeight(rowNum, 26);
        var r = sheet.getRange(rowNum, 1, 1, 9);
        if (i % 2 === 1) {
          r.setBackground("#f8fafc");
        } else {
          r.setBackground("#ffffff");
        }
      }
      
      sheet.getRange(4, 1, rows.length + 1, 9).setBorder(
        true, true, true, true, true, true,
        "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID
      );
    }
    
    sheet.setFrozenRows(4);
    for (var c = 1; c <= 9; c++) {
      sheet.autoResizeColumn(c);
      var w = sheet.getColumnWidth(c);
      sheet.setColumnWidth(c, Math.max(w + 24, 100));
    }
    
    var output = {
      success: true,
      url: ss.getUrl(),
      spreadsheetId: ss.getId()
    };
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errOutput = {
      success: false,
      error: err.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errOutput))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "active" }))
    .setMimeType(ContentService.MimeType.JSON);
}
